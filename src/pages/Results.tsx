import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { candidates as base, elections } from "@/lib/voteData";
import { ShieldCheck, Activity } from "lucide-react";

const Results = () => {
  const { id = "e1" } = useParams();
  const election = elections.find((e) => e.id === id);
  const [data, setData] = useState(base);

  useEffect(() => {
    const i = setInterval(() => {
      setData((prev) =>
        prev.map((c) => ({ ...c, votes: c.votes + Math.floor(Math.random() * 25) }))
      );
    }, 2000);
    return () => clearInterval(i);
  }, []);

  const sorted = [...data].sort((a, b) => b.votes - a.votes);
  const total = sorted.reduce((s, c) => s + c.votes, 0);

  return (
    <AppShell title="Live Results" showBack>
      <div className="rounded-2xl gradient-hero text-primary-foreground p-4 shadow-elegant">
        <div className="text-[10px] uppercase tracking-widest text-white/70">Election</div>
        <div className="font-display font-semibold text-base leading-snug">{election?.title}</div>
        <div className="text-xs text-white/80 mt-0.5">{election?.region}</div>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-full border border-white/20">
            <Activity className="w-3 h-3 text-secondary animate-pulse" /> Live
          </span>
          <span className="opacity-90 font-mono">{total.toLocaleString("en-IN")} votes counted</span>
        </div>
      </div>

      <div className="space-y-3 mt-5">
        {sorted.map((c, idx) => {
          const pct = (c.votes / total) * 100;
          return (
            <div key={c.id} className="rounded-2xl bg-card border p-4 shadow-soft animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `hsl(${c.color} / 0.15)` }}
                  >
                    {c.symbol}
                  </div>
                  {idx === 0 && (
                    <div className="absolute -top-1 -right-1 text-[9px] font-bold bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 shadow-saffron">
                      #1
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.partyShort} · {c.party}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm" style={{ color: `hsl(${c.color})` }}>{pct.toFixed(1)}%</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{c.votes.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, hsl(${c.color}), hsl(${c.color} / 0.7))` }}
                >
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl bg-accent/10 border border-accent/30 p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-foreground/80">
          All votes are <strong>publicly verifiable</strong> on the blockchain. Anyone can audit results in real time using the transaction hash.
        </div>
      </div>
    </AppShell>
  );
};

export default Results;
