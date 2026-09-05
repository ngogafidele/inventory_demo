import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { requireServerSession } from "@/lib/auth/server"
import { requiresReauth } from "@/lib/auth/reauth"
import {
  getNavigationItems,
  type NavigationGroup,
} from "@/components/navigation/navigation-config"

const groupOrder: NavigationGroup[] = [
  "Operations",
  "Reports",
  "Administration",
]

export default async function HomePage() {
  const session = await requireServerSession()
  const navigationItems = getNavigationItems(session)

  return (
    <div className="space-y-7">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-24 border-accent/40" />
        <div className="relative max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-8 bg-accent" />
            Demo Inventory System
          </div>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Everything you need to run your inventory system.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/75">
            Products, stock, sales, customers, suppliers, expenses, invoices,
            alerts, and financial reporting in one practical workspace.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {groupOrder.map((group) => {
          const items = navigationItems.filter((item) => item.group === group)
          if (items.length === 0) return null

          return (
            <section key={group} aria-labelledby={`${group}-heading`}>
              <h3
                id={`${group}-heading`}
                className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground"
              >
                <span className="h-5 w-1 rounded-full bg-accent" />
                {group}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={requiresReauth(item.href) ? false : undefined}
                    className={`group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.accent}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                        <item.icon className="size-5" />
                      </div>
                      <ArrowRight className="mt-1 size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h4 className="mt-4 font-semibold text-foreground">
                      {item.label}
                    </h4>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}