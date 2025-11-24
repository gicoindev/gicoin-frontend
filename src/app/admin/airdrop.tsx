"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { useContracts } from "@/config/contracts";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";
import { wagmiConfig } from "@/lib/wagmi";
import { readContract } from "@wagmi/core";
import type { Abi } from "viem";

export default function AirdropAdmin() {
  const { toast } = useToast();
  const { address } = useAccount();
  const { gicoin } = useContracts();
  const { setMerkleRoot, setWhitelist, batchSetWhitelist, loading } =
    useAdminActions();

  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  const [merkleRoot, setMerkleRootValue] = useState("");
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [isWhitelisted, setIsWhitelisted] = useState(true);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);

  // ==========================================================
  // 🔐 Check Admin Ownership (VIEM ONLY — NO ETHERS)
  // ==========================================================
  useEffect(() => {
    const check = async () => {
      if (!address) return;

      try {
        const owner = await readContract(wagmiConfig, {
          address: gicoin.address,
          abi: gicoin.abi as Abi,
          functionName: "owner",
        });

        setIsOwner((owner as string).toLowerCase() === address.toLowerCase());
      } catch (err) {
        console.error("Owner check failed:", err);
        setIsOwner(false);
      }
    };

    check();
  }, [address, gicoin]);

  // ==========================================================
  // 🌳 Set Merkle Root
  // ==========================================================
  const handleSetMerkle = async () => {
    if (!/^0x[a-fA-F0-9]{64}$/.test(merkleRoot)) {
      return toast({
        title: "⚠️ Invalid Merkle Root",
        description: "Must be 32-byte hex string (0x + 64 hex chars).",
        variant: "destructive",
      });
    }

    try {
      await setMerkleRoot(merkleRoot as `0x${string}`);
      toast({ title: "✅ Merkle Root Updated!" });
      setMerkleRootValue("");
    } catch (err: any) {
      toast({
        title: "❌ Failed to Update Root",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  // ==========================================================
  // 👤 Add / Remove Whitelist
  // ==========================================================
  const handleSingleWhitelist = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(whitelistAddress)) {
      return toast({
        title: "⚠️ Invalid Wallet Address",
        description: "Must be a valid 42-char address.",
        variant: "destructive",
      });
    }

    try {
      await setWhitelist(whitelistAddress as `0x${string}`, isWhitelisted);
      toast({
        title: isWhitelisted ? "Added to Whitelist" : "Removed",
        description: whitelistAddress,
      });
      setWhitelistAddress("");
    } catch (err: any) {
      toast({
        title: "❌ Whitelist Update Failed",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  // ==========================================================
  // 📂 Upload CSV + Preview
  // ==========================================================
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    try {
      const text = await file.text();
      const lines = text
        .split(/[\r\n]+/)
        .map((x) => x.trim())
        .filter((x) => /^0x[a-fA-F0-9]{40}$/.test(x));

      if (lines.length === 0) {
        return toast({
          title: "⚠️ No Valid Addresses Found",
          variant: "destructive",
        });
      }

      setCsvPreview(lines.slice(0, 5));

      toast({
        title: "📄 CSV Loaded",
        description: `${lines.length} valid addresses detected.`,
      });
    } catch {
      toast({ title: "❌ CSV Parse Error", variant: "destructive" });
    }
  };

  // ==========================================================
  // 📦 Batch Set Whitelist
  // ==========================================================
  const handleBatchWhitelist = async () => {
    if (!csvFile) return;

    const text = await csvFile.text();
    const lines = text
      .split(/[\r\n]+/)
      .map((x) => x.trim())
      .filter((x) => /^0x[a-fA-F0-9]{40}$/.test(x));

    try {
      await batchSetWhitelist(lines as `0x${string}`[], lines.map(() => true));
      toast({
        title: "✅ Batch Whitelist Done",
        description: `${lines.length} addresses added.`,
      });

      setCsvFile(null);
      setCsvPreview([]);
    } catch (err: any) {
      toast({
        title: "❌ Batch Whitelist Failed",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  // ==========================================================
  // 🔒 Access Restriction
  // ==========================================================
  if (isOwner === false) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">🚫 ACCESS DENIED</h2>
          <p className="text-zinc-400 mt-2">
            Only contract owner can access this admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (isOwner === null) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Skeleton className="w-32 h-6" />
      </div>
    );
  }

  // ==========================================================
  // 🧠 MAIN CLEAN UI
  // ==========================================================
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 🌳 Merkle Root */}
      <CardGold title="Set Merkle Root">
        <div className="space-y-3">
          <Label>Merkle Root (bytes32)</Label>
          <Input
            placeholder="0x..."
            value={merkleRoot}
            onChange={(e) => setMerkleRootValue(e.target.value)}
          />
          <ButtonGold disabled={loading} onClick={handleSetMerkle}>
            {loading ? "Processing..." : "Update Merkle Root"}
          </ButtonGold>
        </div>
      </CardGold>

      {/* 👤 Whitelist */}
      <CardGold title="Whitelist Manager">
        <div className="space-y-3">
          <Label>Wallet Address</Label>
          <Input
            placeholder="0x..."
            value={whitelistAddress}
            onChange={(e) => setWhitelistAddress(e.target.value)}
          />

          <div className="flex gap-2">
            <ButtonGold
              className="w-full"
              disabled={loading}
              onClick={() => {
                setIsWhitelisted(true);
                handleSingleWhitelist();
              }}
            >
              Add
            </ButtonGold>

            <ButtonGold
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
              onClick={() => {
                setIsWhitelisted(false);
                handleSingleWhitelist();
              }}
            >
              Remove
            </ButtonGold>
          </div>
        </div>
      </CardGold>

      {/* 📂 Batch Whitelist */}
      <CardGold title="Batch Whitelist (CSV)">
        <div className="space-y-3">
          <Label>Upload CSV</Label>
          <Input type="file" accept=".csv" onChange={handleCsvUpload} />

          {csvPreview.length > 0 && (
            <div className="bg-zinc-900 p-2 rounded text-xs max-h-32 overflow-auto">
              <p className="text-zinc-500 mb-1">Preview (first 5):</p>
              {csvPreview.map((addr, i) => (
                <p key={i} className="font-mono break-all">
                  {addr}
                </p>
              ))}
            </div>
          )}

          <ButtonGold
            disabled={loading || !csvFile}
            onClick={handleBatchWhitelist}
            className="w-full"
          >
            {loading ? "Processing..." : "Upload & Apply"}
          </ButtonGold>
        </div>
      </CardGold>
    </div>
  );
}
