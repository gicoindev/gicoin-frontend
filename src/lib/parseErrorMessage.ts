export function parseErrorMessage(err: any): string {
    let reason = "";
  
    // ethers v6
    if (err.reason) reason = err.reason;
    // ethers v5
    else if (err.error && err.error.message) reason = err.error.message;
    // kalau string langsung
    else if (typeof err === "string") reason = err;
    else reason = "Transaction failed";
  
    // mapping custom ke user-friendly
    if (reason.includes("Already registered")) {
      return "Kamu sudah terdaftar di airdrop ✅";
    }
    if (reason.includes("Not found in Merkle")) {
      return "Alamat kamu tidak ada di whitelist ❌";
    }
    if (reason.includes("insufficient funds")) {
      return "Saldo kamu tidak cukup untuk gas fee ⛽";
    }
    if (reason.includes("user rejected")) {
      return "Transaksi dibatalkan oleh user 🙅";
    }
  
    // fallback
    return "Terjadi kesalahan saat transaksi. Coba lagi.";
  }
  