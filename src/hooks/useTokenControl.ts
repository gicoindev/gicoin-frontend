"use client";

import { useContracts } from "@/config/contracts";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { parseUnits, type Abi, type Hash } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";

/**
 * =============================================================================
 * 🔥 useTokenControl — Full Admin Hook for GICO Token
 * Matches 100% with Gicoin.sol (all owner/admin functions mapped properly)
 * =============================================================================
 */
export function useTokenControl() {
  const { gicoin } = useContracts();
  const { address, chain } = useAccount();
  const client = usePublicClient();
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();

  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string>("0x0");

  // ============================================================================
  // 🧠 CHECK OWNER
  // ============================================================================
  const ownerQuery = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "owner",
  });

  useEffect(() => {
    if (ownerQuery.data) {
      const owner = ownerQuery.data.toString();
      setOwnerAddress(owner);
      setIsOwner(owner.toLowerCase() === address?.toLowerCase());
    }
  }, [ownerQuery.data, address]);

  // ============================================================================
  // 🧰 SAFE CALL WRAPPER
  // ============================================================================
  async function callContract(fn: string, args: any[]): Promise<Hash | undefined> {
    try {
      const tx = await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi as Abi,
        functionName: fn,
        args,
      });

      console.log(`✅ ${fn} executed:`, tx);
      return tx;
    } catch (err: any) {
      console.error(`❌ ${fn} failed:`, err);
      throw new Error(err?.shortMessage || err?.message || "Transaction failed");
    }
  }

  // ============================================================================
  // 💰 TOKEN ADMIN (Mint / Burn / Tax / Limits)
  // ============================================================================
  async function mint(to: string, amount: string) {
    if (!isOwner) throw new Error("Only owner can mint");
    const tx = await callContract("mint", [to, parseUnits(amount, 18)]);
    toast({ title: "✔ Mint Success", description: `Tx: ${tx}` });
    return tx;
  }

  async function burn(from: string, amount: string) {
    if (!isOwner) throw new Error("Only owner can burn");
    const tx = await callContract("burn", [from, parseUnits(amount, 18)]);
    toast({ title: "🔥 Burn Success", description: `Tx: ${tx}` });
    return tx;
  }

  async function setTaxRate(rate: string) {
    if (!isOwner) throw new Error("Only owner can update tax rate");
    const tx = await callContract("setTaxRate", [BigInt(rate)]);
    toast({ title: "💰 Tax Rate Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function setTaxWallet(wallet: string) {
    if (!isOwner) throw new Error("Only owner can update tax wallet");
    const tx = await callContract("setTaxWallet", [wallet]);
    toast({ title: "🏦 Tax Wallet Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function updateMaxTransactionLimit(limit: string) {
    if (!isOwner) throw new Error("Only owner can modify limits");
    const tx = await callContract("updateMaxTransactionLimit", [BigInt(limit)]);
    toast({ title: "📏 Max Tx Limit Updated", description: `Tx: ${tx}` });
    return tx;
  }

  // ============================================================================
  // 🎁 REWARD POOL ADMIN
  // ============================================================================
  async function topUpRewardPool(amount: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("topUpRewardPool", [parseUnits(amount, 18)]);
    toast({ title: "💰 Reward Pool Topped Up", description: `Tx: ${tx}` });
    return tx;
  }

  async function mintRewardPool(amount: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("mintRewardPool", [parseUnits(amount, 18)]);
    toast({ title: "🪙 Reward Pool Minted", description: `Tx: ${tx}` });
    return tx;
  }

  async function updateRewardPool(amount: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("updateRewardPool", [BigInt(amount)]);
    toast({ title: "🔧 Reward Pool Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function setRewardPoolWallet(wallet: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setRewardPoolWallet", [wallet]);
    toast({ title: "🏦 Reward Pool Wallet Updated", description: `Tx: ${tx}` });
    return tx;
  }

  // ============================================================================
  // 🏦 STAKING ADMIN
  // ============================================================================
  async function setMinStakeAmount(amount: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setMinStakeAmount", [parseUnits(amount, 18)]);
    toast({ title: "📌 Min Stake Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function setStakingTime(user: string, newTime: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setStakingTime", [user, BigInt(newTime)]);
    toast({ title: "⏱ Staking Time Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function updateRewardRate(rate: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("updateRewardRate", [BigInt(rate)]);
    toast({ title: "🎯 Reward Rate Updated", description: `Tx: ${tx}` });
    return tx;
  }

  // ============================================================================
  // 🎁 AIRDROP ADMIN
  // ============================================================================
  async function setAirdrop(user: string, amount: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setAirdrop", [user, BigInt(amount)]);
    toast({ title: "🎉 Airdrop Assigned", description: `Tx: ${tx}` });
    return tx;
  }

  async function setAirdropTaxExempt(user: string, amount: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setAirdropTaxExempt", [user, BigInt(amount)]);
    toast({ title: "🛡 Airdrop Exempt Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function setWhitelist(user: string, status: boolean) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setWhitelist", [user, status]);
    toast({ title: "📋 Whitelist Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function batchSetWhitelist(users: string[], statuses: boolean[]) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("batchSetWhitelist", [users, statuses]);
    toast({ title: "📋 Batch Whitelist Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function batchAddToBlacklist(users: string[]) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("batchAddToBlacklist", [users]);
    toast({ title: "⛔ Blacklist Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function batchRemoveFromBlacklist(users: string[]) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("batchRemoveFromBlacklist", [users]);
    toast({ title: "✔ Removed from Blacklist", description: `Tx: ${tx}` });
    return tx;
  }

  // ============================================================================
  // 🏛 GOVERNANCE ADMIN
  // ============================================================================
  async function setQuorumPercentage(percent: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setQuorumPercentage", [BigInt(percent)]);
    toast({ title: "📊 Quorum Updated", description: `Tx: ${tx}` });
    return tx;
  }

  async function setProposalTimes(id: string, start: string, end: string) {
    if (!isOwner) throw new Error("Only owner");
    const tx = await callContract("setProposalTimes", [
      BigInt(id),
      BigInt(start),
      BigInt(end),
    ]);
    toast({ title: "🗳 Proposal Time Updated", description: `Tx: ${tx}` });
    return tx;
  }

  // ============================================================================
  // 🔌 NETWORK CONNECTION CHECKER
  // ============================================================================
  async function checkConnection() {
    try {
      if (!client) throw new Error("No public client available.");
  
      const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  
      if (chain?.id !== EXPECTED_CHAIN_ID) {
        throw new Error(
          `Wrong network: please switch to ${
            EXPECTED_CHAIN_ID === 56 ? "BSC Mainnet" : "BSC Testnet"
          }.`
        );
      }
  
      const owner = await client.readContract({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "owner",
      });
  
      toast({
        title: "🟢 Connected to GICO",
        description: `Owner: ${owner}`,
      });
  
      return { address: gicoin.address, owner };
    } catch (err: any) {
      toast({
        title: "🔴 Contract Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  }
  
  // ============================================================================
  // 🔁 RETURN EXPORT API
  // ============================================================================
  return {
    isOwner,
    ownerAddress,

    // TOKEN
    mint,
    burn,
    setTaxRate,
    setTaxWallet,
    updateMaxTransactionLimit,

    // REWARD POOL
    topUpRewardPool,
    mintRewardPool,
    updateRewardPool,
    setRewardPoolWallet,

    // STAKING
    setMinStakeAmount,
    setStakingTime,
    updateRewardRate,

    // AIRDROP
    setAirdrop,
    setAirdropTaxExempt,
    setWhitelist,
    batchSetWhitelist,
    batchAddToBlacklist,
    batchRemoveFromBlacklist,

    // GOVERNANCE
    setQuorumPercentage,
    setProposalTimes,

    // UTIL
    checkConnection,
  };
}
