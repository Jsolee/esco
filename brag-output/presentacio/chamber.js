// Hemicicle 3D d'Escó per al vídeo de presentació. Còpia de ../composition/chamber.js amb els moments d'aquest guió:
// cada vot encén el seu bloc d'escons, com a l'app. Cada fotograma és funció pura del temps.
import * as THREE from "three";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

// Mateix càlcul que lib/hemicycle.ts
function hemicycle(n = 350, rows = 10, inner = 0.42) {
  const radii = Array.from({ length: rows }, (_, i) => inner + ((1 - inner) * i) / (rows - 1));
  const total = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((n * r) / total));
  for (let i = rows - 1, rest = n - counts.reduce((a, b) => a + b, 0); rest > 0; i--, rest--) counts[i]++;
  const seats = [];
  radii.forEach((r, row) => {
    const k = counts[row];
    for (let j = 0; j < k; j++) {
      const a = Math.PI * (1 - j / (k - 1));
      seats.push({ x: r * Math.cos(a), y: r * Math.sin(a), a, row });
    }
  });
  return seats.sort((s, t) => t.a - s.a || s.row - t.row);
}
const SEATS = hemicycle();
const N = SEATS.length;
const FILL = SEATS.map((s, i) => ({ i, d: Math.abs(s.a - Math.PI / 2), row: s.row }))
  .sort((p, q) => p.d - q.d || p.row - q.row)
  .map((p) => p.i);
const RANK = [];
FILL.forEach((seat, k) => (RANK[seat] = k));
const YOU = SEATS.map((s, i) => [s, i])
  .filter(([s]) => Math.abs(s.a - Math.PI / 2) < 1e-6)
  .sort((a, b) => Math.abs(a[0].row - 6) - Math.abs(b[0].row - 6))[0][1];

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const R = 8;
const ROW_H = 0.21;
const ss = (t, a, d) => {
  const x = Math.min(Math.max((t - a) / d, 0), 1);
  return x * x * (3 - 2 * x);
};
const to = (v, target, k) => v + (target - v) * k;

// Esdeveniments del vídeo (segons): han de coincidir amb index.html
export const T = { lit: 0.45, wave: 2.4, votes: [6.12, 7.98, 9.84, 12.34], flick: 16.6, reveal: 17.6, end: 21.8 };
const BLOCK = 36; // escons per vot
const RED = 3; // el quart vot és una línia vermella

function litAt(i, t) {
  const r = RANK[i];
  let v = 0;
  v = to(v, 0.16, ss(t, T.wave + (r / N) * 1.5, 0.35));
  const k = Math.floor(r / BLOCK);
  if (k < T.votes.length) v = to(v, k === RED ? 1 : 0.8, ss(t, T.votes[k] + (r % BLOCK) * 0.012, 0.25));
  v = to(v, 1, ss(t, T.reveal + r * 0.003, 0.25));
  v = to(v, 0.2, ss(t, T.end, 0.9));
  if (i === YOU) v = Math.max(v, ss(t, T.lit, 0.12));
  return v;
}
function popAt(i, t) {
  const r = RANK[i];
  const times = [];
  if (i === YOU) times.push(T.lit);
  const k = Math.floor(r / BLOCK);
  if (k < T.votes.length) times.push(T.votes[k] + (r % BLOCK) * 0.012);
  times.push(T.reveal + r * 0.003);
  let last = -1;
  for (const p of times) if (t >= p) last = p;
  return last < 0 ? 0 : Math.exp(-6.5 * (t - last));
}
function rippleAt(t) {
  for (const rt of [T.reveal, T.votes[RED], T.lit]) if (t >= rt && t - rt < 14 / 9) return (t - rt) * 9;
  return -1;
}

const SEAT_VERT = `
  attribute float aLit; attribute float aPop; attribute float aNext; attribute float aPhase;
  uniform float uTime; uniform float uFlicker;
  varying vec3 vNormal; varying float vLit; varying float vFog;
  void main() {
    vec3 p = position * (1.0 + aPop * 0.55);
    p.y += aPop * 0.25;
    vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
    vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    float tw = uFlicker * (0.5 + 0.5 * sin(uTime * 7.0 + aPhase * 40.0));
    float beat = aNext * (0.22 + 0.2 * sin(uTime * 4.5 + aPhase));
    vLit = max(max(aLit, tw), beat) + aPop;
    vec4 mv = viewMatrix * wp;
    vFog = smoothstep(14.0, 34.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const SEAT_FRAG = `
  uniform vec3 uDim; uniform vec3 uChalk; uniform vec3 uLight; uniform float uExpo;
  varying vec3 vNormal; varying float vLit; varying float vFog;
  void main() {
    float diff = clamp(dot(normalize(vNormal), normalize(uLight)), 0.0, 1.0);
    float l = clamp(vLit, 0.0, 1.0);
    vec3 base = mix(uDim, uChalk, l);
    vec3 col = base * (0.42 + 0.58 * diff) + uChalk * max(vLit - 0.55, 0.0) * 0.8;
    col = mix(col, uDim * 0.4, vFog * 0.7);
    col *= mix(uExpo, 1.0, l);
    gl_FragColor = vec4(col, 1.0);
  }`;

export function createChamber(canvas, label) {
  const W = 1080;
  const H = 1920;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 90);

  const geo = new RoundedBoxGeometry(0.42, 0.34, 0.4, 2, 0.08);
  const aLit = new Float32Array(N);
  const aPop = new Float32Array(N);
  const aNext = new Float32Array(N);
  const aPhase = new Float32Array(N).map(() => rand());
  const attrs = {
    aLit: new THREE.InstancedBufferAttribute(aLit, 1),
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
      uExpo: { value: 1 },
      uDim: { value: new THREE.Vector3(0.17, 0.165, 0.155) },
      uChalk: { value: new THREE.Vector3(0.949, 0.945, 0.925) },
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

  const floorMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uRipple: { value: -1 } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
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

  const beamH = 14;
  const beamMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uK: { value: 1 } },
    vertexShader: `varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ vH = (position.y + ${(beamH / 2).toFixed(1)}) / ${beamH.toFixed(1)}; vec4 mv = modelViewMatrix * vec4(position,1.0);
      vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uK; varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ float c = clamp(abs(dot(vN, vV)), 0.0, 1.0); float edge = pow(1.0 - c, 1.6); float a = pow(vH, 1.4) * (1.0 - edge) * (1.0 - smoothstep(0.7, 1.0, vH)) * 0.075 * uK;
      gl_FragColor = vec4(vec3(1.0, 0.97, 0.9), a); }`,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 8.2, beamH, 64, 1, true), beamMat);
  beam.position.set(0, beamH / 2 - 0.3, -3.6);
  scene.add(beam);

  const DUST = 220;
  const dust0 = new Float32Array(DUST * 3);
  const dustPos = new Float32Array(DUST * 3);
  const dustAlpha = new Float32Array(DUST);
  const dustSize = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 7;
    dust0.set([Math.cos(a) * r, rand() * 10, -3.6 + Math.sin(a) * r], i * 3);
    dustAlpha[i] = 0.08 + rand() * 0.22;
    dustSize[i] = 1 + rand() * 1.6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("aAlpha", new THREE.BufferAttribute(dustAlpha, 1));
  dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dustSize, 1));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uScale: { value: 90 } },
      vertexShader: `attribute float aAlpha; attribute float aSize; uniform float uScale; varying float vAlpha;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; vAlpha = aAlpha; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vAlpha; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
        gl_FragColor = vec4(vec3(0.95, 0.94, 0.92), vAlpha * smoothstep(0.5, 0.0, d)); }`,
    }),
  );
  dust.frustumCulled = false;
  scene.add(dust);

  // Càmera: una línia de temps GSAP pausada sobre un objecte; render(t) hi fa seek.
  const rig = { px: 0, py: 2.9, pz: 0.6, lx: 0, ly: 0.05, lz: -6.45, fov: 38 };
  const cam = gsap.timeline({ paused: true });
  const go = (at, dur, ease, v) => cam.to(rig, { ...v, duration: dur, ease }, at);
  go(0, 2.4, "sine.inOut", { py: 2.6, pz: -0.8 });
  go(2.4, 2.0, "power3.inOut", { px: 0, py: 15, pz: 20, lx: 0, ly: -2.6, lz: -3.6, fov: 56 });
  go(4.4, 1.3, "power2.inOut", { py: 8.6, pz: 13.2, ly: -3.4, lz: -3.4, fov: 54 });
  go(13.0, 2.2, "power2.inOut", { px: -6.5, py: 3.4, pz: 7.5, lx: 0, ly: 0.6, lz: -5, fov: 50 });
  go(16.2, 1.3, "power3.inOut", { px: 0, py: 30, pz: 0.8, lx: 0, ly: 0, lz: -0.2, fov: 56 });
  go(19.5, 1.6, "power2.inOut", { py: 10.5, pz: 11.5, ly: 0.4, lz: -4, fov: 54 });
  go(21.7, 2.0, "power3.inOut", { py: 11, pz: 16, ly: -1.6, lz: -4, fov: 56 });
  go(23.7, 2.3, "sine.inOut", { py: 10.2, pz: 14.6 });

  const v = new THREE.Vector3();
  function render(t) {
    cam.seek(Math.max(0, t));
    for (let i = 0; i < N; i++) {
      aLit[i] = litAt(i, t);
      aPop[i] = popAt(i, t);
      aNext[i] = i === YOU && t >= T.lit ? 1.4 : 0;
    }
    attrs.aLit.needsUpdate = attrs.aPop.needsUpdate = attrs.aNext.needsUpdate = true;
    seatMat.uniforms.uTime.value = t;
    seatMat.uniforms.uFlicker.value = ss(t, T.flick, 0.2) * (1 - ss(t, T.reveal, 0.15));
    seatMat.uniforms.uExpo.value = 0.3 + 0.7 * ss(t, 2.2, 1.4);
    floorMat.uniforms.uRipple.value = rippleAt(t);
    beamMat.uniforms.uK.value = 0.7 + 0.3 * ss(t, 2.4, 1) + 1.2 * ss(t, T.reveal, 0.2) * (1 - ss(t, T.end, 1));
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = dust0[i * 3];
      dustPos[i * 3 + 1] = (dust0[i * 3 + 1] + t * 0.12) % 10;
      dustPos[i * 3 + 2] = dust0[i * 3 + 2];
    }
    dustGeo.attributes.position.needsUpdate = true;

    camera.fov = rig.fov;
    camera.updateProjectionMatrix();
    camera.position.set(rig.px + Math.sin(t * 0.31) * 0.35, rig.py + Math.sin(t * 0.47) * 0.08, rig.pz);
    camera.lookAt(rig.lx, rig.ly, rig.lz);
    renderer.render(scene, camera);

    if (label) {
      v.copy(pos[YOU]).setY(pos[YOU].y + 0.4).project(camera);
      label.style.transform = `translate(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * H}px) translate(-50%, -100%)`;
    }
  }

  return {
    render,
    dispose() {
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose?.();
      });
      renderer.dispose();
    },
  };
}
