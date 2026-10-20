<script lang="ts">
  import { Tween } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import type { Currency } from '$lib/types/invoice'
  import { formatCurrency } from '$lib/utils/currency'
  import { cn } from '$lib/utils/cn'

  interface Props {
    value: number
    currency: Currency
    negative?: boolean
    class?: string
  }

  let { value, currency, negative = false, class: className }: Props = $props()

  const tween = Tween.of(() => value, { duration: 350, easing: cubicOut })
</script>

<span class={cn('tabular-nums', className)}>
  {negative && tween.current > 0.004 ? '−' : ''}{formatCurrency(tween.current, currency)}
</span>
