<script>
    import { onMount } from 'svelte';
    import { post } from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS } from '$lib/API_PATHS';
    import { openModal } from '$lib/stores/AKS_HRMS_Modal_Store';
    import RFM_AddEdit from './RFM_AddEdit.svelte';

    let Live_Data; $: Live_Data = $Live_Data_Storage; $: user = Live_Data.User_Information ?? {};
    let records = []; let loading = true; let searchQuery = ''; let filterStatus = 'All';
    let currentPage = 1; const PAGE_SIZE = 10;

    $: filtered = records.filter(r =>
        (filterStatus === 'All' || r.Status === filterStatus) &&
        (!searchQuery || r.Department?.toLowerCase().includes(searchQuery.toLowerCase()) || r.Designation?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    $: totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    $: paged = filtered.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
    $: { searchQuery; filterStatus; currentPage = 1; }

    onMount(async () => { await fetchRecords(); });
    async function fetchRecords() {
        loading = true;
        const res = await post(API_PATHS.API_URL_Get_RFM_Management_Data);
        records = Array.isArray(res) ? res : [];
        loading = false;
    }

    function openAdd() { openModal(RFM_AddEdit, { editId:'Add', onSave:fetchRecords }, { title:'New RFM', size:'xl' }); }
    function openView(id) { openModal(RFM_AddEdit, { editId:id, initialMode:'View', onSave:fetchRecords }, { title:'RFM Details', size:'xl' }); }

    const SC = { New:'bg-slate-100 text-slate-600', Open:'bg-blue-100 text-blue-700', Closed:'bg-emerald-100 text-emerald-700', Cancelled:'bg-red-100 text-red-700' };
</script>

<div class="space-y-3 mb-5">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <div class="relative flex-1 sm:flex-none sm:w-52">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input bind:value={searchQuery} placeholder="Search dept / designation…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/>
        </div>
        <select bind:value={filterStatus} class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
            {#each ['All','New','Open','Closed','Cancelled'] as s}<option value={s}>{s}</option>{/each}
        </select>
        <button on:click={openAdd} class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ New RFM</button>
    </div>
    <p class="text-xs text-slate-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
</div>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else if paged.length === 0}
    <p class="text-center text-sm text-slate-400 py-16">No RFM records found.</p>
{:else}
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table class="w-full text-sm">
            <thead class="bg-slate-50"><tr>
                {#each ['Date','Dept','Designation','Budget','Recv','Short','Offered','Accepted','Status',''] as h}
                    <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">{h}</th>
                {/each}
            </tr></thead>
            <tbody class="divide-y divide-slate-50 bg-white">
                {#each paged as r}
                    <tr class="hover:bg-slate-50/50">
                        <td class="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">{r.RFM_Date ?? '—'}</td>
                        <td class="px-3 py-3 text-slate-700 text-xs">{r.Department ?? '—'}</td>
                        <td class="px-3 py-3 text-slate-700 text-xs">{r.Designation ?? '—'}</td>
                        <td class="px-3 py-3 text-slate-600 text-xs">₹{r.Budget ?? 0}</td>
                        <td class="px-3 py-3 text-slate-600 text-xs text-center">{r.Received ?? 0}</td>
                        <td class="px-3 py-3 text-slate-600 text-xs text-center">{r.Shortlisted ?? 0}</td>
                        <td class="px-3 py-3 text-slate-600 text-xs text-center">{r.Offered ?? 0}</td>
                        <td class="px-3 py-3 text-emerald-700 text-xs font-medium text-center">{r.Accepted ?? 0}</td>
                        <td class="px-3 py-3"><span class="px-2 py-0.5 rounded-full text-[11px] font-medium {SC[r.Status] ?? 'bg-slate-100 text-slate-500'}">{r.Status ?? '—'}</span></td>
                        <td class="px-3 py-3 text-right"><button on:click={() => openView(r.RFM_ID)} class="text-xs text-indigo-600 hover:text-indigo-800">View</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="sm:hidden space-y-2">
        {#each paged as r}
            <button on:click={() => openView(r.RFM_ID)} class="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left hover:shadow-sm active:scale-[0.99]">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-slate-800 text-sm">{r.Department ?? '—'} · {r.Designation ?? '—'}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium {SC[r.Status] ?? ''}">{r.Status ?? '—'}</span>
                </div>
                <p class="text-xs text-slate-500">{r.RFM_Date ?? '—'} · Budget: ₹{r.Budget ?? 0}</p>
                <p class="text-xs text-slate-400 mt-0.5">Recv: {r.Received ?? 0} → Short: {r.Shortlisted ?? 0} → Accepted: {r.Accepted ?? 0}</p>
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