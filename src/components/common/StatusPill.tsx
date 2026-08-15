import { cn } from "@/lib/utils";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/12 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-info/10 text-info border-info/25",
  primary: "bg-primary/10 text-primary-dark border-primary/25",
};

const MAP: Record<string, Tone> = {
  // lifecycle / status
  Production: "success",
  Active: "success",
  Connected: "success",
  Complete: "success",
  Approved: "success",
  Passed: "success",
  Pass: "success",
  Resolved: "success",
  Healthy: "success",
  Fresh: "success",
  Sealed: "success",
  Valid: "success",
  Pilot: "info",
  Sandbox: "info",
  Shared: "info",
  Processing: "info",
  Extracting: "info",
  Monitoring: "info",
  Contained: "info",
  Queued: "neutral",
  Draft: "neutral",
  Retired: "neutral",
  Paused: "neutral",
  "N/A": "neutral",
  Superseded: "neutral",
  "Audit-only": "warning",
  Pending: "warning",
  "Candidate IR": "warning",
  "In validation": "warning",
  "Needs review": "warning",
  "Changes requested": "warning",
  Degraded: "warning",
  Aging: "warning",
  Expiring: "warning",
  Escalated: "warning",
  Rotating: "warning",
  Open: "danger",
  Failed: "danger",
  Fail: "danger",
  Failing: "danger",
  Error: "danger",
  Denied: "danger",
  Blocked: "danger",
  Conflict: "danger",
  Stale: "danger",
  Expired: "danger",
  Quarantined: "danger",
  "Rolled back": "danger",
  // risk
  Low: "success",
  Moderate: "info",
  High: "warning",
  Critical: "danger",
  // kernel
  ALLOW: "success",
  REQUIRE_APPROVAL: "warning",
  BLOCK: "danger",
  Allow: "success",
  "Require Approval": "warning",
  Block: "danger",
  // severity
  SEV1: "danger",
  SEV2: "warning",
  SEV3: "info",
  P1: "danger",
  P2: "warning",
  P3: "neutral",
  Success: "success",
  Deferred: "warning",
  Disabled: "neutral",
};

export function toneFor(value: string): Tone {
  return MAP[value] ?? "neutral";
}

export function StatusPill({
  value,
  tone,
  className,
  dot = false,
}: {
  value: string;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  const t = tone ?? toneFor(value);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 whitespace-nowrap",
        toneClass[t],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {value}
    </span>
  );
}
