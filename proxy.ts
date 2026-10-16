import { NextResponse, type NextRequest } from "next/server";
import { LOCALES } from "@/lib/schema";

// Redirigeix les rutes sense idioma a /ca o /es segons l'Accept-Language del navegador.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const header = request.headers.get("accept-language") ?? "";
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .find((x) => (LOCALES as readonly string[]).includes(x.lang));
  request.nextUrl.pathname = `/${wanted?.lang ?? "ca"}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|icon|.*\\..*).*)"],
};
