import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { BurgerMenu } from "@/components/BurgerMenu";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-header backdrop-blur-md">
      <div className="flex h-16 w-full items-center gap-4 pl-3 pr-6">
        <BurgerMenu />
        <Link href="/" prefetch={false} className="text-sm font-semibold tracking-tight text-fg">
          Interview Checker
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="hidden max-w-48 truncate text-muted sm:inline">
                {user.name ?? user.email}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-line px-3 py-1.5 font-medium text-fg transition hover:bg-input"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" prefetch={false} className="rounded-xl px-3 py-1.5 font-medium text-muted transition hover:text-fg">
                Вход
              </Link>
              <Link href="/register" prefetch={false} className="rounded-xl bg-btn px-3 py-1.5 font-semibold text-btn-fg">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export async function getThemeFromCookie(): Promise<"dark" | "light"> {
  const jar = await cookies();
  return jar.get("theme")?.value === "light" ? "light" : "dark";
}
