"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { useContracts } from "@/config/contracts";
import { useToast } from "@/hooks/use-toast";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useReadContract } from "wagmi";

export default function SystemControl() {
  const { toast } = useToast();
  const { loading, pause, unpause } = useAdminActions();
  const { gicoin } = useContracts();

  // ==========================================================
  // 🔍 Read paused() state
  // OPTION B → Interval refresh 3 detik
  // ==========================================================
  const pausedQuery = useReadContract({
    address: gicoin.address,
    abi: gicoin.abi,
    functionName: "paused",
    query: {
      refetchInterval: 5000,
    },
  });

  const paused = Boolean(pausedQuery.data);

  // ==========================================================
  // ⏸ Pause
  // ==========================================================
  const handlePause = async () => {
    try {
      await pause();
      toast({
        title: "🟡 System Paused",
        description: "All core operations are now paused.",
      });
    } catch (err: any) {
      toast({
        title: "❌ Pause Failed",
        description: err?.shortMessage || err?.message,
        variant: "destructive",
      });
    }
  };

  // ==========================================================
  // ▶️ Unpause
  // ==========================================================
  const handleUnpause = async () => {
    try {
      await unpause();
      toast({
        title: "🟢 System Resumed",
        description: "System operations are now active again.",
      });
    } catch (err: any) {
      toast({
        title: "❌ Unpause Failed",
        description: err?.shortMessage || err?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <CardGold
      title="System Controls"
      description="Pause or unpause all system operations."
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Status:{" "}
          <span className={paused ? "text-red-400" : "text-green-400"}>
            {paused ? "Paused" : "Active"}
          </span>
        </p>

        <div className="flex gap-2">
          <ButtonGold
            className="w-full"
            disabled={loading || paused}
            onClick={handlePause}
          >
            {loading && !paused ? "Processing..." : "Pause"}
          </ButtonGold>

          <ButtonGold
            goldVariant="outline"
            className="w-full"
            disabled={loading || !paused}
            onClick={handleUnpause}
          >
            {loading && paused ? "Processing..." : "Unpause"}
          </ButtonGold>
        </div>
      </div>
    </CardGold>
  );
}
