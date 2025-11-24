// components/governance/StatusBadge.tsx

export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Active": "bg-green-100 text-green-700",
    "Voting Closed": "bg-gray-200 text-gray-700",
    "Executed": "bg-purple-100 text-purple-700",
    "Pending Execution": "bg-yellow-100 text-yellow-700",
    "Failed": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
