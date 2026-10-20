<script lang="ts">
  import { Building2, ImagePlus, X } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'
  import Card from '$lib/components/ui/Card.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Label from '$lib/components/ui/Label.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import { app, clearError } from '$lib/stores/invoice.svelte'

  let fileInput = $state<HTMLInputElement | null>(null)

  /**
   * Downscales the uploaded image to max 512px and stores it as a data URL so
   * it fits comfortably in the localStorage draft.
   */
  function handleLogoUpload(event: Event) {
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
      const MAX = 512
      const ratio = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      app.invoice.business.logo = canvas.toDataURL('image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      toast.error('Could not read that image')
    }
    img.src = url
  }
</script>

<Card title="Business Information" description="Your details — shown as the sender (From).">
  {#snippet icon()}
    <Building2 class="h-4 w-4" strokeWidth={1.5} />
  {/snippet}

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="sm:col-span-2">
      <Label for="business-logo-input">Logo <span class="font-normal text-zinc-400">(optional)</span></Label>
      <div class="flex items-center gap-3">
        {#if app.invoice.business.logo}
          <div class="relative h-14 w-14 shrink-0 rounded-lg border border-zinc-200/80 bg-white p-1 shadow-sm">
            <img
              src={app.invoice.business.logo}
              alt="Business logo preview"
              class="h-full w-full object-contain"
            />
            <button
              type="button"
              aria-label="Remove logo"
              class="absolute -top-2 -right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              onclick={() => (app.invoice.business.logo = '')}
            >
              <X class="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        {/if}
        <Button variant="outline" size="sm" onclick={() => fileInput?.click()}>
          <ImagePlus class="h-4 w-4" strokeWidth={1.5} />
          {app.invoice.business.logo ? 'Replace Logo' : 'Upload Logo'}
        </Button>
        <input
          bind:this={fileInput}
          id="business-logo-input"
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleLogoUpload}
        />
      </div>
    </div>
    <div class="sm:col-span-2">
      <Label for="business-name" required>Business Name</Label>
      <Input
        id="business-name"
        placeholder="Acme Studio"
        autocomplete="organization"
        bind:value={app.invoice.business.name}
        error={app.errors['business-name']}
        oninput={() => clearError('business-name')}
      />
    </div>
    <div>
      <Label for="business-email">Business Email</Label>
      <Input
        id="business-email"
        type="email"
        placeholder="hello@acme.studio"
        autocomplete="email"
        bind:value={app.invoice.business.email}
      />
    </div>
    <div>
      <Label for="business-phone">Business Phone</Label>
      <Input
        id="business-phone"
        type="tel"
        placeholder="+63 912 345 6789"
        autocomplete="tel"
        bind:value={app.invoice.business.phone}
      />
    </div>
    <div class="sm:col-span-2">
      <Label for="business-address">Business Address</Label>
      <Input
        id="business-address"
        placeholder="123 Main St, Makati, Metro Manila"
        autocomplete="street-address"
        bind:value={app.invoice.business.address}
      />
    </div>
  </div>
</Card>
