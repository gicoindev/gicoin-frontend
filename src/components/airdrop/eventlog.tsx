"use client";
import { useGovernanceContext } from "@/context/governancecontext";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export default function EventLog({ address }: { address?: string }) {
  const { events, selectedProposal } = useGovernanceContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const { address: activeAddress } = useAccount();
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events.length, address, activeAddress]);

  const filteredEvents = selectedProposal
    ? events.filter((e) => {
        const args = e.detail?.args
        const pid = args?.proposalId ?? args?.id
        return pid !== undefined && Number(pid) === selectedProposal.id
      })
    : events

  // format timer
  const formatTime = (t?: string) => {
    if (!t) return ""
    const d = new Date(t)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const renderEvent = (e: any, i: number) => {
    const args = e.detail?.args
    const time = formatTime(e.time)

    switch (e.type) {
      case "ProposalCreated":
        return (
          <li key={i} className="text-blue-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            📝 ProposalCreated — #{args?.proposalId?.toString() || args?.id?.toString()} — "
            {args?.description}"
          </li>
        )

      case "Voted":
        return (
          <li key={i} className="text-green-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            🗳️ {args?.voter} voted {args?.support ? "✅ YES" : "❌ NO"} (Proposal{" "}
            {args?.proposalId?.toString()})
          </li>
        )

      case "VotingClosed":
        return (
          <li key={i} className="text-yellow-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            🔒 VotingClosed — Proposal {args?.proposalId?.toString()} | Quorum{" "}
            {args?.quorumReached ? "✅ Reached" : "❌ Not Reached"}
          </li>
        )

      case "ProposalExecuted":
        return (
          <li key={i} className="text-purple-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            🚀 ProposalExecuted — Proposal {args?.proposalId?.toString()} |{" "}
            {args?.approved ? "APPROVED ✅" : "REJECTED ❌"} | YES {args?.votesFor?.toString()} / NO{" "}
            {args?.votesAgainst?.toString()}
          </li>
        )

      case "Staked":
        return (
          <li key={i} className="text-cyan-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            💎 {args?.user} staked {args?.amount?.toString()} GIC
          </li>
        )

      case "Unstaked":
        return (
          <li key={i} className="text-cyan-400">
            <span className="text-gray-500 mr-2">[{time}]</span>
            💎 {args?.user} unstaked {args?.amount?.toString()} GIC (reward {args?.reward?.toString()})
          </li>
        )

      case "RewardClaimed":
        return (
          <li key={i} className="text-amber-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            💰 RewardClaimed — {args?.user} claimed {args?.amount?.toString()} GIC
          </li>
        )

      case "AirdropClaimed":
        return (
          <li key={i} className="text-pink-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            🎁 AirdropClaimed — {args?.user} got {args?.amount?.toString()} GIC
          </li>
        )

      case "TaxRateChanged":
        return (
          <li key={i} className="text-red-300">
            <span className="text-gray-500 mr-2">[{time}]</span>
            🧾 Tax changed from {args?.oldRate?.toString()}% → {args?.newRate?.toString()}%
          </li>
        )

      default:
        return (
          <li key={i} className="text-gray-400">
            <span className="text-gray-500 mr-2">[{time}]</span>
            {e.type}: {JSON.stringify(args ?? e.detail)}
          </li>
        )
    }
  }

  // Grouping event categories
  const grouped = {
    governance: filteredEvents.filter((e) =>
      ["ProposalCreated", "Voted", "VotingClosed", "ProposalExecuted"].includes(e.type)
    ),
    staking: filteredEvents.filter((e) => ["Staked", "Unstaked"].includes(e.type)),
    reward: filteredEvents.filter((e) => ["RewardClaimed"].includes(e.type)),
    airdrop: filteredEvents.filter((e) => ["AirdropClaimed"].includes(e.type)),
    tax: filteredEvents.filter((e) => ["TaxRateChanged"].includes(e.type)),
  }

  const renderGroup = (title: string, items: any[]) =>
    items.length > 0 && (
      <div className="mb-3">
        <h4 className="text-sm font-semibold mb-1 text-gray-300">{title}</h4>
        <ul className="space-y-1 ml-2">{items.map((e, i) => renderEvent(e, i))}</ul>
      </div>
    )

  return (
    <div className="p-4 rounded-xl bg-gray-900 border border-gray-700">
      <h3 className="font-semibold mb-3">📜 Event Log</h3>

      {filteredEvents.length === 0 ? (
        <p className="text-sm text-gray-400">No events yet</p>
      ) : (
        <div
          ref={containerRef}
          className="max-h-64 overflow-y-auto pr-2 text-sm space-y-3 scroll-smooth font-mono"
        >
          {renderGroup("🧭 Governance", grouped.governance)}
          {renderGroup("💎 Staking", grouped.staking)}
          {renderGroup("💰 Rewards", grouped.reward)}
          {renderGroup("🎁 Airdrop", grouped.airdrop)}
          {renderGroup("🧾 Tax & System", grouped.tax)}
        </div>
      )}
    </div>
  )
}
