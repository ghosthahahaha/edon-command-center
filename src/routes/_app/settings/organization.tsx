import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/settings/organization")({
  head: () => ({
    meta: [
      { title: "Settings — EDON" },
      { name: "description", content: "Organization profile, departments, environments and governance defaults for EDON." },
      { property: "og:title", content: "Settings — EDON" },
      { property: "og:description", content: "Organization profile, departments, environments and governance defaults for EDON." },
    ],
  }),
  component: OrganizationSettings,
});

function OrganizationSettings() {
  const { agents, policies, queue, incidents, auditEvents, state } = useEdon();
  void agents; void policies; void queue; void incidents; void auditEvents; void state;
  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Organization" }]}
        title="Organization"
        description="Departments, environments and governance defaults for this institution."
        meta={<SyntheticNote />}
      />
      <Panel title="Environment & defaults">
        <ul className="divide-y divide-border text-sm">
          <li className="flex items-center justify-between gap-2 py-2.5">
            <span>Active environment</span>
            <StatusPill value={state.environment} />
          </li>
          <li className="flex items-center justify-between gap-2 py-2.5">
            <span>New agent default mode</span>
            <StatusPill value="Audit-only" />
          </li>
          <li className="flex items-center justify-between gap-2 py-2.5">
            <span>Departments governed</span>
            <span className="num text-xs text-muted-foreground">8</span>
          </li>
          <li className="flex items-center justify-between gap-2 py-2.5">
            <span>Audit retention</span>
            <span className="text-xs text-muted-foreground">7 years, append-only</span>
          </li>
        </ul>
      </Panel>
    </div>
  );
}
