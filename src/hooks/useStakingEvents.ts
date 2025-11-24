// src/hooks/useStakingEvents.ts
import { useContracts } from "@/config/contracts";
import { toast } from "sonner";
import type { Address } from "viem";
import { useAccount, useWatchContractEvent } from "wagmi";

/**
 * 🔁 Listen to staking-related contract events in real time.
 * Hanya trigger refetchStats agar tidak spam RPC.
 */
export function useStakingEvents(refetchStats?: () => void) {
  const { gicoin } = useContracts();
  const { address } = useAccount();

  // 🟢 STAKED
  useWatchContractEvent({
    address: gicoin.address as Address,
    abi: gicoin.abi,
    eventName: "Staked",
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount } = (log as any).args as {
          user: Address;
          amount: bigint;
        };
        if (!address || user.toLowerCase() !== address.toLowerCase()) return;
        toast.success(
          `✅ Kamu berhasil stake ${(Number(amount) / 1e18).toFixed(2)} GIC`
        );
        refetchStats?.();
      });
    },
  });

  // 💸 UNSTAKED
  useWatchContractEvent({
    address: gicoin.address as Address,
    abi: gicoin.abi,
    eventName: "Unstaked",
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount, reward } = (log as any).args as {
          user: Address;
          amount: bigint;
          reward: bigint;
        };
        if (!address || user.toLowerCase() !== address.toLowerCase()) return;
        toast.info(
          `💸 Kamu unstake ${(Number(amount) / 1e18).toFixed(
            2
          )} GIC, reward ${(Number(reward) / 1e18).toFixed(2)} GIC`
        );
        refetchStats?.();
      });
    },
  });

  // 🎁 REWARD CLAIMED
  useWatchContractEvent({
    address: gicoin.address as Address,
    abi: gicoin.abi,
    eventName: "RewardClaimed",
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount } = (log as any).args as {
          user: Address;
          amount: bigint;
        };
        if (!address || user.toLowerCase() !== address.toLowerCase()) return;
        toast.message(
          `🎁 Reward ${(Number(amount) / 1e18).toFixed(2)} GIC berhasil diklaim!`
        );
        refetchStats?.();
      });
    },
  });
}
