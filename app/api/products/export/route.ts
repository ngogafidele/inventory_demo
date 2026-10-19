// Exports the active branch's product list as an Excel workbook.
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connection"
import { Product } from "@/lib/db/models/Product"
import { requireAdmin } from "@/lib/auth/middleware"
import { resolveStoreFromRequest } from "@/lib/auth/session"
import { formatKigaliDateInput } from "@/lib/utils/time"
import { STORE_LABELS } from "@/lib/utils/constants"
import {
  addTableSheet,
  addTotalsRow,
  createWorkbook,
  DATE_TIME_FORMAT,
  MONEY_FORMAT,
  toKigaliExcelDate,
  workbookResponse,
} from "@/lib/excel/workbook"

export const runtime = "nodejs"

type ExportProduct = {
  name: string
  sku: string
  unit?: string
  quantity: number
  lowStockThreshold?: number
  costPrice?: number
  price: number
  updatedAt?: Date
}

export async function GET(request: NextRequest) {
  try {
    // Exports include cost and margin data, so they are restricted to admins.
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

    await connectToDatabase()
    const products = await Product.find({ store })
      .sort({ name: 1 })
      .lean<ExportProduct[]>()

    const workbook = createWorkbook()
    const sheet = addTableSheet(workbook, "Products", [
      { header: "Product", key: "name", width: 32 },
      { header: "SKU", key: "sku", width: 16 },
      { header: "Unit", key: "unit", width: 8 },
      { header: "Quantity", key: "quantity", width: 11 },
      { header: "Low Stock Threshold", key: "lowStockThreshold", width: 19 },
      { header: "Cost Price (Rwf)", key: "costPrice", width: 16, numFmt: MONEY_FORMAT },
      { header: "Selling Price (Rwf)", key: "price", width: 18, numFmt: MONEY_FORMAT },
      { header: "Stock Value at Cost (Rwf)", key: "stockValue", width: 24, numFmt: MONEY_FORMAT },
      { header: "Last Updated", key: "updatedAt", width: 18, numFmt: DATE_TIME_FORMAT },
    ])

    let totalQuantity = 0
    let totalStockValue = 0
    for (const product of products) {
      const costPrice = product.costPrice ?? 0
      const stockValue = product.quantity * costPrice
      totalQuantity += product.quantity
      totalStockValue += stockValue

      sheet.addRow({
        name: product.name,
        sku: product.sku,
        unit: product.unit ?? "pcs",
        quantity: product.quantity,
        lowStockThreshold: product.lowStockThreshold ?? 0,
        costPrice,
        price: product.price,
        stockValue,
        updatedAt: toKigaliExcelDate(product.updatedAt),
      })
    }

    addTotalsRow(sheet, {
      name: `Total (${products.length} products)`,
      quantity: totalQuantity,
      stockValue: totalStockValue,
    })

    const today = formatKigaliDateInput(new Date()).replaceAll("-", "")
    const storeSlug = STORE_LABELS[store].toLowerCase().replace(/\s+/g, "-")
    return await workbookResponse(
      workbook,
      `products-${storeSlug}-${today}.xlsx`
    )
  } catch (error) {
    console.error("[Products Excel Export Error]", error)
    return NextResponse.json(
      { success: false, error: "Failed to export products" },
      { status: 500 }
    )
  }
}
