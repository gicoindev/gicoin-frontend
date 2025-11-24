"use client";

import { useAirdrop } from "@/context/airdropcontext";
import { useEffect, useRef } from "react";

export default function LogsPanel() {
  const { logs, address, isConnected } = useAirdrop();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 🧹 Auto scroll ke atas saat log baru masuk
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  return (
    <div
      ref={containerRef}
      className="bg-neutral-900 p-4 rounded-2xl shadow space-y-3 max-h-72 overflow-y-auto transition-all duration-300"
    >
      <h2 className="font-semibold text-lg">📝 Event Logs</h2>

      {!isConnected ? (
        <p className="text-gray-500 text-sm italic">Connect your wallet to see logs.</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-400 text-sm">No events yet...</p>
      ) : (
        <ul className="space-y-2 text-xs font-mono">
          {logs.map((log, i) => (
            <li
              key={`${log.txHash}-${i}`}
              className="border-b border-neutral-800 pb-1 text-gray-300"
            >
              <span className="text-blue-400 font-semibold">
                [{log.eventName}]
              </span>{" "}
              {log.eventName === "AirdropRegistered" && (
                <span>User: {log.user}</span>
              )}
              {log.eventName === "AirdropClaimed" && (
                <span>
                  User: {log.user} | Amount: {log.amount} | Root:{" "}
                  {log.merkleRoot ?? "N/A"}
                </span>
              )}
              {log.eventName === "AirdropClaimFailed" && (
                <span>
                  User: {log.user} | Amount: {log.amount} | Reason:{" "}
                  {log.failureReason ?? "Unknown"}
                </span>
              )}
              <span className="ml-2 text-gray-500">
                (tx: {log.txHash.slice(0, 10)}…)
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 🔄 Address info */}
      {isConnected && (
        <div className="pt-2 border-t border-neutral-800 text-[11px] text-gray-500 truncate">
          Current wallet: {address}
        </div>
      )}
    </div>
  );
}
