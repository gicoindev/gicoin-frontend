// src/components/staking/StakingAnalytics.tsx
"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const dummyChart = [
  { day: "Day 1", reward: 0 },
  { day: "Day 5", reward: 5 },
  { day: "Day 10", reward: 12 },
  { day: "Day 15", reward: 20 },
  { day: "Day 20", reward: 28 },
];

export default function StakingAnalytics() {
  return (
    <div className="w-full mx-auto bg-gray-800 p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Reward Growth</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dummyChart}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="day" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="reward"
            stroke="#facc15"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
