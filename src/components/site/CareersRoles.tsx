"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";

/**
 * Open roles with team filter chips (DESIGN.md §9.8). No roles are confirmed,
 * so every filter shows the empty state with the confirmed email address.
 */
export function CareersRoles({
  teams,
  empty,
}: {
  teams: readonly string[];
  empty: { title: string; body: string; email: string };
}) {
  const [team, setTeam] = useState(teams[0]);
  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Filter by team" className="flex flex-wrap gap-2">
        {teams.map((t) => (
          <Chip key={t} selected={team === t} onClick={() => setTeam(t)}>
            {t}
          </Chip>
        ))}
      </div>
      <div aria-live="polite">
        <EmptyState
          tone="brand"
          icon={<Briefcase strokeWidth={1.8} />}
          title={team === teams[0] ? empty.title : `No ${team.toLowerCase()} roles open right now.`}
          body={empty.body}
          action={
            <ButtonLink href={`mailto:${empty.email}`} variant="outline">
              Email {empty.email}
            </ButtonLink>
          }
          className="rounded-panel bg-mist"
        />
      </div>
    </div>
  );
}
