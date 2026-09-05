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
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Welcome to your operations hub
        </p>
        <h2 className="mt-1 text-2xl font-semibold">
          Everything you need to run your inventory system.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Demo Inventory System brings products, stock, sales, customers,
          suppliers, expenses, invoices, alerts, and financial reporting into
          one practical workspace.
        </p>
      </div>

      <div className="space-y-6">
        {groupOrder.map((group) => {
          const items = navigationItems.filter((item) => item.group === group)
          if (items.length === 0) return null

          return (
            <section key={group} aria-labelledby={`${group}-heading`}>
              <h3
                id={`${group}-heading`}
                className="mb-3 text-lg font-semibold text-foreground"
              >
                {group}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={requiresReauth(item.href) ? false : undefined}
                    className="group rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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