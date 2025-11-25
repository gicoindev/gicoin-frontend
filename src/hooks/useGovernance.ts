"use client";

import { useContracts } from "@/config/contracts";
import { useGovernanceActions } from "@/hooks/useGovernanceActions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Log, decodeEventLog } from "viem";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";

export interface Proposal {
  id: number;
  description: string;
  startTime: number;
  endTime: number;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
  votingClosed: boolean;
  quorumReached: boolean;
  autoExecuted: boolean;
  voteCount: number;
}

// =======================
//  BLOCK RANGE HELPER
// =======================
async function safeRange(client: any) {
  const latest = await client.getBlockNumber();
  const RANGE = 50000n; // max allowed for public BSC RPC

  return {
    from: latest > RANGE ? latest - RANGE : 0n,
    to: latest,
  };
}

export function useGovernance() {
  const { address } = useAccount();
  const { createProposal, vote, closeVoting, executeProposal } =
    useGovernanceActions();
  const publicClient = usePublicClient()!;
  const { gicoin } = useContracts();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toNum = (v: any) =>
    v !== undefined && v !== null ? Number(v.toString()) : 0;

  // ==========================================================
  // 📦 Load proposals
  // ==========================================================
  const loadProposals = async () => {
    try {
      setLoading(true);

      const proposalCount = (await publicClient.readContract({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "proposalCount",
      })) as bigint;

      const total = Number(proposalCount);
      const loaded: Proposal[] = [];

      for (let i = 0; i < total; i++) {
        const p = (await publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "proposals",
          args: [BigInt(i)],
        })) as any;

        loaded.push({
          id: toNum(p.id ?? p[0]),
          description: String(p.description ?? p[1] ?? "undefined"),
          startTime: toNum(p.startTime ?? p[2]) * 1000,
          endTime: toNum(p.endTime ?? p[3]) * 1000,
          votesFor: toNum(p.votesFor ?? p[9]),
          votesAgainst: toNum(p.votesAgainst ?? p[10]),
          executed: Boolean(p.executed ?? p[5]),
          votingClosed: Boolean(p.votingClosed ?? p[6]),
          quorumReached: Boolean(p.quorumReached ?? p[8]),
          autoExecuted: Boolean(p.autoExecuted ?? p[7]),
          voteCount: toNum(p.voteCount ?? p[4]),
        });
      }

      setProposals(loaded.reverse());
    } catch (err) {
      console.error("❌ loadProposals error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // 🧾 Load PAST events — PATCHED (safe range)
  // ==========================================================
  const loadEvents = async () => {
    try {
      const range = await safeRange(publicClient);

      const logs = await publicClient.getLogs({
        address: gicoin.address,
        fromBlock: range.from,
        toBlock: range.to,
      });

      const decoded = logs
        .map((log) => {
          try {
            return decodeEventLog({ abi: gicoin.abi, ...log });
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      setEvents(decoded as any[]);
    } catch (err) {
      console.error("⚠️ loadEvents failed:", err);
    }
  };

  // ==========================================================
  // 🔄 Auto refresh (15s)
  // ==========================================================
  useEffect(() => {
    loadProposals();
    loadEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadProposals, 15000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================================
  // 🔔 Shared event handler
  // ==========================================================
  function handleEvent(logs: Log[]) {
    logs.forEach((log) => {
      const decoded = decodeEventLog({
        abi: gicoin.abi,
        ...log,
      }) as {
        eventName: string;
        args: Record<string, any>;
      };

      setEvents((prev) => [
        { type: decoded.eventName, detail: decoded, time: Date.now() },
        ...prev,
      ]);

      switch (decoded.eventName) {
        case "ProposalCreated":
          toast.success(`📝 Proposal Created: ${decoded.args.description}`);
          break;
        case "Voted":
          toast(
            `🗳️ Vote ${
              decoded.args.support ? "YES" : "NO"
            } by ${decoded.args.voter}`
          );
          break;
        case "VotingClosed":
          toast.warning(
            `🔒 Voting Closed (ID ${decoded.args.proposalId}) ${
              decoded.args.quorumReached ? "✅ Quorum" : "❌ No quorum"
            }`
          );
          break;
        case "ProposalExecuted":
          toast.success(
            `🚀 Proposal Executed (ID ${decoded.args.proposalId}) ${
              decoded.args.approved ? "Approved" : "Rejected"
            }`
          );
          break;
      }

      loadProposals();
    });
  }

  // ==========================================================
  // 📡 Watch live events
  // ==========================================================
  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: "ProposalCreated",
    onLogs: handleEvent,
  });

  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: "Voted",
    onLogs: handleEvent,
  });

  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: "VotingClosed",
    onLogs: handleEvent,
  });

  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: "ProposalExecuted",
    onLogs: handleEvent,
  });

  // ==========================================================
  // RETURN
  // ==========================================================
  return {
    proposals,
    events,
    createProposal,
    vote,
    closeVoting,
    executeProposal,
    reloadProposalCount: loadProposals,
    loading,
    address,
  };
}
