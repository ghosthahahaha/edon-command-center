/**
 * EDON — centralized mock-data layer.
 * SYNTHETIC DEMO DATA ONLY. No real patient information is present anywhere.
 * Reference date for the demo: 2026-08-15.
 */

export const DEMO_NOW = new Date("2026-08-15T08:20:00Z");

export type Environment = "Audit-only" | "Sandbox" | "Pilot" | "Production";
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type Health = "Healthy" | "Degraded" | "Failing" | "Unknown";
export type Lifecycle = "Draft" | "Audit-only" | "Sandbox" | "Pilot" | "Production" | "Retired";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

/** Fields every governed EDON object exposes. */
export interface CoreEntity {
  id: string;
  name: string;
  status: string;
  owner: string;
  department: Department;
  scope: string;
  version: string;
  source: string;
  risk: RiskLevel;
  requiredApprovals: string[];
  effectiveDate: string;
  lastUpdated: string;
  history: AuditEntry[];
}

export const DEPARTMENTS = [
  "Cardiology",
  "Clinical Lab",
  "Pharmacy",
  "Radiology",
  "Emergency Medicine",
  "Oncology",
  "Revenue Cycle",
  "Care Management",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const TENANT = {
  id: "tnt_stmercy",
  name: "St. Mercy Health",
  region: "US-East (Virginia)",
  residency: "United States",
  retentionYears: 7,
  timezone: "America/Chicago",
  governedAgents: 500,
  departments: DEPARTMENTS.length,
};

export const CURRENT_USER = {
  id: "usr_mchen",
  name: "Dr. Maya Chen",
  initials: "MC",
  role: "Chief Clinical AI Safety Officer",
  email: "maya.chen@stmercy.example",
  department: "Care Management" as Department,
};

export const PEOPLE = [
  { id: "usr_mchen", name: "Dr. Maya Chen", role: "Chief Clinical AI Safety Officer" },
  { id: "usr_rokafor", name: "Dr. Rachel Okafor", role: "Cardiology Informatics Lead" },
  { id: "usr_jlindqvist", name: "Jonas Lindqvist", role: "Platform Reliability Engineer" },
  { id: "usr_aparikh", name: "Anita Parikh, PharmD", role: "Pharmacy Governance Owner" },
  { id: "usr_dmercer", name: "Dana Mercer", role: "Revenue Cycle Director" },
  { id: "usr_tnguyen", name: "Dr. Thanh Nguyen", role: "Radiology AI Steward" },
  { id: "usr_ebarnes", name: "Elise Barnes", role: "Compliance & Privacy Officer" },
  { id: "usr_kdoyle", name: "Kevin Doyle", role: "Clinical Lab Systems Manager" },
  { id: "usr_svaldez", name: "Sofia Valdez", role: "Emergency Operations Manager" },
  { id: "usr_hpatel", name: "Dr. Hari Patel", role: "Oncology Research Director" },
];

export const ROLES = [
  "Governance Administrator",
  "Clinical Safety Approver",
  "Department Owner",
  "Auditor (read-only)",
  "Runtime Engineer",
  "Privacy Officer",
];

/* --------------------------------- utils --------------------------------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rand = rng(20260815);
/** Safe cyclic array access (project enables noUncheckedIndexedAccess). */
export const at = <T,>(arr: readonly T[], i: number): T =>
  arr[((Math.floor(i) % arr.length) + arr.length) % arr.length] as T;
const pick = <T,>(arr: readonly T[], r = rand()): T => at(arr, r * arr.length);


export function daysAgo(n: number, hour = 9) {
  const d = new Date(DEMO_NOW);
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour, (n * 7) % 60, 0, 0);
  return d.toISOString();
}
export function hoursAgo(n: number) {
  const d = new Date(DEMO_NOW.getTime() - n * 3600_000);
  return d.toISOString();
}
export function daysAhead(n: number) {
  return daysAgo(-n, 12);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
export function relativeTime(iso: string) {
  const diff = DEMO_NOW.getTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return mins <= 0 ? `in ${-mins}m` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 48) return hrs <= 0 ? `in ${-hrs}h` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days <= 0 ? `in ${-days}d` : `${days}d ago`;
}

/* --------------------------------- agents --------------------------------- */

export interface Agent extends CoreEntity {
  purpose: string;
  lifecycle: Lifecycle;
  health: Health;
  model: string;
  runtime: string;
  policyPack: string;
  dataClasses: string[];
  systems: string[];
  capabilities: { name: string; access: "Read" | "Write" | "Execute"; scope: string }[];
  latencyMs: number;
  errorRate: number;
  denials7d: number;
  decisions7d: number;
  approvalRate: number;
  drift: number;
  blastRadius: "Contained" | "Departmental" | "Cross-department" | "Enterprise";
  quarantined?: boolean;
}

const MODELS = [
  "edon-clinical-7b (on-prem)",
  "gpt-clinical-secure (BAA)",
  "med-reasoner-v3 (on-prem)",
  "claude-clinical (BAA)",
];
const RUNTIMES = ["EDON Runtime 4.2", "EDON Runtime 4.1", "EDON Edge Runtime 2.6"];
const DATA_CLASSES = ["PHI", "De-identified", "Operational", "Financial", "Research"];
const SYSTEMS = [
  "Epic FHIR",
  "Secure Lab SFTP",
  "PostgreSQL Warehouse",
  "Microsoft Teams",
  "Claims REST API",
  "Document Repository",
];

const FEATURED_AGENTS: {
  name: string;
  department: Department;
  purpose: string;
  lifecycle: Lifecycle;
  risk: RiskLevel;
  health: Health;
}[] = [
  {
    name: "Lab Note Drafting Agent",
    department: "Clinical Lab",
    purpose: "Drafts structured lab interpretation notes for pathologist review.",
    lifecycle: "Production",
    risk: "Moderate",
    health: "Healthy",
  },
  {
    name: "Cardiology Triage Agent",
    department: "Cardiology",
    purpose: "Ranks inbound cardiology referrals by acuity signals for nurse triage.",
    lifecycle: "Pilot",
    risk: "High",
    health: "Healthy",
  },
  {
    name: "Medication Reconciliation Agent",
    department: "Pharmacy",
    purpose: "Proposes medication reconciliation deltas at admission and discharge.",
    lifecycle: "Production",
    risk: "High",
    health: "Degraded",
  },
  {
    name: "Imaging Routing Agent",
    department: "Radiology",
    purpose: "Routes imaging studies to sub-specialty worklists using protocol rules.",
    lifecycle: "Production",
    risk: "High",
    health: "Failing",
  },
  {
    name: "Discharge Planning Assistant",
    department: "Care Management",
    purpose: "Assembles discharge checklists and post-acute placement candidates.",
    lifecycle: "Production",
    risk: "Moderate",
    health: "Healthy",
  },
  {
    name: "Claims Coding Agent",
    department: "Revenue Cycle",
    purpose: "Suggests CPT/ICD code candidates for coder confirmation.",
    lifecycle: "Production",
    risk: "Moderate",
    health: "Healthy",
  },
  {
    name: "Oncology Trial Matching Agent",
    department: "Oncology",
    purpose: "Matches de-identified cohorts against open trial eligibility criteria.",
    lifecycle: "Sandbox",
    risk: "Critical",
    health: "Healthy",
  },
  {
    name: "Emergency Capacity Coordinator",
    department: "Emergency Medicine",
    purpose: "Forecasts ED bed capacity and surfaces diversion recommendations.",
    lifecycle: "Pilot",
    risk: "High",
    health: "Healthy",
  },
];

const AGENT_SUFFIXES = [
  "Summarization Agent",
  "Intake Assistant",
  "Prior Authorization Agent",
  "Order Review Agent",
  "Scheduling Optimizer",
  "Documentation Copilot",
  "Result Notification Agent",
  "Cohort Builder",
  "Utilization Review Agent",
  "Protocol Adherence Monitor",
  "Referral Router",
  "Charge Capture Agent",
];

function baseHistory(name: string, owner: string): AuditEntry[] {
  return [
    { id: "h1", at: daysAgo(2), actor: owner, action: "Configuration updated", detail: `${name} scope narrowed to department resources.` },
    { id: "h2", at: daysAgo(11), actor: CURRENT_USER.name, action: "Approved", detail: "Promotion approved with two-person review." },
    { id: "h3", at: daysAgo(38), actor: "EDON Deterministic Kernel", action: "Preflight passed", detail: "0 blocking findings, 2 advisories." },
    { id: "h4", at: daysAgo(64), actor: owner, action: "Registered", detail: `${name} registered in audit-only mode.` },
  ];
}

export const AGENTS: Agent[] = (() => {
  const out: Agent[] = [];
  const total = 500;
  for (let i = 0; i < total; i++) {
    const featured = FEATURED_AGENTS[i];
    const dept: Department = featured ? featured.department : at(DEPARTMENTS, i);
    const r = rand();
    const lifecycle: Lifecycle = featured
      ? featured.lifecycle
      : r > 0.24
        ? "Production"
        : r > 0.16
          ? "Pilot"
          : r > 0.09
            ? "Sandbox"
            : r > 0.04
              ? "Audit-only"
              : "Draft";
    const risk: RiskLevel = featured
      ? featured.risk
      : at(["Low", "Moderate", "Moderate", "High", "High", "Critical"] as RiskLevel[], rand() * 6);
    const health: Health = featured
      ? featured.health
      : rand() > 0.93
        ? "Degraded"
        : rand() > 0.985
          ? "Failing"
          : "Healthy";
    const owner = at(PEOPLE, i + 1).name;
    const name = featured
      ? featured.name
      : `${dept} ${at(AGENT_SUFFIXES, i)} ${String(Math.floor(i / AGENT_SUFFIXES.length) + 1).padStart(2, "0")}`;
    const id = `AGT-${String(1000 + i)}`;
    out.push({
      id,
      name,
      purpose:
        featured?.purpose ??
        `Assists ${dept} staff with ${at(AGENT_SUFFIXES, i).toLowerCase()} tasks under human confirmation.`,
      status: lifecycle,
      lifecycle,
      health,
      owner,
      department: dept,
      scope: `${dept} · department resources only`,
      version: `v${1 + (i % 6)}.${i % 10}`,
      source: featured ? "Registered via wizard" : "Bulk onboarding 2026-Q1",
      risk,
      requiredApprovals:
        risk === "Critical" || risk === "High"
          ? ["Department Owner", "Clinical Safety Approver", "Privacy Officer"]
          : ["Department Owner"],
      effectiveDate: daysAgo(30 + (i % 120)),
      lastUpdated: hoursAgo(1 + (i % 200)),
      history: baseHistory(name, owner),
      model: at(MODELS, i),
      runtime: at(RUNTIMES, i),
      policyPack: at(
        ["Clinical Safety Pack v12", "PHI Boundary Pack v7", "Revenue Integrity Pack v4"],
        i,
      ),
      dataClasses: [at(DATA_CLASSES, i), "Operational"].filter(
        (v, idx, a) => a.indexOf(v) === idx,
      ),
      systems: [at(SYSTEMS, i), at(SYSTEMS, i + 2)],
      capabilities: [
        { name: "Read department records", access: "Read", scope: `${dept}/*` },
        { name: "Draft note candidate", access: "Write", scope: "draft-only" },
        { name: "Notify care team", access: "Execute", scope: "teams:channel/care-team" },
      ],
      latencyMs: 320 + Math.floor(rand() * 900),
      errorRate: Number((rand() * 1.8).toFixed(2)),
      denials7d: Math.floor(rand() * 60),
      decisions7d: 400 + Math.floor(rand() * 9000),
      approvalRate: Number((80 + rand() * 19).toFixed(1)),
      drift: Number((rand() * 6).toFixed(2)),
      blastRadius: at(
        ["Contained", "Departmental", "Cross-department", "Enterprise"] as const,
        rand() * 4,
      ),
    });
  }
  return out;
})();

export const agentById = (id: string) => AGENTS.find((a) => a.id === id);
export const agentByName = (name: string) => AGENTS.find((a) => a.name === name);

/* -------------------------------- policies -------------------------------- */

export interface PolicyRule {
  id: string;
  action: string;
  effect: "Allow" | "Block" | "Require Approval";
  scope: string;
  conditions: string;
  dataClass: string;
  appliesTo: string;
  approverRole: string;
  priority: number;
  authority: string;
  rationale: string;
}

export interface Policy extends CoreEntity {
  summary: string;
  authority: string;
  immutableBaseline: boolean;
  affectedAgents: number;
  standards: string[];
  allow: string[];
  block: string[];
  confirm: string[];
  rules: PolicyRule[];
  conflicts: { id: string; with: string; severity: RiskLevel; detail: string }[];
  overrides: { agent: string; change: string; approvedBy: string }[];
  tests: { id: string; name: string; expected: string; result: "Pass" | "Fail" }[];
}

function mkRule(i: number, p: Partial<PolicyRule>): PolicyRule {
  return {
    id: `RUL-${100 + i}`,
    action: "read.patient_record",
    effect: "Require Approval",
    scope: "department",
    conditions: "data_class == PHI",
    dataClass: "PHI",
    appliesTo: "All agents",
    approverRole: "Clinical Safety Approver",
    priority: 10 + i,
    authority: "Clinical Safety Policy 2026.pdf §4.2",
    rationale: "Protects patient safety and privacy boundaries.",
    ...p,
  };
}

export const POLICIES: Policy[] = [
  {
    id: "POL-001",
    name: "Clinical Safety Mode v12",
    summary:
      "Baseline safety envelope for every clinical agent: no autonomous clinical action, mandatory human confirmation on care-affecting output.",
    status: "Active",
    owner: "Dr. Maya Chen",
    department: "Care Management",
    scope: "Enterprise · all clinical agents",
    version: "v12",
    source: "Clinical Safety Policy 2026.pdf",
    authority: "Board Clinical Safety Committee",
    risk: "Critical",
    requiredApprovals: ["Clinical Safety Approver", "Privacy Officer", "Board Delegate"],
    effectiveDate: daysAgo(60),
    lastUpdated: daysAgo(6),
    immutableBaseline: true,
    affectedAgents: 500,
    standards: ["HIPAA Security Rule", "ISO/IEC 42001", "NIST AI RMF", "Joint Commission"],
    allow: [
      "Draft clinical documentation as non-authoritative candidates",
      "Read department-scoped records for the assigned encounter",
      "Summarize evidence with page-level source citations",
      "Escalate to a named human owner at any time",
    ],
    block: [
      "Place, modify, or cancel any clinical order",
      "Transmit PHI to unapproved external model providers",
      "Auto-finalize documentation into the legal record",
      "Expand its own capability scope or approve its own promotion",
    ],
    confirm: [
      "Any output that changes a care plan",
      "Cross-department data access",
      "Medication-related recommendations",
      "Promotion beyond Pilot environment",
    ],
    rules: [
      mkRule(1, {
        action: "write.clinical_note",
        effect: "Require Approval",
        rationale: "Documentation entering the legal record requires clinician attestation.",
      }),
      mkRule(2, {
        action: "execute.order_entry",
        effect: "Block",
        approverRole: "—",
        rationale: "No autonomous order entry under any environment.",
        priority: 1,
      }),
      mkRule(3, {
        action: "read.department_record",
        effect: "Allow",
        conditions: "scope == assigned_department AND purpose_match == true",
        approverRole: "—",
        priority: 40,
      }),
    ],
    conflicts: [],
    overrides: [
      {
        agent: "Oncology Trial Matching Agent",
        change: "De-identified research read extended to 24 months of history",
        approvedBy: "Dr. Hari Patel",
      },
    ],
    tests: [
      { id: "T-1", name: "Order entry attempt is blocked", expected: "Block", result: "Pass" },
      { id: "T-2", name: "Note draft requires attestation", expected: "Require Approval", result: "Pass" },
      { id: "T-3", name: "In-scope read allowed", expected: "Allow", result: "Pass" },
    ],
    history: [
      { id: "p1", at: daysAgo(6), actor: "Dr. Maya Chen", action: "Published v12", detail: "Added blast-radius ceiling for pilot agents." },
      { id: "p2", at: daysAgo(70), actor: "Elise Barnes", action: "Approved v11", detail: "Privacy review complete." },
    ],
  },
  {
    id: "POL-002",
    name: "PHI Data Boundary v7",
    summary:
      "Defines which data classes may leave the governed boundary, and which model providers are eligible to receive them.",
    status: "Active",
    owner: "Elise Barnes",
    department: "Care Management",
    scope: "Enterprise · all agents and connectors",
    version: "v7",
    source: "Patient Consent Standard.pdf",
    authority: "Privacy Office",
    risk: "Critical",
    requiredApprovals: ["Privacy Officer", "Governance Administrator"],
    effectiveDate: daysAgo(120),
    lastUpdated: daysAgo(18),
    immutableBaseline: true,
    affectedAgents: 500,
    standards: ["HIPAA Privacy Rule", "42 CFR Part 2", "State breach statutes"],
    allow: [
      "Process PHI inside on-prem or BAA-covered runtimes",
      "Emit de-identified aggregates to analytics warehouse",
    ],
    block: [
      "Send PHI to any provider without an executed BAA",
      "Persist PHI in simulation or sandbox environments",
      "Export raw identifiers through webhook connectors",
    ],
    confirm: ["Any new connector handling PHI", "Cross-tenant data sharing requests"],
    rules: [
      mkRule(4, { action: "egress.phi", effect: "Block", dataClass: "PHI", priority: 2 }),
      mkRule(5, {
        action: "egress.deidentified",
        effect: "Allow",
        dataClass: "De-identified",
        conditions: "k_anonymity >= 11",
        priority: 30,
      }),
    ],
    conflicts: [
      {
        id: "CF-1",
        with: "Research Data Use Policy v3",
        severity: "High",
        detail: "Research policy permits 24-month retention where PHI boundary caps at 12 months.",
      },
    ],
    overrides: [],
    tests: [
      { id: "T-4", name: "Non-BAA provider blocked", expected: "Block", result: "Pass" },
      { id: "T-5", name: "k<11 aggregate blocked", expected: "Block", result: "Fail" },
    ],
    history: [
      { id: "p3", at: daysAgo(18), actor: "Elise Barnes", action: "Amended", detail: "Added webhook egress clause." },
    ],
  },
  {
    id: "POL-003",
    name: "Medication Approval Policy v5",
    summary: "Two-person approval for any medication-affecting agent output.",
    status: "Active",
    owner: "Anita Parikh, PharmD",
    department: "Pharmacy",
    scope: "Pharmacy, Emergency Medicine, Cardiology",
    version: "v5",
    source: "Medication Administration SOP.docx",
    authority: "Pharmacy & Therapeutics Committee",
    risk: "High",
    requiredApprovals: ["Pharmacy Governance Owner", "Clinical Safety Approver"],
    effectiveDate: daysAgo(45),
    lastUpdated: daysAgo(3),
    immutableBaseline: false,
    affectedAgents: 61,
    standards: ["ISMP Guidelines", "Joint Commission MM.01.01.03"],
    allow: ["Surface interaction and duplication candidates with citations"],
    block: ["Autonomous dose adjustment", "Substituting formulary alternatives without pharmacist"],
    confirm: ["Every reconciliation delta", "High-alert medication references"],
    rules: [
      mkRule(6, {
        action: "write.medication_reconciliation",
        effect: "Require Approval",
        approverRole: "Pharmacy Governance Owner",
        appliesTo: "Medication Reconciliation Agent",
        priority: 5,
      }),
    ],
    conflicts: [],
    overrides: [],
    tests: [{ id: "T-6", name: "Dose change blocked", expected: "Block", result: "Pass" }],
    history: [
      { id: "p4", at: daysAgo(3), actor: "Anita Parikh, PharmD", action: "Draft v6 opened", detail: "Adds high-alert medication list refresh." },
    ],
  },
  {
    id: "POL-004",
    name: "Patient Consent Policy v9",
    summary: "Consent state gating for secondary use of clinical data by agents.",
    status: "Active",
    owner: "Elise Barnes",
    department: "Care Management",
    scope: "Enterprise",
    version: "v9",
    source: "Patient Consent Standard.pdf",
    authority: "Privacy Office",
    risk: "High",
    requiredApprovals: ["Privacy Officer"],
    effectiveDate: daysAgo(200),
    lastUpdated: daysAgo(27),
    immutableBaseline: false,
    affectedAgents: 318,
    standards: ["HIPAA Privacy Rule", "Common Rule"],
    allow: ["Treatment-purpose processing where consent state is current"],
    block: ["Secondary research use without documented consent or waiver"],
    confirm: ["Consent exceptions requested by department owners"],
    rules: [
      mkRule(7, {
        action: "read.record_secondary_use",
        effect: "Require Approval",
        conditions: "consent_state != current",
        priority: 8,
      }),
    ],
    conflicts: [],
    overrides: [],
    tests: [{ id: "T-7", name: "Expired consent requires approval", expected: "Require Approval", result: "Pass" }],
    history: [
      { id: "p5", at: daysAgo(27), actor: "Elise Barnes", action: "Reviewed", detail: "Annual review completed." },
    ],
  },
  {
    id: "POL-005",
    name: "Research Data Use Policy v3",
    summary: "Governs de-identified cohort construction and trial matching workloads.",
    status: "Draft",
    owner: "Dr. Hari Patel",
    department: "Oncology",
    scope: "Oncology, Clinical Lab",
    version: "v3-draft",
    source: "Research Data Governance Charter",
    authority: "IRB Delegate",
    risk: "Moderate",
    requiredApprovals: ["IRB Delegate", "Privacy Officer"],
    effectiveDate: daysAhead(12),
    lastUpdated: hoursAgo(20),
    immutableBaseline: false,
    affectedAgents: 24,
    standards: ["Common Rule", "HIPAA De-identification Safe Harbor"],
    allow: ["Cohort counts over de-identified datasets"],
    block: ["Re-identification attempts", "Direct patient contact"],
    confirm: ["Any dataset export", "Cohorts smaller than 11 patients"],
    rules: [
      mkRule(8, {
        action: "read.research_dataset",
        effect: "Allow",
        dataClass: "Research",
        conditions: "irb_protocol_active == true",
        priority: 20,
      }),
    ],
    conflicts: [
      {
        id: "CF-2",
        with: "PHI Data Boundary v7",
        severity: "High",
        detail: "Retention window exceeds enterprise PHI boundary by 12 months.",
      },
    ],
    overrides: [],
    tests: [{ id: "T-8", name: "Cohort < 11 requires approval", expected: "Require Approval", result: "Pass" }],
    history: [
      { id: "p6", at: hoursAgo(20), actor: "Dr. Hari Patel", action: "Draft saved", detail: "Precedence ordering adjusted." },
    ],
  },
];

export const policyById = (id: string) => POLICIES.find((p) => p.id === id);

/* --------------------------------- sources -------------------------------- */

export interface SourceDoc extends CoreEntity {
  fileType: "PDF" | "DOCX" | "XLSX" | "CSV" | "JSON" | "Image";
  authority: "Board" | "Committee" | "Department" | "Vendor" | "Regulatory";
  extraction: "Complete" | "Processing" | "Queued" | "Failed";
  pages: number;
  hash: string;
  lastSync: string;
  freshness: "Fresh" | "Aging" | "Stale";
  sizeKb: number;
  excerpts: { page: number; text: string }[];
}

export const SOURCES: SourceDoc[] = [
  {
    id: "SRC-101",
    name: "Clinical Safety Policy 2026.pdf",
    fileType: "PDF",
    status: "Active",
    owner: "Dr. Maya Chen",
    department: "Care Management",
    scope: "Enterprise",
    version: "2026.2",
    source: "Board Clinical Safety Committee",
    risk: "Critical",
    requiredApprovals: ["Clinical Safety Approver"],
    effectiveDate: daysAgo(60),
    lastUpdated: daysAgo(6),
    authority: "Board",
    extraction: "Complete",
    pages: 48,
    hash: "sha256:9f2c…a71b",
    lastSync: hoursAgo(5),
    freshness: "Fresh",
    sizeKb: 2480,
    excerpts: [
      { page: 4, text: "No agent may place, alter, or cancel a clinical order without clinician attestation." },
      { page: 12, text: "Care-affecting agent output requires documented human confirmation prior to release." },
      { page: 31, text: "Promotion beyond Pilot requires two-person approval including the department owner." },
    ],
    history: [{ id: "s1", at: daysAgo(6), actor: "Dr. Maya Chen", action: "Re-encoded", detail: "v12 activation." }],
  },
  {
    id: "SRC-102",
    name: "Medication Administration SOP.docx",
    fileType: "DOCX",
    status: "Active",
    owner: "Anita Parikh, PharmD",
    department: "Pharmacy",
    scope: "Pharmacy",
    version: "5.3",
    source: "Pharmacy & Therapeutics Committee",
    risk: "High",
    requiredApprovals: ["Pharmacy Governance Owner"],
    effectiveDate: daysAgo(45),
    lastUpdated: daysAgo(3),
    authority: "Committee",
    extraction: "Complete",
    pages: 22,
    hash: "sha256:4b81…cc02",
    lastSync: hoursAgo(19),
    freshness: "Fresh",
    sizeKb: 940,
    excerpts: [
      { page: 6, text: "High-alert medications require independent double check before administration." },
      { page: 9, text: "Reconciliation deltas are advisory until a pharmacist accepts them." },
    ],
    history: [{ id: "s2", at: daysAgo(3), actor: "Anita Parikh, PharmD", action: "Uploaded revision", detail: "SOP 5.3." }],
  },
  {
    id: "SRC-103",
    name: "Patient Consent Standard.pdf",
    fileType: "PDF",
    status: "Active",
    owner: "Elise Barnes",
    department: "Care Management",
    scope: "Enterprise",
    version: "9.1",
    source: "Privacy Office",
    risk: "High",
    requiredApprovals: ["Privacy Officer"],
    effectiveDate: daysAgo(200),
    lastUpdated: daysAgo(27),
    authority: "Regulatory",
    extraction: "Complete",
    pages: 31,
    hash: "sha256:1de7…5510",
    lastSync: daysAgo(2),
    freshness: "Aging",
    sizeKb: 1610,
    excerpts: [
      { page: 3, text: "Secondary use requires current consent or a documented IRB waiver." },
      { page: 17, text: "Consent state must be re-verified every 12 months." },
    ],
    history: [{ id: "s3", at: daysAgo(27), actor: "Elise Barnes", action: "Annual review", detail: "No changes." }],
  },
  {
    id: "SRC-104",
    name: "Radiology Protocol Matrix.xlsx",
    fileType: "XLSX",
    status: "Candidate IR",
    owner: "Dr. Thanh Nguyen",
    department: "Radiology",
    scope: "Radiology",
    version: "2026.08",
    source: "Radiology Operations",
    risk: "Moderate",
    requiredApprovals: ["Department Owner", "Clinical Safety Approver"],
    effectiveDate: daysAhead(6),
    lastUpdated: hoursAgo(9),
    authority: "Department",
    extraction: "Processing",
    pages: 12,
    hash: "sha256:77aa…9be1",
    lastSync: hoursAgo(9),
    freshness: "Fresh",
    sizeKb: 420,
    excerpts: [{ page: 2, text: "Sub-specialty routing table for CT/MR studies by body region." }],
    history: [{ id: "s4", at: hoursAgo(9), actor: "Dr. Thanh Nguyen", action: "Uploaded", detail: "Extraction job queued." }],
  },
  {
    id: "SRC-105",
    name: "Lab Result Interface Spec.json",
    fileType: "JSON",
    status: "Active",
    owner: "Kevin Doyle",
    department: "Clinical Lab",
    scope: "Clinical Lab",
    version: "3.4",
    source: "Secure Lab SFTP Feed",
    risk: "Moderate",
    requiredApprovals: ["Department Owner"],
    effectiveDate: daysAgo(90),
    lastUpdated: daysAgo(14),
    authority: "Vendor",
    extraction: "Failed",
    pages: 1,
    hash: "sha256:6c30…0f4d",
    lastSync: daysAgo(4),
    freshness: "Stale",
    sizeKb: 88,
    excerpts: [{ page: 1, text: "HL7-to-FHIR field mapping definitions for result ingestion." }],
    history: [{ id: "s5", at: daysAgo(4), actor: "System", action: "Sync failed", detail: "SFTP handshake timeout." }],
  },
  {
    id: "SRC-106",
    name: "Payer Coverage Bulletin Aug 2026.pdf",
    fileType: "PDF",
    status: "Active",
    owner: "Dana Mercer",
    department: "Revenue Cycle",
    scope: "Revenue Cycle",
    version: "2026-08",
    source: "Payer Relations",
    risk: "Low",
    requiredApprovals: ["Department Owner"],
    effectiveDate: daysAgo(9),
    lastUpdated: daysAgo(9),
    authority: "Vendor",
    extraction: "Complete",
    pages: 16,
    hash: "sha256:aa19…7731",
    lastSync: hoursAgo(30),
    freshness: "Fresh",
    sizeKb: 730,
    excerpts: [{ page: 5, text: "Updated prior-authorization requirements effective September 1, 2026." }],
    history: [{ id: "s6", at: daysAgo(9), actor: "Dana Mercer", action: "Uploaded", detail: "Bulletin ingested." }],
  },
];

/* ------------------------------- connectors ------------------------------- */

export interface Connector {
  id: string;
  name: string;
  kind: string;
  status: "Connected" | "Degraded" | "Paused" | "Error";
  credentialHealth: "Valid" | "Expiring" | "Expired";
  permissions: string[];
  dataClasses: string[];
  schedule: string;
  lastSuccess: string;
  owner: string;
  department: Department;
  logs: { at: string; level: "info" | "warn" | "error"; message: string }[];
}

export const CONNECTORS: Connector[] = [
  {
    id: "CON-1",
    name: "Epic FHIR",
    kind: "FHIR R4 API",
    status: "Connected",
    credentialHealth: "Valid",
    permissions: ["Read: Patient, Encounter, Observation", "Write: DocumentReference (draft)"],
    dataClasses: ["PHI"],
    schedule: "Streaming (subscription)",
    lastSuccess: hoursAgo(1),
    owner: "Jonas Lindqvist",
    department: "Care Management",
    logs: [
      { at: hoursAgo(1), level: "info", message: "Subscription heartbeat ok — 14,208 events/24h." },
      { at: hoursAgo(14), level: "warn", message: "Rate limit soft threshold reached (82%)." },
    ],
  },
  {
    id: "CON-2",
    name: "Microsoft Teams",
    kind: "Graph API",
    status: "Connected",
    credentialHealth: "Expiring",
    permissions: ["Write: channel message", "Read: channel membership"],
    dataClasses: ["Operational"],
    schedule: "On demand",
    lastSuccess: hoursAgo(3),
    owner: "Sofia Valdez",
    department: "Emergency Medicine",
    logs: [{ at: hoursAgo(3), level: "info", message: "Delivered 42 governed notifications." },
      { at: daysAgo(1), level: "warn", message: "Client secret expires in 18 days." }],
  },
  {
    id: "CON-3",
    name: "Secure Lab SFTP Feed",
    kind: "SFTP",
    status: "Error",
    credentialHealth: "Valid",
    permissions: ["Read: /outbound/results"],
    dataClasses: ["PHI"],
    schedule: "Every 15 minutes",
    lastSuccess: daysAgo(4),
    owner: "Kevin Doyle",
    department: "Clinical Lab",
    logs: [
      { at: hoursAgo(2), level: "error", message: "Handshake timeout after 30s (host key unchanged)." },
      { at: hoursAgo(6), level: "error", message: "Retry 14/14 failed — connector marked Error." },
    ],
  },
  {
    id: "CON-4",
    name: "PostgreSQL Warehouse",
    kind: "PostgreSQL",
    status: "Connected",
    credentialHealth: "Valid",
    permissions: ["Read: analytics.*"],
    dataClasses: ["De-identified", "Operational"],
    schedule: "Hourly",
    lastSuccess: hoursAgo(1),
    owner: "Jonas Lindqvist",
    department: "Revenue Cycle",
    logs: [{ at: hoursAgo(1), level: "info", message: "Materialized 6 governance views." }],
  },
  {
    id: "CON-5",
    name: "Claims REST API",
    kind: "REST",
    status: "Degraded",
    credentialHealth: "Valid",
    permissions: ["Read: claims", "Write: coding suggestions"],
    dataClasses: ["Financial", "PHI"],
    schedule: "Every 30 minutes",
    lastSuccess: hoursAgo(5),
    owner: "Dana Mercer",
    department: "Revenue Cycle",
    logs: [{ at: hoursAgo(5), level: "warn", message: "p95 latency 4.2s — upstream payer slowdown." }],
  },
  {
    id: "CON-6",
    name: "Governance Webhook",
    kind: "Webhook",
    status: "Connected",
    credentialHealth: "Valid",
    permissions: ["Write: outbound events (signed)"],
    dataClasses: ["Operational"],
    schedule: "Event-driven",
    lastSuccess: hoursAgo(2),
    owner: "Jonas Lindqvist",
    department: "Care Management",
    logs: [{ at: hoursAgo(2), level: "info", message: "Signature verification enabled (HMAC-SHA256)." }],
  },
  {
    id: "CON-7",
    name: "Internal Document Repository",
    kind: "Document store",
    status: "Paused",
    credentialHealth: "Valid",
    permissions: ["Read: /policies", "Read: /sop"],
    dataClasses: ["Operational"],
    schedule: "Daily 02:00",
    lastSuccess: daysAgo(2),
    owner: "Elise Barnes",
    department: "Care Management",
    logs: [{ at: daysAgo(2), level: "info", message: "Paused by owner during policy migration." }],
  },
];

/* ------------------------------ IR packages ------------------------------- */

export interface IRField {
  path: string;
  value: string;
  type: "string" | "enum" | "date" | "number" | "boolean" | "list";
  provenance: { source: string; page: number };
  conflict?: string;
}

export interface IRPackage extends CoreEntity {
  sourceId: string;
  precedence: number;
  fields: IRField[];
  obligations: string[];
  deadlines: { label: string; due: string }[];
  actors: string[];
  permissions: string[];
  findings: { id: string; kind: string; severity: RiskLevel; detail: string }[];
}

export const IR_PACKAGES: IRPackage[] = [
  {
    id: "IR-2048",
    name: "Radiology Protocol Matrix — Candidate IR",
    status: "Candidate IR",
    owner: "Dr. Thanh Nguyen",
    department: "Radiology",
    scope: "Radiology routing rules",
    version: "v0.4",
    source: "Radiology Protocol Matrix.xlsx",
    sourceId: "SRC-104",
    risk: "Moderate",
    requiredApprovals: ["Department Owner", "Clinical Safety Approver"],
    effectiveDate: daysAhead(6),
    lastUpdated: hoursAgo(9),
    precedence: 20,
    fields: [
      { path: "routing.ct_chest.worklist", value: "thoracic-imaging", type: "string", provenance: { source: "Radiology Protocol Matrix.xlsx", page: 2 } },
      { path: "routing.mr_brain.worklist", value: "neuroradiology", type: "string", provenance: { source: "Radiology Protocol Matrix.xlsx", page: 2 } },
      { path: "routing.stat.escalation_minutes", value: "15", type: "number", provenance: { source: "Radiology Protocol Matrix.xlsx", page: 3 } },
      { path: "authority.level", value: "Department", type: "enum", provenance: { source: "Radiology Protocol Matrix.xlsx", page: 1 }, conflict: "Enterprise policy sets STAT escalation at 10 minutes" },
      { path: "effective.date", value: "2026-08-21", type: "date", provenance: { source: "Radiology Protocol Matrix.xlsx", page: 1 } },
    ],
    obligations: [
      "STAT studies must reach a radiologist worklist within the escalation window",
      "Routing exceptions must be logged with reason codes",
    ],
    deadlines: [{ label: "Activation target", due: daysAhead(6) }],
    actors: ["Radiology technologist", "Reading radiologist", "Imaging Routing Agent"],
    permissions: ["Read: order details", "Write: worklist assignment (candidate)"],
    findings: [
      { id: "F-1", kind: "Precedence conflict", severity: "High", detail: "Department escalation window (15m) is weaker than enterprise standard (10m)." },
      { id: "F-2", kind: "Missing field", severity: "Moderate", detail: "No fallback worklist defined for hybrid PET/CT." },
      { id: "F-3", kind: "Source drift", severity: "Low", detail: "Source spreadsheet changed 2 rows since last extraction." },
    ],
    history: [
      { id: "i1", at: hoursAgo(9), actor: "EDON Encoder", action: "Candidate IR generated", detail: "31 fields extracted, 3 findings." },
    ],
  },
  {
    id: "IR-2049",
    name: "Payer Coverage Rules — Candidate IR",
    status: "In validation",
    owner: "Dana Mercer",
    department: "Revenue Cycle",
    scope: "Prior authorization rules",
    version: "v0.2",
    source: "Payer Coverage Bulletin Aug 2026.pdf",
    sourceId: "SRC-106",
    risk: "Low",
    requiredApprovals: ["Department Owner"],
    effectiveDate: daysAhead(17),
    lastUpdated: hoursAgo(28),
    precedence: 40,
    fields: [
      { path: "prior_auth.mri_lumbar.required", value: "true", type: "boolean", provenance: { source: "Payer Coverage Bulletin Aug 2026.pdf", page: 5 } },
      { path: "prior_auth.effective", value: "2026-09-01", type: "date", provenance: { source: "Payer Coverage Bulletin Aug 2026.pdf", page: 5 } },
    ],
    obligations: ["Coding suggestions must cite the bulletin section"],
    deadlines: [{ label: "Payer effective date", due: daysAhead(17) }],
    actors: ["Coder", "Claims Coding Agent"],
    permissions: ["Read: claims"],
    findings: [{ id: "F-4", kind: "Schema validation", severity: "Low", detail: "All required fields present." }],
    history: [{ id: "i2", at: hoursAgo(28), actor: "EDON Encoder", action: "Candidate IR generated", detail: "12 fields extracted." }],
  },
  {
    id: "IR-2050",
    name: "Medication High-Alert List — Candidate IR",
    status: "Conflict",
    owner: "Anita Parikh, PharmD",
    department: "Pharmacy",
    scope: "Medication safety",
    version: "v0.7",
    source: "Medication Administration SOP.docx",
    sourceId: "SRC-102",
    risk: "High",
    requiredApprovals: ["Pharmacy Governance Owner", "Clinical Safety Approver"],
    effectiveDate: daysAhead(3),
    lastUpdated: hoursAgo(41),
    precedence: 10,
    fields: [
      { path: "high_alert.list", value: "insulin, heparin, opioids, chemotherapy", type: "list", provenance: { source: "Medication Administration SOP.docx", page: 6 } },
      { path: "double_check.required", value: "true", type: "boolean", provenance: { source: "Medication Administration SOP.docx", page: 6 }, conflict: "Conflicts with Medication Approval Policy v5 single-approver clause" },
    ],
    obligations: ["Independent double check for all high-alert medications"],
    deadlines: [{ label: "Conflict resolution due", due: daysAhead(1) }],
    actors: ["Pharmacist", "Nurse", "Medication Reconciliation Agent"],
    permissions: ["Read: medication list"],
    findings: [
      { id: "F-5", kind: "Authority conflict", severity: "High", detail: "SOP requires two checks; active policy encodes one approver." },
      { id: "F-6", kind: "Contradiction", severity: "Moderate", detail: "Section 6 and Appendix B disagree on opioid scope." },
    ],
    history: [{ id: "i3", at: hoursAgo(41), actor: "EDON Encoder", action: "Conflicts detected", detail: "2 blocking findings." }],
  },
];

/* ------------------------------- work queue ------------------------------- */

export type QueueType =
  | "Approval"
  | "Exception"
  | "Incident"
  | "Validation"
  | "Appeal"
  | "Policy review";

export interface QueueItem {
  id: string;
  title: string;
  type: QueueType;
  priority: "P1" | "P2" | "P3";
  object: string;
  objectId: string;
  department: Department;
  reviewer: string;
  submittedAt: string;
  slaDue: string;
  status: "Pending" | "Approved" | "Denied" | "Changes requested" | "Escalated";
  risk: RiskLevel;
  blastRadius: string;
  requestedAction: string;
  summary: string;
  evidence: { label: string; ref: string }[];
  policies: string[];
  modelRecommendation: string;
  kernelResult: string;
  humanRequirement: string;
  sources: { name: string; page: number }[];
  timeline: AuditEntry[];
  comments: { id: string; author: string; at: string; text: string }[];
  mine: boolean;
}

export const QUEUE_ITEMS: QueueItem[] = [
  {
    id: "WQ-4401",
    title: "Approve Cardiology Triage pilot promotion",
    type: "Approval",
    priority: "P1",
    object: "Cardiology Triage Agent",
    objectId: "AGT-1001",
    department: "Cardiology",
    reviewer: "Dr. Maya Chen",
    submittedAt: hoursAgo(6),
    slaDue: hoursAgo(-10),
    status: "Pending",
    risk: "High",
    blastRadius: "Departmental · 42 clinicians, ~180 referrals/day",
    requestedAction: "Promote from Sandbox to Pilot in Cardiology with 10% referral sampling.",
    summary:
      "Cardiology requests a limited pilot of the triage agent after 14 days of sandbox evaluation with 0 blocking findings.",
    evidence: [
      { label: "Simulation suite result", ref: "SIM-3120 · 46/48 scenarios passed" },
      { label: "Preflight report", ref: "PF-8842 · 0 blocking, 2 advisories" },
      { label: "Bias review", ref: "Attached · reviewed by Clinical Safety" },
    ],
    policies: ["Clinical Safety Mode v12", "PHI Data Boundary v7"],
    modelRecommendation:
      "Recommend approval with sampling capped at 10% and mandatory nurse confirmation on every ranked referral.",
    kernelResult:
      "REQUIRE_APPROVAL — promotion to Pilot with high-risk classification requires two-person approval (POL-001 §31).",
    humanRequirement: "Two-person approval: Department Owner + Clinical Safety Approver.",
    sources: [
      { name: "Clinical Safety Policy 2026.pdf", page: 31 },
      { name: "Clinical Safety Policy 2026.pdf", page: 12 },
    ],
    timeline: [
      { id: "t1", at: hoursAgo(6), actor: "Dr. Rachel Okafor", action: "Submitted", detail: "Promotion request created." },
      { id: "t2", at: hoursAgo(5), actor: "EDON Deterministic Kernel", action: "Evaluated", detail: "REQUIRE_APPROVAL." },
    ],
    comments: [
      { id: "c1", author: "Dr. Rachel Okafor", at: hoursAgo(5), text: "Sampling can start at 5% if safety prefers a slower ramp." },
    ],
    mine: true,
  },
  {
    id: "WQ-4402",
    title: "Review Medication Approval Policy v6",
    type: "Policy review",
    priority: "P1",
    object: "Medication Approval Policy",
    objectId: "POL-003",
    department: "Pharmacy",
    reviewer: "Dr. Maya Chen",
    submittedAt: hoursAgo(21),
    slaDue: hoursAgo(-3),
    status: "Pending",
    risk: "High",
    blastRadius: "Cross-department · 61 agents",
    requestedAction: "Publish v6 adding refreshed high-alert medication list and double-check requirement.",
    summary: "Pharmacy proposes alignment of the policy with SOP 5.3 independent double-check language.",
    evidence: [
      { label: "Policy diff", ref: "v5 → v6 · 3 rules changed" },
      { label: "Validation run", ref: "VAL-771 · 1 conflict" },
    ],
    policies: ["Medication Approval Policy v5", "Clinical Safety Mode v12"],
    modelRecommendation:
      "Recommend requesting changes: rule priority collides with Clinical Safety Mode v12 rule RUL-102.",
    kernelResult: "REQUIRE_APPROVAL — policy publication with active conflict requires resolution first.",
    humanRequirement: "Pharmacy Governance Owner + Clinical Safety Approver.",
    sources: [{ name: "Medication Administration SOP.docx", page: 6 }],
    timeline: [
      { id: "t3", at: hoursAgo(21), actor: "Anita Parikh, PharmD", action: "Submitted", detail: "Draft v6 submitted for approval." },
    ],
    comments: [],
    mine: true,
  },
  {
    id: "WQ-4403",
    title: "Resolve PHI mapping conflict",
    type: "Exception",
    priority: "P2",
    object: "Lab Result Interface Spec.json",
    objectId: "SRC-105",
    department: "Clinical Lab",
    reviewer: "Kevin Doyle",
    submittedAt: hoursAgo(33),
    slaDue: hoursAgo(-26),
    status: "Pending",
    risk: "High",
    blastRadius: "Departmental · lab result ingestion",
    requestedAction: "Allow temporary mapping of MRN into an operational field for 72 hours.",
    summary: "Interface spec drift caused patient identifiers to land in an operational-class field.",
    evidence: [{ label: "Validation finding", ref: "VAL-762 · PHI in operational class" }],
    policies: ["PHI Data Boundary v7"],
    modelRecommendation: "Recommend denial; propose de-identified surrogate key instead of MRN passthrough.",
    kernelResult: "BLOCK — PHI egress into operational data class is prohibited (POL-002 RUL-104).",
    humanRequirement: "Privacy Officer must record a written decision.",
    sources: [{ name: "Patient Consent Standard.pdf", page: 3 }],
    timeline: [{ id: "t4", at: hoursAgo(33), actor: "Kevin Doyle", action: "Submitted", detail: "Exception requested." }],
    comments: [],
    mine: false,
  },
  {
    id: "WQ-4404",
    title: "Approve Candidate IR package IR-2048",
    type: "Approval",
    priority: "P2",
    object: "IR-2048",
    objectId: "IR-2048",
    department: "Radiology",
    reviewer: "Dr. Thanh Nguyen",
    submittedAt: hoursAgo(9),
    slaDue: hoursAgo(-39),
    status: "Pending",
    risk: "Moderate",
    blastRadius: "Departmental · imaging routing",
    requestedAction: "Activate candidate IR for radiology routing rules effective Aug 21, 2026.",
    summary: "Encoded routing matrix ready for activation pending precedence conflict resolution.",
    evidence: [{ label: "Validation report", ref: "VAL-770 · 3 findings" }],
    policies: ["Clinical Safety Mode v12"],
    modelRecommendation: "Recommend changes: align STAT escalation window with the 10-minute enterprise standard.",
    kernelResult: "REQUIRE_APPROVAL — precedence conflict must be acknowledged by the department owner.",
    humanRequirement: "Department Owner approval.",
    sources: [{ name: "Radiology Protocol Matrix.xlsx", page: 3 }],
    timeline: [{ id: "t5", at: hoursAgo(9), actor: "EDON Encoder", action: "Submitted", detail: "Candidate IR ready." }],
    comments: [],
    mine: true,
  },
  {
    id: "WQ-4405",
    title: "Review patient-consent exception",
    type: "Appeal",
    priority: "P3",
    object: "Oncology Trial Matching Agent",
    objectId: "AGT-1006",
    department: "Oncology",
    reviewer: "Elise Barnes",
    submittedAt: daysAgo(2),
    slaDue: hoursAgo(-60),
    status: "Pending",
    risk: "Critical",
    blastRadius: "Cross-department · research cohorts",
    requestedAction: "Appeal denial of extended consent window for trial matching cohorts.",
    summary: "Oncology appeals the automatic denial of a 24-month look-back on de-identified cohorts.",
    evidence: [{ label: "IRB protocol", ref: "IRB-2026-114 (active)" }],
    policies: ["Patient Consent Policy v9", "Research Data Use Policy v3"],
    modelRecommendation: "Recommend escalation to the privacy committee; policies are in active conflict.",
    kernelResult: "BLOCK — retention exceeds enterprise PHI boundary (POL-002).",
    humanRequirement: "Privacy Officer + IRB Delegate.",
    sources: [{ name: "Patient Consent Standard.pdf", page: 17 }],
    timeline: [{ id: "t6", at: daysAgo(2), actor: "Dr. Hari Patel", action: "Appealed", detail: "Denial appealed with IRB evidence." }],
    comments: [],
    mine: false,
  },
  {
    id: "WQ-4406",
    title: "Investigate Imaging Routing drift",
    type: "Incident",
    priority: "P1",
    object: "Imaging Routing Agent",
    objectId: "AGT-1003",
    department: "Radiology",
    reviewer: "Dr. Thanh Nguyen",
    submittedAt: hoursAgo(4),
    slaDue: hoursAgo(-2),
    status: "Pending",
    risk: "Critical",
    blastRadius: "Departmental · 1,240 studies/day",
    requestedAction: "Confirm containment plan for routing drift and approve quarantine.",
    summary: "Routing distribution shifted 7.4% from baseline over 48 hours; sub-specialty mismatch rising.",
    evidence: [{ label: "Drift report", ref: "INC-9001 · PSI 0.21" }],
    policies: ["Clinical Safety Mode v12"],
    modelRecommendation: "Recommend quarantine of the runtime and rollback to v3.2.",
    kernelResult: "REQUIRE_APPROVAL — quarantine of a production agent requires human decision.",
    humanRequirement: "Department Owner + Clinical Safety Approver.",
    sources: [{ name: "Clinical Safety Policy 2026.pdf", page: 12 }],
    timeline: [{ id: "t7", at: hoursAgo(4), actor: "EDON Monitor", action: "Raised", detail: "Drift threshold exceeded." }],
    comments: [],
    mine: true,
  },
  {
    id: "WQ-4407",
    title: "Failed validation: Medication High-Alert List",
    type: "Validation",
    priority: "P2",
    object: "IR-2050",
    objectId: "IR-2050",
    department: "Pharmacy",
    reviewer: "Anita Parikh, PharmD",
    submittedAt: hoursAgo(41),
    slaDue: hoursAgo(-7),
    status: "Pending",
    risk: "High",
    blastRadius: "Cross-department · medication workflows",
    requestedAction: "Resolve authority conflict between SOP 5.3 and Medication Approval Policy v5.",
    summary: "Validation produced 2 blocking findings preventing activation.",
    evidence: [{ label: "Validation report", ref: "VAL-772 · 2 blocking" }],
    policies: ["Medication Approval Policy v5"],
    modelRecommendation: "Recommend publishing policy v6 first, then re-running validation.",
    kernelResult: "BLOCK — activation blocked while authority conflict is unresolved.",
    humanRequirement: "Pharmacy Governance Owner.",
    sources: [{ name: "Medication Administration SOP.docx", page: 6 }],
    timeline: [{ id: "t8", at: hoursAgo(41), actor: "EDON Validator", action: "Failed", detail: "2 blocking findings." }],
    comments: [],
    mine: false,
  },
  {
    id: "WQ-4408",
    title: "Approve connector scope change — Claims REST API",
    type: "Approval",
    priority: "P3",
    object: "Claims REST API",
    objectId: "CON-5",
    department: "Revenue Cycle",
    reviewer: "Dana Mercer",
    submittedAt: daysAgo(1),
    slaDue: hoursAgo(-48),
    status: "Pending",
    risk: "Moderate",
    blastRadius: "Departmental · claims pipeline",
    requestedAction: "Add write scope for coding suggestion callbacks.",
    summary: "Revenue Cycle requests a narrow write scope limited to suggestion objects.",
    evidence: [{ label: "Scope diff", ref: "read → read+write:suggestions" }],
    policies: ["PHI Data Boundary v7"],
    modelRecommendation: "Recommend approval with data class restricted to Financial.",
    kernelResult: "REQUIRE_APPROVAL — connector scope expansion requires owner approval.",
    humanRequirement: "Department Owner.",
    sources: [{ name: "Payer Coverage Bulletin Aug 2026.pdf", page: 5 }],
    timeline: [{ id: "t9", at: daysAgo(1), actor: "Dana Mercer", action: "Submitted", detail: "Scope change requested." }],
    comments: [],
    mine: false,
  },
];

/* -------------------------------- incidents ------------------------------- */

export interface Incident {
  id: string;
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  system: string;
  agents: string[];
  owner: string;
  department: Department;
  openedAt: string;
  status: "Open" | "Contained" | "Monitoring" | "Resolved";
  slaDue: string;
  summary: string;
  blastRadius: string;
  policies: string[];
  evidence: { label: string; ref: string }[];
  containment: string[];
  rootCause: string;
  remediation: { id: string; task: string; owner: string; done: boolean }[];
  timeline: AuditEntry[];
}

export const INCIDENTS: Incident[] = [
  {
    id: "INC-9001",
    title: "Imaging Routing Agent drift detected",
    severity: "SEV2",
    system: "EDON Runtime 4.2 · Radiology",
    agents: ["Imaging Routing Agent"],
    owner: "Dr. Thanh Nguyen",
    department: "Radiology",
    openedAt: hoursAgo(4),
    status: "Open",
    slaDue: hoursAgo(-4),
    summary:
      "Population stability index for sub-specialty routing rose to 0.21, exceeding the 0.15 governance threshold.",
    blastRadius: "1,240 studies/day · 3 sub-specialty worklists · no patient harm identified",
    policies: ["Clinical Safety Mode v12"],
    evidence: [
      { label: "Drift metrics", ref: "48h window, PSI 0.21" },
      { label: "Sample decisions", ref: "120 routed studies reviewed" },
    ],
    containment: ["Sampling reduced to 25%", "Manual radiologist review enabled for STAT studies"],
    rootCause: "Candidate protocol matrix change was applied upstream without re-encoding the IR package.",
    remediation: [
      { id: "r1", task: "Re-encode Radiology Protocol Matrix", owner: "Dr. Thanh Nguyen", done: true },
      { id: "r2", task: "Rollback runtime to v3.2", owner: "Jonas Lindqvist", done: false },
      { id: "r3", task: "Add drift alert at PSI 0.12", owner: "Jonas Lindqvist", done: false },
    ],
    timeline: [
      { id: "n1", at: hoursAgo(4), actor: "EDON Monitor", action: "Opened", detail: "Drift threshold exceeded." },
      { id: "n2", at: hoursAgo(3), actor: "Dr. Thanh Nguyen", action: "Acknowledged", detail: "Containment started." },
    ],
  },
  {
    id: "INC-9002",
    title: "Secure Lab SFTP synchronization failure",
    severity: "SEV3",
    system: "Secure Lab SFTP Feed",
    agents: ["Lab Note Drafting Agent"],
    owner: "Kevin Doyle",
    department: "Clinical Lab",
    openedAt: daysAgo(4),
    status: "Monitoring",
    slaDue: hoursAgo(-20),
    summary: "Scheduled SFTP pulls failing with handshake timeouts; result ingestion is 4 days stale.",
    blastRadius: "Lab note drafting paused · 0 clinical decisions affected",
    policies: ["PHI Data Boundary v7"],
    evidence: [{ label: "Connector logs", ref: "14 consecutive failures" }],
    containment: ["Connector marked Error", "Manual result import running twice daily"],
    rootCause: "Vendor rotated network ACLs without notifying integration owners.",
    remediation: [
      { id: "r4", task: "Request vendor ACL allowlist update", owner: "Kevin Doyle", done: true },
      { id: "r5", task: "Add connector freshness alert", owner: "Jonas Lindqvist", done: false },
    ],
    timeline: [{ id: "n3", at: daysAgo(4), actor: "EDON Monitor", action: "Opened", detail: "Sync failure detected." }],
  },
  {
    id: "INC-9003",
    title: "Unauthorized scope-expansion attempt",
    severity: "SEV1",
    system: "EDON Policy Engine",
    agents: ["Claims Coding Agent"],
    owner: "Elise Barnes",
    department: "Revenue Cycle",
    openedAt: hoursAgo(28),
    status: "Contained",
    slaDue: hoursAgo(-1),
    summary:
      "A deployment attempted to grant the coding agent read access to full clinical notes outside its declared purpose.",
    blastRadius: "Blocked before execution · 0 records accessed",
    policies: ["Clinical Safety Mode v12", "PHI Data Boundary v7"],
    evidence: [{ label: "Kernel decision", ref: "BLOCK · purpose mismatch" }, { label: "Audit correlation", ref: "COR-77f1a2" }],
    containment: ["Deployment rejected", "Service identity credentials rotated"],
    rootCause: "Deployment template inherited an over-broad scope block from a shared module.",
    remediation: [
      { id: "r6", task: "Fix shared deployment template", owner: "Jonas Lindqvist", done: true },
      { id: "r7", task: "Add separation-of-duties check to CI", owner: "Jonas Lindqvist", done: false },
    ],
    timeline: [
      { id: "n4", at: hoursAgo(28), actor: "EDON Deterministic Kernel", action: "Blocked", detail: "Purpose mismatch detected." },
      { id: "n5", at: hoursAgo(26), actor: "Elise Barnes", action: "Contained", detail: "Credentials rotated." },
    ],
  },
];

/* ------------------------------- simulations ------------------------------ */

export interface SimEvent {
  id: string;
  at: string;
  kind: string;
  detail: string;
}
export interface SimScenario {
  id: string;
  name: string;
  agent: string;
  policyVersion: string;
  irVersion: string;
  department: Department;
  environment: Environment;
  status: "Draft" | "Passed" | "Failed" | "Needs review";
  owner: string;
  lastRun: string;
  events: SimEvent[];
  suite?: string;
}

export const SIM_SCENARIOS: SimScenario[] = [
  {
    id: "SIM-3120",
    name: "Cardiology pilot promotion — consent revoked mid-encounter",
    agent: "Cardiology Triage Agent",
    policyVersion: "Clinical Safety Mode v12",
    irVersion: "IR-2044 v1.2",
    department: "Cardiology",
    environment: "Sandbox",
    status: "Passed",
    owner: "Dr. Rachel Okafor",
    lastRun: hoursAgo(7),
    suite: "Cardiology promotion suite",
    events: [
      { id: "e1", at: "T+00:00", kind: "Resource change", detail: "Referral queue receives 12 new referrals." },
      { id: "e2", at: "T+00:04", kind: "Evidence received", detail: "Prior ECG report attached to referral R-118." },
      { id: "e3", at: "T+00:09", kind: "Revocation", detail: "Patient consent revoked for secondary use." },
      { id: "e4", at: "T+00:12", kind: "Approval", detail: "Nurse confirms triage ranking for 8 referrals." },
    ],
  },
  {
    id: "SIM-3121",
    name: "Medication reconciliation — high-alert double check",
    agent: "Medication Reconciliation Agent",
    policyVersion: "Medication Approval Policy v5",
    irVersion: "IR-2050 v0.7",
    department: "Pharmacy",
    environment: "Sandbox",
    status: "Failed",
    owner: "Anita Parikh, PharmD",
    lastRun: hoursAgo(30),
    suite: "Pharmacy safety suite",
    events: [
      { id: "e5", at: "T+00:00", kind: "Resource change", detail: "Admission medication list imported." },
      { id: "e6", at: "T+00:03", kind: "Malformed request", detail: "Dose field arrives as free text." },
      { id: "e7", at: "T+00:06", kind: "Policy change", detail: "Draft policy v6 applied mid-scenario." },
    ],
  },
  {
    id: "SIM-3122",
    name: "Imaging routing rollback rehearsal",
    agent: "Imaging Routing Agent",
    policyVersion: "Clinical Safety Mode v12",
    irVersion: "IR-2048 v0.4",
    department: "Radiology",
    environment: "Audit-only",
    status: "Needs review",
    owner: "Dr. Thanh Nguyen",
    lastRun: hoursAgo(3),
    suite: "Radiology continuity suite",
    events: [
      { id: "e8", at: "T+00:00", kind: "Deadline", detail: "STAT study exceeds 10-minute escalation window." },
      { id: "e9", at: "T+00:05", kind: "Appeal", detail: "Technologist appeals routing decision." },
    ],
  },
  {
    id: "SIM-3123",
    name: "Trial matching — cohort under k-threshold",
    agent: "Oncology Trial Matching Agent",
    policyVersion: "Research Data Use Policy v3",
    irVersion: "IR-2039 v2.0",
    department: "Oncology",
    environment: "Sandbox",
    status: "Draft",
    owner: "Dr. Hari Patel",
    lastRun: daysAgo(3),
    suite: "Research governance suite",
    events: [{ id: "e10", at: "T+00:00", kind: "Resource change", detail: "Cohort resolves to 7 patients." }],
  },
];

export const SIM_SUITES = [
  { id: "SUI-1", name: "Cardiology promotion suite", scenarios: 12, passRate: 96, owner: "Dr. Rachel Okafor", lastRun: hoursAgo(7) },
  { id: "SUI-2", name: "Pharmacy safety suite", scenarios: 18, passRate: 83, owner: "Anita Parikh, PharmD", lastRun: hoursAgo(30) },
  { id: "SUI-3", name: "Radiology continuity suite", scenarios: 9, passRate: 89, owner: "Dr. Thanh Nguyen", lastRun: hoursAgo(3) },
  { id: "SUI-4", name: "Research governance suite", scenarios: 7, passRate: 100, owner: "Dr. Hari Patel", lastRun: daysAgo(3) },
  { id: "SUI-5", name: "Enterprise regression suite", scenarios: 64, passRate: 94, owner: "Dr. Maya Chen", lastRun: daysAgo(1) },
];

/* --------------------------------- audit ---------------------------------- */

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  object: string;
  policyVersion: string;
  kernelResult: "ALLOW" | "BLOCK" | "REQUIRE_APPROVAL";
  humanDecision: "Approved" | "Denied" | "Pending" | "N/A";
  source: string;
  environment: Environment;
  result: "Success" | "Blocked" | "Deferred";
  correlationId: string;
}

const ACTIONS = [
  "agent.decision.evaluate",
  "policy.rule.apply",
  "connector.sync",
  "ir.package.validate",
  "agent.deployment.promote",
  "queue.item.approve",
  "simulation.run",
  "evidence.package.generate",
];

export const AUDIT_EVENTS: AuditEvent[] = Array.from({ length: 260 }, (_, i) => {
  const r = rand();
  const kernelResult = r > 0.82 ? "BLOCK" : r > 0.55 ? "REQUIRE_APPROVAL" : "ALLOW";
  const agent = at(AGENTS, rand() * 60);
  return {
    id: `EVT-${70000 + i}`,
    at: hoursAgo(Number((i * 0.83).toFixed(2))),
    actor: rand() > 0.55 ? agent.name : at(PEOPLE, i).name,
    action: at(ACTIONS, i),
    object: agent.name,
    policyVersion: at(POLICIES, i).name,
    kernelResult: kernelResult as AuditEvent["kernelResult"],
    humanDecision:
      kernelResult === "REQUIRE_APPROVAL" ? (rand() > 0.3 ? "Approved" : "Pending") : "N/A",
    source: at(SOURCES, i).name,
    environment: at(["Production", "Pilot", "Sandbox", "Audit-only"] as Environment[], i),
    result: kernelResult === "BLOCK" ? "Blocked" : kernelResult === "ALLOW" ? "Success" : "Deferred",
    correlationId: `COR-${(i * 7919).toString(16).padStart(6, "0").slice(0, 6)}`,
  };
});

export interface EvidencePackage {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  range: string;
  agents: number;
  policies: number;
  incidents: number;
  status: "Sealed" | "Draft" | "Shared";
  sha: string;
  sharedWith?: string;
  expiresAt?: string;
  downloads: number;
  custody: AuditEntry[];
}

export const EVIDENCE_PACKAGES: EvidencePackage[] = [
  {
    id: "EVP-501",
    name: "Q2 2026 Clinical AI Governance Evidence",
    createdAt: daysAgo(21),
    createdBy: "Dr. Maya Chen",
    range: "Apr 1 – Jun 30, 2026",
    agents: 500,
    policies: 5,
    incidents: 7,
    status: "Shared",
    sha: "sha256:c1a4…88de",
    sharedWith: "Northline External Audit LLP",
    expiresAt: daysAhead(24),
    downloads: 6,
    custody: [
      { id: "cu1", at: daysAgo(21), actor: "Dr. Maya Chen", action: "Generated", detail: "Package sealed with 12,884 events." },
      { id: "cu2", at: daysAgo(20), actor: "Dr. Maya Chen", action: "Shared", detail: "Access granted to external auditor, 45-day expiry." },
      { id: "cu3", at: daysAgo(6), actor: "Northline Audit", action: "Downloaded", detail: "PDF + JSON bundle." },
    ],
  },
  {
    id: "EVP-502",
    name: "Imaging Routing Drift Evidence (INC-9001)",
    createdAt: hoursAgo(3),
    createdBy: "Dr. Thanh Nguyen",
    range: "Aug 13 – Aug 15, 2026",
    agents: 1,
    policies: 1,
    incidents: 1,
    status: "Sealed",
    sha: "sha256:20bb…41c9",
    downloads: 1,
    custody: [{ id: "cu4", at: hoursAgo(3), actor: "Dr. Thanh Nguyen", action: "Generated", detail: "Incident evidence sealed." }],
  },
  {
    id: "EVP-503",
    name: "Pharmacy Policy v6 Review Bundle",
    createdAt: hoursAgo(26),
    createdBy: "Anita Parikh, PharmD",
    range: "Aug 1 – Aug 15, 2026",
    agents: 61,
    policies: 2,
    incidents: 0,
    status: "Draft",
    sha: "—",
    downloads: 0,
    custody: [{ id: "cu5", at: hoursAgo(26), actor: "Anita Parikh, PharmD", action: "Draft created", detail: "Awaiting validation." }],
  },
];

/* -------------------------------- analytics ------------------------------- */

export const POSTURE_30D = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const base = 95.6 + Math.sin(i / 3.4) * 0.9 + i * 0.06;
  return {
    date: new Date(DEMO_NOW.getTime() - day * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    compliance: Number(Math.min(99.4, base).toFixed(2)),
    denials: Math.round(40 + Math.sin(i / 2.1) * 14 + (i % 5) * 2),
    approvals: Math.round(120 + Math.cos(i / 2.6) * 24 + i),
  };
});

export const LIFECYCLE_DISTRIBUTION = (() => {
  const counts: Record<string, number> = {};
  AGENTS.forEach((a) => (counts[a.lifecycle] = (counts[a.lifecycle] ?? 0) + 1));
  return (["Production", "Pilot", "Sandbox", "Audit-only", "Draft", "Retired"] as Lifecycle[])
    .filter((k) => counts[k])
    .map((k) => ({ stage: k, count: counts[k] ?? 0 }));
})();

export const RISK_BY_DEPARTMENT = DEPARTMENTS.map((d) => {
  const inDept = AGENTS.filter((a) => a.department === d);
  return {
    department: d.replace("Emergency Medicine", "Emergency").replace("Care Management", "Care Mgmt"),
    critical: inDept.filter((a) => a.risk === "Critical").length,
    high: inDept.filter((a) => a.risk === "High").length,
    moderate: inDept.filter((a) => a.risk === "Moderate").length,
    low: inDept.filter((a) => a.risk === "Low").length,
  };
});

export const MONITORING_SERIES = Array.from({ length: 48 }, (_, i) => ({
  t: `${String(i % 24).padStart(2, "0")}:00`,
  latency: Math.round(420 + Math.sin(i / 3) * 120 + (i % 7) * 12),
  errorRate: Number((0.4 + Math.abs(Math.sin(i / 5)) * 0.9).toFixed(2)),
  denied: Math.round(12 + Math.abs(Math.cos(i / 4)) * 18),
  approvals: Math.round(30 + Math.abs(Math.sin(i / 6)) * 22),
}));

export const ACTIVITY_FEED = [
  { id: "a1", at: hoursAgo(0.4), actor: "EDON Monitor", text: "Drift threshold exceeded for Imaging Routing Agent (PSI 0.21).", tone: "danger" as const },
  { id: "a2", at: hoursAgo(1.2), actor: "Dr. Rachel Okafor", text: "Submitted Cardiology Triage Agent pilot promotion for approval.", tone: "info" as const },
  { id: "a3", at: hoursAgo(2.6), actor: "EDON Deterministic Kernel", text: "Blocked scope expansion attempt on Claims Coding Agent.", tone: "warning" as const },
  { id: "a4", at: hoursAgo(4.1), actor: "Elise Barnes", text: "Approved PHI Data Boundary v7 annual attestation.", tone: "success" as const },
  { id: "a5", at: hoursAgo(6.8), actor: "EDON Encoder", text: "Candidate IR package IR-2048 generated from Radiology Protocol Matrix.", tone: "info" as const },
  { id: "a6", at: hoursAgo(9.3), actor: "Anita Parikh, PharmD", text: "Opened draft Medication Approval Policy v6.", tone: "info" as const },
  { id: "a7", at: hoursAgo(12.5), actor: "Jonas Lindqvist", text: "Rotated service identity credentials for Claims REST API.", tone: "success" as const },
  { id: "a8", at: hoursAgo(19.1), actor: "EDON Validator", text: "Validation VAL-772 failed with 2 blocking findings.", tone: "danger" as const },
];

export const UPCOMING_EFFECTIVE = [
  { id: "u1", name: "Research Data Use Policy v3", date: daysAhead(12), owner: "Dr. Hari Patel", agents: 24 },
  { id: "u2", name: "Radiology Routing IR-2048", date: daysAhead(6), owner: "Dr. Thanh Nguyen", agents: 8 },
  { id: "u3", name: "Payer Prior-Auth Rules IR-2049", date: daysAhead(17), owner: "Dana Mercer", agents: 12 },
  { id: "u4", name: "Medication Approval Policy v6", date: daysAhead(3), owner: "Anita Parikh, PharmD", agents: 61 },
];

export const PLATFORM_HEALTH = [
  { name: "Policy engine", status: "Healthy" as Health, detail: "p95 38ms · 0 errors" },
  { name: "Deterministic Kernel", status: "Healthy" as Health, detail: "Availability 99.99% (30d)" },
  { name: "Runtime fleet", status: "Degraded" as Health, detail: "2 of 34 nodes degraded" },
  { name: "Connectors", status: "Failing" as Health, detail: "1 error · 1 degraded · 1 paused" },
  { name: "Queue processing", status: "Healthy" as Health, detail: "14 pending · 0 stuck" },
  { name: "Evidence store", status: "Healthy" as Health, detail: "Write-once verified" },
];

export const KERNEL_DECISION_MIX = [
  { name: "Allowed", value: 82.4 },
  { name: "Approval required", value: 13.9 },
  { name: "Blocked", value: 3.7 },
];

export const DEPLOYMENT_HISTORY = [
  { id: "DEP-71", version: "v4.1", environment: "Production" as Environment, at: daysAgo(12), by: "Jonas Lindqvist", status: "Active", tests: "48/48 passed" },
  { id: "DEP-70", version: "v4.0", environment: "Pilot" as Environment, at: daysAgo(26), by: "Dr. Rachel Okafor", status: "Superseded", tests: "46/48 passed" },
  { id: "DEP-69", version: "v3.9", environment: "Sandbox" as Environment, at: daysAgo(38), by: "Jonas Lindqvist", status: "Superseded", tests: "44/48 passed" },
  { id: "DEP-68", version: "v3.8", environment: "Audit-only" as Environment, at: daysAgo(52), by: "Jonas Lindqvist", status: "Rolled back", tests: "39/48 passed" },
];

export const API_KEYS = [
  { id: "key_prod_1", name: "Governance API — production", prefix: "edon_live_9f2c", created: daysAgo(120), lastUsed: hoursAgo(2), scopes: ["read:agents", "read:audit"] },
  { id: "key_ci_1", name: "CI preflight runner", prefix: "edon_ci_44ab", created: daysAgo(64), lastUsed: hoursAgo(9), scopes: ["read:policies", "write:simulations"] },
  { id: "key_bi_1", name: "BI warehouse export", prefix: "edon_bi_1d70", created: daysAgo(31), lastUsed: daysAgo(1), scopes: ["read:audit"] },
];

export const WEBHOOKS = [
  { id: "wh_1", url: "https://ops.stmercy.example/edon/events", events: ["incident.opened", "policy.published"], status: "Active", lastDelivery: hoursAgo(2) },
  { id: "wh_2", url: "https://siem.stmercy.example/ingest/edon", events: ["audit.event"], status: "Active", lastDelivery: hoursAgo(1) },
  { id: "wh_3", url: "https://legacy.stmercy.example/hook", events: ["agent.quarantined"], status: "Disabled", lastDelivery: daysAgo(19) },
];

export const MODEL_PROVIDERS = [
  { id: "mp_1", name: "On-prem EDON inference", baa: "N/A (internal)", classes: ["PHI", "De-identified"], status: "Approved" },
  { id: "mp_2", name: "Azure OpenAI (BAA)", baa: "Executed 2025-11-02", classes: ["PHI"], status: "Approved" },
  { id: "mp_3", name: "Anthropic (BAA)", baa: "Executed 2026-02-14", classes: ["De-identified"], status: "Approved" },
  { id: "mp_4", name: "Public model endpoint", baa: "None", classes: [], status: "Blocked" },
];

export const TEAMS = [
  { id: "tm_1", name: "Clinical Safety Council", members: 9, roles: ["Clinical Safety Approver"] },
  { id: "tm_2", name: "Platform Reliability", members: 6, roles: ["Runtime Engineer"] },
  { id: "tm_3", name: "Privacy Office", members: 4, roles: ["Privacy Officer", "Auditor (read-only)"] },
  { id: "tm_4", name: "Department Owners", members: 8, roles: ["Department Owner"] },
];

export const SERVICE_IDENTITIES = [
  { id: "svc_1", name: "svc-runtime-scheduler", lastRotated: daysAgo(21), scopes: ["runtime:deploy"], status: "Active" },
  { id: "svc_2", name: "svc-encoder", lastRotated: daysAgo(9), scopes: ["encoding:write"], status: "Active" },
  { id: "svc_3", name: "svc-claims-bridge", lastRotated: hoursAgo(28), scopes: ["connector:claims"], status: "Rotating" },
];

export const KPI_SUMMARY = {
  governedAgents: 500,
  productionAgents: 412,
  policyCompliance: 97.8,
  pendingReviews: 14,
  openIncidents: 3,
  connectedSources: 27,
};
