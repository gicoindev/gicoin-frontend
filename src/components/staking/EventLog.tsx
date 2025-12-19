"use client";

import { Button } from "@/components/ui/button";
import { getExplorerUrl } from "@/lib/explorer";
import { useEffect, useRef, useState } from "react";
import { useChainId } from "wagmi";

interface EventLogItem {
  type: string;
  blockNumber?: bigint;
  blockTimestamp?: number;
  txHash?: string;
  args?: Record<string, any>;
  time?: string;
}

interface EventLogProps {
  events: EventLogItem[];
  onRefresh?: () => void;
}

/**
 * ✅ EventLog Component
 */
export default function EventLog({ events, onRefresh }: EventLogProps) {
  const chainId = useChainId();
  const [filter, setFilter] = useState("all");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [events]);

  // Filter event
  const filtered =
    filter === "all"
      ? events
      : events.filter((e) =>
          e.type?.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <div className="border-t border-gray-700 pt-6 text-sm">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="text-gray-300 font-semibold flex items-center gap-2">
          📜 Realtime Event Logs
        </p>
        <div className="flex items-center gap-3">
          <select
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1"
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
          >
            <option value="all">All Events</option>
            <option value="staked">Staked</option>
            <option value="unstaked">Unstaked</option>
            <option value="RewardClaimed">Reward Claimed</option>
            <option value="RewardCalculated">Reward Calculated</option>
          </select>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-gray-600 hover:bg-gray-800"
            >
              🔄 Refresh
            </Button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[450px] overflow-y-auto space-y-3 pr-2 custom-scrollbar"
      >
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400">
            Belum ada event yang tercatat.
          </p>
        ) : (
          filtered.map((ev, i) => (
            <div
              key={i}
              className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 hover:bg-gray-800 transition"
            >
              <p className="text-blue-400 font-semibold">{ev.type}</p>
              <p className="text-gray-400 text-xs">
                Block #{String(ev.blockNumber)} —{" "}
                {ev.blockTimestamp
                  ? new Date(ev.blockTimestamp * 1000).toLocaleString()
                  : "pending..."}
              </p>

              {ev.txHash && (
                <p className="break-all text-gray-300 text-xs mt-1">
                  Tx:{" "}
                  {getExplorerUrl(ev.txHash, chainId) ? (
                    <a
                      href={getExplorerUrl(ev.txHash, chainId)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400"
                    >
                      {ev.txHash}
                    </a>
                  ) : (
                    <span className="text-gray-500">{ev.txHash} (no explorer)</span>
                  )}
                </p>
              )}

              {ev.args && (
                <pre className="bg-black/40 rounded p-2 text-xs mt-2 overflow-x-auto">
                  {JSON.stringify(
                    ev.args,
                    (key, value) =>
                      typeof value === "bigint" ? value.toString() : value,
                    2
                  )}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
