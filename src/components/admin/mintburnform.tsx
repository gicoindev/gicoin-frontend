"use client"

import { ButtonGold } from "@/components/ui/button-gold"
import { CardGold } from "@/components/ui/card-gold"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAdminActions } from "@/hooks/useAdminActions"
import { useState } from "react"
import { parseEther } from "viem"

export default function MintBurnForm() {
  const { toast } = useToast()
  const { mint, burn, loading } = useAdminActions()

  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")

  // ==========================================================
  // 🪙 MINT TOKENS
  // ==========================================================
  const handleMint = async () => {
    if (!address || !amount || Number(amount) <= 0) {
      toast({
        title: "⚠️ Invalid Input",
        description: "Please enter a valid address and amount.",
        variant: "destructive",
      })
      return
    }

    try {
      await mint(address as `0x${string}`, parseEther(amount))
      toast({
        title: "✅ Mint Success",
        description: `Minted ${amount} GIC tokens to ${address}`,
      })
      setAmount("")
      setAddress("")
    } catch (err: any) {
      console.error("❌ Mint failed:", err)
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message || "Minting failed",
        variant: "destructive",
      })
    }
  }

  // ==========================================================
  // 🔥 BURN TOKENS
  // ==========================================================
  const handleBurn = async () => {
    if (!address || !amount || Number(amount) <= 0) {
      toast({
        title: "⚠️ Invalid Input",
        description: "Please enter a valid address and amount.",
        variant: "destructive",
      })
      return
    }

    try {
      await burn(address as `0x${string}`, parseEther(amount))
      toast({
        title: "🔥 Burn Success",
        description: `Burned ${amount} GIC tokens from ${address}`,
        variant: "default",
      })
      setAmount("")
      setAddress("")
    } catch (err: any) {
      console.error("❌ Burn failed:", err)
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message || "Burn failed",
        variant: "destructive",
      })
    }
  }

  // ==========================================================
  // 🧠 UI
  // ==========================================================
  return (
    <CardGold
      title="Mint / Burn Tokens"
      description="Admin can mint new tokens or burn from circulation."
    >
      <div className="space-y-4">
        {/* Address input */}
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Amount input */}
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount (GIC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <ButtonGold
            className="w-full"
            disabled={loading}
            onClick={handleMint}
          >
            {loading ? "Processing..." : "Mint"}
          </ButtonGold>
          <ButtonGold
            goldVariant="outline"
            className="w-full"
            disabled={loading}
            onClick={handleBurn}
          >
            {loading ? "Processing..." : "Burn"}
          </ButtonGold>
        </div>
      </div>
    </CardGold>
  )
}
