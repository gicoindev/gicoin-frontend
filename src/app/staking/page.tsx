"use client";

import EventLog from "@/components/staking/EventLog";
import TransactionHistory from "@/components/staking/TransactionHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLockTimer } from "@/hooks/useLockTimer";
import { useStaking } from "@/hooks/useStaking";
import { useStakingRewards } from "@/hooks/useStakingRewards";
import { useTokenBalance } from "@/hooks/useTokenBalance";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useAccount, useChainId } from "wagmi";

import { useContracts } from "@/config/contracts";

// ==========================================================
// 🚀 GIC Staking Page (Updated v5 — with new hooks)
// ==========================================================
export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { gicoin } = useContracts();

  // 🎯 HOOK UTAMA TRANSAKSI + EVENT
  const {
    staked,
    stake,
    unstake,
    claimReward,
    events,
    loading,
    isPending,
    refresh,
  } = useStaking();

  // 🎯 HOOK REWARD (rewardRate, minStake, calculatedReward, rewardPool)
  const {
    rewardRate,
    minStake,
    calculatedReward,
  } = useStakingRewards();

  // 🎯 HOOK BALANCE ERC20
  const { balance } = useTokenBalance(
    gicoin.address as `0x${string}`,
    gicoin.abi
  );

  // 🎯 Lock timer (30 hari unstake)
  const { lockUntil, countdown, canUnstake } = useLockTimer(address);

  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "events" | "history"
  >("dashboard");

  // ==========================================================
  // 🚀 Stake Handler
  // ==========================================================
  const doStake = async () => {
    if (!amount) return toast.error("Isi jumlah staking terlebih dahulu.");
    if (Number(amount) < Number(minStake))
      return toast.error(`Minimum stake adalah ${minStake} GIC`);

    try {
      await toast.promise(stake(amount), {
        loading: "⏳ Mengirim transaksi staking...",
        success: "✅ Staking berhasil!",
        error: "❌ Gagal melakukan staking",
      });

      setAmount("");
      refresh();
    } catch (err) {
      console.error("❌ Stake error:", err);
      toast.error("Transaksi staking gagal.");
    }
  };

  // ==========================================================
  // 🏖️ Unstake Handler
  // ==========================================================
  const doUnstake = async () => {
    if (!staked || Number(staked) <= 0)
      return toast.error("Tidak ada token yang di-stake.");
    if (!canUnstake)
      return toast.error("🔒 Belum bisa unstake — masih dalam 30 hari.");

    try {
      await toast.promise(unstake(), {
        loading: "⏳ Unstaking...",
        success: "🏖️ Unstake berhasil!",
        error: "❌ Gagal melakukan unstake",
      });

      refresh();
    } catch (err) {
      console.error("❌ Unstake error:", err);
      toast.error("Unstake gagal.");
    }
  };

  // ==========================================================
  // 🎁 Claim Reward
  // ==========================================================
  const doClaim = async () => {
    if (Number(calculatedReward) <= 0)
      return toast.error("Tidak ada reward yang bisa di-claim.");

    try {
      await toast.promise(claimReward(calculatedReward), {
        loading: "⏳ Claiming reward...",
        success: "🎉 Reward berhasil di-claim!",
        error: "❌ Gagal claim reward",
      });

      refresh();
    } catch (err) {
      console.error("❌ Claim error:", err);
      toast.error("Claim reward gagal.");
    }
  };

  // ==========================================================
  // 🧩 UI Render
  // ==========================================================
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Toaster richColors position="top-center" />
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
      <Toaster richColors position="top-center" />

      <div className="w-full max-w-3xl bg-[#0b0b0f] border border-gray-700 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/30">
        <h1 className="text-2xl font-bold text-center">🚀 GIC Staking Dashboard</h1>
        <p className="text-center text-gray-400">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>

        {/* ===== Tabs ===== */}
        <div className="flex justify-center gap-4 border-b border-gray-700 pb-3">
          {["dashboard", "events", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "events"
                ? "Event Logs"
                : "History"}
            </button>
          ))}
        </div>

        {/* ===== Dashboard Tab ===== */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center border-t border-gray-700 pt-6">

              <div>
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-lg font-semibold">{balance} GIC</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Staked</p>
                <p className="text-lg font-semibold">{staked} GIC</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Reward</p>
                <p className="text-lg font-semibold">{calculatedReward} GIC</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">APR</p>
                <p className="text-lg font-semibold">{rewardRate}%</p>
              </div>

            </div>

            <div className="text-center text-yellow-400 text-sm mt-2">
              {lockUntil && (
                <p>
                  ⏳ Unstake available in:{" "}
                  <span className="font-semibold">{countdown}</span>
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-gray-700 pt-6">
              <Input
                placeholder={`Minimal stake: ${minStake} GIC`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading || isPending}
                className="bg-gray-800 text-white placeholder-gray-400 border-gray-700"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={doStake}
                  disabled={loading || isPending || !amount}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Stake
                </Button>

                <Button
                  onClick={doClaim}
                  disabled={loading || Number(calculatedReward) <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Claim
                </Button>

                <Button
                  onClick={doUnstake}
                  disabled={!canUnstake || Number(staked) <= 0}
                  className={`flex-1 ${
                    canUnstake
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  {canUnstake ? "Unstake" : "Locked 🔒"}
                </Button>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button variant="outline" size="sm" onClick={refresh}>
                🔄 Refresh
              </Button>
            </div>
          </>
        )}

        {/* ===== Event Logs Tab ===== */}
        {activeTab === "events" && (
          <EventLog events={events} onRefresh={refresh} />
        )}

        {/* ===== History Tab ===== */}
        {activeTab === "history" && (
          <TransactionHistory events={events} />
        )}
      </div>
    </div>
  );
}
