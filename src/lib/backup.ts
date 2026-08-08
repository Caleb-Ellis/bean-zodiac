import { isValidZodiacId } from "./zodiac";

// Must match the `name` given to zustand's persist middleware in src/store/index.ts.
export const STORE_KEY = "bean-zodiac";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Downloads the persisted store blob verbatim as a JSON file. */
export function exportData(): void {
  const raw = localStorage.getItem(STORE_KEY) ?? "{}";
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `bean-zodiac-${todayLocal()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

type ImportResult = { ok: true } | { ok: false; error: string };

/**
 * Validates a JSON dump and writes it into localStorage verbatim, so zustand's
 * migrate chain runs over it on the next rehydration.
 */
export function importData(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  const notOurs = { ok: false as const, error: "That doesn't look like a Bean Zodiac export." };

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return notOurs;
  const state = (parsed as { state?: unknown }).state;
  if (typeof state !== "object" || state === null || Array.isArray(state)) return notOurs;

  const claimed = (state as { claimed?: unknown }).claimed;
  if (claimed !== null && claimed !== undefined) {
    if (typeof claimed !== "object" || Array.isArray(claimed)) return notOurs;
    const id = (claimed as { id?: unknown }).id;
    if (typeof id !== "string" || !isValidZodiacId(id)) return notOurs;
  }

  localStorage.setItem(STORE_KEY, text);
  return { ok: true };
}
