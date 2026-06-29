import { useEffect, useState } from "react";

const lines = [
  { p: "guest@hadhi:~$", t: "whoami" },
  { p: "", t: "hadhi havath — full stack dev · ethical hacker · ai/ml researcher" },
  { p: "guest@hadhi:~$", t: "cat stack.txt" },
  { p: "", t: "python · django · javascript · typescript · php · java · c · shell · ai/ml" },
  { p: "guest@hadhi:~$", t: "./status --hire" },
  { p: "", t: "[OK] open to work · world-wide · remote-friendly" },
  { p: "guest@hadhi:~$", t: "_" },
];

export function Terminal() {
  const [shown, setShown] = useState<{ p: string; t: string }[]>([]);
  const [typing, setTyping] = useState("");
  const [li, setLi] = useState(0);
  const [ci, setCi] = useState(0);

  useEffect(() => {
    if (li >= lines.length) return;
    if (ci < lines[li].t.length) {
      const id = setTimeout(() => {
        setTyping(lines[li].t.slice(0, ci + 1));
        setCi(ci + 1);
      }, 22);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setShown((s) => [...s, lines[li]]);
      setTyping("");
      setCi(0);
      setLi(li + 1);
    }, 280);
    return () => clearTimeout(id);
  }, [li, ci]);

  return (
    <div className="glass rounded-lg p-4 font-mono text-sm md:text-base">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <span className="size-3 rounded-full bg-red-500/80" />
        <span className="size-3 rounded-full bg-yellow-500/80" />
        <span className="size-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">~/hadhi — zsh</span>
      </div>
      <div className="space-y-1">
        {shown.map((l, i) => (
          <div key={i} className="flex gap-2">
            {l.p && <span className="text-[color:var(--neon)]">{l.p}</span>}
            <span className={l.p ? "" : "text-muted-foreground"}>{l.t}</span>
          </div>
        ))}
        {li < lines.length && (
          <div className="flex gap-2">
            {lines[li].p && <span className="text-[color:var(--neon)]">{lines[li].p}</span>}
            <span className={lines[li].p ? "" : "text-muted-foreground"}>
              {typing}
              <span className="animate-blink">▋</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
