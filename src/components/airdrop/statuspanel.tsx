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
  const colors: Record<string, string> = {
    green: "bg-green-900 text-green-300 border border-green-700",
    yellow: "bg-yellow-900 text-yellow-300 border border-yellow-700",
    blue: "bg-blue-900 text-blue-300 border border-blue-700",
    red: "bg-red-900 text-red-300 border border-red-700",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
        active ? colors[color] : "bg-neutral-800 text-neutral-400"
      }`}
    >
      {active ? `✔ ${trueText}` : `✖ ${falseText}`}
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
    <div className="p-5 rounded-2xl bg-neutral-900 shadow-lg border border-neutral-800 space-y-4">
      <h2 className="text-lg font-bold">📊 Airdrop Status</h2>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading status...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : !address ? (
        <p className="text-sm text-gray-400">Connect wallet to view status</p>
      ) : (
        <>
          {/* Address */}
          <div className="flex justify-between items-center text-xs break-all">
            <span className="text-neutral-400">Address</span>
            <span className="font-mono text-neutral-300 select-text">
              {address}
            </span>
          </div>

          {/* Eligibility */}
          <div className="flex justify-between text-sm">
            <span>Eligible for Airdrop</span>
            <StatusBadge
              active={eligible}
              trueText="Eligible"
              falseText="Not eligible"
              color="green"
            />
          </div>

          {/* Registered */}
          <div className="flex justify-between text-sm">
            <span>Registered</span>
            <StatusBadge
              active={isRegistered}
              trueText="Yes"
              falseText="No"
              color="yellow"
            />
          </div>

          {/* Whitelisted */}
          <div className="flex justify-between text-sm">
            <span>Whitelisted</span>
            <StatusBadge
              active={isWhitelisted}
              trueText="Yes"
              falseText="No"
              color="blue"
            />
          </div>

          {/* Claimed */}
          <div className="flex justify-between text-sm">
            <span>Already Claimed</span>
            <StatusBadge
              active={claimed}
              trueText="Yes"
              falseText="No"
              color="red"
            />
          </div>

          {/* Amount */}
          <div className="flex justify-between text-sm">
            <span>Claimable Amount</span>
            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-green-900 text-green-300 border border-green-700">
              {String(amount).replace(/\.0$/, "")} GIC
            </span>
          </div>

          {/* Pool Balance */}
          <div className="flex justify-between text-sm">
            <span>Reward Pool Balance</span>
            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-900 text-blue-300 border border-blue-700">
              {poolBalance.toLocaleString()} GIC
            </span>
          </div>

          {/* Proof */}
          {eligible && proof.length > 0 && (
            <details className="mt-3 bg-neutral-800 rounded-xl p-3 text-xs border border-neutral-700">
              <summary className="cursor-pointer text-neutral-300">
                Merkle Proof ({proof.length})
              </summary>
              <div className="mt-2 space-y-1 font-mono break-all">
                {proof.map((p, i) => (
                  <div key={i} className="text-neutral-400">
                    {p}
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
