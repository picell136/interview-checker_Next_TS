import { notFound } from "next/navigation";
import { QuizApp } from "@/components/QuizApp";
import { TOPICS, getTopic, isTopicId } from "@/lib/topics";

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic: topic.id }));
}

type QuizPageProps = {
  params: Promise<{ topic: string }>;
};

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
