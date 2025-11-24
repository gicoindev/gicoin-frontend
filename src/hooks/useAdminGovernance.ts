"use client";

import { useContracts } from "@/config/contracts";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import type { Abi, Hash } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";

export function useAdminGovernance() {
  const { gicoin } = useContracts();
  const { address } = useAccount();
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // ============================================================================
  // 🔍 READ OWNER
  // ============================================================================
  const ownerQuery = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "owner",
  });

  useEffect(() => {
    if (!ownerQuery.data) return;
    const owner = ownerQuery.data.toString();
    setIsOwner(owner.toLowerCase() === address?.toLowerCase());
  }, [ownerQuery.data, address]);

  // ============================================================================
  // 🧰 SAFE CALL WRAPPER
  // ============================================================================
  async function callContract(
    fn: string,
    args: any[]
  ): Promise<Hash | null> {
    if (!isOwner) {
      toast({
        title: "🚫 Permission Denied",
        description: "Only contract owner can perform this action.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: fn,
        args,
      });

      toast({
        title: "✅ Transaction Sent",
        description: `${fn} executed`,
      });

      return tx as Hash;
    } catch (err: any) {
      console.error(`❌ ${fn} failed`, err);
      const msg = err?.shortMessage || err?.message || "Transaction failed";
      setError(msg);

      toast({
        title: "❌ Error",
        description: msg,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // 📊 GOVERNANCE FUNCTIONS
  // ============================================================================
  async function setQuorumPercentage(newPercent: number): Promise<Hash | null> {
    return await callContract("setQuorumPercentage", [
      BigInt(newPercent),
    ]);
  }

  async function setProposalTimes(
    proposalId: number,
    start: number,
    end: number
  ): Promise<Hash | null> {
    return await callContract("setProposalTimes", [
      BigInt(proposalId),
      BigInt(start),
      BigInt(end),
    ]);
  }

  // ============================================================================
  // 🧠 RETURN HOOK API
  // ============================================================================
  return {
    isOwner,
    loading,
    error,

    setQuorumPercentage,
    setProposalTimes,
  };
}
