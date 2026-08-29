import type { TopicId } from "@/types/quiz";

export type LastQuizResult = {
  topicId: TopicId;
  topicTitle: string;
  score: number;
  total: number;
  finishedAt: string;
};

export function getResultHeadline(score: number, total: number): string {
  if (total === 0) {
    return "";
  }
  const ratio = score / total;
  if (ratio === 1) {
    return "Идеально";
  }
  if (ratio >= 0.7) {
    return "Сильный результат";
  }
  if (ratio >= 0.4) {
    return "Есть база, но стоит повторить материал";
  }
  return "Повторите материал и пройдите ещё раз";
}

export function formatResultDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
