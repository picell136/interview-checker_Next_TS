"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut, auth } from "@/auth";
import { safeCallbackUrl, validateRegisterInput } from "@/lib/auth-validation";
import { StorageError } from "@/lib/db";
import { createUser } from "@/lib/users";

export type AuthFormState = {
  error?: string;
};

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

function authErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AuthError && error.type === "CredentialsSignin") {
    return "Неверный email или пароль";
  }
  if (typeof error === "object" && error !== null && "type" in error) {
    if (String((error as { type: unknown }).type) === "CredentialsSignin") {
      return "Неверный email или пароль";
    }
  }
  return fallback;
}

async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl: string,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: authErrorMessage(error, "Не удалось войти. Проверьте email и пароль.") };
  }

  const session = await auth();
  if (!session?.user) {
    return { error: "Не удалось создать сессию. Попробуйте войти ещё раз." };
  }

  redirect(callbackUrl);
}

export async function loginAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  return signInWithCredentials(email, password, callbackUrl);
}

export async function registerAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));

  const validationError = validateRegisterInput({
    name,
    email,
    password,
    confirmPassword,
  });
  if (validationError) {
    return { error: validationError };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({ name, email, passwordHash });
  } catch (error) {
    if (
      (error instanceof StorageError && error.code === "EMAIL_TAKEN") ||
      (error instanceof Error && error.message === "EMAIL_TAKEN")
    ) {
      return { error: "Этот email уже зарегистрирован" };
    }
    if (error instanceof StorageError && error.code === "NO_DATABASE") {
      return {
        error:
          "На сервере нет базы данных. Добавьте DATABASE_URL (Neon Postgres) в переменные окружения Vercel и задеплойте проект снова.",
      };
    }
    return { error: "Не удалось сохранить аккаунт. Попробуйте ещё раз." };
  }

  try {
    return await signInWithCredentials(email, password, callbackUrl);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: "Аккаунт создан, но войти не удалось. Попробуйте вход." };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
