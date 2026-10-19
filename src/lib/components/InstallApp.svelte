<!--
  Install control for the AKS HRMS shell.
  Chrome and Edge fire beforeinstallprompt. iPhone has no install event,
  so the button explains Share, then Add to Home Screen.
-->
<script>
    import { onMount } from 'svelte';

    export let tone = 'header';

    let promptEvent = null;
    let installed = false;
    let ios = false;
    let android = false;
    let helpOpen = false;

    function takePrompt() {
        if (window.__hrmsInstallPrompt) promptEvent = window.__hrmsInstallPrompt;
    }

    onMount(() => {
        const media = window.matchMedia('(display-mode: standalone)');
        const syncInstalled = () => {
            installed = media.matches || window.navigator.standalone === true;
        };
        syncInstalled();
        media.addEventListener('change', syncInstalled);

        const ua = window.navigator.userAgent;
        ios = /iPad|iPhone|iPod/.test(ua);
        android = /Android/i.test(ua);
        takePrompt();

        function onPrompt(event) {
            event.preventDefault();
            window.__hrmsInstallPrompt = event;
            promptEvent = event;
        }

        function onInstalled() {
            installed = true;
            promptEvent = null;
            window.__hrmsInstallPrompt = null;
            helpOpen = false;
        }

        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('hrms-install-ready', takePrompt);
        window.addEventListener('appinstalled', onInstalled);

        return () => {
            media.removeEventListener('change', syncInstalled);
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('hrms-install-ready', takePrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    });

    $: canInstall = !installed && (promptEvent !== null || ios || android);

    async function onInstall() {
        const prompt = promptEvent || window.__hrmsInstallPrompt;
        if (!prompt) {
            helpOpen = true;
            return;
        }

        helpOpen = false;
        prompt.prompt();
        try {
            await prompt.userChoice;
        } finally {
            promptEvent = null;
            window.__hrmsInstallPrompt = null;
        }
    }
</script>

{#if canInstall}
    <div class={tone === 'login' ? 'relative mt-4 w-full' : 'relative'}>
        <button
            type="button"
            class={tone === 'login'
                ? 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50'
                : 'inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20'}
            on:click={onInstall}
            aria-expanded={helpOpen}
            aria-label="Install AKS HRMS"
        >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2a.75.75 0 01.75.75v8.69l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V2.75A.75.75 0 0110 2z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            <span class={tone === 'header' ? 'hidden sm:inline' : ''}>Install</span>
        </button>
    </div>
{/if}

{#if helpOpen}
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
        <div class="w-full max-w-sm rounded-2xl bg-white p-5 text-slate-700 shadow-2xl" role="dialog" aria-modal="true">
            <h2 class="text-base font-semibold text-slate-900">Install AKS HRMS</h2>
            {#if ios}
                <p class="mt-2 text-sm leading-relaxed">
                    Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>. This button cannot place the icon by itself.
                </p>
            {:else}
                <p class="mt-2 text-sm leading-relaxed">
                    Tap the <strong>⋮</strong> menu, then <strong>Install</strong>. On an http address Chrome blocks that step. Open the https link, then tap Install here.
                </p>
            {/if}
            <button
                type="button"
                class="mt-4 w-full rounded-xl bg-[#1E2025] px-4 py-2.5 text-sm font-semibold text-white"
                on:click={() => (helpOpen = false)}
            >
                Close
            </button>
        </div>
    </div>
{/if}
