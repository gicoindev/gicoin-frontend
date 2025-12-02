"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "sonner";

import ClaimAirdrop from "@/components/airdrop/claimairdrop";
import LogsPanel from "@/components/airdrop/logspanel";
import RegisterAirdrop from "@/components/airdrop/registerairdrop";
import StatusPanel from "@/components/airdrop/statuspanel";
import WalletInfo from "@/components/ui/walletinfo";
import { AirdropProvider } from "@/context/airdropcontext"; // ✅ IMPORT
import { useAccount } from "wagmi";

export default function AirdropPage() {
  const { address } = useAccount();
  return (
    <AirdropProvider>
      <div className="min-h-screen bg-black text-white flex justify-center">
        <div className="w-full max-w-3xl p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Notifications */}
          <Toaster richColors position="top-center" />

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
            🎁 GICOIN AIRDROP
          </h1>

          {/* Register + Claim */}
          <Card className="bg-gray-900/80 rounded-xl shadow-md">
            <CardContent className="p-4 space-y-4">
              <RegisterAirdrop />
              <ClaimAirdrop />
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <Card className="bg-gray-900/80 rounded-xl shadow-md">
            <CardContent className="p-4">
              <WalletInfo />
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card className="bg-gray-900/80 rounded-xl shadow-md">
            <CardContent className="p-4">
              <StatusPanel />
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="bg-gray-900/80 rounded-xl shadow-md mb-20">
            <CardContent className="p-4">
              <LogsPanel key={address} /> {/* pakai key biar re-mount saat wallet berubah */}
            </CardContent>
          </Card>
        </div>
      </div>
    </AirdropProvider>
  );
}
