/** Hand-curated enrichment — carries authority on quotes, emojis, power descriptions,
 * AND on `alignment` / `powerType`, since those are absent from wiki infoboxes.
 *
 * Every enrichment record should pass human QA before ship. The emit layer flags
 * `_needs_review: true` on any character whose enrichment is missing or contested.
 */
import type { Alignment, CanonVisibility, Difficulty, PowerType, Species, Status } from "../../lib/types";

export interface EnrichmentRecord {
  alignment: Alignment;
  powerType: PowerType[];
  quotes: string[];
  emojis: string[];
  powerDescription: string;
  /** Optional override — use when wiki's species field misleads (e.g. Shapesmith's body-host). */
  speciesOverride?: Species[];
  /** Optional override — use when TV canon has advanced past the wiki's last edit. */
  statusOverride?: Status;
  canonVisibility?: CanonVisibility;
  spoilerWarning?: string;
  /** Difficulty tier. Defaults at emit time from tier (Main → easy,
   *  Recurring → medium, Minor → hard) unless set here. */
  difficulty?: Difficulty;
}

export const ENRICHMENT: Record<string, EnrichmentRecord> = {
  "mark-grayson": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: [
      "You're gonna be fine.",
      "I'd have you, Dad.",
      "I'm not him.",
    ],
    emojis: ["💛", "💙", "🦸", "👊", "👨‍🎓", "💪"],
    powerDescription:
      "A hybrid teenager learning to pull his punches without flattening the block he landed on.",
  },
  "omni-man": {
    alignment: "Anti-hero",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: [
      "Think, Mark. THINK!",
      "What would you have, Mark? After five hundred years, what would you have left?",
      "I expected better from you.",
      "Where were you, Mark?",
    ],
    emojis: ["👨", "🥛", "💪", "🌍", "🩸", "😈"],
    powerDescription:
      "An off-world envoy whose mustache, civilian job, and arterial spray all point to the same answer.",
    statusOverride: "Deceased", // executed by the Viltrum Empire in S4
  },
  "debbie-grayson": {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: ["Oh, fiddlesticks.", "I'm fine. I'm going to be fine."],
    emojis: ["👩", "🏠", "☕", "💔", "🙋‍♀️", "🍷"],
    powerDescription: "No powers — a realtor, a wife, a mother, and the only adult in the room.",
  },
  "atom-eve": {
    alignment: "Hero",
    powerType: ["Flight", "Matter Manipulation", "Energy Projection"],
    quotes: [
      "I can rearrange matter. I can do almost anything.",
      "Mark... I thought I lost you.",
    ],
    emojis: ["💖", "💫", "🌸", "⚛️", "🛡️", "👩‍🎓"],
    powerDescription:
      "Reshapes inorganic matter on command — bright pink energy forged into armor, projectiles, or anything she imagines.",
    statusOverride: "Revived", // resurrected by The Immortal in S3 finale
  },
  "cecil-stedman": {
    alignment: "Anti-hero",
    powerType: ["Technology"],
    quotes: [
      "I do what needs to be done.",
      "You don't get it. You don't GET it.",
      "Thank you, Mark.",
    ],
    emojis: ["🧔‍♂️", "📡", "🚬", "🦾", "🏢", "🎯"],
    powerDescription:
      "No native powers — a pragmatist with teleport tech and a finger on every kill-switch.",
  },
  robot: {
    alignment: "Anti-hero",
    powerType: ["Technology", "Enhanced Intellect"],
    quotes: ["I have my reasons.", "This was always the plan."],
    emojis: ["🤖", "🧠", "💡", "🔬", "🧪", "🧍‍♂️"],
    powerDescription:
      "A brilliant consciousness steering a drone chassis by remote — quietly growing himself a new body in a tank.",
  },
  "rex-splode": {
    alignment: "Hero",
    powerType: ["Energy Projection"],
    quotes: ["Let's blow this joint.", "Someone's gotta save these idiots."],
    emojis: ["💥", "🎯", "🧨", "😏", "🪙", "💣"],
    powerDescription:
      "Charges solid objects with volatile energy by touch — anything from a coin to a bullet becomes a bomb.",
  },
  "dupli-kate": {
    alignment: "Hero",
    powerType: ["Shapeshifting"],
    quotes: ["There's more where that came from."],
    emojis: ["👥", "♾️", "⚔️", "👯‍♀️", "🔁", "🧬"],
    powerDescription:
      "Conjures a small army of identical fighters out of thin air — every one of them swings like her.",
  },
  "monster-girl": {
    alignment: "Hero",
    powerType: ["Shapeshifting", "Super Strength", "Regeneration"],
    quotes: ["Every time I change, I get younger.", "How old do I look to you now?"],
    emojis: ["👧", "👹", "💢", "💪", "⌛", "💚"],
    powerDescription:
      "Transforms into a hulking brute with a nasty price — every change rewinds her body's clock.",
  },
  bulletproof: {
    alignment: "Hero",
    powerType: ["Flight", "Durability", "Energy Projection"],
    quotes: ["I got this.", "Guardians don't quit."],
    emojis: ["🛡️", "🔫", "✈️", "😎", "🧔🏾", "⚡"],
    powerDescription:
      "Untouchable skin plus a custom flight rig — a walking wall with a good-guy smile.",
  },
  "the-immortal": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability", "Regeneration"],
    quotes: [],
    emojis: ["⏳", "🕰️", "🗿", "💀", "🪦", "🔄"],
    powerDescription:
      "Cannot stay dead — regenerates from anything and carries a few centuries of combat muscle memory with him.",
    statusOverride: "Revived", // died and came back in S1; the name is the whole trick
  },
  "allen-the-alien": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: [
      "I'm a grown man and I'm about to die on the moon.",
      "Yeah, I fight Viltrumites for a living.",
    ],
    emojis: ["👽", "🟢", "💪", "🚀", "🥊", "❤️"],
    powerDescription:
      "Designed to be the strongest being in his galaxy — then assigned to pick fights with an empire.",
  },
  "battle-beast": {
    alignment: "Anti-hero",
    powerType: ["Super Strength", "Durability"],
    quotes: [
      "I was promised this world offered worthy opponents.",
      "You are weak. Find me a stronger foe.",
    ],
    emojis: ["🐯", "⚔️", "🩸", "😤", "🏟️", "👑"],
    powerDescription:
      "A feline warrior-king hunting a worthy death, carrying an axe nobody else can lift.",
  },
  "oliver-grayson": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: ["I want to help people."],
    emojis: ["👶", "⚡", "👨‍👦", "🚀", "💥", "😤"],
    powerDescription:
      "A fast-aging hybrid child with half-Viltrumite strength and a simpler moral code than his brother.",
  },
  anissa: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: ["You will submit. One way or another."],
    emojis: ["👩", "🟣", "👊", "🌌", "🚀", "💢"],
    powerDescription:
      "An empire operative with standing orders to break in one wayward Earth-raised hero.",
  },
  conquest: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: ["Finally. A proper fight."],
    emojis: ["🧔", "⚔️", "🟣", "😈", "🥊", "💥"],
    powerDescription:
      "An ancient warrior who fights not to win but to finally feel resistance.",
  },
  thragg: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: ["The empire is all that matters."],
    emojis: ["👑", "🟣", "💪", "🌌", "⚔️", "😠"],
    powerDescription:
      "The Grand Regent — bred to be the perfect soldier, stronger than any of his kin.",
    statusOverride: "Alive", // Prime S4-safe; comic death is Deep-Cut-only spoiler territory
  },
  thaedus: {
    alignment: "Anti-hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: ["We will not let the empire win."],
    emojis: ["🧙", "🪐", "⚔️", "🛡️", "🧓", "🌌"],
    powerDescription:
      "Ancient leader of a planetary coalition dedicated to ending empire rule.",
  },
  kregg: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: ["You have no idea what is coming for you."],
    emojis: ["🧔", "🟣", "😈", "🌌", "💥", "🩸"],
    powerDescription: "A high-ranking empire enforcer with a particularly smug monologue game.",
  },
  lucan: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: ["You are making this harder than it has to be."],
    emojis: ["🟣", "🥷", "⚔️", "💪", "🌌", "😤"],
    powerDescription:
      "Empire enforcer dispatched in a squad — brutal, patient, hard to keep down.",
  },
  vidor: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: [],
    emojis: ["🟣", "🧔", "⚔️", "💢", "🌌", "🥊"],
    powerDescription:
      "Another enforcer boot on the ground — the empire never sends just one.",
  },
  shapesmith: {
    alignment: "Hero",
    powerType: ["Shapeshifting"],
    quotes: ["I'm... not actually from around here."],
    emojis: ["🟢", "🪐", "🧬", "😅", "👨‍🚀", "🫠"],
    powerDescription:
      "A displaced alien wearing a borrowed human face — can reshape his body into anything he can picture.",
    speciesOverride: ["Martian"],
    statusOverride: "Alive", // wiki's page is about Rus Livingston the body host (who died); Shapesmith lives
  },
  "angstrom-levy": {
    alignment: "Villain",
    powerType: ["Technology", "Enhanced Intellect"],
    quotes: [
      "I've seen every version of you. Every one.",
      "Do you know what you've taken from me?",
    ],
    emojis: ["🧑‍🔬", "🌀", "🪞", "🧠", "😤", "🕳️"],
    powerDescription:
      "Rips open doors into alternate dimensions and borrows the minds of his parallel selves.",
  },
  "damien-darkblood": {
    alignment: "Neutral",
    powerType: ["Shadow Magic"],
    quotes: ["I am a detective. From Hell.", "Your father. He did it."],
    emojis: ["😈", "🕵️", "🔥", "🧥", "👁️", "🩸"],
    powerDescription:
      "A pint-sized infernal detective with horns and an unshakeable instinct for the truth.",
  },
  "donald-ferguson": {
    alignment: "Neutral",
    powerType: ["Technology"],
    quotes: ["The Director knows what he's doing."],
    emojis: ["🧑🏾", "🕶️", "🦾", "🏢", "💼", "🔁"],
    powerDescription:
      "The Director's loyal right hand, reconstructed more than once and uneasy about the fact.",
  },

  /* ────────── Phase B — Recurring tier ────────── */

  "darkwing-ii": {
    alignment: "Anti-hero",
    powerType: ["Shadow Magic", "Technology"],
    quotes: ["The cowl's mine now."],
    emojis: ["🦇", "🌑", "🥷", "🌃", "🔦", "🥀"],
    powerDescription:
      "Successor to a dead vigilante — commands a private shadow dimension and fights with gadget-laden fists.",
  },
  titan: {
    alignment: "Anti-hero",
    powerType: ["Super Strength", "Durability"],
    quotes: ["I'm just trying to protect my family."],
    emojis: ["🪨", "💎", "👨‍👧", "😤", "💪", "🏢"],
    powerDescription:
      "A crystalline-skinned former enforcer trying to go legit for his daughter — with mixed results.",
  },
  "mauler-twins": {
    alignment: "Villain",
    powerType: ["Super Strength", "Enhanced Intellect", "Technology"],
    quotes: ["I'm the original. YOU'RE the clone."],
    emojis: ["👥", "🧬", "🧠", "🟦", "🔁", "🔬"],
    powerDescription:
      "Brilliant blue-skinned scientist brothers who cannot agree on which one is the original.",
  },
  powerplex: {
    alignment: "Villain",
    powerType: ["Energy Projection"],
    quotes: ["You took everything from me."],
    emojis: ["⚡", "😭", "💢", "🔋", "🌩️", "🧑"],
    powerDescription:
      "Soaks up kinetic energy on contact and spits it back as blasts — grief-driven, not money-driven.",
  },
  "machine-head": {
    alignment: "Villain",
    powerType: ["Enhanced Intellect", "Technology"],
    quotes: ["Every city has a boss. This one is mine."],
    emojis: ["🤖", "🧠", "🏙️", "💼", "🔩", "💰"],
    powerDescription:
      "A cybernetic crime boss with a literal processor replacing his skull — every city racket on retainer.",
  },
  isotope: {
    alignment: "Villain",
    powerType: ["Technology"],
    quotes: [],
    emojis: ["📍", "🌀", "🧑‍🔬", "💫", "🔀", "🟢"],
    powerDescription:
      "A pocket teleporter — darts across the battlefield before a fist lands, hard to pin down.",
  },
  "black-samson": {
    alignment: "Hero",
    powerType: ["Super Strength", "Durability"],
    quotes: [
      "I've been doing this longer than you've been alive.",
    ],
    emojis: ["💪", "🧔🏾", "⚡", "🦸🏾", "👊", "🛡️"],
    powerDescription:
      "A veteran in a power-suit, alternating between glorious comebacks and painful reminders of his age.",
  },
  "shrinking-rae": {
    alignment: "Hero",
    powerType: ["Shapeshifting"],
    quotes: [],
    emojis: ["🐜", "👩", "📏", "🔬", "🌀", "🫥"],
    powerDescription:
      "Drops to insect-size and back again — small target, precise reach, much bigger punch than expected.",
  },
  "red-rush": {
    alignment: "Hero",
    powerType: ["Super Speed"],
    quotes: ["Time moves differently for me."],
    emojis: ["🏃", "🔴", "⚡", "⏱️", "🇷🇺", "💨"],
    powerDescription:
      "Moves so fast time looks frozen to him — lives a dozen lives inside a single conversation.",
    statusOverride: "Deceased",
  },
  "war-woman": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: ["For the Globe."],
    emojis: ["⚔️", "👩", "🛡️", "⚡", "🦸‍♀️", "🪽"],
    powerDescription:
      "Winged-armor warrior with a mystical mace — Earth's answer to a certain Amazonian.",
    statusOverride: "Deceased",
  },
  "martian-man": {
    alignment: "Villain",
    powerType: ["Shapeshifting"],
    quotes: [],
    emojis: ["🟢", "👽", "🪐", "🧬", "😠", "🎭"],
    powerDescription:
      "A hostile body-snatcher from the fourth planet — the malevolent mirror of a green shapeshifter.",
    speciesOverride: ["Martian"],
  },
  "art-rosenbaum": {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: ["Keeps a spare suit in the back. Just in case."],
    emojis: ["🧵", "🧔", "🏠", "☕", "🎨", "🛠️"],
    powerDescription:
      "No powers — the Graysons' tailor, confidant, and go-to man for a custom cape.",
  },
  "william-clockwell": {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: ["Dude. That was AMAZING."],
    emojis: ["🧑", "🎧", "🏳️‍🌈", "🎮", "😎", "📱"],
    powerDescription:
      "No powers — Mark's best friend since high school, long-term roommate, and emotional barometer.",
  },
  "amber-bennett": {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: ["You keep lying to me, Mark."],
    emojis: ["👩‍🎓", "💔", "📚", "☕", "🌸", "✊"],
    powerDescription:
      "No powers — Mark's college girlfriend turned frustrated activist ex-girlfriend.",
  },
  "rick-sheridan": {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: [],
    emojis: ["🧑", "📖", "😔", "🏠", "🦾", "🧬"],
    powerDescription:
      "No powers — William's boyfriend, caught between the normal world and a mad scientist's lab.",
  },
  "da-sinclair": {
    alignment: "Villain",
    powerType: ["Enhanced Intellect", "Technology"],
    quotes: ["Their sacrifice will change the world."],
    emojis: ["🧑‍🔬", "🧠", "🦾", "🧟", "🎓", "🔬"],
    powerDescription:
      "An Upstate student engineering undead soldiers from his classmates — bioethics optional.",
  },
  aquarus: {
    alignment: "Hero",
    powerType: ["Super Strength", "Durability"],
    quotes: [],
    emojis: ["🔱", "👑", "🌊", "🐟", "🏛️", "⚓"],
    powerDescription:
      "Monarch of a sunken kingdom — aquatic warrior, trident-wielder, surprisingly mortal.",
    speciesOverride: ["Unknown-Alien"],
  },
  dinosaurus: {
    alignment: "Anti-hero",
    powerType: ["Super Strength", "Durability", "Enhanced Intellect"],
    quotes: ["I do terrible things for the greater good."],
    emojis: ["🦖", "🧠", "🔬", "💥", "🌍", "⚖️"],
    powerDescription:
      "A super-genius trapped inside a city-leveling prehistoric monster — bad temper, worse planning.",
  },
  "kid-thor": {
    alignment: "Hero",
    powerType: ["Flight", "Energy Projection"],
    quotes: [],
    emojis: ["⚡", "🔨", "👦", "🧔", "💥", "🦾"],
    powerDescription:
      "A hammer-wielding hero channeling thunder and the confidence of youth.",
  },
  fightmaster: {
    alignment: "Villain",
    powerType: ["Super Strength"],
    quotes: [],
    emojis: ["🥋", "⚔️", "🥊", "👨", "🎯", "💢"],
    powerDescription:
      "Perfect technique in every martial art — no powers, all practice, all danger.",
  },
  embrace: {
    alignment: "Villain",
    powerType: ["Super Strength", "Shapeshifting"],
    quotes: [],
    emojis: ["🤗", "😬", "🕸️", "👥", "🩸", "🫂"],
    powerDescription: "Absorbs living matter into her body — every hug is a prison.",
  },
  "tether-tyrant": {
    alignment: "Villain",
    powerType: ["Energy Projection"],
    quotes: [],
    emojis: ["🧵", "⛓️", "🧲", "🪢", "⚔️", "👹"],
    powerDescription:
      "Projects invisible psychic cords that leash and drag opponents wherever he wants them.",
  },
  furnace: {
    alignment: "Villain",
    powerType: ["Energy Projection", "Durability"],
    quotes: [],
    emojis: ["🔥", "🧯", "🥵", "🌋", "👹", "🔴"],
    powerDescription:
      "A walking blast-oven of a man — radiant heat, molten fists, melts anything close.",
  },
  magnattack: {
    alignment: "Villain",
    powerType: ["Energy Projection"],
    quotes: [],
    emojis: ["🧲", "⚡", "🔩", "🦾", "💢", "👨"],
    powerDescription:
      "Generates and hurls massive magnetic fields — pulls buildings apart with a gesture.",
  },
  "doc-seismic": {
    alignment: "Villain",
    powerType: ["Energy Projection"],
    quotes: ["NATURE WILL HAVE ITS REVENGE!"],
    emojis: ["🌋", "🦵", "💥", "🌎", "🤡", "🩹"],
    powerDescription:
      "Eco-terrorist in earthquake-powered boots — shakes the planet to remind us who's renting it.",
  },

  /* ────────── Phase C — Minor tier (comic deep cuts) ────────── */

  "terra-grayson": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: [],
    emojis: ["👧", "💛", "🪐", "🦸", "👊", "💫"],
    powerDescription:
      "Inherits the family Viltrumite toolkit — and the family expectations that come with it.",
    speciesOverride: ["Half-Viltrumite", "Human"],
  },
  "markus-murphy": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: [],
    emojis: ["👦", "🌌", "⚡", "🦸", "💪", "🌀"],
    powerDescription: "Another future-generation hybrid carrying the family legacy forward.",
    speciesOverride: ["Half-Viltrumite", "Human"],
  },
  brit: {
    alignment: "Hero",
    powerType: ["Durability", "Super Strength"],
    quotes: [],
    emojis: ["🇬🇧", "🧔", "🛡️", "☕", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🪖"],
    powerDescription: "Unaging, invulnerable superhero soldier — he cannot be killed, cannot be stopped.",
  },
  "captain-cosmic": {
    alignment: "Hero",
    powerType: ["Flight", "Energy Projection", "Matter Manipulation"],
    quotes: [],
    emojis: ["🚀", "🌌", "⚡", "👨‍🚀", "💫", "🛡️"],
    powerDescription: "Wields a galactic staff that conjures constructs of pure energy across deep space.",
    speciesOverride: ["Unknown-Alien"],
  },
  "bi-plane": {
    alignment: "Hero",
    powerType: ["Technology"],
    quotes: [],
    emojis: ["✈️", "🎩", "🪂", "🕰️", "🎖️", "💨"],
    powerDescription: "A vintage-era aviator hero — no powers, just a twin-wing prop and a stiff upper lip.",
  },
  "best-tiger": {
    alignment: "Hero",
    powerType: ["Technology"],
    quotes: [],
    emojis: ["🎯", "🏹", "🐅", "🧔", "🎌", "💢"],
    powerDescription: "The world's greatest marksman — can hit anything, anywhere, with anything.",
  },
  "april-howsam": {
    alignment: "Neutral",
    powerType: ["Technology"],
    quotes: [],
    emojis: ["👩", "🏢", "💼", "📋", "🦾", "🤖"],
    powerDescription: "Robot's handler at the GDA — steady hand, few questions, quiet competence.",
  },
  "ann-stevens": {
    alignment: "Hero",
    powerType: ["Flight", "Super Strength", "Durability"],
    quotes: [],
    emojis: ["👩", "⚔️", "🛡️", "🪽", "🦸‍♀️", "🌹"],
    powerDescription: "The original War Woman's civilian identity — quiet days, loud nights.",
    statusOverride: "Deceased",
  },
  "lord-argall": {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: [],
    emojis: ["👑", "🟣", "🪐", "⚔️", "🧓", "🌌"],
    powerDescription:
      "The ancient Viltrumite emperor — the founder of the empire Thragg inherited by killing him.",
    speciesOverride: ["Viltrumite"],
    statusOverride: "Deceased",
  },
  thula: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: [],
    emojis: ["👩", "🟣", "💪", "🌌", "⚔️", "🩸"],
    powerDescription: "High-ranking empire operative — every fight is an audition for advancement.",
    speciesOverride: ["Viltrumite"],
  },
  aquaria: {
    alignment: "Hero",
    powerType: ["Super Strength", "Durability"],
    quotes: [],
    emojis: ["👸", "🌊", "🔱", "🐚", "💍", "🏛️"],
    powerDescription: "Heir to the undersea throne — aquatic royalty with a warrior's lineage.",
    speciesOverride: ["Unknown-Alien"],
  },
  andressa: {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: [],
    emojis: ["👩", "🪐", "👶", "🧡", "🌍", "💔"],
    powerDescription: "A Thraxan mother who raised a half-Viltrumite child on a fast-dying world.",
    speciesOverride: ["Thraxan"],
  },
  kursk: {
    alignment: "Villain",
    powerType: ["Flight", "Super Strength", "Super Speed", "Durability"],
    quotes: [],
    emojis: ["🧔", "🟣", "⚔️", "🌌", "💥", "😠"],
    powerDescription: "Empire enforcer — a disposable thug by design, dangerous by practice.",
    speciesOverride: ["Viltrumite"],
  },
  elephant: {
    alignment: "Hero",
    powerType: ["Super Strength", "Durability"],
    quotes: [],
    emojis: ["🐘", "💪", "🦶", "🎺", "🛡️", "💥"],
    powerDescription: "A silent, massive, pachyderm-themed bruiser — heavy hitter, heavier steps.",
  },
  "big-brain": {
    alignment: "Villain",
    powerType: ["Enhanced Intellect", "Energy Projection"],
    quotes: [],
    emojis: ["🧠", "👓", "💭", "⚡", "🧪", "👨‍🔬"],
    powerDescription: "Psychic with an exposed, oversized cranium — reads minds, bends wills.",
  },
  bolt: {
    alignment: "Villain",
    powerType: ["Super Speed"],
    quotes: [],
    emojis: ["⚡", "🏃", "💨", "🔴", "💥", "⏱️"],
    powerDescription: "A speedster mercenary — in before you blink, gone before you react.",
  },
  "brain-boy": {
    alignment: "Villain",
    powerType: ["Enhanced Intellect"],
    quotes: [],
    emojis: ["👦", "🧠", "📚", "💡", "😏", "🧩"],
    powerDescription: "Child genius with the coldest pragmatism in the room.",
  },
  chronodile: {
    alignment: "Villain",
    powerType: ["Enhanced Intellect", "Super Strength"],
    quotes: [],
    emojis: ["🐊", "⏰", "🕰️", "🦖", "🌀", "😤"],
    powerDescription: "Time-warping reptilian villain — part of an unserious but effective rogues list.",
  },
  gravitator: {
    alignment: "Villain",
    powerType: ["Energy Projection"],
    quotes: [],
    emojis: ["🪐", "⬇️", "🌌", "💢", "🧲", "🧑"],
    powerDescription: "Bends local gravity — can pin a hero or an entire building with a gesture.",
  },
  "green-ghost": {
    alignment: "Villain",
    powerType: ["Shapeshifting"],
    quotes: [],
    emojis: ["👻", "💚", "🌫️", "🫥", "🔮", "😈"],
    powerDescription: "An intangible rogue — phases through walls, fists, and most plans to catch her.",
  },
  gridlock: {
    alignment: "Villain",
    powerType: ["Technology"],
    quotes: [],
    emojis: ["🚗", "🚦", "🛑", "🧑", "🪢", "🔗"],
    powerDescription: "Seizes entire city street grids with hijacked traffic tech — metropolitan life ground to a siege.",
  },
  iguana: {
    alignment: "Villain",
    powerType: ["Super Strength", "Durability"],
    quotes: [],
    emojis: ["🦎", "🟢", "🧔", "💪", "🩸", "😤"],
    powerDescription: "Lizard-themed brute — scales, claws, a bad attitude with a worse haircut.",
  },
  kaboomerang: {
    alignment: "Villain",
    powerType: ["Technology"],
    quotes: [],
    emojis: ["🪃", "💥", "🎯", "🇦🇺", "💣", "😎"],
    powerDescription: "Throws weaponized boomerangs that detonate on contact — always come back.",
  },
  killcannon: {
    alignment: "Villain",
    powerType: ["Technology", "Energy Projection"],
    quotes: [],
    emojis: ["🔫", "💥", "🧨", "😤", "🎯", "🪖"],
    powerDescription: "Forearm-mounted heavy artillery — walks up, fires, walks away.",
  },
  kinetic: {
    alignment: "Villain",
    powerType: ["Energy Projection"],
    quotes: [],
    emojis: ["💫", "🏃", "⚡", "💥", "🟡", "🔵"],
    powerDescription: "Builds up raw motion in his body like a flywheel — every step charges the next strike.",
  },
  "king-lizard": {
    alignment: "Villain",
    powerType: ["Super Strength", "Durability"],
    quotes: [],
    emojis: ["🦖", "👑", "🐉", "💚", "🏰", "😤"],
    powerDescription: "Self-crowned monarch of a scaly underworld — loud, armored, territorial.",
  },
  "komodo-dragon": {
    alignment: "Villain",
    powerType: ["Super Strength", "Durability"],
    quotes: [],
    emojis: ["🦎", "🐉", "🦷", "💚", "💢", "☠️"],
    powerDescription: "Reptilian brute with a venomous bite and a grudge against nothing in particular.",
  },
  magmaniac: {
    alignment: "Villain",
    powerType: ["Energy Projection", "Durability"],
    quotes: [],
    emojis: ["🌋", "🔥", "🥵", "🧡", "💥", "😤"],
    powerDescription: "Half-man half-lava — a walking hazard that leaves a trail of melted pavement.",
  },
  mastermind: {
    alignment: "Villain",
    powerType: ["Enhanced Intellect"],
    quotes: [],
    emojis: ["🧠", "🎭", "🤵", "♟️", "😏", "🎩"],
    powerDescription: "Orchestrator — never in the fight, always in the plan.",
  },
  "adam-wilkins": {
    alignment: "Civilian",
    powerType: ["None"],
    quotes: [],
    emojis: ["👨", "👶", "🏠", "💼", "🧓", "❤️"],
    powerDescription: "Eve's adoptive father — the unlikely parent who raised a subatomic goddess.",
  },
};
