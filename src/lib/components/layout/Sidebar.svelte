<script>
    import { goto } from '$app/navigation';
    import { SessionStore } from '$lib/stores/SessionStore';
    import { Project_Theme_Settings } from "$lib/Project_Theme_Settings";
    import Navmenu from "./Navmenu.svelte";
    import { hrmsHome } from '$lib/hrmsHome';
    
    // Import the new layout store
    import { isSidebarOpen } from '$lib/stores/LayoutStore';

    // Dynamic routing for the logo based on user permissions
    function handleLogoClick(event) {
        event.preventDefault(); // Stop the default <a> tag navigation
        
        closeSidebarMobile(); // Ensure mobile sidebar closes

        // Check our optimized session boolean
        goto(hrmsHome($SessionStore?.user));
    }

    // Function to close sidebar on mobile after clicking a link
    function closeSidebarMobile() {
        if (window.innerWidth < 1024) {
            $isSidebarOpen = false; // The "Svelte Way" - just update the store!
        }
    }
</script>

<aside id="sidebar"
    class="flex-col h-screen top-0 border-r border-black/5 transition-all duration-300 shadow-2xl lg:shadow-none lg:overflow-hidden
           {$isSidebarOpen
               ? 'flex fixed lg:sticky z-50 lg:z-40 w-64 lg:w-1/4 xl:w-1/5 2xl:w-1/6'
               : 'hidden lg:flex lg:sticky lg:w-0'}"
    style="background-color: {Project_Theme_Settings.sidebar_color};">

    <div class="flex items-center justify-center py-8 px-6">
        <a href="/" on:click={handleLogoClick} class="transition-transform hover:scale-105 bg-white rounded">    
            <img 
                class="h-20 w-auto max-w-[150px]" 
                style="object-fit: contain;" 
                src="{Project_Theme_Settings.client_logo}" 
                alt="Client Logo">
        </a>
    </div>

    <div class="flex-grow overflow-y-auto custom-scrollbar px-4">
        <Navmenu on:navigate={closeSidebarMobile} />
    </div>

    <div class="p-4 mt-auto border-t border-black/5">
        <div class="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            <img 
                src={Project_Theme_Settings.AKS_Logo} 
                alt="AKS" 
                class="h-6 w-auto bg-white rounded shadow-sm border border-gray-200 px-1.5 py-0.5 opacity-75 object-contain" 
            />
            <span>AKS HRMS</span>
        </div>
    </div>
</aside>

{#if $isSidebarOpen}
    <div 
        class="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
        on:click={closeSidebarMobile} 
        role="presentation">
    </div>
{/if}

<style>
    /* Custom Scrollbar for a cleaner look */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
    }
</style>