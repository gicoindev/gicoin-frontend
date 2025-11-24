"use client"

import { useGovernanceContext } from "@/context/governancecontext"
import { useGovernanceStats } from "@/hooks/useGovernanceStats"
import StatusBadge from "./statusbadge"
import VoteProgress from "./voteprogress"

export default function ProposalDetail() {
  const { selectedProposal: p, vote, closeVoting, executeProposal, loading } = useGovernanceContext()
  const { votingPower, quorumPercentage } = useGovernanceStats(p?.id)

  if (!p) {
    return (
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-gray-400">
        No proposal selected
      </div>
    )
  }

  /** -----------------------------
   *  OPTIONAL IMPROVED STATUS LOGIC
   *  ----------------------------- */
  const status =
    p.executed
      ? "Executed"
      : (p.votingClosed || Date.now() > p.endTime)
        ? (p.quorumReached ? "Pending Execution" : "Voting Closed")
        : "Active"

  return (
    <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="text-lg font-bold">📝 {p.description}</h2>
        <StatusBadge status={status} />
      </div>

      {/* Waktu */}
      <div className="text-sm space-y-1">
        <p>📅 Start: {new Date(p.startTime).toLocaleString()}</p>
        <p>⏳ End: {new Date(p.endTime).toLocaleString()}</p>
        <p>
          🗳️ Quorum:{" "}
          {p.quorumReached ? (
            <span className="text-green-400">Reached ✅</span>
          ) : (
            <span className="text-red-400">Not Reached ❌</span>
          )}
        </p>
      </div>

      {/* Governance Stats */}
      <div className="text-sm space-y-1">
        <p>
          📊 Your Voting Power:{" "}
          <span className="text-yellow-400 font-semibold">{votingPower}</span>
        </p>
        <p>⚖️ Quorum Target: {quorumPercentage}%</p>
      </div>

      {/* Progress Bar */}
      <VoteProgress
        votesFor={p.votesFor}
        votesAgainst={p.votesAgainst}
        quorumPercent={quorumPercentage}
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!p.votingClosed && !p.executed && (
          <>
            <button
              disabled={loading}
              className="px-4 py-2 bg-green-600 rounded-lg font-medium disabled:opacity-50"
              onClick={() => vote(p.id, true)}
            >
              ✅ Vote YES
            </button>
            <button
              disabled={loading}
              className="px-4 py-2 bg-red-600 rounded-lg font-medium disabled:opacity-50"
              onClick={() => vote(p.id, false)}
            >
              ❌ Vote NO
            </button>
            {Date.now() > p.endTime && (
              <button
                disabled={loading}
                className="px-4 py-2 bg-purple-600 rounded-lg font-medium disabled:opacity-50"
                onClick={() => closeVoting(p.id)}
              >
                🔒 Close Voting
              </button>
            )}
          </>
        )}

        {p.votingClosed && !p.executed && p.quorumReached && (
          <button
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold disabled:opacity-50"
            onClick={() => executeProposal(p.id)}
          >
            🚀 Execute Proposal
          </button>
        )}

        {p.executed && (
          <span className="text-sm text-purple-400 font-medium">✅ Proposal Executed</span>
        )}
      </div>
    </div>
  )
}
