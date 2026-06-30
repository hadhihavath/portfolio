/* mr.havath */
import { useEffect, useRef, useState } from "react";
import { profile, repos, stack } from "@/data/profile";
import { fetchVisitorLogs } from "@/lib/visitor-tracker";

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
    { type: "output", text: "Available commands:\n  whoami   - About Hadhi Havath\n  skills   - List technical skills and stack\n  projects - List key projects\n  contact  - Display contact channels\n  status   - Check current availability\n  clear    - Clear terminal window" }
  ]);
  
  const [input, setInput] = useState("");
  const [isWaitingForPassword, setIsWaitingForPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = input.trim();
      
      if (isWaitingForPassword) {
        const correctPassword = import.meta.env.VITE_ANALYTICS_PASSWORD || "mrhavath";
        const newHistory = [
          ...history,
          { type: "input" as const, prompt: "Password:", text: "********" }
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

      const newHistory = [...history, { type: "input" as const, prompt: "guest@hadhi:~$", text: trimmedInput }];
      
      if (trimmedInput === "") {
        setHistory(newHistory);
        setInput("");
        return;
      }

      let output = "";
      switch (trimmedInput.toLowerCase()) {
        case "help":
          output = "Available commands:\n  whoami   - About Hadhi Havath\n  skills   - List technical skills and stack\n  projects - List key projects\n  contact  - Display contact channels\n  status   - Check current availability\n  clear    - Clear terminal window";
          break;
        case "whoami":
          output = `Hadhi Havath — ${profile.tagline}\n"I build it, then I secure it."`;
          break;
        case "skills":
        case "cat stack.txt":
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
        case "sudo logs":
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
      className="glass rounded-lg p-4 font-mono text-sm md:text-base border border-border/50 shadow-lg cursor-text"
    >
      {/* Terminal Title Bar */}
      <div className="mb-3 flex items-center gap-2 border-b border-border/30 pb-2 select-none">
        <span className="size-3 rounded-full bg-red-500/80 animate-pulse" />
        <span className="size-3 rounded-full bg-yellow-500/80" />
        <span className="size-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">guest@hadhi: ~ (interactive terminal)</span>
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
        <div className="flex items-center gap-2">
          <span className="text-[color:var(--neon)] select-none">
            {isWaitingForPassword ? "Password: " : "guest@hadhi:~$"}
          </span>
          <input
            ref={inputRef}
            type={isWaitingForPassword ? "password" : "text"}
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
      </div>
    </div>
  );
}
