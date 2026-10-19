<script>
	/**
	 * AKS_HRMS +layout.svelte
	 * ─────────────────────────────────────────────────────────────────
	 * Minimal layout for HRMS routes. The sidebar and header are now
	 * handled by the main app's Navmenu (via AKS_HRMS_Navmenu component).
	 *
	 * This layout only provides:
	 *   - Modal stack renderer (reads from AKS_HRMS_Modal_Store)
	 *   - Global loader overlay
	 *   - Slot for page content
	 *
	 * User_Information is hydrated by the SessionStore.subscribe callback in
	 * routes/+layout.svelte (no root +layout.server.js exists).
	 */

	import { modal_stack, closeModal, closeAllModals } from '$lib/stores/AKS_HRMS_Modal_Store';
	import AKS_Modal from '$lib/components/AKS_HRMS_Components/Shared/AKS_Modal.svelte';
	import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
	import { beforeNavigate } from '$app/navigation';

	beforeNavigate(({ to }) => {
		if (!to?.url.pathname.startsWith('/AKS_HRMS')) closeAllModals();
	});
</script>

<!-- ── Page Content ──────────────────────────────────────────────────── -->
<slot />

<!-- ── Modal Stack Renderer ───────────────────────────────────────────── -->
{#each $modal_stack as modal, i (modal.id)}
	<AKS_Modal
		size={modal.size}
		title={modal.title}
		closeable={modal.closeable}
		zIndex={50 + i * 10}
		on:close={closeModal}
	>
		<svelte:component this={modal.component} {...modal.props} />
	</AKS_Modal>
{/each}

<!-- ── Global Loader ─────────────────────────────────────────────────── -->
<div class="relative w-full h-full hidden" id="loader_block">
	<div
		class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-[999] inset-0 bg-black/60"
	>
		<img
			src={Project_Theme_Settings.client_loader_icon}
			alt="Loading..."
			class="w-auto h-24 mx-auto bg-white p-4 rounded-xl animate-pulse"
		/>
	</div>
</div>
