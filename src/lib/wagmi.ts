"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fallback, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";

// PRIORITAS RPC (Mainnet)
const MAINNET_RPC = [
  "https://bsc-dataseed.bnbchain.org",
  "https://bsc.blockpi.network/v1/rpc/public",
  "https://bsc.publicnode.com",
  "https://bsc-mainnet.public.blastapi.io",
];

// Testnet (fallback only)
const TESTNET_RPC = [
  "https://bsc-testnet.publicnode.com",
  "https://data-seed-prebsc-1-s1.binance.org:8545",
];

// harus tuple
const CHAINS = [bsc, bscTestnet] as const;

const TRANSPORTS = {
  [bsc.id]: fallback(MAINNET_RPC.map((u) => http(u))),
  [bscTestnet.id]: fallback(TESTNET_RPC.map((u) => http(u))),
};

export const wagmiConfig = getDefaultConfig({
  appName: "GICOIN DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: CHAINS,
  transports: TRANSPORTS,
});
