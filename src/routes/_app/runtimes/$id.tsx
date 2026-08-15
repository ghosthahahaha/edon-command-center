import { createFileRoute, notFound } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ActionDialogs";
import { AuditTimeline, MetaGrid, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/runtimes/$id")({
  head: () => ({
    meta: [
      { title: "Agent detail — EDON" },
      { name: "description", content: "Purpose, scopes, policy bindings, evaluations and audit trail for a governed AI agent." },
      { property: "og:title", content: "Agent detail — EDON" },
      { property: "og:description", content: "Purpose, scopes, policy bindings, evaluations and audit trail for a governed AI agent." },
    ],
  }),
  component: AgentDetail,
});

function AgentDetail() {
  const { id } = Route.useParams();
  const { agents, patchAgent, notify } = useEdon();
  const agent = agents.find((a) => a.id === id);
  const [action, setAction] = React.useState<"suspend" | "promote" | null>(null);
  if (!agent) throw notFound();

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Agents & Runtimes", to: "/runtimes" }, { label: agent.id }]}
        title={agent.name}
        description={agent.purpose}
        meta={
          <>
            <StatusPill value={agent.status} />
            <StatusPill value={agent.risk} />
            <StatusPill value={agent.health} />
            <SyntheticNote />
          </>
        }
        actions={
          <>
            <Button size="sm" onClick={() => setAction("promote")} disabled={agent.lifecycle === "Production"}>
              Request promotion
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setAction("suspend")} disabled={agent.status === "Suspended"}>
              Suspend agent
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          {["overview", "scopes", "policies", "evaluations", "audit"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Panel title="Configuration">
            <MetaGrid
              items={[
                { label: "Owner", value: agent.owner },
                { label: "Department", value: agent.department },
                { label: "Lifecycle", value: agent.lifecycle },
                { label: "Model", value: agent.model },
                { label: "Runtime", value: agent.runtime },
                { label: "Policy pack", value: agent.policyPack },
                { label: "Approver", value: agent.approver },
                { label: "Data classes", value: agent.dataClasses.join(", ") },
                { label: "Systems", value: agent.systems.join(", ") },
                { label: "Decisions (30d)", value: agent.decisions30d.toLocaleString() },
                { label: "Override rate", value: `${agent.overrideRate}%` },
                { label: "Last updated", value: formatDateTime(agent.lastUpdated) },
              ]}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="scopes" className="mt-4">
          <Panel title="Capabilities & exact scopes">
            <ul className="divide-y divide-border text-sm">
              {agent.capabilities.map((c) => (
                <li key={c.name} className="flex flex-wrap items-center gap-2 py-2.5">
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <StatusPill value={c.access === "Write" ? "Moderate" : "Low"} />
                  <span className="num text-xs text-muted-foreground">{c.scope}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="policies" className="mt-4">
          <Panel title="Bound policies">
            <ul className="space-y-2 text-sm">
              {agent.policies.map((p) => (
                <li key={p} className="rounded-lg border border-border px-3 py-2">{p}</li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-4">
          <Panel title="Evaluation history">
            <ul className="divide-y divide-border text-sm">
              {agent.evaluations.map((e) => (
                <li key={e.name} className="flex items-center gap-2 py-2.5">
                  <span className="flex-1">{e.name}</span>
                  <span className="num text-xs text-muted-foreground">{e.score}%</span>
                  <StatusPill value={e.result} />
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Panel title="Audit trail">
            <AuditTimeline entries={agent.timeline} />
          </Panel>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(v) => !v && setAction(null)}
        title={action === "suspend" ? `Suspend ${agent.name}` : `Request promotion for ${agent.name}`}
        description={
          action === "suspend"
            ? "Suspension halts all runtime activity immediately and is recorded in the immutable audit log."
            : "Promotion creates an approval item; the agent stays in its current mode until a human approves."
        }
        confirmLabel={action === "suspend" ? "Suspend now" : "Submit request"}
        destructive={action === "suspend"}
        requireReason
        onConfirm={(reason) => {
          if (action === "suspend") {
            patchAgent(agent.id, { status: "Suspended", lifecycle: "Audit-only" }, `Suspended: ${reason}`);
            notify({ title: `${agent.name} suspended`, detail: reason, tone: "danger" });
            toast.success("Agent suspended and audit entry recorded.");
          } else {
            patchAgent(agent.id, {}, `Promotion requested: ${reason}`);
            toast.success("Promotion request routed to the approval owner.");
          }
          setAction(null);
        }}
      />
    </div>
  );
}
