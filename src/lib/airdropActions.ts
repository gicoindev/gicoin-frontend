"use client";

import GicoinAbi from "@/abis/Gicoin-latest.json";
import { wagmiConfig } from "@/lib/wagmi";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { parseUnits, type Abi } from "viem";

const GICOIN_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`;

const CONTRACT = {
  address: GICOIN_ADDRESS,
  abi: GicoinAbi as Abi,
};

// =====================================================================
// 🚀 REGISTER AIRDROP
// =====================================================================
export async function registerAirdrop() {
  const txHash = await writeContract(wagmiConfig, {
    ...CONTRACT,
    functionName: "registerAirdrop",
    args: [],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash: txHash });
}

// =====================================================================
// 🚀 CLAIM WITH MERKLE PROOF  (SESUAI KONTRAK)
// =====================================================================
export async function claimWithMerkle(amount: string, proof: readonly `0x${string}`[]) {
  const txHash = await writeContract(wagmiConfig, {
    ...CONTRACT,
    functionName: "claimAirdropWithMerkleProof",
    args: [parseUnits(amount, 18), proof],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash: txHash });
}

// =====================================================================
// 🚀 CLAIM WHITELIST  (SESUAI KONTRAK)
// =====================================================================
export async function claimWithWhitelist(amount: string) {
  const txHash = await writeContract(wagmiConfig, {
    ...CONTRACT,
    functionName: "claimAirdropWithWhitelist",
    args: [parseUnits(amount, 18)],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash: txHash });
}

// =====================================================================
// 🔍 HAS CLAIMED (READ)
// =====================================================================
export async function hasClaimed(address: string) {
  return await readContract(wagmiConfig, {
    ...CONTRACT,
    functionName: "hasClaimed",
    args: [address],
  });
}

// =====================================================================
// 🔍 CHECK REGISTERED
// =====================================================================
export async function isRegistered(address: string) {
  return await readContract(wagmiConfig, {
    ...CONTRACT,
    functionName: "airdropRegistered",
    args: [address],
  });
}

// =====================================================================
// 🔍 CHECK WHITELIST
// =====================================================================
export async function isWhitelisted(address: string) {
  return await readContract(wagmiConfig, {
    ...CONTRACT,
    functionName: "isWhitelisted",
    args: [address],
  });
}
