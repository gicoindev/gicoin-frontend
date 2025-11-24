// src/config/events.ts
import { parseAbiItem } from "viem"

export const events = {
  governance: {
    proposalCreated: parseAbiItem("event ProposalCreated(uint256 indexed proposalId, string description, uint256 startTime, uint256 endTime)"),
    voted: parseAbiItem("event Voted(address indexed voter, uint256 indexed proposalId, bool support)"),
    votingClosed: parseAbiItem("event VotingClosed(uint256 indexed proposalId, bool quorumReached)"),
    proposalExecuted: parseAbiItem("event ProposalExecuted(uint256 indexed proposalId, bool approved, uint256 votesFor, uint256 votesAgainst, bool autoExecuted)"),
    quorumUpdated: parseAbiItem("event QuorumPercentageUpdated(uint256 newQuorumPercentage)"),
  },
  staking: {
    staked: parseAbiItem("event Staked(address indexed user, uint256 amount)"),
    unstaked: parseAbiItem("event Unstaked(address indexed user, uint256 amount, uint256 reward)"),
    rewardCalculated: parseAbiItem("event RewardCalculated(address indexed staker, uint256 rewardAmount)"),
    rewardClaimed: parseAbiItem("event RewardClaimed(address indexed user, uint256 amount)"),
  },
  airdrop: {
    registered: parseAbiItem("event AirdropRegistered(address indexed user)"),
    claimed: parseAbiItem("event AirdropClaimed(address indexed user, uint256 amount, bytes32 merkleRoot)"),
    failed: parseAbiItem("event AirdropClaimFailed(address indexed user, uint256 amount, string failureReason)"),
  },
  tax: {
    rateChanged: parseAbiItem("event TaxRateChanged(uint256 oldRate, uint256 newRate, uint256 timestamp)"),
    applied: parseAbiItem("event TransferTaxApplied(address indexed sender, address indexed recipient, uint256 taxAmount, uint256 amountAfterTax)"),
    withoutTax: parseAbiItem("event TransferWithoutTax(address indexed sender, address indexed recipient, uint256 amount)"),
    walletUpdated: parseAbiItem("event TaxWalletUpdated(address indexed newTaxWallet)"),
  },
  system: {
    paused: parseAbiItem("event PausedStatusChanged(bool isPaused)"),
    maxTxUpdated: parseAbiItem("event MaxTransactionLimitUpdated(uint256 newLimit)"),
    blacklistChanged: parseAbiItem("event BlacklistStatusChanged(address indexed account, bool isBlacklisted)"),
  }
}
