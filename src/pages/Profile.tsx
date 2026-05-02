import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, Smartphone, IdCard, Lock, History, CheckCircle2, Wallet, Mail, XCircle } from "lucide-react";
import { useVoteStore, shortenAddress } from "@/store/voteStore";
import { candidates, elections } from "@/lib/voteData";
import WalletConnect from "@/components/WalletConnect";
import EmailVerification from "@/components/EmailVerification";

const Profile = () => {
  const navigate = useNavigate();
  const { user, votes, wallet, clearUser } = useVoteStore();
  if (!user) { navigate("/login"); return null; }

  const mask = (s: string) => s.slice(0, 3) + "XXXX" + s.slice(-2);

  return (
    <AppShell title="My Profile" showBack>
      {/* Header */}
      <div className="rounded-3xl gradient-hero text-primary-foreground p-5 shadow-elegant text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl font-display font-bold shadow-glow">
          {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="font-display font-semibold text-lg mt-3">{user.name}</div>
        <div className="text-xs text-white/80">+91 {user.mobile}</div>
        {user.verified && (
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-accent/30 border border-accent/40">
            <ShieldCheck className="w-3 h-3" /> Verified Citizen
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-4 rounded-2xl bg-card border shadow-soft divide-y">
        <Row icon={<IdCard className="w-4 h-4" />} label="Voter ID" value={mask(user.voterId)} />
        <Row icon={<Smartphone className="w-4 h-4" />} label="Mobile" value={"+91 " + user.mobile} />
        <Row
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          value={user.emailVerified ? user.email || "Verified" : "Not Verified"}
          valueClass={user.emailVerified ? "text-accent font-semibold" : "text-muted-foreground"}
        />
        <Row
          icon={<Wallet className="w-4 h-4" />}
          label="Wallet"
          value={wallet ? shortenAddress(wallet.address) : "Not Connected"}
          valueClass={wallet ? "text-accent font-semibold" : "text-muted-foreground"}
        />
        <Row icon={<ShieldCheck className="w-4 h-4 text-accent" />} label="Security" value="Active" valueClass="text-accent font-semibold" />
      </div>

      {/* Combined verification status */}
      <div className="mt-4 rounded-2xl bg-card border p-4 shadow-soft">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Verification Status
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatusPill label="Mobile Verified" ok={true} />
          <StatusPill label="Email Verified" ok={!!user.emailVerified} />
          <StatusPill label="ID Verified" ok={!!user.verified} />
          <StatusPill label="Wallet Connected" ok={!!wallet} optional />
        </div>
      </div>

      {/* Email verification */}
      <div className="mt-4">
        <h3 className="font-display font-semibold text-base mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Email Verification
        </h3>
        <EmailVerification />
      </div>

      {/* Wallet section */}
      <div className="mt-4">
        <h3 className="font-display font-semibold text-base mb-2 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" /> Blockchain Wallet
        </h3>
        <WalletConnect />
      </div>

      {/* History */}
      <div className="mt-5">
        <h3 className="font-display font-semibold text-base mb-2 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Voting History
        </h3>
        {votes.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No votes recorded yet
          </div>
        ) : (
          <div className="space-y-2">
            {votes.map((v) => {
              const e = elections.find((el) => el.id === v.electionId);
              const c = candidates.find((cn) => cn.id === v.candidateId);
              return (
                <div key={v.txHash} className="rounded-2xl bg-card border p-3 shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{e?.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Voted for {v.candidateId === "nota" ? "NOTA" : c?.name}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-muted-foreground truncate">
                    {v.txHash}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Block #{v.blockNumber.toLocaleString()} · {new Date(v.timestamp).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full mt-6 h-11 border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={() => { clearUser(); navigate("/login", { replace: true }); }}
      >
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </AppShell>
  );
};

const Row = ({ icon, label, value, valueClass = "" }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="text-muted-foreground">{icon}</div>
    <div className="text-sm flex-1 text-muted-foreground">{label}</div>
    <div className={`text-sm font-medium ${valueClass}`}>{value}</div>
  </div>
);

const StatusPill = ({ label, ok, optional }: { label: string; ok: boolean; optional?: boolean }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${
      ok
        ? "bg-accent/10 border-accent/30 text-accent"
        : "bg-muted/40 border-muted text-muted-foreground"
    }`}
  >
    {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    <span className="truncate">{label}{optional && !ok ? " (optional)" : ""}</span>
  </div>
);

export default Profile;
