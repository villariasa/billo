<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils/cn'

  type Variant = 'primary' | 'outline' | 'ghost' | 'destructive'
  type Size = 'default' | 'sm' | 'icon'

  interface Props extends HTMLButtonAttributes {
    variant?: Variant
    size?: Size
  }

  let { variant = 'primary', size = 'default', class: className, children, ...rest }: Props = $props()

  const variants: Record<Variant, string> = {
    primary:
      'bg-zinc-900 text-zinc-50 shadow-sm hover:bg-zinc-800 focus-visible:ring-zinc-900',
    outline:
      'border border-zinc-200/80 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-zinc-400',
    ghost: 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400',
    destructive:
      'text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-400',
  }

  const sizes: Record<Size, string> = {
    default: 'h-9 px-4 text-sm',
    sm: 'h-8 px-3 text-xs',
    icon: 'h-9 w-9',
  }
</script>

<button
  class={cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 select-none',
    'active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</button>
