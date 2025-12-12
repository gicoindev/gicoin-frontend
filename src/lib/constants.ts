// src/lib/constants.ts

// alamat contract Airdrop (pakai yg udah deploy di bsctestnet)
export const AIRDROP_ADDRESS = "0xE4A9a0a40468EFC73c5ab64fC4E86C765eFaB4Dd";

// kalau nanti ada token utama (misalnya GIC), bisa tambahkan juga
export const GICOIN_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xe4a9a0a40468efc73c5ab64fc4e86c765efab4dd";

// chain config (opsional, kalau pakai wagmi config khusus)
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
//export const CHAIN_ID = 97: { // BSC Testnet (legacy, can be removed after mainnet stable)

