"use client";

import { useContracts } from "@/config/contracts";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

// ==========================================================
// 🔒 useLockTimer — ambil waktu staking real dari kontrak
// ==========================================================
export function useLockTimer(address?: `0x${string}`) {
  const { gicoin } = useContracts();

  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const [canUnstake, setCanUnstake] = useState(false);

  // 🧭 Take timestamp staking the lastime from contract
  const { data: stakingTime } = useReadContract({
    abi: gicoin.abi,
    address: gicoin.address,
    functionName: "stakingTime",
    args: address ? [address] : undefined,
    // Wagmi v2: use scopeKey instead of query.enabled
    scopeKey: address ? `stakingTime-${address}` : undefined,
  });

  // ⏳ Update lockUntil from stakingTime + 30 days
  useEffect(() => {
    if (!stakingTime) {
      setLockUntil(null);
      return;
    }
    const unlockMs = Number(stakingTime) * 1000 + 30 * 24 * 60 * 60 * 1000;
    setLockUntil(unlockMs);
  }, [stakingTime]);

  // 🧮 Countdown updater
  useEffect(() => {
    if (!lockUntil) return;
    const tick = () => {
      const diff = lockUntil - Date.now();
      if (diff <= 0) {
        setCountdown("Unlocked 🎉");
        setCanUnstake(true);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
      setCanUnstake(false);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [lockUntil]);

  return { lockUntil, countdown, canUnstake };
}
