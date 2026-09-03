# Progress Tracker

Update this file after meaningful feature work. It should let the next agent see what is implemented and what needs caution.

---

## Current Status

**Phase:** Production maintenance and feature iteration  
**Last documented:** Context refresh against the current two-branch Demo Inventory System structure  
**Next:** Keep context files updated after future feature changes

---

## Implemented

- [x] Login, setup admin, logout, password reset, and password re-verification
- [x] JWT session cookie, idle timeout refresh, current-user validation, and lapsed logout recording
- [x] Strict admin gate for `/dashboard`, `/reports`, `/financial-statements`, and matching API paths
- [x] Authenticated app shell with role-aware sidebar, loan notifications, user badge, logout, and admin store switcher
- [x] Two-branch store model: `store1` Gisozi and `store2` Kinyinya
- [x] Product catalog, SKU generation, receiving, supplier receipt tracking, categories, and product catalog PDF
- [x] Admin product stock movement monitor using receipts, sales/loans, returns/replacements, and stock adjustments
- [x] Low-stock alert synchronization
- [x] Sales entry, paid/unpaid state, customer capture, admin sale edit/delete/restore behavior, and non-admin edits where allowed
- [x] Loan/receivable view, partial payments, due and overdue notifications, and outstanding statement PDF
- [x] Returns with replacement support, stock restoration, report impact, and transactional update/delete reconciliation
- [x] Sales invoices and proforma invoices with PDF downloads
- [x] Expenses and categories
- [x] Dashboard and visual reports with cards, charts, store summary, top products, recent sales, and report PDF
- [x] Financial Reports section: Income Statement and Balance Sheet with PDF export
- [x] Manual balance-sheet items stored as append-only effective-dated `BalanceSheetItem` versions
- [x] User management and role/store controls
- [x] Anonymized visible business identity/contact values in source and documentation, while preserving image assets
- [x] Context documentation updated to match the current workspace structure

---

## Operational Notes

- Store keys are `store1` and `store2`; labels and document addresses live in `lib/utils/constants.ts`.
- Administrators can switch stores through `components/store-switcher.tsx`; route handlers must still resolve and enforce store access.
- Product stock is affected by sales, sale edits, sale deletion/restoration, returns, stock receiving, and stock adjustments.
- Staff and managers may edit sales they created where the route allows it; administrators have broader correction and deletion privileges.
- Low-stock alerts must stay synchronized after inventory mutations.
- Return edits and deletions must keep product quantity changes and return record mutations in the same transaction; guarded stock updates prevent concurrent writes from pushing stock below zero.
- Reports subtract returns from sales revenue and gross profit.
- Income Statement math in `lib/financial/income-statement.ts` intentionally mirrors the Reports page.
- Balance Sheet reconstructs Inventory Value and Accounts Receivable as of the selected date; no immutable ledger snapshot exists yet.
- `BalanceSheetItem` is append-only versioned: edits/deletes insert effective-dated versions; never mutate or hard-delete a version.
- Unpaid sales are loans; they are not a separate ledger.
- Loan settlement does not alter stock because stock moved when the sale was created.
- Invoice and proforma numbers use `NumberSequence`.
- PDFKit requires Node/server-only execution.
- PDFKit supports JPEG/PNG image embedding in this setup. PDF generators should use PNG/JPEG-compatible assets from `public/images`.
- Git status may require adding this repo as a safe.directory before git commands work in this environment.

---

## Verification Baseline

Recommended checks after code changes:

```bash
npm run lint
npm run build
```

Workflow checks should match the touched feature:

- Product changes: create/edit/receive/delete product and verify low-stock alerts.
- Sale changes: create paid sale, create unpaid sale, edit sale, delete/restore sale, verify stock.
- Loan changes: collect partial/full payment and refresh notifications.
- Return changes: return items and verify stock plus report calculations.
- Report changes: compare screen report and PDF report.
- Financial statement changes: compare statement screen totals and PDF totals.
- Auth changes: login, idle expiry, logout, setup admin, reset password, reauth gate.
