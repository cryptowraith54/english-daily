import { generateContent } from "./claude.js";
import { sendMessage } from "./telegram.js";
import { getUsedItems, saveWords } from "./history.js";
import { loadUser, getUserCredentials } from "./user.js";

const user = loadUser();
const { botToken, chatId } = getUserCredentials(user);

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tokyo",
});

const dateISO = new Date().toISOString().split("T")[0];

async function main() {
  const used = getUsedItems(user.name.toLowerCase());

  const langLabel =
    user.explanationLanguage === "chinese-simplified"
      ? "Simplified Chinese (简体中文)"
      : user.explanationLanguage === "japanese"
        ? "Japanese"
        : "English";

  const exampleBlock = user.translateExamples
    ? `<blockquote>"Example sentence in casual conversation"
Translation of the example sentence in ${
        user.explanationLanguage === "chinese-simplified"
          ? "Simplified Chinese"
          : user.explanationLanguage === "japanese"
            ? "Japanese"
            : "English"
      }</blockquote>`
    : `<blockquote>"Example sentence in casual conversation"</blockquote>`;

  const prompt = `You are an English vocabulary teacher for ${user.name}.

**Student profile:** ${user.profile}

**Interests (use these for example sentences):** ${user.interests}

**Context hints for examples:** ${user.contextHint}

**English level:** ${user.level}
${user.levelDescription}

**Explanation language:** ${langLabel} — ALL translations and explanations MUST be written in ${langLabel}. Keep them natural and clear for the student.

Generate exactly 10 vocabulary words for today's lesson. Output ONLY the Telegram message, nothing else.

**Category balance (must follow):**
${user.wordsBalance}

**Rules:**
- Example sentences MUST be realistic casual conversation matching the student's interests and context hints above. NO textbook English.
- Translation in ${langLabel} + brief explanation in ${langLabel} required for every word
- For phrasal verbs: show how changing the preposition changes meaning
- For adverbs/simple words: show nuance by comparing with a similar word
- For collocations: note the correct preposition and common comparison/mistake
- Match the vocabulary difficulty to the student's level — for beginner-elementary students, use very common daily words, avoid niche slang
- For beginner-elementary students, focus on words they hear often but use incorrectly (e.g. prepositions, simple phrasal verbs)

**Already used in the last 30 days (DO NOT repeat these):**
Words: ${used.words.length > 0 ? used.words.join(", ") : "none yet"}

**Output format (follow EXACTLY — this is Telegram HTML, use tags exactly as shown):**

${user.greetingMorning}

📅 ${today}

━━━━━━━━━━━━━━━

1. <b>word</b> (part of speech / category label like "phrasal verb", "adj + prep", "slang adjective", etc.)

${exampleBlock}

Translation of the word in ${langLabel} / brief explanation in ${langLabel}
Nuance tip or comparison in ${langLabel} (if applicable)

───────────────

2. <b>word</b> (part of speech / category)

${exampleBlock.replace("Example sentence in casual conversation", "Another example sentence")}

Translation of the word / explanation in ${langLabel}

───────────────

[continue to 10, with ─────────────── between each entry]

━━━━━━━━━━━━━━━
💪 See you at noon for more!

CRITICAL FORMAT RULES:
- Use <b>word</b> for bold (NOT markdown **)
- Use <blockquote>"sentence"</blockquote> for example sentences
- Do NOT use any other HTML tags
- ALL explanations/translations MUST be in ${langLabel} (no mixing languages)
- Output ONLY the message above. No preamble.`;

  const message = await generateContent(prompt);
  await sendMessage(message, botToken, chatId);

  // Extract word list for history tracking
  const wordList = extractWords(message);
  saveWords(user.name.toLowerCase(), dateISO, wordList);

  console.log(`Sent ${wordList.length} words for ${user.name} (${dateISO})`);
}

function extractWords(message: string): string[] {
  const matches = message.matchAll(/\d+\.\s+<b>(.+?)<\/b>/g);
  return [...matches].map((m) => m[1].toLowerCase().trim());
}

main().catch((err) => {
  console.error("Failed to generate words:", err);
  process.exit(1);
});
