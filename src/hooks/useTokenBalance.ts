"use client";

import { Abi, formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";

export function useTokenBalance(
  tokenAddress: `0x${string}`,
  tokenAbi: Abi,
) {
  const { address } = useAccount();

  const { data, refetch } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    balance: data ? formatEther(data as bigint) : "0",
    rawBalance: data as bigint | undefined,
    refresh: refetch,
  };
}
