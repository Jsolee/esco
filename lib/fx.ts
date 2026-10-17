"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useSyncExternalStore } from "react";

gsap.registerPlugin(useGSAP, Draggable, ScrollTrigger, SplitText);
export { gsap, Draggable, ScrollTrigger, SplitText, useGSAP };

// Moviment reduït: tot passa a canvi directe, sense desplaçaments ni 3D animat.
const RM = "(prefers-reduced-motion: reduce)";
export const reducedMotion = () => typeof window !== "undefined" && matchMedia(RM).matches;
export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const q = matchMedia(RM);
      q.addEventListener("change", cb);
      return () => q.removeEventListener("change", cb);
    },
    () => matchMedia(RM).matches,
    () => false,
  );
}

// So del joc, sintetitzat amb WebAudio: cap fitxer ni petició externa. Desactivat per defecte.
const SOUND_KEY = "esco-sound";
const soundListeners = new Set<() => void>();
let ctx: AudioContext | null = null;

const soundOn = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
};

export function useSound(): [boolean, () => void] {
  const on = useSyncExternalStore(
    (cb) => (soundListeners.add(cb), () => soundListeners.delete(cb)),
    soundOn,
    () => false,
  );
  const toggle = () => {
    try {
      localStorage.setItem(SOUND_KEY, on ? "0" : "1");
    } catch {}
    soundListeners.forEach((l) => l());
    if (!on) sfx.chime();
  };
  return [on, toggle];
}

function audio() {
  if (!soundOn()) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0, slide = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

function noise(dur: number, gain: number, from: number, to: number, delay = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  src.buffer = buf;
  f.type = "bandpass";
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  stamp: () => (tone(110, 0.18, "sine", 0.5, 0, -60), noise(0.08, 0.35, 1800, 400)),
  whoosh: () => noise(0.32, 0.22, 400, 3200),
  flip: () => noise(0.12, 0.18, 2400, 900),
  gavel: () => (tone(70, 0.4, "sine", 0.7, 0, -30), tone(900, 0.07, "square", 0.08), noise(0.1, 0.4, 3000, 700)),
  chime: () => (tone(880, 0.35, "sine", 0.18), tone(1320, 0.5, "sine", 0.14, 0.09)),
  tick: () => tone(1500, 0.04, "square", 0.04),
  reveal: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.6, "triangle", 0.12, i * 0.09)),
};
