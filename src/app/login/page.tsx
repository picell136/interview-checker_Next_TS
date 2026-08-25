import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import { AuthForm } from "@/components/AuthForm";
import { safeCallbackUrl } from "@/lib/auth-validation";

export const metadata: Metadata = {
  title: "Вход",
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl: rawCallback } = await searchParams;
  const callbackUrl = safeCallbackUrl(rawCallback ?? "/");

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-white/10 bg-[#12182b]/80 p-8">
        <p className="text-sm font-medium text-sky-300/80">Аккаунт</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Вход</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Войдите, чтобы запускать викторины. Без аккаунта темы на главной можно только смотреть.
        </p>
        <AuthForm mode="login" action={loginAction} callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
