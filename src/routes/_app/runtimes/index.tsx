import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS, relativeTime, type Agent } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/runtimes/")({
  head: () => ({
    meta: [
      { title: "Agents & Runtimes — EDON" },
      { name: "description", content: "Registry of 500 governed healthcare AI agents with lifecycle, risk, health and policy coverage." },
      { property: "og:title", content: "Agents & Runtimes — EDON" },
      { property: "og:description", content: "Registry of 500 governed healthcare AI agents with lifecycle, risk, health and policy coverage." },
    ],
  }),
  component: Registry,
});

function Registry() {
  const { agents } = useEdon();
  const navigate = useNavigate();

  const columns: Column<Agent>[] = [
    {
      key: "name",
      header: "Agent",
      primary: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.id} · {r.owner}</p>
        </div>
      ),
      sortValue: (r) => r.name,
    },
    { key: "dept", header: "Department", render: (r) => <span className="text-xs">{r.department}</span>, sortValue: (r) => r.department, hideBelow: "md" },
    { key: "lifecycle", header: "Lifecycle", render: (r) => <StatusPill value={r.status} />, sortValue: (r) => r.lifecycle },
    { key: "risk", header: "Risk", render: (r) => <StatusPill value={r.risk} />, sortValue: (r) => r.risk },
    { key: "health", header: "Health", render: (r) => <StatusPill value={r.health} />, hideBelow: "md" },
    { key: "pack", header: "Policy pack", render: (r) => <span className="text-xs">{r.policyPack}</span>, hideBelow: "xl" },
    { key: "data", header: "Data class", render: (r) => <span className="text-xs">{r.dataClasses.join(", ")}</span>, hideBelow: "xl" },
    { key: "updated", header: "Updated", render: (r) => <span className="text-xs text-muted-foreground">{relativeTime(r.lastUpdated)}</span>, sortValue: (r) => r.lastUpdated, hideBelow: "lg" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Agents & Runtimes" }]}
        title="Agents & Runtimes"
        description="Aggregate posture across the governed fleet. Registration always starts in audit-only mode."
        meta={<SyntheticNote />}
        actions={
          <Button size="sm" asChild>
            <Link to="/runtimes/register">
              <Plus className="size-4" /> Register agent
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Governed agents" value={agents.length} />
        <KpiCard label="Production" value={agents.filter((a) => a.lifecycle === "Production").length} />
        <KpiCard label="Pilot / Sandbox" value={agents.filter((a) => a.lifecycle === "Pilot" || a.lifecycle === "Sandbox").length} />
        <KpiCard label="High or critical risk" value={agents.filter((a) => a.risk === "High" || a.risk === "Critical").length} delta="Monitored" deltaTone="warning" />
        <KpiCard label="Degraded or failing" value={agents.filter((a) => a.health !== "Healthy").length} delta="Action" deltaTone="danger" />
      </div>
      <Panel>
        <DataTable
          rows={agents}
          columns={columns}
          pageSize={12}
          searchKeys={(r) => `${r.name} ${r.id} ${r.owner} ${r.department} ${r.policyPack}`}
          filters={[
            { key: "dept", label: "Department", options: [...DEPARTMENTS], match: (r, v) => r.department === v },
            { key: "life", label: "Lifecycle", options: ["Production", "Pilot", "Sandbox", "Audit-only", "Draft"], match: (r, v) => r.lifecycle === v },
            { key: "risk", label: "Risk", options: ["Low", "Moderate", "High", "Critical"], match: (r, v) => r.risk === v },
            { key: "health", label: "Health", options: ["Healthy", "Degraded", "Failing"], match: (r, v) => r.health === v },
          ]}
          onRowClick={(r) => void navigate({ to: "/runtimes/$id", params: { id: r.id } })}
        />
      </Panel>
    </div>
  );
}
