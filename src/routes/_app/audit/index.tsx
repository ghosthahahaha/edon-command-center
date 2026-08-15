import { createFileRoute } from "@tanstack/react-router";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/audit/")({
  head: () => ({
    meta: [
      { title: "Audit & Evidence — EDON" },
      { name: "description", content: "Immutable, exportable audit evidence for every governed decision, override and policy change." },
      { property: "og:title", content: "Audit & Evidence — EDON" },
      { property: "og:description", content: "Immutable, exportable audit evidence for every governed decision, override and policy change." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const { agents, policies, queue, incidents, auditEvents, state } = useEdon();
  void agents; void policies; void queue; void incidents; void auditEvents; void state;
  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Audit & Evidence" }]}
        title="Audit & Evidence"
        description="Append-only evidence with actor, reason, policy version and object hash for every decision."
        meta={<SyntheticNote />}
      />
      <Panel title="Audit log">
        <ul className="divide-y divide-border text-sm">
          {auditEvents.slice(0, 40).map((e) => (
            <li key={e.id} className="py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-medium">{e.action}</span>
                <StatusPill value={e.outcome} />
                <span className="text-xs text-muted-foreground">{relativeTime(e.at)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {e.actor} · {e.object} · {e.reason}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
