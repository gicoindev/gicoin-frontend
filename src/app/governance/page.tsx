"use client";

import CreateProposal from "@/components/governance/createproposal";
import EventLog from "@/components/governance/eventlog";
import ProposalDetail from "@/components/governance/proposaldetail";
import ProposalList from "@/components/governance/proposallist";
import { GovernanceProvider } from "@/context/governancecontext";
import { useAccount } from "wagmi";

export default function GovernancePage() {
  const { isConnected } = useAccount();

  // Jika belum connect, jangan load komponen yang fetch on-chain
  if (!isConnected) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-gray-400">
          <h2 className="text-xl font-semibold">🔐 Governance</h2>
          <p className="mt-2">Silakan hubungkan wallet untuk mengakses fitur governance.</p>
        </div>
      </div>
    );
  }

  return (
    <GovernanceProvider>
      <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-950">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">🏛️ Governance</h1>
          <div className="w-full sm:w-auto">
            <CreateProposal />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProposalList />
          </div>

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