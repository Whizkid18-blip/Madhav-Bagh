/* ─────────────────────────────────────────────
   MADHAV BAGH
   Real photographs of the mansion crossfade as
   you scroll, graded through a full day, with a
   WebGL layer of dust, embers and fireflies.
   ───────────────────────────────────────────── */

import * as THREE from "./vendor/three.module.js";

const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (t) => t * t * (3 - 2 * t);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 760px)").matches;

/* ── palette journey ─────────────────────────
   bg = sky/fog · arch = stone · ink = text ·
   accent = embers/fireflies · fogFar = air   */

const P = (bg, ink, accent, tint, photo) => ({
  bg: new THREE.Color(bg),
  ink: new THREE.Color(ink),
  accent: new THREE.Color(accent),
  tint,
  photo,
});

const PALETTES = {
  hero:      P("#0e0b1f", "#f2ecdc", "#d9a441", 0.50, "hero"),
  dawn:      P("#2c1014", "#f5e9d7", "#e2a43e", 0.48, "facade-red"),
  courtyard: P("#f2e9d6", "#2a1810", "#8a3210", 0.42, "courtyard"),
  family:    P("#382214", "#f6ead2", "#e8b54a", 0.46, "veranda"),
  stella:    P("#7c4e16", "#fff3da", "#ffd479", 0.42, "stella"),
  rasoi:     P("#29101e", "#f3e3d3", "#d98e4a", 0.46, "dinner-lanterns"),
  sapphire:  P("#10294a", "#e9f0fa", "#8db8ff", 0.22, "room-sapphire"),
  turquoise: P("#0c403d", "#e7f6f1", "#66d9c2", 0.20, "room-turquoise"),
  coral:     P("#9c4630", "#fff0e6", "#ffc09e", 0.22, "room-coral"),
  ruby:      P("#4e1420", "#fbe7e4", "#ff8d7a", 0.22, "room-ruby"),
  garden:    P("#0b1b11", "#e8f0dd", "#c4e970", 0.45, "night-garden"),
  finale:    P("#070b16", "#ece7d8", "#ffd479", 0.42, "night-palace"),
};

/* ── renderer ────────────────────────────── */

const canvas = document.getElementById("scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); /* the photographs show through */
  /* if the phone's GPU drops the context under pressure, bow out quietly:
     the photographs carry the page on their own */
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    canvas.style.display = "none";
  });
} catch (e) {
  document.body.classList.add("no-webgl");
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1600);
camera.position.set(0, 4.7, 14);

/* ── the walk, camera path through the particle field ── */

const CAM_START = 14;
const CAM_END = -510;

/* ── particles: dust, embers, fireflies ──── */

const particleVert = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPx;
  uniform float uAmp;
  uniform float uFadeNear;
  uniform float uFadeFar;
  varying float vA;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.26 + aSeed * 9.0) * uAmp;
    p.y += sin(uTime * 0.21 + aSeed * 17.0) * uAmp * 1.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = -mv.z;
    float fade = smoothstep(uFadeFar, uFadeNear, d) * smoothstep(2.0, 9.0, d);
    float tw = 0.45 + 0.55 * sin(uTime * (0.5 + fract(aSeed) * 1.7) + aSeed * 40.0);
    vA = fade * tw;
    gl_PointSize = aSize * uPx * (160.0 / max(d, 0.1));
    gl_Position = projectionMatrix * mv;
  }
`;

const particleFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d) * vA * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

function makePoints(count, span, sizeMin, sizeMax, amp, fadeNear, fadeFar, color) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = lerp(span.x[0], span.x[1], Math.random());
    pos[i * 3 + 1] = lerp(span.y[0], span.y[1], Math.random());
    pos[i * 3 + 2] = lerp(span.z[0], span.z[1], Math.random());
    seed[i] = Math.random() * 100;
    size[i] = lerp(sizeMin, sizeMax, Math.random());
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    uniforms: {
      uTime: { value: 0 },
      uPx: { value: 1 },
      uAmp: { value: amp },
      uFadeNear: { value: fadeNear },
      uFadeFar: { value: fadeFar },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  return points;
}

const dust = makePoints(
  mobile ? 260 : 900,
  { x: [-22, 22], y: [0.5, 17], z: [22, CAM_END - 130] },
  0.5, 1.8, 1.4, 26, 150, "#d9a441"
);

const stars = makePoints(
  mobile ? 240 : 700,
  { x: [-450, 450], y: [15, 320], z: [CAM_END - 480, CAM_END + 60] },
  0.7, 1.7, 0.15, 220, 1300, "#ffe9c4"
);
stars.material.uniforms.uOpacity.value = 0;

/* ── scroll → palette stops ──────────────── */

let stops = [];
let vh = innerHeight;
let scrollMax = 1;
let parallaxItems = [];
let snapPoints = []; /* each chapter's ideal, fully-framed scroll position */

function measure() {
  vh = innerHeight;
  const docH = document.documentElement.scrollHeight;
  scrollMax = Math.max(1, docH - vh);

  stops = $$("[data-stop]").map((el) => ({
    p: clamp01((el.offsetTop + el.offsetHeight * 0.5 - vh * 0.5) / scrollMax),
    pal: PALETTES[el.dataset.stop],
  }));
  stops.sort((a, b) => a.p - b.p);
  if (stops.length) {
    stops[0] = { p: 0, pal: stops[0].pal };
    stops.push({ p: 1.01, pal: stops[stops.length - 1].pal });
  }

  parallaxItems = $$("[data-parallax]").map((el) => {
    const sec = el.closest(".chapter");
    return { el, top: sec.offsetTop, h: sec.offsetHeight };
  });

  /* the gates, then the middle of each chapter's sticky dwell */
  snapPoints = [0].concat(
    $$(".chapter").map((el) =>
      Math.round(el.offsetTop + Math.max(0, el.offsetHeight - vh) * 0.5)
    )
  );

  if (navTargets.length) refreshNavTops();
}

const live = {
  bg: new THREE.Color(),
  ink: new THREE.Color(),
  accent: new THREE.Color(),
  tint: 0.45,
};

/* the rooms of the palace, one photograph per chapter */
const photoEls = {};
$$(".photo").forEach((el) => (photoEls[el.dataset.photo] = el));
const photoOpacity = {};
Object.keys(photoEls).forEach((k) => (photoOpacity[k] = 0));

function samplePalette(p) {
  if (!stops.length) return;
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1].p) i++;
  const a = stops[i], b = stops[i + 1];
  const t = smoothstep(clamp01((p - a.p) / Math.max(1e-5, b.p - a.p)));
  live.bg.lerpColors(a.pal.bg, b.pal.bg, t);
  live.ink.lerpColors(a.pal.ink, b.pal.ink, t);
  live.accent.lerpColors(a.pal.accent, b.pal.accent, t);
  live.tint = lerp(a.pal.tint, b.pal.tint, t);

  /* crossfade the photographs of the two surrounding chapters.
     The swap happens decisively across the middle of the transition
     instead of dragging over the whole scroll distance */
  for (const k in photoOpacity) photoOpacity[k] = 0;
  if (a.pal.photo === b.pal.photo) {
    photoOpacity[a.pal.photo] = 1;
  } else {
    const pt = smoothstep(clamp01((t - 0.28) / 0.44));
    photoOpacity[a.pal.photo] = 1 - pt;
    photoOpacity[b.pal.photo] = pt;
    /* warm the incoming photo early so its decode never lands mid-fade */
    const nb = photoEls[b.pal.photo];
    if (nb && !nb.__warm && t > 0.04) {
      nb.__warm = true;
      if (nb.decode) nb.decode().catch(() => {});
    }
  }
}

function applyPhotos(time) {
  for (const k in photoEls) {
    const el = photoEls[k];
    const op = photoOpacity[k];
    const prev = parseFloat(el.style.opacity || 0);
    if (op === 0 && prev === 0) continue;
    el.style.opacity = op.toFixed(3);
    /* promote only the photos actually on screen to their own GPU layer
       (smooth fades); hide and demote the rest (no phone memory blowout) */
    if (op === 0) {
      el.style.visibility = "hidden";
      el.style.willChange = "auto";
      el.__warm = false;
    } else if (prev === 0) {
      el.style.visibility = "visible";
      el.style.willChange = "opacity, transform";
    }
    /* slow breath + a pull of depth as a room recedes */
    const scale = 1.06 + (1 - op) * 0.06 + Math.sin(time * 0.05) * 0.004;
    const rise = (1 - op) * 1.6;
    el.style.transform = `translate3d(0, ${rise.toFixed(2)}vh, 0) scale(${scale.toFixed(4)})`;
  }
}

/* ── DOM choreography ────────────────────── */

function splitLetters(root) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent) {
          const span = document.createElement("span");
          if (ch.trim() === "") {
            span.className = "sp";
            span.textContent = ch;
          } else {
            span.className = "ch";
            span.style.setProperty("--i", i++);
            span.textContent = ch;
          }
          frag.appendChild(span);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(root);
}

$$("[data-split]").forEach(splitLetters);

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        observer.unobserve(e.target);
      }
    }),
  { threshold: 0.35 }
);
$$(".panel").forEach((p) => observer.observe(p));

const progressBar = document.getElementById("progressBar");
const tintEl = document.querySelector(".photo-tint");
const rootStyle = document.documentElement.style;

/* ── input ───────────────────────────────── */

/* the journey begins at the gates on a fresh visit, but an unexpected
   reload (tab crash, pull-to-refresh, back button) resumes where you were */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

let saveTimer = null;
addEventListener("scroll", () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { sessionStorage.setItem("mb-y", String(Math.round(scrollY))); } catch (e) {}
  }, 200);
}, { passive: true });

function resumePosition() {
  let savedY = NaN;
  try { savedY = parseInt(sessionStorage.getItem("mb-y") || "", 10); } catch (e) {}
  const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  const freshVisit = nav ? nav.type === "navigate" : true;
  if (!freshVisit && Number.isFinite(savedY) && savedY > vh * 0.5) return savedY;
  return 0;
}

let scrollTarget = scrollY;
let scrollCur = scrollY;
addEventListener("scroll", () => (scrollTarget = scrollY), { passive: true });

const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
if (!reduced && !mobile) {
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  });
}

addEventListener("resize", () => {
  measure();
  if (!renderer) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  /* the canvas only draws soft particles; phones don't need full retina for it */
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 2));
});

/* ── smooth in-page navigation (eased, cancellable) ── */

let scrollAnim = null;
function cancelScrollAnim() {
  if (scrollAnim) { cancelAnimationFrame(scrollAnim); scrollAnim = null; }
}

function tweenTo(dest, durOverride) {
  const max = document.documentElement.scrollHeight - innerHeight;
  dest = Math.max(0, Math.min(dest, max));
  if (reduced) { scrollTo(0, dest); return; }
  cancelScrollAnim();
  const startY = scrollY;
  const dist = dest - startY;
  if (Math.abs(dist) < 2) return;
  const dur = durOverride || Math.min(1500, 420 + Math.abs(dist) * 0.32);
  const t0 = performance.now();
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2); /* easeInOutCubic */
  function step(now) {
    const k = Math.min(1, (now - t0) / dur);
    scrollTo(0, startY + dist * ease(k));
    scrollAnim = k < 1 ? requestAnimationFrame(step) : null;
  }
  scrollAnim = requestAnimationFrame(step);
}

function smoothTo(target) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  let dest = el.offsetTop;
  /* land chapters on their ideal frame, not their raw top edge */
  if (el.classList && el.classList.contains("chapter")) {
    dest += Math.max(0, el.offsetHeight - vh) * 0.5;
  }
  tweenTo(dest);
}

/* hand control back the instant the visitor scrolls themselves */
["wheel", "touchstart", "keydown"].forEach((ev) =>
  addEventListener(ev, cancelScrollAnim, { passive: true })
);

/* gentle inertia for classic notched mouse wheels (the steppy ones).
   Trackpads (pixel-precise), touch, and keyboard are left completely native. */
let wheelTarget = scrollY;
let wheelActive = false;
if (!reduced && !mobile && matchMedia("(pointer: fine)").matches) {
  addEventListener("scroll", () => { if (!wheelActive) wheelTarget = scrollY; }, { passive: true });
  addEventListener("keydown", () => { wheelActive = false; }, { passive: true });
  addEventListener("touchstart", () => { wheelActive = false; }, { passive: true });
  addEventListener("wheel", (e) => {
    if (e.ctrlKey) return; /* pinch-zoom stays native */
    /* notched mouse wheels: line-mode (Firefox) or large integer pixel
       deltas (Chrome/Edge on Windows). Precision trackpads send small
       fractional deltas and are already smooth, so they stay native. */
    const lines = e.deltaMode === 1;
    const notched = lines || (Math.abs(e.deltaY) >= 80 && Number.isInteger(e.deltaY));
    if (!notched) return;
    e.preventDefault();
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    wheelTarget = Math.max(0, Math.min(max, wheelTarget + (lines ? e.deltaY * 16 : e.deltaY)));
    wheelActive = true;
  }, { passive: false });
}

/* Scrolling is always the visitor's own: no auto-settle, no snapping.
   The nav dots still land each chapter on its ideal frame when clicked
   (snapPoints feeds smoothTo), but free scrolling is never interfered with. */

/* in-page anchor links glide instead of jumping */
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute("href");
  if (href.length < 2 || !document.querySelector(href)) return;
  e.preventDefault();
  smoothTo(href);
});

/* ── chapter navigation rail ──────────────── */

const NAV = [
  ["top", "Arrival"], ["heritage", "1892"], ["courtyard", "Morning"],
  ["family", "Home"], ["stella", "Stella & Zephyr"], ["table", "The Table"],
  ["sapphire", "Sapphire"], ["turquoise", "Turquoise"], ["coral", "Coral"],
  ["ruby", "Ruby"], ["garden", "Garden"], ["stay", "Stay"],
];
const navButtons = [];
const navTargets = [];
let navTops = []; /* cached: reading offsetTop every frame forces layout */
let navActive = -1;

function refreshNavTops() {
  navTops = navTargets.map((el) => el.offsetTop);
}

function buildNav() {
  if (mobile) return;
  const rail = document.createElement("nav");
  rail.className = "dotnav";
  rail.setAttribute("aria-label", "Chapters");
  for (const [id, label] of NAV) {
    const el = document.getElementById(id);
    if (!el) continue;
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.innerHTML = '<span class="lbl"></span><span class="dot"></span>';
    b.querySelector(".lbl").textContent = label;
    b.addEventListener("click", () => smoothTo(el));
    rail.appendChild(b);
    navButtons.push(b);
    navTargets.push(el);
  }
  document.body.appendChild(rail);
  refreshNavTops();
}

function updateNav() {
  if (!navTops.length) return;
  const probe = scrollCur + vh * 0.5;
  let idx = 0;
  for (let i = 0; i < navTops.length; i++) {
    if (navTops[i] <= probe) idx = i;
  }
  if (idx !== navActive) {
    navButtons[navActive]?.classList.remove("on");
    navButtons[idx]?.classList.add("on");
    navActive = idx;
  }
}

/* ── the walk ────────────────────────────── */

let lastInk = "", lastAccent = "", lastBg = "";
let lastVarWrite = 0;
const clock = new THREE.Clock();

/* time-based smoothing: identical feel at 60Hz, 120Hz, or a struggling 30fps */
let prevFrameTime = 0;
const smooth = (k, dt) => 1 - Math.exp(-k * dt);

function frame(now) {
  requestAnimationFrame(frame);
  now = now || performance.now();
  const dt = Math.min(0.05, prevFrameTime ? (now - prevFrameTime) / 1000 : 1 / 60);
  prevFrameTime = now;

  /* ease the page toward the mouse-wheel target (native scroll otherwise) */
  if (wheelActive) {
    if (Math.abs(wheelTarget - scrollY) < 0.6) { scrollTo(0, wheelTarget); wheelActive = false; }
    else scrollTo(0, scrollY + (wheelTarget - scrollY) * smooth(11, dt));
  }

  const t = clock.getElapsedTime();

  scrollCur += (scrollTarget - scrollCur) * (reduced ? 1 : smooth(9, dt));
  const p = clamp01(scrollCur / scrollMax);

  samplePalette(p);

  /* css variables follow the world. Writing them re-styles the whole
     document (color-mix, text shadows), so update at ~12Hz: plenty for
     slow ambient colour drift, a fraction of the style/paint cost */
  if (now - lastVarWrite > 80) {
    lastVarWrite = now;
    const inkHex = "#" + live.ink.getHexString();
    const accentHex = "#" + live.accent.getHexString();
    const bgHex = "#" + live.bg.getHexString();
    if (inkHex !== lastInk) { rootStyle.setProperty("--ink", inkHex); lastInk = inkHex; }
    if (accentHex !== lastAccent) { rootStyle.setProperty("--accent", accentHex); lastAccent = accentHex; }
    if (bgHex !== lastBg) { rootStyle.setProperty("--bg", bgHex); lastBg = bgHex; }
    if (tintEl) tintEl.style.opacity = live.tint.toFixed(3);
  }

  if (progressBar) progressBar.style.transform = `scaleY(${p})`;
  applyPhotos(t);
  updateNav();

  /* big words drift slower than the world, for depth.
     Only write styles for the one or two actually moving on screen */
  if (!reduced) {
    for (const it of parallaxItems) {
      const prog = clamp01((scrollCur + vh - it.top) / (it.h + vh));
      const yv = Math.round((0.5 - prog) * 700) / 100;
      if (yv !== it.lastY) {
        it.lastY = yv;
        it.el.style.transform = `translate3d(0, ${yv}vh, 0)`;
      }
    }
  }

  if (!renderer) return;

  /* world state: the canvas stays transparent; photos live behind it */
  dust.material.uniforms.uTime.value = t;
  dust.material.uniforms.uColor.value.copy(live.accent);
  stars.material.uniforms.uTime.value = t;
  stars.material.uniforms.uOpacity.value = clamp01((p - 0.84) / 0.12) * 0.95;

  /* camera walks the corridor */
  camera.position.z = lerp(CAM_START, CAM_END, p);
  if (!reduced) {
    const mk = smooth(2.5, dt);
    mouse.cx += (mouse.x - mouse.cx) * mk;
    mouse.cy += (mouse.y - mouse.cy) * mk;
  }
  camera.position.x = mouse.cx * 1.7 + Math.sin(t * 0.18) * 0.35;
  camera.position.y = 4.7 - mouse.cy * 0.55 + Math.sin(t * 0.23) * 0.18;
  camera.lookAt(camera.position.x * 0.35, 4.8 - mouse.cy * 0.3, camera.position.z - 42);
  camera.rotation.z = Math.sin(p * Math.PI * 2) * 0.018;

  renderer.render(scene, camera);
}

/* ── ignition ────────────────────────────── */

function start() {
  measure();
  if (!location.hash) scrollTo({ top: resumePosition(), behavior: "instant" });
  scrollTarget = scrollCur = scrollY;
  if (renderer) {
    renderer.setSize(innerWidth, innerHeight);
    const px = Math.min(devicePixelRatio, mobile ? 1.25 : 2);
    renderer.setPixelRatio(px);
    dust.material.uniforms.uPx.value = px;
    stars.material.uniforms.uPx.value = px;
  }
  buildNav();
  frame();

  const heroPanel = document.querySelector(".hero .panel");
  setTimeout(() => {
    document.getElementById("intro")?.classList.add("gone");
    heroPanel?.classList.add("in");
  }, 700);

  /* re-measure once fonts settle layout */
  document.fonts?.ready.then(() => measure());
}

if (document.readyState === "complete") start();
else addEventListener("load", start);
