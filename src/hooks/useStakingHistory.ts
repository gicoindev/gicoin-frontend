// src/hooks/useStakingHistory.ts
import { useContracts } from "@/config/contracts";
import { useCallback, useEffect, useState } from "react";
import { decodeEventLog, parseAbiItem, type Address, type Log } from "viem";
import { useAccount, usePublicClient } from "wagmi";

export interface HistoryItem {
  tx: string;
  action: "Stake" | "Unstake" | "Claim";
  amount: string;
  reward?: string;
  date: string;
}

export function useStakingHistory() {
  const { gicoin } = useContracts();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endBlock, setEndBlock] = useState<bigint | null>(null);

  const CHUNK_SIZE = 5000n;

  const dedupeHistory = (items: HistoryItem[]) => {
    const map = new Map<string, HistoryItem>();
    for (const it of items) map.set(`${it.tx}-${it.action}`, it);
    return Array.from(map.values());
  };

  const fetchHistory = useCallback(
    async (isLoadMore = false) => {
      if (!address || !publicClient || loading) return;

      setLoading(true);

      try {
        const latestBlock = await publicClient.getBlockNumber();

        const toBlock = isLoadMore
          ? endBlock ?? latestBlock
          : latestBlock;

        const fromBlock =
          toBlock > CHUNK_SIZE ? toBlock - CHUNK_SIZE : 0n;

        if (isLoadMore && toBlock === 0n) {
          setHasMore(false);
          return;
        }

        const events = [
          {
            action: "Stake" as const,
            abi: parseAbiItem("event Staked(address indexed user, uint256 amount)"),
          },
          {
            action: "Unstake" as const,
            abi: parseAbiItem(
              "event Unstaked(address indexed user, uint256 amount, uint256 reward)"
            ),
          },
          {
            action: "Claim" as const,
            abi: parseAbiItem("event RewardClaimed(address indexed user, uint256 amount)"),
          },
        ];

        let batch: HistoryItem[] = [];

        for (const e of events) {
          let logs: Log[] = [];

          try {
            logs = await Promise.race([
              publicClient.getLogs({
                address: gicoin.address as Address,
                event: e.abi,
                fromBlock,
                toBlock,
              }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("RPC Timeout")), 16000)
              ),
            ]);
          } catch (err) {
            console.warn(`⚠️ Error fetching ${e.action} logs`, err);
            continue;
          }

          const parsed = await Promise.all(
            logs.map(async (log) => {
              try {
                const decoded = decodeEventLog({
                  abi: [e.abi],
                  data: log.data,
                  topics: log.topics,
                });

                const user = (decoded.args as any)?.user?.toLowerCase?.();
                if (!user || user !== address.toLowerCase()) return null;

                let amount = "0";
                let reward: string | undefined;

                if (e.action === "Unstake") {
                  amount = (Number((decoded.args as any).amount) / 1e18).toFixed(2);
                  reward = (Number((decoded.args as any).reward) / 1e18).toFixed(2);
                } else {
                  amount = (Number((decoded.args as any).amount) / 1e18).toFixed(2);
                }

                let timestamp = Date.now();
                try {
                  if (log.blockNumber != null) {
                    const block = await publicClient.getBlock({
                      blockNumber: log.blockNumber,
                    });
                    timestamp = Number(block.timestamp) * 1000;
                  }
                } catch {}

                return {
                  tx: log.transactionHash || "0x0",
                  action: e.action,
                  amount,
                  reward,
                  date: new Date(timestamp).toLocaleString(),
                } as HistoryItem;
              } catch {
                return null;
              }
            })
          );

          batch.push(...(parsed.filter(Boolean) as HistoryItem[]));
        }

        if (batch.length === 0 && isLoadMore) {
          setHasMore(false);
          return;
        }

        setHistory((prev) => {
          const merged = isLoadMore ? [...prev, ...batch] : batch;
          return dedupeHistory(
            merged.sort((a, b) => (a.date < b.date ? 1 : -1))
          );
        });

        if (fromBlock > 0n) {
          setEndBlock(fromBlock - 1n);
        } else {
          setEndBlock(0n);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [address, publicClient, gicoin, endBlock, loading]
  );

  useEffect(() => {
    if (address) fetchHistory(false);
  }, [address]);

  return {
    history,
    loading,
    hasMore,
    refetch: () => fetchHistory(false),
    loadMore: () => fetchHistory(true),
  };
}
