/**
 * EDON demo state layer.
 * Mock data stays immutable; every user interaction is stored as a patch and
 * persisted to localStorage so the demo survives reloads.
 */
import * as React from "react";

import {
  AGENTS,
  CONNECTORS,
  DEMO_NOW,
  EVIDENCE_PACKAGES,
  INCIDENTS,
  IR_PACKAGES,
  POLICIES,
  QUEUE_ITEMS,
  SIM_SCENARIOS,
  SOURCES,
  CURRENT_USER,
  type Agent,
  type Connector,
  type Department,
  type Environment,
  type EvidencePackage,
  type Incident,
  type IRPackage,
  type Lifecycle,
  type Policy,
  type QueueItem,
  type RiskLevel,
  type SimScenario,
  type SourceDoc,
} from "./mock-data";

const KEY = "edon.demo.state.v1";

export interface ExtractionJob {
  id: string;
  sourceName: string;
  startedAt: string;
  status: "Queued" | "Extracting" | "Complete" | "Failed";
  pages: number;
  progress: number;
}

export interface SimResult {
  scenarioId: string;
  runAt: string;
  modelCandidate: string;
  compiler: string;
  kernel: "ALLOW" | "BLOCK" | "REQUIRE_APPROVAL";
  humanRequired: string;
  failedConditions: string[];
  risk: RiskLevel;
  consequences: string[];
  changedFields: { path: string; before: string; after: string }[];
  causalPath: string[];
  trace: { step: string; detail: string; ms: number }[];
}

export interface SavedView {
  id: string;
  name: string;
  route: string;
  filters: Record<string, string>;
}

export interface Notification {
  id: string;
  at: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
  read: boolean;
}

interface State {
  environment: Environment;
  lockdown: boolean;
  agentPatches: Record<string, Partial<Agent>>;
  newAgents: Agent[];
  queuePatches: Record<string, Partial<QueueItem>>;
  policyPatches: Record<string, Partial<Policy>>;
  incidentPatches: Record<string, Partial<Incident>>;
  connectorPatches: Record<string, Partial<Connector>>;
  irPatches: Record<string, Partial<IRPackage>>;
  newSources: SourceDoc[];
  jobs: ExtractionJob[];
  simResults: Record<string, SimResult>;
  newScenarios: SimScenario[];
  scenarioPatches: Record<string, Partial<SimScenario>>;
  newEvidence: EvidencePackage[];
  savedViews: SavedView[];
  notifications: Notification[];
  sidebarCollapsed: boolean;
}

const initialState: State = {
  environment: "Sandbox",
  lockdown: false,
  agentPatches: {},
  newAgents: [],
  queuePatches: {},
  policyPatches: {},
  incidentPatches: {},
  connectorPatches: {},
  irPatches: {},
  newSources: [],
  jobs: [],
  simResults: {},
  newScenarios: [],
  scenarioPatches: {},
  newEvidence: [],
  savedViews: [
    {
      id: "sv-1",
      name: "Blocked production decisions",
      route: "/audit",
      filters: { kernelResult: "BLOCK", environment: "Production" },
    },
  ],
  notifications: [
    {
      id: "nt-1",
      at: DEMO_NOW.toISOString(),
      title: "Drift threshold exceeded",
      detail: "Imaging Routing Agent PSI 0.21 — incident INC-9001 opened.",
      tone: "danger",
      read: false,
    },
    {
      id: "nt-2",
      at: DEMO_NOW.toISOString(),
      title: "2 approvals near SLA",
      detail: "Cardiology promotion and Medication Policy v6 are due within 10 hours.",
      tone: "warning",
      read: false,
    },
  ],
  sidebarCollapsed: false,
};

type Ctx = {
  state: State;
  set: (fn: (draft: State) => State) => void;
  reset: () => void;
  /* derived collections */
  agents: Agent[];
  queue: QueueItem[];
  policies: Policy[];
  incidents: Incident[];
  connectors: Connector[];
  irPackages: IRPackage[];
  sources: SourceDoc[];
  scenarios: SimScenario[];
  evidence: EvidencePackage[];
  /* actions */
  setEnvironment: (env: Environment) => void;
  toggleLockdown: (on: boolean) => void;
  decideQueueItem: (
    id: string,
    decision: "Approved" | "Denied" | "Changes requested" | "Escalated",
    reason: string,
  ) => void;
  commentOnQueueItem: (id: string, text: string) => void;
  registerAgent: (input: RegisterAgentInput) => Agent;
  patchAgent: (id: string, patch: Partial<Agent>) => void;
  quarantineAgent: (id: string, on: boolean) => void;
  publishPolicy: (id: string, notes: string) => void;
  patchPolicy: (id: string, patch: Partial<Policy>) => void;
  uploadSource: (name: string, fileType: SourceDoc["fileType"], department: Department) => SourceDoc;
  advanceJobs: () => void;
  activateIR: (id: string) => void;
  patchIR: (id: string, patch: Partial<IRPackage>) => void;
  patchConnector: (id: string, patch: Partial<Connector>) => void;
  resolveIncident: (id: string, note: string) => void;
  patchIncident: (id: string, patch: Partial<Incident>) => void;
  runSimulation: (scenario: SimScenario) => SimResult;
  saveScenario: (scenario: SimScenario) => void;
  addEvidence: (pkg: EvidencePackage) => void;
  addSavedView: (view: SavedView) => void;
  removeSavedView: (id: string) => void;
  notify: (n: Omit<Notification, "id" | "at" | "read">) => void;
  markNotificationsRead: () => void;
  setSidebarCollapsed: (v: boolean) => void;
};

const EdonContext = React.createContext<Ctx | null>(null);

export interface RegisterAgentInput {
  name: string;
  purpose: string;
  owner: string;
  department: Department;
  model: string;
  runtime: string;
  systems: string[];
  dataClasses: string[];
  capabilities: Agent["capabilities"];
  policyPack: string;
  approver: string;
  risk: RiskLevel;
}

function merge<T extends { id: string }>(base: T[], patches: Record<string, Partial<T>>): T[] {
  return base.map((item) => (patches[item.id] ? { ...item, ...patches[item.id] } : item));
}

export function EdonProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(initialState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore corrupted demo state */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full — demo continues in memory */
    }
  }, [state, hydrated]);

  const set = React.useCallback((fn: (draft: State) => State) => setState((s) => fn(s)), []);

  const value = React.useMemo<Ctx>(() => {
    const agents = [...state.newAgents, ...merge(AGENTS, state.agentPatches)];
    const queue = merge(QUEUE_ITEMS, state.queuePatches);
    const policies = merge(POLICIES, state.policyPatches);
    const incidents = merge(INCIDENTS, state.incidentPatches);
    const connectors = merge(CONNECTORS, state.connectorPatches);
    const irPackages = merge(IR_PACKAGES, state.irPatches);
    const sources = [...state.newSources, ...SOURCES];
    const scenarios = [...state.newScenarios, ...merge(SIM_SCENARIOS, state.scenarioPatches)];
    const evidence = [...state.newEvidence, ...EVIDENCE_PACKAGES];

    const notify: Ctx["notify"] = (n) =>
      set((s) => ({
        ...s,
        notifications: [
          { ...n, id: `nt-${Date.now()}`, at: new Date().toISOString(), read: false },
          ...s.notifications,
        ].slice(0, 30),
      }));

    return {
      state,
      set,
      reset: () => setState(initialState),
      agents,
      queue,
      policies,
      incidents,
      connectors,
      irPackages,
      sources,
      scenarios,
      evidence,
      setEnvironment: (environment) => set((s) => ({ ...s, environment })),
      toggleLockdown: (on) =>
        set((s) => ({
          ...s,
          lockdown: on,
          environment: on ? "Audit-only" : s.environment,
        })),
      decideQueueItem: (id, decision, reason) =>
        set((s) => {
          const existing = s.queuePatches[id] ?? {};
          const item = QUEUE_ITEMS.find((q) => q.id === id);
          const timeline = [
            ...(existing.timeline ?? item?.timeline ?? []),
            {
              id: `tl-${Date.now()}`,
              at: new Date().toISOString(),
              actor: CURRENT_USER.name,
              action: decision,
              detail: reason || "No reason recorded.",
            },
          ];
          return {
            ...s,
            queuePatches: { ...s.queuePatches, [id]: { ...existing, status: decision, timeline } },
          };
        }),
      commentOnQueueItem: (id, text) =>
        set((s) => {
          const existing = s.queuePatches[id] ?? {};
          const item = QUEUE_ITEMS.find((q) => q.id === id);
          return {
            ...s,
            queuePatches: {
              ...s.queuePatches,
              [id]: {
                ...existing,
                comments: [
                  ...(existing.comments ?? item?.comments ?? []),
                  { id: `cm-${Date.now()}`, author: CURRENT_USER.name, at: new Date().toISOString(), text },
                ],
              },
            },
          };
        }),
      registerAgent: (input) => {
        const id = `AGT-${9000 + state.newAgents.length}`;
        const agent: Agent = {
          id,
          name: input.name,
          purpose: input.purpose,
          status: "Audit-only",
          lifecycle: "Audit-only",
          health: "Healthy",
          owner: input.owner,
          department: input.department,
          scope: `${input.department} · department resources only`,
          version: "v0.1",
          source: "Registered via wizard",
          risk: input.risk,
          requiredApprovals: [input.approver, "Clinical Safety Approver"],
          effectiveDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          history: [
            {
              id: "h0",
              at: new Date().toISOString(),
              actor: CURRENT_USER.name,
              action: "Registered",
              detail: `${input.name} created in audit-only mode.`,
            },
          ],
          model: input.model,
          runtime: input.runtime,
          policyPack: input.policyPack,
          dataClasses: input.dataClasses,
          systems: input.systems,
          capabilities: input.capabilities,
          latencyMs: 480,
          errorRate: 0,
          denials7d: 0,
          decisions7d: 0,
          approvalRate: 100,
          drift: 0,
          blastRadius: "Contained",
        };
        set((s) => ({ ...s, newAgents: [agent, ...s.newAgents] }));
        return agent;
      },
      patchAgent: (id, patch) =>
        set((s) => ({
          ...s,
          agentPatches: { ...s.agentPatches, [id]: { ...s.agentPatches[id], ...patch } },
          newAgents: s.newAgents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      quarantineAgent: (id, on) =>
        set((s) => ({
          ...s,
          agentPatches: {
            ...s.agentPatches,
            [id]: {
              ...s.agentPatches[id],
              quarantined: on,
              health: on ? "Failing" : "Healthy",
              status: on ? "Quarantined" : "Production",
              lifecycle: (on ? "Audit-only" : "Production") as Lifecycle,
            },
          },
          newAgents: s.newAgents.map((a) =>
            a.id === id ? { ...a, quarantined: on, status: on ? "Quarantined" : a.lifecycle } : a,
          ),
        })),
      publishPolicy: (id, notes) =>
        set((s) => {
          const base = POLICIES.find((p) => p.id === id);
          const current = s.policyPatches[id] ?? {};
          const currentVersion = current.version ?? base?.version ?? "v1";
          const num = Number(currentVersion.replace(/[^0-9]/g, "")) || 1;
          const nextVersion = `v${num + 1}`;
          return {
            ...s,
            policyPatches: {
              ...s.policyPatches,
              [id]: {
                ...current,
                version: nextVersion,
                status: "Active",
                lastUpdated: new Date().toISOString(),
                history: [
                  {
                    id: `ph-${Date.now()}`,
                    at: new Date().toISOString(),
                    actor: CURRENT_USER.name,
                    action: `Published ${nextVersion}`,
                    detail: notes || "Published from policy builder.",
                  },
                  ...(current.history ?? base?.history ?? []),
                ],
              },
            },
          };
        }),
      patchPolicy: (id, patch) =>
        set((s) => ({
          ...s,
          policyPatches: { ...s.policyPatches, [id]: { ...s.policyPatches[id], ...patch } },
        })),
      uploadSource: (name, fileType, department) => {
        const id = `SRC-${900 + state.newSources.length}`;
        const doc: SourceDoc = {
          id,
          name,
          fileType,
          status: "Extracting",
          owner: CURRENT_USER.name,
          department,
          scope: department,
          version: "0.1",
          source: "Manual upload",
          risk: "Moderate",
          requiredApprovals: ["Department Owner"],
          effectiveDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          authority: "Department",
          extraction: "Queued",
          pages: 6 + (name.length % 20),
          hash: `sha256:${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
          lastSync: new Date().toISOString(),
          freshness: "Fresh",
          sizeKb: 200 + (name.length % 50) * 17,
          excerpts: [
            { page: 1, text: "Synthetic demo excerpt — extraction in progress." },
          ],
          history: [
            {
              id: "sh0",
              at: new Date().toISOString(),
              actor: CURRENT_USER.name,
              action: "Uploaded",
              detail: "Extraction job created.",
            },
          ],
        };
        const job: ExtractionJob = {
          id: `JOB-${Date.now().toString().slice(-5)}`,
          sourceName: name,
          startedAt: new Date().toISOString(),
          status: "Extracting",
          pages: doc.pages,
          progress: 12,
        };
        set((s) => ({ ...s, newSources: [doc, ...s.newSources], jobs: [job, ...s.jobs] }));
        return doc;
      },
      advanceJobs: () =>
        set((s) => ({
          ...s,
          jobs: s.jobs.map((j) => {
            if (j.status === "Complete" || j.status === "Failed") return j;
            const progress = Math.min(100, j.progress + 22);
            return { ...j, progress, status: progress >= 100 ? "Complete" : "Extracting" };
          }),
          newSources: s.newSources.map((doc) => {
            const job = s.jobs.find((j) => j.sourceName === doc.name);
            if (job && job.progress + 22 >= 100)
              return { ...doc, extraction: "Complete", status: "Candidate IR" };
            return doc;
          }),
        })),
      activateIR: (id) =>
        set((s) => ({
          ...s,
          irPatches: {
            ...s.irPatches,
            [id]: {
              ...s.irPatches[id],
              status: "Active",
              lastUpdated: new Date().toISOString(),
            },
          },
        })),
      patchIR: (id, patch) =>
        set((s) => ({ ...s, irPatches: { ...s.irPatches, [id]: { ...s.irPatches[id], ...patch } } })),
      patchConnector: (id, patch) =>
        set((s) => ({
          ...s,
          connectorPatches: { ...s.connectorPatches, [id]: { ...s.connectorPatches[id], ...patch } },
        })),
      resolveIncident: (id, note) =>
        set((s) => {
          const base = INCIDENTS.find((i) => i.id === id);
          const current = s.incidentPatches[id] ?? {};
          return {
            ...s,
            incidentPatches: {
              ...s.incidentPatches,
              [id]: {
                ...current,
                status: "Resolved",
                timeline: [
                  ...(current.timeline ?? base?.timeline ?? []),
                  {
                    id: `it-${Date.now()}`,
                    at: new Date().toISOString(),
                    actor: CURRENT_USER.name,
                    action: "Resolved",
                    detail: note || "Resolved after containment verification.",
                  },
                ],
              },
            },
          };
        }),
      patchIncident: (id, patch) =>
        set((s) => ({
          ...s,
          incidentPatches: { ...s.incidentPatches, [id]: { ...s.incidentPatches[id], ...patch } },
        })),
      runSimulation: (scenario) => {
        const seed = scenario.events.length + scenario.name.length;
        const blocking = scenario.events.some((e) =>
          ["Revocation", "Malformed request", "Deadline"].includes(e.kind),
        );
        const needsApproval = scenario.events.some((e) =>
          ["Policy change", "Approval", "Appeal"].includes(e.kind),
        );
        const kernel: SimResult["kernel"] = blocking
          ? "BLOCK"
          : needsApproval
            ? "REQUIRE_APPROVAL"
            : "ALLOW";
        const result: SimResult = {
          scenarioId: scenario.id,
          runAt: new Date().toISOString(),
          modelCandidate: blocking
            ? "Candidate recommends halting the workflow and notifying the department owner."
            : "Candidate recommends proceeding with human confirmation on each care-affecting step.",
          compiler: `Compiled ${scenario.events.length} events against ${scenario.policyVersion} and ${scenario.irVersion}.`,
          kernel,
          humanRequired:
            kernel === "ALLOW"
              ? "No additional human approval required in this scenario."
              : "Department Owner + Clinical Safety Approver must record a written decision.",
          failedConditions: blocking
            ? [
                "consent_state == current",
                "escalation_window <= 10m",
                "input_schema_valid == true",
              ].slice(0, 1 + (seed % 3))
            : [],
          risk: blocking ? "High" : needsApproval ? "Moderate" : "Low",
          consequences: blocking
            ? [
                "Workflow halted before any state change",
                "Incident candidate raised for department review",
                "Audit event recorded with correlation ID",
              ]
            : [
                "Candidate output queued for human confirmation",
                "No production state modified (hypothetical run)",
              ],
          changedFields: [
            { path: "agent.lifecycle", before: scenario.environment, after: scenario.environment },
            {
              path: "policy.effect",
              before: "Require Approval",
              after: kernel === "BLOCK" ? "Block" : "Require Approval",
            },
            { path: "routing.escalation_minutes", before: "15", after: blocking ? "10" : "15" },
          ],
          causalPath: [
            `Event: ${scenario.events[0]?.kind ?? "Initial state"}`,
            "Policy evaluation: Clinical Safety envelope applied",
            "Precedence: enterprise baseline overrides department rule",
            `Kernel decision: ${kernel}`,
          ],
          trace: [
            { step: "Load baseline context", detail: `${scenario.agent} · ${scenario.department}`, ms: 12 },
            { step: "Resolve policy pack", detail: scenario.policyVersion, ms: 28 },
            { step: "Apply candidate IR", detail: scenario.irVersion, ms: 19 },
            { step: "Evaluate events", detail: `${scenario.events.length} events replayed`, ms: 64 },
            { step: "Deterministic Kernel", detail: kernel, ms: 9 },
          ],
        };
        set((s) => ({
          ...s,
          simResults: { ...s.simResults, [scenario.id]: result },
          scenarioPatches: {
            ...s.scenarioPatches,
            [scenario.id]: {
              ...s.scenarioPatches[scenario.id],
              status: kernel === "BLOCK" ? "Failed" : kernel === "ALLOW" ? "Passed" : "Needs review",
              lastRun: new Date().toISOString(),
            },
          },
        }));
        return result;
      },
      saveScenario: (scenario) =>
        set((s) => {
          const isKnown =
            SIM_SCENARIOS.some((x) => x.id === scenario.id) ||
            s.newScenarios.some((x) => x.id === scenario.id);
          return isKnown
            ? {
                ...s,
                scenarioPatches: {
                  ...s.scenarioPatches,
                  [scenario.id]: { ...s.scenarioPatches[scenario.id], ...scenario },
                },
                newScenarios: s.newScenarios.map((x) => (x.id === scenario.id ? scenario : x)),
              }
            : { ...s, newScenarios: [scenario, ...s.newScenarios] };
        }),
      addEvidence: (pkg) => set((s) => ({ ...s, newEvidence: [pkg, ...s.newEvidence] })),
      addSavedView: (view) => set((s) => ({ ...s, savedViews: [...s.savedViews, view] })),
      removeSavedView: (id) =>
        set((s) => ({ ...s, savedViews: s.savedViews.filter((v) => v.id !== id) })),
      notify,
      markNotificationsRead: () =>
        set((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      setSidebarCollapsed: (v) => set((s) => ({ ...s, sidebarCollapsed: v })),
    };
  }, [state, set]);

  return <EdonContext.Provider value={value}>{children}</EdonContext.Provider>;
}

export function useEdon() {
  const ctx = React.useContext(EdonContext);
  if (!ctx) throw new Error("useEdon must be used inside <EdonProvider>");
  return ctx;
}

/** Pending queue items, respecting recorded decisions. */
export function usePendingQueue() {
  const { queue } = useEdon();
  return queue.filter((q) => q.status === "Pending");
}

/** Downloads a mock export file so export buttons produce a real artifact. */
export function downloadMockFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}
