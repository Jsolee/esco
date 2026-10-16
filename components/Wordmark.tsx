const DOTS = Array.from({ length: 7 }, (_, i) => {
  const a = Math.PI * (1 - i / 6);
  return [12 + 9.5 * Math.cos(a), 12.5 - 9.5 * Math.sin(a)];
});

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-2 font-serif text-[1.65rem] italic leading-none tracking-tight ${className}`}>
      <svg viewBox="0 0 24 14" className="mb-[0.2em] h-[0.62em] w-auto" aria-hidden>
        {DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.7} fill="currentColor" opacity={i === 3 ? 1 : 0.35} />
        ))}
      </svg>
      Escó
    </span>
  );
}
