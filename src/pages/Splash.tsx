import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Vote, Lock } from "lucide-react";
import { getUser } from "@/store/voteStore";

const Splash = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      navigate(getUser() ? "/dashboard" : "/login", { replace: true });
    }, 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-hero text-primary-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-20 right-10 w-52 h-52 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center animate-scale-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full animate-pulse-ring" />
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-glow">
            <Vote className="w-12 h-12 text-secondary" />
          </div>
        </div>

        <h1 className="font-display font-extrabold text-4xl mb-1">
          Vote<span className="text-secondary">Chain</span>
        </h1>
        <div className="text-xs uppercase tracking-[0.3em] text-white/70 mb-8">India</div>

        <p className="max-w-xs text-sm text-white/90 leading-relaxed mb-8">
          Secure. Transparent. Tamper-Proof Voting powered by Blockchain.
        </p>

        <div className="flex items-center gap-4 text-[11px] text-white/70">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-accent" /> Verified</span>
          <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-secondary" /> Encrypted</span>
        </div>
      </div>

      <div className="absolute bottom-6 inset-x-0 text-center text-[11px] text-white/60">
        Developed by <span className="font-semibold text-white">GOVIND SANJAY</span>
      </div>
    </div>
  );
};

export default Splash;
