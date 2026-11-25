/**
 * Muhammed Hadhi Havath — Portfolio interactions
 * - GSAP ScrollTrigger 3D scroll animations (reveals, pinned skills ring,
 *   terminal "screen opening", tilted testimonial track, timeline)
 * - 3D tilt cards, flip cards, photo stack
 * - Shell terminal with Web Audio key clicks + CTF challenge
 * - Colour vibe switcher, project filters, WhatsApp form, clipboard, toasts
 */
(function () {
  'use strict';

  const html = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = () => !!(window.gsap && window.ScrollTrigger);
  const THEMES = ['aurora', 'sunset', 'ocean', 'lime'];

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(() => {
    initTheme();
    initTerminal();
    initProjectFilters();
    initContactForm();
    initClipboardHelpers();
    initMobileNav();
    initScrollSpy();
    initScrollProgress();
    initRotator();
    initPhotoStack();
    initFlipCards();
    if (hasGSAP() && !reducedMotion) initMotion();
    else revealAll();
    initTilt();
    initSecurityShield();
    // never leave the loader up if the 3D module could not start
    window.addEventListener('load', () => setTimeout(() => html.classList.add('loaded'), 2500));
  });

  /* ============================================================
     1. COLOUR VIBE (THEME) CONTROLLER
     ============================================================ */
  function initTheme() {
    let saved = 'aurora';
    try { saved = localStorage.getItem('hadhi_accent') || 'aurora'; } catch (e) { /* storage blocked */ }
    setTheme(THEMES.includes(saved) ? saved : 'aurora', true);
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.addEventListener('click', () => setTheme(dot.getAttribute('data-theme')));
    });
  }

  function setTheme(theme, silent) {
    document.body.setAttribute('data-accent', theme);
    try { localStorage.setItem('hadhi_accent', theme); } catch (e) { /* ignore */ }
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-theme') === theme);
    });
    document.dispatchEvent(new CustomEvent('accent-change', { detail: { theme } }));
    if (!silent) showToast(`Colour vibe: ${theme}`);
  }

  /* ============================================================
     2. GSAP 3D SCROLL ANIMATIONS
     ============================================================ */
  function initMotion() {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    html.classList.add('motion');

    // project cards + timeline cards join the reveal system
    document.querySelectorAll('.project-card').forEach(el => el.setAttribute('data-reveal', 'zoom'));
    document.querySelectorAll('.timeline-item.left .timeline-card').forEach(el => el.setAttribute('data-reveal', 'left'));
    document.querySelectorAll('.timeline-item.right .timeline-card').forEach(el => el.setAttribute('data-reveal', 'right'));

    // --- hero name: 3D letter drop-in ---
    const name = document.querySelector('[data-split]');
    if (name) {
      const text = name.textContent;
      name.setAttribute('aria-label', text);
      name.textContent = '';
      const chars = [];
      text.split(' ').forEach((word, wi, words) => {
        const w = document.createElement('span');
        w.className = 'word';
        w.setAttribute('aria-hidden', 'true');
        word.split('').forEach(ch => {
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = ch;
          w.appendChild(s);
          chars.push(s);
        });
        name.appendChild(w);
        if (wi < words.length - 1) name.appendChild(document.createTextNode(' '));
      });
      gsap.from(chars, { yPercent: 120, rotateX: -100, opacity: 0, transformPerspective: 600, stagger: 0.045, duration: 1.1, ease: 'back.out(1.7)', delay: 0.35 });
    }
    gsap.from('.hero-content > *:not(.hero-title)', { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.2 });
    gsap.from('.floating-badge', { scale: 0, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'back.out(2)', delay: 1 });

    // --- hero recedes into depth as you scroll away ---
    gsap.to('#hero-content', {
      y: -60, rotateX: 22, z: -220, opacity: 0.15, transformPerspective: 1100, transformOrigin: '50% 0%', ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.floating-badge', {
      y: (i) => -120 - i * 60, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true },
    });

    // --- outlined big words slide across in parallax ---
    document.querySelectorAll('.bigword').forEach(el => {
      gsap.fromTo(el, { x: () => window.innerWidth * 0.18 }, {
        x: () => -window.innerWidth * 0.18, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
    });

    // --- about photo stack swings in 3D ---
    const stack = document.getElementById('photo-stack');
    if (stack) {
      gsap.fromTo(stack, { rotateY: -22, rotateX: 8 }, {
        rotateY: 14, rotateX: -4, ease: 'none', transformPerspective: 1300,
        scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }

    // --- terminal opens like a laptop screen ---
    gsap.fromTo('#terminal-window', { rotateX: 52, scale: 0.84, y: 40 }, {
      rotateX: 0, scale: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: '.terminal-scene', start: 'top 98%', end: 'top 30%', scrub: 1 },
    });

    // --- skills: pinned rotating 3D ring ---
    const ring = document.getElementById('skills-ring');
    if (ring) {
      gsap.set(ring, { rotateX: -8 });
      gsap.to(ring, {
        rotateY: -300, ease: 'none',
        scrollTrigger: { trigger: '#skills-pin', start: 'top top', end: '+=230%', pin: true, scrub: 1, anticipatePin: 1 },
      });
    }

    // --- testimonials: tilted track glides sideways ---
    const track = document.getElementById('testimonial-track');
    if (track) {
      gsap.set(track, { rotateX: 10, rotationZ: -3, transformPerspective: 1400 });
      gsap.fromTo(track, { x: () => window.innerWidth * 0.2 }, {
        x: () => -(track.scrollWidth - window.innerWidth * 0.8), ease: 'none',
        scrollTrigger: { trigger: '#testimonials', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true },
      });
    }

    // --- timeline progress line ---
    gsap.fromTo('#timeline-fill', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 55%', scrub: true },
    });

    // --- footer arrow ---
    gsap.fromTo('.footer-big span', { x: -20 }, { x: 20, repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut' });

    initReveals();
    initCounters();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  const REVEAL_FROM = {
    up: { y: 70, rotateX: -32, transformOrigin: '50% 100%' },
    zoom: { z: -320, rotateX: 24, y: 40, transformOrigin: '50% 50%' },
    left: { x: -90, rotateY: 55, transformOrigin: '0% 50%' },
    right: { x: 90, rotateY: -55, transformOrigin: '100% 50%' },
  };

  function initReveals() {
    const { gsap } = window;
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window)) { revealAll(); return; }
    let queue = [];
    let flushTimer = null;
    const flush = () => {
      queue.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      queue.forEach((el, i) => {
        const from = REVEAL_FROM[el.getAttribute('data-reveal')] || REVEAL_FROM.up;
        gsap.fromTo(el, { opacity: 0, transformPerspective: 1000, ...from }, {
          opacity: 1, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0,
          duration: 1.05, delay: i * 0.08, ease: 'power3.out', clearProps: 'transformOrigin',
        });
      });
      queue = [];
      flushTimer = null;
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        queue.push(entry.target);
      });
      if (queue.length && !flushTimer) flushTimer = setTimeout(flush, 30);
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(el => io.observe(el));
  }

  function revealAll() {
    document.querySelectorAll('[data-reveal]').forEach(el => { el.style.opacity = '1'; });
  }

  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const end = parseInt(el.getAttribute('data-count'), 10) || 0;
        const obj = { v: 0 };
        window.gsap.to(obj, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } });
      });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  }

  /* ============================================================
     3. 3D TILT CARDS
     ============================================================ */
  function initTilt() {
    if (!finePointer || reducedMotion) return;
    document.querySelectorAll('.tilt-3d').forEach(el => {
      const max = el.classList.contains('stat-item') ? 10 : 7;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        applyTilt(el, -py * max * 2, px * max * 2, 1.02);
      });
      el.addEventListener('pointerleave', () => applyTilt(el, 0, 0, 1));
    });
  }

  function applyTilt(el, rx, ry, s) {
    if (hasGSAP()) {
      window.gsap.to(el, { rotateX: rx, rotateY: ry, scale: s, transformPerspective: 900, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
    } else {
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
    }
  }

  /* ============================================================
     4. HERO ROLE ROTATOR (typewriter)
     ============================================================ */
  function initRotator() {
    const el = document.getElementById('rotator');
    if (!el) return;
    const words = ['secure web apps', 'Flutter mobile apps', 'Django REST APIs', 'fintech platforms', 'hardened systems'];
    if (reducedMotion) { el.textContent = words[0]; return; }
    let w = 0, i = words[0].length, deleting = false;
    const tick = () => {
      const word = words[w];
      if (!deleting) {
        i++;
        if (i > word.length) { deleting = true; setTimeout(tick, 1700); return; }
      } else {
        i--;
        if (i === 0) { deleting = false; w = (w + 1) % words.length; }
      }
      el.textContent = word.slice(0, Math.max(0, i)) || ' ';
      setTimeout(tick, deleting ? 40 : 75);
    };
    setTimeout(tick, 2200);
  }

  /* ============================================================
     5. PHOTO STACK + FLIP CARDS
     ============================================================ */
  function initPhotoStack() {
    const stack = document.getElementById('photo-stack');
    if (!stack) return;
    const swap = () => stack.classList.toggle('swapped');
    stack.addEventListener('click', swap);
    if (finePointer) stack.addEventListener('mouseenter', swap);
  }

  function initFlipCards() {
    document.querySelectorAll('.flip-card').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('flipped'));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
      });
    });
  }

  /* ============================================================
     6. SYNTHESIZED AUDIO (MECHANICAL KEYBOARD CLICK)
     ============================================================ */
  let audioCtx = null;
  let soundEnabled = false;

  function playKeyClickSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) { /* audio restricted */ }
  }

  /* ============================================================
     7. INTERACTIVE TERMINAL EMULATOR
     ============================================================ */
  function initTerminal() {
    const inputEl = document.getElementById('terminal-input');
    const outputEl = document.getElementById('terminal-output');
    const soundBtn = document.getElementById('terminal-sound-btn');
    const terminalBody = document.querySelector('.terminal-body');
    if (!inputEl || !outputEl || !terminalBody) return;

    const commandHistory = [];
    let historyIndex = -1;
    const validCommands = [
      'help', 'whoami', 'skills', 'projects', 'experience', 'contact', 'cat flag.txt', 'decrypt', 'sudo root',
      'theme aurora', 'theme sunset', 'theme ocean', 'theme lime', 'clear', 'history', 'github', 'social',
    ];

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.classList.toggle('active', soundEnabled);
        soundBtn.textContent = soundEnabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
        if (soundEnabled) playKeyClickSound();
      });
    }

    terminalBody.addEventListener('click', () => inputEl.focus({ preventScroll: true }));

    inputEl.addEventListener('keydown', (e) => {
      playKeyClickSound();
      if (e.key === 'Enter') {
        const rawInput = inputEl.value.trim();
        if (!rawInput) return;
        commandHistory.push(rawInput);
        historyIndex = commandHistory.length;
        executeCommand(rawInput, outputEl, commandHistory);
        inputEl.value = '';
        terminalBody.scrollTop = terminalBody.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          inputEl.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          inputEl.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          inputEl.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = inputEl.value.trim().toLowerCase();
        if (!current) return;
        const match = validCommands.find(c => c.startsWith(current));
        if (match) inputEl.value = match;
      }
    });
  }

  function executeCommand(cmd, outputEl, history) {
    appendLine(`guest@hadhihavath:~$ ${cmd}`, 'cmd', outputEl);
    const parts = cmd.trim().split(/\s+/);
    const root = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (root) {
      case 'help':
        appendLine('AVAILABLE SYSTEM COMMANDS:', 'accent', outputEl);
        appendLine('  whoami        - View developer profile, alias names & mission', 'info', outputEl);
        appendLine('  skills        - List technology stack and architecture tools', 'info', outputEl);
        appendLine('  projects      - Display highlight repositories and live products', 'info', outputEl);
        appendLine('  experience    - Show professional trajectory and education', 'info', outputEl);
        appendLine('  contact       - Get direct contact channels (Email, WhatsApp, GitHub)', 'info', outputEl);
        appendLine('  theme <vibe>  - Switch colour vibe (aurora, sunset, ocean, lime)', 'info', outputEl);
        appendLine('  cat flag.txt  - [CTF] Inspect secret challenge security file', 'info', outputEl);
        appendLine('  decrypt <txt> - [CTF] Decrypt encrypted credentials', 'info', outputEl);
        appendLine('  sudo root <k> - [CTF] Execute root system verification', 'info', outputEl);
        appendLine('  history       - Show commands typed this session', 'info', outputEl);
        appendLine('  clear         - Wipe current terminal screen buffer', 'info', outputEl);
        break;

      case 'whoami':
        appendLine('Identity Profile:', 'accent', outputEl);
        appendLine('  Full Name:       Muhammed Hadhi Havath', 'success', outputEl);
        appendLine('  Known As:        Hadhi Havath | Havath | @hadhihavath', 'info', outputEl);
        appendLine('  Role:            Full Stack Developer & Systems Engineer', 'info', outputEl);
        appendLine('  Education:       Bachelor of Computer Application (BCA), Calicut University', 'info', outputEl);
        appendLine('  Location:        Calicut, Kerala, India', 'info', outputEl);
        appendLine('  Philosophy:      "I build it, then I secure it."', 'success', outputEl);
        appendLine('  Specialization:  Python/Django backends, Flutter mobile apps, AppSec & systems audit.', 'info', outputEl);
        break;

      case 'skills':
        appendLine('Technical Arsenal Breakdown:', 'accent', outputEl);
        appendLine('  • Languages:   Python, Dart, TypeScript, JavaScript, Kotlin, Java, PHP, C, C++, SQL, Shell', 'info', outputEl);
        appendLine('  • Frameworks:  Django, Flutter, React, Node.js, Express, Tailwind CSS, Bootstrap', 'info', outputEl);
        appendLine('  • Mobile/Fin:  Flutter Engine, Android CLI, Stripe API, Razorpay, PhonePe flows', 'info', outputEl);
        appendLine('  • Security:    OWASP Top 10, Network Audits, Penetration Testing, Cryptography', 'info', outputEl);
        appendLine('  • Infra & DB:  PostgreSQL, MySQL, MongoDB, Firebase, Linux, Docker, Git', 'info', outputEl);
        break;

      case 'projects':
        appendLine('Production & Open-Source Projects:', 'accent', outputEl);
        appendLine('  1. Sha Collects   - Enterprise Route Cash Recovery & Daily Ledger Management (Flutter)', 'info', outputEl);
        appendLine('  2. RateTracker.in - Live Gold, Currency & Commodities Market Watch (Django/Tailwind)', 'info', outputEl);
        appendLine('  3. Boutique Book  - Client Management & Appointment Portal (Web Platform)', 'info', outputEl);
        appendLine('  4. Sign Language  - Computer Vision & AI Gesture-to-Text Recognition (Python)', 'info', outputEl);
        appendLine('  5. Steel Mountain - HVAC Environmental Control Exploit & Audit Simulator (Python)', 'info', outputEl);
        appendLine('  6. Jarvis AI      - Voice-Driven Modular Automation Assistant (Python)', 'info', outputEl);
        appendLine('  7. StrangerChat   - Ephemeral 1:1 Anonymous WebSockets Chat Room (Node/Sockets)', 'info', outputEl);
        appendLine('  Type "clear" to reset screen or browse the Projects section below.', 'success', outputEl);
        break;

      case 'experience':
        appendLine('Timeline & Credentials:', 'accent', outputEl);
        appendLine('  • 2020 – Present: Full Stack Engineering & Security Research (5+ Years)', 'info', outputEl);
        appendLine('  • Bachelor of Computer Application (BCA) — University of Calicut', 'info', outputEl);
        appendLine('  • Systems Auditor & Security Researcher — Web & API Hardening', 'info', outputEl);
        break;

      case 'contact':
        appendLine('Direct Channels:', 'accent', outputEl);
        appendLine('  • Email:    mrhavath@gmail.com / hadihavath125@gmail.com', 'success', outputEl);
        appendLine('  • WhatsApp: +91 9207659510 (wa.me/919207659510)', 'success', outputEl);
        appendLine('  • GitHub:   https://github.com/hadhihavath', 'info', outputEl);
        appendLine('  • LinkedIn: https://in.linkedin.com/in/hadhihavath', 'info', outputEl);
        appendLine('  • Web:      https://hadhihavath.in / hadhihavath.github.io/portfolio', 'info', outputEl);
        break;

      case 'cat':
        if (args === 'flag.txt') {
          appendLine('[RESTRICTED FILE ACCESS]', 'accent', outputEl);
          appendLine('Security Level: 4 (Encrypted Payload)', 'info', outputEl);
          appendLine('Cipher: Base64 UTF-8', 'info', outputEl);
          appendLine('Payload: aGFkaGlfaGFja2VyX2ZsYWdfMjAyNg==', 'error', outputEl);
          appendLine('Hint: Run "decrypt <payload>" to decode the root clearance token.', 'info', outputEl);
        } else {
          appendLine(`cat: ${args}: No such file or directory`, 'error', outputEl);
        }
        break;

      case 'decrypt':
        if (args === 'aGFkaGlfaGFja2VyX2ZsYWdfMjAyNg==') {
          appendLine('[DECRYPTION SUCCESSFUL]', 'success', outputEl);
          appendLine('Decoded Flag Key: hadhi_hacker_flag_2026', 'accent', outputEl);
          appendLine('Next step: Elevate permissions with: sudo root hadhi_hacker_flag_2026', 'info', outputEl);
        } else if (args) {
          try {
            appendLine(`Decoded output: ${atob(args)}`, 'success', outputEl);
          } catch (e) {
            appendLine('Error: Invalid Base64 payload string.', 'error', outputEl);
          }
        } else {
          appendLine('Usage: decrypt <base64_string>', 'error', outputEl);
        }
        break;

      case 'sudo':
        if (args.startsWith('root')) {
          const key = args.replace('root', '').trim();
          if (key === 'hadhi_hacker_flag_2026') {
            appendLine('=========================================', 'success', outputEl);
            appendLine('💥 ROOT ACCESS GRANTED: KERNEL OVERRIDE 💥', 'success', outputEl);
            appendLine('=========================================', 'success', outputEl);
            appendLine('Welcome Superuser! All defensive firewalls disabled.', 'accent', outputEl);
            appendLine('Special Developer Note: "Thank you for exploring my terminal. Let\'s build something extraordinary together!"', 'info', outputEl);
            appendLine('Direct priority line unlocked: mrhavath@gmail.com', 'success', outputEl);
            showToast('🎉 CTF Solved! Root Privileges Granted.');
          } else {
            appendLine('[ACCESS DENIED] Incorrect root clearance flag.', 'error', outputEl);
          }
        } else {
          appendLine('sudo: command not allowed for user "guest"', 'error', outputEl);
        }
        break;

      case 'theme': {
        const chosen = args.trim().toLowerCase();
        if (THEMES.includes(chosen)) {
          setTheme(chosen, true);
          appendLine(`Colour vibe updated to: ${chosen.toUpperCase()}`, 'success', outputEl);
          showToast(`Colour vibe: ${chosen}`);
        } else {
          appendLine(`Invalid vibe. Options: ${THEMES.join(', ')}`, 'error', outputEl);
        }
        break;
      }

      case 'clear':
        outputEl.innerHTML = '';
        return;

      case 'history':
        appendLine('Command history:', 'info', outputEl);
        history.forEach((h, i) => appendLine(`  ${i + 1}  ${h}`, 'info', outputEl));
        break;

      case 'github':
        window.open('https://github.com/hadhihavath', '_blank', 'noopener');
        appendLine('Redirecting to https://github.com/hadhihavath...', 'success', outputEl);
        break;

      case 'social':
        appendLine('Official Social Accounts:', 'accent', outputEl);
        appendLine('  GitHub:    https://github.com/hadhihavath', 'info', outputEl);
        appendLine('  LinkedIn:  https://in.linkedin.com/in/hadhihavath', 'info', outputEl);
        appendLine('  Instagram: https://instagram.com/hadihavath', 'info', outputEl);
        break;

      default:
        appendLine(`command not found: "${cmd}". Type "help" for a list of commands.`, 'error', outputEl);
        break;
    }
  }

  function appendLine(text, className, container) {
    const line = document.createElement('div');
    line.className = `terminal-line ${className || ''}`;
    line.textContent = text;
    container.appendChild(line);
  }

  /* ============================================================
     8. PROJECT FILTERS
     ============================================================ */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        const shown = [];
        projectCards.forEach(card => {
          const categories = (card.getAttribute('data-category') || '').split(' ');
          const match = filter === 'all' || categories.includes(filter);
          card.style.display = match ? '' : 'none';
          if (match) shown.push(card);
        });
        if (hasGSAP() && !reducedMotion) {
          window.gsap.fromTo(shown, { opacity: 0, rotateY: -35, z: -120, transformPerspective: 1000 }, {
            opacity: 1, rotateY: 0, z: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', overwrite: true,
          });
          window.ScrollTrigger.refresh();
        } else {
          shown.forEach(c => { c.style.opacity = '1'; });
        }
      });
    });
  }

  /* ============================================================
     9. CONTACT FORM → WHATSAPP
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('msg-name').value.trim();
      const email = document.getElementById('msg-email').value.trim();
      const message = document.getElementById('msg-body').value.trim();
      if (!name || !message) {
        showToast('⚠️ Please enter your name and message.');
        return;
      }
      const fullMessage = `Hello Muhammed Hadhi Havath,\n\nMy name is ${name} (${email || 'No email provided'}).\n\n${message}`;
      window.open(`https://wa.me/919207659510?text=${encodeURIComponent(fullMessage)}`, '_blank', 'noopener');
      showToast('🚀 Opening WhatsApp to deliver your message!');
      form.reset();
    });
  }

  /* ============================================================
     10. CLIPBOARD + TOAST
     ============================================================ */
  function initClipboardHelpers() {
    document.querySelectorAll('.copy-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const text = btn.getAttribute('data-copy');
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => showToast(`Copied to clipboard: ${text}`)).catch(() => window.prompt('Copy to clipboard:', text));
        } else {
          window.prompt('Copy to clipboard:', text);
        }
      });
    });
  }

  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = '';
    if (!(message.startsWith('🔒') || message.startsWith('⚠️'))) {
      const tick = document.createElement('span');
      tick.textContent = '✓';
      tick.style.color = '#2ee6a6';
      toast.appendChild(tick);
    }
    const msg = document.createElement('span');
    msg.textContent = message;
    toast.appendChild(msg);
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  /* ============================================================
     11. NAVIGATION: MOBILE MENU, SCROLL SPY, PROGRESS
     ============================================================ */
  function initMobileNav() {
    const toggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!toggle || !navMenu) return;
    const set = (open) => {
      navMenu.classList.toggle('mobile-open', open);
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => set(!navMenu.classList.contains('mobile-open')));
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => set(false)));
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const update = () => {
      let currentId = '';
      const probe = window.innerHeight * 0.4;
      sections.forEach(section => {
        const r = section.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) currentId = section.id;
      });
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.setProperty('--p', (window.scrollY / max).toFixed(4));
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ============================================================
     12. CLIENT-SIDE INSPECTION DETERRENTS
     ============================================================ */
  function initSecurityShield() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showToast('🔒 Source Code Protected — Muhammed Hadhi Havath');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showToast('⚠️ Developer Inspection Tools Disabled.');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        showToast('⚠️ Inspection shortcuts disabled.');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        showToast('🔒 Direct source viewing disabled.');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        showToast('🔒 Page saving disabled.');
      }
    });

    document.addEventListener('dragstart', (e) => {
      if (e.target && e.target.nodeName === 'IMG') e.preventDefault();
    });

    const bannerTitle = 'color:#7c4dff; font-size:18px; font-weight:800; font-family:monospace;';
    const bannerWarning = 'color:#ff3d7f; font-size:13px; font-weight:bold; font-family:monospace;';
    const bannerBody = 'color:#65628a; font-size:12px; line-height:1.6; font-family:sans-serif;';
    console.log('%c🛡️ HADHI HAVATH // SECURITY AUDITING & CODEBASE SHIELD', bannerTitle);
    console.log('%c[WARNING] Unauthorized copying, scraping, or redistribution of this software portfolio is prohibited.', bannerWarning);
    console.log('%cIdentity: Muhammed Hadhi Havath (Hadhi Havath / Havath)\nInquiries & Verification: mrhavath@gmail.com\nTerminal shell emulator and CTF challenges are active in the console section.', bannerBody);
  }
})();
