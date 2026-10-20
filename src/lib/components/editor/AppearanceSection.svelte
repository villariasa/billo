<script lang="ts">
  import { Palette, ImageUp, Eye, EyeOff, Trash2, Wand2, LoaderCircle } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'
  import Card from '$lib/components/ui/Card.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import Select from '$lib/components/ui/Select.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import { app } from '$lib/stores/invoice.svelte'
  import { DOCUMENT_FONTS, getPaperSize } from '$lib/types/invoice'

  const isReceipt = $derived(getPaperSize(app.invoice.paperSize).kind === 'receipt')

  let sampleInput = $state<HTMLInputElement | null>(null)
  let analyzing = $state(false)
  let progress = $state(0)

  /**
   * OCRs the sample (client-side, lazy-loaded Tesseract.js) and applies its
   * layout + any fields the user hasn't filled in yet.
   */
  async function handleApplySample() {
    if (!app.referenceImage || analyzing) return
    analyzing = true
    progress = 0
    try {
      const { ocrImage, parseSample, applySample } = await import('$lib/utils/sampleParser')
      const img = new Image()
      img.src = app.referenceImage
      await img.decode()
      const text = await ocrImage(app.referenceImage, (p) => (progress = p))
      const parsed = parseSample(text, img.height / img.width)
      const applied = applySample(parsed)
      toast.success('Sample format applied', {
        description: `Matched: ${applied.join(', ')}. Review and adjust anything the scan got wrong.`,
        duration: 8000,
      })
    } catch (err) {
      console.error(err)
      toast.error('Could not read the sample', {
        description: 'Try a sharper, well-lit photo. The first run also needs internet to fetch the OCR engine.',
      })
    } finally {
      analyzing = false
    }
  }

  /** Downscales the sample photo to max 1400px — it only needs to be readable on screen. */
  function handleSampleUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1400
      const ratio = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      app.referenceImage = canvas.toDataURL('image/jpeg', 0.85)
      app.showReference = true
      toast.success('Sample added', {
        description: 'Shown beside the live preview. It is never part of the PDF.',
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      toast.error('Could not read that image')
    }
    img.src = url
  }
</script>

<Card title="Appearance" description="Document font, receipt style, and optional sample matching.">
  {#snippet icon()}
    <Palette class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <div class="grid gap-4 sm:grid-cols-2">
    <div class={isReceipt ? '' : 'sm:col-span-2'}>
      <Label for="invoice-font">Document Font</Label>
      <Select id="invoice-font" bind:value={app.invoice.font}>
        {#each DOCUMENT_FONTS as font (font.id)}
          <option value={font.id}>{font.label}</option>
        {/each}
      </Select>
    </div>
    {#if isReceipt}
      <div>
        <Label for="invoice-receipt-template">Receipt Style</Label>
        <Select id="invoice-receipt-template" bind:value={app.invoice.receiptTemplate}>
          <option value="clean">Clean — minimal</option>
          <option value="pos">POS — classic thermal sales invoice</option>
        </Select>
        {#if app.invoice.receiptTemplate === 'pos'}
          <p class="mt-1 text-xs text-zinc-400">
            POS style always uses typewriter (monospace) type, like a real thermal printer.
          </p>
        {/if}
      </div>
    {/if}
  </div>

  <div class="mt-5 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-4">
    <p class="text-sm font-medium text-zinc-700">
      Match a sample <span class="font-normal text-zinc-400">(optional)</span>
    </p>
    <p class="mt-1 text-xs leading-relaxed text-zinc-500">
      Upload a photo of an existing receipt or invoice, then use <strong>Apply Sample Format</strong>
      — it reads the photo on your device (no upload to any server), switches to a matching layout,
      and fills in fields you haven't typed yet. Your own entries are never overwritten, the sample
      is never included in your PDF, and it is not saved with drafts.
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onclick={() => sampleInput?.click()}>
        <ImageUp class="h-4 w-4" strokeWidth={1.5} />
        {app.referenceImage ? 'Replace Sample' : 'Upload Sample'}
      </Button>
      {#if app.referenceImage}
        <Button size="sm" disabled={analyzing} onclick={handleApplySample}>
          {#if analyzing}
            <LoaderCircle class="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Reading… {Math.round(progress * 100)}%
          {:else}
            <Wand2 class="h-4 w-4" strokeWidth={1.5} />
            Apply Sample Format
          {/if}
        </Button>
      {/if}
      {#if app.referenceImage}
        <Button variant="ghost" size="sm" onclick={() => (app.showReference = !app.showReference)}>
          {#if app.showReference}
            <EyeOff class="h-4 w-4" strokeWidth={1.5} />
            Hide
          {:else}
            <Eye class="h-4 w-4" strokeWidth={1.5} />
            Show
          {/if}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onclick={() => {
            app.referenceImage = ''
          }}
        >
          <Trash2 class="h-4 w-4" strokeWidth={1.5} />
          Remove
        </Button>
      {/if}
      <input
        bind:this={sampleInput}
        id="sample-reference-input"
        type="file"
        accept="image/*"
        class="hidden"
        aria-label="Upload sample receipt or invoice image"
        onchange={handleSampleUpload}
      />
    </div>
  </div>
</Card>
