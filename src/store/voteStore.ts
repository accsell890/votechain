import { useEffect, useState } from "react";

interface VoteRecord {
  electionId: string;
  candidateId: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  walletAddress?: string;
}

interface UserState {
  name: string;
  mobile: string;
  voterId: string;
  verified: boolean;
  email?: string;
  emailVerified?: boolean;
}

interface WalletState {
  address: string;
  network: string;
  connectedAt: number;
  chainId?: string;
  simulated?: boolean;
}

const USER_KEY = "votechain_user";
const VOTES_KEY = "votechain_votes";
const WALLET_KEY = "votechain_wallet";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const getUser = (): UserState | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setUser = (u: UserState) => {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
  notify();
};

export const updateUser = (patch: Partial<UserState>) => {
  const cur = getUser();
  if (!cur) return;
  const next = { ...cur, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  notify();
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(VOTES_KEY);
  notify();
};

export const getVotes = (): VoteRecord[] => {
  const raw = localStorage.getItem(VOTES_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const addVote = (v: VoteRecord) => {
  const all = getVotes();
  all.push(v);
  localStorage.setItem(VOTES_KEY, JSON.stringify(all));
  notify();
};

export const hasVoted = (electionId: string) =>
  getVotes().some((v) => v.electionId === electionId);

export const getWallet = (): WalletState | null => {
  const raw = localStorage.getItem(WALLET_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setWallet = (w: WalletState) => {
  localStorage.setItem(WALLET_KEY, JSON.stringify(w));
  notify();
};

export const disconnectWallet = () => {
  localStorage.removeItem(WALLET_KEY);
  notify();
};

export const generateWalletAddress = () => {
  const chars = "0123456789abcdef";
  let a = "0x";
  for (let i = 0; i < 40; i++) a += chars[Math.floor(Math.random() * chars.length)];
  return a;
};

export const shortenAddress = (a: string) =>
  a ? a.slice(0, 6) + "…" + a.slice(-4) : "";

export const useVoteStore = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return {
    user: getUser(),
    votes: getVotes(),
    wallet: getWallet(),
    setUser,
    updateUser,
    clearUser,
    addVote,
    hasVoted,
    setWallet,
    disconnectWallet,
  };
};
