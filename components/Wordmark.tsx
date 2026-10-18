import { SYMBOL_SEATS, SYMBOL_VIEWBOX } from "@/lib/brand";

// Lockup horitzontal de la marca: símbol + «Escó» en Newsreader cursiva (proporcions de brand/source/kit.html).
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[0.28em] font-serif text-[1.65rem] font-normal italic leading-none tracking-[-0.01em] ${className}`}>
      <svg viewBox={SYMBOL_VIEWBOX} className="mb-[0.14em] h-[0.62em] w-auto" aria-hidden>
        {SYMBOL_SEATS.map((s, i) => (
          <rect
            key={i}
            x={-s.w / 2}
            y={-s.h / 2}
            width={s.w}
            height={s.h}
            rx={s.rx}
            fill="currentColor"
            opacity={s.you ? 1 : 0.3}
            transform={`translate(${s.x} ${s.y}) rotate(${s.rotate})`}
          />
        ))}
      </svg>
      Escó
    </span>
  );
}
