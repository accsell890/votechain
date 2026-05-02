// Real MetaMask / Web3 integration using window.ethereum (EIP-1193).

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const isMetaMaskInstalled = () =>
  typeof window !== "undefined" && Boolean(window.ethereum);

const NETWORKS: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  "0x5": "Goerli Testnet",
  "0xaa36a7": "Sepolia Testnet",
  "0x89": "Polygon Mainnet",
  "0x13881": "Polygon Mumbai Testnet",
  "0x38": "BNB Smart Chain",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum One",
};

export const networkName = (chainId?: string) =>
  (chainId && NETWORKS[chainId.toLowerCase()]) || `Chain ${chainId ?? "unknown"}`;

export interface ConnectResult {
  address: string;
  chainId: string;
  network: string;
}

export async function connectMetaMask(): Promise<ConnectResult> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask not installed");
  }
  const accounts: string[] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  if (!accounts || accounts.length === 0) {
    throw new Error("No account selected");
  }
  const chainId: string = await window.ethereum.request({ method: "eth_chainId" });
  return {
    address: accounts[0],
    chainId,
    network: networkName(chainId),
  };
}

export function onAccountsChanged(cb: (accounts: string[]) => void) {
  if (!isMetaMaskInstalled()) return () => {};
  window.ethereum.on?.("accountsChanged", cb);
  return () => window.ethereum.removeListener?.("accountsChanged", cb);
}

export function onChainChanged(cb: (chainId: string) => void) {
  if (!isMetaMaskInstalled()) return () => {};
  window.ethereum.on?.("chainChanged", cb);
  return () => window.ethereum.removeListener?.("chainChanged", cb);
}