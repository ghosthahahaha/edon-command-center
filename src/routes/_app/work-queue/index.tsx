import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEPARTMENTS, relativeTime, type QueueItem } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";
import * as React from "react";

export const Route = createFileRoute("/_app/work-queue/")({
  head: () => ({
    meta: [
      { title: "Work Queue — EDON" },
      { name: "description", content: "Approvals, exceptions, incidents and failed validations awaiting human decision in EDON." },
      { property: "og:title", content: "Work Queue — EDON" },
      { property: "og:description", content: "Approvals, exceptions, incidents and failed validations awaiting human decision in EDON." },
    ],
  }),
  component: WorkQueue,
});

const TABS = ["My Queue", "Team Queue", "Approvals", "Exceptions & Appeals", "Incidents", "Failed Validations"] as const;

function WorkQueue() {
  const { queue } = useEdon();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("My Queue");

  const rows = queue.filter((q) => {
    switch (tab) {
      case "My Queue":
        return q.mine;
      case "Team Queue":
        return true;
      case "Approvals":
        return q.type === "Approval" || q.type === "Policy review";
      case "Exceptions & Appeals":
        return q.type === "Exception" || q.type === "Appeal";
      case "Incidents":
        return q.type === "Incident";
      case "Failed Validations":
        return q.type === "Validation";
    }
  });

  const columns: Column<QueueItem>[] = [
    { key: "priority", header: "Priority", render: (r) => <StatusPill value={r.priority} />, sortValue: (r) => r.priority },
    {
      key: "title",
      header: "Object",
      primary: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.title}</p>
          <p className="truncate text-xs text-muted-foreground">{r.object}</p>
        </div>
      ),
      sortValue: (r) => r.title,
    },
    { key: "type", header: "Type", render: (r) => <span className="text-xs">{r.type}</span>, sortValue: (r) => r.type, hideBelow: "md" },
    { key: "department", header: "Department", render: (r) => <span className="text-xs">{r.department}</span>, sortValue: (r) => r.department, hideBelow: "lg" },
    { key: "reviewer", header: "Reviewer", render: (r) => <span className="text-xs">{r.reviewer}</span>, hideBelow: "xl" },
    { key: "submitted", header: "Submitted", render: (r) => <span className="text-xs text-muted-foreground">{relativeTime(r.submittedAt)}</span>, sortValue: (r) => r.submittedAt, hideBelow: "lg" },
    { key: "sla", header: "SLA", render: (r) => <StatusPill value={relativeTime(r.slaDue).startsWith("in") ? "Pending" : "High"} className="whitespace-nowrap" />, hideBelow: "md" },
    { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Work Queue" }]}
        title="Work Queue"
        description="Every governed decision that requires a human. Nothing executes without a recorded approval."
        meta={<SyntheticNote />}
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])}>
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Panel>
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={(r) => `${r.title} ${r.object} ${r.department} ${r.reviewer} ${r.type}`}
          filters={[
            { key: "dept", label: "Department", options: [...DEPARTMENTS], match: (r, v) => r.department === v },
            { key: "status", label: "Status", options: ["Pending", "Approved", "Denied", "Changes requested", "Escalated"], match: (r, v) => r.status === v },
            { key: "risk", label: "Risk", options: ["Low", "Moderate", "High", "Critical"], match: (r, v) => r.risk === v },
          ]}
          onRowClick={(r) => void navigate({ to: "/work-queue/$id", params: { id: r.id } })}
          initialSort={{ key: "priority", dir: "asc" }}
        />
      </Panel>
    </div>
  );
}
