<script>
    /**
     * AKS_Modal.svelte
     * ─────────────────────────────────────────────────────────────────
     * Base modal wrapper. Rendered by +layout.svelte for every entry
     * in the modal_stack store. Supports size variants and stacking.
     *
     * Props (passed by the layout, not used directly by consumers):
     *   - size:     'sm' | 'md' | 'lg' | 'xl' | 'full'
     *   - title:    Optional header title string
     *   - closeable: Whether backdrop click closes the modal
     *   - zIndex:   Dynamic z-index for stacking (50, 60, 70, ...)
     */

    import { createEventDispatcher } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    export let size      = 'xl';
    export let title     = '';
    export let closeable = true;
    export let zIndex    = 50;

    const dispatch = createEventDispatcher();

    const sizeClasses = {
        sm:   'max-w-md',
        md:   'max-w-xl',
        lg:   'max-w-3xl',
        xl:   'max-w-5xl',
        full: 'max-w-[95vw] h-[92vh]'
    };

    function handleBackdropClick(e) {
        if (closeable && e.target === e.currentTarget) {
            dispatch('close');
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Escape' && closeable) {
            dispatch('close');
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div
    class="fixed inset-0 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto"
    style="z-index: {zIndex}; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(2px);"
    on:click={handleBackdropClick}
    transition:fade={{ duration: 180 }}
    role="dialog"
    aria-modal="true"
>
    <!-- Panel -->
    <div
        class="relative w-full {sizeClasses[size]} bg-white rounded-2xl shadow-2xl flex flex-col my-auto"
        style="max-height: calc(100vh - 3rem);"
        transition:fly={{ y: 24, duration: 220 }}
    >
        <!-- Header (only if title provided or always for close button) -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            {#if title}
                <h2 class="text-base font-semibold text-slate-800 tracking-tight">{title}</h2>
            {:else}
                <span></span>
            {/if}
            {#if closeable}
                <button
                    on:click={() => dispatch('close')}
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            {/if}
        </div>

        <!-- Content slot -->
        <div class="overflow-y-auto flex-1 p-6">
            <slot />
        </div>
    </div>
</div>