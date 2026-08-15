import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_app")({ component: Layout });

function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
