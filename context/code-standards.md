# Code Standards

## Engineering Mindset

- Read `README.md`, `DOCUMENT.md`, and this `context/` folder before significant work.
- Keep changes scoped to the requested workflow.
- Preserve operational invariants before polishing UI.
- Match existing local patterns before introducing abstractions.
- Test the workflow that moved, especially stock, loans, reports, financial statements, and auth gates.

---

## Next.js 16

- This project uses Next.js 16 App Router.
- Read relevant docs in `node_modules/next/dist/docs/` before changing framework-facing behavior.
- `proxy.ts` is used for session refresh, expiry handling, and step-up verification redirects. Do not add deprecated middleware patterns.
- Server Components are the default for pages.
- Client components are used for interactive managers and local form/dialog/chart state.
- API route handlers live in `app/api/**/route.ts`.
- PDF route handlers should use Node runtime when required by PDFKit or Node APIs.

---

## TypeScript

- Prefer explicit object types close to the component/page that serializes Mongoose data.
- Keep shared business types in `types/`.
- Avoid `any`; use concrete local types or `unknown` with narrowing.
- When serializing Mongoose documents, convert `_id` and dates before passing data to client components.
- Keep model names and field names aligned with Mongoose schemas.

---

## Server Components

Typical page pattern:

```typescript
const session = await requireServerSession()
const store = getCurrentStore(session)

await connectToDatabase()
const rows = await Model.find({ store }).lean<Row[]>()

return <FeatureManager initialRows={serializedRows} isAdmin={session.isAdmin} />
```

Rules:

- Authenticate before data access.
- Resolve the store before operational queries.
- Use `.lean<T[]>()` when passing data into serialization.
- Serialize ObjectIds and Dates.
- Keep mutation logic out of page components.
- Redirect unauthorized roles from page components to an appropriate operational page.

---

## API Routes

Typical route pattern:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireAuth(request)
    if (!authorized || !session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const store = resolveStoreFromRequest(request, session)
    if (!store) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const payload = Schema.parse(await request.json())
    await connectToDatabase()
    // mutate
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to ..." }, { status: 400 })
  }
}
```

Rules:

- Use `requireAdmin()` for admin-only mutations.
- Use Zod validators from `lib/db/validators`.
- Resolve the store with `resolveStoreFromRequest(request, session)` before operational access.
- Return the success wrapper consistently.
- Keep user-facing errors safe and understandable.
- Log unexpected internal failures with route context when useful.

---

## MongoDB And Mongoose

- Operational models are store-scoped by `store` or `storeId`.
- Product and document uniqueness is per store.
- Use transactions for multi-write inventory changes when possible.
- When changing sale, return, receipt, or adjustment logic, update product quantities and low-stock alerts together.
- Preserve item snapshots. Do not rely on current product master data to reconstruct historical sales or invoices.
- Treat `BalanceSheetItem` as append-only version history: edits and deletes insert new versions.

---

## Authentication

- Passwords use bcrypt helpers from `lib/auth/hash.ts`.
- Sessions use JWT helpers from `lib/auth/session.ts`.
- Route handlers use `requireAuth()` or `requireAdmin()` from `lib/auth/middleware.ts`.
- Current database user state is checked through `getCurrentUserSession`.
- Inactive users must not retain valid access.
- Admin and staff idle timeouts differ; strict admin financial pages use a 10-minute idle window.
- `/dashboard`, `/reports`, `/financial-statements`, and matching API paths require recent password verification through the proxy-level step-up gate.

---

## Documents

- PDFKit helpers live in `lib/pdf`.
- PDF generators return buffers for route handlers.
- Use store constants from `lib/utils/constants.ts`.
- Use Kigali business date and currency formatting helpers.
- Keep logo/stamp usage tolerant of missing files, following the current generator pattern.
- PDFKit embeds JPEG/PNG images, so keep PDF assets compatible with the installed PDFKit version.

---

## Styling

- Use local UI primitives in `components/ui`.
- Use Tailwind token utilities from `app/globals.css`.
- Use `lucide-react` icons.
- Use Recharts for existing chart surfaces.
- Keep operational screens compact and table-friendly.

---

## Comments

The codebase already uses short file-level comments. Continue that style when adding new modules. Add inline comments only for non-obvious business decisions, especially stock reconciliation, reporting math, financial reconstruction, auth gate behavior, or PDF limitations.
