<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils/cn'

  interface Props extends HTMLTextareaAttributes {
    value?: string
  }

  let { value = $bindable(), class: className, ...rest }: Props = $props()
</script>

<textarea
  bind:value
  class={cn(
    'min-h-20 w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-all duration-200',
    'placeholder:text-zinc-400',
    'hover:border-zinc-300',
    'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/10 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )}
  {...rest}
></textarea>
