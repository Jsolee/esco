"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/fx";
import { Hemicycle } from "../Hemicycle";
import type { ChamberProps } from "./Chamber";

// three.js va en un fragment a part: no pesa a la primera càrrega.
const Chamber = dynamic(() => import("./Chamber"), { ssr: false });

// Es comprova un sol cop: cada prova crea un context WebGL i el navegador en limita el nombre.
let support: boolean | undefined;
function webgl() {
  if (support !== undefined) return support;
  try {
    const ctx = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    support = !!ctx;
    ctx?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    support = false;
  }
  return support;
}
const noop = () => () => {};

// L'hemicicle en 3D, amb l'SVG de sempre mentre carrega o si el dispositiu no té WebGL.
export function Stage3D({ fallbackClass = "", ...props }: ChamberProps & { fallbackClass?: string }) {
  const reduced = useReducedMotion();
  const gl = useSyncExternalStore(noop, webgl, () => false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const { lit, colors, you } = props;

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex justify-center transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      >
        <Hemicycle
          className={`text-chalk ${fallbackClass}`}
          you={you}
          seat={(i) => ({ fill: colors?.[i] ?? "#f2f1ec", opacity: 0.1 + (lit?.[i] ?? 0.1) * 0.85 })}
        />
      </div>
      {gl && !failed && (
        <div className={`transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Chamber {...props} reduced={reduced} onFail={() => setFailed(true)} onReady={() => setReady(true)} />
        </div>
      )}
    </>
  );
}
