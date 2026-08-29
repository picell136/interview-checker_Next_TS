import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TopicId } from "@/types/quiz";
import type { LastQuizResult } from "@/lib/quiz-result";
import { assertPersistentStorage, getSql, usesDatabase } from "@/lib/db";
import { isTopicId } from "@/lib/topics";

type ResultsStore = Record<string, Partial<Record<TopicId, LastQuizResult>>>;

const resultsFile = path.join(process.cwd(), "data", "results.json");

type ResultRow = {
  topic_id: string;
  topic_title: string;
  score: number;
  total: number;
  finished_at: string | Date;
};

function mapResult(row: ResultRow): LastQuizResult | undefined {
  if (!isTopicId(row.topic_id)) {
    return undefined;
  }
  return {
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    score: Number(row.score),
    total: Number(row.total),
    finishedAt:
      typeof row.finished_at === "string" ? row.finished_at : row.finished_at.toISOString(),
  };
}

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
  if (usesDatabase()) {
    const sql = await getSql();
    await sql`
      INSERT INTO results (user_id, topic_id, topic_title, score, total, finished_at)
      VALUES (
        ${userId},
        ${result.topicId},
        ${result.topicTitle},
        ${result.score},
        ${result.total},
        ${result.finishedAt}
      )
      ON CONFLICT (user_id, topic_id) DO UPDATE SET
        topic_title = EXCLUDED.topic_title,
        score = EXCLUDED.score,
        total = EXCLUDED.total,
        finished_at = EXCLUDED.finished_at
    `;
    return;
  }

  assertPersistentStorage();
  const store = await readStore();
  const current = store[userId] ?? {};
  store[userId] = { ...current, [result.topicId]: result };
  await writeStore(store);
}

export async function getLastResults(userId: string): Promise<LastQuizResult[]> {
  if (usesDatabase()) {
    const sql = await getSql();
    const rows = (await sql`
      SELECT topic_id, topic_title, score, total, finished_at
      FROM results
      WHERE user_id = ${userId}
    `) as ResultRow[];
    return rows
      .map(mapResult)
      .filter((item): item is LastQuizResult => Boolean(item))
      .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime());
  }

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
  if (usesDatabase()) {
    const sql = await getSql();
    const rows = (await sql`
      SELECT topic_id, topic_title, score, total, finished_at
      FROM results
      WHERE user_id = ${userId} AND topic_id = ${topicId}
      LIMIT 1
    `) as ResultRow[];
    return rows[0] ? mapResult(rows[0]) : undefined;
  }

  const store = await readStore();
  return store[userId]?.[topicId];
}
