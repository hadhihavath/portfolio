/* mr.havath */
import { useEffect, useRef, useState } from "react";
import { profile, repos, stack } from "@/data/profile";
import { fetchVisitorLogs } from "@/lib/visitor-tracker";
import { GUEST_FILES, ROOT_FILES } from "@/data/virtual-fs";

type HistoryItem = {
  type: "input" | "output";
  text: string;
  prompt?: string;
};

export function Terminal() {
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: "input", prompt: "guest@hadhi:~$", text: "whoami" },
    { type: "output", text: "hadhi havath — full stack dev · ethical hacker · ai/ml researcher\nSpecializing in Python, Django, application security, and AI integrations." },
    { type: "input", prompt: "guest@hadhi:~$", text: "help" },
    { type: "output", text: "Available commands:\n  whoami   - About Hadhi Havath\n  skills   - List technical skills and stack\n  projects - List key projects\n  contact  - Display contact channels\n  status   - Check current availability\n  ls       - List virtual directory files\n  cat      - Display file contents\n  clear    - Clear terminal window\n  \nHint: Try listing directory files using 'ls'." }
  ]);
  
  const [input, setInput] = useState("");
  const [isRoot, setIsRoot] = useState(false);
  const [isWaitingForPassword, setIsWaitingForPassword] = useState(false);
  const [isWaitingForFlag, setIsWaitingForFlag] = useState(false);
  const [isElevating, setIsElevating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const adminPass = urlParams.get("admin") || urlParams.get("password") || urlParams.get("pass");
      const correctPassword = import.meta.env.VITE_ANALYTICS_PASSWORD || "mrhavath";

      if (adminPass === correctPassword) {
        setIsRoot(true);

        // Fetch logs silently and display immediately
        fetchVisitorLogs()
          .then((logs) => {
            let logTable = "IP Address      | Location                       | Device          | Date & Time\n";
            logTable += "----------------|--------------------------------|-----------------|---------------------\n";
            logs.forEach((log) => {
              const date = new Date(log.created_at).toLocaleString();
              const ip = log.ip.padEnd(15).substring(0, 15);
              const loc = log.location.padEnd(30).substring(0, 30);
              const dev = log.device.padEnd(15).substring(0, 15);
              logTable += `${ip} | ${loc} | ${dev} | ${date}\n`;
            });

            setHistory((prev) => [
              ...prev,
              { type: "input", prompt: "system@kernel:~#", text: "autologin --logs" },
              { type: "output", text: `[SUCCESS] Admin autologin completed.\n\nVisitor Database Logs:\n${logTable}` }
            ]);
          })
          .catch(() => {
            setHistory((prev) => [
              ...prev,
              { type: "output", text: "Autologin error: Failed to fetch visitor database logs." }
            ]);
          });

        // Clean up the URL search params so the password is not exposed in the browser bar/history
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  const executeBypassAnimation = () => {
    setIsElevating(true);
    setInput("");
    const steps = [
      { text: "\n[!] SYSTEM BREACH PROTOCOL INITIALIZED...", delay: 200 },
      { text: "[+] INJECTING SHELLCODE (Buffer Overflow exploit)...", delay: 800 },
      { text: "[+] ELEVATING PRIVILEGES (SetUID validation bypass)...", delay: 1400 },
      { text: "[+] SECURITY CONTEXT: root@hadhi:~#", delay: 2000 },
      { text: "\n[SUCCESS] ROOT SHELL UNLOCKED!\n\nType 'ls' to see unlocked administrative files.\nType 'cat resume.pdf' to view credentials.", delay: 2600 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setHistory((prev) => [...prev, { type: "output", text: step.text }]);
        if (index === 3) {
          setIsRoot(true);
        }
        if (index === steps.length - 1) {
          setIsElevating(false);
        }
      }, step.delay);
    });
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = input.trim();
      
      // 1. Password input for Visitor Logs
      if (isWaitingForPassword) {
        const correctPassword = import.meta.env.VITE_ANALYTICS_PASSWORD || "mrhavath";
        const newHistory = [
          ...history,
          { type: "input" as const, prompt: "Password: ", text: "********" }
        ];

        if (trimmedInput === correctPassword) {
          setHistory([
            ...newHistory,
            { type: "output", text: "Authenticating...\nAccess granted.\n\nFetching visitor logs..." }
          ]);
          setInput("");
          setIsWaitingForPassword(false);

          try {
            const logs = await fetchVisitorLogs();
            if (logs.length === 0) {
              setHistory((prev) => [
                ...prev,
                { type: "output", text: "No visitor logs found. Connect Supabase to track global traffic." }
              ]);
            } else {
              let logTable = "IP Address      | Location                       | Device          | Date & Time\n";
              logTable += "----------------|--------------------------------|-----------------|---------------------\n";

              logs.forEach((log) => {
                const date = new Date(log.created_at).toLocaleString();
                const ip = log.ip.padEnd(15).substring(0, 15);
                const loc = log.location.padEnd(30).substring(0, 30);
                const dev = log.device.padEnd(15).substring(0, 15);
                logTable += `${ip} | ${loc} | ${dev} | ${date}\n`;
              });

              setHistory((prev) => [...prev, { type: "output", text: logTable }]);
            }
          } catch (err) {
            setHistory((prev) => [
              ...prev,
              { type: "output", text: "Error: Failed to fetch visitor database logs." }
            ]);
          }
        } else {
          setHistory([
            ...newHistory,
            { type: "output", text: "Access denied: Invalid credentials." }
          ]);
          setInput("");
          setIsWaitingForPassword(false);
        }
        return;
      }

      // 2. Prompted flag input for Sudo Root
      if (isWaitingForFlag) {
        const newHistory = [
          ...history,
          { type: "input" as const, prompt: "Root Key: ", text: "********" }
        ];
        setInput("");
        setIsWaitingForFlag(false);

        if (trimmedInput === "system_breached_2026") {
          setHistory(newHistory);
          executeBypassAnimation();
        } else {
          setHistory([
            ...newHistory,
            { type: "output", text: "Access denied: Invalid privilege key payload." }
          ]);
        }
        return;
      }

      // 3. Normal command processing
      const currentPrompt = isRoot ? "root@hadhi:~#" : "guest@hadhi:~$";
      const newHistory = [...history, { type: "input" as const, prompt: currentPrompt, text: trimmedInput }];
      
      if (trimmedInput === "") {
        setHistory(newHistory);
        setInput("");
        return;
      }

      const cmdParts = trimmedInput.split(/\s+/);
      const baseCmd = cmdParts[0].toLowerCase();
      const arg = cmdParts.slice(1).join(" ");

      let output = "";
      switch (baseCmd) {
        case "help":
          output = isRoot
            ? "Available commands:\n  whoami   - About Hadhi Havath\n  skills   - List technical skills and stack\n  projects - List key projects\n  contact  - Display contact channels\n  status   - Check current availability\n  ls       - List virtual directory files\n  cat      - Display file contents (e.g. cat secret_dossier.txt)\n  clear    - Clear terminal window"
            : "Available commands:\n  whoami   - About Hadhi Havath\n  skills   - List technical skills and stack\n  projects - List key projects\n  contact  - Display contact channels\n  status   - Check current availability\n  ls       - List virtual directory files\n  cat      - Display file contents (e.g. cat flag.txt)\n  xor      - Decode XOR hex ciphers (e.g. xor <hex> <key>)\n  clear    - Clear terminal window\n  \nHint: Try listing files with 'ls'.";
          break;
        case "whoami":
          output = `Hadhi Havath — ${profile.tagline}\n"I build it, then I secure it."`;
          break;
        case "skills":
          output = `Technical Stack:\n  ${stack.join(" · ")}`;
          break;
        case "projects":
          output = `Recent Projects:\n` + repos.map(r => `  - ${r.name}: ${r.description} (${r.url})`).join("\n");
          break;
        case "contact":
          output = "Contact Channels:\n  - Email: mrhavath@gmail.com\n  - WhatsApp: +919207659510\n  - Instagram: instagram.com/mr.havath\n  - GitHub: github.com/hadhihavath";
          break;
        case "status":
          output = `Status Check:\n  - [OK] Active & Online\n  - Availability: Freelance, Full-time & Security Audits\n  - Location: World-wide (Remote friendly)`;
          break;
        case "clear":
          setHistory([]);
          setInput("");
          return;
        case "ls":
        case "dir":
          const filesList = isRoot ? ROOT_FILES : GUEST_FILES;
          output = Object.keys(filesList).join("    ");
          break;
        case "cat":
          if (!arg) {
            output = "usage: cat <filename>";
          } else {
            const files = isRoot ? ROOT_FILES : GUEST_FILES;
            const file = files[arg];
            if (file) {
              output = file.content;
              if (isRoot && arg === "resume.pdf") {
                window.open("https://github.com/hadhihavath", "_blank");
              }
            } else if (arg === "stack.txt") {
              output = `Technical Stack:\n  ${stack.join(" · ")}`;
            } else {
              output = `cat: ${arg}: No such file or directory`;
            }
          }
          break;
        case "xor":
          if (!arg) {
            output = "usage: xor <hex_ciphertext> <key>";
          } else {
            const xorParts = arg.split(/\s+/);
            const hexCipher = xorParts[0];
            const key = xorParts[1];

            if (!hexCipher || !key) {
              output = "usage: xor <hex_ciphertext> <key>";
            } else {
              try {
                if (hexCipher.length % 2 !== 0) {
                  throw new Error("Invalid hex length");
                }
                let result = "";
                for (let i = 0; i < hexCipher.length; i += 2) {
                  const hexByte = hexCipher.substring(i, i + 2);
                  const byteVal = parseInt(hexByte, 16);
                  if (isNaN(byteVal)) {
                    throw new Error("Invalid byte value");
                  }
                  const keyChar = key.charCodeAt((i / 2) % key.length);
                  result += String.fromCharCode(byteVal ^ keyChar);
                }
                output = `Decrypted: ${result}`;
              } catch {
                output = "xor: decryption error. Ensure input is a valid hex string.";
              }
            }
          }
          break;
        case "sudo":
          if (!arg) {
            output = "usage: sudo [command]";
          } else {
            const subParts = arg.split(/\s+/);
            const subCmd = subParts[0].toLowerCase();
            const subArg = subParts.slice(1).join(" ");
            
            if (subCmd === "root") {
              if (subArg) {
                if (subArg === "system_breached_2026") {
                  setHistory(newHistory);
                  executeBypassAnimation();
                  return;
                } else {
                  output = "sudo: access denied: invalid root token payload";
                }
              } else {
                setIsWaitingForFlag(true);
                setHistory(newHistory);
                setInput("");
                return;
              }
            } else if (subCmd === "logs" || subCmd === "visitors") {
              setIsWaitingForPassword(true);
              setHistory(newHistory);
              setInput("");
              return;
            } else {
              output = `sudo: command not found: ${subCmd}`;
            }
          }
          break;
        case "visitors":
        case "logs":
          setIsWaitingForPassword(true);
          setHistory(newHistory);
          setInput("");
          return;
        default:
          output = `command not found: ${trimmedInput}. Type 'help' for available commands.`;
          break;
      }
      
      setHistory([...newHistory, { type: "output", text: output }]);
      setInput("");
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`glass rounded-lg p-4 font-mono text-sm md:text-base border shadow-lg cursor-text transition-all duration-500 ${
        isRoot 
          ? "border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.25)]" 
          : "border-border/50"
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="mb-3 flex items-center gap-2 border-b border-border/30 pb-2 select-none">
        <span className={`size-3 rounded-full ${isRoot ? "bg-red-500 animate-pulse" : "bg-red-500/80"}`} />
        <span className="size-3 rounded-full bg-yellow-500/80" />
        <span className="size-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">
          {isRoot ? "root@hadhi: ~ (administrative shell)" : "guest@hadhi: ~ (interactive terminal)"}
        </span>
      </div>

      {/* Terminal Screen Content */}
      <div 
        ref={containerRef}
        className="max-h-72 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-border"
      >
        {history.map((item, index) => (
          <div key={index} className="whitespace-pre-wrap leading-relaxed">
            {item.type === "input" ? (
              <div className="flex gap-2">
                <span className="text-[color:var(--neon)] select-none">{item.prompt}</span>
                <span>{item.text}</span>
              </div>
            ) : (
              <div className="text-muted-foreground">{item.text}</div>
            )}
          </div>
        ))}
        
        {/* Active Input Line */}
        {!isElevating && (
          <div className="flex items-center gap-2">
            <span className="text-[color:var(--neon)] select-none">
              {isWaitingForPassword 
                ? "Password: " 
                : isWaitingForFlag 
                  ? "Root Key: " 
                  : isRoot 
                    ? "root@hadhi:~#" 
                    : "guest@hadhi:~$"}
            </span>
            <input
              ref={inputRef}
              type={isWaitingForPassword || isWaitingForFlag ? "password" : "text"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-foreground caret-[color:var(--neon)] font-mono p-0 focus:ring-0"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
        )}

        {isElevating && (
          <div className="text-[color:var(--neon-2)] animate-pulse font-mono text-xs select-none">
            Executing exploit payload... Please hold.
          </div>
        )}
      </div>
    </div>
  );
}
