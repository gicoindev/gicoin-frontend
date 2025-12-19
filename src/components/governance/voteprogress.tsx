// components/governance/VoteProgress.tsx
interface VoteProgressProps {
  votesFor: number;
  votesAgainst: number;
  quorumPercent?: number;
}

export default function VoteProgress({
  votesFor,
  votesAgainst,
  quorumPercent = 50,
}: VoteProgressProps) {
  const total = votesFor + votesAgainst;
  const yesPercentNum = total > 0 ? (votesFor / total) * 100 : 0;
  const noPercentNum = total > 0 ? (votesAgainst / total) * 100 : 0;

  const yesPercent = yesPercentNum.toFixed(1);
  const noPercent = noPercentNum.toFixed(1);

  const quorumReached = yesPercentNum >= quorumPercent;

  return (
    <div className="space-y-2">
      {/* Persentase & count vote */}
      <div className="flex justify-between text-xs sm:text-sm font-medium">
        <span className="text-green-400">
          ✅ YES {yesPercent}% ({votesFor})
        </span>
        <span className="text-red-400">
          ❌ NO {noPercent}% ({votesAgainst})
        </span>
      </div>

      {/* Progress Bar with quorum marker */}
      <div className="relative w-full bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden flex">
        {/* YES */}
        <div
          className="bg-green-500 h-full transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        ></div>
        {/* NO */}
        <div
          className="bg-red-500 h-full transition-all duration-500"
          style={{ width: `${noPercent}%` }}
        ></div>

        {/* Quorum Marker + Tooltip */}
        <div
          className="absolute top-0 bottom-0 w-0.5 group"
          style={{ left: `${quorumPercent}%` }}
        >
          <div
            className={`h-full ${
              quorumReached ? "bg-green-400" : "bg-yellow-400 animate-pulse"
            }`}
          ></div>

          {/* Tooltip always display */}
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md text-xs bg-black text-white"
          >
            Quorum {quorumPercent}%
          </div>
        </div>
      </div>

      {/* Total Votes + Quorum Info */}
      <div className="flex justify-between text-xs text-gray-400">
        <p>Total Votes: {total}</p>
        <p>
          Quorum Target: {quorumPercent}%{" "}
          {quorumReached ? "✅ Reached" : "⚠️ Not yet"}
        </p>
      </div>
    </div>
  );
}
