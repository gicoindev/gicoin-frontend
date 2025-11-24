"use client";

import { useContracts } from "@/config/contracts";
import type { Abi, Hash } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

export function useToken() {
  const { address } = useAccount();
  const { gicoin } = useContracts();
  const { writeContractAsync } = useWriteContract();

  // ==========================================================
  // 📊 Safe Read Data
  // ==========================================================

  const { data: totalSupplyRaw } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "totalSupply",
  });

  // Wagmi v2 → no "enabled", use conditional args
  const balanceArgs = address
    ? {
        abi: gicoin.abi as Abi,
        address: gicoin.address,
        functionName: "balanceOf",
        args: [address],
      }
    : undefined;

  const { data: balanceRaw } = useReadContract(balanceArgs);

  const totalSupply = totalSupplyRaw ?? 0n;
  const balance = balanceRaw ?? 0n;

  // ==========================================================
  // ⚙️ Write Actions
  // ==========================================================
  async function mint(to: string, amount: bigint): Promise<Hash> {
    return await writeContractAsync({
      address: gicoin.address,
      abi: gicoin.abi as Abi,
      functionName: "mint",
      args: [to, amount],
    });
  }

  async function burn(account: string, amount: bigint): Promise<Hash> {
    return await writeContractAsync({
      address: gicoin.address,
      abi: gicoin.abi as Abi,
      functionName: "burn",
      args: [account, amount],
    });
  }

  return {
    totalSupply,
    balance,
    mint,
    burn,
  };
}
