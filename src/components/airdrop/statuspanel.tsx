"use client";

import { useAirdrop } from "@/context/airdropcontext";

function StatusBadge({
  active,
  trueText,
  falseText,
  color,
}: {
  active: boolean;
  trueText: string;
  falseText: string;
  color: "green" | "yellow" | "blue" | "red";
}) {
  const colorMap: Record<string, string> = {
    green: "bg-green-900 text-green-300",
    yellow: "bg-yellow-900 text-yellow-300",
    blue: "bg-blue-900 text-blue-300",
    red: "bg-red-900 text-red-300",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? colorMap[color] : "bg-neutral-800 text-neutral-400"
      }`}
    >
      {active ? `✅ ${trueText}` : `❌ ${falseText}`}
    </span>
  );
}

export default function StatusPanel() {
  const {
    address,
    claimed,
    eligible,
    amount,
    proof,
    poolBalance,
    loading,
    error,
    isRegistered,
    isWhitelisted,
  } = useAirdrop();

  return (
    <div className="p-4 rounded-2xl bg-neutral-900 shadow space-y-3">
      <h2 className="text-lg font-bold">📊 Airdrop Status</h2>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading status...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : !address ? (
        <p className="text-sm text-gray-400">Connect wallet to view status</p>
      ) : (
        <>
          {/* Wallet Address */}
          <div className="flex justify-between items-center text-xs break-all">
            <span className="text-neutral-400">Address</span>
            <span className="font-mono text-neutral-300">{address}</span>
          </div>

          {/* Eligible */}
          <div className="flex justify-between items-center text-sm">
            <span>Eligible for Airdrop</span>
            <StatusBadge
              active={eligible}
              trueText="Eligible"
              falseText="Not eligible"
              color="green"
            />
          </div>

          {/* Registered */}
          <div className="flex justify-between items-center text-sm">
            <span>Registered</span>
            <StatusBadge
              active={isRegistered}
              trueText="Yes"
              falseText="No"
              color="yellow"
            />
          </div>

          {/* Whitelisted */}
          <div className="flex justify-between items-center text-sm">
            <span>Whitelisted</span>
            <StatusBadge
              active={isWhitelisted}
              trueText="Yes"
              falseText="No"
              color="blue"
            />
          </div>

          {/* Claimed */}
          <div className="flex justify-between items-center text-sm">
            <span>Already Claimed</span>
            <StatusBadge
              active={claimed}
              trueText="Yes"
              falseText="No"
              color="red"
            />
          </div>

          {/* Claimable Amount */}
          <div className="flex justify-between items-center text-sm">
            <span>Claimable Amount</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900 text-green-300">
              {Number(amount).toLocaleString()} GIC
            </span>
          </div>

          {/* Pool Balance */}
          <div className="flex justify-between items-center text-sm">
            <span>Reward Pool Balance</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-900 text-blue-300">
              {poolBalance.toLocaleString()} GIC
            </span>
          </div>

          {/* Proof Debug */}
          {eligible && proof.length > 0 && (
            <details className="mt-2 bg-neutral-800 rounded p-2 text-xs text-neutral-400">
              <summary className="cursor-pointer text-neutral-300">
                Merkle Proof ({proof.length})
              </summary>
              <div className="mt-1 space-y-1 font-mono break-all">
                {proof.map((p, i) => (
                  <div key={i}>{p}</div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
