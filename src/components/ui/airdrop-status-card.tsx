"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";

interface AirdropStatusCardProps {
  account: `0x${string}` | "";
}

export function AirdropStatusCard({ account }: AirdropStatusCardProps) {
  const [status, setStatus] = useState<
    "eligible" | "claimed" | "not-eligible" | "pending"
  >("pending");

  const [amount, setAmount] = useState("0");
  const [proof, setProof] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔎 Load status via backend
  useEffect(() => {
    if (!account) return;

    const loadStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/airdrop/status/${account}`
        );
        const data = await res.json();

        console.log("🔎 Airdrop status:", data);

        if (data.claimed) {
          setStatus("claimed");
        } else if (data.eligible) {
          setStatus("eligible");
        } else {
          setStatus("not-eligible");
        }

        // amount (wei → GIC)
        const formatted =
          data.amount ? formatUnits(BigInt(data.amount), 18) : "0";

        setAmount(formatted);
        setProof(data.proof || []);
      } catch (err) {
        console.error("❌ Failed fetching status:", err);
        toast.error("Gagal memuat status airdrop");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [account]);

  // 🔹 UI Render
  let content;
  if (!account) {
    content = (
      <div className="flex items-center gap-2 text-zinc-400">
        <AlertCircle size={18} className="text-yellow-400" />
        <span>Connect wallet untuk cek status airdrop.</span>
      </div>
    );
  } else {
    switch (status) {
      case "eligible":
        content = (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={18} />
              <span className="font-semibold">🎉 Kamu eligible untuk airdrop!</span>
            </div>

            <p className="text-white text-2xl font-bold mt-2">{amount} GIC</p>

            {/* Redirect page claim */}
            <ButtonGold
              className="mt-4"
              onClick={() => (window.location.href = "/airdrop")}
            >
              Klaim Airdrop
            </ButtonGold>
          </div>
        );
        break;

      case "claimed":
        content = (
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <CheckCircle size={18} />
            <span>✅ Kamu sudah klaim airdrop.</span>
          </div>
        );
        break;

      case "not-eligible":
        content = (
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <AlertCircle size={18} />
            <span>❌ Wallet tidak eligible.</span>
          </div>
        );
        break;

      default:
        content = (
          <div className="flex items-center gap-2 text-yellow-400">
            <Clock size={18} />
            <span>⏳ Mengecek status...</span>
          </div>
        );
    }
  }

  return <CardGold title="Airdrop Status">{content}</CardGold>;
}
