import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/I18n";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import { getMessages, isLocale } from "@/lib/i18n";
import { LOCALES } from "@/lib/schema";
import "../globals.css";

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const sans = Schibsted_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-schibsted", display: "swap" });

const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0b" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    metadataBase: new URL(site),
    title: { default: m.meta.title, template: `%s · Escó` },
    description: m.meta.description,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
    openGraph: { title: m.meta.title, description: m.meta.description, siteName: "Escó", locale },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <I18nProvider m={getMessages(locale)} locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
