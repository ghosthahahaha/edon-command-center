import {
  Boxes,
  FileSearch,
  FlaskConical,
  Inbox,
  LayoutDashboard,
  Radio,
  ScrollText,
  Settings,
  Workflow,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Inbox;
  match: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, match: "/dashboard" },
  { label: "Work Queue", to: "/work-queue", icon: Inbox, match: "/work-queue" },
  { label: "Integration & Encoding", to: "/encoding", icon: Workflow, match: "/encoding" },
  { label: "Agents & Runtimes", to: "/runtimes", icon: Boxes, match: "/runtimes" },
  { label: "Simulations", to: "/simulations", icon: FlaskConical, match: "/simulations" },
  { label: "Policies", to: "/policies", icon: ScrollText, match: "/policies" },
  { label: "Operations", to: "/operations", icon: Radio, match: "/operations" },
  { label: "Audit & Evidence", to: "/audit", icon: FileSearch, match: "/audit" },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  to: "/settings/organization",
  icon: Settings,
  match: "/settings",
};
