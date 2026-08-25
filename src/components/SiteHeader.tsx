import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0b1020]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          Interview Checker
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="hidden max-w-48 truncate text-slate-400 sm:inline">
                {user.name ?? user.email}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-white/15 px-3 py-1.5 font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3 py-1.5 font-medium text-slate-300 transition hover:text-white"
              >
                Вход
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-950"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
