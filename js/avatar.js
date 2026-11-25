/**
 * 3D stylised avatar of Muhammed Hadhi Havath, built from primitives.
 * Look reference: voluminous swept-up black hair, short beard + moustache,
 * thin metal glasses, denim-blue shirt with rolled sleeves, brown wrist watch,
 * black trousers and black Chelsea boots.
 */
import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const COLORS = {
  skin: 0xa86c48,
  skinShade: 0x93593a,
  hair: 0x141116,
  beard: 0x1f1714,
  shirt: 0x3e70b0,
  shirtLight: 0x8db4e0,
  shirtDark: 0x2f5a92,
  pants: 0x1d1e26,
  boots: 0x111114,
  sole: 0x2a2a30,
  watchStrap: 0x6e3f22,
  watchFace: 0xf3ede2,
  metal: 0xd3d6e0,
  white: 0xffffff,
  iris: 0x2b1a10,
  lip: 0xb4604c,
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02, ...opts });
}

function mesh(geo, material, { pos, rot, scale, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) m.scale.set(...scale);
  m.castShadow = shadow;
  m.receiveShadow = false;
  return m;
}

function pivot(pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(...pos);
  return g;
}

/* ----------------------------------------------------------------------- */
/*  Canvas textures                                                         */
/* ----------------------------------------------------------------------- */
function makeCodeTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const palette = ['#ff4f8b', '#8b6cff', '#22c7ff', '#ffd23f', '#2ee6a6', '#ff8a3d'];
  const lines = [];
  for (let i = 0; i < 40; i++) {
    const indent = Math.floor(Math.random() * 4);
    const toks = [];
    let n = 1 + Math.floor(Math.random() * 4);
    while (n--) toks.push({ w: 20 + Math.random() * 90, c: palette[Math.floor(Math.random() * palette.length)] });
    lines.push({ indent, toks });
  }
  let offset = 0;
  tex.userData.update = (dt) => {
    offset = (offset + dt * 28) % (lines.length * 18);
    ctx.fillStyle = '#16132b';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#221d40';
    ctx.fillRect(0, 0, c.width, 26);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(18 + i * 18, 13, 5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 30, c.width, c.height - 30); ctx.clip();
    for (let i = 0; i < lines.length * 2; i++) {
      const L = lines[i % lines.length];
      const y = 44 + i * 18 - offset;
      if (y < 20 || y > c.height + 10) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(10, y - 6, 16, 6);
      let x = 40 + L.indent * 22;
      L.toks.forEach(t => { ctx.fillStyle = t.c; ctx.fillRect(x, y - 7, t.w, 8); x += t.w + 10; });
    }
    ctx.restore();
    tex.needsUpdate = true;
  };
  tex.userData.update(0);
  return tex;
}

function makeBadgeTexture(label, bg, fg = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = fg;
  ctx.font = `800 ${label.length > 3 ? 74 : 104}px "Syne", "Inter", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 136);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ----------------------------------------------------------------------- */
/*  Character                                                               */
/* ----------------------------------------------------------------------- */
function buildCharacter() {
  const M = {
    skin: mat(COLORS.skin, { roughness: 0.55 }),
    hair: mat(COLORS.hair, { roughness: 0.72, metalness: 0.0 }),
    beard: mat(COLORS.beard, { roughness: 0.85 }),
    stubble: mat(0x3a2820, { roughness: 0.9 }),
    teeth: mat(0xfdfaf4, { roughness: 0.3 }),
    shirt: mat(COLORS.shirt, { roughness: 0.78 }),
    shirtLight: mat(COLORS.shirtLight, { roughness: 0.8 }),
    shirtDark: mat(COLORS.shirtDark, { roughness: 0.8 }),
    pants: mat(COLORS.pants, { roughness: 0.75 }),
    boots: mat(COLORS.boots, { roughness: 0.3, metalness: 0.1 }),
    sole: mat(COLORS.sole, { roughness: 0.9 }),
    strap: mat(COLORS.watchStrap, { roughness: 0.5 }),
    face: mat(COLORS.watchFace, { roughness: 0.3 }),
    metal: mat(COLORS.metal, { roughness: 0.22, metalness: 0.95 }),
    white: mat(COLORS.white, { roughness: 0.25 }),
    iris: mat(COLORS.iris, { roughness: 0.2 }),
    lip: mat(COLORS.lip, { roughness: 0.6 }),
    lens: new THREE.MeshPhysicalMaterial({
      color: 0xbfe6ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16, clearcoat: 1,
    }),
    button: mat(0xe9eef7, { roughness: 0.35 }),
  };

  const J = {}; // joints
  const root = pivot();
  const hips = pivot([0, 2.18, 0]);
  root.add(hips);
  J.root = root; J.hips = hips;

  /* ---- Legs ---- */
  const makeLeg = (side) => {
    const hip = pivot([0.3 * side, 0, 0]);
    hip.add(mesh(new THREE.CapsuleGeometry(0.25, 0.62, 8, 16), M.pants, { pos: [0, -0.5, 0] }));
    const knee = pivot([0, -1.0, 0]);
    knee.add(mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.92, 20), M.pants, { pos: [0, -0.42, 0] }));
    const ankle = pivot([0, -0.93, 0]);
    ankle.add(mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.22, 16), M.boots, { pos: [0, -0.02, 0.02] }));
    ankle.add(mesh(new RoundedBoxGeometry(0.34, 0.2, 0.6, 4, 0.09), M.boots, { pos: [0, -0.13, 0.12] }));
    ankle.add(mesh(new RoundedBoxGeometry(0.36, 0.06, 0.62, 2, 0.03), M.sole, { pos: [0, -0.23, 0.12] }));
    knee.add(ankle);
    hip.add(knee);
    hips.add(hip);
    return { hip, knee, ankle };
  };
  const legR = makeLeg(-1); // character's right (viewer's left)
  const legL = makeLeg(1);
  J.hipR = legR.hip; J.kneeR = legR.knee;
  J.hipL = legL.hip; J.kneeL = legL.knee;

  /* ---- Torso (denim shirt, untucked) ---- */
  const spine = pivot([0, 0.05, 0]);
  hips.add(spine);
  J.spine = spine;

  const profile = [
    [0.0, -0.26], [0.6, -0.26], [0.66, -0.2], [0.66, 0.15], [0.63, 0.55],
    [0.7, 0.95], [0.72, 1.18], [0.62, 1.36], [0.4, 1.47], [0.2, 1.5], [0.0, 1.5],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const torsoGeo = new THREE.LatheGeometry(profile, 48);
  const torso = mesh(torsoGeo, M.shirt, { scale: [1, 1, 0.62] });
  spine.add(torso);

  // open collar V (skin) + collar flaps
  spine.add(mesh(new THREE.SphereGeometry(0.16, 20, 16), M.skin, { pos: [0, 1.36, 0.3], scale: [0.85, 1.25, 0.45] }));
  [-1, 1].forEach(s => {
    spine.add(mesh(new RoundedBoxGeometry(0.26, 0.13, 0.04, 2, 0.02), M.shirtDark, {
      pos: [0.13 * s, 1.42, 0.3], rot: [-0.5, 0.35 * s, -0.75 * s],
    }));
  });
  // button placket + buttons
  spine.add(mesh(new THREE.BoxGeometry(0.07, 1.18, 0.02), M.shirtDark, { pos: [0, 0.62, 0.41], rot: [0.02, 0, 0] }));
  for (let i = 0; i < 5; i++) {
    spine.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 10), M.button, {
      pos: [0, 1.12 - i * 0.26, 0.425], rot: [Math.PI / 2, 0, 0], shadow: false,
    }));
  }
  // chest pockets with flaps
  [-1, 1].forEach(s => {
    spine.add(mesh(new RoundedBoxGeometry(0.24, 0.22, 0.03, 2, 0.012), M.shirtDark, { pos: [0.3 * s, 0.98, 0.425], rot: [0.12, 0.25 * s, 0] }));
    spine.add(mesh(new RoundedBoxGeometry(0.26, 0.07, 0.035, 2, 0.015), M.shirtLight, { pos: [0.3 * s, 1.08, 0.445], rot: [0.12, 0.25 * s, 0] }));
  });
  // hem line
  spine.add(mesh(new THREE.TorusGeometry(0.64, 0.025, 8, 48), M.shirtDark, { pos: [0, -0.22, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 0.62, 1] }));

  /* ---- Arms ---- */
  const makeArm = (side) => {
    const shoulder = pivot([0.74 * side, 1.25, 0]);
    shoulder.add(mesh(new THREE.SphereGeometry(0.21, 20, 16), M.shirt));
    shoulder.add(mesh(new THREE.CapsuleGeometry(0.175, 0.5, 8, 16), M.shirt, { pos: [0, -0.4, 0] }));
    const elbow = pivot([0, -0.8, 0]);
    // rolled sleeve cuff
    elbow.add(mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.17, 20), M.shirtLight, { pos: [0, 0.02, 0] }));
    elbow.add(mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 20), M.shirtLight, { pos: [0, -0.07, 0], rot: [Math.PI / 2, 0, 0] }));
    elbow.add(mesh(new THREE.CapsuleGeometry(0.135, 0.5, 8, 16), M.skin, { pos: [0, -0.36, 0] }));
    const wrist = pivot([0, -0.72, 0]);
    // mitten-style hand
    wrist.add(mesh(new THREE.SphereGeometry(0.15, 20, 16), M.skin, { pos: [0, -0.12, 0.01], scale: [0.78, 1.05, 0.55] }));
    const thumb = mesh(new THREE.CapsuleGeometry(0.045, 0.1, 6, 10), M.skin, { pos: [-0.09 * side, -0.07, 0.06], rot: [0.4, 0, 0.6 * side] });
    wrist.add(thumb);
    const finger = mesh(new THREE.CapsuleGeometry(0.04, 0.16, 6, 10), M.skin, { pos: [0, -0.3, 0.02] });
    finger.visible = false;
    wrist.add(finger);
    elbow.add(wrist);
    shoulder.add(elbow);
    spine.add(shoulder);
    return { shoulder, elbow, wrist, thumb, finger };
  };
  const armR = makeArm(-1);
  const armL = makeArm(1);
  J.shoulderR = armR.shoulder; J.elbowR = armR.elbow; J.wristR = armR.wrist;
  J.shoulderL = armL.shoulder; J.elbowL = armL.elbow; J.wristL = armL.wrist;
  J.fingerR = armR.finger; J.thumbR = armR.thumb;

  // watch on the left wrist
  const watch = pivot([0, -0.62, 0]);
  watch.add(mesh(new THREE.TorusGeometry(0.135, 0.035, 8, 24), M.strap, { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 1.4] }));
  watch.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20), M.metal, { pos: [0, 0, 0.14], rot: [Math.PI / 2, 0, 0] }));
  watch.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.055, 20), M.face, { pos: [0, 0, 0.145], rot: [Math.PI / 2, 0, 0], shadow: false }));
  armL.elbow.add(watch);

  // phone (held in right hand in some poses)
  const phone = new THREE.Group();
  phone.add(mesh(new RoundedBoxGeometry(0.2, 0.38, 0.03, 3, 0.03), mat(0xe8e8ee, { roughness: 0.25, metalness: 0.6 })));
  phone.add(mesh(new THREE.PlaneGeometry(0.17, 0.33), new THREE.MeshBasicMaterial({ color: 0x7c4dff }), { pos: [0, 0, -0.017], rot: [0, Math.PI, 0], shadow: false }));
  phone.position.set(0, -0.2, 0.08);
  phone.rotation.set(-0.3, 0, 0);
  phone.visible = false;
  armR.wrist.add(phone);
  J.phone = phone;

  /* ---- Neck + Head ---- */
  const neck = pivot([0, 1.42, 0]);
  neck.add(mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.4, 20), M.skin, { pos: [0, 0.14, 0] }));
  spine.add(neck);
  J.neck = neck;

  const head = pivot([0, 0.78, 0.02]);
  neck.add(head);
  J.head = head;

  const SK = [0.93, 1.1, 1.0];
  head.add(mesh(new THREE.SphereGeometry(0.55, 48, 36), M.skin, { scale: SK }));
  // jaw / chin softening
  head.add(mesh(new THREE.SphereGeometry(0.36, 32, 24), M.skin, { pos: [0, -0.3, 0.12], scale: [1.05, 0.85, 1] }));

  // ears
  [-1, 1].forEach(s => {
    head.add(mesh(new THREE.SphereGeometry(0.12, 16, 12), M.skin, { pos: [0.51 * s, -0.02, -0.02], scale: [0.45, 1, 0.75] }));
  });

  // nose
  head.add(mesh(new THREE.SphereGeometry(0.085, 16, 12), mat(COLORS.skinShade, { roughness: 0.5 }), { pos: [0, -0.07, 0.56], scale: [0.85, 1, 1.05] }));
  head.add(mesh(new THREE.CapsuleGeometry(0.045, 0.14, 6, 10), M.skin, { pos: [0, 0.03, 0.54], rot: [-0.25, 0, 0] }));

  // eyes
  const eyes = [];
  [-1, 1].forEach(s => {
    const eye = pivot([0.19 * s, 0.07, 0.47]);
    eye.add(mesh(new THREE.SphereGeometry(0.095, 20, 16), M.white, { scale: [1, 0.85, 0.6], shadow: false }));
    const iris = mesh(new THREE.SphereGeometry(0.052, 16, 12), M.iris, { pos: [0, -0.005, 0.04], scale: [1, 1, 0.5], shadow: false });
    eye.add(iris);
    eye.add(mesh(new THREE.SphereGeometry(0.014, 8, 6), M.white, { pos: [0.02, 0.02, 0.07], shadow: false }));
    head.add(eye);
    eyes.push(eye);
  });
  J.eyes = eyes;

  // eyebrows (thick, dark)
  [-1, 1].forEach(s => {
    head.add(mesh(new RoundedBoxGeometry(0.22, 0.055, 0.06, 2, 0.025), M.hair, {
      pos: [0.19 * s, 0.22, 0.5], rot: [-0.15, 0.32 * s, -0.08 * s],
    }));
  });

  // beard — short shell over jaw & chin
  const beardGeo = new THREE.SphereGeometry(0.562, 48, 24, Math.PI / 2 - 1.75, 3.5, 2.2, 0.9);
  head.add(mesh(beardGeo, M.beard, { scale: SK, shadow: false }));
  const chin = mesh(new THREE.SphereGeometry(0.368, 32, 20, Math.PI / 2 - 0.9, 1.8, Math.PI * 0.6, Math.PI * 0.4), M.beard, { pos: [0, -0.3, 0.13], scale: [1.07, 0.88, 1.04], shadow: false });
  head.add(chin);

  // sideburns
  [-1, 1].forEach(s => {
    head.add(mesh(new THREE.SphereGeometry(0.565, 12, 12, (s > 0 ? Math.PI : 0) - 0.18, 0.36, 1.35, 0.7), M.beard, { scale: SK, shadow: false }));
  });
  // moustache
  [-1, 1].forEach(s => {
    head.add(mesh(new THREE.CapsuleGeometry(0.02, 0.1, 6, 10), M.beard, {
      pos: [0.06 * s, -0.175, 0.585], rot: [0, 0.25 * s, Math.PI / 2 + 0.22 * s], scale: [1, 1, 0.6], shadow: false,
    }));
  });
  // mouth (smile)
  const mouth = new THREE.Group();
  mouth.add(mesh(new THREE.CircleGeometry(0.085, 24, Math.PI, Math.PI), M.teeth, { shadow: false }));
  mouth.add(mesh(new THREE.TorusGeometry(0.085, 0.014, 8, 24, Math.PI), M.lip, { rot: [0, 0, Math.PI], shadow: false }));
  mouth.add(mesh(new THREE.BoxGeometry(0.17, 0.016, 0.01), M.lip, { shadow: false }));
  mouth.position.set(0, -0.255, 0.592);
  mouth.rotation.x = -0.12;
  head.add(mouth);
  J.mouth = mouth;

  // hair — base cap + voluminous swept-up quiff
  const hair = new THREE.Group();
  hair.add(mesh(new THREE.SphereGeometry(0.585, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.4), M.hair, { scale: SK, rot: [-0.3, 0, 0], pos: [0, 0.04, -0.03] }));
  hair.add(mesh(new THREE.SphereGeometry(0.578, 48, 32, Math.PI * 1.5 - 1.75, 3.5, 0.2, Math.PI * 0.43), M.hair, { scale: SK, pos: [0, 0.0, -0.03] }));
  // short faded sides
  [-1, 1].forEach(sd => {
    hair.add(mesh(new THREE.SphereGeometry(0.575, 24, 16, (sd > 0 ? Math.PI : 0) - 0.55, 1.1, 0.55, 0.55), M.hair, { scale: SK, pos: [0, 0.0, -0.02] }));
  });
  const blobs = [
    { p: [0.0, 0.56, 0.3], s: [0.42, 0.24, 0.24], r: [0.75, 0, -0.06] },  // front quiff
    { p: [0.0, 0.7, 0.04], s: [0.44, 0.22, 0.4], r: [0.2, 0, -0.06] },   // crown volume
    { p: [0.0, 0.54, -0.3], s: [0.44, 0.26, 0.3], r: [-0.45, 0, 0] },   // back
  ];
  blobs.forEach(b => hair.add(mesh(new THREE.SphereGeometry(1, 28, 20), M.hair, { pos: b.p, scale: b.s, rot: b.r })));
  // combed-back strands: long flattened ridges running front to back
  const ridges = [
    { x: -0.26, y: 0.56, z: 0.1, rz: 0.5, l: 0.6 },
    { x: -0.13, y: 0.66, z: 0.12, rz: 0.22, l: 0.68 },
    { x: 0.02, y: 0.7, z: 0.14, rz: 0.0, l: 0.7 },
    { x: 0.17, y: 0.67, z: 0.1, rz: -0.24, l: 0.66 },
    { x: 0.3, y: 0.57, z: 0.06, rz: -0.5, l: 0.58 },
  ];
  ridges.forEach((r, i) => {
    const g = new THREE.Group();
    g.position.set(r.x, r.y, r.z);
    g.rotation.set(-0.35, 0, r.rz);
    g.add(mesh(new THREE.CapsuleGeometry(0.09, r.l, 6, 14), M.hair, { rot: [Math.PI / 2, 0, 0], scale: [1.45, 1, 0.7] }));
    hair.add(g);
  });
  // loose strand falling over the forehead
  hair.add(mesh(new THREE.CapsuleGeometry(0.05, 0.22, 6, 10), M.hair, { pos: [-0.3, 0.44, 0.42], rot: [1.0, 0, 0.95], scale: [1, 1, 0.6] }));
  head.add(hair);
  J.hair = hair;

  // glasses — thin metal frames
  const glasses = new THREE.Group();
  [-1, 1].forEach(s => {
    const frame = mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 36), M.metal, { pos: [0.2 * s, 0.06, 0], scale: [1.12, 0.84, 1], shadow: false });
    glasses.add(frame);
    const lens = mesh(new THREE.CircleGeometry(0.12, 32), M.lens, { pos: [0.2 * s, 0.06, -0.003], scale: [1.12, 0.84, 1], shadow: false });
    glasses.add(lens);
    const temple = mesh(new THREE.BoxGeometry(0.016, 0.016, 0.5), M.metal, { pos: [0.34 * s, 0.07, -0.24], rot: [0, -0.18 * s, 0], shadow: false });
    glasses.add(temple);
  });
  glasses.add(mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 12, Math.PI), M.metal, { pos: [0, 0.08, 0.005], shadow: false }));
  glasses.position.set(0, 0.01, 0.585);
  head.add(glasses);
  J.glasses = glasses;
  J.lensMat = M.lens;

  return { root, J, M };
}

/* ----------------------------------------------------------------------- */
/*  Poses                                                                   */
/* ----------------------------------------------------------------------- */
const Z = [0, 0, 0];
const BASE = {
  root: [0, 0, 0], spine: Z, neck: Z, head: Z,
  shoulderR: [0.05, 0, -0.12], elbowR: [-0.15, 0, 0], wristR: Z,
  shoulderL: [0.05, 0, 0.12], elbowL: [-0.15, 0, 0], wristL: Z,
  hipR: Z, kneeR: Z, hipL: Z, kneeL: Z,
};

const POSES = {
  wave: {
    spine: [0, 0.05, 0.04], head: [0.02, 0.12, 0.08],
    shoulderR: [0, 0, -2.55], elbowR: [0, 0, -0.45], wristR: [0, 0, 0],
    shoulderL: [0.05, 0, 0.14], elbowL: [-0.25, 0, 0],
    hipR: [0, 0, -0.05], hipL: [0, 0, 0.05],
  },
  idle: {
    head: [0.03, 0.08, 0.04],
    shoulderR: [0.08, 0, -0.16], elbowR: [-0.3, 0, 0],
    shoulderL: [0.08, 0, 0.16], elbowL: [-0.3, 0, 0],
    hipR: [0, 0, -0.04], hipL: [0, 0, 0.04],
  },
  type: {
    spine: [0.08, 0, 0], head: [0.22, 0, 0],
    shoulderR: [-0.75, 0, 0.12], elbowR: [-1.05, 0, 0], wristR: [0.2, 0, 0],
    shoulderL: [-0.75, 0, -0.12], elbowL: [-1.05, 0, 0], wristL: [0.2, 0, 0],
  },
  point: {
    root: [0, 0.32, 0], spine: [0, 0.12, 0], head: [0, -0.55, 0.06],
    shoulderR: [-0.15, 0, -1.5], elbowR: [-0.12, 0, 0], wristR: [0, 0, 0],
    shoulderL: [0.05, 0, 0.12], elbowL: [-0.3, 0, 0],
    hipR: [0, 0, -0.06], kneeR: [0.04, 0, 0],
  },
  think: {
    spine: [0.03, 0, 0], head: [0.1, -0.15, 0.14],
    shoulderL: [-0.55, 0.1, 0.12], elbowL: [-2.45, 0, -0.1], wristL: [0.2, 0, 0],
    shoulderR: [-0.35, 0, -0.05], elbowR: [-1.45, 0, 0.5], wristR: Z,
  },
  phone: {
    head: [0.38, 0, 0],
    shoulderR: [-0.45, 0, 0.08], elbowR: [-1.35, 0, 0.35], wristR: [0.3, 0, 0],
    shoulderL: [-0.3, 0, -0.05], elbowL: [-1.25, 0, -0.35], wristL: Z,
  },
  thumbs: {
    root: [0, -0.15, 0], head: [-0.05, 0.1, -0.1],
    shoulderR: [-1.15, 0, -0.35], elbowR: [-1.0, 0, 0], wristR: [0, 0, 0],
    shoulderL: [0.25, 0, 0.55], elbowL: [-1.9, 0, 0.1], wristL: [0, 0, 0.2],
  },
  cool: {
    head: [-0.08, 0.15, 0.06],
    shoulderR: [-0.55, 0, 0.18], elbowR: [-1.75, 0, 0.75],
    shoulderL: [-0.6, 0, -0.18], elbowL: [-1.7, 0, -0.85],
    hipR: [0, 0, -0.08], hipL: [0, 0, 0.04],
  },
  present: {
    spine: [0, 0, 0], head: [0.05, 0, 0],
    shoulderR: [-0.35, 0, -0.75], elbowR: [-0.7, 0, 0], wristR: [0, 0, 0],
    shoulderL: [-0.35, 0, 0.75], elbowL: [-0.7, 0, 0], wristL: [0, 0, 0],
  },
};

const JOINT_KEYS = Object.keys(BASE);
function resolvePose(name) {
  const p = POSES[name] || POSES.idle;
  const out = {};
  JOINT_KEYS.forEach(k => { out[k] = (p[k] || BASE[k]).slice(); });
  return out;
}

/* ----------------------------------------------------------------------- */
/*  Scene                                                                   */
/* ----------------------------------------------------------------------- */
export function createAvatarScene(canvas, { onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 3 / 4, 0.1, 100);
  const camTarget = new THREE.Vector3(0, 2.75, 0);
  camera.position.set(0, 3.4, 15.2);
  camera.lookAt(camTarget);

  // lights — bright, vibrant studio
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd6ec, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 7; key.shadow.camera.bottom = -2;
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  scene.add(key);
  const rimA = new THREE.PointLight(0xff3d7f, 30, 14, 1.6);
  rimA.position.set(-4.5, 4.5, -2.5);
  scene.add(rimA);
  const rimB = new THREE.PointLight(0x00c2ff, 28, 14, 1.6);
  rimB.position.set(4.5, 2.5, -3);
  scene.add(rimB);
  const fill = new THREE.PointLight(0xffd23f, 6, 12, 2);
  fill.position.set(0, 1, 5);
  scene.add(fill);

  // platform
  const platform = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(1.75, 1.6, 0.28, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }), { pos: [0, -0.14, 0] });
  disc.receiveShadow = true; disc.castShadow = false;
  platform.add(disc);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x7c4dff, emissive: 0x7c4dff, emissiveIntensity: 0.9, roughness: 0.4 });
  const ring = mesh(new THREE.TorusGeometry(1.72, 0.05, 12, 96), ringMat, { pos: [0, 0.0, 0], rot: [Math.PI / 2, 0, 0], shadow: false });
  platform.add(ring);
  const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xff3d7f, emissive: 0xff3d7f, emissiveIntensity: 0.8, roughness: 0.4 });
  const ring2 = mesh(new THREE.TorusGeometry(1.64, 0.035, 12, 96), ring2Mat, { pos: [0, -0.28, 0], rot: [Math.PI / 2, 0, 0], shadow: false });
  platform.add(ring2);
  scene.add(platform);

  // character
  const { root, J, M } = buildCharacter();
  scene.add(root);

  // laptop prop
  const laptop = new THREE.Group();
  const alu = new THREE.MeshStandardMaterial({ color: 0xdfe3ec, roughness: 0.3, metalness: 0.7 });
  laptop.add(mesh(new RoundedBoxGeometry(1.15, 0.06, 0.78, 3, 0.03), alu));
  const codeTex = makeCodeTexture();
  const lid = pivot([0, 0.03, -0.38]);
  lid.add(mesh(new RoundedBoxGeometry(1.15, 0.74, 0.04, 3, 0.02), alu, { pos: [0, 0.37, 0] }));
  lid.add(mesh(new THREE.PlaneGeometry(1.04, 0.64), new THREE.MeshBasicMaterial({ map: codeTex, toneMapped: false }), { pos: [0, 0.37, 0.022], shadow: false }));
  lid.rotation.x = -0.28;
  laptop.add(lid);
  laptop.position.set(0, 2.62, 1.0);
  laptop.scale.setScalar(0.001);
  scene.add(laptop);

  // orbiting tech badges
  const badgeDefs = [
    ['Py', ['#3776ab', '#ffd23f']], ['</>', ['#ff3d7f', '#ff8a3d']], ['Dart', ['#00b4ff', '#7c4dff']],
    ['Dj', ['#0c7a4f', '#22d39c']], ['JS', ['#ffd23f', '#ff8a3d'], '#1a1633'], ['{ }', ['#7c4dff', '#ff3d7f']],
  ];
  const badges = badgeDefs.map(([label, bg, fg], i) => {
    const tex = makeBadgeTexture(label, bg, fg);
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 });
    const side = new THREE.MeshStandardMaterial({ color: new THREE.Color(bg[0]), roughness: 0.35 });
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.55, 0.16, 3, 0.07), [side, side, side, side, face, face]);
    m.userData = { a: (i / badgeDefs.length) * Math.PI * 2, y: 1.2 + (i % 3) * 1.25, r: 2.35 + (i % 2) * 0.25, s: 0.35 + (i % 3) * 0.08 };
    scene.add(m);
    return m;
  });

  /* ---------------- state ---------------- */
  let pose = 'wave';
  let current = resolvePose('wave');
  let target = resolvePose('wave');
  let shades = 0, shadesTarget = 0;
  let laptopK = 0, laptopTarget = 0;
  let hop = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let blinkT = 2 + Math.random() * 3;
  let running = true;
  let width = 300, height = 400;
  const framing = { fitH: 7.4, fitW: 6.2 };

  function setPose(name) {
    if (!POSES[name] || name === pose) return;
    pose = name;
    target = resolvePose(name);
    shadesTarget = name === 'cool' ? 1 : 0;
    laptopTarget = name === 'type' ? 1 : 0;
    J.phone.visible = name === 'phone';
    J.fingerR.visible = name === 'point';
    hop = 1;
  }

  function setAccent(colors) {
    if (!colors) return;
    try {
      ringMat.color.set(colors[0]); ringMat.emissive.set(colors[0]);
      ring2Mat.color.set(colors[1]); ring2Mat.emissive.set(colors[1]);
      rimA.color.set(colors[0]); rimB.color.set(colors[2] || colors[1]);
    } catch (e) { /* ignore bad colour strings */ }
  }

  function resize(w, h) {
    width = Math.max(1, Math.round(w)); height = Math.max(1, Math.round(h));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // keep full figure in frame on any aspect
    const fitH = framing.fitH; // world units tall to show
    const fitW = framing.fitW;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const distH = (fitH / 2) / Math.tan(vFov / 2);
    const distW = (fitW / 2) / (Math.tan(vFov / 2) * camera.aspect);
    camera.userData.dist = Math.max(distH, distW);
    camera.updateProjectionMatrix();
  }

  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const clock = new THREE.Clock();
  let t = 0;
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    const k = 1 - Math.exp(-dt * 7);

    // blend joints toward pose
    JOINT_KEYS.forEach(key => {
      const c = current[key], g = target[key];
      c[0] += (g[0] - c[0]) * k; c[1] += (g[1] - c[1]) * k; c[2] += (g[2] - c[2]) * k;
      const j = J[key];
      if (j) j.rotation.set(c[0], c[1], c[2]);
    });

    // procedural layers
    const breathe = Math.sin(t * 2.1);
    J.spine.rotation.x += breathe * 0.012;
    J.spine.scale.set(1 + breathe * 0.006, 1 + breathe * 0.01, 1 + breathe * 0.008);
    J.hips.position.y = 2.18 + Math.sin(t * 2.1) * 0.012;

    if (pose === 'wave') {
      J.elbowR.rotation.z += Math.sin(t * 9) * 0.38;
      J.wristR.rotation.z += Math.sin(t * 9 - 0.6) * 0.2;
    } else if (pose === 'type') {
      J.wristR.rotation.x += Math.max(0, Math.sin(t * 16)) * 0.22;
      J.wristL.rotation.x += Math.max(0, Math.sin(t * 16 + 1.8)) * 0.22;
      J.head.rotation.y += Math.sin(t * 0.9) * 0.08;
    } else if (pose === 'point') {
      J.shoulderR.rotation.z += Math.sin(t * 3) * 0.04;
    } else if (pose === 'think') {
      J.head.rotation.z += Math.sin(t * 1.3) * 0.05;
    } else if (pose === 'thumbs') {
      J.shoulderR.rotation.x += Math.sin(t * 4) * 0.06;
    } else if (pose === 'present') {
      J.shoulderR.rotation.z += Math.sin(t * 2) * 0.05;
      J.shoulderL.rotation.z -= Math.sin(t * 2) * 0.05;
    }

    // thumb up for thumbs pose
    J.thumbR.rotation.set(pose === 'thumbs' ? 0 : 0.4, 0, pose === 'thumbs' ? Math.PI : -0.6);
    J.thumbR.position.set(pose === 'thumbs' ? 0 : 0.09, pose === 'thumbs' ? 0.05 : -0.07, pose === 'thumbs' ? 0.08 : 0.06);

    // head follows the cursor (smoothed)
    mouse.sx += (mouse.x - mouse.sx) * k * 0.6;
    mouse.sy += (mouse.y - mouse.sy) * k * 0.6;
    J.head.rotation.y += mouse.sx * 0.45;
    J.head.rotation.x += mouse.sy * 0.18;
    J.root.rotation.y += mouse.sx * 0.25;
    J.eyes.forEach(e => { e.children[1].position.x = mouse.sx * 0.02; e.children[1].position.y = -0.005 - mouse.sy * 0.015; });

    // blink
    blinkT -= dt;
    const blink = blinkT < 0.12 ? 0.1 : 1;
    if (blinkT < 0) blinkT = 2.5 + Math.random() * 3.5;
    J.eyes.forEach(e => { e.scale.y = blink; });

    // hop on pose change
    hop = Math.max(0, hop - dt * 2.4);
    J.root.position.y = Math.sin((1 - hop) * Math.PI) * hop * 0.35;

    // sunglasses + laptop
    shades += (shadesTarget - shades) * k;
    J.lensMat.color.setRGB(0.75 - shades * 0.7, 0.9 - shades * 0.85, 1 - shades * 0.9);
    J.lensMat.opacity = 0.16 + shades * 0.74;
    laptopK += (laptopTarget - laptopK) * k;
    laptop.scale.setScalar(Math.max(0.001, laptopK));
    laptop.position.y = 2.62 + Math.sin(t * 2) * 0.03;
    if (laptopK > 0.05) codeTex.userData.update(dt);

    // badges orbit
    badges.forEach(b => {
      const u = b.userData;
      const a = u.a + t * u.s;
      b.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 1.4 + u.a) * 0.18, Math.sin(a) * u.r * 0.7 - 0.2);
      b.rotation.y = -a + Math.PI / 2;
      b.rotation.x = Math.sin(t + u.a) * 0.2;
    });
    ring.rotation.z = t * 0.4;
    platform.position.y = Math.sin(t * 1.2) * 0.04;

    // camera orbit with mouse
    const dist = camera.userData.dist || 15;
    camera.position.set(Math.sin(mouse.sx * 0.25) * dist, camTarget.y + 0.5 - mouse.sy * 0.6, Math.cos(mouse.sx * 0.25) * dist);
    camera.lookAt(camTarget);

    renderer.render(scene, camera);
  }

  // first render, then go
  resize(canvas.clientWidth || 300, canvas.clientHeight || 400);
  renderer.render(scene, camera);
  frame();
  if (onReady) onReady();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; }
    else if (!running) { running = true; clock.getDelta(); frame(); }
  });

  function setFraming(fitH, fitW, y) {
    framing.fitH = fitH; framing.fitW = fitW;
    if (y !== undefined) camTarget.y = y;
    resize(width, height);
  }

  return { setPose, setAccent, resize, setFraming, get pose() { return pose; } };
}
