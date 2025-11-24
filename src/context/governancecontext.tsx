"use client"

import { Proposal, useGovernance } from "@/hooks/useGovernance"
import { ReactNode, createContext, useContext, useState } from "react"
import type { Hash } from "viem"

// Event Type
export interface GovernanceEvent {
  type: string
  detail: any
  time?: string
}

// Context Value
interface GovernanceContextValue {
  proposals: Proposal[]
  selectedProposal: Proposal | null
  events: GovernanceEvent[]
  selectProposal: (id: number) => void
  createProposal: (description: string) => Promise<Hash>
  vote: (proposalId: number, support: boolean) => Promise<Hash>
  closeVoting: (proposalId: number) => Promise<Hash>
  executeProposal: (proposalId: number) => Promise<Hash>
  reloadProposalCount: () => Promise<void>
  loading: boolean
  address?: `0x${string}`
}

const GovernanceContext = createContext<GovernanceContextValue | undefined>(undefined)

export const GovernanceProvider = ({ children }: { children: ReactNode }) => {
  const {
    proposals,
    events,
    createProposal,
    vote,
    closeVoting,
    executeProposal,
    loading,
    address,
    reloadProposalCount,
  } = useGovernance()

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const selectProposal = (id: number) => {
    const found = proposals.find((p) => p.id === id) || null
    setSelectedProposal(found)
  }

  return (
    <GovernanceContext.Provider
      value={{
        proposals,
        selectedProposal,
        events,
        selectProposal,
        createProposal,
        vote,
        closeVoting,
        executeProposal,
        loading,
        address,
        reloadProposalCount,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  )
}

export const useGovernanceContext = () => {
  const ctx = useContext(GovernanceContext)
  if (!ctx) throw new Error("useGovernanceContext must be inside GovernanceProvider")
  return ctx
}