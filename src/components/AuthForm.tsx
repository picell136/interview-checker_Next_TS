"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

const fieldClassName =
  "mt-1.5 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60";

type AuthFormProps = {
  mode: "login" | "register";
  action: (state: AuthFormState | undefined, formData: FormData) => Promise<AuthFormState>;
  callbackUrl: string;
};

export function AuthForm({ mode, action, callbackUrl }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {isRegister ? (
        <label className="block text-sm text-slate-300">
          Имя
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={40}
            className={fieldClassName}
          />
        </label>
      ) : null}

      <label className="block text-sm text-slate-300">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClassName}
        />
      </label>

      <label className="block text-sm text-slate-300">
        Пароль
        <input
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 5 : undefined}
          className={fieldClassName}
        />
      </label>

      {isRegister ? (
        <label className="block text-sm text-slate-300">
          Повторите пароль
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={5}
            className={fieldClassName}
          />
        </label>
      ) : null}

      {state.error ? (
        <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
      >
        {pending ? "Секунду..." : isRegister ? "Создать аккаунт" : "Войти"}
      </button>

      <p className="text-center text-sm text-slate-400">
        {isRegister ? (
          <>
            Уже есть аккаунт?{" "}
            <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-sky-300 hover:text-sky-200">
              Войти
            </Link>
          </>
        ) : (
          <>
            Нет аккаунта?{" "}
            <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-sky-300 hover:text-sky-200">
              Зарегистрироваться
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
