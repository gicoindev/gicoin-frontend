// src/lib/chains.ts
export async function getChainId(): Promise<number | null> {
  if (typeof window === "undefined") return null;

  const eth = (window as any).ethereum;
  if (!eth || typeof eth.request !== "function") return null;

  try {
    const chainHex = await eth.request({ method: "eth_chainId" });

    // chainHex possible formats: "0x38", "0x61", or number
    let chainId: number | null = null;

    if (typeof chainHex === "string") {
      chainId = parseInt(chainHex, 16);
    } else if (typeof chainHex === "number") {
      chainId = chainHex;
    }

    return Number.isFinite(chainId) ? chainId : null;
  } catch (err) {
    console.error("Failed to get chainId:", err);
    return null;
  }
}
