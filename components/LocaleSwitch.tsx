"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/schema";
import { useI18n } from "./I18n";

export function LocaleSwitch({ className = "" }: { className?: string }) {
  const { locale, m } = useI18n();
  const pathname = usePathname();
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return (
    <nav aria-label={m.nav.language} className={`flex items-center ${className}`}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm font-semibold uppercase tracking-wider opacity-60 aria-[current]:opacity-100"
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}
