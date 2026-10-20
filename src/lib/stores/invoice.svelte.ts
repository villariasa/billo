import type { Invoice, InvoiceItem, PosExtras, ValidationErrors } from '$lib/types/invoice'
import { safeNumber } from '$lib/utils/currency'

export const DRAFT_KEY = 'billo_draft_v1'
/** Pre-rebrand key — read as a fallback so existing drafts survive. */
const LEGACY_DRAFT_KEY = 'quickinvoice_draft_v1'

let idCounter = 0
export function uid(): string {
  return `item-${Date.now().toString(36)}-${++idCounter}`
}

function toDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function createDefaultPosExtras(): PosExtras {
  return {
    metaRows: [],
    vatBreakdown: false,
    signatureRows: [
      { id: uid(), label: 'Signature' },
      { id: uid(), label: 'Received By' },
    ],
    qr: { enabled: false, data: '', message: '' },
    footerLines: '',
  }
}

export function createDefaultInvoice(): Invoice {
  const today = new Date()
  const due = new Date(today)
  due.setDate(due.getDate() + 14)
  return {
    business: { name: '', email: '', phone: '', address: '', logo: '' },
    client: { name: '', email: '', address: '' },
    invoiceNumber: 'INV-001',
    invoiceDate: toDateInput(today),
    dueDate: toDateInput(due),
    currency: 'PHP',
    paperSize: 'a4',
    font: 'inter',
    receiptTemplate: 'clean',
    posExtras: createDefaultPosExtras(),
    items: [{ id: uid(), description: '', quantity: 1, unitPrice: 0 }],
    discountValue: 0,
    discountMode: 'flat',
    taxValue: 0,
    taxMode: 'percent',
    notes: 'Thank you for your business.',
  }
}

interface AppState {
  invoice: Invoice
  errors: ValidationErrors
  generating: boolean
  hasDraft: boolean
  mobileView: 'editor' | 'preview'
  /**
   * Optional sample receipt/invoice photo (data URL) displayed beside the
   * live preview for manual format matching. Session-only — never persisted
   * to the draft and never included in the PDF.
   */
  referenceImage: string
  showReference: boolean
}

export const app = $state<AppState>({
  invoice: createDefaultInvoice(),
  errors: {},
  generating: false,
  hasDraft: false,
  mobileView: 'editor',
  referenceImage: '',
  showReference: true,
})

export function addItem(): void {
  app.invoice.items.push({ id: uid(), description: '', quantity: 1, unitPrice: 0 })
}

export function removeItem(id: string): void {
  if (app.invoice.items.length <= 1) return
  app.invoice.items = app.invoice.items.filter((item) => item.id !== id)
  delete app.errors[`${id}-description`]
  delete app.errors[`${id}-quantity`]
}

/** Clear a field's error as the user types. */
export function clearError(key: string): void {
  if (app.errors[key]) delete app.errors[key]
}

/**
 * Validates required fields. Error keys double as DOM element ids so the
 * caller can scroll to the first invalid field.
 */
export function validate(): { valid: boolean; firstErrorId: string | null } {
  const errors: ValidationErrors = {}
  const inv = app.invoice

  if (!inv.business.name.trim()) errors['business-name'] = 'Business name is required.'
  if (!inv.client.name.trim()) errors['client-name'] = 'Client name is required.'
  if (!inv.invoiceNumber.trim()) errors['invoice-number'] = 'Invoice number is required.'
  if (!inv.invoiceDate) errors['invoice-date'] = 'Invoice date is required.'

  for (const item of inv.items) {
    if (!item.description.trim()) errors[`${item.id}-description`] = 'Description is required.'
    if (safeNumber(item.quantity) <= 0) errors[`${item.id}-quantity`] = 'Quantity must be at least 1.'
  }

  app.errors = errors
  const keys = Object.keys(errors)
  return { valid: keys.length === 0, firstErrorId: keys[0] ?? null }
}

export function saveDraft(): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(app.invoice))
    app.hasDraft = true
    return true
  } catch {
    return false
  }
}

export function loadDraft(): Invoice | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(LEGACY_DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Invoice
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) return null
    // Backfill fields added after v1 drafts were saved.
    if (!parsed.paperSize) parsed.paperSize = 'a4'
    if (typeof parsed.business.logo !== 'string') parsed.business.logo = ''
    if (!parsed.font) parsed.font = 'inter'
    if (!parsed.receiptTemplate) parsed.receiptTemplate = 'clean'
    if (!parsed.posExtras) parsed.posExtras = createDefaultPosExtras()
    return parsed
  } catch {
    return null
  }
}

export function restoreDraft(): boolean {
  const draft = loadDraft()
  if (!draft) return false
  app.invoice = draft
  app.errors = {}
  return true
}

/** Returns the snapshot that was replaced so the caller can offer undo. */
export function resetInvoice(): Invoice {
  const snapshot = JSON.parse(JSON.stringify(app.invoice)) as Invoice
  app.invoice = createDefaultInvoice()
  app.errors = {}
  return snapshot
}

export function undoReset(snapshot: Invoice): void {
  app.invoice = snapshot
}
