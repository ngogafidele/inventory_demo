# UI Rules

## Overall Feel

Demo Inventory System is an operational business tool. Screens should feel dense, calm, and practical. Prioritize scanability, quick data entry, predictable tables, and clear status indicators over decorative presentation.

---

## Navigation

- Authenticated pages use the existing sticky header plus left/sidebar navigation.
- The sidebar is role-aware. Admins see Dashboard, Users, operational screens, Stock Adjustments, Visual Reports, and Financial Reports. Non-admin users see Dashboard plus common operational screens.
- Admins can switch between Gisozi and Kinyinya from the header store switcher.
- Active sidebar item uses `bg-primary text-primary-foreground shadow-sm`.
- Inactive sidebar items use `text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`.
- Do not add a second top navigation model.

---

## Page Structure

Operational pages generally use:

```tsx
<div className="space-y-5">
  <div>
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">...</p>
    <h2 className="text-2xl font-semibold">...</h2>
  </div>
  ...
</div>
```

Use `space-y-5` or `space-y-6` for page sections. Use `rounded-2xl border border-border/80 bg-card p-4 shadow-sm` for major sections and report panels.

---

## Forms

- Labels use `grid gap-1 text-sm`.
- Use local `Input`, `Select`, `Dialog`, and `Button` primitives.
- Keep product/sale/receipt forms compact and grid-based.
- Show validation errors as human-readable text in `text-sm text-destructive`.
- Never expose raw exception messages to users unless the API route intentionally returns a safe message.
- For destructive actions, keep the current `confirm()` pattern unless replacing the whole workflow with a consistent dialog.

---

## Tables

- Use local table primitives from `components/ui/table.tsx` or feature table wrappers already present in the area being changed.
- Keep tables horizontally scrollable through the table wrapper.
- Use compact cells and clear headers.
- Empty states live inside a full-width table row with muted text.
- Existing managers commonly paginate at 20 rows per page.
- Alternating muted rows are used in several feature tables; match that pattern when extending those tables.

---

## Buttons And Icons

- Use `lucide-react` icons when a button benefits from recognition, such as invoice, receive, edit, delete, monitor, PDF, or report actions.
- Use primary buttons for main submit actions.
- Use outline buttons for secondary and cancel actions.
- Use destructive buttons for delete/correction actions.
- Keep button text short and operational: "Record Sale", "Receive", "Catalog PDF", "Create Invoice".

---

## Cards, Charts, And Status

- Cards are functional containers, not decorative shells.
- Use white/card surfaces for main sections.
- Use muted tinted strips for totals, summaries, and calculated values.
- Reports and financial statements may use semantic palette tints because existing report screens already do.
- Product movement and report charts use Recharts and should prefer token colors (`--chart-*` and `--viz-*`) over hardcoded colors.
- Low stock, unpaid, below-cost, overdue, and destructive states must be visually distinct.

---

## Auth Screen

The login, setup-admin, reset-password, and verify screens are the public or security-focused branded screens. They use `.brand-auth-surface`, `/images/auth-background.webp`, `/images/logo.png`, navy/orange brand variables, and larger authentication copy. Do not copy that richer style into the authenticated app shell.

---

## Do Nots

- Do not add a landing page. The app entry is the login form.
- Do not add another design system or component library.
- Do not replace local primitives casually.
- Do not add wide hero sections inside the operational app.
- Do not bypass the existing store switcher/store-scoping model.
- Do not use client-side fetching for initial page data when the existing page pattern is server fetch plus client manager.
