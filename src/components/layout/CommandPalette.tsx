import { useNavigate } from "@tanstack/react-router";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/components/layout/nav";
import { useEdon } from "@/lib/store";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { agents, policies, incidents, queue } = useEdon();

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search agents, policies, incidents, queue items…" />
      <CommandList>
        <CommandEmpty>No matches in this tenant.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {[...NAV_ITEMS, SETTINGS_ITEM].map((n) => (
            <CommandItem key={n.to} value={`nav ${n.label}`} onSelect={() => go(n.to)}>
              <n.icon className="size-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Agents">
          {agents.slice(0, 8).map((a) => (
            <CommandItem key={a.id} value={`agent ${a.name} ${a.department}`} onSelect={() => go(`/runtimes/${a.id}`)}>
              <span className="truncate">{a.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{a.department}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Policies">
          {policies.map((p) => (
            <CommandItem key={p.id} value={`policy ${p.name}`} onSelect={() => go(`/policies/${p.id}`)}>
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Work queue">
          {queue.slice(0, 6).map((q) => (
            <CommandItem key={q.id} value={`queue ${q.title}`} onSelect={() => go(`/work-queue/${q.id}`)}>
              <span className="truncate">{q.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{q.priority}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Incidents">
          {incidents.map((i) => (
            <CommandItem key={i.id} value={`incident ${i.title}`} onSelect={() => go(`/operations/incidents/${i.id}`)}>
              <span className="truncate">{i.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{i.severity}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
