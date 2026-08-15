# EDON Control Hub

Build a complete production-quality frontend prototype for EDON, an institutional AI governance and runtime-control platform for healthcare organizations.

EDON is not an EHR and not a generic chatbot. It governs AI agents, institutional policies, integrations, simulations, deterministic decisions, approvals, monitoring, and audit evidence.

Use realistic synthetic mock data only. Never use real patient information.

TECH STACK

Use:

- React with TypeScript

- React Router

- Tailwind CSS

- shadcn/ui

- Lucide icons

- Recharts

- Reusable typed components

- A centralized mock-data layer

- LocalStorage persistence for demo interactions

Build a functional application, not a static mockup. Every visible button, tab, filter, modal, menu, drawer, and workflow should work with mock state.

VISUAL DIRECTION

Use the attached dashboard screenshots as the primary visual reference.

Create a modern, refined enterprise SaaS interface with:

- Light warm-gray page background

- White rounded application shell

- Slim white left sidebar

- Thin neutral borders

- Subtle shadows

- 14–18px card radiuses

- Spacious but data-dense layouts

- Mint/teal primary accent

- Dark charcoal text

- Muted gray secondary text

- Green, amber, red, and blue status colors

- Inter or Geist typography

- Smooth thin-line charts

- Compact tables and activity feeds

- Soft hover states and 150–200ms transitions

Avoid purple gradients, glassmorphism, oversized headings, cartoon illustrations, excessive animations, and generic AI-chat styling.

Use approximately:

- Background: #F3F5F4

- Surface: #FFFFFF

- Primary: #16A978

- Primary dark: #087A58

- Text: #151719

- Muted text: #667085

- Border: #E4E8E6

- Warning: #D99A16

- Danger: #D34A4A

- Information: #3A7BD5

GLOBAL APPLICATION SHELL

Create a collapsible left sidebar containing:

1. Dashboard

2. Work Queue

3. Integration & Encoding

4. Agents & Runtimes

5. Simulations

6. Policies

7. Operations

8. Audit & Evidence

Place Settings at the bottom of the sidebar.

The top header should include:

- EDON logo

- Tenant switcher: “St. Mercy Health”

- Global search with Cmd/Ctrl + K

- Current environment: Audit-only, Sandbox, Pilot, or Production

- Pending review badge

- Notification bell

- Help icon

- User profile for Dr. Maya Chen

- Emergency Lockdown control

Show a persistent blue environment banner when in Sandbox:

“SANDBOX MODE — Audit-only · No production execution”

Add a floating “Ask EDON” button opening a contextual right drawer. It may explain policies, summarize evidence, and draft changes, but it must never directly execute actions.

All AI-generated material must be labeled:

“Candidate · Non-authoritative”

Use breadcrumbs on interior pages.

CORE ENTITY STANDARD

Every agent, source, IR package, policy, simulation, incident, and evidence package should display:

- Status

- Owner

- Department

- Scope

- Version

- Source

- Risk level

- Required approvals

- Effective date

- Last updated

- Audit history

Use common detail tabs:

Overview | Configuration | Versions | Tests | Approvals | Audit

ROUTES

Build these 32 authenticated routes.

Dashboard:

- /dashboard

Work Queue:

- /work-queue

- /work-queue/:id

Integration & Encoding:

- /encoding

- /encoding/sources

- /encoding/connectors

- /encoding/projects/:id

- /encoding/ir/:id

- /encoding/validation/:id

Agents & Runtimes:

- /runtimes

- /runtimes/register

- /runtimes/:id

- /runtimes/:id/deployments

- /runtimes/:id/health

Simulations:

- /simulations

- /simulations/suites

- /simulations/runs/:id

Policies:

- /policies

- /policies/:id

- /policies/builder/:id

- /policies/tests/:id

Operations:

- /operations

- /operations/monitoring

- /operations/incidents

- /operations/incidents/:id

Audit & Evidence:

- /audit

- /audit/evidence

- /audit/auditor

Settings:

- /settings/organization

- /settings/identity

- /settings/integrations

- /settings/governance

DASHBOARD

Create a polished executive dashboard.

Header:

“Good morning, Dr. Chen”

“Here is the governance posture for St. Mercy Health.”

Actions:

- Export

- Date range

- Create new dropdown

- Emergency Lockdown

KPI cards:

- Governed Agents: 500

- Production Agents: 412

- Policy Compliance: 97.8%

- Pending Reviews: 14

- Open Incidents: 3

- Connected Sources: 27

Main content:

- Thirty-day governance posture line chart

- Agent lifecycle distribution

- Risk posture by department

- Recent activity feed

- “Attention required” right-side panel

- Source synchronization health

- Open incidents

- Upcoming policy effective dates

WORK QUEUE

Provide tabs or filters for:

- My Queue

- Team Queue

- Approvals

- Exceptions & Appeals

- Incidents

- Failed Validations

Use a searchable, sortable table with:

- Priority

- Type

- Object

- Department

- Assigned reviewer

- Submitted time

- SLA

- Status

The detail page should include:

- Request summary

- Requested action

- Risk and blast radius

- Evidence

- Applicable policies

- Candidate model recommendation

- Deterministic Kernel result

- Human approval requirement

- Source references

- Timeline

- Comments

- Approve

- Deny

- Request changes

- Escalate

Require a written reason for high-risk decisions.

INTEGRATION & ENCODING

Encoding overview:

- Connected sources

- Processing jobs

- Candidate IR packages

- Conflicts requiring review

- Sync failures

- Recently activated packages

- Visual pipeline:

  Source → Extract → Map → Candidate IR → Validate → Approve → Activate

Sources library:

- Upload area for PDF, DOCX, XLSX, CSV, JSON, and images

- Source cards and table view

- OCR/extraction status

- Owner

- Authority level

- Effective date

- Source hash

- Last synchronization

- Freshness status

- Preview drawer with page-level source grounding

Connectors:

- Epic FHIR

- Microsoft Teams

- Secure SFTP

- PostgreSQL

- REST API

- Webhook

- Internal document repository

Each connector needs:

- Status

- Credential health

- Read/write permissions

- Data classifications

- Sync schedule

- Last successful sync

- Test connection

- Pause sync

- Edit scopes

- View logs

Encoding project workspace:

Use a three-panel workspace:

- Left: source document/pages

- Center: extracted entities, obligations, deadlines, actors, permissions, and rules

- Right: field mapping, validation, and source provenance

Candidate IR editor:

- Structured tree editor

- Form editor

- Raw JSON toggle

- Field-level provenance

- Typed fields

- Conflict indicators

- Precedence ordering

- Version diff

- Comments

- Save draft

- Submit for validation

Validation page:

- Schema validation

- Missing fields

- Contradictions

- Authority conflicts

- Precedence conflicts

- Historical replay

- Regression tests

- Source drift

- Before/after comparison

- Approval history

- Activate button gated behind human approval

Imported information must remain “Candidate IR” until explicitly approved.

AGENTS & RUNTIMES

Registry overview:

- 500-agent aggregate metrics

- Search and filters

- Department

- Lifecycle stage

- Risk

- Health

- Policy pack

- Data class

- Owner

Agent registration wizard:

1. Identity and purpose

2. Owner and department

3. Model and runtime

4. Systems and connectors

5. Data classifications

6. Capabilities and exact scopes

7. Policy pack

8. Approval owner

9. Preflight

10. Simulation

11. Submit in audit-only mode

Preflight must detect:

- Purpose mismatch

- Overly broad permissions

- PHI egress

- Unapproved external LLM use

- Missing owner

- Missing approver

- Policy conflict

- Excessive blast radius

Agent detail:

- Health and lifecycle status

- Purpose

- Owner

- Model/runtime

- Connected systems

- Capabilities

- Read/write/execute permissions

- Policy coverage

- Recent decisions

- Violations

- Deployment version

- Pause and quarantine controls

Deployments:

- Audit-only

- Sandbox

- Pilot

- Production

- Promotion gates

- Required approvals

- Test results

- Version comparison

- Rollback history

Health page:

- Latency

- Error rate

- Policy denials

- Approval frequency

- Drift

- Tool usage

- Dependency graph

- Blast-radius visualization

- Recent alerts

SIMULATIONS

The Simulation Studio should enter focus mode: hide the global sidebar and show a local toolbar with a “Back to EDON” action.

Always display:

“HYPOTHETICAL · NON-BINDING · LIVE STATE WILL NOT BE MODIFIED”

Use three columns:

Left: Baseline context

- Agent

- Policy version

- Candidate IR version

- Department

- Environment

- Relevant resources

- Initial state

Center: Scenario timeline

- Add event

- Drag to reorder

- Change timestamps

- Approvals

- Revocations

- Evidence received

- Appeals

- Policy changes

- Resource changes

- Deadline events

- Malformed requests

Right: Simulated outcome

- Candidate model result

- Compiler result

- Deterministic Kernel result

- Human approval requirement

- Failed conditions

- Risk

- Consequences

Bottom tabs:

- Before vs After

- Changed Fields

- Causal Path

- Consequences

- Risks

- Execution Trace

- Sources and Versions

Actions:

- Run simulation

- Reset

- Save scenario

- Duplicate

- Add to suite

- Export evidence

- Request human review

Never include an Execute in Production button.

POLICIES

Policy overview:

- Active policies

- Drafts

- Pending approvals

- Conflicts

- Upcoming effective dates

- Agents affected

Policy detail should recreate the strong three-column pattern:

- Agents can do this

- Agents cannot do this

- Human confirmation required

Include:

- Policy owner

- Authority source

- Version

- Effective date

- Affected agents

- Department scope

- Immutable baseline indicator

- Agent-level overrides

- Compliance standards

Rule builder fields:

- Action

- Effect: Allow, Block, or Require Approval

- Scope

- Conditions

- Data class

- Agent or department

- Approver role

- Priority

- Authority source

- Effective period

- Rationale

- Test cases

Actions:

- Save draft

- Validate

- Detect conflicts

- Test in Simulation

- Submit for approval

- Publish

- Compare versions

- Roll back

Publishing must require successful validation and approval.

OPERATIONS

Operations overview:

- Platform health

- Runtime health

- Connector health

- Policy-engine health

- Kernel availability

- Queue processing

- Drift alerts

- Incidents

- Live governed event feed

Monitoring:

- Time-series charts

- Filters by department, agent, system, and severity

- Error rate

- Latency

- Denied operations

- Human approval rate

- Connector failures

- Source freshness

- Drift

- Anomalous access

Incident list:

- Severity

- Title

- Affected system

- Affected agents

- Owner

- Opened time

- Status

- SLA

Incident detail:

- Incident summary

- Timeline

- Affected agents and sources

- Blast radius

- Policies involved

- Evidence

- Containment actions

- Root-cause analysis

- Remediation tasks

- Approvals

- Audit trail

Controls:

- Pause agent

- Quarantine runtime

- Disable connector

- Enter lockdown

- Resolve incident

Require confirmation dialogs for destructive controls.

AUDIT & EVIDENCE

Audit log:

- Immutable event table

- Timestamp

- Actor

- Action

- Object

- Policy version

- Kernel result

- Human decision

- Source

- Environment

- Result

- Correlation ID

Include advanced filtering, saved views, pagination, column controls, and export.

Evidence packages:

- Package wizard

- Select date range

- Select agents

- Select policies

- Select incidents

- Include configuration versions

- Include approvals

- Include simulation results

- Generate package

- Download mock PDF/JSON/CSV

- Chain-of-custody timeline

Auditor portal:

- Read-only interface

- Shared packages

- Expiration dates

- Access log

- Comments

- Download history

- Revoke access

SETTINGS

Organization:

- Tenant details

- Departments

- Environments

- Data residency

- Retention

- Time zone

- Mode controls

Identity:

- Users

- Teams

- Service identities

- Roles

- Attribute-based permissions

- SSO

- SCIM

- Session controls

Integrations:

- API keys

- Webhooks

- Secrets

- Model providers

- Credentials

- Developer logs

- Rate limits

Governance:

- Approval delegation

- Separation of duties

- Two-person approval rules

- Emergency access

- Notification routing

- Escalation policies

- Lockdown configuration

MOCK DATA

Use one coherent mock-data source shared across every page.

Tenant:

- St. Mercy Health

- 500 governed agents

- 8 departments

- Current user: Dr. Maya Chen

- Role: Chief Clinical AI Safety Officer

Departments:

- Cardiology

- Clinical Lab

- Pharmacy

- Radiology

- Emergency Medicine

- Oncology

- Revenue Cycle

- Care Management

Example agents:

- Lab Note Drafting Agent

- Cardiology Triage Agent

- Medication Reconciliation Agent

- Imaging Routing Agent

- Discharge Planning Assistant

- Claims Coding Agent

- Oncology Trial Matching Agent

- Emergency Capacity Coordinator

Example policies:

- Clinical Safety Mode v12

- PHI Data Boundary v7

- Medication Approval Policy v5

- Patient Consent Policy v9

- Research Data Use Policy v3

Example sources:

- Clinical Safety Policy 2026.pdf

- Medication Administration SOP.docx

- Patient Consent Standard.pdf

- Epic FHIR Connector

- Microsoft Teams Connector

- Secure Lab SFTP Feed

Example incidents:

- Imaging Routing Agent drift detected

- Secure Lab SFTP synchronization failure

- Unauthorized scope-expansion attempt

Example queue items:

- Approve Cardiology Triage pilot promotion

- Review Medication Approval Policy v6

- Resolve PHI mapping conflict

- Approve Candidate IR package IR-2048

- Review patient-consent exception

- Investigate Imaging Routing drift

Use dates around August 15, 2026. Mark all data as synthetic demo data.

IMPORTANT INTERACTIONS

Implement these workflows with mock persistence:

- Registering an agent adds it to the registry as audit-only

- Approving an item removes it from the pending queue

- Denying requires a reason

- Uploading a source creates an extraction job

- Running validation produces realistic findings

- Running a simulation produces a deterministic mock result

- Publishing a policy creates a new version

- Quarantining an agent updates its status everywhere

- Resolving an incident updates dashboard metrics

- Lockdown changes the global mode banner

- Exports create a mock downloadable file

- Filters, sorting, search, pagination, tabs, and saved views work

- Show success and error toasts

QUALITY REQUIREMENTS

- Responsive desktop, tablet, and mobile layouts

- Collapsible sidebar

- Tables convert into cards on smaller screens

- WCAG AA color contrast

- Visible keyboard focus

- Keyboard-accessible menus and dialogs

- Loading skeletons

- Empty states

- Error states

- No-results states

- Confirmation dialogs

- Form validation

- Unsaved-change warnings

- No dead buttons

- No placeholder pages

- No lorem ipsum

- No real PHI

- Consistent terminology across every route

The completed product should feel like a polished healthcare governance control center: calm, trustworthy, modern, precise, and ready for an enterprise product demonstration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://edon-command-center.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6956f219-22cc-42af-96af-ad714ddaf3ee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
