"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Progress } from "@/components/ui/progress";
import { Clock, Loader2 } from "lucide-react";
import { useState } from "react";

interface ProposalProps {
  id: number;
  title: string;
  forVotes: number;
  againstVotes: number;
  deadline: string;
  onVoteYes?: () => Promise<void> | void;
  onVoteNo?: () => Promise<void> | void;
}

export function GovernanceProposalCard({
  id,
  title,
  forVotes,
  againstVotes,
  deadline,
  onVoteYes,
  onVoteNo,
}: ProposalProps) {
  const [loadingVote, setLoadingVote] = useState<"yes" | "no" | null>(null);

  const totalVotes = forVotes + againstVotes;
  const forPercent = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

  const handleVote = async (support: boolean) => {
    try {
      setLoadingVote(support ? "yes" : "no");
      if (support && onVoteYes) await onVoteYes();
      if (!support && onVoteNo) await onVoteNo();
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setLoadingVote(null);
    }
  };

  return (
    <CardGold
      title={`Proposal #${id}: ${title}`}
      className="flex flex-col justify-between transition duration-200 hover:shadow-lg hover:shadow-purple-500/20 w-full p-3 sm:p-6"
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span className="text-green-400">For: {forVotes}</span>
            <span className="text-red-400">Against: {againstVotes}</span>
          </div>
          <Progress value={forPercent} className="h-2 bg-red-500" />
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm">
          <Clock size={14} />
          <span>{deadline}</span>
        </div>

        {/* Vote Buttons */}
        <div className="flex gap-3 mt-2">
          <ButtonGold
            onClick={() => handleVote(true)}
            disabled={loadingVote !== null}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
          >
            {loadingVote === "yes" ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              "Vote YES"
            )}
          </ButtonGold>

          <ButtonGold
            onClick={() => handleVote(false)}
            disabled={loadingVote !== null}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            {loadingVote === "no" ? (
              <Loader2 className="animate-spin size-4" />
            ) : (
              "Vote NO"
            )}
          </ButtonGold>
        </div>
      </div>
    </CardGold>
  );
}
