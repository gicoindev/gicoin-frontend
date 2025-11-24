"use client"

import { ButtonGold } from "@/components/ui/button-gold"
import { CardGold } from "@/components/ui/card-gold"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRewardPoolControl } from "@/hooks/useRewardPoolControl"
import { useState } from "react"

export default function RewardPoolManager() {
  const { toast } = useToast()
  const {
    isOwner,
    rewardRate,
    rewardPool,
    fundRewardPool,
    setRewardRate,
    checkConnection,
  } = useRewardPoolControl()

  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [loading, setLoading] = useState(false)

  // ==========================================================
  // 💰 FUND REWARD POOL
  // ==========================================================
  const handleFund = async () => {
    if (!isOwner) {
      toast({
        title: "🔒 Access Denied",
        description: "Only contract owner can fund the reward pool.",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "⚠️ Invalid Amount",
        description: "Please enter a valid GIC amount greater than 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await fundRewardPool(amount)
      toast({
        title: "✅ Pool Funded",
        description: `${amount} GIC successfully added to reward pool.`,
      })
      setAmount("")
    } catch (err: any) {
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message || "Funding failed.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // 🎁 UPDATE REWARD RATE
  // ==========================================================
  const handleSetRate = async () => {
    if (!isOwner) {
      toast({
        title: "🔒 Access Denied",
        description: "Only contract owner can set reward rate.",
        variant: "destructive",
      })
      return
    }

    if (!rate || Number(rate) <= 0) {
      toast({
        title: "⚠️ Invalid Rate",
        description: "Please enter a valid reward rate greater than 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await setRewardRate(rate)
      toast({
        title: "✅ Reward Rate Updated",
        description: `Reward rate successfully set to ${rate}%`,
      })
      setRate("")
    } catch (err: any) {
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message || "Set rate failed.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // 🧠 UI
  // ==========================================================
  return (
    <CardGold title="Reward Pool Manager" description="Manage reward pool and reward rate.">
      {/* 🔒 Owner Info */}
      <p className="text-xs text-zinc-400 mb-3">
        {isOwner ? "✅ Connected as Contract Owner" : "🔒 Read-only Access"}
      </p>

      {/* 🔍 Check Connection */}
      <div className="mb-4">
        <ButtonGold
          onClick={async () => {
            try {
              const result = await checkConnection()
              toast({
                title: "🟢 Contract Connected",
                description: `Address: ${result.address}\nOwner: ${result.owner}`,
              })
            } catch {
              toast({
                title: "🔴 Connection Failed",
                description: "Could not connect to contract. Check ABI or network.",
                variant: "destructive",
              })
            }
          }}
        >
          🔍 Check Gicoin Connection
        </ButtonGold>
      </div>

      {/* ℹ️ Current Status */}
      <div className="space-y-4 text-sm text-zinc-300 mb-6">
        <p>
          <strong>Current Pool Balance:</strong> {rewardPool} GIC
        </p>
        <p>
          <strong>Current Reward Rate:</strong> {rewardRate}%
        </p>
      </div>

      {/* 💰 Fund Reward Pool */}
      <div className="mb-6">
        <Label htmlFor="amount">Fund Reward Pool</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount (GIC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <ButtonGold
          className="w-full mt-2"
          disabled={loading}
          onClick={handleFund}
        >
          {loading ? "Processing..." : "💰 Fund Pool"}
        </ButtonGold>
      </div>

      {/* 🎁 Set Reward Rate */}
      <div>
        <Label htmlFor="rate">Set Reward Rate (%)</Label>
        <Input
          id="rate"
          type="number"
          placeholder="Enter new reward rate"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <ButtonGold
          className="w-full mt-2"
          goldVariant="outline"
          disabled={loading}
          onClick={handleSetRate}
        >
          {loading ? "Processing..." : "🎯 Update Rate"}
        </ButtonGold>
      </div>
    </CardGold>
  )
}
