import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime, relativeTime, type Connector } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/encoding/connectors")({
  head: () => ({
    meta: [
      { title: "Connectors — EDON" },
      { name: "description", content: "Credential health, permissions, data classifications and sync schedules for every governed connector." },
      { property: "og:title", content: "Connectors — EDON" },
      { property: "og:description", content: "Credential health, permissions, data classifications and sync schedules for every governed connector." },
    ],
  }),
  component: Connectors,
});

function Connectors() {
  const { connectors, patchConnector } = useEdon();
  const [logs, setLogs] = React.useState<Connector | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Integration & Encoding", to: "/encoding" }, { label: "Connectors" }]}
        title="Connectors"
        description="Every integration declares its permissions, data classifications and sync posture."
        meta={<SyntheticNote />}
      />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {connectors.map((c) => (
          <Panel
            key={c.id}
            title={c.name}
            description={`${c.kind} · ${c.owner}`}
            actions={<StatusPill value={c.status} dot />}
          >
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Credential health</dt>
                <dd><StatusPill value={c.credentialHealth} /></dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Schedule</dt>
                <dd>{c.schedule}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Last success</dt>
                <dd>{relativeTime(c.lastSuccess)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Permissions</dt>
                <dd className="mt-1 space-y-1">
                  {c.permissions.map((p) => (
                    <span key={p} className="block rounded border border-border px-2 py-1">{p}</span>
                  ))}
                </dd>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {c.dataClasses.map((d) => (
                  <StatusPill key={d} value={d === "PHI" ? "High" : "Low"} className="lowercase" />
                ))}
                {c.dataClasses.map((d) => (
                  <span key={`n-${d}`} className="text-[11px] text-muted-foreground">{d}</span>
                ))}
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${c.name}: test connection succeeded.`)}>
                Test connection
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const paused = c.status === "Paused";
                  patchConnector(c.id, { status: paused ? "Connected" : "Paused" });
                  toast.success(`${c.name} ${paused ? "resumed" : "paused"}.`);
                }}
              >
                {c.status === "Paused" ? "Resume sync" : "Pause sync"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Scope editor opened (demo).")}>
                Edit scopes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setLogs(c)}>
                View logs
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <Dialog open={!!logs} onOpenChange={(v) => !v && setLogs(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{logs?.name} — connector logs</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 text-xs">
            {logs?.logs.map((l) => (
              <li key={l.at} className="rounded-lg border border-border p-2">
                <span className="label-caps">{l.level}</span>
                <p className="mt-0.5">{l.message}</p>
                <p className="text-muted-foreground">{formatDateTime(l.at)}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
