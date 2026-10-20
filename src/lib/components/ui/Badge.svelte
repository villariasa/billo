<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils/cn'

  interface Props {
    children?: Snippet
    class?: string
  }

  let { children, class: className }: Props = $props()
</script>

<span
  class={cn(
    'inline-flex items-center gap-1 rounded-full border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500',
    className,
  )}
>
  {@render children?.()}
</span>
