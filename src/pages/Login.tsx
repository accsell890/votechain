import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, ShieldCheck, KeyRound, Vote, Loader2, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setUser } from "@/store/voteStore";
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp, isRealOtpEnabled } from "@/lib/otpService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"mobile" | "aadhaar">("mobile");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const sendOtp = async (resend = false) => {
    if (mobile.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    const res = await apiSendOtp("+91" + mobile);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setStep("otp");
    setResendIn(30);
    toast.success(resend ? "OTP resent" : "OTP sent successfully", {
      description: isRealOtpEnabled() ? `Sent to +91 ${mobile}` : "Use 123456 for demo",
    });
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    const res = await apiVerifyOtp("+91" + mobile, otp);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setUser({
      name: "Govind Sanjay",
      mobile,
      voterId: "ABC" + Math.floor(1000000 + Math.random() * 8999999),
      verified: false,
    });
    toast.success("Authenticated via Blockchain");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-hero text-primary-foreground px-6 pt-10 pb-16 rounded-b-[2.5rem] shadow-elegant relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Vote className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">VoteChain India</div>
              <div className="text-[10px] uppercase tracking-widest text-white/70 mt-1">Election Commission Verified</div>
            </div>
          </div>
          <h2 className="font-display text-2xl font-semibold leading-snug">Welcome back,<br />citizen of Bharat 🇮🇳</h2>
          <p className="text-sm text-white/80 mt-2">Sign in to cast your secure, blockchain-verified vote.</p>
        </div>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-5 -mt-10 pb-6">
        <div className="glass-card rounded-3xl p-5 animate-slide-up">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
              <ShieldCheck className="w-3 h-3" />
              Secure Blockchain Authentication
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Lock className="w-3 h-3" />
              Secure OTP Verification Enabled
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-primary" aria-label="About this system">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs">
                  This system uses secure OTP, blockchain wallet integration, and identity verification for demonstration purposes.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-muted rounded-xl">
            {(["mobile", "aadhaar"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`text-xs font-medium py-2 rounded-lg transition-smooth ${
                  method === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "mobile" ? "Mobile + OTP" : "Aadhaar / Voter ID"}
              </button>
            ))}
          </div>

          {method === "aadhaar" ? (
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Aadhaar / Voter ID</label>
              <Input placeholder="XXXX XXXX XXXX" className="h-12 text-base" />
              <Button
                className="w-full h-12 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant"
                onClick={() => { setMethod("mobile"); toast.info("For this demo, please use Mobile + OTP"); }}
              >
                <KeyRound className="w-4 h-4 mr-2" /> Continue
              </Button>
            </div>
          ) : step === "mobile" ? (
            <div className="space-y-3 animate-fade-in">
              <label className="text-xs font-medium text-muted-foreground">Mobile Number</label>
              <div className="flex gap-2">
                <div className="h-12 px-3 flex items-center rounded-md border bg-muted text-sm font-medium">+91</div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="h-12 text-base flex-1"
                />
              </div>
              <Button
                className="w-full h-12 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant"
                onClick={() => sendOtp(false)}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Smartphone className="w-4 h-4 mr-2" />}
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <label className="text-xs font-medium text-muted-foreground">
                Enter OTP sent to +91 {mobile}
              </label>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center text-2xl tracking-[0.5em] font-semibold"
              />
              <Button
                className="w-full h-12 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                Verify & Login
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button
                  className="text-muted-foreground hover:text-primary transition-smooth"
                  onClick={() => setStep("mobile")}
                >
                  Change mobile number
                </button>
                <button
                  className="font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
                  disabled={resendIn > 0 || loading}
                  onClick={() => sendOtp(true)}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6 text-center">
          {[
            { label: "256-bit", sub: "Encryption" },
            { label: "Immutable", sub: "Ledger" },
            { label: "Audited", sub: "By ECI" },
          ].map((b) => (
            <div key={b.label} className="rounded-xl bg-card border p-3 shadow-soft">
              <div className="text-xs font-bold text-primary">{b.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] text-muted-foreground pb-5">
        Developed by <span className="font-semibold text-primary">GOVIND SANJAY</span>
      </div>
    </div>
  );
};

export default Login;
