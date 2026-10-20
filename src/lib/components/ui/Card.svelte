<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils/cn'

  interface Props {
    title?: string
    description?: string
    icon?: Snippet
    children?: Snippet
    class?: string
  }

  let { title = '', description = '', icon, children, class: className }: Props = $props()
</script>

<section
  class={cn(
    'rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-200 sm:p-6',
    'focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/5',
    className,
  )}
>
  {#if title}
    <header class="mb-4 flex items-start gap-2.5">
      {#if icon}
        <span class="mt-0.5 text-zinc-400">{@render icon()}</span>
      {/if}
      <div>
        <h2 class="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2>
        {#if description}
          <p class="mt-0.5 text-xs text-zinc-500">{description}</p>
        {/if}
      </div>
    </header>
  {/if}
  {@render children?.()}
</section>
