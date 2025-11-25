"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Abi, Hash } from "viem";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

export function useGovernanceActions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { gicoin } = useContracts();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // 🌐 Explorer Auto Detect (Mainnet First)
  // ==========================================================
  const explorers = {
    56: "https://bscscan.com/tx/",
    97: "https://testnet.bscscan.com/tx/",
  } as const;

  const explorer = explorers[chainId as keyof typeof explorers] ?? explorers[56];

  // ==========================================================
  // 🔧 Generic TX Handler (Production Safe)
  // ==========================================================
  const sendTx = useCallback(
    async (action: string, functionName: string, args: any[]): Promise<Hash> => {
      setLoading(true);
      setError(null);

      const toastId = toast.loading(`${action}...`);

      try {
        // Send TX
        const hash = await writeContractAsync({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName,
          args,
        });

        // Wait for blockchain confirmation
        await waitForTransactionReceipt(wagmiConfig, { hash });

        toast.success(
          <span>
            ✅ {action} Berhasil —{" "}
            <a
              href={`${explorer}${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400"
            >
              Lihat TX
            </a>
          </span>,
          { id: toastId }
        );

        return hash;
      } catch (err: any) {
        const msg = err?.shortMessage || err?.message || "Transaction failed";
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
    (description: string) =>
      sendTx("Membuat Proposal", "createProposal", [description]),
    [sendTx]
  );

  const vote = useCallback(
    (proposalId: number, support: boolean) =>
      sendTx("Mengirim Vote", "vote", [BigInt(proposalId), support]),
    [sendTx]
  );

  const closeVoting = useCallback(
    (proposalId: number) =>
      sendTx("Menutup Voting", "closeVoting", [BigInt(proposalId)]),
    [sendTx]
  );

  const executeProposal = useCallback(
    (proposalId: number) =>
      sendTx("Eksekusi Proposal", "executeProposal", [BigInt(proposalId)]),
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
