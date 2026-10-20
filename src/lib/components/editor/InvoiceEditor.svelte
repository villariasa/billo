<script lang="ts">
  import BusinessInfo from './BusinessInfo.svelte'
  import ClientInfo from './ClientInfo.svelte'
  import InvoiceDetails from './InvoiceDetails.svelte'
  import AppearanceSection from './AppearanceSection.svelte'
  import PosExtrasSection from './PosExtrasSection.svelte'
  import InvoiceItems from './InvoiceItems.svelte'
  import InvoiceSummary from './InvoiceSummary.svelte'
  import NotesSection from './NotesSection.svelte'
  import { app } from '$lib/stores/invoice.svelte'
  import { getPaperSize } from '$lib/types/invoice'

  const showPosExtras = $derived(
    getPaperSize(app.invoice.paperSize).kind === 'receipt' && app.invoice.receiptTemplate === 'pos',
  )
</script>

<div class="space-y-4">
  <BusinessInfo />
  <ClientInfo />
  <InvoiceDetails />
  <AppearanceSection />
  {#if showPosExtras}
    <PosExtrasSection />
  {/if}
  <InvoiceItems />
  <InvoiceSummary />
  <NotesSection />
</div>
