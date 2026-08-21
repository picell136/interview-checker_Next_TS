import type { QuizQuestion } from "@/types/quiz";

export function q(
  id: string,
  prompt: string,
  correct: string,
  wrong: [string, string, string],
  explanation: string,
): QuizQuestion {
  return {
    id,
    prompt,
    options: [correct, wrong[0], wrong[1], wrong[2]],
    correctIndex: 0,
    explanation,
  };
}

export const QUIZ_LENGTH = 12;
