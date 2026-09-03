# Architecture

## Stack

| Layer | Tool | Purpose |
| --- | --- | --- |
| Framework | Next.js 16 App Router | Pages, layouts, route handlers, server rendering |
| UI | React 19, Tailwind CSS 4, local UI primitives, lucide-react | Operational interface |
| Charts | Recharts | Reports and product stock movement visuals |
| Database | MongoDB with Mongoose | Business records and indexes |
| Validation | Zod | API payload validation |
| Authentication | JWT cookie, bcrypt, custom auth/session helpers | Login, idle expiry, step-up verification, route protection |
| Documents | PDFKit | Invoices, proformas, catalogs, statements, management reports, financial statements |
| Email | Resend-compatible password reset helper | Password reset emails |

---

## Folder Structure

```text
app/
  (dashboard)/              Authenticated operational pages and loading states
  api/                      JSON mutations, queries, and PDF route handlers
  page.tsx                  Login page
  setup-admin/              Initial administrator setup
  reset-password/           Password reset UI
  verify/                   Step-up password verification UI
components/
  layout/                   Authenticated shell, sidebar, loan notifications
  auth/                     Reauth, idle guard, password confirmation, logout
  ui/                       Local button, input, select, dialog, table primitives
  products/                 Product catalog, search select, receiving, stock monitor
  sales/                    Sale entry, edit, invoice creation
  outstanding/              Loan collection and statement workflow
  invoices/                 Invoice and proforma managers
  reports/                  Report charts and PDF client action
  financial-statements/     Income statement and balance sheet views
  customers-suppliers/      Customer/supplier lookup manager
  expenses/                 Expense manager
  returns/                  Return manager
  stock-adjustments/        Admin stock corrections
  users/                    User manager
  tables/, forms/, skeletons/Shared feature helpers
lib/
  auth/                     Sessions, permissions, password hashing, current user, reauth, idle policy
  db/models/                Mongoose models
  db/validators/            Zod payload schemas
  db/                       Alerts, payments, loan reconciliation, connection
  financial/                Income statement, balance sheet, cash-position, period math
  pdf/                      PDFKit document generators
  utils/                    Store constants, time, formatting, numbering, API client
types/                      Shared TypeScript contracts
public/images/              Logo, stamp, and auth background assets
```

---

## Rendering Boundary

Dashboard pages are Server Components by default. They authenticate through `requireServerSession()`, resolve the current authorized store with `getCurrentStore(session)`, connect to MongoDB, query Mongoose models, serialize documents, then pass serializable data into client manager components.

Client manager components own local form state, dialogs, filtering, pagination, charts, optimistic list updates, and fetch calls to route handlers.

---

## API Boundary

Route handlers under `app/api/**/route.ts` follow this pattern:

1. Authenticate with helpers from `lib/auth/middleware.ts`.
2. Use admin-only checks for restricted operations.
3. Resolve the store with `resolveStoreFromRequest(request, session)`.
4. Validate request bodies with Zod validators from `lib/db/validators`.
5. Connect to MongoDB through `connectToDatabase()`.
6. Apply Mongoose reads/writes, using transactions for multi-write inventory mutations where needed.
7. Return `{ success: boolean, data?: T, error?: string }` or a binary PDF response.

PDF route handlers use the Node runtime when PDFKit or Node APIs are required.

---

## Data Model

| Model | Responsibility |
| --- | --- |
| `User` | Role, active status, password hash, store assignments, login/logout timestamps |
| `UserLoginLog` | Login audit and pruning |
| `Product` | Store product master, SKU, unit, quantity, cost, price, category, thresholds |
| `ProductReceipt` | Supplier receiving records and stock increases |
| `Sale` | Paid and unpaid sales with item snapshots, payments, soft deletion |
| `Return` | Returned items and replacement items |
| `Invoice` | Customer invoices from sales or proformas |
| `Proforma` | Quotation documents |
| `Expense` | Store operating expenses |
| `Category` | Product/expense categorization support |
| `StockAdjustment` | Admin stock corrections with reason |
| `Alert` | Low-stock alerts |
| `NumberSequence` | Product SKU, invoice, and proforma numbering |
| `PasswordResetToken` | Hashed password reset tokens and expiry |
| `BalanceSheetItem` | Append-only manual balance sheet line item versions |

---

## Key Data Flows

### Product Creation And Receiving

```text
Products page
  -> ProductsManager
  -> /api/products or /api/products/[id]/receipts
  -> Product / ProductReceipt writes
  -> Low-stock alert sync
```

Product names and SKUs are unique within a store. SKU generation uses `NumberSequence`.

### Sale Recording

```text
Sales page
  -> SalesManager
  -> /api/sales
  -> Validate sale payload
  -> Check product availability
  -> Decrement Product.quantity
  -> Create Sale with item snapshots
  -> Sync low-stock alerts
```

Paid sales require a payment method. Unpaid sales store customer and outstanding payment details.

### Sale Edit, Restore, Or Delete

Edits reconcile previous sale quantities against next sale quantities. Soft-deleted sales are excluded from business numbers. Restore routes re-activate a deleted sale when stock permits. Admin-only deletion restores sold quantities and coordinates with linked invoices where the route requires it.

### Loan Collection

Unpaid sales appear in the Loans view. Payments append to `Sale.payments`, update `amountPaid`, and reduce `remainingBalance`. Fully settled loans stop being outstanding.

### Reporting And Financial Statements

Reports aggregate products, sales, returns, invoices, expenses, adjustments, unpaid sales, payment methods, product movement, and recent sales for a selected date range.

Financial statements live in `lib/financial`. Income Statement math mirrors the Reports page. Balance Sheet reconstructs inventory value and accounts receivable as of a selected date and combines them with append-only manual `BalanceSheetItem` versions.

Business dates are parsed and formatted through `lib/utils/time` using Kigali time helpers.

---

## Auth And Session Flow

`proxy.ts` runs for application requests, refreshes valid sessions, and clears expired or invalid sessions. Route handlers use request cookies. Server Components use `cookies()` through `requireServerSession()`.

The source of truth for active users is the database. A JWT is accepted only if it verifies, has not idled out, and maps to an active current user.

Financially sensitive admin paths (`/dashboard`, `/reports`, `/financial-statements`, and matching API paths) require a recent password verification through `/verify`.

---

## Invariants

- Every operational record is scoped to `store1` or `store2`.
- Never read or mutate operational data without resolving and applying the authorized store.
- Never reduce stock below zero.
- All inventory-changing operations must sync low-stock alerts.
- Use item snapshots on sales, returns, invoices, and proformas so historical commercial records survive product changes.
- Use `NumberSequence` for generated numbers; do not derive document numbers from counts.
- Keep Reports and Income Statement revenue/COGS/profit formulas in sync.
- Treat `BalanceSheetItem` as append-only version history; do not mutate or hard-delete prior versions.
- Use `formatInKigali`, `formatKigaliDateInput`, and `parseKigaliDateInput` for business dates.
- PDF generators must use anonymized Demo Inventory System identity and document assets from `public/images`.
- Before changing Next.js conventions, read the relevant installed docs in `node_modules/next/dist/docs/`.
