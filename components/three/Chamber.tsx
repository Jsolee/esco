"use client";

import { gsap } from "gsap";
import { useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RANK, SEATS } from "@/lib/hemicycle";

export type ChamberMode = "idle" | "play" | "count" | "reveal";
export type ChamberHandle = {
  pulse: (seats: number[]) => void; // els seients s'encenen amb un cop de llum i una ona a terra
  shake: (strength?: number) => void;
  burst: (color: string) => void; // esclat de partícules (només als resultats)
};
export type ChamberProps = {
  handle?: React.Ref<ChamberHandle>; // no es diu `ref` perquè ha de travessar next/dynamic
  mode: ChamberMode;
  from?: ChamberMode; // posició de càmera inicial
  lit?: number[]; // brillantor 0..1 per seient (índex de SEATS)
  next?: number[]; // seients que bateguen (la votació actual)
  colors?: (string | undefined)[]; // color per seient; si no n'hi ha, guix
  you?: number;
  youLabel?: string;
  reduced?: boolean;
  onFail?: () => void;
  onReady?: () => void;
  className?: string;
};

const N = SEATS.length;
const R = 8;
const ROW_H = 0.21;
const CHALK = "#f2f1ec";
const DIM = [0.17, 0.165, 0.155];

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// On mira la càmera en cada fase.
const RIG: Record<ChamberMode, { p: [number, number, number]; l: [number, number, number] }> = {
  idle: { p: [0, 9.5, 17], l: [0, -0.6, -4.2] },
  play: { p: [0, 8.6, 13.2], l: [0, -3.4, -3.4] },
  count: { p: [0, 17.5, 3.4], l: [0, 0, -3.6] },
  reveal: { p: [0, 10.5, 11.5], l: [0, 0.4, -4] },
};

const SEAT_VERT = /* glsl */ `
  attribute float aLit; attribute vec3 aColor; attribute float aPop; attribute float aNext; attribute float aPhase;
  uniform float uTime; uniform float uFlicker;
  varying vec3 vNormal; varying float vLit; varying vec3 vColor; varying float vFog;
  void main() {
    vec3 p = position * (1.0 + aPop * 0.55);
    p.y += aPop * 0.25;
    vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
    vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    float tw = uFlicker * (0.5 + 0.5 * sin(uTime * 7.0 + aPhase * 40.0));
    float beat = aNext * (0.22 + 0.2 * sin(uTime * 4.5 + aPhase));
    vLit = max(max(aLit, tw), beat) + aPop;
    vColor = aColor;
    vec4 mv = viewMatrix * wp;
    vFog = smoothstep(14.0, 30.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const SEAT_FRAG = /* glsl */ `
  uniform vec3 uDim; uniform vec3 uLight;
  varying vec3 vNormal; varying float vLit; varying vec3 vColor; varying float vFog;
  void main() {
    float diff = max(dot(normalize(vNormal), normalize(uLight)), 0.0);
    float l = clamp(vLit, 0.0, 1.0);
    vec3 base = mix(uDim, vColor, l);
    vec3 col = base * (0.42 + 0.58 * diff) + vColor * max(vLit - 0.55, 0.0) * 0.8;
    col = mix(col, uDim * 0.4, vFog * 0.7);
    gl_FragColor = vec4(col, 1.0);
  }`;
const POINT_VERT = /* glsl */ `
  attribute float aAlpha; attribute float aSize; uniform float uScale;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * mv;
  }`;
const POINT_FRAG = /* glsl */ `
  uniform vec3 uColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.0, d));
  }`;

export default function Chamber({ handle, mode, from, lit, next, colors, you, youLabel, reduced, onFail, onReady, className = "" }: ChamberProps) {
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const api = useRef<ChamberHandle & { setMode: (m: ChamberMode) => void; setTargets: () => void } | null>(null);
  const props = useRef({ lit, next, colors, you, reduced });
  useLayoutEffect(() => {
    props.current = { lit, next, colors, you, reduced };
  });

  useImperativeHandle(handle, () => ({
    pulse: (s) => api.current?.pulse(s),
    shake: (k) => api.current?.shake(k),
    burst: (c) => api.current?.burst(c),
  }));

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onFail?.();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.prepend(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
    const start = RIG[from ?? mode];
    const rig = { px: start.p[0], py: start.p[1], pz: start.p[2], lx: start.l[0], ly: start.l[1], lz: start.l[2] };

    // Seients: una sola malla instanciada (una crida de dibuix per als 350 escons).
    const geo = new RoundedBoxGeometry(0.42, 0.34, 0.4, 2, 0.08);
    const aLit = new Float32Array(N);
    const aColor = new Float32Array(N * 3);
    const aPop = new Float32Array(N);
    const aNext = new Float32Array(N);
    const aPhase = new Float32Array(N);
    const chalk = rgb(CHALK);
    for (let i = 0; i < N; i++) {
      aColor.set(chalk, i * 3);
      aPhase[i] = Math.random();
    }
    const attrs = {
      aLit: new THREE.InstancedBufferAttribute(aLit, 1),
      aColor: new THREE.InstancedBufferAttribute(aColor, 3),
      aPop: new THREE.InstancedBufferAttribute(aPop, 1),
      aNext: new THREE.InstancedBufferAttribute(aNext, 1),
      aPhase: new THREE.InstancedBufferAttribute(aPhase, 1),
    };
    for (const [k, v] of Object.entries(attrs)) geo.setAttribute(k, v);
    const seatMat = new THREE.ShaderMaterial({
      vertexShader: SEAT_VERT,
      fragmentShader: SEAT_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFlicker: { value: 0 },
        uDim: { value: new THREE.Vector3(...DIM) },
        uLight: { value: new THREE.Vector3(0.2, 1, 0.6) },
      },
    });
    const seats = new THREE.InstancedMesh(geo, seatMat, N);
    const dummy = new THREE.Object3D();
    const pos = SEATS.map((s) => new THREE.Vector3(s.x * R, s.row * ROW_H, -s.y * R));
    pos.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.lookAt(0, p.y, 0.8);
      dummy.updateMatrix();
      seats.setMatrixAt(i, dummy.matrix);
    });
    scene.add(seats);

    // Terra: anells concèntrics com els graons del ple.
    const floorMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uRipple: { value: -1 } },
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uRipple; varying vec2 vP;
        void main(){
          float r = length(vP);
          float ring = smoothstep(0.03, 0.0, abs(fract(r / 0.515) - 0.5) - 0.47);
          float fade = smoothstep(14.0, 2.0, r);
          float rip = uRipple < 0.0 ? 0.0 : smoothstep(0.35, 0.0, abs(r - uRipple)) * (1.0 - uRipple / 14.0);
          float a = (ring * 0.07 + 0.025) * fade + rip * 0.55;
          gl_FragColor = vec4(vec3(0.95, 0.94, 0.9), a);
        }`,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(15, 128), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.26, 0);
    scene.add(floor);

    const podium = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.5, 0.9, 2, 0.1), new THREE.MeshBasicMaterial({ color: 0x1c1b19 }));
    podium.position.set(0, 0, 1.9);
    scene.add(podium);

    // Feix de llum des del sostre i pols que hi sura.
    const beamH = 14;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 8.2, beamH, 64, 1, true),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uK: { value: 1 } },
        vertexShader: `varying float vH; varying vec3 vN; varying vec3 vV;
          void main(){ vH = (position.y + ${(beamH / 2).toFixed(1)}) / ${beamH.toFixed(1)}; vec4 mv = modelViewMatrix * vec4(position,1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uK; varying float vH; varying vec3 vN; varying vec3 vV;
          void main(){ float edge = pow(1.0 - abs(dot(vN, vV)), 1.6); float a = pow(vH, 1.4) * (1.0 - edge) * 0.075 * uK;
          gl_FragColor = vec4(vec3(1.0, 0.97, 0.9), a); }`,
      }),
    );
    beam.position.set(0, beamH / 2 - 0.3, -3.6);
    scene.add(beam);

    const pointMat = (color: string, scale: number) =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Vector3(...rgb(color)) }, uScale: { value: scale } },
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
      });
    const DUST = 180;
    const dustPos = new Float32Array(DUST * 3);
    const dustAlpha = new Float32Array(DUST);
    const dustSize = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 6.5;
      dustPos.set([Math.cos(a) * r, Math.random() * 10, -3.6 + Math.sin(a) * r], i * 3);
      dustAlpha[i] = 0.08 + Math.random() * 0.22;
      dustSize[i] = 1 + Math.random() * 1.6;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("aAlpha", new THREE.BufferAttribute(dustAlpha, 1));
    dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dustSize, 1));
    const dust = new THREE.Points(dustGeo, pointMat(CHALK, 60));
    scene.add(dust);

    // Esclat de partícules dels resultats.
    const BURST = 420;
    const bPos = new Float32Array(BURST * 3);
    const bVel = new Float32Array(BURST * 3);
    const bAlpha = new Float32Array(BURST);
    const bSize = new Float32Array(BURST).map(() => 2 + Math.random() * 4);
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
    bGeo.setAttribute("aAlpha", new THREE.BufferAttribute(bAlpha, 1));
    bGeo.setAttribute("aSize", new THREE.BufferAttribute(bSize, 1));
    const bMat = pointMat(CHALK, 70);
    const burstPts = new THREE.Points(bGeo, bMat);
    burstPts.frustumCulled = false;
    scene.add(burstPts);
    let burstLife = 0;

    // Estat animat: brillantor i color actuals que persegueixen els objectius, amb retard per seient.
    const tLit = new Float32Array(N);
    const tColor = new Float32Array(aColor);
    const startAt = new Float64Array(N);
    const popAt = new Float64Array(N).fill(Infinity);
    let shake = 0;
    let ripple = -1;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    // Amb moviment reduït l'escena és quieta: només es redibuixa uns quants fotogrames després de cada canvi.
    let wake = 2;

    function setTargets() {
      const { lit: l, next: nx, colors: c } = props.current;
      const now = performance.now();
      const changed: number[] = [];
      for (let i = 0; i < N; i++) {
        const v = l?.[i] ?? 0.12;
        const col = rgb(c?.[i] ?? CHALK);
        const colorChanged = col[0] !== tColor[i * 3] || col[1] !== tColor[i * 3 + 1] || col[2] !== tColor[i * 3 + 2];
        if (v !== tLit[i] || colorChanged) changed.push(i);
        tLit[i] = v;
        tColor.set(col, i * 3);
        aNext[i] = 0;
      }
      wake = 2;
      nx?.forEach((i) => (aNext[i] = 1));
      if (props.current.you !== undefined) aNext[props.current.you] = 1.4;
      attrs.aNext.needsUpdate = true;
      // Les onades de color van d'esquerra a dreta; les de llum, des del passadís central.
      const colorWave = c !== undefined;
      changed
        .sort((a, b) => (colorWave ? a - b : RANK[a] - RANK[b]))
        .forEach((i, k) => (startAt[i] = props.current.reduced ? now : now + k * (colorWave ? 5 : 18)));
    }

    function setMode(m: ChamberMode) {
      const t = RIG[m];
      wake = 2;
      seatMat.uniforms.uFlicker.value = m === "count" ? 1 : m === "idle" ? 0.12 : 0;
      gsap.to(rig, {
        px: t.p[0], py: t.p[1], pz: t.p[2], lx: t.l[0], ly: t.l[1], lz: t.l[2],
        duration: props.current.reduced ? 0 : m === "count" ? 2.6 : 2.2,
        ease: "power3.inOut",
      });
    }

    api.current = {
      setTargets,
      setMode,
      pulse(list) {
        if (props.current.reduced) return; // sense salt d'escons: l'encesa ja marca el vot
        const now = performance.now();
        list.forEach((i, k) => (popAt[i] = now + k * 26));
        if (!props.current.reduced) ripple = 0;
      },
      shake(k = 1) {
        if (!props.current.reduced) shake = Math.max(shake, 0.18 * k);
      },
      burst(color) {
        if (props.current.reduced) return;
        bMat.uniforms.uColor.value.set(...rgb(color));
        for (let i = 0; i < BURST; i++) {
          bPos.set([(Math.random() - 0.5) * 0.8, 0.8, -3.6 + (Math.random() - 0.5) * 0.8], i * 3);
          const a = Math.random() * Math.PI * 2;
          const sp = 2 + Math.random() * 6;
          bVel.set([Math.cos(a) * sp * 0.8, 5 + Math.random() * 8, Math.sin(a) * sp * 0.8], i * 3);
          bAlpha[i] = 1;
        }
        burstLife = 1;
      },
    };
    setTargets();
    for (let i = 0; i < N; i++) {
      aLit[i] = tLit[i];
      aColor.set(tColor.subarray(i * 3, i * 3 + 3), i * 3);
    }
    setMode(mode);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      // En pantalles verticals obrim el pla perquè hi càpiga tot l'hemicicle i el pugem cap a dalt,
      // que és on queda lliure de textos i cartes.
      const portrait = camera.aspect < 0.8;
      camera.fov = portrait ? 54 : camera.aspect < 1.2 ? 46 : 36;
      if (portrait) camera.setViewOffset(w, h, 0, h * 0.2, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      wake = 2;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const v = new THREE.Vector3();
    let raf = 0;
    let ready = false;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const still = props.current.reduced;
      if (still && ready && wake <= 0) return;
      wake--;
      const t = still ? 0 : now / 1000;
      seatMat.uniforms.uTime.value = t;

      // Persegueix els objectius i, quan s'hi arriba, s'hi enganxa: així només es pugen atributs si alguna cosa es mou.
      const ease = (a: number, b: number, k: number) => (Math.abs(b - a) < 1e-3 ? b : a + (b - a) * k);
      let moving = false;
      for (let i = 0; i < N; i++) {
        if (now >= startAt[i]) {
          if (aLit[i] !== tLit[i]) {
            aLit[i] = ease(aLit[i], tLit[i], still ? 1 : 0.14);
            moving = true;
          }
          for (let c = 0; c < 3; c++) {
            const j = i * 3 + c;
            if (aColor[j] !== tColor[j]) {
              aColor[j] = ease(aColor[j], tColor[j], still ? 1 : 0.12);
              moving = true;
            }
          }
        }
        if (now >= popAt[i]) {
          aPop[i] = 1;
          popAt[i] = Infinity;
          moving = true;
        } else if (aPop[i] !== 0) {
          aPop[i] = aPop[i] < 1e-3 ? 0 : aPop[i] * 0.9;
          moving = true;
        }
      }
      if (moving) attrs.aLit.needsUpdate = attrs.aColor.needsUpdate = attrs.aPop.needsUpdate = true;
      if (moving && still) wake = Math.max(wake, 1);

      if (ripple >= 0) {
        ripple += dt * 9;
        if (ripple > 14) ripple = -1;
      }
      floorMat.uniforms.uRipple.value = ripple;

      for (let i = 0; i < DUST; i++) {
        dustPos[i * 3 + 1] += dt * 0.12;
        if (dustPos[i * 3 + 1] > 10) dustPos[i * 3 + 1] = 0;
      }
      dustGeo.attributes.position.needsUpdate = !still;

      if (burstLife > 0) {
        burstLife -= dt * 0.45;
        for (let i = 0; i < BURST; i++) {
          bVel[i * 3 + 1] -= 9 * dt;
          for (let c = 0; c < 3; c++) bPos[i * 3 + c] += bVel[i * 3 + c] * dt;
          bAlpha[i] = Math.max(0, burstLife);
        }
        bGeo.attributes.position.needsUpdate = bGeo.attributes.aAlpha.needsUpdate = true;
      }

      pointer.sx += (pointer.x - pointer.sx) * 0.04;
      pointer.sy += (pointer.y - pointer.sy) * 0.04;
      shake *= 0.86;
      const sway = still ? 0 : 1;
      camera.position.set(
        rig.px + Math.sin(t * 0.13) * 0.7 * sway + pointer.sx * 0.9 * sway + (Math.random() - 0.5) * shake,
        rig.py + Math.sin(t * 0.21) * 0.15 * sway - pointer.sy * 0.4 * sway + (Math.random() - 0.5) * shake,
        rig.pz,
      );
      camera.lookAt(rig.lx, rig.ly, rig.lz);
      renderer.render(scene, camera);
      if (!ready) {
        ready = true;
        onReady?.();
      }

      const you = props.current.you;
      if (label.current && you !== undefined) {
        v.copy(pos[you]).setY(pos[you].y + 0.45).project(camera);
        label.current.style.transform = `translate(${((v.x + 1) / 2) * el.clientWidth}px, ${((1 - v.y) / 2) * el.clientHeight}px) translate(-50%, -100%)`;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onPointer);
      gsap.killTweensOf(rig);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      api.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- l'escena es crea un sol cop; els canvis arriben per les refs

  useEffect(() => api.current?.setTargets(), [lit, next, colors, you]);
  useEffect(() => api.current?.setMode(mode), [mode]);

  return (
    <div ref={host} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {youLabel && (
        <span
          ref={label}
          className="kicker absolute left-0 top-0 whitespace-nowrap rounded-full border border-chalk-3/60 bg-stage/70 px-3 py-1.5 text-[0.66rem] text-chalk backdrop-blur-sm will-change-transform"
        >
          {youLabel}
        </span>
      )}
    </div>
  );
}
