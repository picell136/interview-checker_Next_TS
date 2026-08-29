import type { Metadata } from "next";
import { ThemePicker } from "@/components/ThemePicker";

export const metadata: Metadata = {
  title: "Настройки",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-6 py-16">
      <p className="text-sm font-medium text-sky-500">Меню</p>
      <h1 className="mt-2 text-4xl font-semibold text-fg">Настройки</h1>
      <p className="mt-3 text-muted">Выберите тему оформления. Она сохранится в этом браузере.</p>
      <section className="mt-8 rounded-3xl border border-line bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-fg">Тема</h2>
        <ThemePicker />
      </section>
    </main>
  );
}
