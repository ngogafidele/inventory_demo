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
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    href: "/home",
    label: "Home",
    description: "Return to the system home page and choose a workspace.",
    icon: House,
    group: "Operations",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Review store performance and key inventory metrics.",
    icon: LayoutDashboard,
    group: "Operations",
  },
  {
    href: "/users",
    label: "Users",
    description: "Manage staff accounts, roles, and access.",
    icon: Users,
    group: "Administration",
    adminOnly: true,
  },
  {
    href: "/products",
    label: "Products",
    description: "Maintain your catalog, pricing, and stock levels.",
    icon: PackageSearch,
    group: "Operations",
  },
  {
    href: "/sales",
    label: "Sales",
    description: "Record sales and keep product movement current.",
    icon: ReceiptText,
    group: "Operations",
  },
  {
    href: "/customers-suppliers",
    label: "Customers/Suppliers",
    description: "Find and manage the people and businesses you trade with.",
    icon: Users,
    group: "Operations",
  },
  {
    href: "/returns",
    label: "Returns",
    description: "Process returned items and review return history.",
    icon: RotateCcw,
    group: "Operations",
  },
  {
    href: "/invoices",
    label: "Invoices",
    description: "Create and manage invoices and proforma documents.",
    icon: ClipboardList,
    group: "Operations",
  },
  {
    href: "/expenses",
    label: "Expenses",
    description: "Track operating costs for the current store.",
    icon: Wallet,
    group: "Operations",
  },
  {
    href: "/outstanding",
    label: "Loans",
    description: "Follow unpaid sales and record customer payments.",
    icon: Clock,
    group: "Operations",
  },
  {
    href: "/stock-adjustments",
    label: "Stock Adjustments",
    description: "Correct stock quantities with an auditable reason.",
    icon: Wrench,
    group: "Administration",
    adminOnly: true,
  },
  {
    href: "/alerts",
    label: "Low Stock Alerts",
    description: "See products that need replenishment attention.",
    icon: Bell,
    group: "Operations",
  },
  {
    href: "/reports",
    label: "Visual Reports",
    description: "Explore sales, stock, and financial trends visually.",
    icon: ChartColumn,
    group: "Reports",
    adminOnly: true,
  },
  {
    href: "/financial-statements",
    label: "Financial Reports",
    description: "Review income statement and balance sheet information.",
    icon: Scale,
    group: "Reports",
    adminOnly: true,
  },
]

export function getNavigationItems(session: Pick<AuthSession, "isAdmin">) {
  return navigationItems.filter((item) => !item.adminOnly || session.isAdmin)
}