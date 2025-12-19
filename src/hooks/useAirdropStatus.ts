"use client";

import { useContracts } from "@/config/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import { readContract } from "@wagmi/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useWatchContractEvent } from "wagmi";

type AirdropStatus = {
  address?: string;
  eligible: boolean;
  claimed: boolean;
  poolBalance: number;
  amount: string;
  proof: string[];
  isRegistered: boolean;
  isWhitelisted: boolean;
  loading: boolean;
};

export function useAirdropStatus(addressArg?: string | null) {
  const { address: wallet } = useAccount();
  const address = addressArg ?? wallet ?? undefined;

  const { gicoin, rewardPoolWallet } = useContracts();

  const [status, setStatus] = useState<AirdropStatus>({
    eligible: false,
    claimed: false,
    poolBalance: 0,
    amount: "0",
    proof: [],
    isRegistered: false,
    isWhitelisted: false,
    loading: true,
  });

  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL!;

  // ====================================================
  // 1️⃣ Load local proof from /public/proofs (no cache)
  // ====================================================
  async function loadLocalProof(addr: string) {
    try {
      const res = await fetch(`/proofs/${addr.toLowerCase()}.json`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ====================================================
  // 2️⃣ Backend fetch
  // ====================================================
  const fetchBackendStatus = useCallback(
    async (addr: string) => {
      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(`${backendBase}/airdrop/status/${addr}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        return await res.json();
      } catch (err: any) {
        if (err.name === "AbortError") return null;
        console.warn("⚠ Backend unavailable:", err);
        return null;
      }
    },
    [backendBase]
  );

  // ====================================================
  // 3️⃣ On-chain fetch
  // ====================================================
  const fetchOnchainStatus = useCallback(
    async (addr: string) => {
      try {
        const [
          claimedRaw,
          poolBalanceRaw,
          isRegisteredRaw,
          isWhitelistedRaw,
          decimalsRaw,
        ] = await Promise.all([
          readContract(wagmiConfig, {
            address: gicoin.address,
            abi: gicoin.abi,
            functionName: "hasClaimed",
            args: [addr],
          }) as Promise<boolean>,

          readContract(wagmiConfig, {
            address: gicoin.address,
            abi: gicoin.abi,
            functionName: "balanceOf",
            args: [rewardPoolWallet],
          }) as Promise<bigint>,

          readContract(wagmiConfig, {
            address: gicoin.address,
            abi: gicoin.abi,
            functionName: "airdropRegistered",
            args: [addr],
          }) as Promise<boolean>,

          readContract(wagmiConfig, {
            address: gicoin.address,
            abi: gicoin.abi,
            functionName: "isWhitelisted",
            args: [addr],
          }) as Promise<boolean>,

          readContract(wagmiConfig, {
            address: gicoin.address,
            abi: gicoin.abi,
            functionName: "decimals",
          }) as Promise<number>,
        ]);

        return {
          claimed: claimedRaw,
          poolBalance: Number(formatUnits(poolBalanceRaw, decimalsRaw)),
          isRegistered: isRegisteredRaw,
          isWhitelisted: isWhitelistedRaw,
        };
      } catch (err) {
        console.error("❌ Onchain fetch error:", err);
        return {
          claimed: false,
          poolBalance: 0,
          isRegistered: false,
          isWhitelisted: false,
        };
      }
    },
    [gicoin, rewardPoolWallet]
  );

  // ====================================================
  // 4️⃣ MASTER FETCH → local → backend → onchain
  // ====================================================
  const fetchStatus = useCallback(async () => {
    if (!address || !isMounted.current) return;

    const now = Date.now();
    if (now - lastFetchRef.current < 3500) return;
    if (typeof document !== "undefined" && document.hidden) return;
    lastFetchRef.current = now;

    abortRef.current?.abort();

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      // Step 1: Local file (fastest)
      const local = await loadLocalProof(address);

      // Step 2: Backend (fallback)
      const backend = await fetchBackendStatus(address);

      // Step 3: On-chain
      const onchain = await fetchOnchainStatus(address);

      if (!isMounted.current) return;

      const finalAmount =
        local?.amount ??
        backend?.amount ??
        "0";

      const finalProof =
        local?.proof?.length
          ? local.proof
          : backend?.proof?.length
          ? backend.proof
          : [];

      const finalEligible = finalProof.length > 0;

      setStatus({
        address,
        eligible: finalEligible,
        claimed: onchain.claimed,
        poolBalance: onchain.poolBalance,
        amount: finalAmount,
        proof: finalProof,
        isRegistered: onchain.isRegistered,
        isWhitelisted: onchain.isWhitelisted,
        loading: false,
      });

      setError(null);
    } catch (err: any) {
      console.error("❌ Status fetch error:", err);
      setError(err.message);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [address, fetchBackendStatus, fetchOnchainStatus]);

  // ====================================================
  // Mount/Unmount
  // ====================================================
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!address) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }
    fetchStatus();
  }, [address, fetchStatus]);

  // ====================================================
  // Watch Contract Events → auto refetch
  // ====================================================
  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: "AirdropClaimed",
    onLogs: () => fetchStatus(),
  });

  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi,
    eventName: "AirdropRegistered",
    onLogs: () => fetchStatus(),
  });

  useEffect(() => {
    if (!address && isMounted.current) {
      setStatus({
        eligible: false,
        claimed: false,
        poolBalance: 0,
        amount: "0",
        proof: [],
        isRegistered: false,
        isWhitelisted: false,
        loading: false,
      });
    }
  }, [address]);

  return { ...status, error, refetch: fetchStatus };
}
