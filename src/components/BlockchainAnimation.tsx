import { Link2 } from "lucide-react";

const BlockchainAnimation = () => {
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center">
          <div
            className="w-12 h-12 rounded-lg gradient-blockchain shadow-elegant flex items-center justify-center text-primary-foreground font-mono text-[10px] animate-blockchain"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            #{18452100 + i}
          </div>
          {i < 4 && <Link2 className="w-3 h-3 text-primary mx-0.5" />}
        </div>
      ))}
    </div>
  );
};

export default BlockchainAnimation;
