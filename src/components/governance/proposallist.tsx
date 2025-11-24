// "use client"

import { useGovernanceContext } from "@/context/governancecontext";
import { Proposal } from "@/hooks/useGovernance";
import RefreshProposalsButton from "./RefreshProposalsButton";
import StatusBadge from "./statusbadge";

function getStatus(p: Proposal) {
  if (p.executed) return "Executed";
  if (p.votingClosed) {
    return p.quorumReached ? "Pending Execution" : "Voting Closed";
  }
  if (Date.now() > p.endTime) {
    return p.quorumReached ? "Pending Execution" : "Voting Closed";
  }
  return "Active";
}

export default function ProposalList() {
  const { proposals, loading, selectProposal, selectedProposal } = useGovernanceContext();

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 space-y-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">📑 Proposals</h3>
          <RefreshProposalsButton />
        </div>
        <p className="text-sm text-gray-400">⏳ Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 space-y-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">📑 Proposals</h3>
        <RefreshProposalsButton />
      </div>

      {proposals.length === 0 ? (
        <p className="text-sm text-gray-400">No proposals yet</p>
      ) : (
        <div className="space-y-3">
          {proposals.map((p: Proposal) => {
            const status = getStatus(p);
            const isSelected = selectedProposal?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectProposal(p.id)}
                className={`w-full text-left p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition
                  ${isSelected
                    ? "border-2 border-yellow-400 bg-gray-800"
                    : "bg-gray-800 hover:bg-gray-700"
                  }
                `}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">ID: {p.id}</p>
                  <p className="text-sm text-gray-300 truncate">{p.description}</p>
                  <p className="text-xs text-gray-500">
                    ⏳ Ends: {new Date(p.endTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={status} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
