// src/lib/constants.ts

// alamat contract Airdrop (pakai yg udah deploy di bsctestnet)
export const AIRDROP_ADDRESS = "0xE4A9a0a40468EFC73c5ab64fC4E86C765eFaB4Dd";

// kalau nanti ada token utama (misalnya GIC), bisa tambahkan juga
export const GICOIN_ADDRESS = "0x226a72C33cbc9cfbB8f4af3f528254B5BF303579";

// chain config (opsional, kalau pakai wagmi config khusus)
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
//export const CHAIN_ID = 97: { // BSC Testnet (legacy, can be removed after mainnet stable)

