"use client";

import gicoinABI from "@/abis/Gicoin-latest.json";
import { wagmiConfig } from "@/lib/wagmi";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { formatEther, parseEther } from "viem";

// 📌 Kontrak
const GIC_CONTRACT = {
  address: "0xe4a9a0a40468efc73c5ab64fc4e86c765efab4dd" as `0x${string}`,
  abi: gicoinABI,
};

// 📊 Get balance
export async function getBalance(address?: `0x${string}`) {
  if (!address) return "0";

  try {
    const balance = await readContract(wagmiConfig, {
      ...GIC_CONTRACT,
      functionName: "balanceOf",
      args: [address],
    });

    return formatEther(balance as bigint);
  } catch (err) {
    console.error("❌ getBalance:", err);
    return "0";
  }
}

// 📊 Get staking summary
export async function loadSummary(address?: `0x${string}`) {
  if (!address)
    return { staked: "0", reward: "0", apr: "0", stakingTime: "0" };

  try {
    const [staked, reward, stakingTime] = await Promise.all([
      readContract(wagmiConfig, {
        ...GIC_CONTRACT,
        functionName: "stakedAmount",
        args: [address],
      }),
      readContract(wagmiConfig, {
        ...GIC_CONTRACT,
        functionName: "calculateReward",
        args: [address],
      }),
      readContract(wagmiConfig, {
        ...GIC_CONTRACT,
        functionName: "stakingTime",
        args: [address],
      }),
    ]);

    return {
      staked: formatEther(staked as bigint),
      reward: formatEther(reward as bigint),
      apr: "12",
      stakingTime: stakingTime?.toString() ?? "0",
    };
  } catch (err) {
    console.error("❌ loadSummary:", err);
    return { staked: "0", reward: "0", apr: "0", stakingTime: "0" };
  }
}

// 🔹 Stake
export async function stakeTokens(amount: string) {
  const txHash = await writeContract(wagmiConfig, {
    ...GIC_CONTRACT,
    functionName: "stake",
    args: [parseEther(amount)],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash: txHash });
}

// 🔹 Unstake
export async function unstakeTokens(amount: string) {
  const txHash = await writeContract(wagmiConfig, {
    ...GIC_CONTRACT,
    functionName: "unstake",
    args: [parseEther(amount)],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash: txHash });
}

// 🔹 Claim reward
export async function claimTokens(amount: string) {
  const txHash = await writeContract(wagmiConfig, {
    ...GIC_CONTRACT,
    functionName: "claimReward",
    args: [parseEther(amount)],
  });

  return waitForTransactionReceipt(wagmiConfig, { hash: txHash });
}
