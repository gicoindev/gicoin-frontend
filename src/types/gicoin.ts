// src/types/gicoin.ts
import { GICOIN_ABI } from "@/config/contracts";
import type { ExtractAbiEvent, ExtractAbiEventNames } from "abitype";
import type { Abi } from "viem";

/**
 * Pastikan ABI yang diexport dari config terdefinisi sebagai Abi
 * supaya type inference dari abitype bisa jalan.
 */
export type GicoinAbi = typeof GICOIN_ABI extends Abi ? typeof GICOIN_ABI : Abi;

/** Nama event yang tersedia di GICOiN */
export type GicoinEventNames = ExtractAbiEventNames<GicoinAbi>;

/** Semua event dari ABI */
export type GicoinEvent<T extends GicoinEventNames> = ExtractAbiEvent<
  GicoinAbi,
  T
>;

/**
 * Khusus typing untuk event Airdrop
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
 * Bentuk log yang dipakai di aplikasi
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
