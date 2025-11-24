// src/hooks/useClaimAirdrop.ts
import airdropAbi from "@/abis/Gicoin-latest.json";
import { AIRDROP_ADDRESS } from "@/lib/constants";
import { wagmiConfig } from "@/lib/wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { parseEther } from "viem";

export function useClaimAirdrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const hash = await writeContract(wagmiConfig, {
        abi: airdropAbi,
        address: AIRDROP_ADDRESS as `0x${string}`,
        functionName: "claimAirdrop",
        args: [parseEther(amount)],
      });

      await waitForTransactionReceipt(wagmiConfig, { hash });

      return hash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdropStatus"] });
    },
  });
}
