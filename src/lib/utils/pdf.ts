import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'
import type { PaperSize } from '$lib/types/invoice'

/**
 * Captures the live preview sheet (#invoice-sheet) at high resolution and
 * saves it as invoice-{invoiceNumber}.pdf at the selected paper size. The
 * responsive scale transform on #sheet-scale is stripped in the cloned
 * document so the capture is always full-size and crisp regardless of
 * viewport. Receipt sizes (heightMm === null) produce a continuous-roll page
 * whose height follows the content.
 */
export async function downloadInvoicePdf(invoiceNumber: string, paper: PaperSize): Promise<void> {
  const sheet = document.getElementById('invoice-sheet')
  if (!sheet) throw new Error('Invoice preview element not found')

  const canvas = await html2canvas(sheet, {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (doc) => {
      const scaled = doc.getElementById('sheet-scale')
      if (scaled) scaled.style.transform = 'none'
      const clonedSheet = doc.getElementById('invoice-sheet')
      if (clonedSheet) {
        clonedSheet.style.boxShadow = 'none'
        clonedSheet.style.borderRadius = '0'
      }
    },
  })

  const pageWidth = paper.widthMm
  const imageHeight = (canvas.height * pageWidth) / canvas.width
  // Fixed sizes clamp to the page; receipts grow with their content.
  const pageHeight = paper.heightMm ?? imageHeight

  const pdf = new jsPDF({
    unit: 'mm',
    format: [pageWidth, pageHeight],
    orientation: pageHeight >= pageWidth ? 'portrait' : 'landscape',
  })
  // JPEG at 0.95 keeps text crisp at 3x scale while keeping the file size
  // reasonable (PNG at this resolution produces 20 MB+ files).
  pdf.addImage(
    canvas.toDataURL('image/jpeg', 0.95),
    'JPEG',
    0,
    0,
    pageWidth,
    Math.min(imageHeight, pageHeight),
  )

  const safeNumber = (invoiceNumber || 'INV-001').trim().replace(/[^\w.-]+/g, '-')
  pdf.save(`invoice-${safeNumber}.pdf`)
}
