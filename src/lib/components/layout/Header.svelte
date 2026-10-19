<script>
	import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
	import { AuthService } from '$lib/services/AuthService';
	import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';
	import { addToast } from 'as-toast';
	import { goto } from '$app/navigation';
	import { SessionStore } from '$lib/stores/SessionStore'; // Import the store
	let isProfileOpen = false;

	// Reactive user info
	$: user = $Live_Data_Storage.User_Information || {};

	async function handleLogout() {
		await AuthService.logout();
		addToast('Logged out successfully', 'info');

		SessionStore.set({
			authenticated: false,
			user: null,
			token: null,
			password_expired: false
		});

		// 3. Redirect to login
		goto('/auth/login');
	}

	import { isSidebarOpen } from '$lib/stores/LayoutStore';
	import InstallApp from '$lib/components/InstallApp.svelte';
	import { onMount } from 'svelte';
	import { post } from '$lib/utils/api';
	import { API_PATHS } from '$lib/API_PATHS';

	let profileName = '';

	onMount(async () => {
		try {
			const data = await post(API_PATHS.API_URL_Get_User_Information, {});
			profileName = data?.Profile?.Employee_Name || data?.Profile?.Master_User_Name || '';
		} catch (_) {
			profileName = '';
		}
	});

	$: displayName = profileName || user.Employee_Name || user.Master_User_Name || user.Username || 'User';
	$: roleLabel = user.HRMS_Access || '';
	$: initial = displayName.charAt(0).toUpperCase();
    
    function toggleSidebar() {
        $isSidebarOpen = !$isSidebarOpen;
    }
</script>

<header class="sticky top-0 z-40 w-full shadow-sm h-16 flex items-center" style="background-color: {Project_Theme_Settings.header_color};">
	<nav class="flex w-full items-center justify-between px-4 sm:px-6">	
		<div class="flex items-center">
			<button on:click={toggleSidebar} 
                    class="p-3 -ml-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none text-white"
                    aria-label="Toggle Menu">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<img 
				src={Project_Theme_Settings.AKS_Logo} 
				alt="Logo" 
				class="h-7 sm:h-9 w-auto ml-2 bg-white rounded-md shadow-sm border border-gray-100 px-2 py-1 object-contain" 
			/>
		</div>

		<div class="flex items-center space-x-2 sm:space-x-4">
			<InstallApp tone="header" />
			<div class="relative">
				<button on:click={() => isProfileOpen = !isProfileOpen}
                        class="flex items-center group p-1 rounded-full hover:bg-white/10 transition-all">
					<div class="text-right mr-3">
						<p class="text-xs font-bold text-white leading-tight">{displayName}</p>
						{#if roleLabel}
							<p class="text-[10px] text-gray-300 uppercase tracking-tighter">{roleLabel}</p>
						{/if}
					</div>
					
					<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm transition-transform group-active:scale-95">
						{initial}
					</div>
				</button>
				{#if isProfileOpen}
					<div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5">
						<div class="px-4 py-3 border-b border-gray-50 sm:hidden">
							<p class="text-sm font-bold text-gray-900">{displayName}</p>
							{#if roleLabel}
								<p class="text-xs text-gray-500">{roleLabel}</p>
							{/if}
						</div>
						<a href="/profile" class="block px-4 py-3 text-sm text-gray-700 active:bg-gray-100">My Profile</a>
						<button on:click={handleLogout} 
                                class="w-full text-left px-4 py-3 text-sm text-red-600 font-semibold active:bg-red-50">
							Logout
						</button>
					</div>
				{/if}
			</div>
		</div>
	</nav>
</header>