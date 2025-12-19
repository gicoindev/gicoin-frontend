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

const ENV_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "56");

const ACTIVE_CHAIN = ENV_CHAIN_ID === 97 ? bscTestnet : bsc;

export const wagmiConfig = getDefaultConfig({
  appName: "GICOIN DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

  chains: [ACTIVE_CHAIN],

  transports: {
    [ACTIVE_CHAIN.id]:
      ACTIVE_CHAIN.id === 56
        ? fallback(MAINNET_RPC.map((url) => http(url)))
        : fallback(TESTNET_RPC.map((url) => http(url))),
  },

  ssr: false,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
