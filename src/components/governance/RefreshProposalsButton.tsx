"use client"

import { useGovernanceContext } from "@/context/governancecontext"
import { useState } from "react"
import toast from "react-hot-toast"

export default function RefreshProposalsButton() {
  const { reloadProposalCount, loading } = useGovernanceContext()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await reloadProposalCount()
      toast.success("✅ Proposals refreshed")
    } catch (err: any) {
      console.error("❌ Failed to refresh proposals:", err)
      toast.error(`Failed: ${err.message || "Something went wrong"}`)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading || refreshing}
      className="px-4 py-2 bg-blue-500 rounded-lg text-white font-medium hover:bg-blue-600 disabled:opacity-50"
    >
      {refreshing ? "⏳ Refreshing..." : "🔄 Refresh Proposals"}
    </button>
  )
}
