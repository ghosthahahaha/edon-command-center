import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/policies/")({
  head: () => ({
    meta: [
      { title: "Policies — EDON" },
      { name: "description", content: "Institutional policy library with versions, bindings, conflicts and approval history." },
      { property: "og:title", content: "Policies — EDON" },
      { property: "og:description", content: "Institutional policy library with versions, bindings, conflicts and approval history." },
    ],
  }),
  component: Policies,
});

function Policies() {
  const { agents, policies, queue, incidents, auditEvents, state } = useEdon();
  void agents; void policies; void queue; void incidents; void auditEvents; void state;
  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Policy library" }]}
        title="Policy library"
        description="Policies are versioned, conflict-checked and bound to agents only after human approval."
        meta={<SyntheticNote />}
      />
      <Panel title="Policies">
        <ul className="divide-y divide-border text-sm">
          {policies.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.id} · {p.version} · {p.owner} · {p.department}
                </p>
              </div>
              <StatusPill value={p.severity} />
              <StatusPill value={p.status} />
              <span className="text-xs text-muted-foreground">{relativeTime(p.lastUpdated)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
