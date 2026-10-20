<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements'
  import { ChevronDown } from 'lucide-svelte'
  import { cn } from '$lib/utils/cn'

  interface Props extends HTMLSelectAttributes {
    value?: string
  }

  let { value = $bindable(), class: className, children, ...rest }: Props = $props()
</script>

<div class="relative w-full">
  <select
    bind:value
    class={cn(
      'h-9 w-full cursor-pointer appearance-none rounded-lg border border-zinc-200/80 bg-white pr-9 pl-3 text-sm text-zinc-900 shadow-sm transition-all duration-200',
      'hover:border-zinc-300',
      'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/10 focus-visible:outline-none',
      className,
    )}
    {...rest}
  >
    {@render children?.()}
  </select>
  <ChevronDown
    class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
    strokeWidth={1.5}
    aria-hidden="true"
  />
</div>
