import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/operations/")({
  head: () => ({
    meta: [
      { title: "Operations — EDON" },
      { name: "description", content: "Runtime monitoring, incidents, drift detection and emergency controls for the governed AI fleet." },
      { property: "og:title", content: "Operations — EDON" },
      { property: "og:description", content: "Runtime monitoring, incidents, drift detection and emergency controls for the governed AI fleet." },
    ],
  }),
  component: Operations,
});

function Operations() {
  const { agents, policies, queue, incidents, auditEvents, state } = useEdon();
  void agents; void policies; void queue; void incidents; void auditEvents; void state;
  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Operations" }]}
        title="Operations"
        description="Live runtime posture, incident load and emergency controls for the governed fleet."
        meta={<SyntheticNote />}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Open incidents" value={incidents.filter((i) => i.status !== "Resolved").length} delta="Triage" deltaTone="warning" />
        <KpiCard label="Degraded agents" value={agents.filter((a) => a.health !== "Healthy").length} />
        <KpiCard label="Pending queue" value={queue.filter((q) => q.status === "Pending").length} />
        <KpiCard label="Lockdown" value={state.lockdown ? "Active" : "Standby"} deltaTone={state.lockdown ? "danger" : "success"} delta={state.lockdown ? "All agents halted" : "Normal operations"} />
      </div>
      <Panel title="Incidents">
        <ul className="divide-y divide-border text-sm">
          {incidents.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.title}</p>
                <p className="truncate text-xs text-muted-foreground">{i.id} · {i.department} · {i.owner}</p>
              </div>
              <StatusPill value={i.severity} />
              <StatusPill value={i.status} />
              <span className="text-xs text-muted-foreground">{relativeTime(i.openedAt)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
