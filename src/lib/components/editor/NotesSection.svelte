<script lang="ts">
  import { StickyNote } from 'lucide-svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import Textarea from '$lib/components/ui/Textarea.svelte'
  import { app } from '$lib/stores/invoice.svelte'
</script>

<Card title="Notes & Terms" description="Shown at the bottom of the invoice.">
  {#snippet icon()}
    <StickyNote class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <Label for="invoice-notes" class="sr-only">Notes and terms</Label>
  <Textarea
    id="invoice-notes"
    placeholder="Thank you for your business."
    bind:value={app.invoice.notes}
  />
</Card>
