"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useState } from "react";

export default function BlacklistManager() {
  const { toast } = useToast();
  const { batchAddToBlacklist, batchRemoveFromBlacklist, loading } = useAdminActions();
  const [address, setAddress] = useState("");

  const handleAdd = async () => {
    if (!address.startsWith("0x") || address.length !== 42) {
      return toast({
        title: "⚠️ Invalid Address",
        description: "Please enter a valid wallet address.",
        variant: "destructive",
      });
    }

    try {
      await batchAddToBlacklist([address as `0x${string}`]);
      toast({
        title: "✅ Added to Blacklist",
        description: `${address} has been blacklisted.`,
      });
      setAddress("");
    } catch (err: any) {
      toast({
        title: "❌ Failed to Add",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    if (!address.startsWith("0x") || address.length !== 42) {
      return toast({
        title: "⚠️ Invalid Address",
        description: "Please enter a valid wallet address.",
        variant: "destructive",
      });
    }

    try {
      await batchRemoveFromBlacklist([address as `0x${string}`]);
      toast({
        title: "✅ Removed from Blacklist",
        description: `${address} has been unblocked.`,
      });
      setAddress("");
    } catch (err: any) {
      toast({
        title: "❌ Failed to Remove",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    }
  };

  return (
    <CardGold
      title="Blacklist Manager"
      description="Block addresses from interacting with the token."
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="blacklistAddress">Address</Label>
          <Input
            id="blacklistAddress"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <ButtonGold className="w-full" onClick={handleAdd} disabled={loading}>
            {loading ? "Processing..." : "Add"}
          </ButtonGold>
          <ButtonGold
            goldVariant="outline"
            className="w-full"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Processing..." : "Remove"}
          </ButtonGold>
        </div>
      </div>
    </CardGold>
  );
}
