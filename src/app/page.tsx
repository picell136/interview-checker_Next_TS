import Link from "next/link";
import { auth } from "@/auth";
import { TOPICS } from "@/lib/topics";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-6 py-16">
      <header className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-medium tracking-wide text-sky-500 uppercase">
          Подготовка к собеседованию
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Interview Checker</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Выберите технологию. Внутри — вопросы в формате викторины, 60 секунд на ответ и разбор сразу
          после выбора.
        </p>
        {!session?.user ? (
          <p className="mt-4 text-sm text-muted-2">
            Чтобы начать викторину,{" "}
            <Link href="/login" className="text-sky-500 hover:text-sky-400">
              войдите
            </Link>{" "}
            или{" "}
            <Link href="/register" className="text-sky-500 hover:text-sky-400">
              зарегистрируйтесь
            </Link>
            .
          </p>
        ) : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => (
          <Link
            key={topic.id}
            href={`/quiz/${topic.id}`}
            className="group relative overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-1 hover:border-muted-2"
          >
            <span
              className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30 blur-2xl transition group-hover:opacity-60"
              style={{ backgroundColor: topic.accent }}
              aria-hidden
            />
            <span
              className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-slate-950"
              style={{ backgroundColor: topic.accent }}
            >
              {topic.title.slice(0, 2)}
            </span>
            <h2 className="text-2xl font-semibold text-fg">{topic.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{topic.subtitle}</p>
            <p className="mt-6 text-sm font-medium text-muted group-hover:text-fg">Начать викторину →</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
