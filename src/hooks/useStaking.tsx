"use client";
import { useContracts } from "@/config/contracts";
import { events } from "@/config/events";
import { getExplorerUrl } from "@/lib/explorer";
import { getPublicClient } from "@wagmi/core";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Abi, Hash, Log } from "viem";
import { formatEther, parseEther } from "viem";

import {
  useAccount,
  useConfig,
  usePublicClient,
  useReadContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";

// ==========================================================
// ⭐ useStaking Hook (v3.2 FINAL MAINNET-READY)
// ==========================================================
export function useStaking() {
  const { address } = useAccount();
  const config = useConfig();
  const { gicoin } = useContracts();

  const publicClient = usePublicClient()!;
  const { data: walletClient } = useWalletClient();

  const { writeContractAsync, isPending, isSuccess } = useWriteContract();

  const [balance, setBalance] = useState("0");
  const [staked, setStaked] = useState("0");
  const [reward, setReward] = useState("0");
  const [apr, setApr] = useState(60);

  const [eventsLog, setEventsLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const lastHash = useRef<string | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================
  // 📊 READ DATA (useReadContract tanpa `query.enabled`)
  // ==========================================================
  const { data: totalStaked } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "totalStaked",
    scopeKey: "totalStaked",
  });

  const { data: rewardPool } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "rewardPool",
    scopeKey: "rewardPool",
  });

  const { data: rewardRate } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "rewardRate",
    scopeKey: "rewardRate",
  });

  // ==========================================================
  // 🔄 FETCH DATA
  // ==========================================================
  const fetchData = async () => {
    if (!address) return;

    try {
      const [balanceRaw, stakedRaw, rewardRaw] = await Promise.all([
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "balanceOf",
          args: [address],
        }) as Promise<bigint>,

        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "stakedAmount",
          args: [address],
        }) as Promise<bigint>,

        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "calculateReward",
          args: [address],
        }) as Promise<bigint>,
      ]);

      setBalance(formatEther(balanceRaw));
      setStaked(formatEther(stakedRaw));
      setReward(formatEther(rewardRaw));
    } catch (err) {
      console.warn("⚠️ fetchData error:", err);
    }
  };

  // ==========================================================
  // ✍️ WRITE FUNCTIONS
  // ==========================================================
  async function stake(amount: string | bigint): Promise<Hash> {
    if (!address) throw new Error("Wallet belum terhubung");
    setLoading(true);
  
    try {
      const value =
        typeof amount === "string"
          ? parseEther(amount)   // string → BigInt
          : amount;              // bigint → sudah BigInt
  
      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "stake",
        args: [value],
      });
  
      toast.success(
        <span>
          ✅ Staking berhasil!{" "}
          <a
            href={getExplorerUrl(hash, publicClient.chain?.id) || "#"}
            target="_blank"
            className="underline text-blue-400"
            rel="noopener noreferrer"
          >
            Lihat TX
          </a>
        </span>
      );
  
      await publicClient.waitForTransactionReceipt({ hash });
      await new Promise((r) => setTimeout(r, 1500));
      await fetchData();
  
      return hash;
    } finally {
      setLoading(false);
    }
  }
  
  async function unstake(amount?: string | bigint): Promise<Hash> {
    setLoading(true);
    try {
      const unstakeValue =
        typeof amount === "string"
          ? parseEther(amount)
          : amount ?? parseEther(staked);

      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "unstake",
        args: [unstakeValue],
      });

      toast.success(
        <span>
          🏖️ Unstake berhasil!{" "}
          <a
          href={getExplorerUrl(hash, publicClient.chain?.id) || "#"}
            target="_blank"
            className="underline text-blue-400"
            rel="noopener noreferrer"
          >
            Lihat TX
          </a>
        </span>
      );

      await publicClient.waitForTransactionReceipt({ hash });
      await new Promise((r) => setTimeout(r, 1500));
      await fetchData();

      return hash;
    } finally {
      setLoading(false);
    }
  }

  async function claimReward(amount: string | bigint): Promise<Hash> {
    setLoading(true);
    try {
      const claimValue =
        typeof amount === "string"
          ? parseEther(amount)
          : amount;
  
      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "claimReward",
        args: [claimValue],
      });
  
      toast.success(
        <span>
          🎉 Reward berhasil!{" "}
          <a
            href={getExplorerUrl(hash, publicClient.chain?.id) || "#"}
            target="_blank"
            className="underline text-blue-400"
            rel="noopener noreferrer"
          >
            Lihat TX
          </a>
        </span>
      );
  
      await publicClient.waitForTransactionReceipt({ hash });
      await new Promise((r) => setTimeout(r, 1500));
      await fetchData();
  
      return hash;
    } finally {
      setLoading(false);
    }
  }
  
  // ==========================================================
  // 🛰️ EVENT HANDLER (UNIVERSAL FILTER)
  // ==========================================================
  const handleEventLogs = async (
    eventName: string,
    logs: Log[],
    skipRefresh = false
  ) => {
    const client = getPublicClient(config)!;

    const mapped = await Promise.all(
      logs.map(async (l) => {
        let blockTimestamp;

        try {
          if (l.blockNumber) {
            const block = await client.getBlock({ blockNumber: l.blockNumber });
            blockTimestamp = Number(block.timestamp);
          }
        } catch {}

        return {
          type: eventName,
          blockNumber: l.blockNumber,
          blockTimestamp,
          txHash: l.transactionHash,
          args: (l as any).args,
          time: new Date().toISOString(),
        };
      })
    );

    setEventsLog((prev) => [...mapped, ...prev].slice(0, 50));

    // Skip refresh for past events (avoid RPC spam)
    if (!skipRefresh) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(fetchData, 2000);
    }
  };

  // ==========================================================
  // 🔎 WATCH LIVE EVENTS
  // ==========================================================
  useEffect(() => {
    if (!address || !gicoin?.address) return;

    const eventNames = [
      "Staked",
      "Unstaked",
      "RewardClaimed",
      "RewardCalculated",
    ];

    const unsubscribers: (() => void)[] = [];
    let reconnectTimer: NodeJS.Timeout;

    const setupWatcher = async () => {
      try {
        eventNames.forEach((eventName) => {
          const unsubscribe = publicClient.watchContractEvent({
            address: gicoin.address,
            abi: gicoin.abi as Abi,
            eventName,
            onLogs: (logs) => {
              const filtered = logs.filter((log: any) => {
                const args = log.args || {};

                const userArg =
                  args.user ??
                  args.User ??
                  args.account ??
                  args[0] ??
                  args["0"];

                return (
                  typeof userArg === "string" &&
                  userArg.toLowerCase() === address?.toLowerCase()
                );
              });

              if (filtered.length === 0) return;

              for (const log of filtered) {
                if (log.transactionHash === lastHash.current) return;
                lastHash.current = log.transactionHash;
              }

              handleEventLogs(eventName, filtered);
            },
          });

          unsubscribers.push(unsubscribe);
        });
      } catch (err) {
        reconnectTimer = setTimeout(setupWatcher, 5000);
      }
    };

    setupWatcher();

    return () => {
      unsubscribers.forEach((u) => u());
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [address, gicoin.address, publicClient]);

  // ==========================================================
  // 📦 LOAD PAST EVENTS (NO REFRESH)
  // ==========================================================
  useEffect(() => {
    const loadPast = async () => {
      if (!address) return;

      const pastEvents = [
        { name: "Staked", event: events.staking.staked },
        { name: "Unstaked", event: events.staking.unstaked },
        { name: "RewardClaimed", event: events.staking.rewardClaimed },
      ];

      for (const { name, event } of pastEvents) {
        try {
          const logs = await publicClient.getLogs({
            address: gicoin.address,
            event,
            fromBlock: 0n,
            toBlock: "latest",
          });

          if (logs.length > 0) handleEventLogs(name, logs, true);
        } catch (err) {
          console.error(`❌ Error fetching ${name}:`, err);
        }
      }
    };

    loadPast();
  }, [address]);

  // ==========================================================
  // ⏳ INITIAL FETCH
  // ==========================================================
  useEffect(() => {
    if (address) fetchData();
  }, [address]);

  // ==========================================================
  // 📦 RETURN
  // ==========================================================
  return {
    balance,
    staked,
    reward,
    apr,
    totalStaked,
    rewardPool,
    rewardRate,

    stake,
    unstake,
    claimReward,

    events: eventsLog,
    loading: loading || isPending,
    isPending,
    isSuccess,

    refresh: fetchData,
  };
}
