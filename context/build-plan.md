# Build Plan

This file describes implemented product areas and the safest order for future work. Demo Inventory System is already a functional application; new work should preserve existing operational behavior instead of treating this as a greenfield plan.

---

## Principle

For every feature, start from the real business invariant:

- Which store does it affect?
- Does it move stock?
- Does it affect revenue, cost of sales, expenses, receivables, profit, or financial statements?
- Does it need a PDF or customer-facing document?
- Which roles are allowed to perform the action?
- Does it need admin step-up verification or strict idle handling?

Build UI and data changes together only when the workflow can be verified end to end.

---

## Implemented Areas

### 01 Authentication, Setup, And Verification

- Login page
- Setup admin page
- Logout
- Password reset request and reset form
- JWT cookie sessions
- Idle timeout refresh through `proxy.ts`
- Active-user verification from MongoDB
- Step-up password verification through `/verify` for sensitive admin reporting areas

### 02 Authenticated Shell

- Sticky header with logo, user badge, loan notifications, logout
- Role-aware sidebar
- Admin store switcher for Gisozi and Kinyinya
- Main content shell
- Admin and non-admin navigation differences

### 03 Product Catalog And Receiving

- Product list, search, pagination
- Admin create/edit/delete
- Generated SKU sequence
- Cost price, selling price, category, unit, low-stock threshold
- Supplier receipt workflow
- Product catalog PDF
- Low-stock alert synchronization
- Admin stock movement monitor with charts and event table

### 04 Sales And Stock Movement

- Multi-line sale entry
- Paid and unpaid sale flows
- Customer capture
- Admin cost price override
- Stock availability checks
- Sale edit with stock reconciliation
- Admin sale deletion and restore behavior
- Create invoice from sale

### 05 Customer Loans

- Unpaid sales list
- Expected payment dates
- Due/overdue notifications
- Partial and full payment collection
- Outstanding customer statement PDF
- Admin correction actions

### 06 Returns

- Returned item capture
- Replacement item support
- Stock restoration
- Revenue and profit reduction in reports
- Transactional update/delete reconciliation

### 07 Invoices And Proformas

- Sales invoice list and management
- Proforma list and management
- Per-store numbering
- PDF downloads
- Invoice status handling

### 08 Expenses

- Store-level operating expense entry
- Payment method capture
- Category support
- Report and income statement integration

### 09 Alerts

- Low-stock alerts
- Alert synchronization after product and inventory mutations
- Alert management routes

### 10 Reports, Dashboard, And Financial Statements

- Admin dashboard stats
- Date-range visual reports with metric cards, charts, store summary, top products, and recent sales
- Product movement
- Inventory valuation
- Loans, invoices, expenses, revenue, cost of sales, profit, and payment method totals
- Report PDF
- Admin Income Statement and Balance Sheet pages
- Financial statement PDFs
- Append-only manual balance sheet items

### 11 User Management

- Admin user create/update/delete
- Role, active status, and store assignment management
- User login log model

---

## Future Work Order

When adding substantial new work, prefer this sequence:

1. Update or add data model fields and validators.
2. Update route handlers with auth, store scoping, validation, transactions, and safe errors.
3. Update Server Component data loading and serialization.
4. Update client manager UI.
5. Update report, dashboard, financial statement, and PDF calculations if the workflow affects financials.
6. Update `context/progress-tracker.md` and `context/ui-registry.md`.
7. Verify lint/build and the relevant workflow manually.

---

## High-Risk Areas

- Sale create/edit/delete/restore
- Return update/delete handling
- Loan payment settlement
- Product receiving and stock adjustments
- Reports and income statement profit calculations
- Balance sheet historical reconstruction
- Invoice/proforma numbering
- Auth/session/proxy/reauth changes
- PDF generation in production runtime

Treat these areas as requiring extra reading and verification.
