"use client";

type Props = {
  onStake: () => void;
  onUnstake: () => void;
  onClaim: () => void;
  canUnstake: boolean;
  canClaim: boolean;
  loading?: boolean; // ✅ tambahan baru
};

export default function StakingActionBar({
  onStake,
  onUnstake,
  onClaim,
  canUnstake,
  canClaim,
  loading = false,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-950 p-4 flex gap-2 border-t border-gray-800 z-50">
      {/* STAKE BUTTON */}
      <button
        onClick={onStake}
        disabled={loading}
        className={`flex-1 py-2 rounded-xl transition ${
          loading
            ? "bg-gray-600 cursor-not-allowed text-gray-300"
            : "bg-green-600 hover:bg-green-700 active:scale-95 text-white"
        }`}
      >
        {loading ? "Processing..." : "Stake"}
      </button>

      {/* UNSTAKE BUTTON */}
      <button
        onClick={onUnstake}
        disabled={!canUnstake || loading}
        className={`flex-1 py-2 rounded-xl transition ${
          canUnstake && !loading
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-gray-600 cursor-not-allowed text-gray-300"
        }`}
      >
        {!canUnstake ? "Locked 🔒" : loading ? "Processing..." : "Unstake"}
      </button>

      {/* CLAIM BUTTON */}
      <button
        onClick={onClaim}
        disabled={!canClaim || loading}
        className={`flex-1 py-2 rounded-xl transition ${
          canClaim && !loading
            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
            : "bg-gray-600 cursor-not-allowed text-gray-300"
        }`}
      >
        {!canClaim ? "Wait ⏳" : loading ? "Processing..." : "Claim"}
      </button>
    </div>
  );
}
