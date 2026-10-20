<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { Toaster, toast } from 'svelte-sonner'
  import { Download, Eraser, FileCheck, History, LoaderCircle, Pencil, Save } from 'lucide-svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Badge from '$lib/components/ui/Badge.svelte'
  import zynqeloLogo from './assets/zynqelo.png'
  import InvoiceEditor from '$lib/components/editor/InvoiceEditor.svelte'
  import InvoicePreview from '$lib/components/preview/InvoicePreview.svelte'
  import {
    app,
    loadDraft,
    restoreDraft,
    saveDraft,
    resetInvoice,
    undoReset,
    validate,
  } from '$lib/stores/invoice.svelte'
  import { cn } from '$lib/utils/cn'
  import { getPaperSize, mmToPx, pxToMm } from '$lib/types/invoice'

  const paper = $derived(getPaperSize(app.invoice.paperSize))
  const sheetWidth = $derived(mmToPx(paper.widthMm))

  let paneWidth = $state(0)
  let sheetHeight = $state(1123)
  const scale = $derived(paneWidth > 0 ? Math.min(1, paneWidth / sheetWidth) : 1)
  // Native print: match @page to the selected paper; receipts use measured height.
  const printHeightMm = $derived(paper.heightMm ?? Math.ceil(pxToMm(sheetHeight)))

  onMount(() => {
    if (loadDraft()) {
      app.hasDraft = true
      toast('Saved draft found', {
        description: 'Pick up where you left off.',
        duration: 10000,
        action: { label: 'Restore Draft', onClick: handleRestore },
      })
    }
  })

  function handleRestore() {
    if (restoreDraft()) {
      toast.success('Draft restored')
    } else {
      toast.error('No saved draft found')
      app.hasDraft = false
    }
  }

  function handleSaveDraft() {
    if (saveDraft()) {
      toast.success('Draft saved', { description: 'Stored locally in this browser.' })
    } else {
      toast.error('Could not save draft', { description: 'localStorage is unavailable.' })
    }
  }

  function handleClear() {
    const snapshot = resetInvoice()
    toast('Invoice cleared', {
      description: 'Starting fresh with a blank invoice.',
      action: { label: 'Undo', onClick: () => undoReset(snapshot) },
      duration: 8000,
    })
  }

  async function handleDownload() {
    const { valid, firstErrorId } = validate()
    if (!valid) {
      toast.error('Missing required fields', {
        description: 'Fill in the highlighted fields and try again.',
      })
      app.mobileView = 'editor'
      await tick()
      if (firstErrorId) {
        const el = document.getElementById(firstErrorId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.focus({ preventScroll: true })
      }
      return
    }

    app.generating = true
    // The preview must be visible for capture — switch mobile users to it.
    app.mobileView = 'preview'
    await tick()
    try {
      // Lazy-loaded so jsPDF + html2canvas stay out of the initial bundle.
      const { downloadInvoicePdf } = await import('$lib/utils/pdf')
      await downloadInvoicePdf(app.invoice.invoiceNumber, paper)
      toast.success('PDF downloaded', {
        description: `invoice-${app.invoice.invoiceNumber || 'INV-001'}.pdf`,
      })
    } catch (err) {
      console.error(err)
      toast.error('PDF generation failed', { description: 'Please try again.' })
    } finally {
      app.generating = false
    }
  }
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags — values are app-generated numbers only -->
  {@html `<style>@page { size: ${paper.widthMm}mm ${printHeightMm}mm; margin: 0; }</style>`}
</svelte:head>

<Toaster richColors position="top-center" closeButton />

<div class="flex min-h-dvh flex-col">
  <!-- Sticky glass header -->
  <header
    class="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md print:hidden"
  >
    <div class="mx-auto flex h-14 max-w-480 items-center justify-between gap-3 px-4 sm:px-6">
      <div class="flex min-w-0 items-center gap-2.5">
        <img
          src={zynqeloLogo}
          alt="Zynqelo"
          class="h-7 w-auto max-w-32 shrink-0 object-contain sm:h-9 sm:max-w-44"
        />
        <Badge class="hidden md:inline-flex">
          <FileCheck class="h-3 w-3" strokeWidth={1.5} />
          Simple invoices. No account required.
        </Badge>
      </div>

      <nav class="flex items-center gap-1.5 sm:gap-2" aria-label="Invoice actions">
        {#if app.hasDraft}
          <Button variant="ghost" size="sm" onclick={handleRestore}>
            <History class="h-4 w-4" strokeWidth={1.5} />
            <span class="hidden sm:inline">Restore Draft</span>
            <span class="sr-only sm:hidden">Restore Draft</span>
          </Button>
        {/if}
        <Button variant="ghost" size="sm" onclick={handleClear}>
          <Eraser class="h-4 w-4" strokeWidth={1.5} />
          <span class="hidden sm:inline">Clear</span>
          <span class="sr-only sm:hidden">Clear invoice</span>
        </Button>
        <Button variant="outline" size="sm" onclick={handleSaveDraft}>
          <Save class="h-4 w-4" strokeWidth={1.5} />
          <span class="hidden sm:inline">Save Draft</span>
          <span class="sr-only sm:hidden">Save Draft</span>
        </Button>
        <Button size="sm" disabled={app.generating} onclick={handleDownload}>
          {#if app.generating}
            <LoaderCircle class="h-4 w-4 animate-spin" strokeWidth={1.5} />
            <span class="hidden sm:inline">Generating PDF…</span>
          {:else}
            <Download class="h-4 w-4" strokeWidth={1.5} />
            <span class="hidden sm:inline">Download PDF</span>
          {/if}
          <span class="sr-only sm:hidden">Download PDF</span>
        </Button>
      </nav>
    </div>

    <!-- Mobile segmented view toggle -->
    <div class="border-t border-zinc-200/80 px-4 py-2 lg:hidden">
      <div
        class="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200/80 bg-zinc-100 p-1"
        role="tablist"
        aria-label="Switch between editor and live preview"
      >
        {#each [{ view: 'editor' as const, label: 'Editor', Icon: Pencil }, { view: 'preview' as const, label: 'Live Preview', Icon: FileCheck }] as { view, label, Icon } (view)}
          <button
            type="button"
            role="tab"
            aria-selected={app.mobileView === view}
            class={cn(
              'flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-150',
              'focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:outline-none',
              app.mobileView === view
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700',
            )}
            onclick={() => (app.mobileView = view)}
          >
            <Icon class="h-3.5 w-3.5" strokeWidth={1.5} />
            {label}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <main class="mx-auto w-full max-w-480 flex-1 px-4 py-6 sm:px-6 lg:py-8">
    <div class="grid gap-8 lg:grid-cols-12">
      <!-- Left: scrollable form editor -->
      <div class={cn('min-w-0 lg:col-span-5 xl:col-span-5', app.mobileView !== 'editor' && 'hidden lg:block')}>
        <InvoiceEditor />
      </div>

      <!-- Right: sticky live preview over dot-grid workspace -->
      <div
        id="preview-pane"
        class={cn(
          'min-w-0 self-start overflow-x-hidden rounded-xl border border-zinc-200/80 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-4 sm:p-8',
          'lg:sticky lg:top-20 lg:col-span-7 lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto xl:col-span-7',
          app.mobileView !== 'preview' && 'hidden lg:block',
        )}
      >
        <div class="mx-auto w-full" style="max-width: {sheetWidth}px" bind:clientWidth={paneWidth}>
          <div style="height: {Math.ceil(sheetHeight * scale)}px">
            <div
              id="sheet-scale"
              bind:clientHeight={sheetHeight}
              class="origin-top-left"
              style="width: {sheetWidth}px; transform: scale({scale});"
            >
              <InvoicePreview />
            </div>
          </div>
        </div>

        {#if app.referenceImage && app.showReference}
          <figure
            class="mx-auto mt-6 w-full max-w-72 rounded-lg border border-zinc-200/80 bg-white p-2 shadow-sm print:hidden"
          >
            <figcaption
              class="mb-1.5 text-center text-[10px] font-semibold tracking-wider text-zinc-400 uppercase"
            >
              Sample reference — not part of the PDF
            </figcaption>
            <img
              src={app.referenceImage}
              alt="Uploaded sample receipt for format matching"
              class="w-full rounded object-contain"
            />
          </figure>
        {/if}
      </div>
    </div>
  </main>

  <footer class="border-t border-zinc-200/80 py-4 text-center text-xs text-zinc-400 print:hidden">
    Zynqelo — runs 100% in your browser. Your data never leaves this device.
  </footer>
</div>
