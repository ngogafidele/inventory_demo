# UI Registry

Living document for implemented visual patterns. Update this file after creating or materially changing reusable UI or major feature screens.

---

## App Shell

File: `components/layout/app-shell.tsx`

| Property | Pattern |
| --- | --- |
| Shell | `min-h-screen bg-background` |
| Header | `sticky top-0 z-30 border-b border-border/80 bg-card/90 backdrop-blur` |
| Header inner | `mx-auto flex max-w-[92rem] ... px-2 py-2 sm:px-3 sm:py-3 lg:px-4` |
| Logo box | `size-12 rounded-xl border border-border bg-white shadow-sm` |
| User badge | `rounded-xl border border-border bg-background px-3 py-2 shadow-sm` |
| Store switcher | Admin-only `Select`, `h-12 min-w-40 border-primary/40 bg-primary/10` |
| Main region | `max-w-[92rem] ... gap-3 px-2 py-2 sm:px-3 sm:py-3 lg:px-4` |
| Content panel | `rounded-2xl border border-border/80 bg-card/95 p-2 shadow-sm backdrop-blur-sm sm:p-3 lg:p-4` |

Pattern notes: The shell is dense and operational. Keep the header sticky and the content area constrained to the existing wide max width.

---

## Sidebar

File: `components/layout/sidebar.tsx`

| Property | Pattern |
| --- | --- |
| Shell | `w-full ... rounded-2xl border border-sidebar-border bg-sidebar/90 p-2 backdrop-blur-sm md:sticky md:top-4 md:h-fit md:w-60` |
| Header | `mb-3 border-b border-sidebar-border px-2 pb-2` |
| Nav grid | `grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:flex md:flex-col` |
| Item | `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition` |
| Active | `bg-primary text-primary-foreground shadow-sm` |
| Inactive | `text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` |

Pattern notes: Navigation is role-aware and icon-led. Admins get users, stock adjustments, reports, and financial statements. Sensitive admin links disable prefetch when reauth is required.

---

## Auth Screens

Files: `app/page.tsx`, `app/setup-admin/page.tsx`, `app/reset-password/page.tsx`, `app/verify/page.tsx`, `app/globals.css`

| Property | Pattern |
| --- | --- |
| Surface | `.brand-auth-surface min-h-screen` |
| Surface palette | `--brand-navy: #002050`, `--brand-orange: #f08010`, `--brand-charcoal: #505050` |
| Background asset | `/images/auth-background.webp` where used by auth pages |
| Logo asset | `/images/logo.png` |
| Form card | `rounded-xl border border-border/80 bg-card/95 p-5 shadow-xl backdrop-blur sm:p-7` |
| Input height | `h-11` on auth forms |
| Primary action | Navy primary button or token `bg-primary text-primary-foreground` |
| Secondary action | Outline/token variants |

Pattern notes: Auth screens are the only place for the richer branded surface. Do not carry the auth composition into the authenticated operational shell.

---

## Page Headers

Files: most `app/(dashboard)/*/page.tsx` and manager components

| Property | Pattern |
| --- | --- |
| Wrapper | `space-y-5` or `space-y-6` |
| Eyebrow | `text-xs uppercase tracking-[0.2em] text-muted-foreground` |
| Title | `text-2xl font-semibold` |
| Helper | `text-sm text-muted-foreground` |

Pattern notes: Keep headings short and functional. Store-aware pages often include the active branch label in the eyebrow or helper text.

---

## Local Primitives

Files: `components/ui/button.tsx`, `input.tsx`, `select.tsx`, `dialog.tsx`, `table.tsx`, `data-table.tsx`, `skeleton.tsx`

| Component | Pattern |
| --- | --- |
| Button | `rounded-lg`, `h-8`, `text-sm font-medium`, variants through `buttonVariants` |
| Input | `h-8`, `rounded-lg`, token border/ring, `md:text-sm` |
| Dialog | Radix primitive, `bg-popover`, `rounded-xl`, close button with lucide `XIcon` |
| Table | Compact local table wrappers and cells |
| Skeleton | Use for loading states rather than ad hoc gray blocks |

Pattern notes: Prefer these primitives before adding a new UI dependency.

---

## Operational Tables

Files: feature managers under `components/*`

| Property | Pattern |
| --- | --- |
| Wrapper | Horizontal overflow from local table wrapper |
| Headers | Compact, descriptive, business-field first |
| Cells | `p-2`, often `whitespace-nowrap` |
| Empty state | Full-width table row with muted text |
| Alternating rows | `bg-muted/60 hover:bg-muted/70` where the feature already uses it |
| Pagination | Many managers paginate at 20 rows per page |

Pattern notes: Keep tables optimized for repeated scanning and correction workflows.

---

## Reports

Files: `app/(dashboard)/reports/page.tsx`, `components/reports/report-charts.tsx`

| Property | Pattern |
| --- | --- |
| Filter form | `grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_auto_auto]` |
| Metric cards | `rounded-2xl border p-4 shadow-sm` with semantic color tint |
| Report sections | `space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm` |
| Charts | Recharts using `--viz-*` and `--chart-*` variables |
| Detail tables | Collapsible or section-level local tables |

Pattern notes: Reports use more color than daily operation screens to distinguish financial categories. They are admin-only and gated by reauth.

---

## Financial Reports

Files: `components/financial-statements/financial-statements-manager.tsx`, `income-statement-view.tsx`, `balance-sheet-view.tsx`, `app/(dashboard)/financial-statements/page.tsx`

| Property | Pattern |
| --- | --- |
| Access | Admin-only page and routes, gated by reauth |
| Layout | `space-y-6` with compact controls and bordered statement sections |
| Statement tables | Bordered table grids with clear total rows |
| Manual items | Inline actions for versioned balance sheet items |
| PDF action | Route-backed PDF download button |

Pattern notes: Statement math is business-critical. UI edits should preserve the same totals shown by the API/PDF responses.

---

## Product Stock Monitor

Files: `components/products/product-monitor-dialog.tsx`, `components/products/stock-movement-charts.tsx`, `app/api/products/[id]/movements/route.ts`

| Property | Pattern |
| --- | --- |
| Trigger | Admin-only Monitor action |
| Modal | Widened `DialogContent` with scrollable body |
| Range selector | Button chips for bounded/all-time views |
| Stat tiles | Compact bordered tiles with uppercase eyebrow and strong value |
| Charts | Recharts area/bar charts |
| Event table | Local table with signed in/out movement badges |

Pattern notes: The monitor is read-only and admin-only. It reconstructs history from receipts, sales/loans, returns/replacements, and stock adjustments, then anchors the running balance to current product quantity.

---

## PDF Documents

Files: `lib/pdf/*.ts`

| Property | Pattern |
| --- | --- |
| Library | PDFKit, server-only |
| Assets | `/public/images/logo.png` and `/public/images/stamp.png` where supported |
| Identity | Store label/address values from shared constants or route-level store info |
| Palette | Current generators use local print-safe navy/orange/neutral constants |
| Tables | Compact rows, alternating light fills, explicit totals |

Pattern notes: Keep PDF code tolerant of missing image files. If shared PDF theme constants are introduced later, update this registry and all generators together.
