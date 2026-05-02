export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  symbol: string;
  color: string;
  votes: number;
}

export interface Election {
  id: string;
  title: string;
  region: string;
  endsAt: number; // ms timestamp
  status: "active" | "upcoming";
}

export const candidates: Candidate[] = [
  { id: "c1", name: "Rajesh Kumar Sharma", party: "Bharatiya Vikas Party", partyShort: "BVP", symbol: "🪷", color: "28 100% 55%", votes: 124583 },
  { id: "c2", name: "Priya Nair", party: "Indian National Progress", partyShort: "INP", symbol: "✋", color: "0 75% 50%", votes: 118247 },
  { id: "c3", name: "Arjun Reddy", party: "Janata Samaj Morcha", partyShort: "JSM", symbol: "🌾", color: "122 60% 35%", votes: 87412 },
  { id: "c4", name: "Meera Iyer", party: "Aam Aadmi Manch", partyShort: "AAM", symbol: "🧹", color: "207 80% 45%", votes: 64890 },
  { id: "c5", name: "Vikram Singh Chauhan", party: "Rashtriya Lok Dal", partyShort: "RLD", symbol: "⚖️", color: "260 50% 45%", votes: 41230 },
];

export const elections: Election[] = [
  {
    id: "e1",
    title: "Lok Sabha General Elections 2025",
    region: "Constituency: Mumbai South",
    endsAt: Date.now() + 1000 * 60 * 60 * 26,
    status: "active",
  },
  {
    id: "e2",
    title: "Maharashtra Vidhan Sabha",
    region: "Constituency: Pune Central",
    endsAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    status: "upcoming",
  },
];

export const generateTxHash = () => {
  const chars = "0123456789ABCDEF";
  let hash = "0x";
  for (let i = 0; i < 40; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
};

export const generateBlockNumber = () => 18_452_109 + Math.floor(Math.random() * 9999);
