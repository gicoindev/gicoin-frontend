"use client";
import { useContracts } from "@/config/contracts";
import { Abi, formatEther } from "viem";
import { useAccount, usePublicClient, useReadContract } from "wagmi";

export function useStakingRewards() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { gicoin } = useContracts();

  // rewardRate (uint256)
  const { data: rewardRate } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "rewardRate",
    scopeKey: "rewardRate",
  });

  // rewardPool (uint256)
  const { data: rewardPool } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "rewardPool",
    scopeKey: "rewardPool",
  });

  // MIN_STAKE_AMOUNT
  const { data: minStake } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "MIN_STAKE_AMOUNT",
    scopeKey: "minStake",
  });

  // lastClaimedTime(address)
  const { data: lastClaimed } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "lastClaimedTime",
    args: address ? [address as `0x${string}`] : undefined,
    scopeKey: address ? `lastClaimed-${address}` : undefined,
  });

  // calculateReward(address)
  const { data: calculatedReward } = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    functionName: "calculateReward",
    args: address ? [address as `0x${string}`] : undefined,
    scopeKey: address ? `calcReward-${address}` : undefined,
  });

  return {
    rewardRate: rewardRate ? Number(rewardRate) : 0,
    rewardPool: rewardPool ? formatEther(rewardPool as bigint) : "0",
    minStake: minStake ? formatEther(minStake as bigint) : "0",
    lastClaimed: lastClaimed ? Number(lastClaimed) : 0,
    calculatedReward: calculatedReward
      ? formatEther(calculatedReward as bigint)
      : "0",
  };
}
