"use client";

import { Badge } from "@/components/ui/badge";
import { CardGold } from "@/components/ui/card-gold";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs"; // pastikan ini ada
import { useToast } from "@/hooks/use-toast";
import { useTokenStats } from "@/hooks/useTokenStats";
import { useEffect, useState } from "react";

export default function DashboardTabs() {
  const { totalSupply, circulating, airdropProgress, activeProposals, error } = useTokenStats();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      if (error) {
        // ❌ error toast
        toast({
          title: "❌ Failed to load stats",
          description: "Terjadi kesalahan saat mengambil data dashboard.",
          variant: "destructive",
        });
      } else {
        // ✅ success toast
        toast({
          title: "✅ Stats Loaded",
          description: "Dashboard data berhasil dimuat.",
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [error, toast]);

  return (
    <TabsContent value="dashboard">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Token Overview */}
        <CardGold title="Token Overview">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-zinc-400">Total Supply</p>
              {loading ? (
                <Skeleton className="h-6 w-40 bg-zinc-800" />
              ) : (
                <p className="text-xl font-bold text-white">
                  {totalSupply?.toLocaleString() ?? "-"} GCN
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-zinc-400">Circulating</p>
              {loading ? (
                <Skeleton className="h-6 w-32 bg-zinc-800" />
              ) : (
                <p className="text-xl font-bold text-white">
                  {circulating?.toLocaleString() ?? "-"} GCN
                </p>
              )}
            </div>
          </div>
        </CardGold>

        {/* Airdrop & Governance */}
        <CardGold title="Airdrop & Governance">
          <div className="space-y-4">
            {/* Airdrop Progress */}
            <div>
              <p className="text-sm text-zinc-400 mb-1">Airdrop Progress</p>
              {loading ? (
                <Skeleton className="h-2 w-full bg-zinc-800" />
              ) : (
                <>
                  <Progress value={airdropProgress ?? 0} className="h-2 bg-zinc-800" />
                  <p className="text-xs text-zinc-500 mt-1">
                    {airdropProgress ?? 0}% completed
                  </p>
                </>
              )}
            </div>

            {/* Governance */}
            <div>
              <p className="text-sm text-zinc-400 mb-1">Governance</p>
              {loading ? (
                <Skeleton className="h-6 w-24 bg-zinc-800" />
              ) : (
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-400"
                  >
                    {activeProposals ?? 0} Active
                  </Badge>
                  <Badge className="bg-green-600 text-white">Stable</Badge>
                </div>
              )}
            </div>
          </div>
        </CardGold>
      </div>
    </TabsContent>
  );
}
