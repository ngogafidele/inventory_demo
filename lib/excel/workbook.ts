// Builds styled ExcelJS worksheets and returns them as download responses.
import ExcelJS from "exceljs"
import { NextResponse } from "next/server"
import { getKigaliDateParts } from "@/lib/utils/time"

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export const MONEY_FORMAT = "#,##0.##"
export const DATE_FORMAT = "yyyy-mm-dd"
export const DATE_TIME_FORMAT = "yyyy-mm-dd hh:mm"

export type SheetColumn = {
  header: string
  key: string
  width: number
  numFmt?: string
}

export function createWorkbook() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Demo Inventory System"
  workbook.created = new Date()
  return workbook
}

// Adds a sheet with a bold, frozen, filterable header row.
export function addTableSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: SheetColumn[]
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  })
  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
    style: column.numFmt ? { numFmt: column.numFmt } : undefined,
  }))

  const header = sheet.getRow(1)
  header.font = { bold: true }
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E7EB" },
  }
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  }

  return sheet
}

export function addTotalsRow(
  sheet: ExcelJS.Worksheet,
  values: Record<string, string | number>
) {
  const row = sheet.addRow(values)
  row.font = { bold: true }
  row.border = { top: { style: "thin" } }
  return row
}

// Excel stores dates without a time zone, so write the Kigali wall-clock time
// as if it were UTC; otherwise cells would show server/UTC time.
export function toKigaliExcelDate(date: Date | undefined | null) {
  if (!date) return null
  const parts = getKigaliDateParts(date)
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    )
  )
}

// Flattens formula results, rich text, and hyperlinks into a plain cell value.
export function readCellValue(cell: ExcelJS.Cell): unknown {
  const value = cell.value
  if (value === null || value === undefined) return undefined
  if (typeof value !== "object" || value instanceof Date) return value
  if ("result" in value) return value.result
  if ("richText" in value) return value.richText.map((part) => part.text).join("")
  if ("text" in value) return value.text
  return undefined
}

export async function workbookResponse(
  workbook: ExcelJS.Workbook,
  filename: string
) {
  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
