import Link from "next/link";
import type { Messages } from "@/lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

export function SiteHeader({ locale, m }: { locale: string; m: Messages }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:p-3">
        {m.nav.skip}
      </a>
      <Link href={`/${locale}`} aria-label={m.nav.home} className="inline-flex min-h-11 items-center">
        <Wordmark />
      </Link>
      <div className="flex items-center gap-1 sm:gap-3">
        <Link href={`/${locale}/metodologia`} className="hidden min-h-11 items-center px-2 text-sm font-medium sm:inline-flex">
          {m.nav.how}
        </Link>
        <LocaleSwitch />
        <ThemeToggle className="hover:bg-sunken" />
      </div>
    </header>
  );
}

export function SiteFooter({ locale, m }: { locale: string; m: Messages }) {
  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl border-t border-rule px-5 py-8 text-sm text-ink-2 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="max-w-prose">{m.footer.text}</p>
        <div className="flex gap-5">
          <Link href={`/${locale}/metodologia`} className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink">
            {m.footer.method}
          </Link>
          <span className="text-ink-3">{m.footer.fictional}</span>
        </div>
      </div>
    </footer>
  );
}
