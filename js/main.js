/**
 * Muhammed Hadhi Havath — Official Portfolio Interactive Logic
 * Features:
 * - Cyberpunk Shell Terminal with Web Audio mechanical clicks
 * - CTF Hack-Me Challenge
 * - Dynamic Theme Switching
 * - Project Filter System
 * - Clipboard Helpers & Toast Feedback
 * - WhatsApp Quick Message Launcher
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTerminal();
  initProjectFilters();
  initContactForm();
  initClipboardHelpers();
  initMobileNav();
  initScrollSpy();
});

/* ============================================================
   1. THEME CONTROLLER
   ============================================================ */
function initTheme() {
  const savedTheme = localStorage.getItem('hadhi_theme') || 'emerald';
  setTheme(savedTheme);

  const themeDots = document.querySelectorAll('.theme-dot');
  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.getAttribute('data-theme');
      setTheme(theme);
    });
  });
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('hadhi_theme', theme);

  const themeDots = document.querySelectorAll('.theme-dot');
  themeDots.forEach(dot => {
    if (dot.getAttribute('data-theme') === theme) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/* ============================================================
   2. SYNTHESIZED AUDIO (MECHANICAL KEYBOARD SWITCH CLICK)
   ============================================================ */
let audioCtx = null;
let soundEnabled = false;

function playKeyClickSound() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    // Randomize pitch slightly for tactile mechanical feel
    osc.frequency.setValueAtTime(320 + Math.random() * 80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    // Audio context silently ignored if restricted
  }
}

/* ============================================================
   3. CYBERPUNK INTERACTIVE TERMINAL EMULATOR
   ============================================================ */
function initTerminal() {
  const inputEl = document.getElementById('terminal-input');
  const outputEl = document.getElementById('terminal-output');
  const soundBtn = document.getElementById('terminal-sound-btn');
  const terminalBody = document.querySelector('.terminal-body');

  if (!inputEl || !outputEl) return;

  const commandHistory = [];
  let historyIndex = -1;

  const validCommands = [
    'help', 'whoami', 'skills', 'projects', 'experience',
    'contact', 'cat flag.txt', 'decrypt', 'sudo root',
    'theme emerald', 'theme cyan', 'theme purple', 'theme amber',
    'clear', 'history', 'github', 'social'
  ];

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.classList.toggle('active', soundEnabled);
      soundBtn.textContent = soundEnabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
      if (soundEnabled) playKeyClickSound();
    });
  }

  // Focus terminal input when clicking anywhere in terminal body
  terminalBody.addEventListener('click', () => {
    inputEl.focus();
  });

  inputEl.addEventListener('keydown', (e) => {
    playKeyClickSound();

    if (e.key === 'Enter') {
      const rawInput = inputEl.value.trim();
      if (!rawInput) return;

      commandHistory.push(rawInput);
      historyIndex = commandHistory.length;

      executeCommand(rawInput, outputEl);
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
      if (match) {
        inputEl.value = match;
      }
    }
  });
}

function executeCommand(cmd, outputEl) {
  // Echo the command
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
      appendLine('  theme <color> - Switch UI theme (emerald, cyan, purple, amber)', 'info', outputEl);
      appendLine('  cat flag.txt  - [CTF] Inspect secret challenge security file', 'info', outputEl);
      appendLine('  decrypt <txt> - [CTF] Decrypt encrypted credentials', 'info', outputEl);
      appendLine('  sudo root <k> - [CTF] Execute root system verification', 'info', outputEl);
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
          const decoded = atob(args);
          appendLine(`Decoded output: ${decoded}`, 'success', outputEl);
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

    case 'theme':
      const chosenTheme = args.trim().toLowerCase();
      if (['emerald', 'cyan', 'purple', 'amber'].includes(chosenTheme)) {
        setTheme(chosenTheme);
        appendLine(`Theme updated to: ${chosenTheme.toUpperCase()}`, 'success', outputEl);
        showToast(`Theme switched to ${chosenTheme}`);
      } else {
        appendLine('Invalid theme. Options: emerald, cyan, purple, amber', 'error', outputEl);
      }
      break;

    case 'clear':
      outputEl.innerHTML = '';
      return;

    case 'history':
      appendLine('Command history:', 'info', outputEl);
      break;

    case 'github':
      window.open('https://github.com/hadhihavath', '_blank');
      appendLine('Redirecting to https://github.com/hadhihavath...', 'success', outputEl);
      break;

    case 'social':
      appendLine('Official Social Accounts:', 'accent', outputEl);
      appendLine('  GitHub:    https://github.com/hadhihavath', 'info', outputEl);
      appendLine('  LinkedIn:  https://in.linkedin.com/in/hadhihavath', 'info', outputEl);
      appendLine('  Instagram: https://instagram.com/hadhihavath', 'info', outputEl);
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
   4. PROJECT FILTERS
   ============================================================ */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ============================================================
   5. CONTACT FORM & WHATSAPP GENERATOR
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
      alert('Please enter your name and message.');
      return;
    }

    const fullMessage = `Hello Muhammed Hadhi Havath,\n\nMy name is ${name} (${email || 'No email provided'}).\n\n${message}`;
    const encoded = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/919207659510?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
    showToast('🚀 Opening WhatsApp to deliver your message!');
    form.reset();
  });
}

/* ============================================================
   6. CLIPBOARD HELPERS & TOAST
   ============================================================ */
function initClipboardHelpers() {
  const copyButtons = document.querySelectorAll('.copy-trigger');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied to clipboard: ${textToCopy}`);
      }).catch(() => {
        // Fallback prompt
        prompt('Copy to clipboard:', textToCopy);
      });
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:var(--primary);">✓</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ============================================================
   7. MOBILE NAVIGATION TOGGLE
   ============================================================ */
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!toggle || !navMenu) return;

  toggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
    toggle.textContent = navMenu.classList.contains('mobile-open') ? '✕' : '☰';
  });

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('mobile-open');
      toggle.textContent = '☰';
    });
  });
}

/* ============================================================
   8. SCROLL SPY ACTIVE NAVIGATION
   ============================================================ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}
