<script lang="ts">
  import { ReceiptText, Plus, Trash2 } from 'lucide-svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Separator from '$lib/components/ui/Separator.svelte'
  import { app, uid } from '$lib/stores/invoice.svelte'

  const extras = $derived(app.invoice.posExtras)
</script>

<Card
  title="Receipt Extras (POS)"
  description="Header details, VAT breakdown, signature lines, QR code, and footer."
>
  {#snippet icon()}
    <ReceiptText class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <!-- Header meta rows: Cashier, Trans#, TIN... -->
  <p class="mb-2 text-sm font-medium text-zinc-700">Header details</p>
  {#if extras.metaRows.length > 0}
    <ul class="mb-2 space-y-2">
      {#each extras.metaRows as row, index (row.id)}
        <li class="flex items-start gap-2">
          <Input
            aria-label="Detail {index + 1} label"
            placeholder="Cashier"
            class="max-w-40"
            bind:value={row.label}
          />
          <Input aria-label="Detail {index + 1} value" placeholder="Maria S." bind:value={row.value} />
          <Button
            variant="destructive"
            size="icon"
            aria-label="Remove detail {index + 1}"
            onclick={() => (extras.metaRows = extras.metaRows.filter((r) => r.id !== row.id))}
          >
            <Trash2 class="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </li>
      {/each}
    </ul>
  {/if}
  <Button
    variant="outline"
    size="sm"
    class="border-dashed"
    onclick={() => extras.metaRows.push({ id: uid(), label: '', value: '' })}
  >
    <Plus class="h-4 w-4" strokeWidth={1.5} />
    Add Detail Row
  </Button>

  <Separator class="my-5" />

  <!-- VAT breakdown toggle -->
  <label class="flex cursor-pointer items-start gap-2.5">
    <input
      type="checkbox"
      bind:checked={extras.vatBreakdown}
      class="mt-0.5 h-4 w-4 cursor-pointer accent-zinc-900"
    />
    <span>
      <span class="block text-sm font-medium text-zinc-700">VAT breakdown</span>
      <span class="block text-xs text-zinc-500">
        Show VATable Sales, VAT Amount, Zero-Rated, and VAT-Exempt rows under the total.
      </span>
    </span>
  </label>

  <Separator class="my-5" />

  <!-- Signature / fill-in lines -->
  <p class="mb-2 text-sm font-medium text-zinc-700">Signature &amp; fill-in lines</p>
  {#if extras.signatureRows.length > 0}
    <ul class="mb-2 space-y-2">
      {#each extras.signatureRows as row, index (row.id)}
        <li class="flex items-start gap-2">
          <Input
            aria-label="Fill-in line {index + 1} label"
            placeholder="Charge To"
            bind:value={row.label}
          />
          <Button
            variant="destructive"
            size="icon"
            aria-label="Remove fill-in line {index + 1}"
            onclick={() => (extras.signatureRows = extras.signatureRows.filter((r) => r.id !== row.id))}
          >
            <Trash2 class="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </li>
      {/each}
    </ul>
  {/if}
  <Button
    variant="outline"
    size="sm"
    class="border-dashed"
    onclick={() => extras.signatureRows.push({ id: uid(), label: '' })}
  >
    <Plus class="h-4 w-4" strokeWidth={1.5} />
    Add Fill-in Line
  </Button>

  <Separator class="my-5" />

  <!-- QR block -->
  <label class="flex cursor-pointer items-start gap-2.5">
    <input
      type="checkbox"
      bind:checked={extras.qr.enabled}
      class="mt-0.5 h-4 w-4 cursor-pointer accent-zinc-900"
    />
    <span>
      <span class="block text-sm font-medium text-zinc-700">QR code</span>
      <span class="block text-xs text-zinc-500">Print a QR code with an optional message.</span>
    </span>
  </label>
  {#if extras.qr.enabled}
    <div class="mt-3 grid gap-4">
      <div>
        <Label for="pos-qr-data">QR content (link or text)</Label>
        <Input id="pos-qr-data" placeholder="https://feedback.example.com" bind:value={extras.qr.data} />
      </div>
      <div>
        <Label for="pos-qr-message">QR message</Label>
        <Textarea
          id="pos-qr-message"
          class="min-h-14"
          placeholder="Scan the QR code below to share your feedback"
          bind:value={extras.qr.message}
        />
      </div>
    </div>
  {/if}

  <Separator class="my-5" />

  <!-- Footer lines -->
  <Label for="pos-footer-lines">
    Footer lines <span class="font-normal text-zinc-400">(one per line)</span>
  </Label>
  <Textarea
    id="pos-footer-lines"
    class="min-h-16"
    placeholder={'Need assistance? Visit example.com/contact\nThis serves as a SALES INVOICE'}
    bind:value={extras.footerLines}
  />
</Card>
