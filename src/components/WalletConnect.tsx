import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Copy, LogOut, Info } from "lucide-react";
import { useVoteStore, shortenAddress } from "@/store/voteStore";
import { toast } from "sonner";
import {
  isMetaMaskInstalled,
  connectMetaMask,
  onAccountsChanged,
  onChainChanged,
  networkName,
} from "@/lib/metamask";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FoxIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="fox-g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#F6851B" />
        <stop offset="100%" stopColor="#E2761B" />
      </linearGradient>
    </defs>
    <path
      d="M6 8l9 4-2 6-4-1zM34 8l-9 4 2 6 4-1zM10 24l4 1 1 5-3 1zM30 24l-4 1-1 5 3 1zM14 30l6 2 6-2-2 4h-8z"
      fill="url(#fox-g)"
      stroke="#763E1A"
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="17" r="1.4" fill="#fff" />
    <circle cx="26" cy="17" r="1.4" fill="#fff" />
  </svg>
);

interface Props {
  variant?: "card" | "compact";
}

const WalletConnect = ({ variant = "card" }: Props) => {
  const { wallet, setWallet, disconnectWallet } = useVoteStore();
  const [connecting, setConnecting] = useState(false);
  const [hasMM, setHasMM] = useState(false);

  useEffect(() => {
    setHasMM(isMetaMaskInstalled());
    const off1 = onAccountsChanged((accs) => {
      if (!accs || accs.length === 0) {
        disconnectWallet();
        toast.info("Wallet disconnected");
      } else {
        const cur = (typeof window !== "undefined" && (window as any).__vc_chain) as string | undefined;
        setWallet({
          address: accs[0],
          network: networkName(cur),
          chainId: cur,
          connectedAt: Date.now(),
        });
      }
    });
    const off2 = onChainChanged((cid) => {
      (window as any).__vc_chain = cid;
      const w = JSON.parse(localStorage.getItem("votechain_wallet") || "null");
      if (w) setWallet({ ...w, chainId: cid, network: networkName(cid) });
      toast.info(`Network: ${networkName(cid)}`);
    });
    return () => { off1?.(); off2?.(); };
  }, [setWallet, disconnectWallet]);

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask not detected", {
        description: "Please install MetaMask to continue",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }
    setConnecting(true);
    try {
      const r = await connectMetaMask();
      (window as any).__vc_chain = r.chainId;
      setWallet({
        address: r.address,
        network: r.network,
        chainId: r.chainId,
        connectedAt: Date.now(),
      });
      toast.success("Wallet Connected Successfully", { description: r.network });
    } catch (e: any) {
      const msg = e?.code === 4001 ? "Connection request rejected" : (e?.message || "Failed to connect");
      toast.error(msg);
    } finally {
      setConnecting(false);
    }
  };

  if (wallet) {
    return (
      <div className="rounded-2xl bg-card border p-4 shadow-soft animate-fade-in relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center shadow-glow">
              <FoxIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">MetaMask</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Active
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">Wallet Connected Successfully</div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 rounded-xl bg-muted/40 p-3">
            <Row label="Address" mono>
              <button
                onClick={() => { navigator.clipboard.writeText(wallet.address); toast.success("Address copied"); }}
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                {shortenAddress(wallet.address)} <Copy className="w-3 h-3" />
              </button>
            </Row>
            <Row label="Network">{wallet.network}</Row>
            <Row label="Status">
              <span className="text-accent font-semibold">● Connected</span>
            </Row>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent">
            <CheckCircle2 className="w-3 h-3" /> Blockchain Verified User
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 h-9 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => { disconnectWallet(); toast.info("Wallet disconnected"); }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Disconnect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5 p-4 shadow-soft animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-secondary/30 flex items-center justify-center flex-shrink-0">
              <FoxIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <div className="font-semibold text-sm">Enhance Transparency</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground" aria-label="Info">
                      <Info className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs">
                    MetaMask integration is optional and used only for transparency demonstration.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-[11px] text-muted-foreground">Connect wallet to enhance transparency</div>
            </div>
          </div>
          <Button
            onClick={connect}
            disabled={connecting}
            size="sm"
            className="w-full mt-3 h-9 bg-secondary text-secondary-foreground hover:opacity-95 shadow-saffron"
          >
            {connecting ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Connecting…</>
            ) : (
              <>Connect MetaMask Wallet</>
            )}
          </Button>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-2xl border bg-card p-4 shadow-soft animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center flex-shrink-0">
            <FoxIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="font-semibold text-sm">MetaMask Wallet</div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Optional</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground" aria-label="Info">
                    <Info className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-xs">
                  MetaMask integration is optional and used only for transparency demonstration.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              For advanced users — link your vote to a blockchain wallet for extra transparency.
            </div>
          </div>
        </div>
        <Button
          onClick={connect}
          disabled={connecting}
          className="w-full mt-3 h-11 bg-secondary text-secondary-foreground hover:opacity-95 shadow-saffron"
        >
          {connecting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting to MetaMask…</>
          ) : (
            <><FoxIcon className="w-5 h-5 mr-2" /> Connect Wallet</>
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
};

const Row = ({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={mono ? "font-mono" : ""}>{children}</span>
  </div>
);

export default WalletConnect;
export { FoxIcon };