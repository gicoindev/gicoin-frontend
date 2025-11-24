"use client";

import { useContracts } from "@/config/contracts";
import { events } from "@/config/events";
import { AirdropEvent } from "@/types/gicoin";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Log } from "viem";
import { useWatchContractEvent } from "wagmi";

export function useAirdropEvents() {
  const { gicoin } = useContracts();
  const pathname = usePathname();
  const isActive = pathname?.includes("/airdrop"); // aktif hanya di halaman /airdrop

  const [logs, setLogs] = useState<AirdropEvent[]>([]);
  const lastLogRef = useRef<string | null>(null);
  const lastUpdateRef = useRef(0);

  // ==========================================================
  // 🧠 Helper: aman untuk tambah log (anti spam & duplikat)
  // ==========================================================
  const safeAddLog = useCallback((newLog: AirdropEvent) => {
    const now = Date.now();

    // 🧱 Cooldown 3 detik per txHash
    if (
      newLog.txHash === lastLogRef.current &&
      now - lastUpdateRef.current < 3000
    )
      return;

    lastLogRef.current = newLog.txHash;
    lastUpdateRef.current = now;

    setLogs((prev) => {
      if (prev.some((l) => l.txHash === newLog.txHash)) return prev; // hindari duplikat
      return [newLog, ...prev].slice(0, 100); // batasi maksimum 100 log (hemat memori)
    });
  }, []);

  // ==========================================================
  // 🪂 AirdropRegistered
  // ==========================================================
  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: events.airdrop.registered.name,
    enabled: isActive,
    onLogs(newLogs: readonly Log[]) {
      if (!isActive) return;
      newLogs.forEach((log: Log) => {
        const { user } = (log as any).args;
        safeAddLog({
          eventName: "AirdropRegistered",
          user,
          txHash: log.transactionHash!,
        });
        toast.success(`✅ ${user} registered for airdrop`);
      });
    },
  });

  // ==========================================================
  // 🎁 AirdropClaimed
  // ==========================================================
  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: events.airdrop.claimed.name,
    enabled: isActive,
    onLogs(newLogs: readonly Log[]) {
      if (!isActive) return;
    
      newLogs.forEach((log: Log) => {
        const { user, amount, merkleRoot } = (log as any).args;
        safeAddLog({
          eventName: "AirdropClaimed",
          user,
          amount: amount.toString(),
          merkleRoot,
          txHash: log.transactionHash!,
        });
        toast.success(`🎁 ${user} claimed ${Number(amount) / 1e18} GIC`);
      });
    },
  });

  // ==========================================================
  // ❌ AirdropClaimFailed
  // ==========================================================
  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: events.airdrop.failed.name,
    enabled: isActive,
    onLogs(newLogs: readonly Log[]) {
      if (!isActive) return;
    
      newLogs.forEach((log: Log) => {
        const { user, amount, failureReason } = (log as any).args;
        safeAddLog({
          eventName: "AirdropClaimFailed",
          user,
          amount: amount.toString(),
          failureReason,
          txHash: log.transactionHash!,
        });
        toast.error(`❌ Claim failed for ${user}: ${failureReason}`);
      });
    },
  });

  // ==========================================================
  // ⚠️ Contract Paused / Unpaused
  // ==========================================================
  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: events.system.paused.name,
    enabled: isActive,
    onLogs(newLogs: readonly Log[]) {
      if (!isActive) return;
    
      toast("⚠️ Contract Paused or Unpaused", {
        description: "Check admin dashboard for current status",
      });
    },
  });

  // ==========================================================
  // 🧹 Reset logs saat keluar dari halaman airdrop
  // ==========================================================
  useEffect(() => {
    if (!isActive) {
      setLogs([]);
      lastLogRef.current = null;
      lastUpdateRef.current = 0;
      console.log("🧹 Airdrop event listeners paused");
    }
  }, [isActive]);

  return { logs, isActive };
}
