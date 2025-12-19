"use client";

import { useAirdropActions } from "@/hooks/useAirdropActions";
import { useAirdropEvents } from "@/hooks/useAirdropEvents";
import { useAirdropStatus } from "@/hooks/useAirdropStatus";
import { usePathname } from "next/navigation";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

type AirdropContextType = ReturnType<typeof useAirdropStatus> &
  ReturnType<typeof useAirdropActions> &
  ReturnType<typeof useAirdropEvents> & {
    address?: string;
    isConnected: boolean;
    isActive: boolean;
    MERKLE_ROOT?: string;
  };

const AirdropContext = createContext<AirdropContextType | null>(null);

export function AirdropProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  const MERKLE_ROOT = process.env.NEXT_PUBLIC_ACTIVE_MERKLE_ROOT || "";

  useEffect(() => {
    setIsActive(pathname?.includes("/airdrop") || false);
  }, [pathname]);

  const shouldStart = Boolean(isConnected && address && isActive);

  const status = useAirdropStatus(shouldStart ? address : null);
  const actions = useAirdropActions(shouldStart ? status.refetch : undefined);
  const events = useAirdropEvents(shouldStart);

  const wrapAction = <T extends (...args: any[]) => Promise<any>>(fn: T) =>
    async (...args: Parameters<T>) => {
      if (!shouldStart) return;
      const receipt = await fn(...args);
      if (receipt?.status === "success") await status.refetch?.();
      return receipt;
    };

  const value = useMemo(
    () => ({
      ...status,
      ...events,
      ...actions,

      isConnected,
      isActive,
      MERKLE_ROOT,

      register: wrapAction(actions.register),
      claimWithWhitelist: wrapAction(actions.claimWithWhitelist),
      claimWithMerkle: wrapAction(actions.claimWithMerkle),
    }),
    [address, isConnected, isActive, MERKLE_ROOT, status, events, actions]
  );

  useEffect(() => {
    if (!isActive) {
      console.log("🧹 Leaving airdrop page — cleanup context");
    }
  }, [isActive]);

  return <AirdropContext.Provider value={value}>{children}</AirdropContext.Provider>;
}

export const useAirdrop = () => {
  const ctx = useContext(AirdropContext);
  if (!ctx) throw new Error("useAirdrop must be used within AirdropProvider");
  return ctx;
};
