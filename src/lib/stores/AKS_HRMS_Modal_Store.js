/**
 * AKS_HRMS_Modal_Store.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized store for managing the popup/modal stack across all
 * HRMS sub-modules. Supports stacked modals (e.g. List → Add/Edit).
 *
 * Usage:
 *   import { openModal, closeModal } from '$lib/stores/AKS_HRMS_Modal_Store';
 *   import Leave_List_Popup from '$lib/.../Leave/Leave_List_Popup.svelte';
 *
 *   // Open a modal:
 *   openModal(Leave_List_Popup, { initialFilter: 'Pending' });
 *
 *   // Open a second modal on top (e.g. from within Leave_List_Popup):
 *   openModal(Leave_AddEdit_Popup, { mode: 'Add' });
 *
 *   // Close the topmost modal:
 *   closeModal();
 *
 *   // Close everything:
 *   closeAllModals();
 */

import { writable, derived } from 'svelte/store';

// The modal stack: each entry = { component, props, size, title }
export const modal_stack = writable([]);

// Derived: is any modal currently open?
export const any_modal_open = derived(modal_stack, $stack => $stack.length > 0);

// Derived: the topmost modal
export const top_modal = derived(modal_stack, $stack => $stack[$stack.length - 1] ?? null);

/**
 * Push a new modal onto the stack.
 * @param {SvelteComponent} component - The Svelte component to render inside the modal
 * @param {Object} props              - Props to pass to the component
 * @param {Object} options            - Modal display options
 * @param {'sm'|'md'|'lg'|'xl'|'full'} options.size  - Modal width (default: 'xl')
 * @param {string} options.title      - Optional title shown in the modal header
 * @param {boolean} options.closeable - Whether clicking backdrop closes the modal (default: true)
 */
export function openModal(component, props = {}, options = {}) {
    modal_stack.update(stack => [
        ...stack,
        {
            component,
            props,
            size:      options.size      ?? 'xl',
            title:     options.title     ?? '',
            closeable: options.closeable ?? true,
            id:        crypto.randomUUID()
        }
    ]);
}

/**
 * Close the topmost modal in the stack.
 */
export function closeModal() {
    modal_stack.update(stack => stack.slice(0, -1));
}

/**
 * Close all open modals.
 */
export function closeAllModals() {
    modal_stack.set([]);
}

/**
 * Replace the topmost modal with a new one (useful for List → Edit transitions).
 */
export function replaceModal(component, props = {}, options = {}) {
    modal_stack.update(stack => [
        ...stack.slice(0, -1),
        {
            component,
            props,
            size:      options.size      ?? 'xl',
            title:     options.title     ?? '',
            closeable: options.closeable ?? true,
            id:        crypto.randomUUID()
        }
    ]);
}