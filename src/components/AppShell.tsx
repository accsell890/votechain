import { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  rightSlot?: ReactNode;
}

const AppShell = ({ children, title, showBack, rightSlot }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      {title && (
        <header className="sticky top-0 z-40 gradient-hero text-primary-foreground shadow-elegant">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-smooth"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span className="text-[10px] uppercase tracking-widest opacity-80">VoteChain India</span>
              </div>
              <h1 className="font-display font-semibold text-lg truncate">{title}</h1>
            </div>
            {rightSlot}
          </div>
          <div className="h-1 gradient-tricolor" />
        </header>
      )}

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5">{children}</main>

      <footer className="max-w-md w-full mx-auto px-4 py-5 text-center">
        <div className="text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-accent" />
            Secured by Blockchain
          </span>
          <div className="mt-1 font-medium tracking-wide">
            Developed by <span className="text-primary font-semibold">GOVIND SANJAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
