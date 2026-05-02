import { useEffect, useState } from "react";
import { Mail, Loader2, ShieldCheck, CheckCircle2, Info, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useVoteStore } from "@/store/voteStore";
import { sendEmailOtp, verifyEmailOtp, isRealOtpEnabled } from "@/lib/otpService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  variant?: "card" | "compact";
  onVerified?: () => void;
}

const EmailVerification = ({ variant = "card", onVerified }: Props) => {
  const { user, updateUser } = useVoteStore();
  const [email, setEmail] = useState(user?.email ?? "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [justVerified, setJustVerified] = useState(false);

  const verified = !!user?.emailVerified;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleSend = async (resend = false) => {
    setLoading(true);
    const res = await sendEmailOtp(email);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setStep("otp");
    setResendIn(30);
    toast.success(resend ? "OTP resent" : "OTP sent to your email", {
      description: isRealOtpEnabled() ? email : "Use 123456 for demo",
    });
  };

  const handleVerify = async () => {
    setLoading(true);
    const res = await verifyEmailOtp(email, otp);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    updateUser({ email, emailVerified: true });
    setJustVerified(true);
    setOtp("");
    setStep("email");
    toast.success("Email verified successfully");
    onVerified?.();
    setTimeout(() => setJustVerified(false), 2500);
  };

  if (verified) {
    return (
      <div
        className={`rounded-2xl border bg-card p-4 shadow-soft ${
          justVerified ? "animate-fade-in ring-2 ring-accent/40" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm">Email Verified</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Mail className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm flex items-center gap-1.5">
            Verify Email
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              Optional
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">Adds a second verification layer</div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-primary" aria-label="About email verification">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px] text-xs">
              Email verification adds an additional layer of security to your voting account.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {step === "email" ? (
        <div className="space-y-2 animate-fade-in">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            autoComplete="email"
          />
          <Button
            className="w-full h-11 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant"
            onClick={() => handleSend(false)}
            disabled={loading || !email}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Send OTP to Email
          </Button>
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          <div className="text-[11px] text-muted-foreground">
            Enter the 6-digit OTP sent to <span className="font-medium text-foreground">{email}</span>
          </div>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={6}
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="h-11 text-center text-xl tracking-[0.4em] font-semibold"
          />
          <Button
            className="w-full h-11 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
            Verify OTP
          </Button>
          <div className="flex items-center justify-between text-[11px]">
            <button
              className="text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => { setStep("email"); setOtp(""); }}
            >
              Change email
            </button>
            <button
              className="font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
              disabled={resendIn > 0 || loading}
              onClick={() => handleSend(true)}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-accent" />
        Multi-layer verification enabled for enhanced security
      </div>
    </div>
  );
};

export default EmailVerification;