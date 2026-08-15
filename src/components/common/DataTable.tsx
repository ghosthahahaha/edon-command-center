import { ArrowDown, ArrowUp, ChevronsUpDown, Search, SlidersHorizontal } from "lucide-react";
import * as React from "react";

import { EmptyState } from "@/components/common/Bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hideBelow?: "sm" | "md" | "lg" | "xl";
  primary?: boolean;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
}

interface Props<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  filters?: FilterDef<T>[];
  searchKeys?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbarExtra?: React.ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  initialFilters?: Record<string, string>;
  onFiltersChange?: (f: Record<string, string>) => void;
  dense?: boolean;
}

const hideClass = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  filters = [],
  searchKeys,
  onRowClick,
  pageSize = 10,
  emptyTitle = "No results",
  emptyDescription = "Adjust your search or filters to see more items.",
  toolbarExtra,
  initialSort,
  initialFilters,
  onFiltersChange,
  dense,
}: Props<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [active, setActive] = React.useState<Record<string, string>>(initialFilters ?? {});
  const [page, setPage] = React.useState(1);
  const [hidden, setHidden] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (initialFilters) setActive(initialFilters);
  }, [initialFilters]);

  const visibleColumns = columns.filter((c) => !hidden[c.key]);

  const filtered = React.useMemo(() => {
    let out = rows;
    if (query && searchKeys) {
      const q = query.toLowerCase();
      out = out.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    for (const f of filters) {
      const v = active[f.key];
      if (v && v !== "all") out = out.filter((r) => f.match(r, v));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, query, filters, active, sort, columns, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);

  const setFilter = (key: string, value: string) => {
    const next = { ...active, [key]: value };
    setActive(next);
    setPage(1);
    onFiltersChange?.(next);
  };

  const toggleSort = (key: string) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchKeys && (
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              aria-label="Search table"
              className="h-9 pl-8"
            />
          </div>
        )}
        {filters.map((f) => (
          <Select key={f.key} value={active[f.key] ?? "all"} onValueChange={(v) => setFilter(f.key, v)}>
            <SelectTrigger className="h-9 w-auto min-w-[140px]" aria-label={f.label}>
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.label}: All</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {toolbarExtra}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="size-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 p-1">
              {columns.map((c) => (
                <label
                  key={c.key}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-app hover:bg-accent"
                >
                  <Checkbox
                    checked={!hidden[c.key]}
                    onCheckedChange={(v) => setHidden((h) => ({ ...h, [c.key]: !v }))}
                  />
                  {c.header}
                </label>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-subtle">
                  {visibleColumns.map((c) => (
                    <TableHead key={c.key} className={cn("whitespace-nowrap", c.hideBelow && hideClass[c.hideBelow], c.className)}>
                      {c.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1 rounded transition-app hover:text-foreground"
                        >
                          {c.header}
                          {sort?.key === c.key ? (
                            sort.dir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === "Enter") onRowClick(row);
                          }
                        : undefined
                    }
                    className={cn("transition-app", onRowClick && "cursor-pointer hover:bg-accent/40")}
                  >
                    {visibleColumns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn(dense ? "py-2" : "py-2.5", c.hideBelow && hideClass[c.hideBelow], c.className)}
                      >
                        {c.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-2 sm:hidden">
            {paged.map((row) => {
              const primary = visibleColumns.find((c) => c.primary) ?? visibleColumns[0];
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className="panel space-y-2 p-3 text-left transition-app hover:border-border-strong"
                >
                  <div className="text-sm font-medium">{primary?.render(row)}</div>
                  <dl className="grid grid-cols-2 gap-2">
                    {visibleColumns
                      .filter((c) => c.key !== primary?.key)
                      .slice(0, 5)
                      .map((c) => (
                        <div key={c.key}>
                          <dt className="label-caps">{c.header}</dt>
                          <dd className="text-xs">{c.render(row)}</dd>
                        </div>
                      ))}
                  </dl>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                Previous
              </Button>
              <span className="num">
                Page {current} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={current >= totalPages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
