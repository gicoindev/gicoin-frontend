"use client";

import { useContracts } from "@/config/contracts";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits, type Abi, type Hash } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";

export function useRewardPoolControl() {
  const { toast } = useToast();
  const { address, chain } = useAccount();
  const { gicoin, rewardPoolWallet } = useContracts(); // hanya address pool, bukan kontrak
  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient();

  // ==========================================================
  // STATE
  // ==========================================================
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string>("0x0");
  const [rewardRate, setRewardRateState] = useState<string>("0");
  const [rewardPool, setRewardPoolState] = useState<string>("0");

  // ==========================================================
  // CHECK OWNER
  // ==========================================================
  const ownerQuery = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "owner",
  });

  useEffect(() => {
    if (ownerQuery.data) {
      const owner = ownerQuery.data.toString();
      setOwnerAddress(owner);
      setIsOwner(owner.toLowerCase() === address?.toLowerCase());
    }
  }, [ownerQuery.data, address]);

  // ==========================================================
  // REWARD POOL STATUS (balance + committedReward)
  // ==========================================================
  const rewardPoolQuery = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "getRewardPoolStatus",
  });

  // rewardRate variable langsung dari kontrak
  const rewardRateQuery = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "rewardRate",
  });

  useEffect(() => {
    if (rewardPoolQuery.data) {
      const [balance] = rewardPoolQuery.data as [bigint, bigint];
      setRewardPoolState(formatUnits(balance, 18));
    }
    if (rewardRateQuery.data) {
      setRewardRateState(rewardRateQuery.data.toString());
    }
  }, [rewardPoolQuery.data, rewardRateQuery.data]);

  // ==========================================================
  // WRITE — FUND POOL (topUpRewardPool)
  // ==========================================================
  async function fundRewardPool(amount: string): Promise<Hash | undefined> {
    try {
      if (!isOwner) throw new Error("Only owner can fund the pool.");

      const tx = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "topUpRewardPool",
        args: [parseUnits(amount, 18)],
      });

      toast({
        title: "💰 Reward Pool Funded",
        description: `Tx: ${tx}`,
      });

      return tx;
    } catch (err: any) {
      console.error("❌ fundRewardPool failed:", err);
      toast({
        title: "❌ Fund Reward Pool Failed",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    }
  }

  // ==========================================================
  // WRITE — SET REWARD RATE (updateRewardRate)
  // ==========================================================
  async function setRewardRate(rate: string): Promise<Hash | undefined> {
    try {
      if (!isOwner) throw new Error("Only owner can update reward rate.");

      const tx = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "updateRewardRate",
        args: [BigInt(rate)],
      });

      toast({
        title: "🎁 Reward Rate Updated",
        description: `Tx: ${tx}`,
      });

      return tx;
    } catch (err: any) {
      console.error("❌ setRewardRate failed:", err);
      toast({
        title: "❌ Update Rate Failed",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    }
  }

  // ==========================================================
  // CHECK CONNECTION UTILITY
  // ==========================================================
  async function checkConnection() {
    try {
      if (!client) throw new Error("No public client available.");
      if (chain?.id !== 97) {
        toast({
          title: "⚠️ Wrong Network",
          description: "Switch to BSC Testnet (97).",
          variant: "destructive",
        });
        throw new Error("Wrong network");
      }

      const owner = await client.readContract({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "owner",
      });

      toast({
        title: "🟢 GICO Contract Connected",
        description: `Owner: ${owner}`,
      });

      return { address: gicoin.address, owner }
    } catch (err: any) {
      console.error("🔴 Connection error:", err);
      toast({
        title: "🔴 Failed Connection",
        description: err?.message,
        variant: "destructive",
      });
      throw err;
    }
  }

  return {
    // ✔ state
    isOwner,
    ownerAddress,
    rewardRate,
    rewardPool,
    rewardPoolWallet,

    // ✔ actions
    fundRewardPool,
    setRewardRate,

    // ✔ utils
    checkConnection,
  };
}
