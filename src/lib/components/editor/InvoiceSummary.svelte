<script lang="ts">
  import { Calculator } from 'lucide-svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import Separator from '$lib/components/ui/Separator.svelte'
  import AnimatedAmount from '$lib/components/ui/AnimatedAmount.svelte'
  import { app } from '$lib/stores/invoice.svelte'
  import { calculateTotals } from '$lib/utils/currency'
  import type { AdjustmentMode } from '$lib/types/invoice'
  import { cn } from '$lib/utils/cn'

  const totals = $derived(calculateTotals(app.invoice))

  const CURRENCY_SYMBOLS: Record<string, string> = { PHP: '₱', USD: '$', EUR: '€', GBP: '£' }
  const symbol = $derived(CURRENCY_SYMBOLS[app.invoice.currency] ?? app.invoice.currency)
</script>

{#snippet modeToggle(
  current: AdjustmentMode,
  set: (mode: AdjustmentMode) => void,
  labelPrefix: string,
)}
  <div
    class="inline-flex h-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 shadow-sm"
    role="group"
    aria-label="{labelPrefix} mode"
  >
    {#each [{ mode: 'flat' as const, text: symbol }, { mode: 'percent' as const, text: '%' }] as opt (opt.mode)}
      <button
        type="button"
        aria-pressed={current === opt.mode}
        aria-label="{labelPrefix} as {opt.mode === 'flat' ? 'flat amount' : 'percentage'}"
        class={cn(
          'w-10 cursor-pointer text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:outline-none focus-visible:ring-inset',
          current === opt.mode
            ? 'bg-zinc-900 text-white'
            : 'bg-white text-zinc-500 hover:bg-zinc-50',
        )}
        onclick={() => set(opt.mode)}
      >
        {opt.text}
      </button>
    {/each}
  </div>
{/snippet}

<Card title="Summary" description="Discount, tax, and calculated totals.">
  {#snippet icon()}
    <Calculator class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <Label for="invoice-discount">Discount</Label>
      <div class="flex gap-2">
        <Input
          id="invoice-discount"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          class="text-right tabular-nums"
          bind:value={app.invoice.discountValue}
        />
        {@render modeToggle(
          app.invoice.discountMode,
          (mode) => (app.invoice.discountMode = mode),
          'Discount',
        )}
      </div>
    </div>
    <div>
      <Label for="invoice-tax">Tax</Label>
      <div class="flex gap-2">
        <Input
          id="invoice-tax"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          class="text-right tabular-nums"
          bind:value={app.invoice.taxValue}
        />
        {@render modeToggle(app.invoice.taxMode, (mode) => (app.invoice.taxMode = mode), 'Tax')}
      </div>
    </div>
  </div>

  <Separator class="my-5" />

  <dl class="space-y-2 text-sm">
    <div class="flex items-center justify-between">
      <dt class="text-zinc-500">Subtotal</dt>
      <dd><AnimatedAmount value={totals.subtotal} currency={app.invoice.currency} class="font-medium text-zinc-700" /></dd>
    </div>
    <div class="flex items-center justify-between">
      <dt class="text-zinc-500">Discount</dt>
      <dd><AnimatedAmount value={totals.discount} currency={app.invoice.currency} negative class="font-medium text-zinc-700" /></dd>
    </div>
    <div class="flex items-center justify-between">
      <dt class="text-zinc-500">Tax</dt>
      <dd><AnimatedAmount value={totals.tax} currency={app.invoice.currency} class="font-medium text-zinc-700" /></dd>
    </div>
    <Separator class="my-3 border-zinc-300" />
    <div class="flex items-center justify-between">
      <dt class="text-sm font-semibold text-zinc-900">Grand Total</dt>
      <dd>
        <AnimatedAmount
          value={totals.grandTotal}
          currency={app.invoice.currency}
          class="text-lg font-bold text-zinc-900"
        />
      </dd>
    </div>
  </dl>
</Card>
