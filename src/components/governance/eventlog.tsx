"use client"

import { useGovernanceContext } from "@/context/governancecontext"

export default function EventLog() {
  const { events, selectedProposal } = useGovernanceContext()

  const filteredEvents = selectedProposal
    ? events.filter((e) => {
        const args = e.detail?.args
        const pid = args?.proposalId
        return pid !== undefined && Number(pid) === selectedProposal.id
      })
    : events

  const shortAddr = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "unknown"

  const formatTime = (t?: string | number) => {
    if (!t) return ""
    try {
      const d = new Date(Number(t))
      return d.toLocaleString("en-GB", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return ""
    }
  }

  const renderEvent = (e: any, i: number) => {
    const args = e.detail?.args
    const time = e.blockTimestamp
      ? formatTime(Number(e.blockTimestamp) * 1000)
      : formatTime(e.time)

    switch (e.type) {
      case "ProposalCreated":
        return (
        <li key={i} className="text-blue-300">
          📝 <b>ProposalCreated</b> — ID: {args?.id?.toString()} | "
          {args?.description}"
          <span className="text-gray-500 text-xs">({time})</span>
        </li>

        )

      case "Voted":
        return (
          <li key={i} className="text-green-300">
            🗳️ {shortAddr(args?.voter)} voted{" "}
            {args?.support ? "✅ YES" : "❌ NO"} on Proposal{" "}
            {args?.proposalId?.toString()}{" "}
            <span className="text-gray-500 text-xs">({time})</span>
          </li>
        )

      case "VotingClosed":
        return (
          <li key={i} className="text-yellow-300">
            🔒 VotingClosed — Proposal {args?.proposalId?.toString()} | Quorum{" "}
            {args?.quorumReached ? "✅ Reached" : "❌ Not Reached"}{" "}
            <span className="text-gray-500 text-xs">({time})</span>
          </li>
        )

      case "ProposalExecuted":
        return (
          <li key={i} className="text-purple-300">
            🚀 ProposalExecuted — Proposal {args?.proposalId?.toString()} |{" "}
            {args?.approved ? "APPROVED ✅" : "REJECTED ❌"} | YES{" "}
            {args?.votesFor?.toString()} / NO{" "}
            {args?.votesAgainst?.toString()}{" "}
            <span className="text-gray-500 text-xs">({time})</span>
          </li>
        )

      default:
        return (
          <li key={i} className="text-gray-400">
            {e.type}: {JSON.stringify(args ?? e.detail)}{" "}
            <span className="text-gray-500 text-xs">({time})</span>
          </li>
        )
    }
  }

  return (
    <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        📜 Event Log{" "}
        <span className="text-xs text-gray-500">
          ({filteredEvents.length} events)
        </span>
      </h3>

      {filteredEvents.length === 0 ? (
        <p className="text-sm text-gray-400">No events yet</p>
      ) : (
        <ul
          className="space-y-1 max-h-48 overflow-y-auto pr-2 text-sm"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#555 #222",
          }}
        >
          {filteredEvents.map((e, i) => renderEvent(e, i))}
        </ul>
      )}
    </div>
  )
}
