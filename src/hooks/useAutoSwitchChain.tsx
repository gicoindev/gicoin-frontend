"use client";

import { useContracts } from "@/config/contracts";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

export function useAutoSwitchChain() {
  const { isConnected } = useAccount();
  const currentChain = useChainId();
  const { chainInfo } = useContracts();

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) return;
    if (!chainInfo?.id) return;

    // Sudah benar → aman
    if (currentChain === chainInfo.id) return;

    // Salah chain → switch
    toast.loading("Switching to correct chain...", { id: "switch_chain" });

    switchChain(
      { chainId: chainInfo.id },
      {
        onSuccess: () => {
          toast.success("Switched!", { id: "switch_chain" });
        },
        onError: () => {
          toast.error("Please switch chain manually", { id: "switch_chain" });
        },
      }
    );
  }, [isConnected, currentChain, chainInfo?.id]);
}
