"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import { useState } from "react";
import { toast } from "sonner";
import type { Abi } from "viem";
import { parseUnits } from "viem";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

// ==========================================================
// 🔹 Helper: timeout wrapper
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
export function useAirdropActions(refetch?: () => void) {
  const { address } = useAccount();
  const { gicoin } = useContracts();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // 📌 Explorer Mapping
  // ==========================================================
  const explorers: Record<number, string> = {
    97: "https://testnet.bscscan.com",
    56: "https://bscscan.com",
    1: "https://etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  };

  const explorer = explorers[chainId] || explorers[97];

  // ==========================================================
  // ⚙️ Universal Executor (NO ethers provider)
  // ==========================================================
  const exec = async (fn: string, args: any[] = []) => {
    setLoading(true);
    setError(null);

    const toastId = toast.loading(`⏳ Executing ${fn}...`);

    try {
      if (!address) throw new Error("⚠️ Please connect your wallet first.");

      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: fn,
        args,
      });

      const receipt = await withTimeout(
        waitForTransactionReceipt(wagmiConfig, {
          hash,
          pollingInterval: 1500,
        }),
        15000
      );

      toast.success(
        <span>
          ✅ <b>{fn}</b> success!{" "}
          <a
            href={`${explorer}/tx/${hash}`}
            target="_blank"
            className="underline text-blue-400"
          >
            View TX
          </a>
        </span>,
        { id: toastId }
      );

      if (typeof refetch === "function") {
        try {
          await Promise.resolve(refetch());
        } catch (e) {
          console.warn("Refetch error:", e);
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
  // ACTIONS
  // ==========================================================

  const register = () => exec("registerAirdrop");

  const claimWithWhitelist = (amount: bigint | string) => {
    const value = typeof amount === "string" ? parseUnits(amount, 18) : amount;
    return exec("claimAirdropWithWhitelist", [value]);
  };

  const claimWithMerkle = (
    amount: bigint | string,
    proof: readonly `0x${string}`[]
  ) => {
    if (!proof?.length) throw new Error("Merkle proof missing");

    if (proof.some((p) => !/^0x([A-Fa-f0-9]{64})$/.test(p)))
      throw new Error("Invalid Merkle proof element");

    const value = typeof amount === "string" ? parseUnits(amount, 18) : amount;

    return exec("claimAirdropWithMerkleProof", [value, proof]);
  };

  return {
    register,
    claimWithWhitelist,
    claimWithMerkle,
    loading,
    error,
  };
}
