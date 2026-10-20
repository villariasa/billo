import type { Currency, Invoice, InvoiceItem, InvoiceTotals } from '$lib/types/invoice'

const formatters = new Map<Currency, Intl.NumberFormat>()

export function currencyFormatter(currency: Currency): Intl.NumberFormat {
  let fmt = formatters.get(currency)
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    formatters.set(currency, fmt)
  }
  return fmt
}

export function formatCurrency(amount: number, currency: Currency): string {
  return currencyFormatter(currency).format(Number.isFinite(amount) ? amount : 0)
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** Coerce possibly-empty/NaN numeric input values to a safe number. */
export function safeNumber(n: unknown): number {
  const v = typeof n === 'number' ? n : parseFloat(String(n))
  return Number.isFinite(v) ? v : 0
}

export function lineTotal(item: InvoiceItem): number {
  return round2(Math.max(0, safeNumber(item.quantity)) * Math.max(0, safeNumber(item.unitPrice)))
}

export function subtotal(items: InvoiceItem[]): number {
  return round2(items.reduce((sum, item) => sum + lineTotal(item), 0))
}

export function calculateTotals(invoice: Invoice): InvoiceTotals {
  const sub = subtotal(invoice.items)

  const discountInput = Math.max(0, safeNumber(invoice.discountValue))
  const discount = round2(
    Math.min(sub, invoice.discountMode === 'percent' ? (sub * discountInput) / 100 : discountInput),
  )

  const taxable = round2(sub - discount)
  const taxInput = Math.max(0, safeNumber(invoice.taxValue))
  const tax = round2(invoice.taxMode === 'percent' ? (taxable * taxInput) / 100 : taxInput)

  return {
    subtotal: sub,
    discount,
    tax,
    grandTotal: round2(Math.max(0, taxable + tax)),
  }
}
