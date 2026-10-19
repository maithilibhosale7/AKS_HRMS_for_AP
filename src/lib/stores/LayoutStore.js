import { writable } from 'svelte/store';
export const isSidebarOpen = writable(true); // Default open on desktop
export const isLoaderOpen = writable(false); // Default closed