import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import BlockchainAnimation from "@/components/BlockchainAnimation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink, Loader2, Link2 } from "lucide-react";
import { candidates, generateBlockNumber, generateTxHash } from "@/lib/voteData";
import { addVote, getWallet, shortenAddress } from "@/store/voteStore";
import { FoxIcon } from "@/components/WalletConnect";
import { toast } from "sonner";

const Confirm = () => {
  const { id = "e1", cid = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = getWallet();
  const linkWallet = !!(location.state as any)?.linkWallet && !!wallet;
  const linkedAddress = linkWallet && wallet ? wallet.address : undefined;
  const [stage, setStage] = useState<"signing" | "mining" | "done">("signing");
  const [tx] = useState(generateTxHash());
  const [block] = useState(generateBlockNumber());
  const [ts] = useState(Date.now());

  const candidate = candidates.find((c) => c.id === cid);
  const display = cid === "nota" ? "NOTA" : candidate?.name ?? "Unknown";

  useEffect(() => {
    const t1 = setTimeout(() => setStage("mining"), 1100);
    const t2 = setTimeout(() => {
      setStage("done");
      addVote({ electionId: id, candidateId: cid, txHash: tx, blockNumber: block, timestamp: ts, walletAddress: linkedAddress });
      toast.success("Vote sealed on blockchain");
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [id, cid, tx, block, ts, linkedAddress]);

  const stages = [
    { key: "signing", label: "Signing transaction with private key" },
    { key: "mining", label: "Broadcasting to blockchain network" },
    { key: "done", label: "Vote sealed in block " + block },
  ];

  return (
    <AppShell title="Blockchain Confirmation">
      <div className="rounded-3xl gradient-blockchain text-primary-foreground p-5 shadow-elegant text-center animate-fade-in">
        <div className="text-[10px] uppercase tracking-widest text-white/70">Vote Cast For</div>
        <div className="font-display text-xl font-semibold mt-1">{display}</div>
        <BlockchainAnimation />
        <div className="text-xs text-white/80">
          {stage !== "done" ? "Recording your vote on the immutable ledger…" : "Successfully recorded on blockchain"}
        </div>
      </div>

      {/* Steps */}
      <div className="mt-5 space-y-2">
        {stages.map((s, i) => {
          const stageIdx = stages.findIndex((x) => x.key === stage);
          const status = i < stageIdx ? "done" : i === stageIdx ? "active" : "pending";
          return (
            <div key={s.key} className="flex items-center gap-3 rounded-xl bg-card border p-3 shadow-soft">
              {status === "done" ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : status === "active" ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
              )}
              <div className={`text-sm ${status === "pending" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Receipt */}
      {stage === "done" && (
        <div className="mt-5 rounded-2xl bg-card border p-4 shadow-soft animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="font-semibold text-sm">Vote Successfully Recorded</div>
              <div className="text-[11px] text-muted-foreground">on Polygon zkEVM Mainnet</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <Row label="Transaction Hash" value={tx.slice(0, 16) + "…" + tx.slice(-6)} fullValue={tx} />
            <Row label="Block Number" value={"#" + block.toLocaleString()} />
            <Row label="Timestamp" value={new Date(ts).toLocaleString("en-IN")} />
            <Row label="Network" value="Polygon zkEVM" />
            <Row label="Status" value="✓ Confirmed" valueClass="text-accent font-semibold" />
            {linkedAddress && (
              <Row label="Wallet" value={shortenAddress(linkedAddress)} fullValue={linkedAddress} valueClass="text-secondary font-semibold" />
            )}
          </div>

          {linkedAddress && (
            <div className="mt-3 rounded-xl bg-secondary/10 border border-secondary/30 p-3 flex items-center gap-2">
              <FoxIcon className="w-5 h-5" />
              <div className="text-[11px] flex-1">
                <div className="font-semibold flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> Wallet-linked transaction
                </div>
                <div className="text-muted-foreground">Your vote hash is securely mapped to your wallet</div>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(tx); toast.success("Hash copied"); }}>
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Hash
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/explorer?q=" + tx)}>
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View on Explorer
            </Button>
          </div>

          <Button
            className="w-full mt-3 h-11 gradient-hero text-primary-foreground shadow-elegant"
            onClick={() => navigate("/results/" + id)}
          >
            View Live Results
          </Button>
        </div>
      )}
    </AppShell>
  );
};

const Row = ({ label, value, fullValue, valueClass = "" }: { label: string; value: string; fullValue?: string; valueClass?: string }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0 border-border/60">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <button
      onClick={() => fullValue && (navigator.clipboard.writeText(fullValue), toast.success("Copied"))}
      className={`text-xs font-mono text-right truncate max-w-[60%] ${valueClass} ${fullValue ? "hover:text-primary" : ""}`}
    >
      {value}
    </button>
  </div>
);

export default Confirm;
