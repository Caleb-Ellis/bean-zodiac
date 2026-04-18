import type { BeanId, FlavourId, FormId, ZodiacMetadata } from "./zodiac";

export type CompatibilityEntry = {
  score: number;
  label: string;
  description: string;
};

export const BEAN_COMPATIBILITY = {
  "adzuki-adzuki": {
    score: 1,
    label: "Carnival",
    description:
      "The celebration never ends, and neither does the reason to avoid what it's for.",
  },
  "adzuki-black": {
    score: -1,
    label: "Locked Out",
    description:
      "Adzuki arrives with streamers. Black doesn't answer the door.",
  },
  "adzuki-butter": {
    score: 0,
    label: "Comfortable Enough",
    description:
      "Neither disturbs the other. Neither needs anything from the other, either.",
  },
  "adzuki-cannellini": {
    score: 0,
    label: "Different Guest Lists",
    description: "Adzuki fills the space. Cannellini had already decided who belonged in it.",
  },
  "adzuki-chickpea": {
    score: 2,
    label: "Open House",
    description: "Warmth doubles, then doubles again.",
  },
  "adzuki-edamame": {
    score: 0,
    label: "Different Calendars",
    description: "Edamame is already done. Adzuki is still deciding whether this was worth celebrating.",
  },
  "adzuki-fava": {
    score: 0,
    label: "Passing Through",
    description: "Fava is already somewhere else. Adzuki is still marking the moment.",
  },
  "adzuki-green": {
    score: 1,
    label: "Good Start",
    description: "Green shows up first. Adzuki makes it a thing.",
  },
  "adzuki-kidney": {
    score: 1,
    label: "Marked",
    description:
      "Kidney fights for it. Adzuki celebrates that it was worth fighting for.",
  },
  "adzuki-mung": {
    score: 2,
    label: "Cherished",
    description: "Mung tends the space. Adzuki fills it with light.",
  },
  "adzuki-navy": {
    score: 0,
    label: "Different Reasons",
    description: "Navy is there out of duty. Adzuki needs it to feel like something more.",
  },
  "adzuki-pinto": {
    score: 1,
    label: "Colour and Light",
    description: "Pinto brings the story. Adzuki makes it an event.",
  },
  "black-black": {
    score: -1,
    label: "Closed Circuit",
    description: "Two walls facing each other. No one opens first.",
  },
  "black-butter": {
    score: 1,
    label: "Deep Rest",
    description: "Butter asks nothing. Black finally exhales.",
  },
  "black-cannellini": {
    score: 1,
    label: "Quiet Refinement",
    description: "Both deliberate. Both particular. A rare mutual respect.",
  },
  "black-chickpea": {
    score: 0,
    label: "Unreached",
    description: "Chickpea adapts to everyone. Black is not quite everyone.",
  },
  "black-edamame": {
    score: 1,
    label: "Parallel Lines",
    description: "Each works alone. They understand this about each other, and leave it at that.",
  },
  "black-fava": {
    score: 0,
    label: "Wary Distance",
    description:
      "Fava moves too fast for Black to trust. Black moves too slow for Fava to wait.",
  },
  "black-green": {
    score: 0,
    label: "Different Orbits",
    description: "Green burns bright and moves on. Black is still somewhere else, watching.",
  },
  "black-kidney": {
    score: 2,
    label: "Under the Surface",
    description:
      "Two beans who hold their shape under pressure. They recognise the architecture in each other.",
  },
  "black-mung": {
    score: 1,
    label: "Patient Earning",
    description: "Mung doesn't push. Black doesn't bolt. Trust builds slowly.",
  },
  "black-navy": {
    score: 2,
    label: "Bedrock",
    description:
      "Both principled. Both resilient. Both show up exactly as promised.",
  },
  "black-pinto": {
    score: -1,
    label: "Exposed",
    description: "Pinto needs to be witnessed. Black finds this exhausting.",
  },
  "butter-butter": {
    score: 0,
    label: "Still Waters",
    description: "Profound peace, or profound inertia. Genuinely hard to tell.",
  },
  "butter-cannellini": {
    score: 1,
    label: "Unhurried",
    description: "Neither rushes. The result is quietly excellent.",
  },
  "butter-chickpea": {
    score: 2,
    label: "Good Company",
    description: "Easy warmth, easy laughter. The most comfortable room to be in.",
  },
  "butter-edamame": {
    score: -1,
    label: "Different Speeds",
    description: "Edamame has already finished. Butter hasn't started yet.",
  },
  "butter-fava": {
    score: -1,
    label: "Stuck",
    description: "Fava pushes. Butter doesn't budge.",
  },
  "butter-green": {
    score: 0,
    label: "Missed Crossing",
    description: "Green is already past by the time Butter has considered moving.",
  },
  "butter-kidney": {
    score: 0,
    label: "Mismatched Urgency",
    description:
      "Kidney needs to act. Butter needs to rest. They talk past each other.",
  },
  "butter-mung": {
    score: 2,
    label: "The Softest Room",
    description:
      "Between them: warmth, gentleness, and nothing required of anyone.",
  },
  "butter-navy": {
    score: 0,
    label: "Same Room",
    description: "Navy works. Butter rests. Neither finds the other wanting.",
  },
  "butter-pinto": {
    score: 1,
    label: "Unread Audience",
    description: "Pinto performs. Butter receives it without flinching. Pinto finds this enough.",
  },
  "cannellini-cannellini": {
    score: -1,
    label: "Impossible Standard",
    description: "Each finds the other slightly lacking. Neither is wrong.",
  },
  "cannellini-chickpea": {
    score: -1,
    label: "Too Casual",
    description:
      "Chickpea adapts to everyone. Cannellini finds this undiscerning.",
  },
  "cannellini-edamame": {
    score: 1,
    label: "Precise by Nature",
    description:
      "Both efficient. Both particular. They understand what the other is doing.",
  },
  "cannellini-fava": {
    score: -2,
    label: "Irreconcilable",
    description:
      "Fava charges in. Cannellini had already decided this was a mistake.",
  },
  "cannellini-green": {
    score: -2,
    label: "Incompatible Standards",
    description:
      "Green is unfinished by definition. Cannellini cannot let that go.",
  },
  "cannellini-kidney": {
    score: 1,
    label: "Unlikely Depth",
    description:
      "Kidney's rawness surprises Cannellini. Cannellini's grace surprises Kidney.",
  },
  "cannellini-mung": {
    score: 0,
    label: "Careful Distance",
    description: "Both tend their spaces well. Neither quite makes room for the other.",
  },
  "cannellini-navy": {
    score: 1,
    label: "Shared Standard",
    description: "Both precise, both principled. A quiet, surprising solidarity.",
  },
  "cannellini-pinto": {
    score: 0,
    label: "Different Languages",
    description: "Pinto has a lot to say. Cannellini has already edited that out. Neither is wrong.",
  },
  "chickpea-chickpea": {
    score: 0,
    label: "Everywhere, Nowhere",
    description:
      "The party is wherever they are. The depth is wherever they aren't.",
  },
  "chickpea-edamame": {
    score: 2,
    label: "Everywhere at Once",
    description: "Chickpea opens the doors. Edamame gets things done.",
  },
  "chickpea-fava": {
    score: 0,
    label: "Neither Finishes",
    description: "Chickpea adapts to everything. Fava commits to nothing. A short acquaintance.",
  },
  "chickpea-green": {
    score: 1,
    label: "Full Room",
    description: "Energy, connection, and doors open in every direction.",
  },
  "chickpea-kidney": {
    score: -1,
    label: "Thin Loyalty",
    description: "Kidney commits completely. Chickpea is everyone's friend.",
  },
  "chickpea-mung": {
    score: 1,
    label: "Warmth Loop",
    description: "Both give easily. Neither counts the cost.",
  },
  "chickpea-navy": {
    score: -1,
    label: "No Anchor",
    description:
      "Navy wants someone planted. Chickpea is always on their way somewhere.",
  },
  "chickpea-pinto": {
    score: 2,
    label: "Big Night",
    description:
      "Expressive meets social. Everybody's talking. Nobody's leaving.",
  },
  "edamame-edamame": {
    score: 0,
    label: "Clean Efficiency",
    description: "Gets things done. Asks nothing. Offers nothing extra.",
  },
  "edamame-fava": {
    score: 0,
    label: "Mutual Indifference",
    description:
      "Fava acts on instinct. Edamame acts on logic. Neither is the other's type.",
  },
  "edamame-green": {
    score: 1,
    label: "Quick Work",
    description: "Green brings the energy. Edamame gives it direction.",
  },
  "edamame-kidney": {
    score: 0,
    label: "Parallel Work",
    description: "Edamame moves through. Kidney means it. The gap is quiet but real.",
  },
  "edamame-mung": {
    score: -1,
    label: "Unread",
    description: "Edamame processes. Mung tends. Edamame doesn't notice it needed tending.",
  },
  "edamame-navy": {
    score: 2,
    label: "Non-Negotiable",
    description:
      "Principled meets practical. Two beans who do exactly what they say.",
  },
  "edamame-pinto": {
    score: -2,
    label: "Fundamental Mismatch",
    description: "Pinto needs to be felt. Edamame finds this inefficient.",
  },
  "fava-fava": {
    score: -1,
    label: "Mutual Ruin",
    description: "Each eggs the other toward the next disaster.",
  },
  "fava-green": {
    score: 2,
    label: "No Brakes",
    description:
      "Bold meets restless. Together they go further than either intended.",
  },
  "fava-kidney": {
    score: 1,
    label: "Charge",
    description: "Kidney with purpose. Fava with abandon. Both are moving.",
  },
  "fava-mung": {
    score: 0,
    label: "Unsteady Ground",
    description: "Fava doesn't mean harm. Mung doesn't say so. Something is always slightly off.",
  },
  "fava-navy": {
    score: -1,
    label: "Head-On",
    description: "Fava acts before asking. Navy asks before acting. They never agree on when to go.",
  },
  "fava-pinto": {
    score: 1,
    label: "Scene",
    description: "Fava does it. Pinto tells everyone about it.",
  },
  "green-green": {
    score: 0,
    label: "Perpetual Motion",
    description: "Endless energy. Nothing gets finished.",
  },
  "green-kidney": {
    score: 1,
    label: "Different Clocks",
    description: "Kidney runs long and deep. Green runs fast and forward. Mutual admiration from a distance.",
  },
  "green-mung": {
    score: 0,
    label: "Different Rhythms",
    description: "Mung tends the conditions. Green has already done the growing and moved on.",
  },
  "green-navy": {
    score: -2,
    label: "Point of Conflict",
    description:
      "Green starts before it's ready. Navy doesn't start until it is.",
  },
  "green-pinto": {
    score: 1,
    label: "Making Things",
    description:
      "Both expressive, both enthusiastic. Whether it finishes is another matter.",
  },
  "kidney-kidney": {
    score: -1,
    label: "Overextension",
    description: "Two protectors with no one left to protect them.",
  },
  "kidney-mung": {
    score: 1,
    label: "Held",
    description: "Kidney protects everything. Mung tends to Kidney.",
  },
  "kidney-navy": {
    score: 2,
    label: "Unbreakable",
    description: "Loyalty meets loyalty. Both show up before they're asked.",
  },
  "kidney-pinto": {
    score: 1,
    label: "High Maintenance",
    description: "Both feel intensely. Neither is very good at receiving. It still means something.",
  },
  "mung-mung": {
    score: 1,
    label: "Sanctuary",
    description: "They restore each other without trying.",
  },
  "mung-navy": {
    score: 0,
    label: "Parallel Steadiness",
    description: "Navy holds the structure. Mung tends the people. They don't often meet.",
  },
  "mung-pinto": {
    score: 0,
    label: "Quiet Reception",
    description: "Mung receives what Pinto brings. Neither is sure what to do with it.",
  },
  "navy-navy": {
    score: 1,
    label: "Shared Ground",
    description: "Aligned on everything that matters.",
  },
  "navy-pinto": {
    score: -2,
    label: "Structural Opposition",
    description: "Navy edits everything out. Pinto puts everything in.",
  },
  "pinto-pinto": {
    score: -1,
    label: "Too Much Weather",
    description: "Every feeling becomes a shared event. Nobody's listening.",
  },
} satisfies Record<string, CompatibilityEntry>;

export const getBeanCompatibility = (
  a: BeanId,
  b: BeanId,
): CompatibilityEntry => {
  const key = [a, b].sort().join("-") as keyof typeof BEAN_COMPATIBILITY;
  return BEAN_COMPATIBILITY[key];
};

export const FLAVOUR_COMPATIBILITY = {
  "bitter-bitter": {
    score: -1,
    label: "Inedible",
    description: "Without relief, discernment becomes contempt.",
  },
  "bitter-sour": {
    score: 0,
    label: "Mutual Edge",
    description:
      "Two flavours that sharpen. Together they sharpen each other, and not much else.",
  },
  "bitter-spicy": {
    score: 0,
    label: "Controlled Burn",
    description:
      "Both demanding in different ways. They leave each other alone.",
  },
  "bitter-sweet": {
    score: 1,
    label: "The Classic",
    description:
      "Sweet opens what Bitter would close. Each makes the other legible.",
  },
  "bitter-umami": {
    score: 1,
    label: "Cultivated",
    description:
      "Both acquired tastes. Both reward patience. They understand what the other is doing.",
  },
  "sour-sour": {
    score: -1,
    label: "Astringent",
    description:
      "Honesty with no softness stops being honest and starts being cruel.",
  },
  "sour-spicy": {
    score: 1,
    label: "Cutting Edge",
    description: "Sharp meets bold. Together, nothing stays vague.",
  },
  "sour-sweet": {
    score: 1,
    label: "Balanced",
    description:
      "The most fundamental pairing. Each defines the other's edges.",
  },
  "sour-umami": {
    score: 1,
    label: "Clarified Depth",
    description: "Sour cuts through. Umami holds underneath.",
  },
  "spicy-spicy": {
    score: -1,
    label: "Overwhelming",
    description: "Both demand full attention. Neither can give it.",
  },
  "spicy-sweet": {
    score: 1,
    label: "Relief",
    description:
      "Sweet softens the heat. Spicy wakes up what was becoming too easy.",
  },
  "spicy-umami": {
    score: 0,
    label: "Wrong Moment",
    description:
      "Spicy wants now. Umami wants patience. They don't quite sync.",
  },
  "sweet-sweet": {
    score: -1,
    label: "Cloying",
    description: "Comfort without contrast becomes its own kind of numbness.",
  },
  "sweet-umami": {
    score: 1,
    label: "Warmth",
    description: "Both generous, both inviting. The most comfortable pairing.",
  },
  "umami-umami": {
    score: 0,
    label: "Depth Stall",
    description: "Rich and patient and going nowhere in particular.",
  },
} satisfies Record<string, CompatibilityEntry>;

export const getFlavourCompatibility = (
  a: FlavourId,
  b: FlavourId,
): CompatibilityEntry => {
  const key = [a, b].sort().join("-") as keyof typeof FLAVOUR_COMPATIBILITY;
  return FLAVOUR_COMPATIBILITY[key];
};

export const FORM_COMPATIBILITY = {
  "boiled-boiled": {
    score: 0,
    label: "Still Pot",
    description: "Sustaining and steady and very quiet.",
  },
  "boiled-dried": {
    score: -1,
    label: "Incompatible Needs",
    description: "Boiled softens through immersion. Dried rejects all of that.",
  },
  "boiled-fermented": {
    score: 1,
    label: "Slow Work",
    description:
      "Both patient. Both transformative from within. They understand each other's pace.",
  },
  "boiled-fried": {
    score: 0,
    label: "Different Heat",
    description:
      "One is gradual. One is immediate. No conflict, but no real meeting.",
  },
  "boiled-roasted": {
    score: 1,
    label: "Nourishing",
    description: "Both sustaining, both warm. They make each other better.",
  },
  "boiled-smoked": {
    score: 0,
    label: "Quiet Coexistence",
    description: "One is transparent. One is opaque. Neither pushes the other.",
  },
  "dried-dried": {
    score: 0,
    label: "Shared Silence",
    description: "Both austere. Both self-contained. They leave each other intact.",
  },
  "dried-fermented": {
    score: 1,
    label: "Inner Work",
    description:
      "Both transform without outside force. A rare mutual recognition.",
  },
  "dried-fried": {
    score: -1,
    label: "No Common Ground",
    description:
      "Dried has removed everything unnecessary. Fried adds heat to everything.",
  },
  "dried-roasted": {
    score: 0,
    label: "Distant Warmth",
    description: "Roasted reaches out. Dried doesn't refuse it, but doesn't move toward it either.",
  },
  "dried-smoked": {
    score: 0,
    label: "Parallel Solitudes",
    description:
      "Both withdrawn. Both self-contained. They pass without friction.",
  },
  "fermented-fermented": {
    score: 0,
    label: "Parallel Processing",
    description: "Two introverts working in the dark. May or may not surface.",
  },
  "fermented-fried": {
    score: -1,
    label: "Out of Phase",
    description:
      "Fermented works in silence over months. Fried resolves in seconds.",
  },
  "fermented-roasted": {
    score: 1,
    label: "Slow Warmth",
    description: "Roasted makes room. Fermented arrives, eventually.",
  },
  "fermented-smoked": {
    score: 1,
    label: "Understood",
    description:
      "Both work through concealment. They don't need to explain themselves to each other.",
  },
  "fried-fried": {
    score: -1,
    label: "Flash Point",
    description:
      "Neither can lower the temperature. Something eventually burns.",
  },
  "fried-roasted": {
    score: 1,
    label: "Radiant",
    description:
      "Fried's decisive heat meets Roasted's generous warmth. A loud, bright pairing.",
  },
  "fried-smoked": {
    score: 1,
    label: "The Spectacle",
    description: "Fried is immediate and vivid. Smoked gives it an afterimage.",
  },
  "roasted-roasted": {
    score: 0,
    label: "Warm Excess",
    description:
      "Good company, indefinitely extended. Comfort curdles into indulgence.",
  },
  "roasted-smoked": {
    score: 0,
    label: "Warm Haze",
    description:
      "Roasted's openness softens Smoked's inscrutability. Close to a connection, but not quite.",
  },
  "smoked-smoked": {
    score: -1,
    label: "Impenetrable",
    description: "Both obscure. Together, completely unreadable.",
  },
} satisfies Record<string, CompatibilityEntry>;

export const getFormCompatibility = (
  a: FormId,
  b: FormId,
): CompatibilityEntry => {
  const key = [a, b].sort().join("-") as keyof typeof FORM_COMPATIBILITY;
  return FORM_COMPATIBILITY[key];
};

export const TOTAL_COMPATIBILITY: Record<
  number,
  { label: string; description: string }
> = {
  4: {
    label: "Perfect Match",
    description:
      "Bean, flavour, and form all say the same thing. A once-in-a-cycle pairing.",
  },
  3: {
    label: "True Affinity",
    description:
      "Near-complete resonance. The small gap is the most interesting part.",
  },
  2: {
    label: "Strong Pull",
    description:
      "More aligns than doesn't. The friction here is the productive kind.",
  },
  1: {
    label: "Promising",
    description:
      "A real connection with room to grow. Worth meeting each other partway.",
  },
  0: {
    label: "Open Field",
    description:
      "Neither drawn together nor pushed apart. What happens here depends entirely on what you bring.",
  },
  "-1": {
    label: "Uphill",
    description: "More effort than ease. Not impossible — but not effortless.",
  },
  "-2": {
    label: "At Odds",
    description:
      "Genuine incompatibility across multiple dimensions. Possible with real work. Unlikely without it.",
  },
  "-3": {
    label: "Difficult",
    description:
      "Almost every dimension pulls against the others. Proceed with honest expectations.",
  },
  "-4": {
    label: "Contrary",
    description:
      "Bean, flavour, and form all conflict. The rarest and most challenging match.",
  },
};

export const getTotalCompatibility = (
  a: ZodiacMetadata,
  b: ZodiacMetadata,
): { score: number; label: string; description: string } => {
  const score =
    getBeanCompatibility(a.beanId, b.beanId).score +
    getFlavourCompatibility(a.flavourId, b.flavourId).score +
    getFormCompatibility(a.formId, b.formId).score;
  return { score, ...TOTAL_COMPATIBILITY[score] };
};
