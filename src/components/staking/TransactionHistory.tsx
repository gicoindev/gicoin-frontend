"use client";

import { getExplorerUrl } from "@/lib/explorer";
import { useChainId } from "wagmi";

interface Props {
  events: any[];
}

export default function TransactionHistory({ events }: Props) {
  const chainId = useChainId();
  const history = events.slice(-10).reverse(); // ambil 10 event terakhir

  return (
    <div className="border-t border-gray-700 pt-6 text-sm">
      <h2 className="text-gray-300 font-semibold mb-4">🧾 Transaction History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center">Belum ada transaksi.</p>
      ) : (
        <div className="space-y-3">
          {history.map((ev, i) => (
            <div
              key={i}
              className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 hover:bg-gray-800 transition"
            >
              <p className="text-blue-400 font-semibold">{ev.type}</p>

              <p className="text-gray-400 text-xs">
                Block #{String(ev.blockNumber)} —{" "}
                {ev.blockTimestamp
                  ? new Date(ev.blockTimestamp * 1000).toLocaleString()
                  : "pending"}
              </p>

              {ev.txHash && (
                <p className="break-all text-gray-300 text-xs mt-1">
                  Tx:{" "}
                  <a
                    href={getExplorerUrl(ev.txHash, chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400"
                  >
                    {ev.txHash}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
