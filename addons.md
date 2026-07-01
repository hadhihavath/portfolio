# 🛠️ Cyberpunk & Ethical Hacker Portfolio Addons

Enhance your portfolio with high-fidelity, interactive, and gamified features to showcase your skills as a developer and security researcher. Below are several creative concepts tailored to your personal brand: **"I build it, then I secure it."**

---

## 1. Terminal Upgrades (Zsh/Bash Feel)

Make the interactive terminal feel like a fully functioning shell with standard console features.

### 💡 Features to Add

- **Command History (Up/Down Arrows)**: Allow users to navigate previously typed commands using the `ArrowUp` and `ArrowDown` keys.
- **Tab Autocomplete**: Pressing `Tab` should automatically complete partially typed commands or list matching possibilities.
- **Mechanical Keyboard Sounds**: Add subtle, high-fidelity mechanical click audio effects when the user types in the terminal to enhance tactile feedback.

### 🛠️ Implementation Outline

1. Maintain a state array of `historyIndex` and `commandHistory`.
2. Intercept keypresses in the input field:
   - `ArrowUp`: Fetch `commandHistory[historyIndex - 1]`.
   - `Tab`: Query matches from the command list (`whoami`, `skills`, `projects`, etc.). If a match is found, replace the input.

---

## 2. "Hack Me" Capture The Flag (CTF) Mini-Game

Engage recruiters and security enthusiasts with a hidden client-side hacking challenge.

### 💡 Features to Add

- **System Vulnerability**: Leave a hidden "vulnerability" in your terminal. For example, typing `cat flag.txt` prints a scrambled base64 string.
- **The Decryption Challenge**: The user has to reverse-engineer a simple rot13 or base64 cipher in the console to obtain the "Root Access Key."
- **The Reward**: Entering the correct flag with `sudo root <key>` triggers a full terminal takeover animation (like a red alarm, system breach graphics, or a custom matrix screen) and unlocks a hidden recruiter contact form or resume link.

### 🛡️ Example Terminal Output

```bash
guest@hadhi:~$ cat flag.txt
[LOCKED] Encrypted security clearance required.
Encryption: Base64
Encrypted Payload: aGFkaGlfaGFja2VyX2ZsYWdfMjAyNg==

guest@hadhi:~$ decrypt aGFkaGlfaGFja2VyX2ZsYWdfMjAyNg==
Decoding... Result: hadhi_hacker_flag_2026

guest@hadhi:~$ sudo root hadhi_hacker_flag_2026
Accessing Kernel...
[SUCCESS] Access Granted. Unlocking secret developer files...
```

---

## 3. Dynamic Color Theme Swapping (`theme <color>`)

Give users control over the visual ambiance of your portfolio using native CSS variable updates.

### 💡 Features to Add

- Allow terminal commands like:
  - `theme green` (Classic Matrix)
  - `theme red` (Cyber-Alert)
  - `theme blue` (Synthwave/Ice)
  - `theme purple` (Purple Neon)
- The chosen theme instantly changes all neon accent lines, text colors, and floating orbs across the entire page.

### 🛠️ Implementation Outline

Assign colors using CSS custom variables in `styles.css`:

```css
:root {
  --neon: #00ff66; /* default green */
}
```

Update these variables programmatically on command entry:

```typescript
document.documentElement.style.setProperty("--neon", "#ff0033"); // for red theme
```

---

## 4. Cyber Threat / Pentester Status Dashboard

Add a dynamic, visual widget next to your projects that simulates an active vulnerability analysis or automated security scan.

### 💡 Features to Add

- A stylized canvas or animated component labeled `SecOps Monitor`.
- Shows a scrolling feed of mock logs like:
  - `[INFO] Scanning port 80... [CLOSED]`
  - `[WARN] Outdated dependencies detected (mock)...`
  - `[OK] CORS headers secure.`
- Features a circular dial/progress ring representing your "Defensive Security Rating (100/100)".

---

## 5. Live GitHub Branch Log

Allow users to inspect your development commits directly from the console.

### 💡 Features to Add

- **`git log` Command**: Fetches your repository's latest commits from the GitHub API and displays them as a formatted commits list inside the terminal.
- **`git status` Command**: Shows mock working directory status pointing to your active freelance or hiring availability.

---

### 🚀 Next Steps

You can start building any of these features right here! If you want to proceed with one of them, simply say:

- _"Let's implement the CTF mini-game"_
- _"Let's add the dynamic theme swapping command"_
- _"Let's add command history and autocomplete"_
