import { isValidZodiacId, QualityIds } from "./zodiac";
import { STORE_NAME, STORE_VERSION } from "../store";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Downloads the persisted store blob verbatim as a JSON file. */
export function exportData(): void {
  const raw = localStorage.getItem(STORE_NAME) ?? "{}";
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `bean-zodiac-${todayLocal()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

type ImportResult = { ok: true } | { ok: false; error: string };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const QUALITY_IDS: Set<string> = new Set(Object.values(QualityIds));

/** An absent field passes; a present one must be an array of valid records. */
function arrayOfValid(
  value: unknown,
  isValid: (item: Record<string, unknown>) => boolean,
): boolean {
  if (value === undefined || value === null) return true;
  return Array.isArray(value) && value.every((i) => isRecord(i) && isValid(i));
}

/**
 * Validates a JSON dump and writes it into localStorage verbatim, so zustand's
 * migrate chain runs over it on the next rehydration. The checks are shallow but
 * cover every persisted collection: a malformed entry that reached the store
 * would only surface later, deep inside the Beanstalk render.
 */
export function importData(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  const notOurs = {
    ok: false as const,
    error: "That doesn't look like a Bean Zodiac export.",
  };

  if (!isRecord(parsed)) return notOurs;
  const state = parsed.state;
  if (!isRecord(state)) return notOurs;

  // migrate() only ever upgrades, so a newer file would be written through
  // untouched and could carry fields this build doesn't understand.
  const version = parsed.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 0)
    return notOurs;
  if (version > STORE_VERSION) {
    return {
      ok: false,
      error: "That export came from a newer version of Bean Zodiac.",
    };
  }

  const { claimed, fortuneHistory, metBeans, seasonSummaries } = state;

  if (claimed !== null && claimed !== undefined) {
    if (!isRecord(claimed)) return notOurs;
    if (typeof claimed.id !== "string" || !isValidZodiacId(claimed.id))
      return notOurs;
  }

  const historyOk = arrayOfValid(
    fortuneHistory,
    (e) =>
      typeof e.date === "string" &&
      DATE_RE.test(e.date) &&
      typeof e.zodiacId === "string" &&
      isValidZodiacId(e.zodiacId),
  );
  if (!historyOk) return notOurs;

  // metBeans is id → tier → true (a pre-v7 export still has the old
  // `{id, on}[]`, which the migration converts).
  if (metBeans !== undefined && metBeans !== null) {
    if (version < 7) {
      if (
        !arrayOfValid(
          metBeans,
          (m) => typeof m.id === "string" && isValidZodiacId(m.id),
        )
      )
        return notOurs;
    } else {
      if (!isRecord(metBeans)) return notOurs;
      const metOk = Object.entries(metBeans).every(
        ([id, tiers]) =>
          isValidZodiacId(id) &&
          isRecord(tiers) &&
          Object.keys(tiers).every((q) => QUALITY_IDS.has(q)),
      );
      if (!metOk) return notOurs;
    }
  }

  const summariesOk = arrayOfValid(
    seasonSummaries,
    (s) =>
      typeof s.seasonKey === "string" &&
      DATE_RE.test(s.seasonKey) &&
      Array.isArray(s.observations) &&
      s.observations.every((o: unknown) => typeof o === "string"),
  );
  if (!summariesOk) return notOurs;

  localStorage.setItem(STORE_NAME, text);
  return { ok: true };
}
