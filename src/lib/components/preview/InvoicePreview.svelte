<script lang="ts">
  import { app } from '$lib/stores/invoice.svelte'
  import { calculateTotals, formatCurrency, lineTotal } from '$lib/utils/currency'
  import AnimatedAmount from '$lib/components/ui/AnimatedAmount.svelte'
  import QrCode from '$lib/components/ui/QrCode.svelte'
  import { getPaperSize, getFontStack, mmToPx } from '$lib/types/invoice'
  import { cn } from '$lib/utils/cn'

  const invoice = $derived(app.invoice)
  const totals = $derived(calculateTotals(app.invoice))
  const paper = $derived(getPaperSize(app.invoice.paperSize))
  const fontStack = $derived(getFontStack(app.invoice.font))
  const itemCount = $derived(
    invoice.items.reduce((n, item) => n + Math.max(0, Math.trunc(item.quantity || 0)), 0),
  )
  const widthPx = $derived(mmToPx(paper.widthMm))
  const heightPx = $derived(paper.heightMm ? mmToPx(paper.heightMm) : 0)
  /** Narrow document sizes (A5/A6/Half Letter) get tighter spacing & type. */
  const compact = $derived(paper.kind === 'document' && widthPx < 620)

  function formatDate(iso: string): string {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-').map(Number)
    if (!y || !m || !d) return iso
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
</script>

{#if paper.kind === 'receipt' && invoice.receiptTemplate === 'pos'}
  <!-- POS template: classic thermal sales invoice (always monospace) -->
  <article
    id="invoice-sheet"
    class="rounded-sm bg-white px-4 py-6 text-[11px] leading-snug text-zinc-900 shadow-xl ring-1 ring-zinc-950/5"
    style="width: {widthPx}px; --sheet-w: {paper.widthMm}mm; font-family: 'Courier New', Courier, monospace;"
    aria-label="Receipt preview"
  >
    <header class="text-center">
      {#if invoice.business.logo}
        <img
          src={invoice.business.logo}
          alt="{invoice.business.name || 'Business'} logo"
          class="mx-auto mb-2 max-h-12 max-w-24 object-contain"
        />
      {/if}
      <h1 class="text-[13px] font-bold tracking-widest break-words uppercase">
        {invoice.business.name || 'Your Business Name'}
      </h1>
      <div class="mt-1 space-y-px text-[10px] leading-snug">
        {#if invoice.business.address}<p>{invoice.business.address}</p>{/if}
        {#if invoice.business.email}<p>{invoice.business.email}</p>{/if}
        {#if invoice.business.phone}<p>{invoice.business.phone}</p>{/if}
      </div>
      <p class="mt-3 text-[13px] font-bold tracking-[0.25em] uppercase">Sales Invoice</p>
      <p class="mt-1 text-[12px] font-bold tracking-wider tabular-nums">
        SI# {invoice.invoiceNumber || 'INV-001'}
      </p>
    </header>

    {#if invoice.posExtras.metaRows.length > 0}
      <div class="mt-2 space-y-px text-[10px] tabular-nums">
        {#each invoice.posExtras.metaRows as row (row.id)}
          {#if row.label.trim() || row.value.trim()}
            <p class="break-words">{row.label}{row.label.trim() ? ':' : ''} {row.value}</p>
          {/if}
        {/each}
      </div>
    {/if}

    <div class="my-2.5 border-t-4 border-double border-zinc-800"></div>

    <div class="space-y-0.5 text-[10px] tabular-nums">
      <p class="flex justify-between gap-2">
        <span>Date: {formatDate(invoice.invoiceDate)}</span>
        <span>Due: {formatDate(invoice.dueDate)}</span>
      </p>
      <p class="break-words">Bill To: {invoice.client.name || 'Client Name'}</p>
      {#if invoice.client.address}<p class="break-words">Address: {invoice.client.address}</p>{/if}
    </div>

    <div class="my-2.5 border-t border-dashed border-zinc-800"></div>

    <ul class="space-y-0.5">
      {#each invoice.items as item, index (item.id)}
        <li class="flex justify-between gap-2">
          <span class="break-words uppercase">
            {item.quantity || 0}
            {item.description || `Item ${index + 1}`}
          </span>
          <span class="shrink-0 tabular-nums">{formatCurrency(lineTotal(item), invoice.currency)}</span>
        </li>
      {/each}
    </ul>

    <div class="my-2.5 border-t border-dashed border-zinc-800"></div>

    <div class="space-y-0.5 tabular-nums">
      <p class="flex justify-between gap-2">
        <span>{itemCount} Item(s)</span>
        <span>Subtotal {formatCurrency(totals.subtotal, invoice.currency)}</span>
      </p>
      {#if totals.discount > 0}
        <p class="flex justify-between gap-2">
          <span>Discount</span>
          <span>-{formatCurrency(totals.discount, invoice.currency)}</span>
        </p>
      {/if}
      {#if totals.tax > 0}
        <p class="flex justify-between gap-2">
          <span>Tax</span>
          <span>{formatCurrency(totals.tax, invoice.currency)}</span>
        </p>
      {/if}
      <p class="mt-2 flex items-center justify-between gap-2 text-[15px] font-bold tracking-wide">
        <span class="uppercase">Total Due</span>
        <AnimatedAmount value={totals.grandTotal} currency={invoice.currency} />
      </p>
    </div>

    {#if invoice.posExtras.vatBreakdown}
      <div class="mt-2.5 space-y-0.5 border-t border-dashed border-zinc-800 pt-2 text-[10px] tabular-nums">
        <p class="flex justify-between gap-2">
          <span>VATable Sales</span>
          <span>{formatCurrency(Math.max(0, totals.subtotal - totals.discount), invoice.currency)}</span>
        </p>
        <p class="flex justify-between gap-2">
          <span>VAT Amount</span>
          <span>{formatCurrency(totals.tax, invoice.currency)}</span>
        </p>
        <p class="flex justify-between gap-2">
          <span>Zero-Rated Sales</span>
          <span>{formatCurrency(0, invoice.currency)}</span>
        </p>
        <p class="flex justify-between gap-2">
          <span>VAT-Exempt Sales</span>
          <span>{formatCurrency(0, invoice.currency)}</span>
        </p>
      </div>
    {/if}

    {#if invoice.posExtras.signatureRows.some((r) => r.label.trim())}
      <div class="my-2.5 overflow-hidden text-[10px] leading-none whitespace-nowrap" aria-hidden="true">
        {'*'.repeat(80)}
      </div>

      <div class="space-y-3 pt-1 text-[10px]">
        {#each invoice.posExtras.signatureRows as row (row.id)}
          {#if row.label.trim()}
            <p class="flex items-end gap-1">
              <span class="shrink-0">{row.label}&nbsp;:</span>
              <span class="h-3 w-full border-b border-zinc-500"></span>
            </p>
          {/if}
        {/each}
      </div>
    {/if}

    {#if invoice.posExtras.qr.enabled}
      <div class="my-2.5 overflow-hidden text-[10px] leading-none whitespace-nowrap" aria-hidden="true">
        {'*'.repeat(80)}
      </div>
      <div class="text-center">
        {#if invoice.posExtras.qr.message.trim()}
          <p class="mb-2 text-[10px] leading-relaxed whitespace-pre-line">
            {invoice.posExtras.qr.message}
          </p>
        {/if}
        <QrCode data={invoice.posExtras.qr.data} size={88} />
      </div>
    {/if}

    {#if invoice.notes.trim()}
      <div class="my-2.5 overflow-hidden text-[10px] leading-none whitespace-nowrap" aria-hidden="true">
        {'*'.repeat(80)}
      </div>
      <p class="text-center text-[10px] leading-relaxed whitespace-pre-line uppercase">
        {invoice.notes}
      </p>
    {/if}

    {#if invoice.posExtras.footerLines.trim()}
      <p class="mt-3 text-center text-[10px] leading-relaxed whitespace-pre-line">
        {invoice.posExtras.footerLines}
      </p>
    {/if}
  </article>
{:else if paper.kind === 'receipt'}
  <!-- Thermal receipt: continuous roll, height follows content -->
  <article
    id="invoice-sheet"
    class="rounded-sm bg-white px-4 py-6 text-zinc-900 shadow-xl ring-1 ring-zinc-950/5"
    style="width: {widthPx}px; --sheet-w: {paper.widthMm}mm; font-family: {fontStack};"
    aria-label="Receipt preview"
  >
    <header class="text-center">
      {#if invoice.business.logo}
        <img
          src={invoice.business.logo}
          alt="{invoice.business.name || 'Business'} logo"
          class="mx-auto mb-2 max-h-12 max-w-24 object-contain"
        />
      {/if}
      <h1 class="text-[13px] font-bold break-words">
        {invoice.business.name || 'Your Business Name'}
      </h1>
      <div class="mt-1 space-y-px text-[10px] leading-snug text-zinc-500">
        {#if invoice.business.address}<p>{invoice.business.address}</p>{/if}
        {#if invoice.business.email}<p>{invoice.business.email}</p>{/if}
        {#if invoice.business.phone}<p>{invoice.business.phone}</p>{/if}
      </div>
    </header>

    <hr class="my-3 border-t border-dashed border-zinc-300" />

    <dl class="space-y-1 text-[10px]">
      <div class="flex justify-between gap-2">
        <dt class="text-zinc-500">Invoice</dt>
        <dd class="font-semibold tabular-nums">#{invoice.invoiceNumber || 'INV-001'}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-zinc-500">Date</dt>
        <dd class="tabular-nums">{formatDate(invoice.invoiceDate)}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="text-zinc-500">Due</dt>
        <dd class="tabular-nums">{formatDate(invoice.dueDate)}</dd>
      </div>
      <div class="flex justify-between gap-2">
        <dt class="shrink-0 text-zinc-500">Bill To</dt>
        <dd class="text-right font-medium break-words">{invoice.client.name || 'Client Name'}</dd>
      </div>
    </dl>

    <hr class="my-3 border-t border-dashed border-zinc-300" />

    <ul class="space-y-2">
      {#each invoice.items as item, index (item.id)}
        <li>
          <p class="text-[11px] font-medium break-words">{item.description || `Item ${index + 1}`}</p>
          <p class="flex justify-between gap-2 text-[10px] text-zinc-500 tabular-nums">
            <span>{item.quantity || 0} × {formatCurrency(item.unitPrice || 0, invoice.currency)}</span>
            <span class="font-medium text-zinc-900">{formatCurrency(lineTotal(item), invoice.currency)}</span>
          </p>
        </li>
      {/each}
    </ul>

    <hr class="my-3 border-t border-dashed border-zinc-300" />

    <dl class="space-y-1 text-[10px]">
      <div class="flex justify-between">
        <dt class="text-zinc-500">Subtotal</dt>
        <dd><AnimatedAmount value={totals.subtotal} currency={invoice.currency} /></dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-zinc-500">Discount</dt>
        <dd><AnimatedAmount value={totals.discount} currency={invoice.currency} negative /></dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-zinc-500">Tax</dt>
        <dd><AnimatedAmount value={totals.tax} currency={invoice.currency} /></dd>
      </div>
      <div class="mt-2 flex justify-between border-t border-zinc-900 pt-2 text-[11px] font-bold">
        <dt class="uppercase">Total</dt>
        <dd><AnimatedAmount value={totals.grandTotal} currency={invoice.currency} /></dd>
      </div>
    </dl>

    {#if invoice.notes.trim()}
      <hr class="my-3 border-t border-dashed border-zinc-300" />
      <p class="text-center text-[10px] leading-relaxed whitespace-pre-line text-zinc-500">
        {invoice.notes}
      </p>
    {/if}
  </article>
{:else}
  <!-- Standard document sheet (A4/A5/A6/Letter/Half Letter/Legal) -->
  <article
    id="invoice-sheet"
    class={cn(
      'flex flex-col rounded-sm bg-white text-zinc-900 shadow-xl ring-1 ring-zinc-950/5',
      compact ? 'p-6' : 'p-12',
    )}
    style="width: {widthPx}px; min-height: {heightPx}px; --sheet-w: {paper.widthMm}mm; --sheet-h: {paper.heightMm}mm; font-family: {fontStack};"
    aria-label="Invoice preview"
  >
    <!-- Header -->
    <header class="flex items-start justify-between gap-8">
      <div class="min-w-0">
        {#if invoice.business.logo}
          <img
            src={invoice.business.logo}
            alt="{invoice.business.name || 'Business'} logo"
            class={cn('mb-3 object-contain', compact ? 'max-h-10 max-w-28' : 'max-h-16 max-w-40')}
          />
        {/if}
        <h1 class={cn('font-bold tracking-tight break-words', compact ? 'text-base' : 'text-xl')}>
          {invoice.business.name || 'Your Business Name'}
        </h1>
        <div
          class={cn(
            'mt-2 space-y-0.5 leading-relaxed text-zinc-500',
            compact ? 'text-[11px]' : 'text-[13px]',
          )}
        >
          {#if invoice.business.address}<p>{invoice.business.address}</p>{/if}
          {#if invoice.business.email}<p>{invoice.business.email}</p>{/if}
          {#if invoice.business.phone}<p>{invoice.business.phone}</p>{/if}
        </div>
      </div>
      <div class="shrink-0 text-right">
        <p
          class={cn(
            'font-bold tracking-[0.2em] text-zinc-900 uppercase',
            compact ? 'text-xl' : 'text-3xl',
          )}
        >
          Invoice
        </p>
        <p
          class={cn(
            'mt-2 inline-block rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-semibold text-zinc-700 tabular-nums',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          #{invoice.invoiceNumber || 'INV-001'}
        </p>
      </div>
    </header>

    <!-- Metadata row -->
    <div class={cn('flex items-start justify-between gap-8', compact ? 'mt-6' : 'mt-10')}>
      <div class="min-w-0">
        <p class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Bill To</p>
        <p class={cn('mt-2 font-semibold break-words', compact ? 'text-[13px]' : 'text-[15px]')}>
          {invoice.client.name || 'Client Name'}
        </p>
        <div
          class={cn(
            'mt-1 space-y-0.5 leading-relaxed text-zinc-500',
            compact ? 'text-[11px]' : 'text-[13px]',
          )}
        >
          {#if invoice.client.address}<p>{invoice.client.address}</p>{/if}
          {#if invoice.client.email}<p>{invoice.client.email}</p>{/if}
        </div>
      </div>
      <div class={cn('shrink-0 space-y-2 text-right', compact ? 'text-[11px]' : 'text-[13px]')}>
        <div>
          <p class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Invoice Date</p>
          <p class="mt-0.5 font-medium text-zinc-900 tabular-nums">{formatDate(invoice.invoiceDate)}</p>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Due Date</p>
          <p class="mt-0.5 font-medium text-zinc-900 tabular-nums">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>
    </div>

    <!-- Line items -->
    <table
      class={cn('w-full border-collapse', compact ? 'mt-6 text-[11px]' : 'mt-10 text-[13px]')}
    >
      <thead>
        <tr
          class="border-b-2 border-zinc-900 text-left text-xs font-semibold tracking-wider text-zinc-400 uppercase"
        >
          <th scope="col" class="pb-2.5 font-semibold">Description</th>
          <th scope="col" class="pb-2.5 text-right font-semibold">Qty</th>
          <th scope="col" class="pb-2.5 text-right font-semibold">Price</th>
          <th scope="col" class="pb-2.5 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {#each invoice.items as item, index (item.id)}
          <tr class="border-b border-zinc-200">
            <td class={cn('pr-4 break-words text-zinc-900', compact ? 'py-2' : 'py-3')}>
              {item.description || `Item ${index + 1}`}
            </td>
            <td class={cn('text-right text-zinc-700 tabular-nums', compact ? 'py-2' : 'py-3')}>
              {item.quantity || 0}
            </td>
            <td
              class={cn(
                'pl-4 text-right whitespace-nowrap text-zinc-700 tabular-nums',
                compact ? 'py-2' : 'py-3',
              )}
            >
              {formatCurrency(item.unitPrice || 0, invoice.currency)}
            </td>
            <td
              class={cn(
                'pl-4 text-right font-medium whitespace-nowrap text-zinc-900 tabular-nums',
                compact ? 'py-2' : 'py-3',
              )}
            >
              {formatCurrency(lineTotal(item), invoice.currency)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <!-- Totals block -->
    <div class="mt-6 flex justify-end">
      <dl class={cn('space-y-2', compact ? 'w-52 text-[11px]' : 'w-64 text-[13px]')}>
        <div class="flex items-center justify-between">
          <dt class="text-zinc-500">Subtotal</dt>
          <dd>
            <AnimatedAmount value={totals.subtotal} currency={invoice.currency} class="font-medium" />
          </dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="text-zinc-500">Discount</dt>
          <dd>
            <AnimatedAmount value={totals.discount} currency={invoice.currency} negative class="font-medium" />
          </dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="text-zinc-500">Tax</dt>
          <dd><AnimatedAmount value={totals.tax} currency={invoice.currency} class="font-medium" /></dd>
        </div>
        <div class="mt-3 flex items-center justify-between border-t-2 border-zinc-900 pt-3">
          <dt class={cn('font-bold tracking-wide uppercase', compact ? 'text-xs' : 'text-sm')}>
            Grand Total
          </dt>
          <dd>
            <AnimatedAmount
              value={totals.grandTotal}
              currency={invoice.currency}
              class={cn('font-bold', compact ? 'text-base' : 'text-lg')}
            />
          </dd>
        </div>
      </dl>
    </div>

    <!-- Footer / notes -->
    {#if invoice.notes.trim()}
      <footer class={cn('mt-auto border-t border-zinc-200', compact ? 'pt-4' : 'pt-6')}>
        <p class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Notes</p>
        <p
          class={cn(
            'mt-2 leading-relaxed whitespace-pre-line text-zinc-600',
            compact ? 'text-[11px]' : 'text-[13px]',
          )}
        >
          {invoice.notes}
        </p>
      </footer>
    {/if}
  </article>
{/if}
