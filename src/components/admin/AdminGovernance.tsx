"use client";

import { useAdminGovernance } from "@/hooks/useAdminGovernance";
import { useState } from "react";

export default function AdminGovernance() {
  const { setQuorumPercentage, setProposalTimes, loading, error } = useAdminGovernance();

  // quorum
  const [percent, setPercent] = useState("");

  // proposal times
  const [proposalId, setProposalId] = useState("");
  const [startIso, setStartIso] = useState("");
  const [endIso, setEndIso] = useState("");

  // alternatif: duration (detik)
  const [votingDurationSeconds, setVotingDurationSeconds] = useState("");

  const handleSetQuorum = async () => {
    if (!percent) return;
    await setQuorumPercentage(Number(percent));
    setPercent("");
  };

  // Handler: use datetime-local inputs
  const handleTimesWithDates = async () => {
    if (!proposalId) return;
    const start = startIso ? Math.floor(new Date(startIso).getTime() / 1000) : Math.floor(Date.now() / 1000);
    const end = endIso ? Math.floor(new Date(endIso).getTime() / 1000) : start + 7 * 24 * 3600;
    await setProposalTimes(Number(proposalId), start, end);
    setProposalId("");
    setStartIso("");
    setEndIso("");
  };

  const handleTimesWithDuration = async () => {
    if (!proposalId || !votingDurationSeconds) return;
    const start = Math.floor(Date.now() / 1000);
    const end = start + Number(votingDurationSeconds);
    await setProposalTimes(Number(proposalId), start, end);
    setProposalId("");
    setVotingDurationSeconds("");
  };

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded">
      <h3 className="text-lg font-bold">Admin — Governance</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div>
          <label className="block text-xs text-gray-300">Quorum %</label>
          <input
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="e.g. 50"
            className="mt-1 px-2 py-1 rounded bg-gray-800 text-white"
          />
        </div>
        <div>
          <button
            className="px-3 py-1 bg-yellow-500 rounded"
            onClick={handleSetQuorum}
            disabled={loading}
          >
            Set Quorum
          </button>
        </div>
      </div>

      <hr className="border-gray-800" />

      <div className="space-y-2">
        <label className="block text-xs text-gray-300">Set Proposal Times (by date)</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <input
            placeholder="Proposal ID"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white"
            type="number"
          />
          <div>
            <label className="text-xs text-gray-400">Start</label>
            <input
              type="datetime-local"
              value={startIso}
              onChange={(e) => setStartIso(e.target.value)}
              className="px-2 py-1 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">End</label>
            <input
              type="datetime-local"
              value={endIso}
              onChange={(e) => setEndIso(e.target.value)}
              className="px-2 py-1 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <button
              className="px-3 py-1 bg-purple-600 rounded"
              onClick={handleTimesWithDates}
              disabled={loading}
            >
              Set Times
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-gray-300">Or set by duration (seconds)</label>
        <div className="flex gap-2">
          <input
            placeholder="voting duration (sec)"
            value={votingDurationSeconds}
            onChange={(e) => setVotingDurationSeconds(e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white"
            type="number"
          />
          <button
            className="px-3 py-1 bg-indigo-600 rounded"
            onClick={handleTimesWithDuration}
            disabled={loading}
          >
            Set Times (duration)
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">Error: {error}</p>}
    </div>
  );
}
