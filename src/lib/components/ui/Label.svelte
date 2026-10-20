<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils/cn'

  interface Props extends HTMLLabelAttributes {
    required?: boolean
  }

  let { required = false, class: className, children, ...rest }: Props = $props()
</script>

<label class={cn('mb-1.5 block text-sm font-medium text-zinc-700', className)} {...rest}>
  {@render children?.()}
  {#if required}
    <span class="text-red-500" aria-hidden="true">*</span>
  {/if}
</label>
