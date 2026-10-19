<script>
    /**
     * Holiday_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * HR Admin only. Each holiday is a separate DB row.
     * Fields: Holiday_Date, Holiday_Name, Holiday_Type, Work_Location, Description
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';

    export let editId      = 'Add';
    export let initialMode = 'View';
    export let onSave      = () => {};

    let Live_Data; $: Live_Data = $Live_Data_Storage; $: user = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    $: isView = Page_Mode === 'View';

    let Page_Mode = editId === 'Add' ? 'Add' : initialMode;
    let loading   = true;
    let saving    = false;

    let D = {
        Holiday_Date: '',
        Holiday_Name: '',
        Holiday_Type: 'Public',
        Work_Location: 'All Locations',
        Description: ''
    };

    const HOLIDAY_TYPES   = ['Public', 'Restricted', 'Optional'];
    const WORK_LOCATIONS  = ['All Locations', 'Head Office', 'Factory'];

    const TYPE_COLORS = {
        Public:     'bg-emerald-100 text-emerald-700',
        Restricted: 'bg-amber-100 text-amber-700',
        Optional:   'bg-sky-100 text-sky-700'
    };

    onMount(async () => {
        if (editId !== 'Add') {
            const res = await post(API_PATHS.API_URL_Get_Holiday_Entry_by_ID, { Edit_ID: editId });
            if (res.Holiday_Data) D = res.Holiday_Data;
        }
        loading = false;
    });

    async function save() {
        if (!D.Holiday_Date)         return alert('Please select a date.');
        if (!D.Holiday_Name?.trim()) return alert('Please enter the holiday name.');

        saving = true;
        const result = await post(API_PATHS.API_URL_Save_Holiday_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            Holiday_Data: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }

    function fmtDate(d) {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' }); }
        catch { return d; }
    }
</script>

<div class="flex items-center justify-between mb-4">
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">
        {#if Page_Mode !== 'Add'}
            {#each ['View', ...(isHRAdmin ? ['Edit'] : [])] as m}
                <button on:click={() => Page_Mode = m}
                    class="px-3 py-1.5 rounded-lg transition-colors {Page_Mode===m ? 'bg-white shadow text-slate-800' : 'text-slate-500'}">{m}</button>
            {/each}
        {:else}<span class="px-3 py-1.5 text-slate-600">New Holiday</span>{/if}
    </div>
</div>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else}
    <div class="space-y-4">
        <!-- Date -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Holiday Date</label>
            {#if isView}<p class="text-sm text-slate-800 py-1">{fmtDate(D.Holiday_Date)}</p>
            {:else}<input type="date" bind:value={D.Holiday_Date}
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>

        <!-- Name -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Holiday Name</label>
            {#if isView}<p class="text-sm text-slate-800 py-1">{D.Holiday_Name || '—'}</p>
            {:else}<input type="text" bind:value={D.Holiday_Name} placeholder="e.g. Republic Day"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>

        <!-- Type + Location row -->
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Type</label>
                {#if isView}
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs font-medium mt-0.5 {TYPE_COLORS[D.Holiday_Type] ?? 'bg-slate-100 text-slate-600'}">
                        {D.Holiday_Type || '—'}
                    </span>
                {:else}
                    <select bind:value={D.Holiday_Type}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        {#each HOLIDAY_TYPES as t}<option value={t}>{t}</option>{/each}
                    </select>
                {/if}
            </div>
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Location</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Work_Location || '—'}</p>
                {:else}
                    <select bind:value={D.Work_Location}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        {#each WORK_LOCATIONS as loc}<option value={loc}>{loc}</option>{/each}
                    </select>
                {/if}
            </div>
        </div>

        <!-- Description -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Description (optional)</label>
            {#if isView}<p class="text-sm text-slate-800 py-1 whitespace-pre-line">{D.Description || '—'}</p>
            {:else}<textarea bind:value={D.Description} rows="2" placeholder="Additional notes…"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"></textarea>{/if}
        </div>
    </div>

    {#if Page_Mode !== 'View' && isHRAdmin}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
            <button on:click={closeModal} class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button on:click={save} disabled={saving}
                class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Add Holiday' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}