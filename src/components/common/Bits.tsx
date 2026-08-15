import { Link } from "@tanstack/react-router";
import { ChevronRight, Info, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { StatusPill, type Tone } from "@/components/common/StatusPill";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime, relativeTime, type AuditEntry, type CoreEntity } from "@/lib/mock-data";

/* ------------------------------- breadcrumbs ------------------------------ */

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3 opacity-60" aria-hidden />}
          {c.to && i < items.length - 1 ? (
            <Link to={c.to} className="rounded transition-app hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className={cn(i === items.length - 1 && "text-foreground/80 font-medium")}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------- page header ------------------------------ */

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
          )}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* ---------------------------------- panel --------------------------------- */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  footer,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <section className={cn("panel flex flex-col", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("flex-1 p-4 md:p-5", bodyClassName)}>{children}</div>
      {footer && <div className="border-t border-border px-4 py-3 md:px-5">{footer}</div>}
    </section>
  );
}

/* --------------------------------- KPI card ------------------------------- */

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  icon,
  hint,
  onClick,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: Tone;
  icon?: ReactNode;
  hint?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cn(
        "panel flex flex-col gap-2 p-4 text-left transition-app",
        onClick && "cursor-pointer hover:border-border-strong hover:shadow-panel",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="label-caps">{label}</span>
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="num text-2xl font-semibold tracking-tight">{value}</span>
        {delta && <StatusPill value={delta} tone={deltaTone} className="mb-1" />}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Comp>
  );
}

/* -------------------------------- meta grid ------------------------------- */

export function MetaGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="label-caps">{it.label}</dt>
          <dd className="mt-1 text-sm break-words">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Standard core-entity metadata block shared by every governed object. */
export function CoreEntityMeta({ entity, extra }: { entity: CoreEntity; extra?: { label: string; value: ReactNode }[] }) {
  return (
    <MetaGrid
      items={[
        { label: "Status", value: <StatusPill value={entity.status} /> },
        { label: "Owner", value: entity.owner },
        { label: "Department", value: entity.department },
        { label: "Scope", value: entity.scope },
        { label: "Version", value: entity.version },
        { label: "Source", value: entity.source },
        { label: "Risk level", value: <StatusPill value={entity.risk} /> },
        { label: "Required approvals", value: entity.requiredApprovals.join(", ") },
        { label: "Effective date", value: formatDate(entity.effectiveDate) },
        { label: "Last updated", value: `${formatDateTime(entity.lastUpdated)} (${relativeTime(entity.lastUpdated)})` },
        ...(extra ?? []),
      ]}
    />
  );
}

/* ------------------------------ audit timeline ---------------------------- */

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) return <EmptyState title="No audit history yet" description="Actions on this object will appear here." />;
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-primary" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{e.action}</span>
            <span className="text-xs text-muted-foreground">
              {e.actor} · {formatDateTime(e.at)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{e.detail}</p>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------- empty state ------------------------------ */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-subtle px-6 py-10 text-center">
      <span className="text-muted-foreground">{icon ?? <Info className="size-5" />}</span>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-md text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

/* ------------------------- AI candidate labelling ------------------------ */

export function CandidateTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-info/25 bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info",
        className,
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      Candidate · Non-authoritative
    </span>
  );
}

export function SyntheticNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11px] text-muted-foreground", className)}>
      Synthetic demo data — no real patient information.
    </p>
  );
}
