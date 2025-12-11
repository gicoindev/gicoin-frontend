// ==========================================================
// src/config/contracts.ts (FINAL PATCH)
// ==========================================================

import GicoinAbi from "@/abis/Gicoin-latest.json";
import type { Abi } from "viem";
import { createPublicClient, fallback, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";

// Wagmi v2 actions
import { wagmiConfig } from "@/lib/wagmi";
import { getAccount, getWalletClient } from "wagmi/actions";

export const GICOIN_ABI = GicoinAbi as Abi;

// -----------------------------------------------------------
// CONTRACT ADDRESS LIST
// -----------------------------------------------------------
export const CONTRACT_ADDRESSES = {
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
  97: { id: 97, name: "BSC Testnet", symbol: "tBNB", explorer: "https://testnet.bscscan.com" },
  56: { id: 56, name: "BSC Mainnet", symbol: "BNB", explorer: "https://bscscan.com" },
} as const;

// -----------------------------------------------------------
// ENV-driven chain selection (🔥 akar fix utama)
// -----------------------------------------------------------
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID); // 97 or 56
const ACTIVE_CHAIN = CHAIN_ID === 97 ? bscTestnet : bsc;

// -----------------------------------------------------------
// HOOK: useContracts()
// -----------------------------------------------------------
export function useContracts() {
  // ❌ Hapus ini (memicu bug Wrong Network)
  // const walletChainId = useChainId();

  // ✅ ENV selalu prioritas
  const activeChainId = CHAIN_ID;

  const selected = CONTRACT_ADDRESSES[activeChainId as 97 | 56];
  const chainInfo = CHAIN_INFO[activeChainId as 97 | 56];

  return {
    gicoin: {
      address: selected?.gicoin,
      abi: GICOIN_ABI,
    },
    staking: {
      address: selected?.staking,
      abi: GICOIN_ABI,
    },
    rewardPoolWallet: selected?.rewardPool,
    admin: selected?.admin,
    taxWallet: selected?.taxWallet,
    chainInfo,
  } as const;
}

// -----------------------------------------------------------
// PUBLIC CLIENT
// -----------------------------------------------------------
export const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN, // 🟢 berdasarkan ENV
  transport: fallback([
    http(ACTIVE_CHAIN.id === 56
      ? "https://1rpc.io/bnb"
      : "https://bsc-testnet-rpc.publicnode.com"),
  ]),
});

// -----------------------------------------------------------
// getWallet()
// -----------------------------------------------------------
export async function getWallet() {
  try {
    const account = getAccount(wagmiConfig);
    if (!account?.address) throw new Error("⚠ Wallet belum terhubung.");

    const client = await getWalletClient(wagmiConfig);
    if (!client) throw new Error("⚠ Tidak dapat membuat wallet client.");

    const currentChain = client.chain?.id;
    const expectedChain = ACTIVE_CHAIN.id;

    if (currentChain !== expectedChain) {
      try {
        await client.switchChain({ id: expectedChain });
      } catch (err) {
        console.error("❌ Auto switch gagal:", err);
        throw new Error(
          `Wrong network. Please switch wallet to ${ACTIVE_CHAIN.name}`
        );
      }
    }
    
    return { account, client };
  } catch (err) {
    console.error("❌ getWallet() error:", err);
    throw err;
  }
}
