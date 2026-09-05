"use client"

// Renders role-aware navigation for authenticated operations.
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { AuthSession } from "@/lib/auth/session"
import { cn } from "@/lib/utils"
import { requiresReauth } from "@/lib/auth/reauth"
import { getNavigationItems } from "@/components/navigation/navigation-config"

export function Sidebar({ session }: { session: AuthSession }) {
  const pathname = usePathname()
  const navItems = getNavigationItems(session)

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-sidebar-border bg-sidebar/90 p-2 backdrop-blur-sm md:sticky md:top-4 md:h-fit md:w-60">
      <div className="mb-3 border-b border-sidebar-border px-2 pb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Inventory Suite
        </p>
        <h2 className="text-lg font-semibold text-foreground">Control Center</h2>
      </div>
      <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:flex md:flex-col">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            // Gated routes answer a prefetch with a redirect to /verify, which
            // the router would then cache and replay after the password had
            // already been accepted. Not prefetching avoids the whole race.
            prefetch={requiresReauth(item.href) ? false : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition",
              pathname === item.href
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
