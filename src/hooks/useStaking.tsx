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

// ============================================================
//  🔧 SAFE BLOCK RANGE FOR PUBLIC RPC
// ============================================================
async function safeRange(client: any) {
  const latest = await client.getBlockNumber();
  const RANGE = 50000n;
  return {
    fromBlock: latest > RANGE ? latest - RANGE : 0n,
    toBlock: latest,
  };
}

// ============================================================
// ⭐  useStaking — FINAL VERSION
// ============================================================
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

  const [eventsLog, setEventsLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const lastHash = useRef<string | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // 📊 READ CONTRACT DATA
  // ============================================================
  const { data: totalStaked } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "totalStaked",
  });

  const { data: rewardPool } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "rewardPool",
  });

  const { data: rewardRate } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "rewardRate",
  });

  // ============================================================
  // 🔄 FETCH DATA
  // ============================================================
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

  // ============================================================
  // ✍️ WRITE: STAKE
  // ============================================================
  async function stake(amount: string | bigint): Promise<Hash> {
    if (!address) throw new Error("Wallet belum terhubung");
    setLoading(true);

    try {
      const value =
        typeof amount === "string" ? parseEther(amount) : amount;

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
          >
            Lihat TX
          </a>
        </span>
      );

      await publicClient.waitForTransactionReceipt({ hash });
      setTimeout(fetchData, 1500);

      return hash;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ✍️ WRITE: UNSTAKE
  // ============================================================
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
          >
            Lihat TX
          </a>
        </span>
      );

      await publicClient.waitForTransactionReceipt({ hash });
      setTimeout(fetchData, 1500);

      return hash;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ✍️ WRITE: CLAIM REWARD (ABI-CORRECT)
  // ============================================================
  async function claimReward(): Promise<Hash> {
    setLoading(true);

    try {
      if (!address) throw new Error("Wallet belum terhubung");

      // Read reward data
      const [rewardRaw, claimedRaw] = await Promise.all([
        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "calculateReward",
          args: [address],
        }) as Promise<bigint>,

        publicClient.readContract({
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "stakingReward",
          args: [address],
        }) as Promise<bigint>,
      ]);

      const remaining =
        rewardRaw > claimedRaw ? rewardRaw - claimedRaw : 0n;

      if (remaining === 0n) {
        throw new Error("Tidak ada reward yang bisa di-claim.");
      }

      const hash = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: "claimReward",
        args: [remaining],
      });

      toast.success(
        <span>
          🎉 Reward berhasil di-claim!{" "}
          <a
            href={getExplorerUrl(hash, publicClient.chain?.id) || "#"}
            target="_blank"
            className="underline text-blue-400"
          >
            Lihat TX
          </a>
        </span>
      );

      await publicClient.waitForTransactionReceipt({ hash });
      setTimeout(fetchData, 1500);

      return hash;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 🛰️ EVENT HANDLER
  // ============================================================
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
            const block = await client.getBlock({
              blockNumber: l.blockNumber,
            });
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

    if (!skipRefresh) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(fetchData, 1500);
    }
  };

  // ============================================================
  // 🔎 LIVE EVENTS WATCHER
  // ============================================================
  useEffect(() => {
    if (!address || !gicoin?.address) return;

    const eventNames = ["Staked", "Unstaked", "RewardClaimed"];

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
                const userArg =
                  log.args?.user ||
                  log.args?.staker ||
                  log.args?.account ||
                  log.args?.[0] ||
                  null;

                return (
                  typeof userArg === "string" &&
                  userArg.toLowerCase() === address.toLowerCase()
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
      } catch {
        reconnectTimer = setTimeout(setupWatcher, 5000);
      }
    };

    setupWatcher();

    return () => {
      unsubscribers.forEach((u) => u());
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [address, gicoin.address, publicClient]);

  // ============================================================
  // 🕑 LOAD PAST EVENTS
  // ============================================================
  useEffect(() => {
    const loadPast = async () => {
      if (!address) return;

      const range = await safeRange(publicClient);

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
            fromBlock: range.fromBlock,
            toBlock: range.toBlock,
          });

          if (logs.length > 0) handleEventLogs(name, logs, true);
        } catch (err) {
          console.error(`❌ Error fetching ${name}:`, err);
        }
      }
    };

    loadPast();
  }, [address]);

  // ============================================================
  // ⏳ INITIAL FETCH
  // ============================================================
  useEffect(() => {
    if (address) fetchData();
  }, [address]);

  // ============================================================
  // 📦 RETURN
  // ============================================================
  return {
    balance,
    staked,
    reward,
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
