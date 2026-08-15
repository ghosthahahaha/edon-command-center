import { createFileRoute, notFound } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ActionDialogs";
import { MetaGrid, PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/encoding/ir/$id")({
  head: () => ({
    meta: [
      { title: "Candidate IR package — EDON" },
      { name: "description", content: "Review encoded rules, conflicts and provenance before a human activates the package." },
      { property: "og:title", content: "Candidate IR package — EDON" },
      { property: "og:description", content: "Review encoded rules, conflicts and provenance before a human activates the package." },
    ],
  }),
  component: IrDetail,
});

function IrDetail() {
  const { id } = Route.useParams();
  const { irPackages, activateIr } = useEdon();
  const pkg = irPackages.find((p) => p.id === id) ?? irPackages[0];
  const [open, setOpen] = React.useState(false);
  if (!pkg) throw notFound();

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Integration & Encoding", to: "/encoding" }, { label: pkg.id }]}
        title={pkg.name}
        description="Candidate IR is inert until activation is approved. Nothing here executes on its own."
        meta={
          <>
            <StatusPill value={pkg.status} />
            <SyntheticNote />
          </>
        }
        actions={
          <Button size="sm" onClick={() => setOpen(true)} disabled={pkg.status === "Active"}>
            Approve activation
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Encoded rules">
            <ul className="divide-y divide-border text-sm">
              {pkg.rules.map((r) => (
                <li key={r.id} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="num text-xs text-muted-foreground">{r.id}</span>
                    <span className="min-w-0 flex-1">{r.statement}</span>
                    <StatusPill value={r.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Source: {r.source}, page {r.page}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Validation findings">
            <ul className="space-y-2 text-sm">
              {pkg.findings.map((f) => (
                <li key={f.message} className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <StatusPill value={f.severity} />
                  <span className="flex-1">{f.message}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel title="Package metadata">
          <MetaGrid
            columns={1}
            items={[
              { label: "Owner", value: pkg.owner },
              { label: "Department", value: pkg.department },
              { label: "Version", value: pkg.version },
              { label: "Rules", value: String(pkg.rules.length) },
              { label: "Last updated", value: formatDateTime(pkg.lastUpdated) },
            ]}
          />
        </Panel>
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Activate ${pkg.name}`}
        description="Activation makes these encoded rules authoritative for bound agents. A written reason is required."
        confirmLabel="Activate package"
        requireReason
        onConfirm={(reason) => {
          activateIr(pkg.id, reason);
          toast.success("Package activated and recorded in the audit log.");
          setOpen(false);
        }}
      />
    </div>
  );
}
