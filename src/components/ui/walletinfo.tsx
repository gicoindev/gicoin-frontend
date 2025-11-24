"use client";

import { useAirdrop } from "@/context/airdropcontext";
import { useEffect, useRef } from "react";

export default function WalletInfo() {
  const { address, poolBalance, claimed, loading, refetch } = useAirdrop();
  const prevAddress = useRef<string | undefined>(undefined);

  // 🧠 Log perubahan address untuk debugging
  useEffect(() => {
    if (prevAddress.current !== address) {
      console.log("🔁 Wallet changed:", {
        old: prevAddress.current,
        new: address,
      });

      // Refetch data otomatis setiap kali wallet berubah
      if (address) {
        console.log("🔄 Fetching new wallet data...");
        refetch?.();
      }

      prevAddress.current = address;
    }
  }, [address, refetch]);

  // ✨ Shimmer effect saat loading
  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-neutral-900 shadow text-white space-y-3 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>
    );
  }

  // 🧾 Data utama wallet
  return (
    <div className="p-4 rounded-2xl bg-neutral-900 shadow text-white space-y-2">
      <h2 className="text-lg font-bold">👛 Wallet Info</h2>

      <p className="text-sm">
        Wallet:{" "}
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Not connected"}
      </p>

      <p className="text-sm">
        Pool Balance:{" "}
        {poolBalance ? `${poolBalance.toLocaleString()} GIC` : "—"}
      </p>

      <p className="text-sm">
        Status:{" "}
        {claimed ? (
          <span className="text-green-400">✅ Claimed</span>
        ) : (
          <span className="text-red-400">❌ Not Claimed</span>
        )}
      </p>
    </div>
  );
}
