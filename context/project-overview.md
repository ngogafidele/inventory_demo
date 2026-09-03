# Project Overview

## About The Project

Demo Inventory System is a two-branch inventory, sales, invoicing, receivables, expense, alert, and reporting application for a physical-goods business. The active branches are `Gisozi` and `Kinyinya`.

The app is implemented as a Next.js 16 App Router project with React 19, MongoDB/Mongoose persistence, JWT cookie sessions, Zod validation, Tailwind CSS 4 plus local UI primitives, Recharts visualizations, and PDFKit-generated documents.

---

## Store Model

Application data is isolated by store.

| Internal Key | Branch | Document Address |
| --- | --- | --- |
| `store1` | Gisozi | `xxxxxxx` |
| `store2` | Kinyinya | `xxxxxxx` |

Users carry an allowed `stores` list in their session. Administrators can switch the active store from the authenticated header; non-admin users operate in their assigned store. Route handlers resolve the store from the request/session and reject stores that are not allowed for the current user.

---

## Pages

```text
/                         Login page
/setup-admin              First administrator setup
/reset-password           Password reset form
/verify                   Step-up password verification
/dashboard                Admin overview
/products                 Product catalog, receiving, stock movement monitor
/sales                    Sales entry, sale edit, sale invoicing
/customers-suppliers      Customer and supplier lookup
/returns                  Returns and replacements
/invoices                 Sales invoices and proformas
/expenses                 Operating expenses
/outstanding              Unpaid sales, loan collection, statements
/alerts                   Low-stock alerts
/stock-adjustments        Admin stock corrections
/reports                  Admin visual reports
/financial-statements     Admin income statement and balance sheet
/users                    Admin user management
```

---

## Core User Flow

1. An admin creates the first account from `/setup-admin`.
2. Users sign in from `/` with email and password.
3. The authenticated shell wraps operational pages with a sticky header, role-aware sidebar, loan notifications, user badge, optional admin store switcher, and logout action.
4. Staff and managers use daily workflows for products, sales, returns, invoices, proformas, expenses, loans, and alerts within their assigned store.
5. Admins additionally access dashboard, reports, financial statements, users, stock adjustments, product administration, correction edits, destructive actions, and branch switching.

---

## Business Capabilities

- Manage branch-specific products, generated SKUs, categories, units, quantities, low-stock thresholds, cost prices, selling prices, and supplier receipt context.
- Receive stock with supplier details, received date, quantity, unit cost, and total cost.
- Record paid sales through cash, bank, or mobile money.
- Record unpaid sales as customer loans with expected payment dates.
- Track partial loan payments, remaining balances, due-today loans, and overdue loans.
- Create invoices from sales and create proformas from sale-backed or manually entered item data.
- Download PDFs for sales invoices, proformas, product catalogs, outstanding statements, management reports, income statements, and balance sheets.
- Record returns, replacement items, expenses, low-stock alerts, and admin stock adjustments.
- Produce admin reports for revenue, cost of sales, expenses, profit, inventory value, loans, product movement, recent sales, income statements, and balance sheets.

---

## Roles And Access

| Role | Access Pattern |
| --- | --- |
| Admin | Full access, including dashboard, reports, financial statements, users, stock adjustments, product management, branch switching, and corrective edits/deletes. |
| Manager | Assigned-store operational workflows where permitted by routes and UI. |
| Staff | Assigned-store operational workflows without admin-only management functions. |

JWT sessions carry `userId`, `name`, `email`, `role`, `isAdmin`, allowed `stores`, `currentStore`, login log id, idle timestamp, strict-mode flag, and optional step-up verification timestamp.

Admin idle timeout is 1 hour, staff/manager idle timeout is 6 hours, and strict financial routes use a 10-minute admin idle window plus password re-verification.

---

## Success Criteria

- Every operational query and mutation is scoped to an authorized store.
- Stock never goes below zero.
- Sales, returns, stock receiving, stock adjustments, and sale deletion keep product quantities accurate.
- Paid sales require a payment method.
- Unpaid sales require customer and expected payment details.
- Loans remain sales: goods leave stock when issued, not when the loan is collected.
- Report calculations and report PDFs use the same revenue, return, expense, and inventory semantics.
- Customer-facing documents use the anonymized Demo Inventory System identity and branch address values.
