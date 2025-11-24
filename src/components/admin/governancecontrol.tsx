"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GovernanceControl() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Quorum Percentage (%)" type="number" />
        <Button>Update Quorum</Button>
        <Input placeholder="Proposal ID" type="number" />
        <Button variant="secondary">Close Proposal</Button>
      </CardContent>
    </Card>
  );
}
