"use client";

import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
      {/* Logo */}
      <div className="text-xl font-bold text-yellow-400">
        <Link href="/">Gicoin</Link>
      </div>

      {/* Menu */}
      <div className="flex gap-6">
        <Link href="/" className={cn("text-zinc-300 hover:text-yellow-400")}>
          Dashboard
        </Link>
        <Link href="/staking" className={cn("text-zinc-300 hover:text-yellow-400")}>
          Staking
        </Link>
        <Link href="/airdrop" className={cn("text-zinc-300 hover:text-yellow-400")}>
          Airdrop
        </Link>
        <Link href="/governance" className={cn("text-zinc-300 hover:text-yellow-400")}>
          Governance
        </Link>
        <Link href="/admin" className={cn("text-zinc-300 hover:text-yellow-400")}>
          Admin
        </Link>
      </div>

      {/* Wallet Connect */}
      <ConnectButton showBalance={false} />
    </nav>
  );
}
