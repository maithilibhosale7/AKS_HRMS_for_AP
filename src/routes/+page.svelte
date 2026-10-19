<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { SessionStore } from '$lib/stores/SessionStore';
	import { hrmsHome } from '$lib/hrmsHome';

	onMount(() => {
		if ($SessionStore.authenticated) {
			goto(hrmsHome($SessionStore.user));
		} else {
			goto('/auth/login');
		}
	});
</script>

<p class="p-6 text-sm text-gray-500">Opening AKS HRMS…</p>
