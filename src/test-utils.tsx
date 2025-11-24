// src/test-utils.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ReactNode } from "react";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet, mainnet, polygon } from "wagmi/chains";

// --------------------------------------------
//  FIX: wagmi config for testing
//  No WalletConnect, no transports fallback
// --------------------------------------------
const config = createConfig({
  chains: [mainnet, bscTestnet, polygon],
  transports: {
    [mainnet.id]: http(),
    [bscTestnet.id]: http(),
    [polygon.id]: http(),
  },
  ssr: false,
});

// --------------------------------------------
// Query Client instance
// --------------------------------------------
const queryClient = new QueryClient();

// --------------------------------------------
// Provider wrapper for tests
// --------------------------------------------
export function WagmiTestProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// --------------------------------------------
// Custom test renderer
// --------------------------------------------
export function renderWithProviders(
  ui: ReactNode,
  options?: Parameters<typeof render>[1]
) {
  return render(<WagmiTestProvider>{ui}</WagmiTestProvider>, options);
}

export * from "@testing-library/react";
