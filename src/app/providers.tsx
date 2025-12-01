"use client";

import { wagmiConfig } from "@/lib/wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { WagmiProvider, useAccount, useChainId, useSwitchChain } from "wagmi";
import { bsc } from "wagmi/chains";

const queryClient = new QueryClient();

// --------------------------------------------------------------------
// AUTO SWITCH CHAIN (Fix: wagmi v2 tidak punya .catch pada switchChain)
// --------------------------------------------------------------------
function AutoSwitchChain() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) return;

    // Sudah di chain BSC → aman
    if (chainId === bsc.id) return;

    const run = async () => {
      try {
        await switchChain({ chainId: bsc.id });
      } catch (err) {
        console.warn("User rejected chain switch / wallet blocked");
      }
    };

    run();
  }, [isConnected, chainId, switchChain]);

  return null;
}

// --------------------------------------------------------------------
// PROVIDERS ROOT
// --------------------------------------------------------------------
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={bsc}
          theme={darkTheme({
            accentColor: "#facc15",
            accentColorForeground: "#000000",
            borderRadius: "medium",
          })}
          modalSize="compact"
        >
          <AutoSwitchChain />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
