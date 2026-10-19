<script>
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
    import { isLoaderOpen } from '$lib/stores/LayoutStore';

    $isLoaderOpen = false;
</script>

<!-- LOADER ICON / START -->
{#if $isLoaderOpen}
    <div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-500 inset-0 bg-black/60">
        <img src="{Project_Theme_Settings.client_loader_icon}" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
    </div>
{/if}
<!-- LOADER ICON / END -->