import { htmlCssQuestions } from "@/data/questions/html-css";
import { javascriptQuestions } from "@/data/questions/javascript";
import { nextjsQuestions } from "@/data/questions/nextjs";
import { reactQuestions } from "@/data/questions/react";
import { typescriptQuestions } from "@/data/questions/typescript";
import { QUIZ_LENGTH } from "@/data/questions/helpers";
import type { QuizQuestion, TopicId } from "@/types/quiz";

export { QUIZ_LENGTH };

export const QUESTIONS_BY_TOPIC: Record<TopicId, QuizQuestion[]> = {
  "html-css": htmlCssQuestions,
  javascript: javascriptQuestions,
  typescript: typescriptQuestions,
  react: reactQuestions,
  nextjs: nextjsQuestions,
};

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const indexed = question.options.map((text, originalIndex) => ({ originalIndex, text }));
  shuffleInPlace(indexed);
  const correctIndex = indexed.findIndex((option) => option.originalIndex === question.correctIndex) as
    | 0
    | 1
    | 2
    | 3;

  return {
    ...question,
    options: [indexed[0].text, indexed[1].text, indexed[2].text, indexed[3].text],
    correctIndex,
  };
}

export function pickQuizQuestions(
  questions: QuizQuestion[],
  count: number = QUIZ_LENGTH,
): QuizQuestion[] {
  const uniqueById = [...new Map(questions.map((item) => [item.id, item])).values()];
  return shuffleInPlace(uniqueById.map(shuffleQuestionOptions)).slice(0, count);
}
