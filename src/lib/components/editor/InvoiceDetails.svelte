<script lang="ts">
  import { FileText } from 'lucide-svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import Select from '$lib/components/ui/Select.svelte'
  import { CURRENCIES, PAPER_SIZES } from '$lib/types/invoice'
  import { app, clearError } from '$lib/stores/invoice.svelte'
</script>

<Card title="Invoice Details" description="Number, dates, and currency.">
  {#snippet icon()}
    <FileText class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <Label for="invoice-number" required>Invoice Number</Label>
      <Input
        id="invoice-number"
        placeholder="INV-001"
        bind:value={app.invoice.invoiceNumber}
        error={app.errors['invoice-number']}
        oninput={() => clearError('invoice-number')}
      />
    </div>
    <div>
      <Label for="invoice-currency">Currency</Label>
      <Select id="invoice-currency" bind:value={app.invoice.currency}>
        {#each CURRENCIES as { code, label } (code)}
          <option value={code}>{label}</option>
        {/each}
      </Select>
    </div>
    <div>
      <Label for="invoice-date" required>Invoice Date</Label>
      <Input
        id="invoice-date"
        type="date"
        bind:value={app.invoice.invoiceDate}
        error={app.errors['invoice-date']}
        oninput={() => clearError('invoice-date')}
      />
    </div>
    <div>
      <Label for="invoice-due-date">Due Date</Label>
      <Input id="invoice-due-date" type="date" bind:value={app.invoice.dueDate} />
    </div>
    <div class="sm:col-span-2">
      <Label for="invoice-paper-size">Paper Size</Label>
      <Select id="invoice-paper-size" bind:value={app.invoice.paperSize}>
        <optgroup label="Documents">
          {#each PAPER_SIZES.filter((p) => p.kind === 'document') as p (p.id)}
            <option value={p.id}>{p.label}</option>
          {/each}
        </optgroup>
        <optgroup label="Receipts (continuous roll)">
          {#each PAPER_SIZES.filter((p) => p.kind === 'receipt') as p (p.id)}
            <option value={p.id}>{p.label}</option>
          {/each}
        </optgroup>
      </Select>
    </div>
  </div>
</Card>
