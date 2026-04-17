import { generateContent } from "./claude.js";
import { sendMessage } from "./telegram.js";
import { getUsedItems, saveIdioms } from "./history.js";
import { loadUser, getUserCredentials } from "./user.js";

const user = loadUser();
const { botToken, chatId } = getUserCredentials(user);

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

  const prompt = `You are an English idiom/expression teacher for ${user.name}.

**Student profile:** ${user.profile}

**Interests (use for example sentences):** ${user.interests}

**Context hints for examples:** ${user.contextHint}

**English level:** ${user.level}
${user.levelDescription}

**Explanation language:** ${langLabel} — ALL translations and explanations MUST be written in ${langLabel}. Keep them natural and clear.

Generate exactly 10 idioms/expressions for today's lesson. Output ONLY the Telegram message, nothing else.

**Category balance (must follow):**
${user.idiomsBalance}

**Rules:**
- Example sentences MUST be realistic casual conversation matching the student's interests. NO textbook English.
- Translation in ${langLabel} + brief explanation in ${langLabel} required for every idiom
- For adverb nuance items: show 2-3 versions of the same sentence with different adverbs, explain the intensity difference in ${langLabel}
- Match the difficulty to the student's level. For beginner-elementary students, focus on extremely common expressions ("no worries", "my bad", "totally get it"), avoid obscure slang.
- Mix easy-but-underused expressions with slightly more advanced ones

**Already used in the last 30 days (DO NOT repeat these):**
Idioms: ${used.idioms.length > 0 ? used.idioms.join(", ") : "none yet"}

**Output format (follow EXACTLY — this is Telegram HTML, use tags exactly as shown):**

${user.greetingMidday}

━━━━━━━━━━━━━━━

1. <b>"Expression here"</b> (category label like "general idiom", "adverb nuance", "phrasal verb idiom", etc.)

${exampleBlock}

Translation of the idiom / explanation in ${langLabel}

───────────────

2. <b>"Expression here"</b> (adverb nuance)

${exampleBlock.replace("Example sentence in casual conversation", "Another example sentence")}

Translation of the idiom in ${langLabel}
Nuance comparison in ${langLabel} (for adverb items)

───────────────

[continue to 10, with ─────────────── between each entry]

━━━━━━━━━━━━━━━
🎯 Quiz tonight — stay ready!

CRITICAL FORMAT RULES:
- Use <b>text</b> for bold (NOT markdown **)
- Use <blockquote>"sentence"</blockquote> for example sentences
- Do NOT use any other HTML tags
- ALL explanations/translations MUST be in ${langLabel}
- Output ONLY the message above. No preamble.`;

  const message = await generateContent(prompt);
  await sendMessage(message, botToken, chatId);

  // Extract idiom list for history tracking
  const idiomList = extractIdioms(message);
  saveIdioms(user.name.toLowerCase(), dateISO, idiomList);

  console.log(`Sent ${idiomList.length} idioms for ${user.name} (${dateISO})`);
}

function extractIdioms(message: string): string[] {
  const matches = message.matchAll(/\d+\.\s+<b>"(.+?)"<\/b>/g);
  return [...matches].map((m) => m[1].toLowerCase().trim());
}

main().catch((err) => {
  console.error("Failed to generate idioms:", err);
  process.exit(1);
});
