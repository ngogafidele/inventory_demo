// Exports the active branch's sales for a business-date range as an Excel workbook.
import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connection"
import { Sale } from "@/lib/db/models/Sale"
import { ReturnModel } from "@/lib/db/models/Return"
import "@/lib/db/models/User"
import { requireAdmin } from "@/lib/auth/middleware"
import { resolveStoreFromRequest } from "@/lib/auth/session"
import { resolveIncomeRange } from "@/lib/financial/period"
import { STORE_LABELS } from "@/lib/utils/constants"
import {
  addTableSheet,
  addTotalsRow,
  createWorkbook,
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  MONEY_FORMAT,
  toKigaliExcelDate,
  workbookResponse,
} from "@/lib/excel/workbook"

export const runtime = "nodejs"

type ExportSaleUser = { name?: string; email?: string }

type ExportSale = {
  _id: { toString(): string }
  createdAt: Date
  createdBy?: ExportSaleUser | null
  items: Array<{
    name: string
    sku: string
    unit?: string
    quantity: number
    basePrice: number
    sellingPrice: number
    lineTotal: number
  }>
  totalAmount: number
  paymentStatus?: "paid" | "unpaid"
  paymentMethod?: "cash" | "bank" | "mobile"
  customer?: { name?: string; phone?: string }
  outstanding?: {
    customerName?: string
    customerPhone?: string
    paymentDate?: Date
  }
  amountPaid?: number
  remainingBalance?: number
  notes?: string
}

type ReturnedQuantityRow = {
  _id: { toString(): string }
  quantity: number
}

const PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  bank: "Bank",
  mobile: "Mobile Money",
} as const

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

    // Same inclusive Kigali business-day range as Reports; defaults to month-to-date.
    const range = resolveIncomeRange(
      request.nextUrl.searchParams.get("start") ?? undefined,
      request.nextUrl.searchParams.get("end") ?? undefined
    )

    await connectToDatabase()
    const sales = await Sale.find({
      store,
      deletedAt: null,
      createdAt: { $gte: range.from, $lt: range.endExclusive },
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: 1 })
      .lean<ExportSale[]>()

    const returnedRows = sales.length
      ? await ReturnModel.aggregate<ReturnedQuantityRow>([
          { $match: { store, saleId: { $in: sales.map((sale) => sale._id) } } },
          { $unwind: "$returnItems" },
          {
            $group: {
              _id: "$saleId",
              quantity: { $sum: "$returnItems.quantity" },
            },
          },
        ])
      : []
    const returnedBySaleId = new Map(
      returnedRows.map((row) => [row._id.toString(), row.quantity])
    )

    const workbook = createWorkbook()
    const salesSheet = addTableSheet(workbook, "Sales", [
      { header: "Date", key: "date", width: 18, numFmt: DATE_TIME_FORMAT },
      { header: "Customer Name", key: "customerName", width: 24 },
      { header: "Customer Phone", key: "customerPhone", width: 16 },
      { header: "Items", key: "itemCount", width: 8 },
      { header: "Cost (Rwf)", key: "cost", width: 14, numFmt: MONEY_FORMAT },
      { header: "Total (Rwf)", key: "total", width: 14, numFmt: MONEY_FORMAT },
      { header: "Status", key: "status", width: 10 },
      { header: "Payment Method", key: "paymentMethod", width: 16 },
      { header: "Amount Paid (Rwf)", key: "amountPaid", width: 18, numFmt: MONEY_FORMAT },
      { header: "Balance (Rwf)", key: "balance", width: 14, numFmt: MONEY_FORMAT },
      { header: "Expected Payment", key: "expectedPayment", width: 17, numFmt: DATE_FORMAT },
      { header: "Returns", key: "returnStatus", width: 18 },
      { header: "Logged By", key: "loggedBy", width: 22 },
      { header: "Notes", key: "notes", width: 30 },
    ])
    const itemsSheet = addTableSheet(workbook, "Sale Items", [
      { header: "Date", key: "date", width: 18, numFmt: DATE_TIME_FORMAT },
      { header: "Customer Name", key: "customerName", width: 24 },
      { header: "Product", key: "product", width: 30 },
      { header: "SKU", key: "sku", width: 16 },
      { header: "Unit", key: "unit", width: 8 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Cost Price (Rwf)", key: "costPrice", width: 16, numFmt: MONEY_FORMAT },
      { header: "Selling Price (Rwf)", key: "sellingPrice", width: 18, numFmt: MONEY_FORMAT },
      { header: "Line Total (Rwf)", key: "lineTotal", width: 16, numFmt: MONEY_FORMAT },
      { header: "Status", key: "status", width: 10 },
    ])

    const totals = { cost: 0, total: 0, amountPaid: 0, balance: 0, quantity: 0 }
    for (const sale of sales) {
      const date = toKigaliExcelDate(sale.createdAt)
      const customerName =
        sale.customer?.name || sale.outstanding?.customerName || ""
      const customerPhone =
        sale.customer?.phone || sale.outstanding?.customerPhone || ""
      const isUnpaid = sale.paymentStatus === "unpaid"
      const status = isUnpaid ? "Unpaid" : "Paid"
      const cost = sale.items.reduce(
        (sum, item) => sum + item.basePrice * item.quantity,
        0
      )
      const soldQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0)
      const returnedQuantity = returnedBySaleId.get(sale._id.toString()) ?? 0
      const amountPaid = isUnpaid ? sale.amountPaid ?? 0 : sale.totalAmount
      const balance = isUnpaid ? sale.remainingBalance ?? 0 : 0

      totals.cost += cost
      totals.total += sale.totalAmount
      totals.amountPaid += amountPaid
      totals.balance += balance
      totals.quantity += soldQuantity

      salesSheet.addRow({
        date,
        customerName,
        customerPhone,
        itemCount: sale.items.length,
        cost,
        total: sale.totalAmount,
        status,
        paymentMethod: sale.paymentMethod
          ? PAYMENT_METHOD_LABELS[sale.paymentMethod]
          : "",
        amountPaid,
        balance,
        expectedPayment: isUnpaid
          ? toKigaliExcelDate(sale.outstanding?.paymentDate)
          : null,
        returnStatus:
          returnedQuantity <= 0
            ? ""
            : returnedQuantity >= soldQuantity
              ? "Returned"
              : "Partially returned",
        loggedBy: sale.createdBy?.name ?? sale.createdBy?.email ?? "",
        notes: sale.notes ?? "",
      })

      for (const item of sale.items) {
        itemsSheet.addRow({
          date,
          customerName,
          product: item.name,
          sku: item.sku,
          unit: item.unit ?? "pcs",
          quantity: item.quantity,
          costPrice: item.basePrice,
          sellingPrice: item.sellingPrice,
          lineTotal: item.lineTotal,
          status,
        })
      }
    }

    addTotalsRow(salesSheet, {
      customerName: `Total (${sales.length} sales)`,
      cost: totals.cost,
      total: totals.total,
      amountPaid: totals.amountPaid,
      balance: totals.balance,
    })
    addTotalsRow(itemsSheet, {
      customerName: "Total",
      quantity: totals.quantity,
      lineTotal: totals.total,
    })

    const storeSlug = STORE_LABELS[store].toLowerCase().replace(/\s+/g, "-")
    return await workbookResponse(
      workbook,
      `sales-${storeSlug}-${range.fromInput}-to-${range.toInput}.xlsx`
    )
  } catch (error) {
    console.error("[Sales Excel Export Error]", error)
    return NextResponse.json(
      { success: false, error: "Failed to export sales" },
      { status: 500 }
    )
  }
}
