import { useContracts } from "@/config/contracts";
import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";

// 🧩 Helper aman untuk konversi nilai unknown ke BigInt
const safeBigInt = (val: unknown): bigint => {
  try {
    if (typeof val === "bigint") return val;
    if (typeof val === "number") return BigInt(val);
    if (typeof val === "string") return BigInt(val);
    return 0n;
  } catch {
    return 0n;
  }
};

export function useStakingStats() {
  const { address, isConnected } = useAccount();
  const { gicoin } = useContracts();
  const publicClient = usePublicClient();

  const [staked, setStaked] = useState("0");
  const [reward, setReward] = useState("0");
  const [balance, setBalance] = useState("0");
  const [minStake, setMinStake] = useState("0");
  const [stakingTime, setStakingTime] = useState<number | null>(null);
  const [lastClaimed, setLastClaimed] = useState<number | null>(null);
  const [apr, setApr] = useState(0);
  const [canUnstake, setCanUnstake] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!address || !isConnected || !publicClient) return;
    setLoading(true);
    setError(null);

    try {
      const [
        userStaked,
        pendingReward,
        stakeTime,
        lastClaim,
        rewardRate,
        userBalance,
        minStakeAmount,
      ] = await Promise.all([
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "stakedAmount",
          args: [address],
        }),
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "calculateReward",
          args: [address],
        }),
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "stakingTime",
          args: [address],
        }),
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "lastClaimedTime",
          args: [address],
        }),
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "rewardRate",
        }),
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "MIN_STAKE_AMOUNT",
        }),
      ]);

      const now = Math.floor(Date.now() / 1000);
      const stakeTimeNum = Number(stakeTime ?? 0);
      const lastClaimNum = Number(lastClaim ?? 0);

      setStaked(formatEther(safeBigInt(userStaked)));
      setReward(formatEther(safeBigInt(pendingReward)));
      setBalance(formatEther(safeBigInt(userBalance)));
      setMinStake(formatEther(safeBigInt(minStakeAmount)));
      setStakingTime(stakeTimeNum);
      setLastClaimed(lastClaimNum);

      setCanUnstake(stakeTimeNum > 0 && now >= stakeTimeNum + 2592000);
      setCanClaim(lastClaimNum > 0 ? now >= lastClaimNum + 2592000 : true);
      setApr(Number(rewardRate ?? 0) * 12);
    } catch (err: any) {
      console.error("❌ useStakingStats fetch error:", err);
      setError(err?.message || "Failed to fetch staking stats");
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, publicClient, gicoin]);

  useEffect(() => {
    if (isConnected) void fetchData();
  }, [isConnected, fetchData]);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => void fetchData(), 30000);
    return () => clearInterval(interval);
  }, [isConnected, fetchData]);

  const events = ["Staked", "Unstaked", "RewardClaimed"] as const;
  events.forEach((eventName) =>
    useWatchContractEvent({
      address: gicoin.address,
      abi: gicoin.abi,
      eventName,
      onLogs: () => void fetchData(),
    })
  );

  return {
    staked,
    reward,
    balance,
    apr,
    minStake,
    stakingTime,
    lastClaimed,
    canUnstake,
    canClaim,
    refetch: fetchData,
    loading,
    error,
  };
}
