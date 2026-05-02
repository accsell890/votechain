import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, CheckCircle2, ChevronRight, ShieldCheck, ShieldAlert, User, BarChart3, Vote, Fingerprint, Boxes, Mail, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import Countdown from "@/components/Countdown";
import WalletConnect from "@/components/WalletConnect";
import EmailVerification from "@/components/EmailVerification";
import { elections } from "@/lib/voteData";
import { useVoteStore } from "@/store/voteStore";

const EMAIL_PROMPT_KEY = "votechain_email_prompt_dismissed";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, hasVoted } = useVoteStore();
  if (!user) { navigate("/login", { replace: true }); return null; }

  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  useEffect(() => {
    if (!user.emailVerified && !sessionStorage.getItem(EMAIL_PROMPT_KEY)) {
      setShowEmailPrompt(true);
    }
  }, [user.emailVerified]);
  const dismissEmailPrompt = () => {
    sessionStorage.setItem(EMAIL_PROMPT_KEY, "1");
    setShowEmailPrompt(false);
  };

  return (
    <AppShell
      title="Dashboard"
      rightSlot={
        <button onClick={() => navigate("/profile")} className="p-1.5 rounded-full hover:bg-white/10 transition-smooth" aria-label="Profile">
          <User className="w-5 h-5" />
        </button>
      }
    >
      {/* Welcome card */}
      <div className="rounded-3xl gradient-hero text-primary-foreground p-5 shadow-elegant relative overflow-hidden animate-fade-in">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-secondary/20 blur-2xl" />
        <div className="relative">
          <div className="text-xs uppercase tracking-widest text-white/70">Namaste 🙏</div>
          <div className="font-display text-2xl font-semibold mt-1">{user.name}</div>
          <div className="mt-3 flex items-center gap-2">
            {user.verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-accent/30 border border-accent/40">
                <ShieldCheck className="w-3 h-3" /> Identity Verified
              </span>
            ) : (
              <button
                onClick={() => navigate("/verify")}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-secondary/30 border border-secondary/40 hover:bg-secondary/40 transition-smooth"
              >
                <ShieldAlert className="w-3 h-3" /> Verify Identity →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-2xl bg-card border p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Voting Status</div>
            <Vote className="w-4 h-4 text-primary" />
          </div>
          {hasVoted("e1") ? (
            <div className="mt-2 flex items-center gap-1.5 text-accent font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Voted
            </div>
          ) : (
            <div className="mt-2 text-secondary font-semibold">Not Voted</div>
          )}
        </div>
        <button
          onClick={() => navigate("/results/e1")}
          className="rounded-2xl bg-card border p-4 shadow-soft text-left hover:shadow-elegant transition-smooth"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Live Results</div>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 font-semibold text-primary">View Counts</div>
        </button>
      </div>

      {/* Verification CTA */}
      {!user.verified && (
        <button
          onClick={() => navigate("/verify")}
          className="mt-4 w-full rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-left flex items-center gap-3 hover:bg-secondary/15 transition-smooth"
        >
          <div className="w-10 h-10 rounded-xl gradient-saffron flex items-center justify-center shadow-saffron">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Complete Identity Verification</div>
            <div className="text-xs text-muted-foreground">Required before casting your vote</div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Optional email verification prompt */}
      {showEmailPrompt && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">Verify your Email (optional)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Add a second layer of security to your account.
                  </div>
                </div>
                <button
                  onClick={dismissEmailPrompt}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3">
                <EmailVerification onVerified={dismissEmailPrompt} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet (optional) */}
      <div className="mt-4">
        <WalletConnect variant="compact" />
      </div>

      {/* Blockchain Explorer link */}
      <button
        onClick={() => navigate("/explorer")}
        className="mt-3 w-full rounded-2xl border bg-card p-4 text-left flex items-center gap-3 shadow-soft hover:shadow-elegant transition-smooth"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Boxes className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">Blockchain Explorer</div>
          <div className="text-xs text-muted-foreground">View recent vote transactions</div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Elections */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-base">Active & Upcoming Elections</h3>
          <Bell className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="space-y-3">
          {elections.map((e, idx) => {
            const voted = hasVoted(e.id);
            return (
              <div
                key={e.id}
                className="rounded-2xl bg-card border p-4 shadow-soft animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        e.status === "active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {e.status === "active" ? "● Live" : "Upcoming"}
                      </span>
                    </div>
                    <div className="font-semibold text-sm mt-1.5 leading-snug">{e.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{e.region}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between gap-3">
                  <Countdown to={e.endsAt} />
                </div>

                <button
                  disabled={e.status !== "active"}
                  onClick={() =>
                    voted ? navigate("/results/" + e.id) : user.verified ? navigate("/vote/" + e.id) : navigate("/verify")
                  }
                  className={`mt-3 w-full h-10 rounded-xl text-sm font-semibold transition-smooth ${
                    e.status !== "active"
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : voted
                      ? "bg-accent text-accent-foreground hover:opacity-90"
                      : "gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant"
                  }`}
                >
                  {e.status !== "active" ? "Opens Soon" : voted ? "View Live Results" : "Cast Your Vote"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
