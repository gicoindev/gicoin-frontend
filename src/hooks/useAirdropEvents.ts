"use client";

import { useContracts } from "@/config/contracts";
import { events } from "@/config/events";
import { AirdropEvent } from "@/types/gicoin";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Log } from "viem";
import { useWatchContractEvent } from "wagmi";

export function useAirdropEvents(enabledOverride?: boolean) {
  const { gicoin } = useContracts();
  const pathname = usePathname();
  // allow caller to override isActive
  const isActive = typeof enabledOverride === "boolean" ? enabledOverride : !!pathname?.includes("/airdrop");

  const [logs, setLogs] = useState<AirdropEvent[]>([]);
  const lastLogRef = useRef<string | null>(null);
  const lastUpdateRef = useRef(0);

  const safeAddLog = useCallback((newLog: AirdropEvent) => {
    const now = Date.now();

    if (
      newLog.txHash === lastLogRef.current &&
      now - lastUpdateRef.current < 3000
    )
      return;

    lastLogRef.current = newLog.txHash;
    lastUpdateRef.current = now;

    setLogs((prev) => {
      if (prev.some((l) => l.txHash === newLog.txHash)) return prev;
      return [newLog, ...prev].slice(0, 100);
    });
  }, []);

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
