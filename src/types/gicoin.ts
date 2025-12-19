// src/types/gicoin.ts
import { GICOIN_ABI } from "@/config/contracts";
import type { ExtractAbiEvent, ExtractAbiEventNames } from "abitype";
import type { Abi } from "viem";

/**
 * Pastikan ABI yang diexport dari config terdefinisi sebagai Abi
 * supaya type inference dari abitype bisa jalan.
 */
export type GicoinAbi = typeof GICOIN_ABI extends Abi ? typeof GICOIN_ABI : Abi;

export type GicoinEventNames = ExtractAbiEventNames<GicoinAbi>;

export type GicoinEvent<T extends GicoinEventNames> = ExtractAbiEvent<
  GicoinAbi,
  T
>;

/**
 */
export type AirdropRegisteredEvent = ExtractAbiEvent<
  GicoinAbi,
  "AirdropRegistered"
>;
export type AirdropClaimedEvent = ExtractAbiEvent<GicoinAbi, "AirdropClaimed">;
export type AirdropClaimFailedEvent = ExtractAbiEvent<
  GicoinAbi,
  "AirdropClaimFailed"
>;

/**
 */
export type AirdropEvent =
  | {
      eventName: "AirdropRegistered";
      user: `0x${string}`;
      txHash: `0x${string}`;
    }
  | {
      eventName: "AirdropClaimed";
      user: `0x${string}`;
      amount: string;
      merkleRoot: string;
      txHash: `0x${string}`;
    }
  | {
      eventName: "AirdropClaimFailed";
      user: `0x${string}`;
      amount: string;
      failureReason: string;
      txHash: `0x${string}`;
    };
