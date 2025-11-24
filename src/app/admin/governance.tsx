"use client";

import { ButtonGold } from "@/components/ui/button-gold";
import { CardGold } from "@/components/ui/card-gold";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function Governance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<string[]>([]);
  const [executed, setExecuted] = useState<string[]>([]);

  // fake load proposals
  useEffect(() => {
    const timer = setTimeout(() => {
      setProposals([
        "Proposal #1: Update Tax",
        "Proposal #2: Add Staking Pool",
      ]);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleExecute = (title: string) => {
    setExecuted((prev) => [...prev, title]);
    toast({ title: "⚡ Executed", description: title });
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Proposal List */}
      <CardGold title="Proposal List">
        <div className="space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-6 w-full bg-zinc-800" />
              <Skeleton className="h-6 w-3/4 bg-zinc-800" />
            </>
          ) : proposals.length === 0 ? (
            <p className="text-zinc-500 text-sm">No proposals found.</p>
          ) : (
            proposals.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-zinc-800 pb-2"
              >
                <p className={executed.includes(p) ? "line-through text-zinc-500" : ""}>
                  {p}
                </p>
                  <ButtonGold
                    onClick={() => handleExecute(p)}
                    disabled={executed.includes(p)}
                  >
                  {executed.includes(p) ? "Done" : "Execute"}
                </ButtonGold>
              </div>
            ))
          )}
        </div>
      </CardGold>

      {/* Event Log */}
      <CardGold title="Event Log">
        <p className="text-zinc-400 text-sm">[Log placeholder]</p>
      </CardGold>

      {/* Execute Proposal (manual trigger) */}
      <CardGold title="Execute Proposal">
        <ButtonGold
          onClick={() =>
            toast({
              title: "⚡ Manual Execute",
              description: "Executed dummy proposal",
            })
          }
        >
          Run Execution
        </ButtonGold>
      </CardGold>
    </div>
  );
}
