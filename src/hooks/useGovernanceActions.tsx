"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Abi, Hash } from "viem";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import {
  waitForTransactionReceipt,
} from "wagmi/actions";

export function useGovernanceActions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { gicoin } = useContracts();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // 🌐 Explorer Auto Detect
  // ==========================================================
  const explorers = {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
    1: "https://etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  } as const;
  
  const explorer =
    explorers[chainId as keyof typeof explorers] ??
    explorers[97];
  

  // ==========================================================
  // 🔧 Generic TX Handler
  // ==========================================================
  const sendTx = useCallback(
    async (
      action: string,
      functionName: string,
      args: any[]
    ): Promise<Hash> => {
      setLoading(true);
      setError(null);

      const toastId = toast.loading(`${action} pending...`);

      try {
        // Send TX
        const hash = await writeContractAsync({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName,
          args,
        });

        // Wait confirmation
        await waitForTransactionReceipt(wagmiConfig, { hash });

        toast.success(
          <span>
            ✅ {action} success!{" "}
            <a
              href={`${explorer}${hash}`}
              target="_blank"
              className="underline text-blue-400"
            >
              View Tx
            </a>
          </span>,
          { id: toastId }
        );

        return hash;
      } catch (err: any) {
        const msg = err?.shortMessage || err?.message || "Transaction failed";
        console.error(`❌ ${action} error:`, msg);

        toast.error(msg, { id: toastId });
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [gicoin, explorer, writeContractAsync]
  );

  // ==========================================================
  // 🎯 Governance Functions
  // ==========================================================
  const createProposal = useCallback(
    async (description: string): Promise<Hash> =>
      sendTx("Create Proposal", "createProposal", [description]),
    [sendTx]
  );

  const vote = useCallback(
    async (proposalId: number, support: boolean): Promise<Hash> =>
      sendTx("Vote", "vote", [BigInt(proposalId), support]),
    [sendTx]
  );

  const closeVoting = useCallback(
    async (proposalId: number): Promise<Hash> =>
      sendTx("Close Voting", "closeVoting", [BigInt(proposalId)]),
    [sendTx]
  );

  const executeProposal = useCallback(
    async (proposalId: number): Promise<Hash> =>
      sendTx("Execute Proposal", "executeProposal", [BigInt(proposalId)]),
    [sendTx]
  );

  // ==========================================================
  // 📦 Return
  // ==========================================================
  return {
    createProposal,
    vote,
    closeVoting,
    executeProposal,

    loading,
    error,
    address,
  };
}
