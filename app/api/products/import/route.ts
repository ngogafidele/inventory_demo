// Imports new products from an Excel workbook, skipping ones the store already has.
import ExcelJS from "exceljs"
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connection"
import { Product } from "@/lib/db/models/Product"
import { ProductReceipt } from "@/lib/db/models/ProductReceipt"
import { requireAdmin } from "@/lib/auth/middleware"
import { resolveStoreFromRequest } from "@/lib/auth/session"
import { CreateProductSchema } from "@/lib/db/validators/product"
import { syncLowStockAlert } from "@/lib/db/alerts"
import { generateProductSku } from "@/lib/db/product-sku"
import { readCellValue } from "@/lib/excel/workbook"

export const runtime = "nodejs"

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_ROWS = 2000

type ImportField =
  | "name"
  | "sku"
  | "unit"
  | "quantity"
  | "lowStockThreshold"
  | "costPrice"
  | "price"
  | "supplierName"
  | "supplierPhone"

// Accepted header spellings, compared after lowercasing and dropping units such
// as "(Rwf)" and punctuation, so a file from Export Excel imports unchanged.
const HEADER_ALIASES: Record<string, ImportField> = {
  product: "name",
  name: "name",
  productname: "name",
  sku: "sku",
  unit: "unit",
  quantity: "quantity",
  qty: "quantity",
  stock: "quantity",
  lowstockthreshold: "lowStockThreshold",
  lowstock: "lowStockThreshold",
  threshold: "lowStockThreshold",
  costprice: "costPrice",
  cost: "costPrice",
  unitcost: "costPrice",
  sellingprice: "price",
  price: "price",
  saleprice: "price",
  suppliername: "supplierName",
  supplier: "supplierName",
  supplierphone: "supplierPhone",
}

const REQUIRED_FIELDS: Array<[ImportField, string]> = [
  ["name", "Product"],
  ["costPrice", "Cost Price"],
  ["price", "Selling Price"],
]

type RowIssue = { row: number; name: string; reason: string }

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

function toText(value: unknown) {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString()
  return String(value).trim()
}

// Blank stays undefined so optional fields fall back to their defaults; text
// that is not a number becomes NaN and fails validation with a clear message.
function toNumber(value: unknown) {
  if (typeof value === "number") return value
  const text = toText(value).replace(/,/g, "").replace(/rwf/i, "").trim()
  if (!text) return undefined
  return Number(text)
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === 11000
  )
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireAdmin(request)
    if (!authorized || !session) {
      return NextResponse.json(
        { success: false, error: session ? "Admin access required" : "Unauthorized" },
        { status: session ? 403 : 401 }
      )
    }

    const store = resolveStoreFromRequest(request, session)
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    const formData = await request.formData().catch(() => null)
    const file = formData?.get("file")
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Choose an Excel file to import." },
        { status: 400 }
      )
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only .xlsx files are supported. Save older .xls files as .xlsx first.",
        },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { success: false, error: "The file is larger than 5 MB." },
        { status: 400 }
      )
    }

    const workbook = new ExcelJS.Workbook()
    try {
      await workbook.xlsx.load(
        Buffer.from(await file.arrayBuffer()) as unknown as ExcelJS.Buffer
      )
    } catch {
      return NextResponse.json(
        { success: false, error: "The file could not be read as an Excel workbook." },
        { status: 400 }
      )
    }

    const sheet = workbook.worksheets[0]
    if (!sheet) {
      return NextResponse.json(
        { success: false, error: "The workbook has no sheets." },
        { status: 400 }
      )
    }

    const columns = new Map<ImportField, number>()
    sheet.getRow(1).eachCell((cell, columnNumber) => {
      const field = HEADER_ALIASES[normalizeHeader(toText(readCellValue(cell)))]
      if (field && !columns.has(field)) columns.set(field, columnNumber)
    })

    const missing = REQUIRED_FIELDS.filter(([field]) => !columns.has(field))
    if (missing.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required column(s) in the first row: ${missing
            .map(([, label]) => label)
            .join(", ")}.`,
        },
        { status: 400 }
      )
    }

    if (sheet.rowCount - 1 > MAX_ROWS) {
      return NextResponse.json(
        { success: false, error: `Import at most ${MAX_ROWS} products at a time.` },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const existing = await Product.find({ store })
      .select("name sku")
      .lean<Array<{ name: string; sku: string }>>()
    const existingNames = new Set(existing.map((product) => normalizeName(product.name)))
    const existingSkus = new Set(existing.map((product) => product.sku.toUpperCase()))
    const namesInFile = new Map<string, number>()

    const created: unknown[] = []
    const skipped: RowIssue[] = []
    const invalid: RowIssue[] = []

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber)
      const read = (field: ImportField) => {
        const column = columns.get(field)
        return column ? readCellValue(row.getCell(column)) : undefined
      }

      const name = toText(read("name"))
      const sku = toText(read("sku"))
      const priceRaw = toText(read("price"))
      const costRaw = toText(read("costPrice"))

      if (!name && !sku && !priceRaw && !costRaw) continue
      // The totals row written by Export Excel has a label but no prices.
      if (/^total\b/i.test(name) && !priceRaw && !costRaw) continue

      const key = normalizeName(name)
      if (name && existingNames.has(key)) {
        skipped.push({ row: rowNumber, name, reason: "Already in the products list" })
        continue
      }
      if (sku && existingSkus.has(sku.toUpperCase())) {
        skipped.push({
          row: rowNumber,
          name,
          reason: `SKU ${sku} is already in the products list`,
        })
        continue
      }
      if (name && namesInFile.has(key)) {
        skipped.push({
          row: rowNumber,
          name,
          reason: `Repeats row ${namesInFile.get(key)} of this file`,
        })
        continue
      }

      const parsed = CreateProductSchema.safeParse({
        name,
        unit: toText(read("unit")) || "pcs",
        quantity: toNumber(read("quantity")) ?? 0,
        lowStockThreshold: toNumber(read("lowStockThreshold")),
        costPrice: toNumber(read("costPrice")),
        price: toNumber(read("price")),
        supplierName: toText(read("supplierName")) || undefined,
        supplierPhone: toText(read("supplierPhone")) || undefined,
      })
      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        invalid.push({
          row: rowNumber,
          name,
          reason: issue
            ? `${issue.path.join(".") || "row"}: ${issue.message}`
            : "Invalid row",
        })
        continue
      }

      namesInFile.set(key, rowNumber)
      const {
        categoryId: _categoryId,
        supplierName,
        supplierPhone,
        ...productInput
      } = parsed.data

      try {
        const product = await Product.create({
          ...productInput,
          sku: await generateProductSku(store, productInput.name),
          store,
        })

        if (supplierName && supplierPhone && product.quantity > 0) {
          await ProductReceipt.create({
            store,
            productId: product._id,
            sku: product.sku,
            supplierName,
            supplierPhone,
            quantity: product.quantity,
            unitCost: product.costPrice,
            totalCost: product.quantity * product.costPrice,
            receivedAt: new Date(),
            receivedBy: session.userId,
          })
        }

        await syncLowStockAlert({
          store,
          productId: product._id.toString(),
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          threshold: product.lowStockThreshold ?? 0,
        })

        existingNames.add(key)
        created.push({
          ...product.toJSON(),
          _id: product._id.toString(),
          ...(supplierName && supplierPhone && product.quantity > 0
            ? { supplierName, lastRestockLabel: "Today" }
            : {}),
        })
      } catch (error) {
        // The unique name index is the final guard against a concurrent create.
        if (isDuplicateKeyError(error)) {
          skipped.push({ row: rowNumber, name, reason: "Already in the products list" })
          continue
        }
        console.error("[Products Import Row Error]", rowNumber, error)
        invalid.push({ row: rowNumber, name, reason: "Could not be saved" })
      }
    }

    return NextResponse.json({
      success: true,
      data: { created, skipped, invalid },
    })
  } catch (error) {
    console.error("[Products Import Error]", error)
    return NextResponse.json(
      { success: false, error: "Failed to import products" },
      { status: 500 }
    )
  }
}
