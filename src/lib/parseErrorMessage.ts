export function parseErrorMessage(err: any): string {
    let reason = "";
  
    if (err.reason) reason = err.reason;
    else if (err.error && err.error.message) reason = err.error.message;
    else if (typeof err === "string") reason = err;
    else reason = "Transaction failed";
  
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
  
    return "Terjadi kesalahan saat transaksi. Coba lagi.";
  }
  