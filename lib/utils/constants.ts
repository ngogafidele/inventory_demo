// Defines the stable store identifier and its human-facing identity.
export const STORE_KEYS = ["store1"] as const

export type StoreKey = (typeof STORE_KEYS)[number]

// Store identity is shared by reports and generated documents.
export const STORE_LABELS: Record<StoreKey, string> = {
  store1: "Demo Store",
}

// Customer-facing PDFs identify the demo store.
export const STORE_ADDRESSES: Record<StoreKey, string> = {
  store1: "Demo Address",
}
