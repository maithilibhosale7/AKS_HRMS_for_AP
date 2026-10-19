<script>
    /**
     * Holiday_List.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Lists all holidays as individual entries. Year + Type filters.
     * Everyone can view; HR Admin can add/edit.
     */

    import { onMount }       from 'svelte';
    import { post }          from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }     from '$lib/API_PATHS';
    import { openModal }     from '$lib/stores/AKS_HRMS_Modal_Store';
    import Holiday_AddEdit   from './Holiday_AddEdit.svelte';

    let Live_Data; $: Live_Data = $Live_Data_Storage; $: user = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    let records      = [];
    let loading      = true;
    let searchQuery  = '';
    let filterType   = 'All';
    let filterYear   = String(new Date().getFullYear());

    let currentPage = 1;
    const PAGE_SIZE = 15;

    $: filtered = records.filter(r => {
        const matchesType   = filterType === 'All' || r.Holiday_Type === filterType;
        const matchesSearch = !searchQuery || r.Holiday_Name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear   = !filterYear || r.Holiday_Date?.includes(filterYear);
        return matchesType && matchesSearch && matchesYear;
    });
    $: totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    $: paged      = filtered.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
    $: { searchQuery; filterType; filterYear; currentPage = 1; }

    onMount(async () => { await fetchRecords(); });

    async function fetchRecords() {
        loading = true;
        const res = await post(API_PATHS.API_URL_Get_Holiday_List_Data);
        records = Array.isArray(res) ? res : [];
        loading = false;
    }

    function openAdd() {
        openModal(Holiday_AddEdit, { editId: 'Add', onSave: fetchRecords }, { title: 'Add Holiday', size: 'md' });
    }
    function openView(id) {
        openModal(Holiday_AddEdit, { editId: id, initialMode: 'View', onSave: fetchRecords }, { title: 'Holiday Details', size: 'md' });
    }

    const TYPE_COLORS = {
        Public:     'bg-emerald-100 text-emerald-700',
        Restricted: 'bg-amber-100 text-amber-700',
        Optional:   'bg-sky-100 text-sky-700'
    };

    function fmtDate(d) {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short' }); }
        catch { return d; }
    }
</script>

<div class="space-y-3 mb-5">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <div class="relative flex-1 sm:flex-none sm:w-48">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input bind:value={searchQuery} placeholder="Search holiday…"
                class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/>
        </div>
        <select bind:value={filterType}
            class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
            {#each ['All','Public','Restricted','Optional'] as t}<option value={t}>{t}</option>{/each}
        </select>
        <select bind:value={filterYear}
            class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
            {#each [String(new Date().getFullYear()), String(new Date().getFullYear() - 1), String(new Date().getFullYear() + 1)] as y}
                <option value={y}>{y}</option>
            {/each}
        </select>
        {#if isHRAdmin}
            <button on:click={openAdd}
                class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">
                + Add Holiday
            </button>
        {/if}
    </div>
    <p class="text-xs text-slate-400">{filtered.length} holiday{filtered.length !== 1 ? 's' : ''} in {filterYear}</p>
</div>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else if paged.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg class="w-10 h-10 mb-2 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M16 19h6m-3-3v6"/>
        </svg>
        <p class="text-sm">No holidays found for {filterYear}.</p>
    </div>
{:else}
    <!-- Desktop table -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table class="w-full text-sm">
            <thead class="bg-slate-50"><tr>
                {#each ['Date','Day','Holiday Name','Type','Location',''] as h}
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                {/each}
            </tr></thead>
            <tbody class="divide-y divide-slate-50 bg-white">
                {#each paged as r}
                    {@const dateObj = r.Holiday_Date ? new Date(r.Holiday_Date) : null}
                    {@const dayName = dateObj ? dateObj.toLocaleDateString('en-IN', { weekday:'short' }) : '—'}
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmtDate(r.Holiday_Date)}</td>
                        <td class="px-4 py-3 text-slate-400 text-xs">{dayName}</td>
                        <td class="px-4 py-3 font-medium text-slate-800">{r.Holiday_Name ?? '—'}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-medium {TYPE_COLORS[r.Holiday_Type] ?? 'bg-slate-100 text-slate-500'}">
                                {r.Holiday_Type ?? '—'}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-slate-500 text-xs">{r.Work_Location ?? '—'}</td>
                        <td class="px-4 py-3 text-right">
                            <button on:click={() => openView(r.Holiday_ID)} class="text-xs text-indigo-600 hover:text-indigo-800">
                                {isHRAdmin ? 'Edit' : 'View'}
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden space-y-2">
        {#each paged as r}
            <button on:click={() => openView(r.Holiday_ID)}
                class="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left hover:shadow-sm active:scale-[0.99]">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-slate-800 text-sm">{r.Holiday_Name ?? '—'}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium {TYPE_COLORS[r.Holiday_Type] ?? ''}">
                        {r.Holiday_Type ?? '—'}
                    </span>
                </div>
                <p class="text-xs text-slate-500">{fmtDate(r.Holiday_Date)} · {r.Work_Location ?? ''}</p>
            </button>
        {/each}
    </div>

    {#if totalPages > 1}
        <div class="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>{(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div class="flex gap-1">
                <button on:click={() => currentPage = Math.max(1, currentPage-1)} disabled={currentPage===1} class="px-2.5 py-1.5 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200">← Prev</button>
                <button on:click={() => currentPage = Math.min(totalPages, currentPage+1)} disabled={currentPage===totalPages} class="px-2.5 py-1.5 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200">Next →</button>
            </div>
        </div>
    {/if}
{/if}