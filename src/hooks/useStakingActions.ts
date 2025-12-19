"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

/**
 * 🎯 Staking Hook (stake, claimReward, unstake)
 */
export function useStakingActions() {
  const { address } = useAccount();
  const { gicoin } = useContracts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Debug Info
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("[useStakingActions] Connected:", {
        chainId: (window as any)?.ethereum?.chainId,
        contract: gicoin.address,
        account: address,
      });
    }
  }, [gicoin.address, address]);

  /**
   * Read staked balance
   */
  const getStakedBalance = useCallback(async () => {
    if (!address) return 0n;

    const staked = await readContract(wagmiConfig, {
      address: gicoin.address,
      abi: gicoin.abi,
      functionName: "stakedAmount",
      args: [address],
    });

    return staked as bigint;
  }, [address, gicoin]);

  /**
   * Generic TX Handler
   */
  const txHandler = useCallback(
    async (
      fnName: "stake" | "unstake" | "claimReward",
      args: readonly unknown[],
      messages: { start: string; success: string; error: string }
    ) => {
      if (!address) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);

      try {
        toast.info(messages.start);

        const hash = await writeContract(wagmiConfig, {
          account: address,
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: fnName,
          args,
        });

        toast.info("⏳ Menunggu konfirmasi...");
        await waitForTransactionReceipt(wagmiConfig, { hash });
        toast.success(messages.success);

        return hash;
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        console.error(`❌ TX Error (${fnName}):`, msg);
        setError(msg);

        // Smart error translation
        if (msg.includes("user rejected")) toast.error("🙅 Transaksi dibatalkan");
        else if (msg.includes("E12")) toast.error("Saldo tidak cukup 💰");
        else if (msg.includes("E13")) toast.error("Jumlah stake di bawah minimum ❌");
        else if (msg.includes("E18")) toast.warning("⏳ Belum 30 hari untuk unstake");
        else if (msg.includes("E16")) toast.warning("⚠️ Unstake harus full");
        else if (msg.includes("E27")) toast.warning("⏳ Klaim reward hanya per 30 hari");
        else if (msg.includes("E28")) toast.warning("Jumlah klaim melebihi reward");
        else if (msg.includes("gas")) toast.warning("⚙️ Gas error (cek RPC)");
        else toast.error(`${messages.error}: ${msg}`);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, gicoin]
  );

  /**
   * Stake
   */
  const stake = useCallback(
    async (amount: string | bigint) => {
      const parsed = typeof amount === "bigint" ? amount : parseEther(amount);
      return txHandler("stake", [parsed], {
        start: "🚀 Mengirim transaksi staking...",
        success: "🎉 Stake berhasil dikonfirmasi!",
        error: "Gagal stake",
      });
    },
    [txHandler]
  );

  /**
   * Claim Reward
   */
  const claim = useCallback(
    async (amount: string | bigint) => {
      const parsed =
        typeof amount === "bigint" ? amount : parseEther(amount);

      return txHandler("claimReward", [parsed], {
        start: "🎁 Mengirim transaksi klaim reward...",
        success: "🎁 Reward berhasil diklaim!",
        error: "Gagal claim reward",
      });
    },
    [txHandler]
  );

  /**
   * Unstake
   */
  const unstake = useCallback(
    async (amount?: string | bigint) => {
      let parsed: bigint;

      if (amount) {
        parsed = typeof amount === "bigint" ? amount : parseEther(amount);
      } else {
        parsed = await getStakedBalance();
      }

      return txHandler("unstake", [parsed], {
        start: "💸 Mengirim transaksi unstake...",
        success: "💸 Unstake berhasil!",
        error: "Gagal unstake",
      });
    },
    [txHandler, getStakedBalance]
  );

  return {
    stake,
    claim,
    unstake,
    loading,
    error,
    getStakedBalance,
  };
}
