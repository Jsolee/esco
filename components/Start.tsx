"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { format } from "@/lib/text";
import { provinceFromPostcode, searchProvinces, type ProvinceOption } from "@/lib/territory";
import { PROVINCE_KEY, rememberProvince } from "@/lib/storage";
import { useI18n } from "./I18n";

export type ElectionSummary = {
  id: string;
  name: string;
  date: string;
  status: "open" | "preview" | "upcoming" | "archived";
  reveal?: string;
  fictional: boolean;
  scope: "ES" | { community: string };
  statements: number;
  circs: ("all" | string[])[];
};

export function Start({
  provinces,
  communities,
  elections,
}: {
  provinces: ProvinceOption[];
  communities: Record<string, string>;
  elections: ElectionSummary[];
}) {
  const { m, locale } = useI18n();
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [listOpen, setListOpen] = useState(false);

  const q = query.trim();
  const digits = /^\d+$/.test(q);
  const fromCp = digits && q.length === 5 ? provinceFromPostcode(q) : null;
  const cpError = digits && q.length === 5 && !fromCp;
  const hits = !digits && q && !chosen ? searchProvinces(q, provinces) : [];
  const province = provinces.find((p) => p.id === (fromCp ?? chosen));
  const showList = listOpen && hits.length > 0;

  function begin() {
    setOpen(true);
    try {
      const saved = sessionStorage.getItem(PROVINCE_KEY);
      const p = provinces.find((x) => x.id === saved);
      if (p) {
        setChosen(p.id);
        setQuery(p.name);
      }
    } catch {}
    // Si recuperem la província d'abans, la deixem seleccionada perquè escriure la substitueixi.
    requestAnimationFrame(() => input.current?.select());
  }

  function pick(p: ProvinceOption) {
    setChosen(p.id);
    setQuery(p.name);
    setListOpen(false);
    rememberProvince(p.id);
  }

  function onChange(v: string) {
    setQuery(v);
    setChosen(null);
    setActive(0);
    setListOpen(true);
    const cp = /^\d{5}$/.test(v.trim()) ? provinceFromPostcode(v) : null;
    if (cp) rememberProvince(cp);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showList) return;
    if (e.key === "ArrowDown") setActive((a) => (a + 1) % hits.length);
    else if (e.key === "ArrowUp") setActive((a) => (a - 1 + hits.length) % hits.length);
    else if (e.key === "Enter") pick(hits[active].province);
    else if (e.key === "Escape") setListOpen(false);
    else return;
    e.preventDefault();
  }

  const available = province
    ? elections.filter((e) => e.scope === "ES" || e.scope.community === province.community)
    : [];
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });

  if (!open)
    return (
      <button type="button" onClick={begin} className="btn group mt-9 bg-chalk px-8 text-lg text-stage">
        {m.landing.start}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </button>
    );

  return (
    <div className="rise mt-9 grid max-w-xl gap-6">
      <div className="relative grid gap-2">
        <label htmlFor={`${uid}-q`} className="font-serif text-3xl">
          {m.start.where}
        </label>
        <p id={`${uid}-hint`} className="text-sm text-chalk-2">
          {m.start.hint}
        </p>
        <input
          ref={input}
          id={`${uid}-q`}
          type="text"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={`${uid}-list`}
          aria-activedescendant={showList ? `${uid}-o${active}` : undefined}
          aria-describedby={`${uid}-hint ${uid}-status`}
          placeholder={m.start.placeholder}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => setListOpen(false)}
          className="mt-1 min-h-14 w-full border-0 border-b-2 border-chalk bg-transparent px-0 font-serif text-2xl text-chalk placeholder:text-chalk-3 focus:outline-none focus-visible:border-b-[3px]"
        />
        <ul
          id={`${uid}-list`}
          role="listbox"
          aria-label={m.start.suggestions}
          hidden={!showList}
          className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-chalk-3/60 bg-stage-2/95 text-chalk shadow-2xl backdrop-blur"
        >
          {hits.map((h, i) => (
            <li
              key={h.province.id}
              id={`${uid}-o${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(h.province);
              }}
              className="flex cursor-pointer items-baseline justify-between gap-4 px-4 py-3 aria-selected:bg-stage-3"
            >
              <span className="font-medium">{h.label}</span>
              <span className="text-sm text-chalk-2">
                {h.label !== h.province.name ? `${h.province.name} · ` : ""}
                {communities[h.province.community]}
              </span>
            </li>
          ))}
        </ul>
        <p id={`${uid}-status`} aria-live="polite" className="min-h-6 text-sm">
          {cpError ? (
            m.start.invalidCp
          ) : province ? (
            <span className="font-medium">
              → {province.name} · {communities[province.community]}
            </span>
          ) : q && !digits && hits.length === 0 ? (
            m.start.noMatch
          ) : null}
        </p>
      </div>

      {province && (
        <section className="rise grid gap-3" aria-labelledby={`${uid}-el`}>
          <h2 id={`${uid}-el`} className="kicker text-chalk-2">
            {m.start.elections}
          </h2>
          {available.length === 0 && <p className="text-chalk-2">{m.start.noElections}</p>}
          {available.map((e) => {
            const count = e.circs.filter((c) => c === "all" || c.includes(province.id)).length;
            if (e.status !== "open" && e.status !== "preview")
              return (
                <div key={e.id} className="grid gap-3 rounded-2xl border border-dashed border-chalk-3/70 p-5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="kicker rounded-full border border-current px-2.5 py-1 text-chalk-2">{m.start.status[e.status]}</span>
                  </span>
                  <span className="font-serif text-3xl leading-tight">{e.name}</span>
                  <span className="text-sm text-chalk-2">{dateFmt.format(new Date(e.date))}</span>
                  <span className="text-sm text-chalk-2">{m.start.pending}</span>
                </div>
              );
            return (
              <Link
                key={e.id}
                href={`/${locale}/${e.id}`}
                onClick={() => rememberProvince(province.id)}
                className="group grid gap-3 rounded-2xl border border-chalk/70 bg-stage-2/70 p-5 backdrop-blur transition-colors hover:bg-chalk hover:text-stage"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="kicker rounded-full border border-current px-2.5 py-1">{m.start.status[e.status]}</span>
                  {e.fictional && <span className="kicker rounded-full border border-dashed border-current px-2.5 py-1">{m.start.fictional}</span>}
                </span>
                <span className="font-serif text-3xl leading-tight">{e.name}</span>
                <span className="text-sm opacity-80">
                  {dateFmt.format(new Date(e.date))} · {format(m.start.statements, { n: e.statements })} ·{" "}
                  {e.status === "preview" && e.reveal
                    ? format(m.start.revealOn, { date: dateFmt.format(new Date(e.reveal)) })
                    : format(m.start.candidacies, { n: count, place: province.name })}
                </span>
                <span className="mt-1 inline-flex items-center gap-2 font-semibold">
                  {m.start.enter}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
