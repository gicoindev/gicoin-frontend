"use client";

import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { usePublicClient } from "wagmi";

import MintBurnForm from "@/components/admin/mintburnform";
import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

import { useContracts } from "@/config/contracts";
import { useAdminActions } from "@/hooks/useAdminActions";

export default function TokenControl() {
  const { toast } = useToast();
  const client = usePublicClient();
  const { gicoin } = useContracts();

  // Admin functions
  const {
    setTaxRate,
    updateRewardRate,
    topUpRewardPool,
    loading,
  } = useAdminActions();

  // State
  const [taxInput, setTaxInput] = useState("");
  const [rewardInput, setRewardInput] = useState("");
  const [poolInput, setPoolInput] = useState("");

  const [currentTax, setCurrentTax] = useState<string | null>(null);
  const [currentReward, setCurrentReward] = useState<string | null>(null);

  // Fetch on-chain values
  const fetchData = async () => {
    try {
      if (!client) return; // ⭐ mencegah undefined
  
      const [taxRateRaw, rewardRateRaw] = await Promise.all([
        client.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "taxRate",
        }),
        client.readContract({
          address: gicoin.address,
          abi: gicoin.abi,
          functionName: "rewardRate",
        }),
      ]);
  
      setCurrentTax(Number(taxRateRaw).toString());
      setCurrentReward(Number(rewardRateRaw).toString());
    } catch (err) {
      console.error("Failed to fetch token settings:", err);
    }
  };

  useEffect(() => {
    if (!client) return; // ⭐ tunggu wagmi siap
  
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [client]);
  
  // Generic executor
  const exec = async (fn: () => Promise<any>, msg: string) => {
    try {
      await fn();
      toast({ title: "✅ Success", description: msg });
      fetchData();
    } catch (err: any) {
      toast({
        title: "❌ Failed",
        description: err?.shortMessage || err?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Mint / Burn */}
      <MintBurnForm />

      {/* TAX SETTINGS */}
      <CardGold title="Tax Settings">
        <p className="text-xs text-zinc-400 mb-2">Manage tax percentage.</p>

        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Current Tax</p>
            {currentTax === null ? (
              <Skeleton className="h-6 w-20 bg-zinc-800" />
            ) : (
              <p className="text-lg font-semibold">{currentTax}%</p>
            )}
          </div>

          <Input
            placeholder="Enter new tax %"
            value={taxInput}
            onChange={(e) => setTaxInput(e.target.value)}
          />

          <ButtonGold
            disabled={loading}
            onClick={() =>
              exec(() => setTaxRate(Number(taxInput)), "Tax rate updated.")
            }
          >
            Update Tax
          </ButtonGold>
        </div>
      </CardGold>

      {/* REWARD RATE SETTINGS */}
      <CardGold title="Reward Rate Settings">
        <p className="text-xs text-zinc-400 mb-2">Staking reward % per month.</p>

        <div className="space-y-4">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Current Reward Rate</p>
            {currentReward === null ? (
              <Skeleton className="h-6 w-24 bg-zinc-800" />
            ) : (
              <p className="text-lg font-semibold">{currentReward}%</p>
            )}
          </div>

          <Input
            placeholder="Enter new reward %"
            value={rewardInput}
            onChange={(e) => setRewardInput(e.target.value)}
          />

          <ButtonGold
            disabled={loading}
            onClick={() =>
              exec(
                () => updateRewardRate(Number(rewardInput)),
                "Reward rate updated."
              )
            }
          >
            Update Reward
          </ButtonGold>
        </div>
      </CardGold>

      {/* TOP-UP REWARD POOL */}
      <CardGold title="Top-Up Reward Pool">
        <p className="text-xs text-zinc-400 mb-2">
          Send GIC (no tax) to reward pool wallet.
        </p>

        <Input
          type="number"
          placeholder="Amount (GIC)"
          value={poolInput}
          onChange={(e) => setPoolInput(e.target.value)}
        />

        <ButtonGold
          className="w-full mt-2"
          disabled={loading}
          onClick={() =>
            exec(
              () => topUpRewardPool(parseUnits(poolInput, 18)),
              "Reward pool topped up."
            )
          }
        >
          Send to Pool
        </ButtonGold>
      </CardGold>
    </div>
  );
}
