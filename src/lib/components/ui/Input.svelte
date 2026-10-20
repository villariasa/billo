<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils/cn'

  interface Props extends HTMLInputAttributes {
    value?: string | number | null
    error?: string
  }

  let { value = $bindable(), error = '', class: className, id, ...rest }: Props = $props()
</script>

<div class="w-full">
  <input
    {id}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error && id ? `${id}-error` : undefined}
    class={cn(
      'h-9 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-all duration-200',
      'placeholder:text-zinc-400',
      'hover:border-zinc-300',
      'focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/10 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/15',
      className,
    )}
    {...rest}
  />
  {#if error}
    <p id={id ? `${id}-error` : undefined} class="mt-1 text-xs text-red-600" role="alert">
      {error}
    </p>
  {/if}
</div>
