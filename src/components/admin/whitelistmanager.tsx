"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useState } from "react";

export default function WhitelistManager() {
  const { toast } = useToast();
  const { setWhitelist, loading } = useAdminActions();

  const [inputAddress, setInputAddress] = useState("");

  const validateAddress = () => {
    return (
      inputAddress.startsWith("0x") &&
      inputAddress.length === 42
    );
  };

  const handleAdd = async () => {
    if (!validateAddress()) {
      return toast({
        title: "⚠️ Invalid Address",
        description: "Please enter a valid wallet address (0x...).",
        variant: "destructive",
      });
    }

    try {
      await setWhitelist(inputAddress as `0x${string}`, true);
      toast({
        title: "✅ Whitelisted",
        description: `${inputAddress} added to whitelist.`,
      });
      setInputAddress("");
    } catch (err: any) {
      toast({
        title: "❌ Failed to Add",
        description: err?.message || "Transaction failed.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    if (!validateAddress()) {
      return toast({
        title: "⚠️ Invalid Address",
        description: "Please enter a valid wallet address (0x...).",
        variant: "destructive",
      });
    }

    try {
      await setWhitelist(inputAddress as `0x${string}`, false);
      toast({
        title: "✅ Removed",
        description: `${inputAddress} removed from whitelist.`,
      });
      setInputAddress("");
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
      title="Whitelist Manager"
      description="Add or remove addresses from whitelist."
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="whitelistAddress">Address</Label>
          <Input
            id="whitelistAddress"
            placeholder="0x..."
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
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
