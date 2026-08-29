import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { QuizApp } from "@/components/QuizApp";
import { auth } from "@/auth";
import { getLastResultForTopic } from "@/lib/results-store";
import { getTopic, isTopicId } from "@/lib/topics";

type QuizPageProps = {
  params: Promise<{ topic: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = getTopic(topicId);

  if (!topic) {
    return { title: "Тема не найдена" };
  }

  return { title: topic.title };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await auth();
  const { topic: topicId } = await params;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/quiz/${topicId}`)}`);
  }

  if (!isTopicId(topicId)) {
    notFound();
  }

  const topic = getTopic(topicId);
  if (!topic) {
    notFound();
  }

  return <QuizApp topic={topic} lastResult={(await getLastResultForTopic(session.user.id, topic.id)) ?? null} />;
}
