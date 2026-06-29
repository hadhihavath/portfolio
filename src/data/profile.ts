export const profile = {
  name: "Hadhi Havath",
  handle: "hadhihavath",
  avatar: "https://avatars.githubusercontent.com/u/64075280?v=4",
  bio: "I build it, then I secure it.",
  tagline:
    "Full Stack Developer specializing in Python & Django. Ethical Hacking & AI/ML Researcher.",
  github: "https://github.com/hadhihavath",
  followers: 1,
  following: 3,
  publicRepos: 36,
  since: "April 2020",
  hireable: true,
};

export const stack = [
  "Python", "Django", "TypeScript", "JavaScript", "PHP", "Java", "C",
  "Shell", "HTML", "Tailwind", "AI / ML", "Ethical Hacking",
  "Penetration Testing", "OWASP", "Linux", "Git",
];

export type Repo = {
  name: string;
  description: string;
  language: string | null;
  url: string;
  stars: number;
  forks: number;
};

// curated highlights from the public GitHub feed
export const repos: Repo[] = [
  { name: "jarvis", language: "Python", description: "Personal AI assistant — voice-driven, modular skills, automation.", url: "https://github.com/hadhihavath/jarvis", stars: 0, forks: 0 },
  { name: "ai_detector", language: "HTML", description: "AI-generated content detector — heuristics + model scoring.", url: "https://github.com/hadhihavath/ai_detector", stars: 0, forks: 0 },
  { name: "wifi-security-check", language: "HTML", description: "Audit nearby Wi-Fi for weak auth, open ports & rogue APs.", url: "https://github.com/hadhihavath/wifi-security-check", stars: 0, forks: 0 },
  { name: "ocr", language: "HTML", description: "Lightweight in-browser OCR pipeline with preview & export.", url: "https://github.com/hadhihavath/ocr", stars: 0, forks: 0 },
  { name: "disk-cleaner", language: "TypeScript", description: "Cross-platform disk analyzer & junk file purger.", url: "https://github.com/hadhihavath/disk-cleaner", stars: 0, forks: 0 },
  { name: "ratetracker.in", language: "JavaScript", description: "Live rate tracker — currency & commodities dashboard.", url: "https://github.com/hadhihavath/ratetracker.in", stars: 0, forks: 0 },
  { name: "emojicrypt", language: "HTML", description: "Toy cipher that encodes plaintext into emoji sequences.", url: "https://github.com/hadhihavath/emojicrypt", stars: 0, forks: 0 },
  { name: "strangerchat", language: "HTML", description: "Anonymous 1:1 chat room — sockets, rooms, ephemeral.", url: "https://github.com/hadhihavath/strangerchat", stars: 0, forks: 0 },
  { name: "okhota", language: "HTML", description: "Field-ops companion app — recon, notes, geo-tagging.", url: "https://github.com/hadhihavath/okhota", stars: 0, forks: 0 },
  { name: "phonepe", language: "HTML", description: "PhonePe-style UI clone exploring fintech flows.", url: "https://github.com/hadhihavath/phonepe", stars: 0, forks: 0 },
  { name: "face", language: "HTML", description: "Face detection / recognition demo in the browser.", url: "https://github.com/hadhihavath/face", stars: 0, forks: 0 },
  { name: "ainus", language: "PHP", description: "PHP service experiment — auth, sessions & dashboards.", url: "https://github.com/hadhihavath/ainus", stars: 0, forks: 0 },
];
