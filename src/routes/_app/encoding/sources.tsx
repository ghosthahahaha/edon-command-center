import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DEPARTMENTS, formatDate, relativeTime, type SourceDoc } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/encoding/sources")({
  head: () => ({
    meta: [
      { title: "Sources library — EDON" },
      { name: "description", content: "Upload and govern institutional source documents with page-level provenance and freshness tracking." },
      { property: "og:title", content: "Sources library — EDON" },
      { property: "og:description", content: "Upload and govern institutional source documents with page-level provenance and freshness tracking." },
    ],
  }),
  component: Sources,
});

function Sources() {
  const { sources, uploadSource, advanceJobs } = useEdon();
  const [preview, setPreview] = React.useState<SourceDoc | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const columns: Column<SourceDoc>[] = [
    { key: "name", header: "Source", primary: true, render: (r) => <span className="text-sm font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "type", header: "Type", render: (r) => <span className="text-xs">{r.fileType}</span>, hideBelow: "md" },
    { key: "extraction", header: "Extraction", render: (r) => <StatusPill value={r.extraction} /> },
    { key: "owner", header: "Owner", render: (r) => <span className="text-xs">{r.owner}</span>, hideBelow: "lg" },
    { key: "authority", header: "Authority", render: (r) => <span className="text-xs">{r.authority}</span>, hideBelow: "lg" },
    { key: "effective", header: "Effective", render: (r) => <span className="text-xs">{formatDate(r.effectiveDate)}</span>, hideBelow: "xl" },
    { key: "hash", header: "Hash", render: (r) => <span className="num text-xs text-muted-foreground">{r.hash}</span>, hideBelow: "xl" },
    { key: "sync", header: "Last sync", render: (r) => <span className="text-xs text-muted-foreground">{relativeTime(r.lastSync)}</span>, hideBelow: "md" },
    { key: "fresh", header: "Freshness", render: (r) => <StatusPill value={r.freshness} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Integration & Encoding", to: "/encoding" }, { label: "Sources" }]}
        title="Sources library"
        description="PDF, DOCX, XLSX, CSV, JSON and image sources with OCR extraction and page-level grounding."
        meta={<SyntheticNote />}
        actions={
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> Upload source
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.xlsx,.csv,.json,.png,.jpg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const ext = (file.name.split(".").pop() ?? "pdf").toUpperCase();
          const map: Record<string, SourceDoc["fileType"]> = { PDF: "PDF", DOCX: "DOCX", XLSX: "XLSX", CSV: "CSV", JSON: "JSON" };
          uploadSource(file.name, map[ext] ?? "Image", "Care Management");
          toast.success(`Extraction job created for ${file.name}.`);
          e.target.value = "";
        }}
      />

      <Panel
        title="Upload area"
        description="Drop a document to create an extraction job. Imported content remains Candidate IR until approved."
        actions={
          <Button variant="outline" size="sm" onClick={() => { advanceJobs(); toast.success("Extraction progress advanced."); }}>
            Advance jobs
          </Button>
        }
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-border bg-surface-subtle px-6 py-8 text-center text-sm text-muted-foreground transition-app hover:border-primary/40"
        >
          Click to select a file — PDF, DOCX, XLSX, CSV, JSON or image
        </button>
      </Panel>

      <Panel title="Governed sources">
        <DataTable
          rows={sources}
          columns={columns}
          searchKeys={(r) => `${r.name} ${r.owner} ${r.department} ${r.fileType}`}
          filters={[
            { key: "dept", label: "Department", options: [...DEPARTMENTS], match: (r, v) => r.department === v },
            { key: "extraction", label: "Extraction", options: ["Complete", "Processing", "Queued", "Failed"], match: (r, v) => r.extraction === v },
            { key: "fresh", label: "Freshness", options: ["Fresh", "Aging", "Stale"], match: (r, v) => r.freshness === v },
          ]}
          onRowClick={(r) => setPreview(r)}
        />
      </Panel>

      <Sheet open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <SheetContent side="right" className="w-full overflow-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-base">{preview?.name}</SheetTitle>
            <SheetDescription className="text-xs">
              {preview?.pages} pages · {preview?.sizeKb} KB · {preview?.hash}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 p-4">
            {preview?.excerpts.map((ex) => (
              <div key={ex.page} className="rounded-xl border border-border p-3">
                <p className="label-caps">Page {ex.page}</p>
                <p className="mt-1 text-sm">{ex.text}</p>
              </div>
            ))}
            <Link to="/encoding/ir/$id" params={{ id: "IR-2048" }} className="text-sm text-primary-dark hover:underline">
              Open related candidate IR package
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
