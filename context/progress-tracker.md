# Progress Tracker

Update this file after meaningful feature work. It should let the next agent see what is implemented and what needs caution.

---

## Current Status

**Phase:** Production maintenance and feature iteration  
**Last documented:** Login and setup-admin layouts refined on the BIRW logo palette
**Next:** Keep context files updated after future feature changes

---

## Implemented

- [x] Login, setup admin, logout, password reset
- [x] JWT session cookie, idle timeout refresh, current-user validation
- [x] Authenticated app shell with role-aware sidebar
- [x] Single-store resolution for BIRW INVESTMENT GROUP Ltd
- [x] Product catalog, SKU generation, receiving, supplier receipt tracking
- [x] Low-stock alert synchronization
- [x] Sales entry, paid/unpaid state, customer capture, sale edit/delete
- [x] Loan/receivable view, partial payments, due and overdue notifications
- [x] Returns with stock restoration and report impact
- [x] Sales invoices and proforma invoices
- [x] PDF generation for invoices, proformas, reports, product catalogs, and outstanding statements
- [x] Expenses and categories
- [x] Dashboard and admin reports
- [x] User management and role controls
- [x] Context documentation mirroring `job_pilot/context`
- [x] Shared UI tokens plus login and setup-admin screens use the BIRW logo-derived green, blue, and gold palette
- [x] Login and setup-admin screens use balanced branded auth layouts with compact operational context and clearer form cards

---

## Operational Notes

- `store1` is the only active store. Store helpers intentionally return BIRW INVESTMENT GROUP Ltd.
- Product stock is affected by sales, sale edits, sale deletion, returns, stock receiving, and stock adjustments.
- Low-stock alerts must stay synchronized after inventory mutations.
- Reports subtract returns from sales revenue and gross profit.
- Unpaid sales are loans; they are not a separate ledger.
- Loan settlement does not alter stock because stock moved when the sale was created.
- Invoice and proforma numbers use `NumberSequence`.
- PDFKit requires Node/server-only execution.
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
- Sale changes: create paid sale, create unpaid sale, edit sale, delete sale, verify stock.
- Loan changes: collect partial/full payment and refresh notifications.
- Return changes: return items and verify stock plus report calculations.
- Report changes: compare screen report and PDF report.
- Auth changes: login, idle expiry, logout, setup admin, reset password.
