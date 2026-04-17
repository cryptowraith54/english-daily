import { generateContent } from "./claude.js";
import { sendMessage } from "./telegram.js";
import { getTodayContent } from "./history.js";
import { loadUser, getUserCredentials } from "./user.js";

const user = loadUser();
const { botToken, chatId } = getUserCredentials(user);

async function main() {
  const today = getTodayContent(user.name.toLowerCase());

  if (today.words.length === 0 && today.idioms.length === 0) {
    console.log(`No content found for ${user.name} today. Skipping quiz.`);
    return;
  }

  const langLabel =
    user.explanationLanguage === "chinese-simplified"
      ? "Simplified Chinese (简体中文)"
      : user.explanationLanguage === "japanese"
        ? "Japanese"
        : "English";

  const prompt = `You are creating a night review quiz for ${user.name}.

**Student profile:** ${user.profile}

**Context hints for example sentences:** ${user.contextHint}

**English level:** ${user.level}

**Explanation/hint language:** ${langLabel} — all hints, meanings and situational descriptions should be in ${langLabel}.

Here are today's words and idioms ${user.name} learned. Create a quiz based on THESE SPECIFIC items.

**Today's Words:** ${today.words.join(", ")}
**Today's Idioms:** ${today.idioms.join(", ")}

Create 5-8 quiz questions. Output ONLY the Telegram message, nothing else.

**Question types to mix:**
- Fill-in-the-blank with 4 choices (word or idiom)
- Phrasal verb: pick the correct phrasal verb for a situation
- Collocation: pick the correct preposition
- Nuance: which adverb/word has the strongest/weakest intensity
- Meaning match: what does this expression mean in this context

**Rules:**
- Questions MUST reference items from today's word/idiom lists above
- Example sentences match the student's interests and context
- 4 answer choices per question (A/B/C/D)
- Put the correct answer in Telegram spoiler format: <tg-spoiler>Answer: X) word</tg-spoiler>
- Match difficulty to the student's level
- Hints and meaning questions in ${langLabel}
- Aim for 5-8 questions total

**Output format (follow EXACTLY — this is Telegram HTML, use tags exactly as shown):**

${user.greetingEvening}

${user.quizIntro}

━━━━━━━━━━━━━━━

【Q1 - Word】

<blockquote>"Example sentence with _____ blank"</blockquote>

Hint in ${langLabel} if needed

A) option1  B) option2  C) option3  D) option4

<tg-spoiler>Answer: B) correct</tg-spoiler>

───────────────

【Q2 - Idiom】

<blockquote>"Example sentence or situation"</blockquote>

Question in ${langLabel}

A) option1  B) option2  C) option3  D) option4

<tg-spoiler>Answer: A) correct</tg-spoiler>

───────────────

[continue for 5-8 questions, with ─────────────── between each]

━━━━━━━━━━━━━━━
${user.greetingClose}

CRITICAL FORMAT RULES:
- Use <b>text</b> for bold (NOT markdown **)
- Use <blockquote>"sentence"</blockquote> for example sentences/questions
- Use <tg-spoiler>answer</tg-spoiler> for spoiler answers (NOT ||spoiler||)
- Do NOT use any other HTML tags
- Output ONLY the message above. No preamble.`;

  const message = await generateContent(prompt);
  await sendMessage(message, botToken, chatId);

  console.log(`Quiz sent for ${user.name}`);
}

main().catch((err) => {
  console.error("Failed to generate quiz:", err);
  process.exit(1);
});
