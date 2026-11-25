/**
 * 3D world bootstrap: scroll background + the avatar "buddy" that travels
 * through the page — big in the hero, docked in the corner while you read,
 * and landing beside the contact form at the end.
 */
import { createAvatarScene } from './avatar.js';
import { createBackground } from './background.js';

const html = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SECTION_POSES = {
  top: ['wave', "Hey! I'm Hadhi 👋"],
  about: ['idle', 'Nice to meet you! That\'s the real me 📸'],
  terminal: ['type', "Try typing 'help' ⌨️"],
  skills: ['type', 'My daily toolkit 🛠️'],
  services: ['present', 'Here\'s what I can build for you ✨'],
  testimonials: ['thumbs', 'Kind words from clients 🙌'],
  certifications: ['cool', 'Earned, not given 😎'],
  projects: ['point', 'Check these out! 👈'],
  experience: ['phone', 'My journey so far 📱'],
  faq: ['think', 'Got questions? 🤔'],
  contact: ['wave', "Let's build something great! 🚀"],
};

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function markLoaded() { html.classList.add('loaded'); }

function readAccent() {
  const cs = getComputedStyle(document.body);
  return ['--a1', '--a2', '--a3'].map(v => cs.getPropertyValue(v).trim()).filter(Boolean);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpRect = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
const toRect = (r) => ({ x: r.left, y: r.top, w: r.width, h: r.height });

function init() {
  const stage = document.getElementById('avatar-stage');
  const canvas = document.getElementById('avatar-canvas');
  const heroSpot = document.getElementById('hero-avatar-spot');
  const contactSpot = document.getElementById('contact-avatar-spot');
  const bubble = document.getElementById('avatar-bubble');
  const toggle = document.getElementById('buddy-toggle');
  const bgCanvas = document.getElementById('bg-canvas');
  if (!stage || !canvas || !heroSpot) { markLoaded(); return; }

  if (bgCanvas && !reducedMotion) {
    try { createBackground(bgCanvas); } catch (e) { console.warn('Background 3D disabled:', e); }
  }

  let base = { w: 360, h: 480 };
  const avatar = createAvatarScene(canvas, { onReady: () => { html.classList.add('has-3d'); } });
  avatar.setAccent(readAccent());
  document.addEventListener('accent-change', () => avatar.setAccent(readAccent()));

  function measure() {
    const r = heroSpot.getBoundingClientRect();
    base = { w: Math.max(120, r.width), h: Math.max(160, r.height) };
    stage.style.width = `${base.w}px`;
    stage.style.height = `${base.h}px`;
    avatar.resize(base.w, base.h);
  }
  measure();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 120); });

  /* ---------- buddy visibility toggle ---------- */
  let buddyHidden = false;
  try { buddyHidden = localStorage.getItem('hadhi_buddy_hidden') === '1'; } catch (e) { /* storage blocked */ }
  const syncToggle = () => {
    toggle.textContent = buddyHidden ? 'Show 3D buddy' : 'Hide 3D buddy';
    toggle.setAttribute('aria-pressed', String(buddyHidden));
  };
  syncToggle();
  toggle.addEventListener('click', () => {
    buddyHidden = !buddyHidden;
    try { localStorage.setItem('hadhi_buddy_hidden', buddyHidden ? '1' : '0'); } catch (e) { /* ignore */ }
    syncToggle();
  });

  /* ---------- section-driven poses + speech bubble ---------- */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  let activeId = '';
  let bubbleUntil = 0;
  let waveTimer = null;

  function setSection(id) {
    if (id === activeId || !SECTION_POSES[id]) return;
    activeId = id;
    const [pose, text] = SECTION_POSES[id];
    avatar.setPose(pose);
    clearTimeout(waveTimer);
    if (id === 'top') waveTimer = setTimeout(() => { if (activeId === 'top') avatar.setPose('idle'); }, 4200);
    bubble.textContent = text;
    bubbleUntil = performance.now() + 4500;
  }

  function detectSection() {
    const probe = window.innerHeight * 0.45;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { setSection(s.id); return; }
    }
  }
  window.addEventListener('scroll', detectSection, { passive: true });
  detectSection();
  if (!activeId) setSection('top');

  /* ---------- per-frame stage placement ---------- */
  function dockRect(vw, vh) {
    const w = vw < 640 ? 104 : vw < 1100 ? 140 : 176;
    const h = w * (base.h / base.w);
    return { x: vw - w - 10, y: vh - h - 46, w, h };
  }

  function place() {
    requestAnimationFrame(place);
    const vw = window.innerWidth, vh = window.innerHeight;
    const hero = toRect(heroSpot.getBoundingClientRect());
    const dock = dockRect(vw, vh);

    const tHero = ease(clamp01(window.scrollY / (vh * 0.75)));
    let r = lerpRect(hero, dock, tHero);

    let tContact = 0;
    if (contactSpot) {
      const cr = contactSpot.getBoundingClientRect();
      if (cr.width > 0) {
        tContact = ease(clamp01((vh - cr.top) / (vh * 0.5)));
        r = lerpRect(r, toRect(cr), tContact);
      }
    }

    const scale = r.w / base.w;
    stage.style.transform = `translate3d(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;

    const docked = tHero > 0.97 && tContact < 0.03;
    const hide = buddyHidden && docked;
    stage.classList.toggle('is-hidden', hide);
    toggle.classList.toggle('show', tHero > 0.9 && tContact < 0.1);

    // speech bubble near the head
    const now = performance.now();
    const persistent = tHero < 0.25 || tContact > 0.75;
    const showBubble = !hide && (persistent || now < bubbleUntil) && (tHero < 0.05 || tHero > 0.95);
    bubble.classList.toggle('show', showBubble);
    if (showBubble) {
      const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
      const ax = r.x + r.w * 0.5;
      const ay = r.y + r.h * 0.1;
      let left = ax - bw + 26;
      let tailLeft = false;
      if (left < 8) { left = ax - 26; tailLeft = true; }
      left = Math.min(left, vw - bw - 8);
      const top = Math.max(8, ay - bh - 4);
      bubble.classList.toggle('tail-left', tailLeft);
      bubble.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    }
  }
  place();
  requestAnimationFrame(() => setTimeout(markLoaded, 250));
}

if (!webglAvailable()) {
  markLoaded();
} else {
  try { init(); } catch (e) { console.warn('3D experience disabled:', e); markLoaded(); }
}
