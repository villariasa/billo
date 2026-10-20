<script lang="ts">
  import { User } from 'lucide-svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import { app, clearError } from '$lib/stores/invoice.svelte'
</script>

<Card title="Client Information" description="Who you're billing (Bill To).">
  {#snippet icon()}
    <User class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <Label for="client-name" required>Client Name</Label>
      <Input
        id="client-name"
        placeholder="Juan dela Cruz"
        bind:value={app.invoice.client.name}
        error={app.errors['client-name']}
        oninput={() => clearError('client-name')}
      />
    </div>
    <div>
      <Label for="client-email">Client Email</Label>
      <Input
        id="client-email"
        type="email"
        placeholder="client@email.com"
        bind:value={app.invoice.client.email}
      />
    </div>
    <div class="sm:col-span-2">
      <Label for="client-address">Client Address</Label>
      <Input
        id="client-address"
        placeholder="456 Client Ave, Quezon City"
        bind:value={app.invoice.client.address}
      />
    </div>
  </div>
</Card>
