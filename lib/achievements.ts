import type { Answers } from "./match";

// Assoliments de participació. Mai depenen de què respons, només de com jugues.
export const ACHIEVEMENTS = ["first", "streak5", "streak10", "curious", "informed", "full"] as const;
export type Achievement = (typeof ACHIEVEMENTS)[number];

export function progressOf(order: string[], answers: Answers) {
  let run = 0;
  let best = 0;
  let voted = 0;
  let skipped = 0;
  for (const id of order) {
    const a = answers[id];
    if (a === undefined) break;
    if (a === null) {
      skipped++;
      run = 0;
    } else {
      voted++;
      best = Math.max(best, ++run);
    }
  }
  return { run, best, voted, skipped };
}

export function achievementsOf(order: string[], answers: Answers, read: number, finished: boolean): Achievement[] {
  const { best, voted, skipped } = progressOf(order, answers);
  const out: Achievement[] = [];
  if (voted >= 1) out.push("first");
  if (best >= 5) out.push("streak5");
  if (best >= 10) out.push("streak10");
  if (read >= 3) out.push("curious");
  if (read >= 8) out.push("informed");
  if (finished && skipped === 0) out.push("full");
  return out;
}
