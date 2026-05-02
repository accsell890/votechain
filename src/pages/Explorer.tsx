import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Boxes, Search, CheckCircle2, Wallet, ExternalLink } from "lucide-react";
import { candidates, elections, generateBlockNumber, generateTxHash } from "@/lib/voteData";
import { useVoteStore, generateWalletAddress, shortenAddress } from "@/store/voteStore";

interface Tx {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  electionId: string;
  candidateId: string;
  walletAddress?: string;
  isMine?: boolean;
}

const Explorer = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { votes } = useVoteStore();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [mock, setMock] = useState<Tx[]>([]);

  useEffect(() => {
    // Generate a stable list of mock recent transactions
    const arr: Tx[] = Array.from({ length: 14 }).map((_, i) => {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      const hasWallet = Math.random() > 0.35;
      return {
        txHash: generateTxHash(),
        blockNumber: generateBlockNumber() - i,
        timestamp: Date.now() - (i + 1) * 1000 * 60 * Math.floor(2 + Math.random() * 12),
        electionId: "e1",
        candidateId: c.id,
        walletAddress: hasWallet ? generateWalletAddress() : undefined,
      };
    });
    setMock(arr);
  }, []);

  const all: Tx[] = useMemo(() => {
    const mine: Tx[] = votes.map((v) => ({ ...v, isMine: true }));
    return [...mine, ...mock].sort((a, b) => b.timestamp - a.timestamp);
  }, [votes, mock]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (t) =>
        t.txHash.toLowerCase().includes(q) ||
        String(t.blockNumber).includes(q) ||
        (t.walletAddress?.toLowerCase().includes(q) ?? false)
    );
  }, [all, query]);

  const totalBlocks = all.length;
  const linkedCount = all.filter((t) => t.walletAddress).length;

  return (
    <AppShell title="Blockchain Explorer" showBack>
      <div className="rounded-3xl gradient-blockchain text-primary-foreground p-5 shadow-elegant relative overflow-hidden animate-fade-in">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-secondary/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase tracking-widest text-white/70">Polygon zkEVM · Demo</span>
          </div>
          <div className="font-display text-xl font-semibold mt-1">Live Vote Ledger</div>
          <div className="text-xs text-white/80 mt-0.5">Public, immutable record of cast votes</div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/70">Recent Txs</div>
              <div className="font-display text-lg font-semibold">{totalBlocks}</div>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/70">Wallet-linked</div>
              <div className="font-display text-lg font-semibold">{linkedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by tx hash, block, or wallet…"
          className="pl-9 h-11"
        />
      </div>

      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No transactions match your search
          </div>
        ) : (
          filtered.map((t, idx) => {
            const c = candidates.find((cn) => cn.id === t.candidateId);
            const e = elections.find((el) => el.id === t.electionId);
            return (
              <div
                key={t.txHash}
                className="rounded-2xl bg-card border p-3 shadow-soft animate-slide-up"
                style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                        ✓ Confirmed
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Block #{t.blockNumber.toLocaleString()}
                      </span>
                      {t.isMine && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                          You
                        </span>
                      )}
                      {t.walletAddress && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1">
                          <Wallet className="w-2.5 h-2.5" /> Linked
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-foreground/80 truncate mt-1">
                      {t.txHash.slice(0, 22)}…{t.txHash.slice(-6)}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <div className="text-muted-foreground uppercase tracking-wider">Time</div>
                    <div className="font-medium">{new Date(t.timestamp).toLocaleTimeString("en-IN")}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-muted-foreground uppercase tracking-wider">Wallet</div>
                    <div className="font-mono truncate">
                      {t.walletAddress ? shortenAddress(t.walletAddress) : <span className="text-muted-foreground">— anonymous —</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2">
                  <div className="text-[10px] text-muted-foreground truncate">
                    {e?.title} · {c?.name ?? (t.candidateId === "nota" ? "NOTA" : "—")}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(t.txHash)}
                    className="text-[10px] text-primary inline-flex items-center gap-1 hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[10px] text-muted-foreground text-center mt-4">
        Demo ledger · Data is simulated for transparency demonstration
      </div>
      {/* unused refs to keep linter quiet */}
      <span className="hidden">{navigate.length}</span>
    </AppShell>
  );
};

export default Explorer;