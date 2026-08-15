import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Download,
  Plus,
  ShieldCheck,
  Siren,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { KpiCard, Panel, PageHeader, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { DonutChart, StackedBars, TrendLine } from "@/components/charts/Charts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ACTIVITY_FEED,
  KERNEL_DECISION_MIX,
  KPI_SUMMARY,
  LIFECYCLE_DISTRIBUTION,
  POSTURE_30D,
  RISK_BY_DEPARTMENT,
  SOURCES,
  TENANT,
  UPCOMING_EFFECTIVE,
  formatDate,
  relativeTime,
} from "@/lib/mock-data";
import { downloadMockFile, toCsv, useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Governance Dashboard — EDON" },
      {
        name: "description",
        content:
          "Executive governance posture for St. Mercy Health: agents, policy compliance, pending reviews and open incidents.",
      },
      { property: "og:title", content: "Governance Dashboard — EDON" },
      {
        property: "og:description",
        content: "Executive AI governance posture across 500 governed healthcare agents.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { incidents, queue, connectors } = useEdon();
  const openIncidents = incidents.filter((i) => i.status !== "Resolved");
  const pending = queue.filter((q) => q.status === "Pending");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Good morning, Dr. Chen"
        description={`Here is the governance posture for ${TENANT.name}.`}
        meta={<SyntheticNote />}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadMockFile(
                  "edon-governance-posture-2026-08-15.csv",
                  toCsv(POSTURE_30D as unknown as Record<string, unknown>[]),
                  "text/csv",
                );
                toast.success("Posture export generated (CSV).");
              }}
            >
              <Download className="size-4" /> Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarClock className="size-4" /> Last 30 days
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["Last 7 days", "Last 30 days", "Quarter to date", "Year to date"].map((r) => (
                  <DropdownMenuItem key={r} onSelect={() => toast.success(`Date range set to ${r}.`)}>
                    {r}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4" /> Create new
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/runtimes/register">Register agent</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/policies">New policy draft</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/encoding/sources">Upload source</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/simulations">New simulation</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard label="Governed agents" value={KPI_SUMMARY.governedAgents} icon={<Boxes className="size-4" />} hint="8 departments" />
        <KpiCard label="Production agents" value={KPI_SUMMARY.productionAgents} delta="82%" deltaTone="success" hint="of governed fleet" />
        <KpiCard label="Policy compliance" value={`${KPI_SUMMARY.policyCompliance}%`} delta="+0.6" deltaTone="success" icon={<ShieldCheck className="size-4" />} />
        <KpiCard label="Pending reviews" value={pending.length || KPI_SUMMARY.pendingReviews} delta="2 near SLA" deltaTone="warning" />
        <KpiCard label="Open incidents" value={openIncidents.length} delta="1 SEV1" deltaTone="danger" icon={<Siren className="size-4" />} />
        <KpiCard label="Connected sources" value={KPI_SUMMARY.connectedSources} hint={`${connectors.length} connectors`} icon={<Workflow className="size-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Thirty-day governance posture"
          description="Policy compliance against denied operations and human approvals."
        >
          <TrendLine
            data={POSTURE_30D as unknown as Record<string, unknown>[]}
            xKey="date"
            series={[
              { key: "compliance", label: "Compliance %" },
              { key: "denials", label: "Denied operations" },
              { key: "approvals", label: "Human approvals" },
            ]}
          />
        </Panel>

        <Panel title="Attention required" description="Highest-value governance actions right now.">
          <ul className="space-y-3">
            {pending.slice(0, 4).map((q) => (
              <li key={q.id}>
                <Link
                  to="/work-queue/$id"
                  params={{ id: q.id }}
                  className="block rounded-xl border border-border p-3 transition-app hover:border-primary/40"
                >
                  <div className="flex items-center gap-2">
                    <StatusPill value={q.priority} />
                    <StatusPill value={q.risk} />
                    <span className="ml-auto text-[11px] text-muted-foreground">SLA {relativeTime(q.slaDue)}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">{q.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.department} · {q.reviewer}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Agent lifecycle distribution">
          <StackedBars
            data={LIFECYCLE_DISTRIBUTION as unknown as Record<string, unknown>[]}
            xKey="stage"
            vertical
            series={[{ key: "count", label: "Agents", color: "var(--color-chart-1)" }]}
            height={230}
          />
        </Panel>
        <Panel title="Risk posture by department">
          <StackedBars
            data={RISK_BY_DEPARTMENT as unknown as Record<string, unknown>[]}
            xKey="department"
            series={[
              { key: "critical", label: "Critical", color: "var(--color-chart-4)" },
              { key: "high", label: "High", color: "var(--color-chart-3)" },
              { key: "moderate", label: "Moderate", color: "var(--color-chart-2)" },
              { key: "low", label: "Low", color: "var(--color-chart-1)" },
            ]}
            height={230}
          />
        </Panel>
        <Panel title="Deterministic Kernel decision mix" description="Share of evaluated operations (30 days).">
          <DonutChart data={KERNEL_DECISION_MIX} height={230} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Recent activity" description="Immutable governance events, newest first.">
          <ul className="divide-y divide-border">
            {ACTIVITY_FEED.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-2.5">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    a.tone === "danger"
                      ? "bg-destructive"
                      : a.tone === "warning"
                        ? "bg-warning"
                        : a.tone === "success"
                          ? "bg-success"
                          : "bg-info"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.actor} · {relativeTime(a.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Source synchronization health">
            <ul className="space-y-2.5">
              {SOURCES.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
                  <StatusPill value={s.freshness} />
                  <span className="w-16 text-right text-[11px] text-muted-foreground">{relativeTime(s.lastSync)}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Open incidents" actions={<Link to="/operations/incidents" className="text-xs text-primary-dark hover:underline">View all</Link>}>
            <ul className="space-y-2.5">
              {openIncidents.map((i) => (
                <li key={i.id}>
                  <Link to="/operations/incidents/$id" params={{ id: i.id }} className="flex items-center gap-2 rounded-lg p-1.5 transition-app hover:bg-accent/40">
                    <AlertTriangle className="size-4 text-warning" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm">{i.title}</span>
                    <StatusPill value={i.severity} />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Upcoming policy effective dates">
            <ul className="space-y-2.5">
              {UPCOMING_EFFECTIVE.map((u) => (
                <li key={u.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{u.name}</span>
                  <span className="text-[11px] text-muted-foreground">{formatDate(u.date)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
