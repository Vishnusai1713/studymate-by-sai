export const SUBJECTS = [
  "Programming",
  "Mathematics",
  "Physics",
  "English",
  "General Knowledge",
] as const;

export type Subject = (typeof SUBJECTS)[number];

const BASE_PROMPT = `You are Sai's StudyMate AI — a helpful AI tutor for engineering students.
Explain concepts in simple English.
Use beginner-friendly explanations and examples.
Explain step-by-step where useful.
Keep responses concise but useful.
Be friendly, motivating, and easy to understand.
Use markdown formatting (headings, bullet lists, **bold**, and fenced code blocks) to keep answers scannable.`;

const SUBJECT_HINTS: Record<Subject, string> = {
  Programming:
    "Topic focus: programming. Prefer concrete code examples in fenced blocks, name the language, and explain edge cases.",
  Mathematics:
    "Topic focus: mathematics. Use clear steps. Use inline `code` for formulas if LaTeX is not rendered.",
  Physics:
    "Topic focus: physics. Use real-world intuition first, then formulas with units.",
  English:
    "Topic focus: English language and writing. Give short examples, grammar rules, and quick exercises.",
  "General Knowledge":
    "Topic focus: general knowledge. Be concise, factual, and engaging.",
};

export function systemPromptFor(subject: Subject) {
  return `${BASE_PROMPT}\n\n${SUBJECT_HINTS[subject] ?? ""}`;
}

export function notesPrompt(topic: string, subject: Subject) {
  return `Generate exam-focused study notes for the topic: "${topic}" (subject: ${subject}).

Format strictly as markdown with these sections:
# ${topic}

## 🎯 Quick Summary
A 2-3 line plain-English summary.

## 🧠 Key Concepts
Bullet list of the most important concepts, each with one short explanation.

## 📝 Detailed Notes
Beginner-friendly explanation, step-by-step where useful. Use sub-headings.

## 💡 Examples
1-3 concrete examples (with code blocks if it's programming/math).

## ❓ Likely Exam Questions
A short bullet list of questions a teacher could ask, with one-line answers.

Keep it crisp, motivating, and easy for an engineering student to revise the night before an exam.`;
}
