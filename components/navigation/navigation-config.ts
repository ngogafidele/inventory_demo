import type { LucideIcon } from "lucide-react"
import {
  Bell,
  ChartColumn,
  ClipboardList,
  Clock,
  House,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  Scale,
  Users,
  Wallet,
  Wrench,
} from "lucide-react"
import type { AuthSession } from "@/lib/auth/session"

export type NavigationGroup = "Operations" | "Reports" | "Administration"

export type NavigationItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  group: NavigationGroup
  accent: string
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    href: "/home",
    label: "Home",
    description: "Return to the system home page and choose a workspace.",
    icon: House,
    group: "Operations",
    accent: "border-primary/30 bg-primary/5 hover:border-primary/60",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Review store performance and key inventory metrics.",
    icon: LayoutDashboard,
    group: "Operations",
    accent: "border-primary/30 bg-primary/5 hover:border-primary/60",
  },
  {
    href: "/users",
    label: "Users",
    description: "Manage staff accounts, roles, and access.",
    icon: Users,
    group: "Administration",
    accent: "border-warning/35 bg-warning/5 hover:border-warning/60",
    adminOnly: true,
  },
  {
    href: "/products",
    label: "Products",
    description: "Maintain your catalog, pricing, and stock levels.",
    icon: PackageSearch,
    group: "Operations",
    accent: "border-success/30 bg-success/5 hover:border-success/60",
  },
  {
    href: "/sales",
    label: "Sales",
    description: "Record sales and keep product movement current.",
    icon: ReceiptText,
    group: "Operations",
    accent: "border-accent/35 bg-accent/5 hover:border-accent/60",
  },
  {
    href: "/customers-suppliers",
    label: "Customers/Suppliers",
    description: "Find and manage the people and businesses you trade with.",
    icon: Users,
    group: "Operations",
    accent: "border-chart-3/35 bg-chart-3/5 hover:border-chart-3/60",
  },
  {
    href: "/returns",
    label: "Returns",
    description: "Process returned items and review return history.",
    icon: RotateCcw,
    group: "Operations",
    accent: "border-chart-2/35 bg-chart-2/5 hover:border-chart-2/60",
  },
  {
    href: "/invoices",
    label: "Invoices",
    description: "Create and manage invoices and proforma documents.",
    icon: ClipboardList,
    group: "Operations",
    accent: "border-primary/30 bg-primary/5 hover:border-primary/60",
  },
  {
    href: "/expenses",
    label: "Expenses",
    description: "Track operating costs for the current store.",
    icon: Wallet,
    group: "Operations",
    accent: "border-warning/35 bg-warning/5 hover:border-warning/60",
  },
  {
    href: "/outstanding",
    label: "Loans",
    description: "Follow unpaid sales and record customer payments.",
    icon: Clock,
    group: "Operations",
    accent: "border-warning/35 bg-warning/5 hover:border-warning/60",
  },
  {
    href: "/stock-adjustments",
    label: "Stock Adjustments",
    description: "Correct stock quantities with an auditable reason.",
    icon: Wrench,
    group: "Administration",
    accent: "border-warning/35 bg-warning/5 hover:border-warning/60",
    adminOnly: true,
  },
  {
    href: "/alerts",
    label: "Low Stock Alerts",
    description: "See products that need replenishment attention.",
    icon: Bell,
    group: "Operations",
    accent: "border-destructive/30 bg-destructive/5 hover:border-destructive/60",
  },
  {
    href: "/reports",
    label: "Visual Reports",
    description: "Explore sales, stock, and financial trends visually.",
    icon: ChartColumn,
    group: "Reports",
    accent: "border-accent/35 bg-accent/5 hover:border-accent/60",
    adminOnly: true,
  },
  {
    href: "/financial-statements",
    label: "Financial Reports",
    description: "Review income statement and balance sheet information.",
    icon: Scale,
    group: "Reports",
    accent: "border-success/30 bg-success/5 hover:border-success/60",
    adminOnly: true,
  },
]

export function getNavigationItems(session: Pick<AuthSession, "isAdmin">) {
  return navigationItems.filter((item) => !item.adminOnly || session.isAdmin)
}