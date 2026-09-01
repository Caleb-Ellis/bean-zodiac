// Rating the trait/excess/inverse triple against the three axes it is supposed to be a
// collision of. A triple is authored, not derived, and nothing has ever checked that the
// bean, the flavour and the form are all doing work in it.
//
//   node scripts/trait-audit.mjs sheets --list          the 42 readings, and what's scored
//   node scripts/trait-audit.mjs sheets <flavour-form>  12 beans, one preparation → BEAN scores
//   node scripts/trait-audit.mjs sheets <bean>          that bean's 5×6 grid → FLAVOUR + FORM
//   node scripts/trait-audit.mjs report [--top=40]      coverage, the approved/draft gate, shortlist
//   node scripts/trait-audit.mjs pool                   collisions + shared roots across all 1080
//   node scripts/trait-audit.mjs pool check <word>      is this candidate free? (run before writing it)
//
// Why sheets are comparative. An absolute judgement on a single adjective is noise: every
// word can be argued into any cell. So every reading holds two axes fixed and varies the
// third, and the score comes from discrimination — a trait that would sit as happily on
// the bean two rows down is not anchored to its bean, whatever it reads like alone.
//
// No structural signal scores anything here, deliberately. Against the 21.9% base approved
// rate, "trait lifted verbatim from a parent's list" is 30% approved and "over-/self-
// excess" is 40% — both fire MORE on approved. They print as context columns on the
// sheets and stay out of the score.
import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = resolve(root, "src/content");
const LEDGER = resolve(CONTENT, "trait-audit.tsv");

const BEANS = ["adzuki", "black", "butter", "cannellini", "chickpea", "edamame", "fava", "green", "kidney", "mung", "navy", "pinto"];
const FLAVOURS = ["bitter", "sour", "spicy", "sweet", "umami"];
const FORMS = ["boiled", "dried", "fermented", "fried", "roasted", "smoked"];

const field = (src, key) => (src.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m")) || [, ""])[1].trim();
const list = (src, key) => {
  const raw = field(src, key);
  return raw.startsWith("[") ? raw.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean) : [];
};

const readAxis = (dir) =>
  Object.fromEntries(
    readdirSync(resolve(CONTENT, dir))
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const src = readFileSync(resolve(CONTENT, dir, f), "utf8");
        return [
          f.replace(/\.md$/, ""),
          { name: field(src, "name"), role: field(src, "role"), pos: list(src, "positiveTraits"), neg: list(src, "negativeTraits") },
        ];
      }),
  );

const bean = readAxis("beans");
const flavour = readAxis("flavours");
const form = readAxis("forms");

const zodiacs = new Map(
  readdirSync(resolve(CONTENT, "zodiacs"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const src = readFileSync(resolve(CONTENT, "zodiacs", f), "utf8");
      const z = {
        slug: field(src, "slug"),
        bean: field(src, "bean"),
        flavour: field(src, "flavour"),
        form: field(src, "form"),
        trait: field(src, "trait"),
        excess: field(src, "excess"),
        inverse: field(src, "inverse"),
        approved: Boolean(field(src, "lastUpdated")),
      };
      return [z.slug, z];
    }),
);

// Context columns only — never inputs to a score. See the header note.
const context = (z) => {
  const marks = [];
  const parents = { bean: bean[z.bean], flavour: flavour[z.flavour], form: form[z.form] };
  for (const [axis, p] of Object.entries(parents)) {
    if (p.pos.includes(z.trait)) marks.push(`trait verbatim from ${axis}`);
    if (p.neg.includes(z.excess)) marks.push(`excess verbatim from ${axis}`);
  }
  if (/^(un|in|im|dis|non|il|ir)[a-z]/.test(z.inverse) || /less$/.test(z.inverse)) marks.push("negation-shaped inverse");
  return marks.join("; ");
};

const axisLine = (label, a) => `  ${label.padEnd(11)} ${a.pos.join(", ")}   ·  shadow: ${a.neg.join(", ")}`;
const pad = (s, n) => String(s).padEnd(n);

const columnSheet = (fl, fo) => {
  const out = [];
  out.push(`# COLUMN READING — ${fl} × ${fo}   → scores the BEAN axis for 12 entries`, "");
  out.push("# The two axes below are constant down the whole sheet. Everything that separates");
  out.push("# these twelve traits has to be the bean. Cover the bean column and try to reassign");
  out.push("# each trait to its bean; a trait that swaps freely scores 1 or less.", "");
  out.push(axisLine(fl, flavour[fl]));
  out.push(axisLine(fo, form[fo]), "");
  for (const b of BEANS) {
    const z = zodiacs.get(`${fl}-${fo}-${b}`);
    out.push(`${pad(bean[b].name, 17)} ${pad(bean[b].role, 15)} ${z.approved ? "approved" : "draft   "}`);
    out.push(`  ${pad(z.trait, 16)} / ${pad(z.excess, 16)} / ${z.inverse}`);
    out.push(`    bean:  ${bean[b].pos.join(", ")}   ·  shadow: ${bean[b].neg.join(", ")}`);
    const c = context(z);
    if (c) out.push(`    note:  ${c}`);
    out.push("");
  }
  return out.join("\n");
};

const gridSheet = (b) => {
  const out = [];
  out.push(`# GRID READING — ${bean[b].name} (${bean[b].role})   → scores the FLAVOUR and FORM axes for 30 entries`, "");
  out.push("# The bean is constant across the whole grid, so nothing here can be scored on it.");
  out.push("# Read ACROSS a row (form varying, flavour fixed) for the form scores, and DOWN a");
  out.push("# column (flavour varying, form fixed) for the flavour scores. A row whose six traits");
  out.push("# all read the same means the form is doing no work: those six score low on form.", "");
  out.push(axisLine("bean", bean[b]), "");
  const w = 18;
  out.push("  " + pad("", 10) + FORMS.map((f) => pad(f, w)).join(""));
  for (const fl of FLAVOURS) {
    const row = FORMS.map((fo) => zodiacs.get(`${fl}-${fo}-${b}`));
    out.push("  " + pad(fl, 10) + row.map((z) => pad(z.trait + (z.approved ? "*" : ""), w)).join(""));
    out.push("  " + pad("", 10) + row.map((z) => pad("↑ " + z.excess, w)).join(""));
    out.push("  " + pad("", 10) + row.map((z) => pad("↓ " + z.inverse, w)).join(""));
    out.push("");
  }
  out.push("  * = approved entry", "");
  out.push("# Flavours");
  for (const fl of FLAVOURS) out.push(axisLine(fl, flavour[fl]));
  out.push("", "# Forms");
  for (const fo of FORMS) out.push(axisLine(fo, form[fo]));
  out.push("", "# Context marks (never scored)");
  for (const fl of FLAVOURS) {
    for (const fo of FORMS) {
      const z = zodiacs.get(`${fl}-${fo}-${b}`);
      const c = context(z);
      if (c) out.push(`  ${pad(z.slug, 26)} ${c}`);
    }
  }
  return out.join("\n");
};

const HEADER = "slug\tbean\tflavour\tform\ttrait\texcess\tinverse\tb\tf\tm\tmin\texc\tinv\tapproved\tnote";

const readLedger = () => {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("slug\t"))
    .map((l) => {
      const c = l.split("\t");
      return {
        slug: c[0], trait: c[4], excess: c[5], inverse: c[6],
        b: Number(c[7]), f: Number(c[8]), m: Number(c[9]), min: Number(c[10]),
        exc: c[11], inv: c[12], approved: c[13] === "y", note: c[14] || "",
      };
    });
};

const mean = (xs) => (xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : NaN);

const report = (top) => {
  const rows = readLedger();
  if (!rows.length) return console.log(`no ledger yet at ${LEDGER}\ncolumns: ${HEADER.replace(/\t/g, "  ")}`);

  const seen = new Set();
  const dupes = rows.filter((r) => (seen.has(r.slug) ? true : (seen.add(r.slug), false))).map((r) => r.slug);
  const missing = [...zodiacs.keys()].filter((s) => !seen.has(s));
  console.log(`COVERAGE  ${rows.length} rows · ${seen.size}/360 slugs${dupes.length ? ` · DUPES: ${dupes.join(", ")}` : ""}`);
  if (missing.length) console.log(`  ${missing.length} unscored${missing.length <= 12 ? `: ${missing.join(", ")}` : ""}`);

  const app = rows.filter((r) => r.approved);
  const dft = rows.filter((r) => !r.approved);
  console.log(`\nTHE GATE  approving an entry meant approving its triple, so these must separate.`);
  for (const [label, set] of [["approved", app], ["draft", dft]]) {
    if (!set.length) continue;
    console.log(
      `  ${pad(label, 9)} n=${pad(set.length, 4)} mean min ${mean(set.map((r) => r.min)).toFixed(2)}` +
        `   bean ${mean(set.map((r) => r.b)).toFixed(2)} · flavour ${mean(set.map((r) => r.f)).toFixed(2)} · form ${mean(set.map((r) => r.m)).toFixed(2)}` +
        `   exc ok ${((set.filter((r) => r.exc === "ok").length / set.length) * 100).toFixed(0)}% · inv ok ${((set.filter((r) => r.inv === "ok").length / set.length) * 100).toFixed(0)}%`,
    );
  }
  if (app.length && dft.length) {
    const delta = mean(app.map((r) => r.min)) - mean(dft.map((r) => r.min));
    console.log(
      `  Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}  ` +
        (delta > 0.25
          ? "→ the rubric is reading the axes. Ledger stands."
          : "→ it is reading taste, not the axes. THROW THE RUBRIC OUT — do not tune it."),
    );
  }

  const hist = [0, 1, 2, 3].map((n) => `${n}:${rows.filter((r) => r.min === n).length}`).join("  ");
  console.log(`\nMIN SCORE  ${hist}`);
  const weakest = { bean: 0, flavour: 0, form: 0 };
  for (const r of rows) {
    if (r.b === r.min) weakest.bean++;
    if (r.f === r.min) weakest.flavour++;
    if (r.m === r.min) weakest.form++;
  }
  console.log(`WEAK AXIS  bean ${weakest.bean} · flavour ${weakest.flavour} · form ${weakest.form}  (ties counted once each)`);

  const bad = rows
    .filter((r) => r.min <= 1 || r.exc !== "ok" || r.inv !== "ok")
    .sort((a, b2) => a.min - b2.min || a.b + a.f + a.m - (b2.b + b2.f + b2.m))
    .slice(0, top);
  console.log(`\nSHORTLIST  ${bad.length} shown\n`);
  for (const r of bad) {
    console.log(
      `  ${pad(r.slug, 26)} ${pad(r.trait + " / " + r.excess + " / " + r.inverse, 46)} ` +
        `b${r.b} f${r.f} m${r.m}  exc:${pad(r.exc, 5)} inv:${pad(r.inv, 5)} ${r.approved ? "APPROVED " : ""}${r.note}`,
    );
  }
};

// The 1080-word pool. Every trait, excess and inverse in the corpus is a distinct word —
// so a replacement has to be checked against all three fields of all 360 entries, not just
// the field it is going into. `check` is the pre-write lookup; the same invariant is
// enforced at build time in build-content.mjs, so a collision cannot reach the JSON.
//
// Adjacency is reported but never decided here. Morphology catches only the shallow half
// (steady/steadfast, resolute/resolved); near-synonyms across distant cells — staunch and
// firm, nurturing and tender — are a human judgement, and trait-neighbours.tsv is where
// that lives.
const buildPool = () => {
  const pool = new Map();
  for (const z of zodiacs.values()) {
    for (const field of ["trait", "excess", "inverse"]) {
      if (!pool.has(z[field])) pool.set(z[field], []);
      pool.get(z[field]).push(`${z.slug}:${field}`);
    }
  }
  return pool;
};

const root_ = (w) => w.toLowerCase().replace(/[^a-z]/g, "").replace(/(ness|ing|ed|al|ic|ive|ous|ful|less|ly|ist|ism)$/, "");

const poolCmd = (sub, word) => {
  const pool = buildPool();
  const slots = [...pool.values()].reduce((n, v) => n + v.length, 0);

  if (sub === "list") {
    for (const [w, holders] of [...pool].sort()) console.log(`${pad(w, 22)} ${holders.join(", ")}`);
    return;
  }

  if (sub === "check") {
    if (!word) return console.error("usage: trait-audit.mjs pool check <word>") || process.exit(2);
    const held = pool.get(word);
    if (held) console.log(`TAKEN     "${word}" — ${held.join(", ")}`);
    else console.log(`free      "${word}" is not in the pool`);
    const near = [...pool].filter(([w]) => w !== word && root_(w) === root_(word));
    for (const [w, holders] of near) console.log(`  ADJACENT "${w}" shares a root — ${holders.join(", ")}`);
    if (!near.length) console.log("  no morphological neighbour (near-synonyms are trait-neighbours.tsv's job, not this check's)");
    return;
  }

  const dupes = [...pool].filter(([, v]) => v.length > 1);
  console.log(`POOL  ${slots} slots · ${pool.size} distinct · ${dupes.length} collision${dupes.length === 1 ? "" : "s"}`);
  for (const [w, holders] of dupes) console.log(`  COLLISION "${w}" — ${holders.join(", ")}`);
  // Shared roots WITHIN one entry are the design — a trait and its inverse are supposed to
  // be the same idea inverted (careful/careless). Only a root shared ACROSS entries is a
  // finding, because that is two cells reaching for the same word.
  const roots = new Map();
  for (const [w, holders] of pool) {
    const r = root_(w);
    if (!roots.has(r)) roots.set(r, []);
    roots.get(r).push([w, holders]);
  }
  const shared = [...roots.values()].filter((v) => v.length > 1);
  const cross = shared.filter((v) => new Set(v.flatMap(([, h]) => h.map((x) => x.split(":")[0]))).size > 1);
  console.log(`\n${cross.length} shared roots ACROSS entries (reported, not scored — near-synonyms are trait-neighbours.tsv's job):`);
  for (const v of cross) console.log(`  ${v.map(([w, h]) => `${w} (${h.join(", ")})`).join("\n    ~  ")}`);
  console.log(`\n${shared.length - cross.length} more share a root within a single entry, which is the design.`);
};

const [, , cmd, arg, arg2] = process.argv;
const top = Number((process.argv.find((a) => a.startsWith("--top=")) || "--top=40").slice(6));

if (cmd === "sheets" && (arg === "--list" || !arg)) {
  console.log("COLUMN readings (12 beans each) — score the BEAN axis:");
  for (const fl of FLAVOURS) console.log("  " + FORMS.map((fo) => `${fl}-${fo}`).join("  "));
  console.log("\nGRID readings (30 cells each) — score the FLAVOUR and FORM axes:");
  console.log("  " + BEANS.join("  "));
  console.log("\n42 readings · 360 entries × 3 axis scores.");
} else if (cmd === "sheets" && BEANS.includes(arg)) {
  console.log(gridSheet(arg));
} else if (cmd === "sheets" && /^[a-z]+-[a-z]+$/.test(arg || "")) {
  const [fl, fo] = arg.split("-");
  if (!FLAVOURS.includes(fl) || !FORMS.includes(fo)) {
    console.error(`unknown preparation "${arg}" — expected <flavour>-<form>`);
    process.exit(2);
  }
  console.log(columnSheet(fl, fo));
} else if (cmd === "report") {
  report(top);
} else if (cmd === "pool") {
  poolCmd(arg, arg2);
} else {
  console.error(
    "usage: trait-audit.mjs <sheets [--list|<bean>|<flavour>-<form>] | report [--top=N] | pool [check <word>|list]>",
  );
  process.exit(2);
}
