import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLastResults } from "@/lib/results-store";
import { formatResultDate, getResultHeadline } from "@/lib/quiz-result";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Результаты",
};

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/results")}`);
  }

  const results = await getLastResults(session.user.id);
  const latest = results[0];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-6 py-16">
      <p className="text-sm font-medium text-sky-500">Меню</p>
      <h1 className="mt-2 text-4xl font-semibold text-fg">Результаты</h1>
      <p className="mt-3 text-muted">Последний результат по каждой пройденной викторине.</p>

      {results.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-line bg-card p-8">
          <p className="text-fg">Пока нет сохранённых попыток.</p>
          <p className="mt-2 text-sm text-muted">Пройдите викторину — сюда попадёт последний счёт.</p>
          <Link href="/" className="mt-6 inline-flex rounded-2xl bg-btn px-5 py-3 text-sm font-semibold text-btn-fg">
            К технологиям
          </Link>
        </section>
      ) : (
        <ul className="mt-8 space-y-4">
          {results.map((result) => {
            const topic = TOPICS.find((item) => item.id === result.topicId);
            const isLatest = latest?.topicId === result.topicId && latest.finishedAt === result.finishedAt;
            return (
              <li key={result.topicId} className="rounded-3xl border border-line bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: topic?.accent }}>
                      {result.topicTitle}
                      {isLatest ? " · последняя попытка" : ""}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-fg">
                      {getResultHeadline(result.score, result.total)}
                    </h2>
                  </div>
                  <p className="text-lg font-semibold text-fg">
                    {result.score} / {result.total}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted">{formatResultDate(result.finishedAt)}</p>
                <Link
                  href={`/quiz/${result.topicId}`}
                  className="mt-5 inline-flex text-sm font-medium text-sky-500 hover:text-sky-400"
                >
                  Пройти снова →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
