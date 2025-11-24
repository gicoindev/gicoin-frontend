import { useContracts } from "@/config/contracts";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useReadContract, useWatchBlocks } from "wagmi";

// Tipe data output biar strongly typed
interface AdminStats {
  totalSupply: string;
  totalStaked: string;
  rewardPool: string;
  rewardRate: string;
  taxRate: string;
  proposalCount: string;
  loading: boolean;
  error?: string;
}

export function useAdminStats(): AdminStats {
  const { gicoin } = useContracts();
  const [stats, setStats] = useState<AdminStats>({
    totalSupply: "0",
    totalStaked: "0",
    rewardPool: "0",
    rewardRate: "0",
    taxRate: "0",
    proposalCount: "0",
    loading: true,
  });
  const [error, setError] = useState<string | undefined>(undefined);

  // ------------------------------
  // 📡 READ CONTRACT CALLS
  // ------------------------------
  const totalSupplyQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "totalSupply",
  });

  const totalStakedQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "totalStaked",
  });

  const rewardPoolQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "getRewardPoolStatus",
  });

  const rewardRateQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "rewardRate",
  });

  const taxRateQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "taxRate",
  });

  const proposalCountQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "proposalCount",
  });

  // ------------------------------
  // 🔄 AUTO REFRESH tiap block baru
  // ------------------------------
  useWatchBlocks({
    onBlock() {
      totalSupplyQuery.refetch?.();
      totalStakedQuery.refetch?.();
      rewardPoolQuery.refetch?.();
      rewardRateQuery.refetch?.();
      taxRateQuery.refetch?.();
      proposalCountQuery.refetch?.();
    },
  });

  // ------------------------------
  // ⚙️ UPDATE STATE SAAT DATA MASUK
  // ------------------------------
  useEffect(() => {
    try {
      setStats({
        totalSupply: totalSupplyQuery.data
          ? formatUnits(totalSupplyQuery.data as bigint, 18)
          : "0",
        totalStaked: totalStakedQuery.data
          ? formatUnits(totalStakedQuery.data as bigint, 18)
          : "0",
        rewardPool: rewardPoolQuery.data
          ? formatUnits((rewardPoolQuery.data as any)[0] as bigint, 18)
          : "0",
        rewardRate: rewardRateQuery.data
          ? rewardRateQuery.data.toString()
          : "0",
        taxRate: taxRateQuery.data ? taxRateQuery.data.toString() : "0",
        proposalCount: proposalCountQuery.data
          ? proposalCountQuery.data.toString()
          : "0",
        loading:
          totalSupplyQuery.isFetching ||
          totalStakedQuery.isFetching ||
          rewardPoolQuery.isFetching ||
          rewardRateQuery.isFetching ||
          taxRateQuery.isFetching ||
          proposalCountQuery.isFetching,
      });
    } catch (err) {
      console.error("useAdminStats error:", err);
      setError("Failed to load contract data");
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [
    totalSupplyQuery.data,
    totalStakedQuery.data,
    rewardPoolQuery.data,
    rewardRateQuery.data,
    taxRateQuery.data,
    proposalCountQuery.data,
    totalSupplyQuery.isFetching,
    totalStakedQuery.isFetching,
    rewardPoolQuery.isFetching,
    rewardRateQuery.isFetching,
    taxRateQuery.isFetching,
    proposalCountQuery.isFetching,
  ]);

  return { ...stats, error };
}
