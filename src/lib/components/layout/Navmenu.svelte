<script>
	import { createEventDispatcher } from 'svelte';
	import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';
	import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
	import AKS_HRMS_Navmenu from '$lib/components/AKS_HRMS_Components/Navmenu/AKS_HRMS_Navmenu.svelte';

	const dispatch = createEventDispatcher();
	const theme = Project_Theme_Settings.nav_menu;

	$: user = $Live_Data_Storage?.User_Information ?? {};
	$: isHRAdmin = !user?.HRMS_Access || user.HRMS_Access === 'HR Admin';
	$: hasAccess = user?.HRMS_Access !== 'Blocked';
</script>

{#if hasAccess}
	<nav class="flex flex-col py-4">
		<AKS_HRMS_Navmenu {theme} {isHRAdmin} {user} on:navigate={() => dispatch('navigate')} />
	</nav>
{:else}
	<p class="px-4 py-6 text-xs text-gray-400">This account has no HRMS access.</p>
{/if}
