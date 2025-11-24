"use client";

import AIRDROP_ABI from "@/abis/Gicoin-latest.json";
import { AIRDROP_ADDRESS } from "@/lib/constants";
import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";

// === Hooks/Logic Module ===
export function useAirdropModule() {
  const { address, isConnected } = useAccount();

  // --- State ---
  const [amount, setAmount] = useState<string>("0");
  const [proof, setProof] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string>("");

  // --- Read Airdrop Status ---
  const { data: status } = useReadContract({
    address: AIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "getAirdropStatus",
    args: address ? [address] : undefined,
  }) as { data: [boolean, bigint] | undefined };

  // --- Register Airdrop ---
  const { writeContract: register, data: regTx } = useWriteContract();
  const { isSuccess: regSuccess, isLoading: regLoading } =
    useWaitForTransactionReceipt({ hash: regTx });

  // --- Claim Merkle Proof ---
  const { writeContract: claimMerkle, data: merkleTx } = useWriteContract();
  const { isSuccess: merkleSuccess, isLoading: merkleLoading } =
    useWaitForTransactionReceipt({ hash: merkleTx });

  // --- Claim Whitelist ---
  const { writeContract: claimWhitelist, data: wlTx } = useWriteContract();
  const { isSuccess: wlSuccess, isLoading: wlLoading } =
    useWaitForTransactionReceipt({ hash: wlTx });

  // --- Event Listener ---
  useWatchContractEvent({
    address: AIRDROP_ADDRESS,
    abi: AIRDROP_ABI,
    eventName: "AirdropClaimed",
    onLogs(logs) {
      console.log("📡 Event AirdropClaimed:", logs);
    },
  });

  // --- Handlers ---
  const handleRegister = () => {
    if (!isConnected) return;
    register({
      address: AIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: "registerAirdrop",
    });
  };

  const handleClaimMerkle = () => {
    if (!isConnected) return;
    claimMerkle({
      address: AIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: "claimAirdropWithMerkleProof",
      args: [BigInt(amount), proof],
    });
  };

  const handleClaimWhitelist = () => {
    if (!isConnected) return;
    claimWhitelist({
      address: AIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: "claimAirdropWithWhitelist",
      args: [BigInt(amount)],
    });
  };

  return {
    // account
    address,
    isConnected,

    // state
    amount,
    setAmount,
    proof,
    setProof,
    txHash,
    setTxHash,

    // status
    status,

    // register
    handleRegister,
    regSuccess,
    regLoading,

    // claim merkle
    handleClaimMerkle,
    merkleSuccess,
    merkleLoading,

    // claim whitelist
    handleClaimWhitelist,
    wlSuccess,
    wlLoading,
  };
}
