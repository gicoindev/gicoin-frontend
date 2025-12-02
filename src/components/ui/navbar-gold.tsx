"use client";

import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavbarGold() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Dashboard" },
    { href: "/staking", label: "Staking" },
    { href: "/airdrop", label: "Airdrop" },
    { href: "/governance", label: "Governance" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-yellow-500/20 bg-black/80 backdrop-blur-md relative">
      
      {/* Logo Brand */}
      <div className="text-xl sm:text-2xl font-extrabold text-yellow-400 tracking-wide">
        <Link href="/">Gicoin</Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors duration-200",
              pathname === item.href
                ? "text-yellow-400 font-semibold"
                : "text-zinc-400 hover:text-yellow-400"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right Section */}
      <div className="hidden md:flex items-center gap-3">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div className="flex items-center gap-2">
                {!connected ? (
                  <button
                    onClick={openConnectModal}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Hubungkan Dompet
                  </button>
                ) : (
                  <>
                    {/* Chain Selector */}
                    <button
                      onClick={openChainModal}
                      className="flex items-center gap-2 bg-gray-900 text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-2"
                    >
                      {chain?.iconUrl && (
                        <Image
                          src={chain.iconUrl}
                          alt="chain"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span>{chain?.name}</span>
                    </button>

                    {/* Account */}
                    <button
                      onClick={openAccountModal}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition"
                    >
                      {account.displayName}
                    </button>
                  </>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-yellow-400 focus:outline-none ml-auto text-2xl"
      >
        ☰
      </button>

      {/* Mobile Dropdown */}
      <div
        className={cn(
          "absolute top-full left-0 w-full bg-black border-t border-yellow-500/20 flex flex-col px-4 space-y-3 md:hidden z-50 overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[600px] py-4" : "max-h-0 py-0"
        )}
      >
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "transition-colors duration-200",
              pathname === item.href ? "font-bold text-yellow-400" : "text-zinc-400 hover:text-yellow-400"
            )}
          >
            {item.label}
          </Link>
        ))}

        <div className="border-t border-yellow-500/20 my-2" />

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div className="flex flex-col gap-3">
                {!connected ? (
                  <button
                    onClick={openConnectModal}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Hubungkan Dompet
                  </button>
                ) : (
                  <>
                    <button
                      onClick={openChainModal}
                      className="flex items-center justify-between bg-gray-900 text-yellow-400 border border-yellow-500/30 rounded-lg px-3 py-2 w-full"
                    >
                      <span>{chain?.name}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={openAccountModal}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition"
                    >
                      {account.displayName}
                    </button>
                  </>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
}
