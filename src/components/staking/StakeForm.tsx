"use client";
import { useEffect } from "react";

interface Props {
  amount: string;
  setAmount: (v: string) => void;
  balance: string;
  lockUntil: number | null;
  canUnstake: boolean;
  countdown: string;
  loading?: boolean;
  minStake: string;
}

export default function StakeForm({
  amount,
  setAmount,
  balance,
  lockUntil,
  canUnstake,
  countdown,
  loading = false,
  minStake,
}: Props) {
  const isBelowMin = Number(amount) < Number(minStake) && amount !== "";

  useEffect(() => {
  }, [minStake]);

  return (
    <div className="rounded-2xl bg-gray-900 shadow-md border border-yellow-500/20 p-5 mb-6 transition-all hover:shadow-yellow-500/10">
      <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
        <span>
          💰 Balance:{" "}
          <span className="text-yellow-400 font-semibold">{balance}</span> GIC
        </span>
        <span className="text-gray-500 italic">
          Min. stake {minStake} GIC
        </span>
      </div>

      <input
        type="number"
        min="0"
        placeholder="Amount to Stake (contoh: 10)"
        value={amount}
        disabled={loading}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || Number(val) >= 0) setAmount(val);
        }}
        className={`w-full rounded-lg p-3 bg-gray-800 text-white placeholder-gray-500 
          focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      />

      {isBelowMin && (
        <p className="text-xs text-red-400 mt-2">
          ⚠️ Jumlah stake minimal adalah {minStake} GIC
        </p>
      )}

      {lockUntil && !canUnstake && (
        <p className="text-sm text-center text-gray-400 mt-3">
          ⏳ Unstake available in:{" "}
          <span className="text-yellow-400 font-medium">{countdown}</span>
        </p>
      )}
    </div>
  );
}
