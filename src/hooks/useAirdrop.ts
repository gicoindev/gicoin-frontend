"use client"

import { useContracts } from "@/config/contracts"
import { getPublicClient } from "@wagmi/core"
import { useState } from "react"
import type { Abi, Hash, Log } from "viem"
import {
  useAccount,
  useConfig,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi"

export function useAirdrop() {
  const { address } = useAccount()
  const config = useConfig()
  const { gicoin } = useContracts()
  const { writeContractAsync } = useWriteContract()

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // ==========================================================
  // 📊 Read Airdrop Status
  // ==========================================================
  const { data: airdropStatus } = useReadContract({
    abi: gicoin.abi as Abi,
    address: gicoin.address,
    functionName: "getAirdropStatus",
    args: [address],
  })

  const claimed = Array.isArray(airdropStatus) ? airdropStatus[0] : undefined
  const poolBalance = Array.isArray(airdropStatus) ? airdropStatus[1] : undefined

  // ==========================================================
  // ✍️ WRITE FUNCTIONS
  // ==========================================================
  async function registerAirdrop(): Promise<Hash> {
    setLoading(true)
    try {
      return await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "registerAirdrop",
      })
    } finally {
      setLoading(false)
    }
  }

  async function claimAirdrop(amount: bigint, proof: readonly `0x${string}`[]): Promise<Hash> {
    setLoading(true)
    try {
      return await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "claimAirdrop",
        args: [amount, proof],
      })
    } finally {
      setLoading(false)
    }
  }

  async function claimAirdropWithWhitelist(amount: bigint): Promise<Hash> {
    setLoading(true)
    try {
      return await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "claimAirdropWithWhitelist",
        args: [amount],
      })
    } finally {
      setLoading(false)
    }
  }

  async function claimAirdropWithMerkleProof(
    amount: bigint,
    proof: readonly `0x${string}`[]
  ): Promise<Hash> {
    setLoading(true)
    try {
      return await writeContractAsync({
        address: gicoin.address,
        abi: gicoin.abi,
        functionName: "claimAirdropWithMerkleProof",
        args: [amount, proof],
      })
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // 🚀 Auto-detect Eligibility (UX improvement)
  // ==========================================================
  async function autoClaim(
    amount: bigint,
    whitelist: boolean,
    merkleProof?: readonly `0x${string}`[]
  ): Promise<Hash> {
    if (whitelist) {
      return await claimAirdropWithWhitelist(amount)
    } else if (merkleProof && merkleProof.length > 0) {
      return await claimAirdropWithMerkleProof(amount, merkleProof)
    } else {
      return await claimAirdrop(amount, [])
    }
  }

  // ==========================================================
  // 🛰️ Event Watcher
  // ==========================================================
  const handleLogs = async (eventName: string, logs: Log[]) => {
    const publicClient = getPublicClient(config)!;
    const mapped = await Promise.all(
      logs.map(async (l) => {
        let blockTimestamp: number | undefined
        try {
          if (l.blockNumber != null) {
            const block = await publicClient.getBlock({ blockNumber: l.blockNumber })
            blockTimestamp = Number(block.timestamp)
          }
        } catch {}
        return {
          type: eventName,
          detail: l,
          blockTimestamp,
          time: new Date().toISOString(),
        }
      })
    )
    setEvents((prev) => [...prev, ...mapped].slice(-100))
  }

  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    eventName: "AirdropRegistered",
    onLogs: (logs) => handleLogs("AirdropRegistered", logs),
  })

  useWatchContractEvent({
    address: gicoin.address,
    abi: gicoin.abi as Abi,
    eventName: "AirdropClaimed",
    onLogs: (logs) => handleLogs("AirdropClaimed", logs),
  })

  // ==========================================================
  // 📦 Return Values
  // ==========================================================
  return {
    airdropStatus,
    claimed,
    poolBalance,
    registerAirdrop,
    claimAirdrop,
    claimAirdropWithWhitelist,
    claimAirdropWithMerkleProof,
    autoClaim,
    events,
    loading,
  }
}
