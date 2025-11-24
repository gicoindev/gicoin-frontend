"use client";

import CreateProposal from "@/components/governance/createproposal";
import EventLog from "@/components/governance/eventlog";
import ProposalDetail from "@/components/governance/proposaldetail";
import ProposalList from "@/components/governance/proposallist";
import { GovernanceProvider } from "@/context/governancecontext";

export default function GovernancePage() {
  return (
    <GovernanceProvider>
      <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-950">

        {/* Header + Create Proposal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">🏛️ Governance</h1>

          {/* Create Proposal */}
          <div className="w-full sm:w-auto">
            <CreateProposal />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Proposal List (NO SCROLL WRAPPER HERE) */}
          <div className="md:col-span-1">
            <ProposalList />
          </div>

          {/* Proposal Detail + Events */}
          <div className="md:col-span-2 space-y-6">
            <ProposalDetail />
            <div className="border-t border-gray-700 pt-4">
              <EventLog />
            </div>
          </div>
        </div>
      </div>
    </GovernanceProvider>
  );
}
