import { useEffect, useState } from "react";

const fmt = (n: number) => String(n).padStart(2, "0");

const Countdown = ({ to }: { to: number }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, to - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  const Box = ({ v, label }: { v: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary/5 border border-primary/10 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-primary text-base min-w-[2.5rem] text-center">
        {v}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      <Box v={fmt(d)} label="Days" />
      <Box v={fmt(h)} label="Hrs" />
      <Box v={fmt(m)} label="Min" />
      <Box v={fmt(s)} label="Sec" />
    </div>
  );
};

export default Countdown;
