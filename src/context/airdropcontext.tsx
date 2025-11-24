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
    MERKLE_ROOT?: string; // ✅ tambahkan ke context
  };

const AirdropContext = createContext<AirdropContextType | null>(null);

export function AirdropProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  // 🧩 Ambil MERKLE_ROOT dari .env
  const MERKLE_ROOT = process.env.NEXT_PUBLIC_ACTIVE_MERKLE_ROOT || "";

  // 🧭 Deteksi halaman aktif
  useEffect(() => {
    const active = pathname?.includes("/airdrop");
    setIsActive(active);
    console.log(`📍 AirdropContext active: ${active}`);
  }, [pathname]);

  // 🧩 Debug info saat aktif
  useEffect(() => {
    if (isActive && MERKLE_ROOT) {
      console.log(`🌿 Active Merkle Root: ${MERKLE_ROOT}`);
    }
  }, [isActive, MERKLE_ROOT]);

  // 🔹 Hooks utama
  const status = useAirdropStatus();
  const actions = useAirdropActions(status.refetch);
  const events = useAirdropEvents();

  // ✅ Wrapper transaksi (auto refresh)
  const wrapAction = <T extends (...args: any[]) => Promise<any>>(fn: T) =>
    async (...args: Parameters<T>) => {
      if (!isActive) return;
      try {
        const receipt = await fn(...args);
        if (receipt?.status === "success") {
          console.log("✅ TX success — refreshing status...");
          await status.refetch?.();
        }
        return receipt;
      } catch (err) {
        console.error("❌ Airdrop action failed:", err);
        throw err;
      }
    };

  // 🧠 Gabungkan state + actions
  const value = useMemo(
    () => ({
      address,
      isConnected,
      ...status,
      ...events,
      ...actions,
      isActive,
      MERKLE_ROOT, // ✅ expose ke seluruh app
      register: wrapAction(actions.register),
      claimWithWhitelist: wrapAction(actions.claimWithWhitelist),
      claimWithMerkle: wrapAction(actions.claimWithMerkle),
    }),
    [address, isConnected, isActive, MERKLE_ROOT, status, events, actions]
  );

  // 🧹 Cleanup saat keluar halaman airdrop
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
