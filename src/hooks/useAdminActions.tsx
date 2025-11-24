"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useState } from "react";
import { toast } from "sonner";
import type { Abi } from "viem";
import { parseUnits } from "viem";
import { useAccount, useChainId, useWriteContract } from "wagmi";

export function useAdminActions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { gicoin } = useContracts();

  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // 🌍 Explorer mapping
  // ==========================================================
  const explorers: Record<number, string> = {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
    1: "https://etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  };
  const explorer = explorers[chainId] || explorers[97];

  // ==========================================================
  // 🔐 Owner validation (FULL VIEM, NO ETHERS)
  // ==========================================================
  const isOwner = async (): Promise<boolean> => {
    if (!address) return false;

    try {
      const owner = await readContract(wagmiConfig, {
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "owner",
      });

      return (owner as string).toLowerCase() === address.toLowerCase();
    } catch (err) {
      console.warn("⚠️ Owner check failed:", err);
      return false;
    }
  };

  // ==========================================================
  // ⏱ WaitTx (FULL VIEM)
  // ==========================================================
  const waitTx = async (hash: `0x${string}`) => {
    return waitForTransactionReceipt(wagmiConfig, {
      hash,
      pollingInterval: 1200,
    });
  };

  // ==========================================================
  // ⚙️ Generic admin executor
  // ==========================================================
  const exec = async (fn: string, args: any[] = []) => {
    setLoading(true);
    setError(null);

    const ok = await isOwner();
    if (!ok) {
      setLoading(false);
      toast.error("🚫 You are not the contract owner.");
      throw new Error("Not owner");
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

      toast.success(
        <span>
          ✅ <b>{fn}</b> success —{" "}
          <a
            href={`${explorer}/tx/${receipt.transactionHash}`}
            target="_blank"
            className="underline"
          >
            View TX
          </a>
        </span>,
        { id: toastId }
      );

      return receipt;
    } catch (err: any) {
      console.error(`❌ ${fn} failed:`, err);
      toast.error(err?.shortMessage || err?.message || "TX failed ❌", {
        id: toastId,
      });
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🛠 SYSTEM
  // ==========================================================
  const pause = () => exec("pause");
  const unpause = () => exec("unpause");

  // ==========================================================
  // 💰 TOKEN
  // ==========================================================
  const mint = (to: `0x${string}`, amount: bigint) =>
    exec("mint", [to, amount]);

  const burn = (from: `0x${string}`, amount: bigint) =>
    exec("burn", [from, amount]);

  const setTaxRate = (rate: number) => exec("setTaxRate", [rate]);
  const setTaxWallet = (wallet: `0x${string}`) =>
    exec("setTaxWallet", [wallet]);

  const updateMaxTransactionLimit = (limit: bigint) =>
    exec("updateMaxTransactionLimit", [limit]);

  const batchAddToBlacklist = (accounts: `0x${string}`[]) =>
    exec("batchAddToBlacklist", [accounts]);

  const batchRemoveFromBlacklist = (accounts: `0x${string}`[]) =>
    exec("batchRemoveFromBlacklist", [accounts]);

  // ==========================================================
  // 🏦 STAKING / REWARD POOL
  // ==========================================================
  const setRewardPoolWallet = (wallet: `0x${string}`) =>
    exec("setRewardPoolWallet", [wallet]);

  const setMinStakeAmount = (amount: bigint) =>
    exec("setMinStakeAmount", [amount]);

  const topUpRewardPool = (amount: bigint | string) =>
    exec("topUpRewardPool", [
      typeof amount === "string" ? parseUnits(amount, 18) : amount,
    ]);

  const updateRewardRate = (rate: number) =>
    exec("updateRewardRate", [rate]);

  // ==========================================================
  // 🪂 AIRDROP
  // ==========================================================
  const setMerkleRoot = (root: `0x${string}`) =>
    exec("setMerkleRoot", [root]);

  const setWhitelist = (wallet: `0x${string}`, status: boolean) =>
    exec("setWhitelist", [wallet, status]);

  const batchSetWhitelist = (
    accounts: `0x${string}`[],
    statuses: boolean[]
  ) => exec("batchSetWhitelist", [accounts, statuses]);

  // ==========================================================
  // 🗳 GOVERNANCE
  // ==========================================================
  const setQuorumPercentage = (percent: number) =>
    exec("setQuorumPercentage", [percent]);

  const setProposalTimes = (
    id: bigint,
    start: bigint,
    end: bigint
  ) => exec("setProposalTimes", [id, start, end]);

  // ==========================================================
  // RETURN
  // ==========================================================
  return {
    pause,
    unpause,

    mint,
    burn,
    setTaxRate,
    setTaxWallet,
    updateMaxTransactionLimit,
    batchAddToBlacklist,
    batchRemoveFromBlacklist,

    setRewardPoolWallet,
    setMinStakeAmount,
    topUpRewardPool,
    updateRewardRate,

    setMerkleRoot,
    setWhitelist,
    batchSetWhitelist,

    setQuorumPercentage,
    setProposalTimes,

    loading,
    error,
    isOwner,
  };
}
