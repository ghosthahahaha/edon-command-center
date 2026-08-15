import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ActionDialogs";
import { AuditTimeline, CandidateTag, MetaGrid, PageHeader, Panel } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, relativeTime } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/work-queue/$id")({
  head: () => ({
    meta: [
      { title: "Queue item — EDON" },
      { name: "description", content: "Review the deterministic kernel result, evidence and applicable policies before recording a decision." },
      { property: "og:title", content: "Queue item — EDON" },
      { property: "og:description", content: "Review the deterministic kernel result, evidence and applicable policies before recording a decision." },
    ],
  }),
  component: QueueDetail,
});

type Decision = "Approved" | "Denied" | "Changes requested" | "Escalated";

function QueueDetail() {
  const { id } = Route.useParams();
  const { queue, decideQueueItem, commentOnQueueItem, notify } = useEdon();
  const navigate = useNavigate();
  const item = queue.find((q) => q.id === id);
  const [pendingDecision, setPendingDecision] = React.useState<Decision | null>(null);
  const [comment, setComment] = React.useState("");

  if (!item) throw notFound();
  const highRisk = item.risk === "High" || item.risk === "Critical";

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Work Queue", to: "/work-queue" }, { label: item.id }]}
        title={item.title}
        description={item.summary}
        meta={
          <>
            <StatusPill value={item.status} />
            <StatusPill value={item.priority} />
            <StatusPill value={item.risk} />
            <span className="text-xs text-muted-foreground">SLA {relativeTime(item.slaDue)}</span>
          </>
        }
        actions={
          <>
            <Button size="sm" onClick={() => setPendingDecision("Approved")} disabled={item.status !== "Pending"}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setPendingDecision("Denied")} disabled={item.status !== "Pending"}>
              Deny
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPendingDecision("Changes requested")} disabled={item.status !== "Pending"}>
              Request changes
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPendingDecision("Escalated")} disabled={item.status !== "Pending"}>
              Escalate
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Request summary">
            <MetaGrid
              items={[
                { label: "Type", value: item.type },
                { label: "Object", value: item.object },
                { label: "Department", value: item.department },
                { label: "Assigned reviewer", value: item.reviewer },
                { label: "Submitted", value: formatDateTime(item.submittedAt) },
                { label: "Blast radius", value: item.blastRadius },
                { label: "Requested action", value: item.requestedAction },
                { label: "Human approval requirement", value: item.humanRequirement },
              ]}
            />
          </Panel>

          <Panel title="Deterministic Kernel result" description="Authoritative, deterministic evaluation.">
            <p className="rounded-xl border border-border bg-surface-subtle p-3 text-sm">{item.kernelResult}</p>
            <div className="mt-4 space-y-2">
              <CandidateTag />
              <p className="text-sm text-muted-foreground">{item.modelRecommendation}</p>
            </div>
          </Panel>

          <Panel title="Evidence & source references">
            <ul className="space-y-2 text-sm">
              {item.evidence.map((e) => (
                <li key={e.label} className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{e.label}:</span>
                  <span className="text-muted-foreground">{e.ref}</span>
                </li>
              ))}
              {item.sources.map((s) => (
                <li key={`${s.name}-${s.page}`} className="text-xs text-muted-foreground">
                  Source grounding — {s.name}, page {s.page}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Timeline">
            <AuditTimeline entries={item.timeline} />
          </Panel>

          <Panel title="Comments">
            <div className="space-y-3">
              {item.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
              {item.comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    {c.author} · {formatDateTime(c.at)}
                  </p>
                  <p className="mt-1 text-sm">{c.text}</p>
                </div>
              ))}
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (comment.trim().length < 3) {
                    toast.error("Enter a comment before posting.");
                    return;
                  }
                  commentOnQueueItem(item.id, comment.trim());
                  setComment("");
                  toast.success("Comment added to the audit trail.");
                }}
              >
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a reviewer comment…" />
                <Button type="submit" size="sm" variant="outline">
                  Post comment
                </Button>
              </form>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Applicable policies">
            <ul className="space-y-2 text-sm">
              {item.policies.map((p) => (
                <li key={p} className="rounded-lg border border-border px-3 py-2">
                  {p}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Risk & blast radius">
            <div className="space-y-2 text-sm">
              <StatusPill value={item.risk} />
              <p className="text-muted-foreground">{item.blastRadius}</p>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDecision !== null}
        onOpenChange={(v) => !v && setPendingDecision(null)}
        title={`${pendingDecision ?? ""} — ${item.id}`}
        description={
          highRisk || pendingDecision === "Denied"
            ? "This object is high risk, so a written reason is mandatory and will be stored in the immutable audit log."
            : "Your decision will be recorded in the immutable audit log."
        }
        confirmLabel={`Record ${(pendingDecision ?? "decision").toLowerCase()}`}
        destructive={pendingDecision === "Denied"}
        requireReason={highRisk || pendingDecision === "Denied"}
        onConfirm={(reason) => {
          if (!pendingDecision) return;
          decideQueueItem(item.id, pendingDecision, reason);
          notify({ title: `${item.id} ${pendingDecision.toLowerCase()}`, detail: item.title, tone: pendingDecision === "Denied" ? "danger" : "success" });
          toast.success(`${item.id} ${pendingDecision.toLowerCase()} — removed from the pending queue.`);
          setPendingDecision(null);
          void navigate({ to: "/work-queue" });
        }}
      />
    </div>
  );
}
