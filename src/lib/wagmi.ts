"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, fallback, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";

const MAINNET_RPC = [
  "https://1rpc.io/bnb",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed.bnbchain.org",
];

const TESTNET_RPC = [
  "https://bsc-testnet-rpc.publicnode.com",
  "https://data-seed-prebsc-2-s1.binance.org:8545",
];

// MUST be const tuple
const CHAINS = [bsc, bscTestnet] as const;

const TRANSPORTS = {
  [bsc.id]: fallback(MAINNET_RPC.map((url) => http(url))),
  [bscTestnet.id]: fallback(TESTNET_RPC.map((url) => http(url))),
};

export const wagmiConfig = getDefaultConfig({
  appName: "GICOIN DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: CHAINS,
  transports: TRANSPORTS,

  /*
   * 🔥 FIX PENTING!
   * Wagmi harus punya storage persist agar wallet tidak disconnect
   */
  ssr: false,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
