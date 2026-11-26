"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserPlus, UserMinus } from "lucide-react";
import { Avatar } from "@/components/chat/Avatar";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable, type Column, type TableState } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { useToast } from "@/components/Toast";
import { inviteManager, listActivity, listTeam, PortalError, removeTeamMember, resetPortalStore } from "@/lib/data";
import { formatDate, formatDayTime } from "@/lib/data/format";
import type { PortalStaff } from "@/lib/data/types";
import { ROLE_LABEL, ROLE_SUMMARY, SESSION_COOKIE, SESSION_PATH } from "@/lib/portal-access";
import { cn } from "@/lib/cn";
import { RoleBadge } from "./PortalShell";
import { AccessDenied, PageHeader } from "./ui";
import { usePortal, useLoad } from "./session";

const statusLabel: Record<PortalStaff["status"], string> = { active: "Active", invited: "Invite sent", removed: "Removed" };

/**
 * Team (DESIGN.md §10.2, two levels for now): who can sign in, at which level,
 * inviting and removing managers, and the activity log of who did what.
 * Super admins only; the proxy also keeps managers out.
 */
export function Team() {
  const { session, staff: me, can } = usePortal();
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = params.get("tab") === "activity" ? "activity" : "team";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<PortalStaff | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const allowed = can("manage_team");
  const team = useLoad(() => (allowed ? listTeam(session) : Promise.resolve([])), [session.staffId, allowed]);
  const log = useLoad(() => (allowed ? listActivity(session) : Promise.resolve([])), [session.staffId, allowed, tab]);

  if (!allowed) return <AccessDenied what="manage the team" />;

  const members = (team.data ?? []).filter((m) => m.status !== "removed");
  const former = (team.data ?? []).filter((m) => m.status === "removed");
  const teamState: TableState = team.state === "loading" ? "loading" : team.state === "error" ? "error" : "ready";

  const columns: Column<PortalStaff>[] = [
    {
      key: "name",
      header: "Name",
      mobile: "primary",
      cell: (m) => (
        <span className="flex items-center gap-3">
          <Avatar sender={{ name: m.name }} size="md" decorative />
          <span className="min-w-0">
            <span className="block font-semibold">
              {m.name}
              {m.id === me.id && <span className="ml-1.5 font-normal text-ink-500">(you)</span>}
            </span>
            <span className="block text-meta text-ink-500">{m.email}</span>
          </span>
        </span>
      ),
    },
    { key: "role", header: "Level", mobile: "primary", cell: (m) => <RoleBadge role={m.role} /> },
    {
      key: "status",
      header: "Status",
      mobile: "secondary",
      cell: (m) => <span className={cn(m.status === "invited" ? "text-warn-700" : "text-ink-900")}>{statusLabel[m.status]}</span>,
    },
    {
      key: "last",
      header: "Last signed in",
      mobile: "secondary",
      cell: (m) => (m.lastSignInAt ? formatDayTime(m.lastSignInAt) : "Not yet"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      mobile: "secondary",
      cell: (m) =>
        m.role === "manager" ? (
          <Button variant="ghost" size="sm" onClick={() => setRemoving(m)} icon={<UserMinus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
            Remove<span className="sr-only"> {m.name}</span>
          </Button>
        ) : (
          <span className="text-meta text-ink-500">Changed by Buzz support</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Team"
        meta="Who can sign in to this portal, and what they've done."
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)} icon={<UserPlus aria-hidden="true" className="size-4" strokeWidth={1.8} />}>
            Invite manager
          </Button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => router.replace(v === "activity" ? `${pathname}?tab=activity` : pathname, { scroll: false })}
      >
        <TabsList aria-label="Team sections">
          <TabsTrigger value="team" count={team.state === "ready" ? members.length : undefined}>
            People
          </TabsTrigger>
          <TabsTrigger value="activity">Activity log</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <DataTable
            caption="Team members"
            columns={columns}
            rows={members}
            getRowId={(m) => m.id}
            state={teamState}
            onRetry={team.reload}
          />

          <dl className="mt-6 grid gap-px overflow-hidden rounded-field border border-line bg-line md:grid-cols-2">
            {(["super_admin", "manager"] as const).map((r) => (
              <div key={r} className="bg-white px-5 py-4">
                <dt className="text-[15px] font-semibold text-ink-900">{ROLE_LABEL[r]}</dt>
                <dd className="mt-1 text-ui text-ink-700">{ROLE_SUMMARY[r]}</dd>
              </div>
            ))}
          </dl>

          {former.length > 0 && (
            <details className="mt-6 rounded-field border border-line bg-white">
              <summary className="flex min-h-12 cursor-pointer items-center px-5 text-ui font-medium text-ink-900">
                Former team members ({former.length})
              </summary>
              <ul className="divide-y divide-line border-t border-line">
                {former.map((m) => (
                  <li key={m.id} className="px-5 py-3 text-ui">
                    <span className="text-ink-900">{m.name}</span>{" "}
                    <span className="text-ink-500">
                      ({m.email}), removed {m.removedAt ? formatDate(m.removedAt) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-10 border-t border-line pt-5">
            <h2 className="text-[15px] font-semibold text-ink-900">Test data</h2>
            <p className="mt-1 max-w-[40em] text-ui text-ink-700">
              Changes you make here are kept in this browser tab only. Reset to put the seed riders, team and log back.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setResetOpen(true)}>
              Reset test data
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          {log.state === "loading" ? (
            <DataTable caption="Activity log" columns={[{ key: "a", header: "Activity", cell: () => null }]} rows={[]} getRowId={() => ""} state="loading" />
          ) : log.state === "error" ? (
            <DataTable caption="Activity log" columns={[]} rows={[]} getRowId={() => ""} state="error" onRetry={log.reload} />
          ) : (
            <ol className="divide-y divide-line rounded-field border border-line bg-white">
              {(log.data ?? []).map((a) => (
                <li key={a.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center sm:gap-6">
                  <p className="text-ui text-ink-900">
                    <span className="font-semibold">{a.actorName}</span> {a.summary.charAt(0).toLowerCase() + a.summary.slice(1)}
                  </p>
                  <p className="text-meta text-ink-500 tabular-nums sm:text-right">{formatDayTime(a.at)}</p>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-meta text-ink-500">Every sign-in and every rider or team change is recorded with who did it.</p>
        </TabsContent>
      </Tabs>

      <InviteDrawer
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={async (name, email) => {
          const m = await inviteManager(session, { name, email });
          toast({ title: "Invite sent", description: `${m.name} gets an email to set a password and 2FA. (Test build: no email is sent.)` });
          team.reload();
          log.reload();
        }}
      />

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Remove ${removing?.name ?? ""}?`}
        description="They're signed out and can't sign in again. What they did stays in the activity log."
        confirmLabel="Remove from team"
        onConfirm={async () => {
          if (!removing) return;
          await removeTeamMember(session, removing.id);
          toast({ title: "Removed from team", description: removing.name });
          team.reload();
          log.reload();
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset test data?"
        description="Riders, team members and the activity log go back to the seed data. You'll need to sign in again."
        confirmLabel="Reset test data"
        onConfirm={() => {
          resetPortalStore();
          document.cookie = `${SESSION_COOKIE}=; Path=${SESSION_PATH}; Max-Age=0; SameSite=Strict`;
          router.replace("/logistics/portal/login?reason=signed_out");
        }}
      />
    </>
  );
}

function InviteDrawer({
  open,
  onOpenChange,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onInvite: (name: string, email: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onInvite(name, email);
      setName("");
      setEmail("");
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      setErrors(err instanceof PortalError && err.fields ? err.fields : { email: "The invite wasn't sent. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Invite manager" description="Managers run riders and stops. They can't change the team.">
      <form id="invite-form" onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field label="Full name" error={errors.name}>
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}
        </Field>
        <Field label="Work email" help="They'll get a link to set a password and an authenticator app." error={errors.email}>
          {(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="off" />}
        </Field>
        <Button type="submit" loading={busy} className="self-start">
          Send invite
        </Button>
      </form>
    </Drawer>
  );
}
