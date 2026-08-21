import type { Topic, TopicId } from "@/types/quiz";

export const TOPICS: Topic[] = [
  {
    id: "html-css",
    title: "HTML/CSS",
    subtitle: "Семантика, каскад, Flex и Grid",
    sourceUrl: "https://code.mu/ru/job/questions/markup/",
    accent: "#f97316",
  },
  {
    id: "javascript",
    title: "JavaScript",
    subtitle: "Типы, замыкания, Event Loop",
    sourceUrl: "https://code.mu/ru/job/questions/javascript/",
    accent: "#eab308",
  },
  {
    id: "typescript",
    title: "TypeScript",
    subtitle: "Типы, дженерики, утилиты",
    sourceUrl: "https://code.mu/ru/job/questions/javascript/typescript/",
    accent: "#38bdf8",
  },
  {
    id: "react",
    title: "React",
    subtitle: "Хуки, рендер, состояние",
    sourceUrl: "https://code.mu/ru/job/questions/javascript/react/",
    accent: "#22d3ee",
  },
  {
    id: "nextjs",
    title: "Next.js",
    subtitle: "App Router, SSR, SSG, ISR",
    sourceUrl: "https://code.mu/ru/job/questions/javascript/next/",
    accent: "#a78bfa",
  },
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((topic) => topic.id === value);
}
