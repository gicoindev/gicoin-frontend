"use client";

import { useAirdrop } from "@/context/airdropcontext";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

function getExplorerTxUrl(chainId: number, hash: string) {
  const explorers: Record<number, string> = {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
    1: "https://etherscan.io",
  };
  return `${explorers[chainId] || explorers[1]}/tx/${hash}`;
}

export default function ClaimAirdrop() {
  const {
    isConnected,
    claimWithWhitelist,
    claimWithMerkle,
    register,
    loading,
    eligible,
    amount,
    proof,
    claimed,
    refetch,
  } = useAirdrop();

  const { address } = useAccount();
  const chainId = useChainId();

  const [method, setMethod] = useState<"Whitelist" | "Merkle" | "Admin">("Whitelist");
  const [manualAmount, setManualAmount] = useState("");
  const [manualProof, setManualProof] = useState("");
  const [claimedLocal, setClaimedLocal] = useState(false);
  const proofToastShown = useRef(false);

  // Auto-load proof & amount
  useEffect(() => {
    if (proof.length > 0 && !proofToastShown.current) {
      setManualProof(proof.join(", "));
      if (amount !== "0") toast.success("✅ Proof loaded from backend!");
      proofToastShown.current = true;
    }
  }, [proof, amount]);

  // Amount to display
  const displayAmount =
    method === "Merkle" && (eligible || Number(amount) > 0)
      ? formatUnits(BigInt(amount || "0"), 18)
      : manualAmount;

  const displayProof = manualProof;

  // 🎯 Claim button handler
  const handleClaim = async () => {
    if (!isConnected) return toast.error("❌ Wallet not connected");
    if (claimed || claimedLocal) return toast.info("✅ Already claimed!");

    if (!eligible && method !== "Admin") {
      return toast.warning("⚠️ Not eligible for airdrop yet.");
    }

    // Convert typed amount → BigInt
    const parsedAmount =
      displayAmount && displayAmount !== "0"
        ? parseUnits(displayAmount as `${number}`, 18)
        : 0n;

    // Convert proof → array of hex
    const parsedProof =
      method === "Merkle"
        ? displayProof
            .split(",")
            .map((p) => p.trim())
            .filter((p) => /^0x[0-9a-fA-F]{64}$/.test(p))
        : [];

    if (method === "Merkle" && parsedProof.length === 0) {
      return toast.error("❌ Missing or invalid proof!");
    }

    const toastId = toast.loading("Claiming airdrop...");

    try {
      let receipt;

      if (method === "Whitelist") {
        receipt = await claimWithWhitelist(parsedAmount);
      } else if (method === "Merkle") {
        const hexProof = parsedProof as `0x${string}`[];
        receipt = await claimWithMerkle(parsedAmount, hexProof);
      } else {
        receipt = await register();
      }

      if (!receipt || receipt.status !== "success") {
        throw new Error("❌ Claim failed or reverted on-chain");
      }

      toast.success(
        <span>
          ✅ Claimed successfully!{" "}
          <a
            href={getExplorerTxUrl(
              chainId,
              (receipt as any).transactionHash || (receipt as any).hash
            )}
            target="_blank"
            className="underline text-blue-400"
          >
            View Tx
          </a>
        </span>,
        { id: toastId, duration: 7000 }
      );

      setClaimedLocal(true);

      setTimeout(() => {
        refetch?.();
      }, 2500);
    } catch (err: any) {
      console.error("❌ Claim error:", err);
      toast.error(err?.shortMessage || err?.message || "Claim failed ❌", {
        id: toastId,
      });
    }
  };

  const isClaimed = claimed || claimedLocal;

  return (
    <div className="bg-neutral-900 p-4 rounded-2xl shadow-md space-y-3">
      <h2 className="font-semibold text-lg">🪂 Claim Airdrop</h2>

      {!isConnected ? (
        <p className="text-gray-400">Connect wallet to claim</p>
      ) : isClaimed ? (
        <p className="text-green-400 font-medium">✅ You have already claimed this airdrop!</p>
      ) : (
        <>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="w-full p-2 rounded bg-neutral-800"
          >
            <option value="Whitelist">Whitelist</option>
            <option value="Merkle">Merkle Proof</option>
            <option value="Admin">Admin Eligible</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={displayAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            disabled={method === "Merkle" && eligible}
            className="w-full p-2 rounded bg-neutral-800"
          />

          {method === "Merkle" && (
            <textarea
              rows={5}
              placeholder="Proof (auto fetched or comma separated)"
              value={displayProof}
              onChange={(e) => setManualProof(e.target.value)}
              disabled={eligible}
              className="w-full p-2 rounded bg-neutral-800 font-mono text-xs"
            />
          )}

          <button
            onClick={handleClaim}
            disabled={loading || !eligible || isClaimed}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              !eligible || isClaimed
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-green-500 text-black hover:bg-green-600 hover:text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Airdrop"
            )}
          </button>
        </>
      )}
    </div>
  );
}
