import type { DocumentFont, InvoiceItem, PaperSizeId, ReceiptTemplate } from '$lib/types/invoice'
import { app, uid } from '$lib/stores/invoice.svelte'
import { safeNumber } from '$lib/utils/currency'

export interface ParsedSample {
  layout: {
    paperSize: PaperSizeId
    receiptTemplate: ReceiptTemplate
    font: DocumentFont | null
  }
  fields: {
    businessName?: string
    businessAddress?: string
    businessPhone?: string
    invoiceNumber?: string
    items: { description: string; quantity: number; unitPrice: number }[]
    taxAmount?: number
    discountAmount?: number
    notes?: string
    extras: {
      metaRows: { label: string; value: string }[]
      signatureLabels: string[]
      vatBreakdown: boolean
      qr?: { data: string; message: string }
      footerLines?: string
    }
  }
}

/**
 * Runs fully client-side OCR (Tesseract.js WASM, lazy-loaded) over the sample
 * image. The first run downloads the engine + English model (~15 MB, cached
 * by the browser afterwards).
 */
export async function ocrImage(
  dataUrl: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress)
    },
  })
  try {
    const { data } = await worker.recognize(dataUrl)
    return data.text
  } finally {
    await worker.terminate()
  }
}

const MONEY = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/
const SKIP_ITEM_WORDS =
  /subtotal|total|vat|tax|cash|change|discount|item\(s\)|amount|sales|invoice|customer|cashier|trans|date|due|tin|sn|min|order|signature|remarks|address|contact|name|copy|corp/i
const ADDRESS_WORDS = /\b(ave(nue)?|brgy|barangay|blvd|bldg|street|st|rd|road|hwy|city)\b/i

/** Canonical fill-in-the-blank labels, matched fuzzily against OCR noise. */
const SIGNATURE_LABELS = [
  'Charge To',
  'Signature',
  'Remarks',
  'Cust Name',
  'Customer Name',
  'Printed Name',
  'Received By',
  'Approved By',
  'Address',
  'TIN',
]

const FOOTER_WORDS =
  /thank you|come again|assist|question|visit |serves as|accredit|feedback|hear you|contact-?us/i

/** Small edit distance for OCR-garbled labels ("Siopature" → "Signature"). */
function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
  return dp[a.length][b.length]
}

function matchSignatureLabel(raw: string): string | null {
  const cleaned = raw.toLowerCase().replace(/[^a-z ]/g, '').trim()
  if (cleaned.length < 3) return null
  for (const label of SIGNATURE_LABELS) {
    const target = label.toLowerCase()
    const candidate = cleaned.slice(0, target.length + 1).trim()
    const tolerance = target.length <= 4 ? 1 : 2
    if (editDistance(candidate, target) <= tolerance) return label
  }
  return null
}

function toAmount(raw: string): number {
  return safeNumber(raw.replace(/,(?=\d{3}\b)/g, '').replace(/,(\d{2})$/, '.$1'))
}

/**
 * Heuristic parse of OCR text from a receipt/invoice photo. Deliberately
 * conservative — it extracts only what matches well-known patterns.
 */
export function parseSample(text: string, aspectRatio: number): ParsedSample {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  // Tall narrow photo → thermal receipt; otherwise a standard document.
  const isReceipt = aspectRatio > 1.8
  const layout: ParsedSample['layout'] = isReceipt
    ? { paperSize: 'receipt-80', receiptTemplate: 'pos', font: 'mono' }
    : { paperSize: 'a4', receiptTemplate: 'clean', font: null }

  const fields: ParsedSample['fields'] = {
    items: [],
    extras: { metaRows: [], signatureLabels: [], vatBreakdown: false },
  }

  // Business block: first clean, digit-free alpha line in the header is the
  // name (OCR noise lines usually contain stray digits/symbols); the
  // following line with digits is usually the street address.
  const headLines = lines.slice(0, 6).map((l) => l.replace(/^[^A-Za-z]+/, '').trim())
  const nameIdx = headLines.findIndex((l) => /^[A-Za-z][A-Za-z .,'&-]{3,40}$/.test(l) && !/\d/.test(l))
  if (nameIdx >= 0) fields.businessName = headLines[nameIdx]
  const afterName = Math.max(nameIdx, 0) + 1
  const addrOffset = lines
    .slice(afterName, afterName + 4)
    .findIndex((l) => /\d/.test(l) && l.length > 10 && !/tin|reg|sn|min|#/i.test(l))
  const addrIdx = addrOffset >= 0 ? afterName + addrOffset : -1
  if (addrIdx >= 0) fields.businessAddress = lines[addrIdx]
  const phoneLine = lines.find((l) => /(?:tel|phone|contact)[:\s]*([+\d][\d\s()-]{6,})/i.test(l))
  if (phoneLine) fields.businessPhone = phoneLine.match(/([+\d][\d\s()-]{6,})/)?.[1]?.trim()

  // Invoice / SI / OR number. Word boundary keeps "CORPORATION" etc. out;
  // the required digit keeps prose like "QR Code" (OCR'd as "OR Code") out.
  for (const l of lines) {
    const m = l.match(/\b(?:SI|INV(?:OICE)?|OR|RCPT|RECEIPT)\s*[#:\s-]+\s*([A-Z-]*\d[A-Z0-9-]{1,19})\b/i)
    if (m) {
      fields.invoiceNumber = m[1]
      break
    }
  }

  // Line items: "1 2PC CKNJOY 211.00" (qty desc amount) or "1 YUMBURGER MC"
  // (qty desc). Scan only below the business header block, cap qty at 99, and
  // skip address-looking lines — all three guards keep OCR'd header noise
  // (e.g. "119 GORORDO AVE BRGY LAHUG") out of the item list.
  const itemScanStart = Math.max(addrIdx, nameIdx, 0) + 1
  for (const l of lines.slice(itemScanStart)) {
    if (SKIP_ITEM_WORDS.test(l) || ADDRESS_WORDS.test(l)) continue
    let m = l.match(new RegExp(`^(\\d{1,2})\\s+([A-Za-z][\\w .\\/&'-]{2,36}?)\\s+${MONEY.source}\\s*[A-Z]?$`))
    if (m) {
      const quantity = Math.max(1, safeNumber(m[1]))
      fields.items.push({
        description: m[2].trim(),
        quantity,
        unitPrice: Math.round((toAmount(m[3]) / quantity) * 100) / 100,
      })
      continue
    }
    m = l.match(/^(\d{1,2})\s+([A-Za-z][\w .\/&'-]{2,36})$/)
    if (m) {
      fields.items.push({
        description: m[2].trim(),
        quantity: Math.max(1, safeNumber(m[1])),
        unitPrice: 0,
      })
    }
    if (fields.items.length >= 20) break
  }

  // VAT / tax and discount amounts
  const taxLine = lines.find((l) => new RegExp(`(?:vat amount|tax)\\s*[:\\s]*${MONEY.source}`, 'i').test(l))
  if (taxLine) {
    const m = taxLine.match(new RegExp(`(?:vat amount|tax)\\s*[:\\s]*${MONEY.source}`, 'i'))
    if (m) fields.taxAmount = toAmount(m[1])
  }
  const discLine = lines.find((l) => new RegExp(`discount\\s*[:\\s]*${MONEY.source}`, 'i').test(l))
  if (discLine) {
    const m = discLine.match(new RegExp(`discount\\s*[:\\s]*${MONEY.source}`, 'i'))
    if (m) fields.discountAmount = toAmount(m[1])
  }

  // Footer note
  const noteLine = lines.find((l) => /thank you/i.test(l))
  if (noteLine) fields.notes = noteLine

  // --- Structural extras (POS receipts) ---

  // Header meta rows ("Label: value") between the business block and the
  // first item — Cashier, Trans#, VAT Reg TIN, SN, MIN…
  const firstItemIdx = fields.items.length
    ? lines.findIndex((l) => new RegExp(`^\\d{1,2}\\s`).test(l) && !SKIP_ITEM_WORDS.test(l))
    : lines.length
  for (const l of lines.slice(Math.max(nameIdx, 0) + 1, Math.max(firstItemIdx, itemScanStart))) {
    const m = l.match(/^([A-Za-z][\w#/ .-]{1,18}?)\s*[:;]\s*(.{2,40})$/)
    if (m && !matchSignatureLabel(m[1]) && !ADDRESS_WORDS.test(l)) {
      fields.extras.metaRows.push({ label: m[1].trim(), value: m[2].trim() })
      if (fields.extras.metaRows.length >= 6) break
    }
  }

  // VAT breakdown block ([uv] because OCR often reads "VAT" as "UAT")
  fields.extras.vatBreakdown = lines.some((l) => /[uv]at[\s-]*(able|amount|exempt)/i.test(l))

  // Signature / fill-in lines in the bottom half (fuzzy: OCR mangles these)
  const bottomStart = Math.floor(lines.length / 2)
  const seenLabels = new Set<string>()
  for (const l of lines.slice(bottomStart)) {
    if (FOOTER_WORDS.test(l) || MONEY.test(l)) continue
    const head = l.split(/[:;]/)[0]
    const label = matchSignatureLabel(head)
    if (label && !seenLabels.has(label)) {
      seenLabels.add(label)
      fields.extras.signatureLabels.push(label)
      if (fields.extras.signatureLabels.length >= 8) break
    }
  }

  // QR block: enable when the text mentions scanning/QR; take nearby prose as
  // the message and any URL as the QR content.
  const qrIdx = lines.findIndex((l) => /\b(qr|scan)\b/i.test(l))
  if (qrIdx >= 0) {
    const around = lines.slice(Math.max(0, qrIdx - 1), qrIdx + 3)
    const message = around
      .filter((l) => /[a-z]/i.test(l) && !MONEY.test(l))
      .join('\n')
      .slice(0, 160)
    const urlMatch = lines
      .slice(Math.max(0, qrIdx - 2))
      .join(' ')
      .match(/\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,6}(?:\/\S*)?)\b/i)
    const data = urlMatch ? (urlMatch[1].startsWith('http') ? urlMatch[1] : `https://${urlMatch[1]}`) : ''
    fields.extras.qr = { data, message }
  }

  // Extra footer lines (assistance / accreditation / "serves as" notes),
  // excluding the thank-you note and anything already in the QR message.
  const qrMessage = fields.extras.qr?.message ?? ''
  const footer = lines
    .slice(bottomStart)
    .filter(
      (l) =>
        FOOTER_WORDS.test(l) && l !== noteLine && !/\b(qr|scan)\b/i.test(l) && !qrMessage.includes(l),
    )
    .slice(0, 5)
  if (footer.length) fields.extras.footerLines = footer.join('\n')

  return { layout, fields }
}

/**
 * Applies a parsed sample to the current invoice, following the sample's
 * layout and filling ONLY inputs that are still empty / at their defaults —
 * nothing the user already typed is overwritten. Returns a human-readable
 * list of what was applied.
 */
export function applySample(parsed: ParsedSample): string[] {
  const applied: string[] = []
  const inv = app.invoice

  inv.paperSize = parsed.layout.paperSize
  inv.receiptTemplate = parsed.layout.receiptTemplate
  if (parsed.layout.font) inv.font = parsed.layout.font
  applied.push(parsed.layout.paperSize === 'receipt-80' ? 'POS receipt layout' : 'document layout')

  const f = parsed.fields
  if (f.businessName && !inv.business.name.trim()) {
    inv.business.name = f.businessName
    applied.push('business name')
  }
  if (f.businessAddress && !inv.business.address.trim()) {
    inv.business.address = f.businessAddress
    applied.push('address')
  }
  if (f.businessPhone && !inv.business.phone.trim()) {
    inv.business.phone = f.businessPhone
    applied.push('phone')
  }
  if (f.invoiceNumber && (!inv.invoiceNumber.trim() || inv.invoiceNumber === 'INV-001')) {
    inv.invoiceNumber = f.invoiceNumber
    applied.push('invoice number')
  }

  const itemsUntouched =
    inv.items.length === 1 && !inv.items[0].description.trim() && !safeNumber(inv.items[0].unitPrice)
  if (f.items.length > 0 && itemsUntouched) {
    inv.items = f.items.map((item): InvoiceItem => ({ id: uid(), ...item }))
    applied.push(`${f.items.length} item${f.items.length > 1 ? 's' : ''}`)
  }

  if (f.taxAmount && !safeNumber(inv.taxValue)) {
    inv.taxValue = f.taxAmount
    inv.taxMode = 'flat'
    applied.push('tax')
  }
  if (f.discountAmount && !safeNumber(inv.discountValue)) {
    inv.discountValue = f.discountAmount
    inv.discountMode = 'flat'
    applied.push('discount')
  }
  if (f.notes && inv.notes === 'Thank you for your business.') {
    inv.notes = f.notes
    applied.push('notes')
  }

  // Structural extras — only when the current extras are still untouched.
  const extras = inv.posExtras
  const x = f.extras
  if (x.metaRows.length > 0 && extras.metaRows.length === 0) {
    extras.metaRows = x.metaRows.map((row) => ({ id: uid(), ...row }))
    applied.push(`${x.metaRows.length} header detail${x.metaRows.length > 1 ? 's' : ''}`)
  }
  if (x.vatBreakdown && !extras.vatBreakdown) {
    extras.vatBreakdown = true
    applied.push('VAT breakdown')
  }
  const defaultSignatures =
    extras.signatureRows.length === 2 &&
    extras.signatureRows[0].label === 'Signature' &&
    extras.signatureRows[1].label === 'Received By'
  if (x.signatureLabels.length > 0 && defaultSignatures) {
    extras.signatureRows = x.signatureLabels.map((label) => ({ id: uid(), label }))
    applied.push(`${x.signatureLabels.length} fill-in lines`)
  }
  if (x.qr && !extras.qr.enabled) {
    extras.qr = { enabled: true, data: x.qr.data, message: x.qr.message }
    applied.push('QR block')
  }
  if (x.footerLines && !extras.footerLines.trim()) {
    extras.footerLines = x.footerLines
    applied.push('footer lines')
  }

  return applied
}
