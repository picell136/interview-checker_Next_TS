import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TopicId } from "@/types/quiz";
import type { LastQuizResult } from "@/lib/quiz-result";

type ResultsStore = Record<string, Partial<Record<TopicId, LastQuizResult>>>;

const resultsFile = path.join(process.cwd(), "data", "results.json");

async function readStore(): Promise<ResultsStore> {
  try {
    const raw = await readFile(resultsFile, "utf8");
    const parsed = JSON.parse(raw) as ResultsStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(store: ResultsStore): Promise<void> {
  await mkdir(path.dirname(resultsFile), { recursive: true });
  await writeFile(resultsFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function saveLastResult(userId: string, result: LastQuizResult): Promise<void> {
  const store = await readStore();
  const current = store[userId] ?? {};
  store[userId] = { ...current, [result.topicId]: result };
  await writeStore(store);
}

export async function getLastResults(userId: string): Promise<LastQuizResult[]> {
  const store = await readStore();
  const byTopic = store[userId] ?? {};
  return Object.values(byTopic).sort(
    (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
  );
}

export async function getLastResultForTopic(
  userId: string,
  topicId: TopicId,
): Promise<LastQuizResult | undefined> {
  const store = await readStore();
  return store[userId]?.[topicId];
}
