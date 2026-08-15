import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  Command as CommandIcon,
  Menu,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ActionDialogs";
import { StatusPill } from "@/components/common/StatusPill";
import { AskEdonDrawer } from "@/components/layout/AskEdonDrawer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/components/layout/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CURRENT_USER, TENANT, formatDateTime, type Environment } from "@/lib/mock-data";
import { useEdon } from "@/lib/store";
import { cn } from "@/lib/utils";

const ENVIRONMENTS: Environment[] = ["Audit-only", "Sandbox", "Pilot", "Production"];

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-1 py-1 transition-app">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <ShieldAlert className="size-4" aria-hidden />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">EDON</span>
          <span className="text-[10px] text-muted-foreground">AI Governance Control</span>
        </span>
      )}
    </Link>
  );
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useEdon();
  const pending = 14;

  const item = (n: (typeof NAV_ITEMS)[number]) => {
    const activeItem = path.startsWith(n.match);
    return (
      <Link
        key={n.to}
        to={n.to}
        onClick={onNavigate}
        aria-current={activeItem ? "page" : undefined}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-app",
          activeItem
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <n.icon className={cn("size-4 shrink-0", activeItem && "text-primary")} aria-hidden />
        {!collapsed && <span className="truncate">{n.label}</span>}
        {!collapsed && n.to === "/work-queue" && (
          <Badge variant="secondary" className="ml-auto num h-5 px-1.5 text-[10px]">
            {pending}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-2 py-3">
        <nav aria-label="Primary" className="space-y-1">
          {!collapsed && <p className="label-caps px-2.5 pb-1">Governance</p>}
          {NAV_ITEMS.map(item)}
        </nav>
      </ScrollArea>
      <div className="space-y-1 border-t border-sidebar-border px-2 py-3">
        {item(SETTINGS_ITEM)}
        {!collapsed && (
          <p className="px-2.5 pt-2 text-[10px] leading-relaxed text-muted-foreground">
            {TENANT.name} · {state.environment}
            <br />
            Synthetic demo tenant
          </p>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, setSidebarCollapsed, setEnvironment, toggleLockdown, markNotificationsRead, notify } =
    useEdon();
  const collapsed = state.sidebarCollapsed;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [askOpen, setAskOpen] = React.useState(false);
  const [lockdownOpen, setLockdownOpen] = React.useState(false);
  const unread = state.notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-canvas p-0 lg:p-3">
        <div className="flex min-h-screen overflow-hidden border-border bg-surface lg:min-h-[calc(100vh-1.5rem)] lg:rounded-2xl lg:border lg:shadow-panel">
          {/* Desktop sidebar */}
          <aside
            className={cn(
              "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-app lg:flex",
              collapsed ? "w-[68px]" : "w-[252px]",
            )}
          >
            <div className={cn("flex items-center gap-2 px-3 py-3", collapsed && "justify-center px-0")}>
              <Logo compact={collapsed} />
            </div>
            <SidebarNav collapsed={collapsed} />
            <div className="border-t border-sidebar-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-muted-foreground"
                onClick={() => setSidebarCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
                {!collapsed && "Collapse"}
              </Button>
            </div>
          </aside>

          {/* Mobile sidebar */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                className="absolute inset-0 bg-foreground/30"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-[268px] flex-col bg-sidebar shadow-pop">
                <div className="flex items-center justify-between px-3 py-3">
                  <Logo />
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                    <X className="size-4" />
                  </Button>
                </div>
                <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 flex flex-col border-b border-border bg-surface/95 backdrop-blur">
              <div className="flex items-center gap-2 px-3 py-2.5 md:px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </Button>
                <div className="lg:hidden">
                  <Logo compact />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 max-w-[190px] justify-start">
                      <span className="truncate">{TENANT.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Tenant</DropdownMenuLabel>
                    <DropdownMenuItem className="gap-2">
                      <span className="font-medium">{TENANT.name}</span>
                      <StatusPill value="Active" className="ml-auto" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => toast.info("Demo tenant only — additional tenants are not provisioned.")}
                    >
                      St. Mercy Ambulatory (not provisioned)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-xs text-muted-foreground transition-app hover:border-border-strong md:flex"
                >
                  <Search className="size-3.5" aria-hidden />
                  Search agents, policies, incidents…
                  <span className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px]">
                    <CommandIcon className="size-3" />K
                  </span>
                </button>

                <div className="ml-auto flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setPaletteOpen(true)}
                    aria-label="Search"
                  >
                    <Search className="size-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-2">
                        <span className="hidden sm:inline text-xs text-muted-foreground">Env</span>
                        <StatusPill value={state.environment} dot />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Current environment</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ENVIRONMENTS.map((env) => (
                        <DropdownMenuItem
                          key={env}
                          onSelect={() => {
                            if (state.lockdown && env !== "Audit-only") {
                              toast.error("Lockdown active — only Audit-only is permitted.");
                              return;
                            }
                            setEnvironment(env);
                            toast.success(`Environment switched to ${env}.`);
                          }}
                        >
                          {env}
                          {state.environment === env && (
                            <span className="ml-auto text-xs text-primary">current</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/work-queue"
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-warning/30 bg-warning/12 px-2.5 text-xs font-medium text-warning transition-app hover:bg-warning/20"
                      >
                        <span className="num">14</span>
                        <span className="hidden sm:inline">pending review</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>14 items awaiting human decision</TooltipContent>
                  </Tooltip>

                  <Popover onOpenChange={(o) => o && markNotificationsRead()}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                        <Bell className="size-4" />
                        {unread > 0 && (
                          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0">
                      <p className="border-b border-border px-3 py-2 text-sm font-medium">Notifications</p>
                      <ul className="max-h-80 divide-y divide-border overflow-auto">
                        {state.notifications.map((n) => (
                          <li key={n.id} className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <StatusPill
                                value={n.tone === "danger" ? "Critical" : n.tone === "warning" ? "High" : "Low"}
                                tone={n.tone === "info" ? "info" : undefined}
                              />
                              <span className="text-xs text-muted-foreground">{formatDateTime(n.at)}</span>
                            </div>
                            <p className="mt-1 text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.detail}</p>
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Help"
                        onClick={() =>
                          toast.info("EDON demo: every route is interactive and backed by synthetic data.")
                        }
                      >
                        <CircleHelp className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Help & demo notes</TooltipContent>
                  </Tooltip>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition-app hover:border-border-strong">
                        <span className="grid size-6 place-items-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary-dark">
                          {CURRENT_USER.initials}
                        </span>
                        <span className="hidden text-xs font-medium lg:inline">{CURRENT_USER.name}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>
                        <span className="block text-sm">{CURRENT_USER.name}</span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          {CURRENT_USER.role}
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/settings/identity">Identity & roles</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings/governance">Governance settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.info("Demo session — sign-out is disabled.")}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant={state.lockdown ? "destructive" : "outline"}
                    size="sm"
                    className={cn("h-9 gap-1.5", !state.lockdown && "border-destructive/30 text-destructive")}
                    onClick={() => setLockdownOpen(true)}
                  >
                    <ShieldAlert className="size-4" />
                    <span className="hidden sm:inline">
                      {state.lockdown ? "Lockdown active" : "Emergency Lockdown"}
                    </span>
                  </Button>
                </div>
              </div>

              {(state.environment === "Sandbox" || state.lockdown) && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 text-[11px] font-medium tracking-wide",
                    state.lockdown
                      ? "bg-destructive/12 text-destructive"
                      : "bg-info/10 text-info",
                  )}
                  role="status"
                >
                  <ShieldAlert className="size-3.5" aria-hidden />
                  {state.lockdown
                    ? "EMERGENCY LOCKDOWN — All agent execution suspended · Audit-only · Human approvals required for restoration"
                    : "SANDBOX MODE — Audit-only · No production execution"}
                </div>
              )}
            </header>

            <main className="min-w-0 flex-1 bg-canvas/60 px-3 py-4 md:px-5 md:py-6">{children}</main>
          </div>
        </div>

        {/* Floating Ask EDON */}
        <Button
          onClick={() => setAskOpen(true)}
          className="fixed bottom-5 right-5 z-40 h-11 gap-2 rounded-full shadow-pop"
        >
          <Sparkles className="size-4" />
          Ask EDON
        </Button>

        <AskEdonDrawer open={askOpen} onOpenChange={setAskOpen} />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <ConfirmDialog
          open={lockdownOpen}
          onOpenChange={setLockdownOpen}
          destructive={!state.lockdown}
          requireReason
          title={state.lockdown ? "Lift emergency lockdown" : "Enter emergency lockdown"}
          description={
            state.lockdown
              ? "Lifting lockdown returns the tenant to Audit-only. Agents remain paused until each department owner re-enables them."
              : "Lockdown immediately suspends all agent execution across every environment and forces Audit-only mode. A written reason is required."
          }
          confirmLabel={state.lockdown ? "Lift lockdown" : "Enter lockdown"}
          onConfirm={(reason) => {
            const next = !state.lockdown;
            toggleLockdown(next);
            notify({
              title: next ? "Emergency lockdown engaged" : "Emergency lockdown lifted",
              detail: reason,
              tone: next ? "danger" : "success",
            });
            toast[next ? "error" : "success"](
              next ? "Emergency lockdown engaged — all execution suspended." : "Lockdown lifted — tenant is in Audit-only.",
            );
          }}
        />
      </div>
    </TooltipProvider>
  );
}
