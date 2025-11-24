"use client"

import { ButtonGold } from "@/components/ui/button-gold"
import { CardGold } from "@/components/ui/card-gold"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAdminActions } from "@/hooks/useAdminActions"
import { useState } from "react"

export default function TaxRateForm() {
  const { toast } = useToast()
  const { setTaxRate, setTaxWallet, loading } = useAdminActions()

  const [rate, setRate] = useState("")
  const [wallet, setWallet] = useState("")

  // ==========================================================
  // 🧮 Update Tax Rate
  // ==========================================================
  const handleSetRate = async () => {
    if (!rate || Number(rate) < 0) {
      toast({
        title: "⚠️ Invalid Input",
        description: "Please enter a valid tax rate (number ≥ 0).",
        variant: "destructive",
      })
      return
    }

    try {
      await setTaxRate(Number(rate))
      toast({
        title: "✅ Tax Rate Updated",
        description: `New tax rate set to ${rate}%`,
      })
      setRate("")
    } catch (err: any) {
      console.error("❌ setTaxRate failed:", err)
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message || "Failed to update tax rate.",
        variant: "destructive",
      })
    }
  }

  // ==========================================================
  // 💼 Update Tax Wallet
  // ==========================================================
  const handleSetWallet = async () => {
    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
      toast({
        title: "⚠️ Invalid Address",
        description: "Please enter a valid wallet address (0x...).",
        variant: "destructive",
      })
      return
    }

    try {
      await setTaxWallet(wallet as `0x${string}`)
      toast({
        title: "✅ Tax Wallet Updated",
        description: `New tax wallet set to ${wallet}`,
      })
      setWallet("")
    } catch (err: any) {
      console.error("❌ setTaxWallet failed:", err)
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message || "Failed to update tax wallet.",
        variant: "destructive",
      })
    }
  }

  // ==========================================================
  // 🧠 UI
  // ==========================================================
  return (
    <CardGold
      title="Tax Control"
      description="Set global tax rate and tax receiver wallet."
    >
      <div className="space-y-4">
        {/* Tax Rate */}
        <div>
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            placeholder="Enter new tax rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <ButtonGold
            className="w-full mt-2"
            disabled={loading}
            onClick={handleSetRate}
          >
            {loading ? "Processing..." : "Update Tax Rate"}
          </ButtonGold>
        </div>

        {/* Tax Wallet */}
        <div>
          <Label htmlFor="taxWallet">Tax Wallet Address</Label>
          <Input
            id="taxWallet"
            placeholder="0x..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <ButtonGold
            className="w-full mt-2"
            goldVariant="outline"
            disabled={loading}
            onClick={handleSetWallet}
          >
            {loading ? "Processing..." : "Update Tax Wallet"}
          </ButtonGold>
        </div>
      </div>
    </CardGold>
  )
}
