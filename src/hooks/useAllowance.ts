"use client";

import { toast } from "sonner";
import { Abi, formatEther, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";

export function useAllowance(
  tokenAddress: `0x${string}`,
  tokenAbi: Abi,
  spender: `0x${string}`
) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // ==========================================================
  // READ: Allowance
  // ==========================================================
  const { data: allowanceRaw, refetch } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "allowance",
    args: address ? [address, spender] : undefined,
    query: { enabled: !!address },
  });
  
  // ==========================================================
  // WRITE: Approve
  // ==========================================================
  async function approve(amount: string | bigint = "9999999999999") {
    try {
      const value = typeof amount === "string" ? parseEther(amount) : amount;
  
      const tx = await writeContractAsync({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [spender, value],
      });
  
      toast.success("Approval transaction sent!");
      await refetch(); // ← ini valid
      return tx;
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error("Approval failed");
      throw err;
    }
  }
  // ==========================================================
  // RETURN
  // ==========================================================
  return {
    allowance: allowanceRaw ? formatEther(allowanceRaw as bigint) : "0",
    allowanceRaw,
    approve,
    isPending,
    refresh: refetch,
  };
}
