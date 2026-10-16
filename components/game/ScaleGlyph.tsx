import type { Answer } from "@/lib/schema";

// Cinc punts en línia, de «molt en desacord» a «molt d'acord». La posició diu el valor sense dependre del color.
export function ScaleGlyph({ value, label }: { value: Answer; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <svg viewBox="0 0 52 8" className="h-2 w-13 shrink-0 overflow-visible" aria-hidden>
        {([-2, -1, 0, 1, 2] as const).map((v, i) => (
          <circle
            key={v}
            cx={4 + i * 11}
            cy={4}
            r={3.2}
            strokeWidth={1.2}
            className={v === value ? "fill-current stroke-current" : "fill-none stroke-current opacity-40"}
          />
        ))}
      </svg>
      <span className="text-ink-2">{label}</span>
    </span>
  );
}
