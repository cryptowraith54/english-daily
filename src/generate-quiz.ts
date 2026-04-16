import { generateContent } from "./claude.js";
import { sendMessage } from "./telegram.js";
import { getTodayContent } from "./history.js";

async function main() {
  const today = getTodayContent();

  if (today.words.length === 0 && today.idioms.length === 0) {
    console.log("No content found for today. Skipping quiz.");
    return;
  }

  const prompt = `You are creating a night review quiz for Koya, a Japanese man in his 20s learning English.

Here are today's words and idioms he learned. Create a quiz based on THESE SPECIFIC items.

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
- All example sentences should be casual and realistic (gym, sports, drinks, drives, fashion, music)
- 4 answer choices per question (A/B/C/D)
- Put the correct answer in Telegram spoiler format: ||Answer: X) word||
- Include a mix of easy and tricky questions
- Japanese hints are OK for meaning-type questions
- Aim for 5-8 questions total

**Output format (follow EXACTLY — this is Telegram HTML, use tags exactly as shown):**

🌙 Night Quiz Time, Koya!

今日の単語・イディオムを確認しよう💡

━━━━━━━━━━━━━━━

【Q1 - Word】

<blockquote>"Example sentence with _____ blank"</blockquote>

Japanese hint if needed

A) option1  B) option2  C) option3  D) option4

<tg-spoiler>Answer: B) correct</tg-spoiler>

───────────────

【Q2 - Idiom】

<blockquote>"Example sentence or situation"</blockquote>

この状況で使う表現は？

A) option1  B) option2  C) option3  D) option4

<tg-spoiler>Answer: A) correct</tg-spoiler>

───────────────

[continue for 5-8 questions, with ─────────────── between each]

━━━━━━━━━━━━━━━
✅ 今日もお疲れ！明日の単語も楽しみにしててね

CRITICAL FORMAT RULES:
- Use <b>text</b> for bold (NOT markdown **)
- Use <blockquote>"sentence"</blockquote> for example sentences/questions
- Use <tg-spoiler>answer</tg-spoiler> for spoiler answers (NOT ||spoiler||)
- Do NOT use any other HTML tags
- Output ONLY the message above. No preamble.`;

  const message = await generateContent(prompt);
  await sendMessage(message);

  console.log("Quiz sent successfully");
}

main().catch((err) => {
  console.error("Failed to generate quiz:", err);
  process.exit(1);
});
