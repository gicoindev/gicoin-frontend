"use client";

import { HistoryItem } from "@/hooks/useStakingHistory";
import { getExplorerUrl } from "@/lib/explorer";
import { ArrowDownCircle, ArrowUpCircle, Gift, Loader2 } from "lucide-react";
import { useChainId } from "wagmi";

interface Props {
  history: HistoryItem[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export default function StakingHistory({ history, loading, hasMore, loadMore }: Props) {
  const chainId = useChainId();

  return (
    <div className="w-full mx-auto bg-gray-800 p-4 rounded-xl shadow-md border border-yellow-500/10">
      <h2 className="text-lg font-semibold mb-3">Transaction History</h2>

      {loading ? (
        <div className="flex justify-center items-center text-gray-400 py-8">
          <Loader2 className="animate-spin mr-2" /> Loading history...
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-500 text-center italic py-4">
          Belum ada transaksi staking
        </p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">Tx Hash</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
            {history.map((tx, i) => {
                const url = getExplorerUrl(tx.tx, chainId);

                return (
                  <tr key={i} className="border-t border-gray-700 hover:bg-gray-700/20 transition">
                    <td className="p-2 truncate">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:underline"
                        >
                          {tx.tx.slice(0, 6)}...{tx.tx.slice(-4)}
                        </a>
                      ) : (
                        <span className="text-gray-500">
                          {tx.tx.slice(0, 6)}...{tx.tx.slice(-4)} (no explorer)
                        </span>
                      )}
                    </td>

                    <td className="p-2 flex items-center gap-2">
                      {tx.action === "Stake" && (
                        <>
                          <ArrowUpCircle size={16} className="text-green-400" />
                          <span className="text-green-400 font-semibold">Stake</span>
                        </>
                      )}
                      {tx.action === "Unstake" && (
                        <>
                          <ArrowDownCircle size={16} className="text-red-400" />
                          <span className="text-red-400 font-semibold">Unstake</span>
                        </>
                      )}
                      {tx.action === "Claim" && (
                        <>
                          <Gift size={16} className="text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">Claim</span>
                        </>
                      )}
                    </td>

                    <td className="p-2">{tx.amount} GIC</td>
                    <td className="p-2">{tx.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && hasMore && (
            <div className="text-center mt-4">
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
              >
                Load Older Transactions
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
