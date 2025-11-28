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
  // if addressArg provided, use it; otherwise fallback to connected account
  const { address: accountAddress } = useAccount();
  const address = addressArg ?? accountAddress ?? undefined;

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
  // Backend Fetch
  // ====================================================
  const fetchBackendStatus = useCallback(
    async (addr: string) => {
      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(`${backendBase}/airdrop/status/${addr}`, {
          signal: controller.signal,
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
  // Onchain Fetch (VIEM)
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
  // Combine backend + onchain
  // ====================================================
  const fetchStatus = useCallback(async () => {
    if (!address || !isMounted.current) return;

    const now = Date.now();
    if (now - lastFetchRef.current < 4000) return;
    if (typeof document !== "undefined" && document.hidden) return;

    lastFetchRef.current = now;
    abortRef.current?.abort();

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      const [backendData, onchainData] = await Promise.all([
        fetchBackendStatus(address),
        fetchOnchainStatus(address),
      ]);

      if (!isMounted.current) return;

      setStatus((prev) => ({
        ...prev,
        address,
        eligible: backendData?.eligible ?? prev.eligible,
        claimed: onchainData.claimed,
        poolBalance: onchainData.poolBalance,
        amount: backendData?.amount ?? prev.amount,
        proof: backendData?.proof?.length ? backendData.proof : prev.proof,
        isRegistered: onchainData.isRegistered,
        isWhitelisted: onchainData.isWhitelisted,
        loading: false,
      }));

      setError(null);
    } catch (err: any) {
      console.error("❌ useAirdropStatus error:", err);
      setError(err.message);
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [address, fetchBackendStatus, fetchOnchainStatus]);

  // ====================================================
  // Mount / Unmount
  // ====================================================
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // Auto refetch on address change
  useEffect(() => {
    if (!address) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }
    fetchStatus();
  }, [address, fetchStatus]);

  // ====================================================
  // Watch Events
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

  // ====================================================
  // Reset on disconnect
  // ====================================================
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
