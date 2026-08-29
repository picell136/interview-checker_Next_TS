"use server";

import { auth } from "@/auth";
import { getLastResultForTopic, getLastResults, saveLastResult } from "@/lib/results-store";
import type { LastQuizResult } from "@/lib/quiz-result";
import { isTopicId } from "@/lib/topics";

export async function saveQuizResultAction(input: {
  topicId: string;
  topicTitle: string;
  score: number;
  total: number;
}): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !isTopicId(input.topicId)) {
    return;
  }

  const total = Math.max(0, Math.floor(input.total));
  const score = Math.min(total, Math.max(0, Math.floor(input.score)));

  await saveLastResult(userId, {
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    score,
    total,
    finishedAt: new Date().toISOString(),
  });
}

export async function getLastResultsAction(): Promise<LastQuizResult[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return [];
  }
  return getLastResults(userId);
}

export async function getLastResultForTopicAction(topicId: string): Promise<LastQuizResult | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !isTopicId(topicId)) {
    return null;
  }
  return (await getLastResultForTopic(userId, topicId)) ?? null;
}
