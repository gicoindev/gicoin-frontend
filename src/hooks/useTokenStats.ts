"use client";

import { useContracts } from "@/config/contracts";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

type Stats = {
  totalSupply: number;
  circulating: number;
  airdropProgress: number;
  activeProposals: number;
  loading: boolean;
};

export function useTokenStats() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { gicoin } = useContracts();

  const [stats, setStats] = useState<Stats>({
    totalSupply: 0,
    circulating: 0,
    airdropProgress: 0,
    activeProposals: 0,
    loading: true,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!publicClient) {
          setError("No client found");
          return;
        }

        // ----------------------------------------------------
        // 📌 READ CONTRACT VALUES (WAGMI + VIEM)
        // ----------------------------------------------------
        const [decimals, totalSupplyBN, rewardPoolBN, proposalCountBN] =
          await Promise.all([
            publicClient.readContract({
              address: gicoin.address,
              abi: gicoin.abi,
              functionName: "decimals",
            }),

            publicClient.readContract({
              address: gicoin.address,
              abi: gicoin.abi,
              functionName: "totalSupply",
            }),

            publicClient.readContract({
              address: gicoin.address,
              abi: gicoin.abi,
              functionName: "rewardPool",
            }),

            publicClient.readContract({
              address: gicoin.address,
              abi: gicoin.abi,
              functionName: "proposalCount",
            }),
          ]);

        const totalSupply = Number(formatUnits(totalSupplyBN as bigint, decimals as number));
        const rewardPool = Number(formatUnits(rewardPoolBN as bigint, decimals as number));

        const circulating = Math.max(0, totalSupply - rewardPool);
        const airdropProgress =
          totalSupply > 0 ? Math.round((rewardPool / totalSupply) * 100) : 0;

        // ----------------------------------------------------
        // 🏛️ ACTIVE PROPOSAL COUNT
        // ----------------------------------------------------
        let activeProposals = 0;
        const proposalCount = Number(proposalCountBN);

        if (proposalCount > 0) {
          const block = await publicClient.getBlock();
          const now = Number(block.timestamp);

          for (let id = 0; id < proposalCount; id++) {
            const p = (await publicClient.readContract({
              address: gicoin.address,
              abi: gicoin.abi,
              functionName: "proposals",
              args: [id],
            })) as any;

            const executed = Boolean(p.executed);
            const closed = Boolean(p.votingClosed);
            const start = Number(p.startTime);
            const end = Number(p.endTime);

            if (!executed && !closed && now >= start && now < end) {
              activeProposals++;
            }
          }
        }

        // ----------------------------------------------------
        // FINAL STATE
        // ----------------------------------------------------
        if (!mounted) return;
        setStats({
          totalSupply,
          circulating,
          airdropProgress,
          activeProposals,
          loading: false,
        });
        setError(null);
      } catch (err) {
        console.error("❌ useTokenStats error:", err);
        if (!mounted) return;

        setError("Failed to fetch token stats");
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [address, gicoin.address, publicClient]);

  return { ...stats, error };
}
