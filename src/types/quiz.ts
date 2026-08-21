export type TopicId = "html-css" | "javascript" | "typescript" | "react" | "nextjs";

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type Topic = {
  id: TopicId;
  title: string;
  subtitle: string;
  sourceUrl: string;
  accent: string;
};
