import type { Metadata } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import { SiteHeader, getThemeFromCookie } from "@/components/SiteHeader";
import { ThemeSync } from "@/components/theme";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "Interview Checker | Викторина на знание основ программирования",
    template: "%s | Викторина на знание основ программирования",
  },
  description: "Викторина по вопросам собеседований: HTML/CSS, JavaScript, TypeScript, React и Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeFromCookie();

  return (
    <html lang="ru" data-theme={theme} suppressHydrationWarning>
      <body className={`${geist.variable} ${geist.className} antialiased text-fg`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=document.cookie.match(/(?:^|; )theme=([^;]*)/);var v=t?decodeURIComponent(t[1]):localStorage.getItem("theme");if(v==="light"||v==="dark"){document.documentElement.dataset.theme=v;}}catch(e){}})();`}
        </Script>
        <ThemeSync />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
