// ==========================================================
// src/config/contracts.ts (patched)
// ==========================================================

import GicoinAbi from "@/abis/Gicoin-latest.json";
import type { Abi } from "viem";
import { createPublicClient, fallback, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";

// Wagmi v2 actions
import {
  getAccount,
  getWalletClient,
  switchChain,
} from "wagmi/actions";

import { wagmiConfig } from "@/lib/wagmi";
import { useChainId } from "wagmi";

export const GICOIN_ABI = GicoinAbi as Abi;

export const CONTRACT_ADDRESSES = {
  1: {
    gicoin: "0x0000000000000000000000000000000000000000",
    staking: "0x0000000000000000000000000000000000000000",
    rewardPool: "0x0000000000000000000000000000000000000000",
    admin: "0x0000000000000000000000000000000000000000",
    taxWallet: "0x0000000000000000000000000000000000000000",
  },
  11155111: {
    gicoin: "0x0000000000000000000000000000000000000000",
    staking: "0x0000000000000000000000000000000000000000",
    rewardPool: "0x0000000000000000000000000000000000000000",
    admin: "0x0000000000000000000000000000000000000000",
    taxWallet: "0x0000000000000000000000000000000000000000",
  },
  97: {
    gicoin: "0x7c2aa941970f29d3f0df35262dec8ec59583bc2d",
    staking: "0x7c2aa941970f29d3f0df35262dec8ec59583bc2d",
    rewardPool: "0x95ba02678B6C19E2e4b10E8041ff13B19266d985",
    admin: "0x13BA5511e47cB79307aeed99d8f1D5DBA4840De6",
    taxWallet: "0xeBeA8C8a54Dd5DF8F92103236aCD85Dc0417b217",
  },
  56: {
    gicoin: "0xe4a9a0a40468efc73c5ab64fc4e86c765efab4dd",
    staking: "0xe4a9a0a40468efc73c5ab64fc4e86c765efab4dd",
    rewardPool: "0xB4C1Dc5CF64EdbaF29c8Adf2294bABfdBa05EFa0",
    admin: "0x226a72C33cbc9cfbB8f4af3f528254B5BF303579",
    taxWallet: "0xCee96fD4379A42df20f122c441c8Cb0e92511031",
  },
} as const;

export const CHAIN_INFO = {
  1: { name: "Ethereum Mainnet", symbol: "ETH", explorer: "https://etherscan.io" },
  11155111: { name: "Sepolia Testnet", symbol: "ETH", explorer: "https://sepolia.etherscan.io" },
  97: { name: "BSC Testnet", symbol: "tBNB", explorer: "https://testnet.bscscan.com" },
  56: { name: "BSC Mainnet", symbol: "BNB", explorer: "https://bscscan.com" },
} as const;

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "56");
const IS_MAINNET = CHAIN_ID === 56;

export function useContracts() {
  const activeChainId = useChainId() || CHAIN_ID;

  const selected =
    CONTRACT_ADDRESSES[activeChainId as keyof typeof CONTRACT_ADDRESSES] ??
    CONTRACT_ADDRESSES[56];

  const chainInfo =
    CHAIN_INFO[activeChainId as keyof typeof CHAIN_INFO] ??
    CHAIN_INFO[56];

  return {
    gicoin: {
      address: selected.gicoin,
      abi: GICOIN_ABI,
    },
    staking: {
      address: selected.staking,
      abi: GICOIN_ABI,
    },
    rewardPoolWallet: selected.rewardPool,
    admin: selected.admin,
    taxWallet: selected.taxWallet,
    chainInfo,
  } as const;
}

// Public client: gunakan RPC yang aman dan spesifik
export const publicClient = createPublicClient({
  chain: IS_MAINNET ? bsc : bscTestnet,
  transport: fallback([
    http(IS_MAINNET ? "https://1rpc.io/bnb" : "https://bsc-testnet-rpc.publicnode.com"),
  ]),
});

export async function getWallet() {
  try {
    const account = getAccount(wagmiConfig);
    if (!account?.address) throw new Error("⚠ Wallet belum terhubung.");

    const client = await getWalletClient(wagmiConfig);
    if (!client) throw new Error("⚠ Tidak dapat membuat wallet client.");

    const currentChain = client.chain?.id;
    const targetChain = IS_MAINNET ? bsc.id : bscTestnet.id;

    if (currentChain !== targetChain) {
      await switchChain(wagmiConfig, { chainId: targetChain });
      console.info("🔄 Chain switched automatically.");
    }

    return { account, client };
  } catch (err) {
    console.error("❌ getWallet() error:", err);
    throw err;
  }
}