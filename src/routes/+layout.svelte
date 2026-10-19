<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';
	import { Toasts } from 'as-toast';

	// Stores
	import { SessionStore } from '$lib/stores/SessionStore';
	import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';
	// Services
	import { loadUserContext } from '$lib/services/UserContextService';
	// Components
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Loader from '$lib/components/layout/Loader.svelte';
	import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
	import { hrmsHome } from '$lib/hrmsHome';

	// REACTIVE: Update this flag instantly whenever URL changes
	$: isAuthRoute = $page.url.pathname.startsWith('/auth');

	onMount(() => {
		// Apply toast CSS variables from theme
		const t = Project_Theme_Settings.toasts;
		const root = document.documentElement;
		root.style.setProperty('--as-toast-bottom', t.bottom);
		root.style.setProperty('--as-toast-border-radius', t.border_radius);
		root.style.setProperty('--as-toast-font-size', t.font_size);
		root.style.setProperty('--as-toast-min-width', t.min_width);
		root.style.setProperty('--as-toast-warn-background', t.warn_bg);
		root.style.setProperty('--as-toast-warn-border-color', t.warn_border);
		root.style.setProperty('--as-toast-warn-color', t.warn_color);
		root.style.setProperty('--as-toast-info-background', t.info_bg);
		root.style.setProperty('--as-toast-info-border-color', t.info_border);
		root.style.setProperty('--as-toast-info-color', t.info_color);
		// success / error — not in library, stored as custom vars for app.css
		root.style.setProperty('--toast-success-bg', t.success_bg);
		root.style.setProperty('--toast-success-border', t.success_border);
		root.style.setProperty('--toast-success-color', t.success_color);
		root.style.setProperty('--toast-error-bg', t.error_bg);
		root.style.setProperty('--toast-error-border', t.error_border);
		root.style.setProperty('--toast-error-color', t.error_color);

		const unsubscribe = SessionStore.subscribe((session) => {
			const currentPath = $page.url.pathname;

			// 0. Hydrate User_Information FIRST. Must precede every guard/return
			//    below — in a brand-new tab the convenience-redirect branch
			//    early-returns before any later block runs, and the SessionStore
			//    value never changes again on cold load, so this is the only
			//    opportunity to populate Live_Data.User_Information.
			if (session.authenticated && session.user) {
				Live_Data_Storage.update((currentData) => {
					currentData.User_Information = session.user;
					return currentData;
				});
				// Cold-reload safety net: covers the case where the user hits a
				// non-login route directly (no login-page await call to ride on).
				// The in-flight/loaded guard inside loadUserContext makes this a
				// no-op when the login page's awaited call is already in flight or
				// has completed for this userId, so login → goto stays at ONE fetch.
				loadUserContext(session.user_id || session.user.Master_User_ID);
			}

			// 1. Security Guard: If NOT logged in and NOT on an auth page -> Kick to Login
			if (!session.authenticated && !currentPath.startsWith('/auth')) {
				goto('/auth/login');
			}

			// 2. Convenience: If LOGGED IN and on Login page or base URL -> Go to Dashboard
			if (session.authenticated && (currentPath === '/auth/login' || currentPath === '/')) {
				goto(hrmsHome(session.user));
				return;
			}

			// 3. Expiry Check
			if (
				session.authenticated &&
				session.password_expired &&
				currentPath !== '/auth/reset-password'
			) {
				goto('/auth/reset-password');
			}
		});

		return () => unsubscribe();
	});
</script>

{#if isAuthRoute}
	<main class="w-full h-screen bg-gray-50">
		<slot />
	</main>
{:else if $SessionStore.authenticated}
	<div class="relative min-h-screen md:flex">
		<Sidebar />

		<Loader />

		<div id="main-content" class="flex flex-col flex-1 min-w-0 h-screen bg-gray-50">
			<Header />

			<main
				class="flex-grow py-3 md:py-2 md:px-3 overflow-y-auto overflow-x-hidden custom-scrollbar"
			>
				<slot />
			</main>

			<Footer />
		</div>

	</div>
{:else}
	<div class="w-full h-screen flex items-center justify-center bg-gray-100">
		<p class="text-gray-500 font-medium animate-pulse">Loading...</p>
	</div>
{/if}

<div class="toast-host">
	<Toasts />
</div>

<style>
	/* Lift the toast container above the footer */
	.toast-host :global(ul) {
		z-index: 9999;
	}

	/* success — library has no rule for this type */
	.toast-host :global(div.success) {
		background: var(--toast-success-bg, #dcfce7);
		border-color: var(--toast-success-border, #16a34a);
		color: var(--toast-success-color, #14532d);
	}

	/* error — library has no rule for this type */
	.toast-host :global(div.error) {
		background: var(--toast-error-bg, #fee2e2);
		border-color: var(--toast-error-border, #dc2626);
		color: var(--toast-error-color, #7f1d1d);
	}
</style>
