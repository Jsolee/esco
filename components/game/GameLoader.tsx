"use client";

import dynamic from "next/dynamic";
import type { GameData } from "@/lib/game";

// El joc depèn de sessionStorage (progrés de la pestanya), així que es pinta només al client.
const Game = dynamic(() => import("./Game").then((m) => m.Game), {
  ssr: false,
  loading: () => <div className="min-h-dvh bg-stage" aria-busy="true" />,
});

export function GameLoader({ data }: { data: GameData }) {
  return <Game data={data} />;
}
