"use client"

import { useContracts } from "@/config/contracts"
import { events } from "@/config/events"
import type { Abi } from "viem"
import { useAccount, usePublicClient, useReadContract } from "wagmi"

// Tipe voters
export interface Voter {
  address: `0x${string}`
  votedFor: boolean
  votingPower: number
}

export function useGovernanceStats(proposalId?: number) {
  const { gicoin } = useContracts()
  const { address } = useAccount()
  const publicClient = usePublicClient()

  // ✅ Voting power user
  const { data: votingPower } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "getVotingPower",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  })

  // ✅ Quorum %
  const { data: quorumPercentage } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "quorumPercentage",
  })

  // ✅ Ambil voters via event logs (event Voted)
  async function fetchVoters(): Promise<Voter[]> {
    if (!proposalId) return [];
    if (!publicClient) return [];
    const logs = await publicClient.getLogs({
      address: gicoin.address,
      event: events.governance.voted,
      fromBlock: 1_000_000n,
      toBlock: "latest",
    });
  
    return logs
      .map((log) => {
        const args = log.args as unknown as {
          voter: `0x${string}`;
          proposalId: bigint;
          support: boolean;
        };
        if (Number(args.proposalId) !== proposalId) return null;
        return {
          address: args.voter,
          votedFor: args.support,
          votingPower: 0,
        };
      })
      .filter((v): v is Voter => v !== null);
  }
  
  return {
    votingPower: votingPower ? Number(votingPower.toString()) : 0,
    quorumPercentage: quorumPercentage ? Number(quorumPercentage) : 0,
    fetchVoters,
  }
}
