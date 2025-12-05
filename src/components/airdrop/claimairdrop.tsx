"use client";

import { useAirdrop } from "@/context/airdropcontext";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

// ================================
// Explorer URL helper
// ================================
function getExplorerTxUrl(chainId: number, hash: string) {
  const explorers: Record<number, string> = {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
    1: "https://etherscan.io",
  };
  return `${explorers[chainId] || explorers[56]}/tx/${hash}`;
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

  // ================================
  // Auto-load proof + amount from backend
  // ================================
  useEffect(() => {
    if (proof.length > 0 && !proofToastShown.current) {
      setManualProof(proof.join(", "));
      if (amount !== "0") toast.success("✅ Proof loaded from backend!");
      proofToastShown.current = true;
    }
  }, [proof, amount]);

  // ================================
  // Display amount (backend gives plain "100")
  // ================================
  const displayAmount =
    method === "Merkle" && (eligible || Number(amount) > 0)
      ? amount // already plain number
      : manualAmount;

  const displayProof = manualProof;

  // ================================
  // Proof validator
  // ================================
  const parsedProof =
    method === "Merkle"
      ? displayProof
          .split(",")
          .map((p) => p.trim())
          .filter((p) => /^0x[0-9A-Fa-f]{64}$/.test(p))
      : [];

  // ================================
  // Disable logic
  // ================================
  const isClaimed = claimed || claimedLocal;
  const isBtnDisabled =
    loading ||
    isClaimed ||
    (method === "Merkle" && parsedProof.length === 0);

  // ================================
  // MAIN CLAIM HANDLER
  // ================================
  const handleClaim = async () => {
    if (!isConnected) return toast.error("❌ Wallet not connected");
    if (isClaimed) return toast.info("Already claimed!");

    const parsedAmount =
      displayAmount && displayAmount !== "0"
        ? parseUnits(displayAmount as `${number}`, 18)
        : 0n;

    const toastId = toast.loading("Claiming airdrop...");

    try {
      let receipt;

      if (method === "Whitelist") {
        receipt = await claimWithWhitelist(parsedAmount);
      } else if (method === "Merkle") {
        receipt = await claimWithMerkle(parsedAmount, parsedProof as `0x${string}`[]);
      } else {
        receipt = await register();
      }

      toast.success(
        <span>
          ✅ Claimed successfully!{" "}
          <a
            href={getExplorerTxUrl(chainId, (receipt as any).transactionHash || (receipt as any).hash)}
            target="_blank"
            className="underline text-blue-400"
          >
            View TX
          </a>
        </span>,
        { id: toastId }
      );

      setClaimedLocal(true);
      setTimeout(() => refetch?.(), 1500);
    } catch (err: any) {
      console.error("❌ Claim error:", err);
      toast.error(err?.shortMessage || err?.message || "Claim failed ❌", { id: toastId });
    }
  };

  // ================================
  // UI RENDER
  // ================================
  return (
    <div className="bg-neutral-900 p-4 rounded-2xl shadow-md space-y-3">
      <h2 className="font-semibold text-lg">🪂 Claim Airdrop</h2>

      {!isConnected ? (
        <p className="text-gray-400">Connect wallet to claim</p>
      ) : isClaimed ? (
        <p className="text-green-400 font-medium">✅ You have already claimed!</p>
      ) : (
        <>
          {/* Select Method */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="w-full p-2 rounded bg-neutral-800"
          >
            <option value="Whitelist">Whitelist</option>
            <option value="Merkle">Merkle Proof</option>
            <option value="Admin">Admin Eligible</option>
          </select>

          {/* Amount */}
          <input
            type="number"
            placeholder="Amount"
            value={displayAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            disabled={method === "Merkle" && proof.length > 0}
            className="w-full p-2 rounded bg-neutral-800"
          />

          {/* Proof */}
          {method === "Merkle" && (
            <textarea
              rows={5}
              placeholder="Proof"
              value={displayProof}
              onChange={(e) => setManualProof(e.target.value)}
              disabled={method === "Merkle" && proof.length > 0}
              className="w-full p-2 rounded bg-neutral-800 font-mono text-xs"
            />
          )}

          {/* Button */}
          <button
            onClick={handleClaim}
            disabled={isBtnDisabled}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              isBtnDisabled
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-green-500 text-black hover:bg-green-600 hover:text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Claiming...
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
