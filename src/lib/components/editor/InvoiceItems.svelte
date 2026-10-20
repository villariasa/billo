<script lang="ts">
  import { ListOrdered, Plus, Trash2 } from 'lucide-svelte'
  import { slide } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import Card from '$lib/components/ui/Card.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import { app, addItem, removeItem, clearError } from '$lib/stores/invoice.svelte'
  import { formatCurrency, lineTotal } from '$lib/utils/currency'
</script>

<Card title="Invoice Items" description="Line items — description, quantity, and unit price.">
  {#snippet icon()}
    <ListOrdered class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <!-- Column headings (desktop) -->
  <div
    class="mb-2 hidden grid-cols-[1fr_72px_110px_110px_36px] gap-2 px-0.5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase sm:grid"
    aria-hidden="true"
  >
    <span>Description</span>
    <span class="text-right">Qty</span>
    <span class="text-right">Price</span>
    <span class="text-right">Total</span>
    <span></span>
  </div>

  <ul class="space-y-3 sm:space-y-2">
    {#each app.invoice.items as item, index (item.id)}
      <li
        transition:slide={{ duration: 250, easing: quintOut }}
        class="grid grid-cols-2 items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 sm:grid-cols-[1fr_72px_110px_110px_36px] sm:border-0 sm:bg-transparent sm:p-0"
      >
        <div class="col-span-2 sm:col-span-1">
          <Input
            id="{item.id}-description"
            aria-label="Item {index + 1} description"
            placeholder="e.g. Frontend Development"
            bind:value={item.description}
            error={app.errors[`${item.id}-description`]}
            oninput={() => clearError(`${item.id}-description`)}
          />
        </div>
        <div>
          <Input
            id="{item.id}-quantity"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            aria-label="Item {index + 1} quantity"
            class="text-right tabular-nums"
            bind:value={item.quantity}
            error={app.errors[`${item.id}-quantity`]}
            oninput={() => clearError(`${item.id}-quantity`)}
          />
        </div>
        <div>
          <Input
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            aria-label="Item {index + 1} unit price"
            class="text-right tabular-nums"
            bind:value={item.unitPrice}
          />
        </div>
        <output
          class="flex h-9 items-center justify-end truncate text-sm font-medium text-zinc-700 tabular-nums"
          aria-label="Item {index + 1} line total"
        >
          {formatCurrency(lineTotal(item), app.invoice.currency)}
        </output>
        <div class="flex justify-end">
          <Button
            variant="destructive"
            size="icon"
            aria-label="Remove item {index + 1}"
            disabled={app.invoice.items.length <= 1}
            onclick={() => removeItem(item.id)}
          >
            <Trash2 class="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </li>
    {/each}
  </ul>

  <Button variant="outline" class="mt-4 w-full border-dashed" onclick={addItem}>
    <Plus class="h-4 w-4" strokeWidth={1.5} />
    Add Item
  </Button>
</Card>
