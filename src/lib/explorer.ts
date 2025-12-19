// src/lib/explorer.ts
const explorers: Record<number, string> = {
  1: "https://etherscan.io/tx/",
  5: "https://goerli.etherscan.io/tx/",
  11155111: "https://sepolia.etherscan.io/tx/",
  42161: "https://arbiscan.io/tx/",
  421613: "https://goerli.arbiscan.io/tx/",
  56: "https://bscscan.com/tx/",
  97: "https://testnet.bscscan.com/tx/",
};

export function getExplorerUrl(txHash: string, chainId?: number) {
  if (!txHash || typeof txHash !== "string") return null;

  const base = explorers[chainId ?? -1];
  if (!base) return null;

  return `${base}${txHash}`;
}
