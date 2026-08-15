import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/simulations/")({
  head: () => ({
    meta: [
      { title: "Simulations — EDON" },
      { name: "description", content: "Run hypothetical, non-binding simulations of policy and agent changes before any production promotion." },
      { property: "og:title", content: "Simulations — EDON" },
      { property: "og:description", content: "Run hypothetical, non-binding simulations of policy and agent changes before any production promotion." },
    ],
  }),
  component: Simulations,
});

function Simulations() {
  const { agents, policies, queue, incidents, auditEvents, state } = useEdon();
  void agents; void policies; void queue; void incidents; void auditEvents; void state;
  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Simulations" }]}
        title="Simulations"
        description="Every simulation result is HYPOTHETICAL and NON-BINDING. Nothing here changes production behaviour."
        meta={<SyntheticNote />}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Scenarios available" value={24} />
        <KpiCard label="Runs this month" value={186} />
        <KpiCard label="Blocking findings" value={7} delta="Review" deltaTone="warning" />
        <KpiCard label="Agents covered" value={agents.filter((a) => a.risk !== "Low").length} />
      </div>
      <Panel title="Recent simulation runs" description="HYPOTHETICAL · NON-BINDING">
        <ul className="divide-y divide-border text-sm">
          {state.simulations.length === 0 && (
            <li className="py-3 text-muted-foreground">No simulations run yet in this session.</li>
          )}
          {state.simulations.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 py-2.5">
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <StatusPill value={s.outcome} />
              <span className="text-xs text-muted-foreground">{relativeTime(s.at)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
