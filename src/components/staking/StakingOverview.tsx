// src/components/staking/StakingOverview.tsx
"use client";

import { motion } from "framer-motion";

type Props = {
  balance: string;
  staked: string;
  reward: string;
  apr: string;
};

/**
 * ✅ StakingOverview
 * - Displays live staking summary
 * - Reacts to event updates with a glow pulse
 * - Smooth framer-motion animation for better UX
 * - Added rounding & localized number formatting
 */
export default function StakingOverview({
  balance,
  staked,
  reward,
  apr,
}: Props) {
  // Helper to format numbers with up to 4 decimal places
  const formatNumber = (value: string) =>
    Number(value).toLocaleString(undefined, { 
      maximumFractionDigits: 4,
    });

  return (
    <motion.div
      id="staking-overview"
      className="relative bg-gray-800/80 backdrop-blur p-6 rounded-2xl shadow-lg space-y-4 transition-all duration-500 border border-gray-700"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      {/* Subtle animated glow when event triggers */}
      <div className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none animate-glow" />

      <div className="flex justify-between text-sm text-gray-300">
        <span>Balance</span>
        <span className="font-medium text-white">
          {formatNumber(balance)} GIC
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-300">
        <span>Staked</span>
        <span className="font-medium text-white">
          {formatNumber(staked)} GIC
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-300">
        <span>Reward</span>
        <span className="font-medium text-emerald-400">
          {formatNumber(reward)} GIC
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-300">
        <span>APR</span>
        <span className="font-medium text-yellow-400">
          {formatNumber(apr)}%
        </span>
      </div>
    </motion.div>
  );
}
