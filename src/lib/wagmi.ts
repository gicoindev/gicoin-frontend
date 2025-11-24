"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fallback, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";

const MAINNET_RPC = [
  "https://bsc-dataseed.bnbchain.org",
  "https://bsc.blockpi.network/v1/rpc/public",
  "https://bsc-mainnet.public.blastapi.io",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc.publicnode.com",
];

const TESTNET_RPC = [
  "https://bsc-testnet.publicnode.com",
  "https://endpoints.omniatech.io/v1/bsc/testnet/public",
  "https://data-seed-prebsc-1-s1.binance.org:8545",
];

// 👇 FIX PENTING — HARUS AS CONST (tuple)
const CHAINS = [bsc, bscTestnet] as const;

// 👇 transports EXACT sesuai wagmi spec
const TRANSPORTS = {
  [bsc.id]: fallback(MAINNET_RPC.map((url) => http(url))),
  [bscTestnet.id]: fallback(TESTNET_RPC.map((url) => http(url))),
};

export const wagmiConfig = getDefaultConfig({
  appName: "GICOIN DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: CHAINS,
  transports: TRANSPORTS,
});
