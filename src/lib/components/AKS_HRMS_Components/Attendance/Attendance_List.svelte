<script>
    /**
     * Attendance_List.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Searchable attendance records list with:
     *   - Month filter (triggers re-fetch)
     *   - Status filter (client-side)
     *   - Employee search (HR Admin sees all, employee sees own)
     *   - Upload button for HR Admin (biometric Excel import)
     *   - Add/View entry modal launcher
     */

    import { onMount }       from 'svelte';
    import { post }          from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }     from '$lib/API_PATHS';
    import { openModal }     from '$lib/stores/AKS_HRMS_Modal_Store';
    import Attendance_AddEdit from './Attendance_AddEdit.svelte';

    let Live_Data;
    $: Live_Data  = $Live_Data_Storage;
    $: user       = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    let records      = [];
    let loading      = true;
    let searchQuery  = '';
    let filterStatus = 'All';
    let uploading    = false;
    let uploadMsg    = '';

    let currentPage = 1;
    const PAGE_SIZE = 15;

    $: filtered = records.filter(r =>
        (filterStatus === 'All' || r.Status === filterStatus) &&
        (!searchQuery || r.Employee_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.Employee_Code?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    $: totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    $: paged      = filtered.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
    $: { searchQuery; filterStatus; currentPage = 1; }

    // ── Data fetch ─────────────────────────────────────────────────────
    onMount(async () => { await fetchRecords(); });

    async function fetchRecords() {
        loading = true;
        const res = await post(API_PATHS.API_URL_Get_Attendance_Management_Data, {
            Employee_Self_ID: isHRAdmin ? null : user.Employee_Self_ID
        });
        records = Array.isArray(res) ? res : [];
        loading = false;
    }

    // ── Actions ────────────────────────────────────────────────────────
    function openAdd() {
        openModal(Attendance_AddEdit, { editId: 'Add', onSave: fetchRecords }, { title: 'Add Attendance Entry', size: 'xl' });
    }
    function openView(id) {
        openModal(Attendance_AddEdit, { editId: id, initialMode: 'View', onSave: fetchRecords }, { title: 'Attendance Entry', size: 'xl' });
    }

    // ── Biometric CSV/Excel Upload (HR Admin) ─────────────────────────
    let fileInput;

    async function handleUpload() {
        const file = fileInput?.files?.[0];
        if (!file) return alert('Please select a file.');
        uploading = true;
        uploadMsg = '';

        const formData = new FormData();
        formData.append('attendanceFile', file);
        formData.append('User_Information', JSON.stringify(user));

        try {
            const res = await fetch(API_PATHS.API_URL_Process_Attendance_Data_Sheet, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            uploadMsg = result.Comments ?? result.message ?? 'Done';
        } catch (e) {
            console.error(e);
            uploadMsg = 'Upload failed.';
        }

        uploading = false;
        if (fileInput) fileInput.value = '';
        await fetchRecords();
    }

    const STATUS_COLORS = {
        Present:  'bg-emerald-100 text-emerald-700',
        Absent:   'bg-rose-100 text-rose-700',
        Leave:    'bg-amber-100 text-amber-700',
        OD:       'bg-sky-100 text-sky-700',
        Holiday:  'bg-violet-100 text-violet-700',
        New:      'bg-slate-100 text-slate-600',
        'Week Off':'bg-indigo-100 text-indigo-600'
    };
</script>

<!-- ── Header: Search + Filters + Actions ──────────────────────── -->
<div class="space-y-3 mb-5">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
        {#if isHRAdmin}
            <div class="relative flex-1 sm:flex-none sm:w-52">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input bind:value={searchQuery} placeholder="Search name or code…"
                    class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
        {/if}
        <select bind:value={filterStatus}
            class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
            {#each ['All','Present','Absent','Leave','OD','Holiday','Week Off','New'] as s}
                <option value={s}>{s}</option>
            {/each}
        </select>

        <div class="sm:ml-auto flex gap-2">
            {#if isHRAdmin}
                <button on:click={openAdd}
                    class="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">
                    + Add Entry
                </button>
            {/if}
        </div>
    </div>

    <!-- Upload section (HR Admin only) -->
    {#if isHRAdmin}
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center gap-2 flex-1 min-w-0">
                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <input bind:this={fileInput} type="file" accept=".csv,.xlsx,.xls"
                    class="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white file:text-slate-700 file:shadow-sm file:cursor-pointer"/>
            </div>
            <button on:click={handleUpload} disabled={uploading}
                class="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">
                {uploading ? 'Processing…' : 'Upload Attendance Data'}
            </button>
        </div>
        {#if uploadMsg}
            <p class="text-xs {uploadMsg.includes('Not') ? 'text-amber-600' : 'text-emerald-600'} px-1">{uploadMsg}</p>
        {/if}
    {/if}

    <p class="text-xs text-slate-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
</div>

<!-- ── Table / Cards ───────────────────────────────────────────── -->
{#if loading}
    <div class="flex justify-center py-16">
        <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
{:else if paged.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg class="w-10 h-10 mb-2 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <p class="text-sm">No attendance records found.</p>
    </div>
{:else}
    <!-- Desktop table -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table class="w-full text-sm">
            <thead class="bg-slate-50"><tr>
                {#each ['Date','Employee','Code','Dept','Type','Status','Remarks',''] as h}
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                {/each}
            </tr></thead>
            <tbody class="divide-y divide-slate-50 bg-white">
                {#each paged as r}
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{r.Attendance_Date ?? '—'}</td>
                        <td class="px-4 py-3 font-medium text-slate-800">{r.Employee_Name ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-500 font-mono text-xs">{r.Employee_Code ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-500 text-xs">{r.Department_Name ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-600 text-xs">{r.Attendance_Type_Name ?? '—'}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-medium {STATUS_COLORS[r.Status] ?? 'bg-slate-100 text-slate-500'}">
                                {r.Status ?? '—'}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-slate-400 text-xs max-w-[150px] truncate">{r.Remarks ?? ''}</td>
                        <td class="px-4 py-3 text-right">
                            <button on:click={() => openView(r.Attendance_ID)}
                                class="text-xs text-indigo-600 hover:text-indigo-800">View</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden space-y-2">
        {#each paged as r}
            <button on:click={() => openView(r.Attendance_ID)}
                class="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left hover:shadow-sm active:scale-[0.99]">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-slate-800 text-sm">{r.Employee_Name ?? '—'}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium {STATUS_COLORS[r.Status] ?? ''}">
                        {r.Status ?? '—'}
                    </span>
                </div>
                <p class="text-xs text-slate-500">{r.Attendance_Date ?? '—'} · {r.Attendance_Type_Name ?? '—'}</p>
                <p class="text-xs text-slate-400 font-mono mt-0.5">{r.Employee_Code ?? '—'} · {r.Department_Name ?? ''}</p>
            </button>
        {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>{(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div class="flex gap-1">
                <button on:click={() => currentPage = Math.max(1, currentPage-1)} disabled={currentPage===1}
                    class="px-2.5 py-1.5 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200">← Prev</button>
                <button on:click={() => currentPage = Math.min(totalPages, currentPage+1)} disabled={currentPage===totalPages}
                    class="px-2.5 py-1.5 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200">Next →</button>
            </div>
        </div>
    {/if}
{/if}