<script lang="ts">
  interface Props {
    data: string
    size?: number
  }

  let { data, size = 96 }: Props = $props()

  let url = $state('')

  $effect(() => {
    const value = data.trim() || ' '
    let cancelled = false
    import('qrcode').then((qrcode) =>
      qrcode
        .toDataURL(value, { margin: 0, width: size * 3, errorCorrectionLevel: 'M' })
        .then((u) => {
          if (!cancelled) url = u
        })
        .catch(() => {
          if (!cancelled) url = ''
        }),
    )
    return () => {
      cancelled = true
    }
  })
</script>

{#if url}
  <img src={url} alt="QR code" style="width: {size}px; height: {size}px" class="mx-auto" />
{/if}
