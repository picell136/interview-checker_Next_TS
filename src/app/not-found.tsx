import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-start justify-center px-6">
      <h1 className="text-3xl font-semibold text-fg">Тема не найдена</h1>
      <p className="mt-3 text-muted">Вернитесь на главную и выберите одну из карточек.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-btn px-5 py-3 text-sm font-semibold text-btn-fg">
        На главную
      </Link>
    </main>
  );
}
