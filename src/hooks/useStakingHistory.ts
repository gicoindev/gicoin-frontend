// src/hooks/useStakingHistory.ts
import { useContracts } from "@/config/contracts";
import { useCallback, useEffect, useState } from "react";
import { decodeEventLog, parseAbiItem, type Address, type Log } from "viem";
import { useAccount, usePublicClient } from "wagmi";

export interface HistoryItem {
  tx: string;
  action: "Stake" | "Unstake" | "Claim";
  amount: string;
  date: string;
}

export function useStakingHistory() {
  const { gicoin } = useContracts();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endBlock, setEndBlock] = useState<bigint | null>(null); // blok terakhir yang sudah diambil

  const CHUNK_SIZE = 5000n; // ambil 5.000 blok per halaman
  // inside useStakingHistory()

  // Dedupe: remove duplicates based on tx + action
  const dedupeHistory = (items: HistoryItem[]) => {
    const map = new Map<string, HistoryItem>();

    for (const it of items) {
      const key = `${it.tx}-${it.action}`;
      if (!map.has(key)) {
        map.set(key, it);
      }
    }

    return Array.from(map.values());
  };

  const fetchHistory = useCallback(
    async (isLoadMore = false) => {
      if (!address || !publicClient || loading) return;

      setLoading(true);
      try {
        const latestBlock = await publicClient.getBlockNumber();

        // hitung toBlock / fromBlock dengan benar bergantung apakah loadMore
        const nextToBlock = isLoadMore
          ? endBlock && endBlock > 0n
            ? endBlock
            : latestBlock
          : latestBlock;

        const nextFromBlock = nextToBlock > CHUNK_SIZE ? nextToBlock - CHUNK_SIZE : 0n;

        // jika kita sudah pada block 0 dan isLoadMore, stop
        if (isLoadMore && nextToBlock === 0n) {
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
            abi: parseAbiItem("event Unstaked(address indexed user, uint256 amount, uint256 reward)"),
          },
          {
            action: "Claim" as const,
            abi: parseAbiItem("event RewardClaimed(address indexed user, uint256 amount)"),
          },
        ];

        let batch: HistoryItem[] = [];

        for (const e of events) {
          try {
            const logs = await Promise.race([
              publicClient.getLogs({
                address: gicoin.address as Address,
                event: e.abi,
                fromBlock: nextFromBlock,
                toBlock: nextToBlock,
              }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("RPC Timeout")), 20000)
              ),
            ]);

            // decode each log and fetch block timestamp in parallel
            const parsed = await Promise.all(
              logs.map(async (log: Log) => {
                try {
                  const decoded = decodeEventLog({
                    abi: [e.abi],
                    data: log.data,
                    topics: log.topics,
                  });

                  const user = (decoded.args as any)?.user?.toLowerCase?.();
                  if (!user || user !== address?.toLowerCase()) return null;

                  const amount = (decoded.args as any)?.amount as bigint;

                  // get block timestamp for accurate date
                  let timestamp = Date.now();
                  try {
                    if (log.blockNumber != null) {
                      const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                      timestamp = Number(block.timestamp) * 1000;
                    }
                  } catch (err) {
                    console.warn("⚠️ getBlock timestamp failed for history log:", err);
                  }

                  return {
                    tx: log.transactionHash ?? "",
                    action: e.action,
                    amount: (Number(amount) / 1e18).toFixed(2),
                    date: new Date(timestamp).toLocaleString(),
                  } as HistoryItem;
                } catch {
                  return null;
                }
              })
            );

            batch = [...batch, ...parsed.filter(Boolean) as HistoryItem[]];
          } catch (err) {
            console.warn(`⚠️ Gagal ambil log ${e.action}`, err);
          }
        }

        // jika tidak ada konten tambahan pada loadMore => tidak ada lebih lanjut
        if (batch.length === 0 && isLoadMore) {
          setHasMore(false);
          return;
        }

        // sort by date descending (newest first)
        const sortDesc = (arr: HistoryItem[]) =>
          arr.sort((a, b) => (a.date < b.date ? 1 : -1));
          
          setHistory((prev) => {
            const merged = isLoadMore ? [...prev, ...batch] : batch;
            return sortDesc(dedupeHistory(merged));
          });
          

        // set endBlock untuk next pagination: nextFromBlock - 1
        if (nextFromBlock > 0n) {
          setEndBlock(nextFromBlock - 1n);
        } else {
          // sudah mencapai genesis
          setEndBlock(0n);
          setHasMore(false);
        }
      } catch (err) {
        console.error("❌ Gagal ambil history:", err);
      } finally {
        setLoading(false);
      }
    },
    [address, publicClient, gicoin, endBlock, loading]
  );

  // 🔁 Ambil data pertama kali
  useEffect(() => {
    fetchHistory(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchHistory]);

  return {
    history,
    loading,
    hasMore,
    refetch: () => fetchHistory(false),
    loadMore: () => fetchHistory(true),
  };
}
