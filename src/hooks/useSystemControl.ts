"use client";

import { useContracts } from "@/config/contracts";
import { useToast } from "@/hooks/use-toast";
import { wagmiConfig } from "@/lib/wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useEffect, useState } from "react";
import type { Abi } from "viem";
import { useAccount, useWriteContract } from "wagmi";

export function useSystemControl() {
  const { gicoin } = useContracts();
  const { toast } = useToast();
  const { address } = useAccount();

  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // --------------------------------------------------
  // 🔐 OWNER CHECK (VIEM ONLY)
  // --------------------------------------------------
  const isOwner = async (): Promise<boolean> => {
    try {
      if (!address) return false;

      const owner = await readContract(wagmiConfig, {
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "owner",
      });

      return (owner as string).toLowerCase() === address.toLowerCase();
    } catch (err) {
      console.warn("⚠️ owner check failed:", err);
      return false;
    }
  };

  // --------------------------------------------------
  // 🔍 Fetch paused state (OpenZeppelin Pausable)
  // --------------------------------------------------
  const checkPaused = async () => {
    try {
      const paused = await readContract(wagmiConfig, {
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "paused",
      });

      setIsPaused(Boolean(paused));
    } catch (err) {
      console.error("⚠️ checkPaused error:", err);
    }
  };

  // --------------------------------------------------
  // 🛑 PAUSE SYSTEM
  // --------------------------------------------------
  const pauseSystem = async () => {
    try {
      setLoading(true);

      if (!(await isOwner())) {
        toast({
          title: "🚫 Access Denied",
          description: "Only contract owner can pause the system.",
          variant: "destructive",
        });
        return;
      }

      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "pause",
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        pollingInterval: 1200,
      });

      toast({
        title: "🛑 System Paused",
        description: "All critical operations have been halted.",
      });

      setIsPaused(true);
    } catch (err: any) {
      toast({
        title: "❌ Pause Failed",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // 🟢 UNPAUSE SYSTEM
  // --------------------------------------------------
  const unpauseSystem = async () => {
    try {
      setLoading(true);

      if (!(await isOwner())) {
        toast({
          title: "🚫 Access Denied",
          description: "Only the owner can unpause the system.",
          variant: "destructive",
        });
        return;
      }

      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "unpause",
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        pollingInterval: 1200,
      });

      toast({
        title: "✅ System Active",
        description: "Operations have resumed.",
      });

      setIsPaused(false);
    } catch (err: any) {
      toast({
        title: "❌ Unpause Failed",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // ♻ Auto-refresh paused state
  // --------------------------------------------------
  useEffect(() => {
    checkPaused();
    const id = setInterval(checkPaused, 10000);
    return () => clearInterval(id);
  }, []);

  return {
    isPaused,
    loading,
    checkPaused,
    pauseSystem,
    unpauseSystem,
  };
}
