import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { KpiCard, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/encoding/")({
  head: () => ({
    meta: [
      { title: "Integration & Encoding — EDON" },
      { name: "description", content: "Encode institutional documents into candidate IR packages, validate them and activate after human approval." },
      { property: "og:title", content: "Integration & Encoding — EDON" },
      { property: "og:description", content: "Encode institutional documents into candidate IR packages, validate them and activate after human approval." },
    ],
  }),
  component: EncodingOverview,
});

const PIPELINE = ["Source", "Extract", "Map", "Candidate IR", "Validate", "Approve", "Activate"];

function EncodingOverview() {
  const { sources, connectors, irPackages, state } = useEdon();
  const conflicts = irPackages.filter((p) => p.findings.some((f) => f.severity === "High" || f.severity === "Critical"));

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Integration & Encoding" }]}
        title="Integration & Encoding"
        description="Imported institutional knowledge stays a Candidate IR package until a human approves activation."
        meta={<SyntheticNote />}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/encoding/connectors">Connectors</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/encoding/sources">Sources library</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard label="Connected sources" value={sources.length} />
        <KpiCard label="Processing jobs" value={state.jobs.filter((j) => j.status !== "Complete").length} />
        <KpiCard label="Candidate IR packages" value={irPackages.filter((p) => p.status !== "Active").length} />
        <KpiCard label="Conflicts to review" value={conflicts.length} delta="Review" deltaTone="warning" />
        <KpiCard label="Sync failures" value={connectors.filter((c) => c.status === "Error").length} delta="1 connector" deltaTone="danger" />
        <KpiCard label="Recently activated" value={irPackages.filter((p) => p.status === "Active").length} />
      </div>

      <Panel title="Encoding pipeline" description="Every stage is auditable and gated by human approval before activation.">
        <ol className="flex flex-wrap items-center gap-2">
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-xs font-medium">{step}</span>
              {i < PIPELINE.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />}
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Candidate IR packages">
          <ul className="divide-y divide-border">
            {irPackages.map((p) => (
              <li key={p.id} className="py-2.5">
                <Link to="/encoding/ir/$id" params={{ id: p.id }} className="flex items-center gap-2 rounded-lg transition-app hover:text-primary-dark">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                  <StatusPill value={p.status} />
                </Link>
                <p className="text-xs text-muted-foreground">
                  {p.owner} · {p.department} · updated {relativeTime(p.lastUpdated)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Processing jobs" description="Extraction and OCR jobs created from uploads.">
          {state.jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active jobs. Upload a source to create an extraction job.</p>
          ) : (
            <ul className="space-y-2">
              {state.jobs.map((j) => (
                <li key={j.id} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{j.sourceName}</span>
                  <StatusPill value={j.status} />
                  <span className="num w-10 text-right text-xs text-muted-foreground">{j.progress}%</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
