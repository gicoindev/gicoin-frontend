"use client"

import { useGovernanceContext } from "@/context/governancecontext"
import { useState } from "react"

export default function CreateProposal() {
  const { createProposal } = useGovernanceContext()
  const [desc, setDesc] = useState("")

  const handleCreate = async () => {
    if (!desc.trim()) return
    try {
      const txHash = await createProposal(desc)
      console.log("✅ Proposal created, txHash:", txHash)
      setDesc("")
    } catch (err) {
      console.error("❌ Failed to create proposal:", err)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Proposal description"
        className="flex-1 px-3 py-2 rounded-xl text-black"
      />
      <button
        className="px-4 py-2 bg-yellow-500 rounded-xl font-semibold"
        onClick={handleCreate}
      >
        ➕ Create
      </button>
    </div>
  )
}
