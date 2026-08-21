import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center px-6">
      <h1 className="text-3xl font-semibold text-white">Тема не найдена</h1>
      <p className="mt-3 text-slate-400">Вернитесь на главную и выберите одну из карточек.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
        На главную
      </Link>
    </main>
  );
}
