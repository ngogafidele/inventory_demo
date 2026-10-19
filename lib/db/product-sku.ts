// Generates store-unique product SKUs from the product name.
import { Product } from "@/lib/db/models/Product"
import type { StoreKey } from "@/lib/utils/constants"

function getSkuBase(name: string) {
  const normalized = name.toUpperCase().replace(/[^A-Z0-9]+/g, "")
  return (normalized.slice(0, 6) || "PRD").padEnd(3, "X")
}

export async function generateProductSku(store: StoreKey, name: string) {
  const base = getSkuBase(name)

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    const sku = `${base}-${suffix}`
    const existing = await Product.exists({ store, sku })
    if (!existing) return sku
  }

  return `${base}-${Date.now().toString(36).toUpperCase()}`
}
