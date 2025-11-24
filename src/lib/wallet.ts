// src/lib/wallet.ts
import { wagmiConfig } from "@/lib/wagmi";

/* =====================================================
   ✅ Re-export config agar konsisten di seluruh app
===================================================== */
export { wagmiConfig };

/* =====================================================
   🧩 Error Parser Utility (support custom Gicoin errors)
===================================================== */
export function parseErrorMessage(err: any): string {
  let reason = "";

  // ethers v6
  if (err.reason) reason = err.reason;
  // ethers v5
  else if (err.error && err.error.message) reason = err.error.message;
  // raw message
  else if (err.message) reason = err.message;
  // kalau string langsung
  else if (typeof err === "string") reason = err;
  else reason = "Transaction failed";

  // 🧠 Bersihin prefix error agar lebih clean
  reason = reason.replace("execution reverted: ", "").replace("VM Exception while processing transaction: ", "");

  /* =====================================================
     🎯 Mapping dari kode error di kontrak Gicoin.sol
  ===================================================== */
  const map: Record<string, string> = {
    E11: "Jumlah staking harus lebih dari 0 ⚠️",
    E12: "Saldo GIC kamu tidak cukup 💰",
    E13: "Belum mencapai jumlah minimum staking ❌",
    E14: "Kamu masih punya staking aktif ⏳",
    E15: "Jumlah unstake harus lebih dari 0 ⚠️",
    E16: "Unstake harus sesuai total staked amount 💡",
    E17: "Reward pool wallet belum diset 🏦",
    E18: "Belum 30 hari sejak staking terakhir ⏳",
    E19: "Saldo reward pool tidak cukup 💸",
    E20: "Saldo kontrak staking tidak cukup ❌",
    E21: "Tujuan drain tidak boleh kosong ⚠️",
    E22: "Jumlah drain harus > 0 ⚠️",
    E23: "Saldo tidak cukup untuk drain ❌",
    E24: "Jumlah top-up reward harus > 0 ⚠️",
    E25: "Jumlah klaim reward harus > 0 ⚠️",
    E26: "Kamu belum staking apa pun ❌",
    E27: "Belum 30 hari sejak claim terakhir ⏳",
    E28: "Jumlah claim melebihi reward tersedia ⚠️",
    E29: "Reward pool tidak cukup untuk claim 💸",
    E30: "Reward pool wallet tidak valid ⚠️",
    E31: "Jumlah transfer pool harus > 0 ⚠️",
    E32: "Reward pool tidak cukup untuk transfer 💸",
    E33: "Alamat tujuan transfer tidak valid ⚠️",
    E34: "Alamat pengirim tidak valid ❌",
    E35: "Alamat penerima tidak valid ❌",
    E36: "Akun kamu diblacklist 🚫",
    E37: "Melebihi batas maksimum transaksi ❌",
    "Pausable: paused": "Kontrak sedang dijeda ⏸️",
  };

  for (const [key, msg] of Object.entries(map)) {
    if (reason.includes(key)) return msg;
  }

  // 🌐 Error umum lainnya
  if (reason.includes("insufficient funds")) return "Saldo kamu tidak cukup untuk gas fee ⛽";
  if (reason.includes("user rejected")) return "Transaksi dibatalkan oleh user 🙅";
  if (reason.includes("execution reverted")) return "Transaksi dibatalkan di blockchain ❌";
  if (reason.includes("missing revert data")) return "Transaksi gagal tanpa pesan (cek gas limit atau RPC) ⚙️";

  // fallback
  return reason || "Terjadi kesalahan saat transaksi ⚠️";
}
