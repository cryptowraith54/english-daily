import { generateContent } from "./claude.js";
import { sendMessage } from "./telegram.js";
import { getUsedItems, saveWords } from "./history.js";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tokyo",
});

const dateISO = new Date().toISOString().split("T")[0];

async function main() {
  const used = getUsedItems();

  const prompt = `You are an English vocabulary teacher for Koya, a Japanese man in his 20s who lived in LA for 4 years. He can handle daily conversation (TOEIC ~600-750) and wants to sound native when hanging out with American friends — gym, sports, food, drinks, drives, fashion, music.

Generate exactly 10 vocabulary words for today's lesson. Output ONLY the Telegram message, nothing else.

**Category balance (must follow):**
- 2-3 general vocabulary (e.g., disgusting, awkward, exhausted, relieved, sketchy, legit)
- 2 high-frequency simple words (e.g., totally, honestly, barely, literally, decent, rough, solid — words he knows but underuses or has vague nuance on)
- 2-3 phrasal verbs (e.g., pull off, mess with, figure out, work out, bail on, call out — show how preposition changes meaning)
- 1-2 adjective + preposition collocations (e.g., obsessed with, addicted to, tired of, done with, into something)
- 1-2 slang (e.g., lowkey, vibe, flex, mid, goated, fire)

**Rules:**
- Example sentences MUST be realistic casual conversation — gym, sports watch parties, late-night drives, bar/restaurant, fashion drops, music. NO textbook English.
- Japanese translation and brief explanation required for every word
- For phrasal verbs: show how changing the preposition changes meaning (e.g., "work out" vs "work through")
- For adverbs/simple words: show nuance by comparing with a similar word (e.g., "lowkey" → swap with "totally" changes the vibe)
- For collocations: note the correct preposition and a common mistake or comparison
- Include some words that make the speaker sound "fluent" — not flashy, just natural (e.g., ditch, stoked, spot-on, pull off, a whole thing)

**Already used in the last 30 days (DO NOT repeat these):**
Words: ${used.words.length > 0 ? used.words.join(", ") : "none yet"}

**Output format (follow EXACTLY):**

🌅 Good morning Koya! Today's Words

📅 ${today}

━━━━━━━━━━━━━━━

1. **word** (part of speech)
   "Example sentence in casual conversation"
   → Japanese translation / explanation
   🔑 Tips: Nuance tip or comparison (if applicable)

───────────────

2. **word** (part of speech)
   "Example sentence"
   → Japanese translation / explanation

───────────────

[continue to 10, with ─────────────── between each entry]

━━━━━━━━━━━━━━━
💪 See you at noon for idioms!

IMPORTANT: Output ONLY the message above. No preamble, no explanation outside the format.`;

  const message = await generateContent(prompt);
  await sendMessage(message);

  // Extract word list for history tracking
  const wordList = extractWords(message);
  saveWords(dateISO, wordList);

  console.log(`Sent ${wordList.length} words for ${dateISO}`);
}

function extractWords(message: string): string[] {
  const matches = message.matchAll(/\d+\.\s+\*\*(.+?)\*\*/g);
  return [...matches].map((m) => m[1].toLowerCase().trim());
}

main().catch((err) => {
  console.error("Failed to generate words:", err);
  process.exit(1);
});
