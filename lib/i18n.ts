import ca from "@/messages/ca.json";
import es from "@/messages/es.json";
import { LOCALES, type Locale } from "./schema";

// Només per al servidor: importa tots els diccionaris. Als clients els arriba només el de l'idioma actual.
export type Messages = typeof ca;
const MESSAGES: Record<Locale, Messages> = { ca, es };

export const isLocale = (l: string): l is Locale => (LOCALES as readonly string[]).includes(l);
export const getMessages = (l: Locale) => MESSAGES[l];
