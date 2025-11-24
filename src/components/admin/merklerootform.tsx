"use client"

import { ButtonGold } from "@/components/ui/button-gold"
import { CardGold } from "@/components/ui/card-gold"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAdminActions } from "@/hooks/useAdminActions"
import { useState } from "react"

export default function MerkleRootForm() {
  const { toast } = useToast()
  const { setMerkleRoot, loading } = useAdminActions()
  const [root, setRoot] = useState("")

  const handleSubmit = async () => {
    try {
      await setMerkleRoot(root as `0x${string}`)
      toast({
        title: "✅ Merkle Root Updated",
        description: `New root set successfully.`,
      })
    } catch (err: any) {
      toast({
        title: "❌ Transaction Failed",
        description: err?.shortMessage || err?.message,
        variant: "destructive",
      })
    }
  }

  return (
    <CardGold title="Merkle Root" description="Set new airdrop Merkle root.">
      <div className="space-y-4">
        <div>
          <Label htmlFor="root">Merkle Root</Label>
          <Input id="root" placeholder="0x..." value={root} onChange={(e) => setRoot(e.target.value)} />
        </div>
        <ButtonGold className="w-full" disabled={loading} onClick={handleSubmit}>
          {loading ? "Processing..." : "Set Merkle Root"}
        </ButtonGold>
      </div>
    </CardGold>
  )
}
