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
    description: "The celebration never ends!",
  },
  "adzuki-black": {
    score: -1,
    label: "Locked Out",
    description:
      "One arrives with streamers, the other doesn't answer the door.",
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
    description:
      "One fills the space. The other had already decided who belonged in it.",
  },
  "adzuki-chickpea": {
    score: 2,
    label: "Open House",
    description: "Warmth doubles, then doubles again.",
  },
  "adzuki-edamame": {
    score: 0,
    label: "Different Calendars",
    description:
      "One is already done. The other is still deciding whether it was worth celebrating.",
  },
  "adzuki-fava": {
    score: 0,
    label: "Passing Through",
    description:
      "One is already somewhere else. The other is still marking the moment.",
  },
  "adzuki-green": {
    score: 1,
    label: "Good Start",
    description: "One shows up first. The other makes it a thing.",
  },
  "adzuki-kidney": {
    score: 1,
    label: "Marked",
    description:
      "One fights for it. The other celebrates that it was worth fighting for.",
  },
  "adzuki-mung": {
    score: 2,
    label: "Cherished",
    description: "One tends the space. The other fills it with light.",
  },
  "adzuki-navy": {
    score: 0,
    label: "Different Reasons",
    description:
      "One is there out of duty. The other needs it to feel like something more.",
  },
  "adzuki-pinto": {
    score: 1,
    label: "Colour and Light",
    description: "One brings the story. The other makes it an event.",
  },
  "black-black": {
    score: -1,
    label: "Closed Circuit",
    description: "Two walls facing each other. No one opens first.",
  },
  "black-butter": {
    score: 1,
    label: "Deep Rest",
    description: "One asks nothing. The other finally exhales.",
  },
  "black-cannellini": {
    score: 1,
    label: "Quiet Refinement",
    description: "Both deliberate. Both particular. A rare mutual respect.",
  },
  "black-chickpea": {
    score: 0,
    label: "Unreached",
    description: "One adapts to everyone. The other is not quite everyone.",
  },
  "black-edamame": {
    score: 1,
    label: "Parallel Lines",
    description:
      "Each works alone. They understand this about each other, and leave it at that.",
  },
  "black-fava": {
    score: 0,
    label: "Wary Distance",
    description:
      "One moves too fast to trust. The other moves too slow to wait.",
  },
  "black-green": {
    score: 0,
    label: "Different Orbits",
    description:
      "One burns bright and moves on. The other is still somewhere else, watching.",
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
    description:
      "One doesn't push. The other doesn't bolt. Trust builds slowly.",
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
    description: "One needs to be witnessed. The other finds this exhausting.",
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
    description:
      "Easy warmth, easy laughter. The most comfortable place to be in.",
  },
  "butter-edamame": {
    score: -1,
    label: "Different Speeds",
    description: "One has already finished. The other hasn't started yet.",
  },
  "butter-fava": {
    score: -1,
    label: "Stuck",
    description: "One pushes. The other doesn't budge.",
  },
  "butter-green": {
    score: 0,
    label: "Missed Crossing",
    description:
      "One is already past by the time the other has considered moving.",
  },
  "butter-kidney": {
    score: 0,
    label: "Mismatched Urgency",
    description:
      "One needs to act. The other needs to rest. They talk past each other.",
  },
  "butter-mung": {
    score: 2,
    label: "The Softest Place",
    description:
      "Between them: warmth, gentleness, and nothing required of anyone.",
  },
  "butter-navy": {
    score: 0,
    label: "Same Place",
    description: "One works. The other rests. Neither finds the other wanting.",
  },
  "butter-pinto": {
    score: 1,
    label: "Unread Audience",
    description:
      "One performs. The other receives it without flinching. That turns out to be enough.",
  },
  "cannellini-cannellini": {
    score: -1,
    label: "Impossible Standard",
    description: "Each finds the other slightly lacking. Neither is wrong.",
  },
  "cannellini-chickpea": {
    score: -1,
    label: "Too Casual",
    description: "One adapts to everyone. The other finds this undiscerning.",
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
      "One charges in. The other had already decided this was a mistake.",
  },
  "cannellini-green": {
    score: -2,
    label: "Incompatible Standards",
    description:
      "One is unfinished by definition. The other cannot let that go.",
  },
  "cannellini-kidney": {
    score: 1,
    label: "Unlikely Depth",
    description:
      "Each surprises the other — rawness on one side, grace on the other.",
  },
  "cannellini-mung": {
    score: 0,
    label: "Careful Distance",
    description:
      "Both tend their spaces well. Neither quite makes room for the other.",
  },
  "cannellini-navy": {
    score: 1,
    label: "Shared Standard",
    description:
      "Both precise, both principled. A quiet, surprising solidarity.",
  },
  "cannellini-pinto": {
    score: 0,
    label: "Different Languages",
    description:
      "One has a lot to say. The other has already edited that out. Neither is wrong.",
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
    description: "One opens the doors. The other gets things done.",
  },
  "chickpea-fava": {
    score: 0,
    label: "Neither Finishes",
    description:
      "One adapts to everything. The other commits to nothing. A short acquaintance.",
  },
  "chickpea-green": {
    score: 1,
    label: "Full Room",
    description: "Energy, connection, and doors open in every direction.",
  },
  "chickpea-kidney": {
    score: -1,
    label: "Thin Loyalty",
    description: "One commits completely. The other is everyone's friend.",
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
      "One wants someone planted. The other is always on their way somewhere.",
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
      "One acts on instinct. The other acts on logic. Neither is the other's type.",
  },
  "edamame-green": {
    score: 1,
    label: "Quick Work",
    description: "One brings the energy. The other gives it direction.",
  },
  "edamame-kidney": {
    score: 0,
    label: "Parallel Work",
    description:
      "One moves through. The other means it. The gap is quiet but real.",
  },
  "edamame-mung": {
    score: -1,
    label: "Unread",
    description:
      "One processes. The other tends. One of them doesn't notice it needed tending.",
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
    description: "One needs to be felt. The other finds this inefficient.",
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
    description: "One with purpose. One with abandon. Both are moving.",
  },
  "fava-mung": {
    score: 0,
    label: "Unsteady Ground",
    description:
      "One doesn't mean harm. The other doesn't say so. Something is always slightly off.",
  },
  "fava-navy": {
    score: -1,
    label: "Head-On",
    description:
      "One acts before asking. The other asks before acting. They never agree on when to go.",
  },
  "fava-pinto": {
    score: 1,
    label: "Scene",
    description: "One does it. The other tells everyone about it.",
  },
  "green-green": {
    score: 0,
    label: "Perpetual Motion",
    description: "Endless energy. Nothing gets finished.",
  },
  "green-kidney": {
    score: 1,
    label: "Different Clocks",
    description:
      "One runs long and deep. The other runs fast and forward. Mutual admiration from a distance.",
  },
  "green-mung": {
    score: 0,
    label: "Different Rhythms",
    description:
      "One tends the conditions. The other has already done the growing and moved on.",
  },
  "green-navy": {
    score: -2,
    label: "Point of Conflict",
    description:
      "One starts before it's ready. The other doesn't start until it is.",
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
    description: "One protects everything. The other tends to the protector.",
  },
  "kidney-navy": {
    score: 2,
    label: "Unbreakable",
    description: "Loyalty meets loyalty. Both show up before they're asked.",
  },
  "kidney-pinto": {
    score: 1,
    label: "High Maintenance",
    description:
      "Both feel intensely. Neither is very good at receiving. It still means something.",
  },
  "mung-mung": {
    score: 1,
    label: "Sanctuary",
    description: "They restore each other without trying.",
  },
  "mung-navy": {
    score: 0,
    label: "Parallel Steadiness",
    description:
      "One holds the structure. The other tends the people. They don't often meet.",
  },
  "mung-pinto": {
    score: 0,
    label: "Quiet Reception",
    description:
      "One receives what the other brings. Neither is sure what to do with it.",
  },
  "navy-navy": {
    score: 1,
    label: "Shared Ground",
    description: "Aligned on everything that matters.",
  },
  "navy-pinto": {
    score: -2,
    label: "Structural Opposition",
    description: "One edits everything out. The other puts everything in.",
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
    score: 1,
    label: "Controlled Burn",
    description:
      "Both demanding in different ways. The pressure is mutual and it works.",
  },
  "bitter-sweet": {
    score: 1,
    label: "The Classic",
    description:
      "One opens what the other would close. Each makes the other legible.",
  },
  "bitter-umami": {
    score: 0,
    label: "Parallel Lines",
    description:
      "Both acquired tastes. They get each other, but that's not always enough.",
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
    description: "One cuts through. The other holds underneath.",
  },
  "spicy-spicy": {
    score: -1,
    label: "Overwhelming",
    description: "Both demand full attention. Neither can give it.",
  },
  "spicy-sweet": {
    score: 0,
    label: "Cancelled Out",
    description: "One cools the heat before anything interesting happens.",
  },
  "spicy-umami": {
    score: 0,
    label: "Wrong Moment",
    description:
      "One wants now. The other wants patience. They don't quite sync.",
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
    score: -1,
    label: "Depth Stall",
    description: "So much patience there is nothing left to wait for.",
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
    description:
      "One softens through immersion. The other rejects all of that.",
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
    description:
      "Both austere. Both self-contained. They leave each other intact.",
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
      "One has removed everything unnecessary. The other adds heat to everything.",
  },
  "dried-roasted": {
    score: 0,
    label: "Distant Warmth",
    description:
      "One reaches out. The other doesn't refuse it, but doesn't move toward it either.",
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
      "One works in silence over months. The other resolves in seconds.",
  },
  "fermented-roasted": {
    score: 1,
    label: "Slow Warmth",
    description: "One makes room. The other arrives, eventually.",
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
    description: "Decisive heat meets generous warmth. A loud, bright pairing.",
  },
  "fried-smoked": {
    score: 1,
    label: "The Spectacle",
    description:
      "One is immediate and vivid. The other gives it an afterimage.",
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
      "One's openness softens the other's inscrutability. Close to a connection, but not quite.",
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
    label: "Bean Harmony",
    description:
      "Bean, flavour, and form all say the same thing. A once-in-a-cycle pairing.",
  },
  3: {
    label: "Full Flavour",
    description:
      "Near-complete resonance. The small gap is the most interesting part.",
  },
  2: {
    label: "Good Pairing",
    description:
      "More aligns than doesn't. The friction here is the productive kind.",
  },
  1: {
    label: "Worth a Taste",
    description:
      "A real connection with room to grow. Worth meeting each other partway.",
  },
  0: {
    label: "Plain Broth",
    description:
      "Neither drawn together nor pushed apart. What happens here depends entirely on what you bring.",
  },
  "-1": {
    label: "Needs Salt",
    description: "More effort than ease. Not impossible — but not effortless.",
  },
  "-2": {
    label: "Clashing Spices",
    description:
      "Genuine incompatibility across multiple dimensions. Possible with real work. Unlikely without it.",
  },
  "-3": {
    label: "Curdled",
    description:
      "Almost every dimension pulls against the others. Proceed with honest expectations.",
  },
  "-4": {
    label: "Spoiled Batch",
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
