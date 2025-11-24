"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useAirdropAdmin } from "@/hooks/useAirdropAdmin";
import { useSystemControl } from "@/hooks/useSystemControl";
import { useState } from "react";

export default function SystemSettings() {
  const { toast } = useToast();

  // Pause / Unpause
  const {
    isPaused,
    loading: pauseLoading,
    pauseSystem,
    unpauseSystem,
  } = useSystemControl();

  // Main admin actions
  const {
    setTaxRate,
    setTaxWallet,
    setMinStakeAmount,
    setRewardPoolWallet,
    topUpRewardPool,
    loading,
  } = useAdminActions();

  // Airdrop admin: tax exempt
  const { setAirdropTaxExempt } = useAirdropAdmin();

  // FORM INPUT STATES
  const [taxRateInput, setTaxRateInput] = useState("");
  const [taxWalletInput, setTaxWalletInput] = useState("");
  const [stakeMinInput, setStakeMinInput] = useState("");
  const [rewardPoolWalletInput, setRewardPoolWalletInput] = useState("");
  const [rewardPoolTopupInput, setRewardPoolTopupInput] = useState("");
  const [airdropExemptAddress, setAirdropExemptAddress] = useState("");
  const [airdropExemptAmount, setAirdropExemptAmount] = useState("");

  // Helper submit
  const submit = async (action: () => Promise<any>, success: string) => {
    try {
      await action();
      toast({ title: "✅ Success", description: success });
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

      {/* SYSTEM CONTROL */}
      <CardGold title="System Controls">
        <p className="text-zinc-400 text-sm mb-2">
          Pause or unpause all system operations.
        </p>

        <p className="text-sm mb-2">
          Status:{" "}
          <span className={isPaused ? "text-red-400" : "text-green-400"}>
            {isPaused ? "Paused" : "Active"}
          </span>
        </p>

        <div className="flex gap-2">
          <ButtonGold
            onClick={() => submit(pauseSystem, "System paused.")}
            disabled={pauseLoading || isPaused}
            className="w-1/2 bg-red-600 hover:bg-red-700"
          >
            Pause
          </ButtonGold>

          <ButtonGold
            onClick={() => submit(unpauseSystem, "System resumed.")}
            disabled={pauseLoading || !isPaused}
            className="w-1/2 bg-green-600 hover:bg-green-700"
          >
            Unpause
          </ButtonGold>
        </div>
      </CardGold>

      {/* ADVANCED SETTINGS */}
      <CardGold title="Advanced Settings">
        <div className="space-y-4">

          {/* TAX RATE */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">Set Tax Rate (%)</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 5"
                value={taxRateInput}
                onChange={(e) => setTaxRateInput(e.target.value)}
              />
              <ButtonGold
                disabled={loading}
                onClick={() =>
                  submit(() => setTaxRate(Number(taxRateInput)), "Tax rate updated.")
                }
              >
                Update
              </ButtonGold>
            </div>
          </div>

          {/* TAX WALLET */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">Set Tax Wallet</p>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={taxWalletInput}
                onChange={(e) => setTaxWalletInput(e.target.value)}
              />
              <ButtonGold
                disabled={loading}
                onClick={() =>
                  submit(() => setTaxWallet(taxWalletInput as `0x${string}`), "Tax wallet updated.")
                }
              >
                Set
              </ButtonGold>
            </div>
          </div>

          {/* MIN STAKE */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">Minimum Stake Amount</p>
            <div className="flex gap-2">
              <Input
                placeholder="wei amount"
                value={stakeMinInput}
                onChange={(e) => setStakeMinInput(e.target.value)}
              />
              <ButtonGold
                disabled={loading}
                onClick={() =>
                  submit(
                    () => setMinStakeAmount(BigInt(stakeMinInput)),
                    "Minimum stake amount updated."
                  )
                }
              >
                Set
              </ButtonGold>
            </div>
          </div>

          {/* REWARD POOL WALLET */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">Reward Pool Wallet</p>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={rewardPoolWalletInput}
                onChange={(e) => setRewardPoolWalletInput(e.target.value)}
              />
              <ButtonGold
                disabled={loading}
                onClick={() =>
                  submit(
                    () => setRewardPoolWallet(rewardPoolWalletInput as `0x${string}`),
                    "Reward pool wallet updated."
                  )
                }
              >
                Set
              </ButtonGold>
            </div>
          </div>

          {/* TOPUP REWARD */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">Top Up Reward Pool (GIC)</p>
            <div className="flex gap-2">
              <Input
                placeholder="Amount in wei"
                value={rewardPoolTopupInput}
                onChange={(e) => setRewardPoolTopupInput(e.target.value)}
              />
              <ButtonGold
                disabled={loading}
                onClick={() =>
                  submit(
                    () => topUpRewardPool(BigInt(rewardPoolTopupInput)),
                    "Reward pool funded."
                  )
                }
              >
                Send
              </ButtonGold>
            </div>
          </div>

          {/* AIRDROP TAX EXEMPT */}
          <div>
            <p className="text-sm text-zinc-400 mb-1">Airdrop Tax Exemption</p>
            <div className="flex gap-2">
              <Input
                placeholder="0xUser..."
                value={airdropExemptAddress}
                onChange={(e) => setAirdropExemptAddress(e.target.value)}
              />
              <Input
                placeholder="Amount (wei)"
                value={airdropExemptAmount}
                onChange={(e) => setAirdropExemptAmount(e.target.value)}
              />
              <ButtonGold
                disabled={loading}
                onClick={() =>
                  submit(
                    () =>
                      setAirdropTaxExempt(
                        airdropExemptAddress as `0x${string}`,
                        BigInt(airdropExemptAmount)
                      ),
                    "Airdrop tax exemption updated."
                  )
                }
              >
                Set
              </ButtonGold>
            </div>
          </div>

        </div>
      </CardGold>
    </div>
  );
}
