"use client";

import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "../I18n";

// «Com es juga»: totes les peces del joc explicades en una línia, sempre a mà des de la capçalera.
export function Help({ budget = false }: { budget?: boolean }) {
  const { m, locale } = useI18n();
  const h = m.game.help;
  const dialog = useRef<HTMLDialogElement>(null);
  const items = budget ? [...h.items, h.budget] : h.items;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-chalk-3/50 px-3 text-xs font-semibold uppercase tracking-wider text-chalk-2 hover:text-chalk"
      >
        <span aria-hidden className="grid size-4 place-items-center rounded-full border border-current text-[0.65rem] leading-none">
          ?
        </span>
        <span className="hidden sm:inline">{h.button}</span>
        <span className="sr-only sm:hidden">{h.button}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="help-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[88dvh] w-[min(94vw,560px)] overflow-y-auto rounded-[1.75rem] border border-chalk-3/50 bg-stage-2 p-0 text-chalk backdrop:bg-stage/70 backdrop:backdrop-blur-sm"
      >
        <div className="grid gap-5 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="help-title" className="display text-[2rem]">
              {h.title}
            </h2>
            <button type="button" onClick={() => dialog.current?.close()} aria-label={h.close} className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center text-2xl text-chalk-2 hover:text-chalk">
              ×
            </button>
          </div>
          <dl className="grid gap-4">
            {items.map((it) => (
              <div key={it.t} className="grid gap-1 border-t border-chalk-3/40 pt-3">
                <dt className="font-semibold">{it.t}</dt>
                <dd className="text-chalk-2">{it.d}</dd>
              </div>
            ))}
          </dl>
          <Link href={`/${locale}/metodologia`} className="justify-self-start underline underline-offset-4 hover:text-chalk">
            {h.method}
          </Link>
        </div>
      </dialog>
    </>
  );
}
