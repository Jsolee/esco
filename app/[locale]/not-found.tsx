import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-3xl content-center gap-6 px-5 sm:px-8">
      <p className="display text-[clamp(3rem,2rem+4vw,5rem)]">404</p>
      <p lang="ca" className="text-xl">
        Aquesta pàgina no existeix. <Link href="/ca" className="underline underline-offset-4">Torna a l&apos;inici</Link>
      </p>
      <p lang="es" className="text-xl">
        Esta página no existe. <Link href="/es" className="underline underline-offset-4">Vuelve al inicio</Link>
      </p>
    </main>
  );
}
