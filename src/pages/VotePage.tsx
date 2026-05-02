import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ShieldCheck, Link2 } from "lucide-react";
import { candidates, elections } from "@/lib/voteData";
import { Switch } from "@/components/ui/switch";
import { FoxIcon } from "@/components/WalletConnect";
import { shortenAddress } from "@/store/voteStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVoteStore } from "@/store/voteStore";
import { toast } from "sonner";

const VotePage = () => {
  const { id = "e1" } = useParams();
  const navigate = useNavigate();
  const election = elections.find((e) => e.id === id);
  const { hasVoted, wallet } = useVoteStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [linkWallet, setLinkWallet] = useState<boolean>(!!wallet);

  if (!election) { navigate("/dashboard"); return null; }

  if (hasVoted(id)) {
    return (
      <AppShell title="Vote" showBack>
        <div className="rounded-2xl bg-card border p-6 text-center shadow-soft animate-fade-in">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-2" />
          <div className="font-display font-semibold text-lg">You have already voted</div>
          <p className="text-sm text-muted-foreground mt-1">Your vote is permanently recorded on the blockchain.</p>
          <Button className="mt-4 gradient-hero text-primary-foreground" onClick={() => navigate("/results/" + id)}>
            View Live Results
          </Button>
        </div>
      </AppShell>
    );
  }

  const cast = () => {
    setConfirmOpen(false);
    navigate("/confirm/" + id + "/" + selected, { state: { linkWallet: linkWallet && !!wallet } });
  };

  return (
    <AppShell title="Cast Your Vote" showBack>
      <div className="rounded-2xl gradient-hero text-primary-foreground p-4 shadow-elegant animate-fade-in">
        <div className="text-[10px] uppercase tracking-widest text-white/70">Election</div>
        <div className="font-display font-semibold text-base leading-snug">{election.title}</div>
        <div className="text-xs text-white/80 mt-0.5">{election.region}</div>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-white/15 border border-white/20">
          <ShieldCheck className="w-3 h-3 text-secondary" /> Encrypted Ballot
        </div>
      </div>

      <h3 className="font-semibold text-sm mt-5 mb-2 text-muted-foreground uppercase tracking-wider">Select Candidate</h3>

      <div className="space-y-2.5">
        {candidates.map((c, idx) => {
          const isSel = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-smooth animate-slide-up ${
                isSel
                  ? "border-primary bg-primary/5 shadow-elegant ring-2 ring-primary/20"
                  : "bg-card hover:border-primary/40"
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-soft flex-shrink-0"
                style={{ background: `hsl(${c.color} / 0.15)` }}
              >
                {c.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">{c.party}</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: `hsl(${c.color})` }}>
                  {c.partyShort}
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-smooth ${
                isSel ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {isSel && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}

        <button
          onClick={() => setSelected("nota")}
          className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-smooth ${
            selected === "nota" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card hover:border-primary/40"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
            NOTA
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">None Of The Above</div>
            <div className="text-xs text-muted-foreground">Reject all candidates</div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selected === "nota" ? "border-primary bg-primary" : "border-muted-foreground/30"
          }`}>
            {selected === "nota" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
          </div>
        </button>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 -mx-4 px-4 pt-4 pb-2 mt-6 bg-gradient-to-t from-background via-background to-transparent">
        {/* Link to wallet (optional) */}
        {wallet ? (
          <div className="rounded-xl bg-secondary/10 border border-secondary/30 p-3 mb-3 flex items-center gap-3">
            <FoxIcon className="w-6 h-6" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Link Vote to Wallet
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {linkWallet
                  ? "Your vote hash is securely mapped to your wallet"
                  : shortenAddress(wallet.address)}
              </div>
            </div>
            <Switch checked={linkWallet} onCheckedChange={setLinkWallet} />
          </div>
        ) : (
          <div className="rounded-xl bg-muted/40 border border-dashed p-3 mb-3 text-[11px] text-muted-foreground flex items-center gap-2">
            <FoxIcon className="w-5 h-5 opacity-70" />
            Connect a wallet from your profile to optionally link this vote.
          </div>
        )}

        <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-foreground/80">
            <strong>Warning:</strong> This action cannot be undone. Your vote will be permanently recorded on the blockchain.
          </div>
        </div>
        <Button
          disabled={!selected}
          onClick={() => setConfirmOpen(true)}
          className="w-full h-12 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant disabled:opacity-50"
        >
          Confirm & Cast Vote
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Confirm your vote
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to vote for{" "}
              <strong className="text-foreground">
                {selected === "nota" ? "NOTA" : candidates.find((c) => c.id === selected)?.name}
              </strong>
              . This action is final and will be cryptographically sealed on the blockchain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review</AlertDialogCancel>
            <AlertDialogAction onClick={cast} className="gradient-hero text-primary-foreground">
              Yes, cast my vote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default VotePage;
