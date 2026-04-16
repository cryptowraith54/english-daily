import { generateContent } from "./claude.js";
import { sendMessage } from "./telegram.js";
import { getUsedItems, saveIdioms } from "./history.js";

const dateISO = new Date().toISOString().split("T")[0];

async function main() {
  const used = getUsedItems();

  const prompt = `You are an English idiom/expression teacher for Koya, a Japanese man in his 20s who lived in LA for 4 years. He handles daily conversation (TOEIC ~600-750) and wants to sound native with American friends — gym, sports, food, drinks, drives, fashion, music.

Generate exactly 10 idioms/expressions for today's lesson. Output ONLY the Telegram message, nothing else.

**Category balance (must follow):**
- 3-4 general idioms (e.g., "I'm not gonna lie", "That makes sense", "No worries", "It is what it is", "Fair enough", "My bad", "Totally get it")
- 2 adverb nuance expressions — show the same sentence with different adverbs to illustrate nuance difference (e.g., "That's kind of crazy" vs "That's pretty crazy" vs "That's way crazy" — totally / actually / literally / kind of / barely / pretty / way / lowkey / a little bit)
- 2-3 phrasal verb idioms (e.g., "call it a night", "pull it off", "back out of", "come through", "give it a shot", "hang in there")
- 1-2 slang idioms (e.g., "That hits different", "no cap", "it's giving...", "I'm dead", "say less")

**Rules:**
- Example sentences MUST be realistic casual conversation — gym sessions, sports watch parties, late-night drives, bars/restaurants, fashion/sneaker drops, music discovery. NO textbook English.
- Japanese translation and brief explanation required for every idiom
- For adverb nuance items: show 2-3 versions of the same sentence with different adverbs, explain the temperature/intensity difference in Japanese
- Include expressions that sound natural and "fluent" — not necessarily slangy, just what a native friend would actually say
- Mix easy-but-underused expressions with more advanced ones

**Already used in the last 30 days (DO NOT repeat these):**
Idioms: ${used.idioms.length > 0 ? used.idioms.join(", ") : "none yet"}

**Output format (follow EXACTLY — this is Telegram HTML, use tags exactly as shown):**

☀️ Midday Idioms for Koya

━━━━━━━━━━━━━━━

1. <b>"Expression here"</b> (category label like "general idiom", "slang", "phrasal verb idiom", etc.)

<blockquote>"Example sentence in casual conversation"</blockquote>

Japanese translation / explanation

───────────────

2. <b>"Expression here"</b> (adverb nuance)

<blockquote>"Example sentence"</blockquote>

Japanese translation / explanation
Nuance comparison (for adverb items):
"That's kind of crazy" → ちょっとヤバい
"That's pretty crazy" → 結構ヤバい
"That's way crazy" → めちゃくちゃヤバい

───────────────

[continue to 10, with ─────────────── between each entry]

━━━━━━━━━━━━━━━
🎯 Quiz tonight at 10PM — stay ready!

CRITICAL FORMAT RULES:
- Use <b>text</b> for bold (NOT markdown **)
- Use <blockquote>"sentence"</blockquote> for example sentences
- Do NOT use any other HTML tags
- Japanese explanation and English tips are plain text (no → prefix, no emoji labels)
- Output ONLY the message above. No preamble.`;

  const message = await generateContent(prompt);
  await sendMessage(message);

  // Extract idiom list for history tracking
  const idiomList = extractIdioms(message);
  saveIdioms(dateISO, idiomList);

  console.log(`Sent ${idiomList.length} idioms for ${dateISO}`);
}

function extractIdioms(message: string): string[] {
  const matches = message.matchAll(/\d+\.\s+<b>"(.+?)"<\/b>/g);
  return [...matches].map((m) => m[1].toLowerCase().trim());
}

main().catch((err) => {
  console.error("Failed to generate idioms:", err);
  process.exit(1);
});
