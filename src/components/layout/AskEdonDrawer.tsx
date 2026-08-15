import { useRouterState } from "@tanstack/react-router";
import { MessageSquareText, Send, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { CandidateTag } from "@/components/common/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  role: "user" | "edon";
  text: string;
  bullets?: string[];
}

const SUGGESTIONS = [
  "Explain why this item requires two-person approval",
  "Summarize the evidence for the open incidents",
  "Draft a change to the medication approval policy",
  "Which agents are affected by PHI Data Boundary v7?",
];

function answerFor(question: string, route: string): Msg {
  const q = question.toLowerCase();
  if (q.includes("two-person") || q.includes("approval"))
    return {
      id: `m${Date.now()}`,
      role: "edon",
      text: "Two-person approval is required because the object is classified High risk and the promotion crosses an environment boundary.",
      bullets: [
        "Clinical Safety Mode v12 §31 — promotion beyond Pilot requires department owner plus clinical safety approver",
        "Deterministic Kernel returned REQUIRE_APPROVAL, so no execution can occur without a recorded human decision",
        "Separation of duties prevents the submitter from approving their own request",
      ],
    };
  if (q.includes("evidence") || q.includes("incident"))
    return {
      id: `m${Date.now()}`,
      role: "edon",
      text: "Three incidents are open or contained. Evidence is drawn from immutable audit events and connector logs.",
      bullets: [
        "INC-9001 Imaging Routing drift — PSI 0.21 over 48h, 1,240 studies/day in scope, containment active",
        "INC-9002 Lab SFTP sync failure — 14 consecutive handshake timeouts, ingestion 4 days stale",
        "INC-9003 Scope-expansion attempt — blocked pre-execution, credentials rotated, 0 records accessed",
      ],
    };
  if (q.includes("draft") || q.includes("change"))
    return {
      id: `m${Date.now()}`,
      role: "edon",
      text: "Here is a draft amendment you can review. I cannot publish it — publication requires validation plus human approval.",
      bullets: [
        "Add rule: high-alert medication references require independent double check (Effect: Require Approval)",
        "Set priority 4 so it precedes the department reconciliation rule",
        "Cite authority: Medication Administration SOP.docx p.6",
      ],
    };
  if (q.includes("phi") || q.includes("affected"))
    return {
      id: `m${Date.now()}`,
      role: "edon",
      text: "PHI Data Boundary v7 applies enterprise-wide to all 500 governed agents and every connector handling PHI.",
      bullets: [
        "61 agents in Pharmacy, Emergency Medicine and Cardiology also inherit Medication Approval Policy v5",
        "2 connectors currently carry PHI classifications: Epic FHIR and Secure Lab SFTP Feed",
        "1 active conflict with Research Data Use Policy v3 on retention window",
      ],
    };
  return {
    id: `m${Date.now()}`,
    role: "edon",
    text: `I reviewed the governed objects visible on ${route}. Here is a non-authoritative summary you can act on manually.`,
    bullets: [
      "14 items are pending human review; 2 are within 10 hours of SLA",
      "Policy compliance is 97.8% across the 30-day window",
      "I can explain policies, summarize evidence and draft changes — I never execute actions",
    ],
  };
}

export function AskEdonDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const route = useRouterState({ select: (s) => s.location.pathname });
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: "m0",
      role: "edon",
      text: "I can explain policies, summarize evidence, and draft changes for review. Every answer I produce is a candidate and never executes an action.",
    },
  ]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text }, answerFor(text, route)]);
    setInput("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Ask EDON
          </SheetTitle>
          <SheetDescription className="text-xs">
            Contextual assistant for {route}. Advisory only — it cannot execute governed actions.
          </SheetDescription>
          <CandidateTag className="mt-1 w-fit" />
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-3 p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-6 border-primary/25 bg-primary/8"
                    : "mr-2 border-border bg-surface-subtle",
                )}
              >
                {m.role === "edon" && (
                  <span className="label-caps mb-1 block">EDON · candidate response</span>
                )}
                <p>{m.text}</p>
                {m.bullets && (
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    {m.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2 border-t border-border p-4">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-app hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about policies, evidence or drafts…"
              aria-label="Ask EDON"
            />
            <Button type="submit" size="icon" aria-label="Send question">
              <Send className="size-4" />
            </Button>
          </form>
          <button
            type="button"
            onClick={() => toast.info("Draft copied to your review clipboard (demo).")}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground underline-offset-2 transition-app hover:text-foreground hover:underline"
          >
            <MessageSquareText className="size-3" /> Send latest draft to a human reviewer
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
