// src/hooks/useAirdropAdmin.tsx
"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import { readContract } from "@wagmi/core";
import { useState } from "react";
import { toast } from "sonner";
import type { Abi } from "viem";
import { parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  useWriteContract
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

// ==========================================================
// ⏱ Timeout wrapper
// ==========================================================
const withTimeout = (promise: Promise<any>, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("⏱️ RPC Timeout — check network.")), ms)
    ),
  ]);

// ==========================================================
// 🧩 Main Hook
// ==========================================================
export function useAirdropAdmin(refetch?: () => void) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { gicoin } = useContracts();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // 🌐 Explorer
  // ==========================================================
  const explorers: Record<number, string> = {
    97: "https://testnet.bscscan.com",
    56: "https://bscscan.com",
    1: "https://etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  };
  const explorer = explorers[chainId] || explorers[97];

  // ==========================================================
  // 🔐 Check owner (via wagmi readContract, NO ETHERS)
  // ==========================================================
  const checkOwner = async (): Promise<boolean> => {
    try {
      const owner = await withTimeout(
        readContract(wagmiConfig, {
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "owner",
        })
      );
  
      return owner.toLowerCase() === address?.toLowerCase();
    } catch (err) {
      console.warn("⚠️ Owner check failed:", err);
      return false;
    }
  };

  // ==========================================================
  // 🕒 WaitTx — FULL VIEM, NO ETHERS
  // ==========================================================
  const waitTx = async (hash: `0x${string}`) => {
    return await withTimeout(
      waitForTransactionReceipt(wagmiConfig, {
        hash,
        pollingInterval: 2000,
      }),
      15000
    );
  };

  // ==========================================================
  // ⚙️ execAdmin — core executor
  // ==========================================================
  const execAdmin = async (fn: string, args: any[] = []) => {
    setLoading(true);
    setError(null);

    const ownerOk = await checkOwner();
    if (!ownerOk) {
      setLoading(false);
      toast.error("🚫 Access Denied — Only contract owner can perform this action.");
      throw new Error("Access Denied");
    }

    const toastId = toast.loading(`⏳ Executing ${fn}...`);

    try {
      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: fn,
        args,
      });

      const receipt = await waitTx(hash);
      const txHash = receipt?.transactionHash || hash;

      toast.success(
        <span>
          ✅ <b>{fn}</b> success!{" "}
          <a
            href={`${explorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            View TX
          </a>
        </span>,
        { id: toastId }
      );

      if (refetch) {
        try {
          await refetch();
        } catch (e) {
          console.warn("Refetch failed:", e);
        }
      }

      return receipt;
    } catch (err: any) {
      console.error(`❌ ${fn} failed:`, err);
      toast.error(err?.shortMessage || err?.message || "Transaction failed ❌", {
        id: toastId,
      });
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🧾 ADMIN FUNCTIONS
  // ==========================================================
  const setMerkleRoot = (root: `0x${string}`) =>
    execAdmin("setMerkleRoot", [root]);

  const setWhitelist = (account: `0x${string}`, status: boolean) =>
    execAdmin("setWhitelist", [account, status]);

  const batchSetWhitelist = (accounts: `0x${string}`[], statuses: boolean[]) =>
    execAdmin("batchSetWhitelist", [accounts, statuses]);

  const setAirdropTaxExempt = (
    account: `0x${string}`,
    exemptAmount: bigint | string
  ) => {
    const amt =
      typeof exemptAmount === "string"
        ? parseUnits(exemptAmount, 18)
        : exemptAmount;
    return execAdmin("setAirdropTaxExempt", [account, amt]);
  };

  const setAirdrop = (user: `0x${string}`, amount: bigint | string) => {
    const amt =
      typeof amount === "string" ? parseUnits(amount, 18) : amount;
    return execAdmin("setAirdrop", [user, amt]);
  };

  const topUpRewardPool = (amount: bigint | string) => {
    const amt =
      typeof amount === "string" ? parseUnits(amount, 18) : amount;
    return execAdmin("topUpRewardPool", [amt]);
  };

  const mintRewardPool = (amount: bigint | string) => {
    const amt =
      typeof amount === "string" ? parseUnits(amount, 18) : amount;
    return execAdmin("mintRewardPool", [amt]);
  };

  const updateRewardPool = (newAmount: bigint | string) => {
    const amt =
      typeof newAmount === "string" ? parseUnits(newAmount, 18) : newAmount;
    return execAdmin("updateRewardPool", [amt]);
  };

  const batchClaimAirdropWithMerkleProof = (
    addresses: `0x${string}`[],
    accounts: `0x${string}`[],
    amounts: (bigint | string)[],
    proofs: string[][]
  ) => {
    const normalized = amounts.map((a) =>
      typeof a === "string" ? parseUnits(a, 18) : a
    );
    return execAdmin("batchClaimAirdropWithMerkleProof", [
      addresses,
      accounts,
      normalized,
      proofs,
    ]);
  };

  // ==========================================================
  // RETURN
  // ==========================================================
  return {
    setMerkleRoot,
    setWhitelist,
    batchSetWhitelist,
    setAirdropTaxExempt,
    setAirdrop,
    topUpRewardPool,
    mintRewardPool,
    updateRewardPool,
    batchClaimAirdropWithMerkleProof,

    loading,
    error,
    isOwner: checkOwner,
  };
}
