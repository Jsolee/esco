import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getMessages, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  return (
    <>
      <SiteHeader locale={locale} m={m} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} m={m} />
    </>
  );
}
