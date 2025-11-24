"use client";

import { AirdropStatusCard } from "@/components/ui/airdrop-status-card";
import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { useGovernance } from "@/hooks/useGovernance";
import { getBalance, loadSummary } from "@/lib/stakingActions";
import { Coins, HandCoins, Vote } from "lucide-react";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

// Font
const inter = localFont({
  src: [
    { path: "../fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
});

export default function DashboardPage() {
  const router = useRouter();

  const { address: account, isConnected } = useAccount();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState("0");
  const [staked, setStaked] = useState("0");
  const [reward, setReward] = useState("0");
  const [apr, setApr] = useState("0");

  const { proposals, vote, loading: govLoading } = useGovernance();

  // Fetch data without ethers provider
  const fetchData = async (address: `0x${string}`) => {
    try {
      setLoading(true);

      const bal = await getBalance(address);
      const summary = await loadSummary(address);

      setBalance(bal);
      setStaked(summary.staked);
      setReward(summary.reward);
      setApr(summary.apr);
    } catch (err) {
      console.error("❌ Failed to load dashboard:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Load user staking summary automatically when connected
  useEffect(() => {
    if (isConnected && account) {
      fetchData(account);
    }
  }, [isConnected, account]);

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-zinc-700 rounded ${className}`} />
  );

  return (
    <div className={`${inter.variable} font-sans p-4 sm:p-6 space-y-6 bg-black min-h-screen`}>
      
      {/* Quick Actions */}
      <CardGold title="Quick Actions" className="transition hover:shadow-lg hover:shadow-yellow-500/20">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
          <ButtonGold onClick={() => router.push("/staking")} className="w-full sm:w-auto">
            <Coins size={16} /> Stake
          </ButtonGold>
          <ButtonGold onClick={() => router.push("/staking")} className="w-full sm:w-auto">
            <HandCoins size={16} /> Unstake
          </ButtonGold>
          <ButtonGold onClick={() => router.push("/staking")} className="w-full sm:w-auto">
            <Coins size={16} /> Claim Rewards
          </ButtonGold>
          <ButtonGold onClick={() => router.push("/governance")} className="w-full sm:w-auto">
            <Vote size={16} /> Governance
          </ButtonGold>
        </div>
      </CardGold>

      {/* Balance & Reward */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardGold title="Balance">
          {loading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <p className="text-4xl font-bold text-yellow-400">{Number(balance).toLocaleString()} GIC</p>
          )}
          <p className="text-sm text-zinc-400 mt-2">
            Wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
          </p>
        </CardGold>

        <CardGold title="Rewards">
          {loading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <p className="text-4xl font-bold text-green-400">
              +{Number(reward).toLocaleString()} GIC
            </p>
          )}
        </CardGold>
      </div>

      {/* Staking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardGold title="Staking Summary">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <p className="text-zinc-300">
                Total Staked: <span className="font-bold">{staked} GIC</span>
              </p>
              <p className="text-zinc-300">
                APR: <span className="font-bold text-yellow-400">{apr}%</span>
              </p>
            </>
          )}
        </CardGold>

        <AirdropStatusCard account={account ?? ""} />
      </div>

      {/* Governance */}
      <CardGold title="Active Governance Proposals">
        {govLoading ? (
          <p className="text-zinc-400 text-sm">Loading proposals...</p>
        ) : (
          <p className="text-zinc-400 text-sm">No active proposals</p>
        )}
      </CardGold>
    </div>
  );
}
