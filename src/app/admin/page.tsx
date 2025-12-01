"use client";

import { CardGold } from "@/components/ui/card-gold";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContracts } from "@/config/contracts";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAccount, useBlockNumber } from "wagmi";

import AdminGovernance from "@/components/admin/AdminGovernance";
import BlacklistManager from "@/components/admin/blacklistmanager";
import MerkleRootForm from "@/components/admin/merklerootform";
import MintBurnForm from "@/components/admin/mintburnform";
import RewardPoolManager from "@/components/admin/rewardpoolmanager";
import SystemControl from "@/components/admin/systemcontrol";
import TaxRateForm from "@/components/admin/taxrateform";
import WhitelistManager from "@/components/admin/whitelistmanager";
import { useAutoSwitchChain } from "@/hooks/useAutoSwitchChain";

export default function AdminPage() {
  useAutoSwitchChain();
  const { isConnected } = useAccount();
  const { chainInfo } = useContracts();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const {
    totalSupply,
    totalStaked,
    rewardPool,
    rewardRate,
    taxRate,
    proposalCount,
    loading,
  } = useAdminStats();

  if (!isConnected) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">
          <h2 className="text-xl font-semibold">🔐 Admin Panel</h2>
          <p className="mt-2">Hubungkan wallet untuk mengakses panel admin.</p>
        </div>
      </div>
    );
  }

  const circulating =
    totalSupply && totalStaked
      ? (BigInt(totalSupply) - BigInt(totalStaked)).toString()
      : "0";

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
        🔐 Admin Panel
      </h2>

      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-gray-400">
        <span title={chainInfo.explorer}>
          🌐 Connected to <strong>{chainInfo.name}</strong> ({chainInfo.symbol})
        </span>
        <span>
          ⛓️ Block: <strong>{blockNumber ? blockNumber.toString() : "—"}</strong>
        </span>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="token">Token Control</TabsTrigger>
          <TabsTrigger value="airdrop">Airdrop</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dashboard">
            {loading ? (
              <CardGold title="Dashboard">
                <p className="text-gray-400">⏳ Loading on-chain data...</p>
              </CardGold>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <CardGold title="Total Supply" value={`${totalSupply} GIC`} />
                <CardGold title="Total Staked" value={`${totalStaked} GIC`} />
                <CardGold title="Active Proposals" value={proposalCount?.toString() || "0"} />

                <CardGold title="On-Chain Details">
                  <p><strong>Circulating:</strong> {circulating} GIC</p>
                  <p><strong>Reward Pool:</strong> {rewardPool} GIC</p>
                  <p><strong>Reward Rate:</strong> {rewardRate}%</p>
                  <p><strong>Tax Rate:</strong> {taxRate}%</p>
                </CardGold>
              </div>
            )}
          </TabsContent>

          {/* Token Control */}
          <TabsContent value="token">
            <div className="grid md:grid-cols-2 gap-4">
              <MintBurnForm />
              <TaxRateForm />
              <RewardPoolManager />
            </div>
          </TabsContent>

          {/* Airdrop */}
          <TabsContent value="airdrop">
            <div className="grid md:grid-cols-2 gap-4">
              <MerkleRootForm />
              <WhitelistManager />
              <BlacklistManager />
            </div>
          </TabsContent>

          {/* Governance */}
          <TabsContent value="governance">
            <AdminGovernance />
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <div className="grid md:grid-cols-2 gap-4">
              <SystemControl />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
