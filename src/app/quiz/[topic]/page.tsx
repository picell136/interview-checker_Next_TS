import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizApp } from "@/components/QuizApp";
import { TOPICS, getTopic, isTopicId } from "@/lib/topics";

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic: topic.id }));
}

type QuizPageProps = {
  params: Promise<{ topic: string }>;
};

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = getTopic(topicId);

  if (!topic) {
    return { title: "Тема не найдена" };
  }

  return { title: topic.title };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { topic: topicId } = await params;

  if (!isTopicId(topicId)) {
    notFound();
  }

  const topic = getTopic(topicId);
  if (!topic) {
    notFound();
  }

  return <QuizApp topic={topic} />;
}
