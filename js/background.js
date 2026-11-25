/**
 * Immersive scroll background: the camera flies down through a field of
 * glossy, vibrant 3D shapes as the page scrolls.
 */
import * as THREE from './vendor/three.module.min.js';

export function createBackground(canvas) {
  const small = window.innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf8f4ff, 14, 46);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffe1f0, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(5, 8, 10);
  scene.add(sun);

  const palette = [0xff3d7f, 0x7c4dff, 0x00c2ff, 0xffc93c, 0x22d39c, 0xff7a1a];
  const geos = [
    new THREE.TorusGeometry(0.9, 0.34, 24, 64),
    new THREE.IcosahedronGeometry(0.95, 0),
    new THREE.OctahedronGeometry(0.95, 0),
    new THREE.SphereGeometry(0.8, 32, 24),
    new THREE.TorusKnotGeometry(0.62, 0.22, 96, 16),
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.ConeGeometry(0.8, 1.4, 32),
    new THREE.CapsuleGeometry(0.45, 0.9, 8, 20),
  ];
  const mats = palette.map(c => new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15,
  }));

  const DEPTH = 120; // world units the camera travels over the whole page
  const count = small ? 26 : 46;
  const shapes = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geos[i % geos.length], mats[(i * 7) % mats.length]);
    const side = i % 2 ? 1 : -1;
    // keep shapes in the outer band of the view so they frame, not cover, the text
    const z = -6 - Math.random() * 14;
    const halfW = Math.tan(THREE.MathUtils.degToRad(25)) * (12 - z) * (window.innerWidth / window.innerHeight);
    const band = small ? 0.85 + Math.random() * 0.3 : 0.74 + Math.random() * 0.3;
    m.position.set(
      side * halfW * band,
      6 - (i / count) * (DEPTH + 10) + (Math.random() - 0.5) * 4,
      z,
    );
    const s = (small ? 0.45 : 0.6) + Math.random() * (small ? 0.6 : 1.1);
    m.scale.setScalar(s);
    m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    m.userData = {
      spin: new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.3),
      baseY: m.position.y, phase: Math.random() * Math.PI * 2, par: 0.6 + Math.random() * 0.6,
    };
    scene.add(m);
    shapes.push(m);
  }

  // floating particles (confetti dots)
  const pCount = small ? 140 : 320;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);
  const col = new Float32Array(pCount * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 34;
    pos[i * 3 + 1] = 8 - Math.random() * (DEPTH + 16);
    pos[i * 3 + 2] = -2 - Math.random() * 22;
    c.setHex(palette[i % palette.length]);
    col.set([c.r, c.g, c.b], i * 3);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dots = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true }));
  scene.add(dots);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let progress = 0, smooth = 0, lastScroll = window.scrollY, velocity = 0;
  const clock = new THREE.Clock();
  let running = true, t = 0;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress = window.scrollY / max;
    const dy = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    velocity += (Math.min(Math.abs(dy), 120) / 120 - velocity) * 0.08;
    smooth += (progress - smooth) * (1 - Math.exp(-dt * 5));

    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;

    camera.position.set(mouse.sx * 1.2, -smooth * DEPTH - mouse.sy * 0.8, 12);
    camera.rotation.set(-mouse.sy * 0.03, -mouse.sx * 0.05, Math.sin(smooth * Math.PI * 4) * 0.04);

    const boost = 1 + velocity * 6;
    shapes.forEach(m => {
      const u = m.userData;
      m.rotation.x += u.spin.x * dt * boost;
      m.rotation.y += u.spin.y * dt * boost;
      m.rotation.z += u.spin.z * dt * boost;
      m.position.y = u.baseY + Math.sin(t * 0.8 + u.phase) * 0.35;
    });
    dots.rotation.y = Math.sin(t * 0.05) * 0.1;
    renderer.render(scene, camera);
  }
  frame();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (!running) { running = true; clock.getDelta(); frame(); }
  });

  return {};
}
