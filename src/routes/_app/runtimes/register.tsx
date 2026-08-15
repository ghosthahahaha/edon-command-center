import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader, Panel, SyntheticNote } from "@/components/common/Bits";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEPARTMENTS, PEOPLE, type Department, type RiskLevel } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";

export const Route = createFileRoute("/_app/runtimes/register")({
  head: () => ({
    meta: [
      { title: "Register agent — EDON" },
      { name: "description", content: "Ten-step registration wizard with preflight checks; agents always enter EDON in audit-only mode." },
      { property: "og:title", content: "Register agent — EDON" },
      { property: "og:description", content: "Ten-step registration wizard with preflight checks; agents always enter EDON in audit-only mode." },
    ],
  }),
  component: RegisterWizard,
});

const STEPS = [
  "Identity & purpose",
  "Owner & department",
  "Model & runtime",
  "Systems & connectors",
  "Data classifications",
  "Capabilities & scopes",
  "Policy pack",
  "Approval owner",
  "Preflight",
  "Simulation",
];

const PREFLIGHT = [
  "Purpose mismatch",
  "Overly broad permissions",
  "PHI egress",
  "Unapproved external LLM use",
  "Missing owner",
  "Missing approver",
  "Policy conflict",
  "Excessive blast radius",
];

function RegisterWizard() {
  const { registerAgent } = useEdon();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    name: "",
    purpose: "",
    owner: PEOPLE[1]!.name,
    department: "Cardiology" as Department,
    model: "edon-clinical-7b (on-prem)",
    runtime: "EDON Runtime 4.2",
    systems: "Epic FHIR",
    dataClasses: "PHI",
    capability: "Read department records",
    policyPack: "Clinical Safety Pack v12",
    approver: "Clinical Safety Approver",
    risk: "High" as RiskLevel,
  });
  const [errors, setErrors] = React.useState<string[]>([]);

  const findings = PREFLIGHT.map((f) => {
    const blocking =
      (f === "Missing owner" && !form.owner) ||
      (f === "PHI egress" && form.dataClasses.includes("PHI") && form.model.includes("BAA") === false && form.model.includes("on-prem") === false);
    return { name: f, result: blocking ? "Fail" : "Pass" };
  });

  const validate = () => {
    const e: string[] = [];
    if (form.name.trim().length < 4) e.push("Agent name must be at least 4 characters.");
    if (form.purpose.trim().length < 12) e.push("Purpose statement must be at least 12 characters.");
    setErrors(e);
    return e.length === 0;
  };

  const submit = () => {
    if (!validate()) {
      setStep(0);
      toast.error("Fix the validation errors before submitting.");
      return;
    }
    const agent = registerAgent({
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      owner: form.owner,
      department: form.department,
      model: form.model,
      runtime: form.runtime,
      systems: form.systems.split(",").map((s) => s.trim()),
      dataClasses: form.dataClasses.split(",").map((s) => s.trim()),
      capabilities: [{ name: form.capability, access: "Read", scope: `${form.department}/*` }],
      policyPack: form.policyPack,
      approver: form.approver,
      risk: form.risk,
    });
    toast.success(`${agent.name} registered in audit-only mode.`);
    void navigate({ to: "/runtimes/$id", params: { id: agent.id } });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "EDON", to: "/dashboard" }, { label: "Agents & Runtimes", to: "/runtimes" }, { label: "Register" }]}
        title="Register agent"
        description="Registration submits the agent in audit-only mode. No execution occurs until promotion is approved."
        meta={<SyntheticNote />}
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Panel title="Steps" bodyClassName="p-2">
          <ol className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-app ${
                    i === step ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <span className="num w-4 text-right">{i + 1}</span>
                  {s}
                  {i < step && <Check className="ml-auto size-3 text-primary" />}
                </button>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title={STEPS[step]}>
          <div className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Agent name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cardiology Follow-up Assistant" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="purpose">Declared purpose *</Label>
                  <Textarea id="purpose" rows={3} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="What this agent does and which humans confirm its output" />
                </div>
                {errors.length > 0 && (
                  <ul className="space-y-1 text-xs text-destructive">
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Owner</Label>
                  <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v as Department })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Model</Label>
                  <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Runtime</Label>
                  <Input value={form.runtime} onChange={(e) => setForm({ ...form, runtime: e.target.value })} />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-1.5">
                <Label>Systems & connectors (comma separated)</Label>
                <Input value={form.systems} onChange={(e) => setForm({ ...form, systems: e.target.value })} />
              </div>
            )}
            {step === 4 && (
              <div className="space-y-1.5">
                <Label>Data classifications</Label>
                <Input value={form.dataClasses} onChange={(e) => setForm({ ...form, dataClasses: e.target.value })} />
              </div>
            )}
            {step === 5 && (
              <div className="space-y-1.5">
                <Label>Capability & exact scope</Label>
                <Input value={form.capability} onChange={(e) => setForm({ ...form, capability: e.target.value })} />
                <p className="text-xs text-muted-foreground">Scope resolves to {form.department}/* — narrower scopes reduce blast radius.</p>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-1.5">
                <Label>Policy pack</Label>
                <Input value={form.policyPack} onChange={(e) => setForm({ ...form, policyPack: e.target.value })} />
              </div>
            )}
            {step === 7 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Approval owner</Label>
                  <Input value={form.approver} onChange={(e) => setForm({ ...form, approver: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Risk classification</Label>
                  <Select value={form.risk} onValueChange={(v) => setForm({ ...form, risk: v as RiskLevel })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Low", "Moderate", "High", "Critical"].map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {step === 8 && (
              <ul className="space-y-2">
                {findings.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="flex-1">{f.name}</span>
                    <StatusPill value={f.result} />
                  </li>
                ))}
              </ul>
            )}
            {step === 9 && (
              <div className="space-y-3 text-sm">
                <p className="rounded-xl border border-info/25 bg-info/10 p-3 text-info">
                  HYPOTHETICAL · NON-BINDING — a sandbox suite will run 12 scenarios against this configuration.
                </p>
                <p className="text-muted-foreground">
                  Submitting registers the agent in audit-only mode and creates an approval item for {form.approver}.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => { if (step === 0 && !validate()) return; setStep(step + 1); }}>
                  Continue
                </Button>
              ) : (
                <Button size="sm" onClick={submit}>
                  Submit in audit-only mode
                </Button>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
