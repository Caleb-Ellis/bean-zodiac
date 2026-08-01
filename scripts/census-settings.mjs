// Census the settings used across every facet and question in the corpus, so a
// rewrite pass can draw from the thin end instead of reproducing the average.
// Run: `node scripts/census-settings.mjs` (add --used or --unused to filter).
//
// SETTINGS below is the working taxonomy AND the candidate list: entries that
// score 0 are settings the corpus has never used, kept here deliberately as
// somewhere to reach for. Add a row whenever you invent a setting worth reusing.
import { readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const FIELDS = ["facetMost", "facetHigh", "facetMid", "facetLow", "facetLeast", "question"];

const SETTINGS = {
  // — domestic & social —
  kitchen: /kitchen|washing[- ]up|fridge/,
  "dinner table": /dinner table|at the table|dinner party/,
  "party / gathering": /\bparty\b|housewarming|barbecue/,
  wedding: /wedding|bride|groom|best man|reception/,
  funeral: /funeral|wake\b|grave|coffin|crematorium/,
  "pub / bar": /\bpub\b|\bbar\b|pint|landlord of/,
  "cafe / coffee": /caf[eé]|coffee shop|barista/,
  restaurant: /restaurant|waiter|the menu|bill comes/,
  "queue / counter": /queue|checkout|the till|front desk/,

  // — work & institutions —
  office: /office|meeting room|colleague|slide deck|inbox/,
  school: /school|classroom|teacher|playground|parents' evening/,
  hospital: /hospital|\bdoctor\b|clinic|\bward\b|\bnurse\b/,
  "council / bureaucracy": /council|town hall|form to fill|licence|permit/,
  police: /police|officer|courtroom|magistrate/,
  library: /librar/,
  "church / ritual": /church|chapel|temple|mosque|priest|congregation|vigil/,

  // — transit —
  train: /train|platform|carriage|railway/,
  bus: /\bbus\b|coach station/,
  car: /\bcar\b|driving|motorway|lay-by|petrol station/,
  airport: /airport|flight|departure gate|baggage/,
  "hotel / corridor": /hotel|hostel|corridor|lobby|waiting room/,

  // — outdoors —
  weather: /storm|downpour|blizzard|\bfog\b|gale|thunder/,
  mountain: /mountain|ridge|summit|trail|scramble/,
  forest: /forest|\bwood\b|\bwoods\b|coppice|beech|pine/,
  beach: /beach|shoreline|\btide\b|harbour|estuary/,
  "river / lake": /river|\blake\b|canal|reservoir|weir/,
  garden: /garden|allotment|greenhouse|hedge/,
  farm: /\bfarm\b|barn|livestock|lambs|tractor|paddock/,
  cave: /cave|cavern|pothole|quarry/,
  desert: /desert|dune|salt flat/,
  moor: /moor|heath|fen\b|marsh/,

  // — making, play, body —
  "sport / game": /\bmatch\b|\bpitch\b|\bteam\b|\brace\b|\bgym\b|swimming pool/,
  music: /\bband\b|\bgig\b|guitar|choir|busker|open mic/,
  "art / studio": /painting|gallery|sculpt|studio|canvas|kiln/,
  "workshop / shed": /workshop|\bshed\b|lathe|toolbox|workbench/,
  "baking / preserving": /baking|sourdough|preserves|brewing/,
  dance: /dance|dancing|ballroom|club night/,
  "market / stall": /market|stall|car boot|auction/,

  // — money & exchange —
  money: /money|cash|\bbill\b|\brent\b|\bloan\b|wages|debt|deposit/,
  inheritance: /inherit|will\b|estate|probate/,

  // — people & relationships —
  "child / parenting": /\bchild\b|\bkid\b|\bkids\b|\bbaby\b|\bson\b|\bdaughter\b/,
  "aging relative": /grandmother|grandfather|grandparent|care home|elderly/,
  stranger: /stranger|someone you don't know/,
  neighbour: /neighbour/,
  reunion: /reunion|old classmate|years since you'd seen/,

  // — the contemporary —
  "phone / online": /\bphone\b|\btext\b|message|group chat|posted|thread|algorithm/,

  // — the strange —
  "uncanny / fantastical": /appears out of|shouldn't be there|impossible|no one else can see/,
  fire: /bonfire|\bflames\b|the fire\b|burning/,
  "boat / sea": /\bboat\b|ferry|kayak|canoe|dinghy|sailing/,
  camping: /\bcamp\b|campsite|\btent\b/,
  festival: /festival|\bfair\b|carnival|parade/,
  night: /\bnight\b|midnight|small hours|dark outside/,

  // — candidates: mostly or entirely unspent. Reach here first. —
  laundrette: /laundrette|launderette|tumble dryer/,
  "swimming baths": /swimming baths|lido|changing room/,
  "ice rink": /ice rink|skating/,
  "barber / salon": /barber|hairdresser|salon/,
  dentist: /dentist|waiting chair/,
  "driving test": /driving test|examiner|learner/,
  "jury service": /jury|juror|verdict/,
  "food bank": /food bank|soup kitchen|shelter/,
  "blood donation": /blood don|transfusion/,
  "building site": /building site|scaffold|cement mixer/,
  "factory floor": /factory|production line|assembly line/,
  scrapyard: /scrapyard|breaker's yard|junkyard/,
  "storage unit": /storage unit|lock-up/,
  "charity shop": /charity shop|thrift/,
  "garden centre": /garden centre|nursery aisle/,
  "motorway services": /services on the|motorway services/,
  "sleeper train": /sleeper train|couchette|night ferry/,
  lighthouse: /lighthouse|foghorn/,
  "fishing / angling": /angling|fishing rod|riverbank with a rod/,
  beekeeping: /beehive|beekeep|apiary/,
  orchard: /orchard|windfalls|cider press/,
  "bird hide": /bird hide|birdwatch|binoculars/,
  "climbing wall": /climbing wall|bouldering|belay/,
  "rowing club": /rowing|regatta|oars/,
  "bowling / arcade": /bowling alley|arcade|karaoke/,
  "betting shop": /betting shop|bookmaker|slot machine/,
  "pawn shop": /pawn shop|pawnbroker/,
  cinema: /cinema|projection|back row of the/,
  "theatre backstage": /backstage|dressing room|stage door/,
  "tattoo studio": /tattoo/,
  observatory: /observatory|telescope|stargaz/,
  aquarium: /aquarium|\bzoo\b|enclosure/,
  "museum after hours": /museum/,
  "village fete": /fete|tombola|village hall/,
  "choir / rehearsal": /rehearsal|choir practice|band practice/,
  "chess club": /chess|draughts|domino/,
  "scout hut": /scout|cadet|youth club/,
  "power cut": /power cut|blackout|generator/,
  flood: /flood|burst bank|sandbag/,
  wildfire: /wildfire|firebreak|scorched hillside/,
  eclipse: /eclipse|meteor|aurora|comet/,
  "first snow": /first snow|frost on the/,
  "mountain rescue": /mountain rescue|lifeboat|search party/,
  "hot air balloon": /hot air balloon|glider|parachute/,
  "caving / potholing": /potholing|abseil/,
  "committee meeting": /committee|\bagm\b|minutes of the/,
  "pigeon loft": /pigeon loft|racing pigeon/,
  "roadside shrine": /shrine|memorial bench|roadside cross/,
  monastery: /monastery|retreat|silent order/,
  pilgrimage: /pilgrimage|camino|procession/,

  // — trades & making —
  blacksmith: /blacksmith|forge|anvil|foundry/,
  glassblowing: /glassblow|kiln room|molten glass/,
  tailor: /tailor|seamstress|alterations|sewing machine/,
  cobbler: /cobbler|shoe repair|resole/,
  watchmaker: /watchmaker|clockmaker|movement of a watch/,
  locksmith: /locksmith|lock cylinder|spare key cut/,
  butcher: /butcher|fishmonger|greengrocer/,
  brewery: /brewery|distillery|fermenting tank/,
  "bakery night shift": /night shift at the bak|proving room|four in the morning bak/,
  "printing press": /printing press|letterpress|typeset/,
  "sign writing": /sign writer|hand-painted sign|gold leaf/,

  // — work with a round —
  "postal round": /postal round|postie|delivery round|paper round/,
  "refuse collection": /bin lorry|refuse collect|street cleaner/,
  "ice cream van": /ice cream van|food truck|chip shop/,
  "milk round": /milk round|milkman|dairy float/,

  // — outdoor work & wardens —
  gamekeeper: /gamekeeper|ranger|park keeper|warden/,
  coastguard: /coastguard|harbourmaster|lock keeper/,
  lifeguard: /lifeguard|poolside whistle/,

  // — livestock & country events —
  "cattle auction": /cattle auction|livestock market|mart\b/,
  "sheepdog trial": /sheepdog trial|ploughing match|county show/,
  "dog show": /dog show|gun dog|obedience ring/,
  stable: /stable|stableyard|riding school|farrier/,

  // — water —
  "canal boat": /canal boat|narrowboat|towpath|lock gate/,
  "rock pools": /rock pool|mudflat|salt marsh|estuary walk/,
  "ice / frozen lake": /frozen lake|ice fishing|glacier|crevasse/,
  "open water": /open water swim|wild swim|cold water dip/,

  // — heights, depths, edges —
  quarry: /quarry face|disused quarry/,
  mine: /\bmine shaft\b|colliery|pit head/,
  tunnel: /tunnel|underpass|subway tunnel/,
  bridge: /bridge|viaduct|aqueduct/,
  "multi-storey": /multi-storey|car park roof|parking level/,
  "cable car": /cable car|chairlift|funicular|gondola lift/,
  "ski slope": /ski slope|piste|toboggan|sledging/,

  // — games & contests —
  "quiz night": /quiz night|pub quiz|bingo/,
  "snooker hall": /snooker|billiard|darts board|dartboard/,
  "boxing gym": /boxing gym|sparring|dojo|martial arts/,
  archery: /archery|shooting range|clay pigeon/,
  karting: /go-kart|karting|rally stage|pit lane/,
  "escape room": /escape room|scavenger hunt|geocach|orienteering/,
  "metal detecting": /metal detect|beachcomb|fossick/,

  // — learning & performance —
  "exam hall": /exam hall|invigilator|revision/,
  "evening class": /evening class|night class|adult education/,
  "life drawing": /life drawing|pottery class|cookery class/,
  "book club": /book club|writers' group|writing group/,
  panto: /pantomime|\bpanto\b|am dram|amateur dramatics/,
  circus: /circus|trapeze|big top|street performer/,
  "magic show": /magic show|card trick|sleight of hand/,
  "radio station": /radio station|podcast|phone-in|newsroom/,

  // — care & institutions —
  "care home": /care home|nursing home|day centre/,
  hospice: /hospice|palliative/,
  "night pharmacy": /pharmacy|prescription counter|out of hours/,
  "vet's surgery": /vet's|veterinary|animal hospital/,
  "lost property": /lost property|found box|claims desk/,

  // — weather & sky as event —
  drought: /drought|water butt|standpipe|hosepipe ban/,
  heatwave: /heatwave|record heat|too hot to sleep/,
  "high wind": /gale warning|wind took the|roof tiles came/,
  "night sky": /northern lights|milky way|shooting star/,
};

const texts = [];
const dir = resolve(root, "src/content/zodiacs");
for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(readFileSync(resolve(dir, file), "utf8"));
  for (const field of FIELDS) if (data[field]) texts.push(String(data[field]).toLowerCase());
}
const blob = texts.join("\n");

const rows = Object.entries(SETTINGS)
  .map(([name, re]) => [name, (blob.match(new RegExp(re.source, "g")) || []).length])
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const filter = process.argv[2];
const shown = filter === "--unused" ? rows.filter(([, n]) => n === 0)
  : filter === "--used" ? rows.filter(([, n]) => n > 0)
  : rows;

console.log(`${texts.length} fields across ${texts.length / FIELDS.length} entries\n`);
for (const [name, n] of shown) console.log(String(n).padStart(5), name);
console.log(`\nUnused: ${rows.filter(([, n]) => n === 0).length} of ${rows.length} settings`);
