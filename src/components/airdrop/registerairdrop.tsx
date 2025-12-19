"use client";

import { useAirdrop } from "@/context/airdropcontext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";

function getExplorerTxUrl(chainId: number, hash: string) {
  const explorers: Record<number, string> = {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
    1: "https://etherscan.io",
  };
  return `${explorers[chainId] || explorers[1]}/tx/${hash}`;
}

export default function RegisterAirdrop() {
  const { isConnected, address, register, loading, isRegistered, refetch } = useAirdrop();
  const chainId = useChainId();

  const handleRegister = async () => {
    if (!isConnected || !address) {
      toast.error("❌ Wallet not connected");
      return;
    }

    if (isRegistered) {
      toast.info("🟡 Already registered!");
      return;
    }

    const toastId = toast.loading("Registering airdrop...");

    try {
      const receipt = await register();

      toast.success(
        <span>
          ✅ Registered successfully!{" "}
          <a
            href={getExplorerTxUrl(
              chainId,
              (receipt as any).transactionHash || (receipt as any).hash
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            View Tx
          </a>
        </span>,
        { id: toastId }
      );

      setTimeout(() => refetch?.(), 1000);
    } catch (err: any) {
      console.error("❌ Register error:", err);
      toast.error(err?.shortMessage || err?.message || "Register failed ❌", {
        id: toastId,
      });
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-neutral-900 shadow space-y-3">
      <h2 className="font-semibold text-lg">✨ Register Airdrop</h2>

      <button
        onClick={handleRegister}
        disabled={loading || isRegistered}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
          isRegistered
            ? "bg-gray-700 text-gray-300 cursor-not-allowed"
            : "bg-yellow-500 text-black hover:bg-yellow-600 hover:text-white"
        } disabled:opacity-60`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registering...
          </>
        ) : isRegistered ? (
          "✅ Already Registered"
        ) : (
          "Register Airdrop"
        )}
      </button>
    </div>
  );
}
