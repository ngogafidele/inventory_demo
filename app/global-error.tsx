"use client"

// Provides the root error boundary UI required by Next.js App Router.
import "./globals.css"

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              BIRW Inventory
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Refresh the workspace and try the action again.
            </p>
            <button
              type="button"
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => unstable_retry()}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
