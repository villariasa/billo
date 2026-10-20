export type Currency = 'PHP' | 'USD' | 'EUR' | 'GBP'

export const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'PHP', label: 'PHP — Philippine Peso (₱)' },
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
]

export type PaperSizeId =
  | 'a4'
  | 'a5'
  | 'a6'
  | 'letter'
  | 'half-letter'
  | 'legal'
  | 'receipt-80'
  | 'receipt-58'

export interface PaperSize {
  id: PaperSizeId
  label: string
  widthMm: number
  /** null = continuous roll (thermal receipt) — height follows content. */
  heightMm: number | null
  kind: 'document' | 'receipt'
}

export const PAPER_SIZES: PaperSize[] = [
  { id: 'a4', label: 'A4 (210 × 297 mm)', widthMm: 210, heightMm: 297, kind: 'document' },
  { id: 'a5', label: 'A5 (148 × 210 mm)', widthMm: 148, heightMm: 210, kind: 'document' },
  { id: 'a6', label: 'A6 (105 × 148 mm)', widthMm: 105, heightMm: 148, kind: 'document' },
  { id: 'letter', label: 'Letter (8.5 × 11 in)', widthMm: 215.9, heightMm: 279.4, kind: 'document' },
  { id: 'half-letter', label: 'Half Letter (5.5 × 8.5 in)', widthMm: 139.7, heightMm: 215.9, kind: 'document' },
  { id: 'legal', label: 'Legal (8.5 × 14 in)', widthMm: 215.9, heightMm: 355.6, kind: 'document' },
  { id: 'receipt-80', label: 'Receipt — 80 mm thermal', widthMm: 80, heightMm: null, kind: 'receipt' },
  { id: 'receipt-58', label: 'Receipt — 58 mm thermal', widthMm: 58, heightMm: null, kind: 'receipt' },
]

export function getPaperSize(id: PaperSizeId): PaperSize {
  return PAPER_SIZES.find((p) => p.id === id) ?? PAPER_SIZES[0]
}

/** CSS pixels at 96 dpi. */
export function mmToPx(mm: number): number {
  return Math.round((mm * 96) / 25.4)
}

export function pxToMm(px: number): number {
  return (px * 25.4) / 96
}

export type DocumentFont = 'inter' | 'mono' | 'serif' | 'times' | 'arial'

export const DOCUMENT_FONTS: { id: DocumentFont; label: string; stack: string }[] = [
  { id: 'inter', label: 'Inter — Modern', stack: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { id: 'mono', label: 'Typewriter — Receipt / POS', stack: "'Courier New', Courier, monospace" },
  { id: 'serif', label: 'Georgia — Serif', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'times', label: 'Times New Roman — Classic', stack: "'Times New Roman', Times, serif" },
  { id: 'arial', label: 'Arial — Plain', stack: 'Arial, Helvetica, sans-serif' },
]

export function getFontStack(id: DocumentFont): string {
  return DOCUMENT_FONTS.find((f) => f.id === id)?.stack ?? DOCUMENT_FONTS[0].stack
}

/**
 * Receipt layout style: 'clean' is the minimal Zynqelo look; 'pos' mimics a
 * classic thermal point-of-sale sales invoice (monospace, double/dashed
 * dividers, TOTAL DUE block, signature lines).
 */
export type ReceiptTemplate = 'clean' | 'pos'

/** A "Label: value" line in the POS receipt header (Cashier, Trans#, TIN…). */
export interface MetaRow {
  id: string
  label: string
  value: string
}

/** A fill-in-the-blank line in the POS receipt (Signature, Cust Name, TIN…). */
export interface SignatureRow {
  id: string
  label: string
}

export interface QrBlock {
  enabled: boolean
  /** Content encoded into the QR (URL, text…). */
  data: string
  /** Message printed next to the QR ("Scan the QR code below…"). */
  message: string
}

/** Extra structural blocks for the POS receipt template — all optional. */
export interface PosExtras {
  metaRows: MetaRow[]
  /** Show the PH-style VATable / VAT Amount / Zero-Rated / VAT-Exempt rows. */
  vatBreakdown: boolean
  signatureRows: SignatureRow[]
  qr: QrBlock
  /** Extra footer lines, one per line. */
  footerLines: string
}

/** Discount/tax can be entered as a flat amount or a percentage of the subtotal. */
export type AdjustmentMode = 'flat' | 'percent'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface BusinessInfo {
  name: string
  email: string
  phone: string
  address: string
  /** Optional logo as a data URL ('' = none). */
  logo: string
}

export interface ClientInfo {
  name: string
  email: string
  address: string
}

export interface Invoice {
  business: BusinessInfo
  client: ClientInfo
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  currency: Currency
  paperSize: PaperSizeId
  font: DocumentFont
  receiptTemplate: ReceiptTemplate
  posExtras: PosExtras
  items: InvoiceItem[]
  discountValue: number
  discountMode: AdjustmentMode
  taxValue: number
  taxMode: AdjustmentMode
  notes: string
}

/** Keyed by field id (also used as the DOM element id for scroll-to-error). */
export type ValidationErrors = Record<string, string>

export interface InvoiceTotals {
  subtotal: number
  discount: number
  tax: number
  grandTotal: number
}
