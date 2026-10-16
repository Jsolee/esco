"use client";

import { createContext, useContext } from "react";
import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/schema";

const Ctx = createContext<{ m: Messages; locale: Locale } | null>(null);

export function I18nProvider({ m, locale, children }: { m: Messages; locale: Locale; children: React.ReactNode }) {
  return <Ctx value={{ m, locale }}>{children}</Ctx>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n fora d'I18nProvider");
  return v;
}
