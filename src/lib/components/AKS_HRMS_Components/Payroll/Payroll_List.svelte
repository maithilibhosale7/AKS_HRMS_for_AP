<script>
    /**
     * Payroll_List.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * HR Admin:
     *   1. Select month → "Download Attendance Data" (Excel for payroll computation)
     *   2. Process payroll manually in Excel
     *   3. "Upload Final Payroll" (Excel → creates Payroll_Entry per employee)
     *   4. View/manage all payslips
     *
     * Employee: sees own payslips only
     */

    import { onMount }       from 'svelte';
    import { post }          from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }     from '$lib/API_PATHS';
    import { openModal }     from '$lib/stores/AKS_HRMS_Modal_Store';
    import Payroll_AddEdit   from './Payroll_AddEdit.svelte';

    let Live_Data; $: Live_Data = $Live_Data_Storage; $: user = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    let records      = [];
    let loading      = true;
    let searchQuery  = '';
    let filterMonth  = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Upload state
    let uploading    = false;
    let uploadMsg    = '';
    let fileInput;

    // Download state
    let downloading  = false;
    let downloadMonth = new Date().toISOString().slice(0, 7);

    let currentPage = 1;
    const PAGE_SIZE = 10;

    $: filtered = records.filter(r =>
        (!searchQuery || r.Employee_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.Employee_Code?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!filterMonth || r.Payroll_Description?.includes(filterMonth))
    );
    $: totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    $: paged      = filtered.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
    $: { searchQuery; filterMonth; currentPage = 1; }

    onMount(async () => { await fetchRecords(); });

    async function fetchRecords() {
        loading = true;
        const res = await post(API_PATHS.API_URL_Get_Payroll_Management_Table_Data, {
            Employee_Self_ID: isHRAdmin ? null : user.Employee_Self_ID
        });
        records = Array.isArray(res) ? res : [];
        loading = false;
    }

    function openView(id) {
        openModal(Payroll_AddEdit, { editId: id, initialMode: 'View', onSave: fetchRecords }, { title: 'Payslip', size: 'xl' });
    }

    // ── Download Attendance Data (Excel) ───────────────────────────────
    async function downloadAttendanceData() {
        if (!downloadMonth) return alert('Please select a month.');
        downloading = true;

        // Build start/end dates from month picker
        const [year, month] = downloadMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2,'0')}`;

        try {
            const res = await fetch(API_PATHS.API_URL_Download_Attendance_for_Payroll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Start_Date: startDate, End_Date: endDate, Month_Label: downloadMonth })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href     = url;
                a.download = `Attendance_Data_${downloadMonth}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                alert('Failed to download attendance data.');
            }
        } catch (e) { console.error(e); alert('Download failed.'); }
        downloading = false;
    }

    // ── Upload Final Payroll (Excel) ───────────────────────────────────
    async function handleUpload() {
        const file = fileInput?.files?.[0];
        if (!file) return alert('Please select a file.');
        uploading = true;
        uploadMsg = '';

        const formData = new FormData();
        formData.append('payrollFile', file);
        formData.append('Payroll_Month', filterMonth);
        formData.append('User_Information', JSON.stringify(user));

        try {
            const res = await fetch(API_PATHS.API_URL_Upload_Final_Payroll_Data, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            uploadMsg = result.Comments ?? result.message ?? 'Done';
            if (fileInput) fileInput.value = '';
            await fetchRecords();
        } catch (e) { console.error(e); uploadMsg = 'Upload failed.'; }
        uploading = false;
    }

    function fmtCurrency(v) {
        if (!v && v !== 0) return '—';
        return '₹' + Number(v).toLocaleString('en-IN');
    }
</script>

<div class="space-y-3 mb-5">
    <!-- Row 1: Search + Month + View payslip (employee) -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        {#if isHRAdmin}
            <div class="relative flex-1 sm:flex-none sm:w-48">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input bind:value={searchQuery} placeholder="Search name or code…"
                    class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
        {/if}
        <input type="month" bind:value={filterMonth}
            class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
    </div>

    <!-- Row 2: HR Admin actions (Download Attendance + Upload Payroll) -->
    {#if isHRAdmin}
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <!-- Download section -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <p class="text-xs font-medium text-slate-600 shrink-0">Step 1: Download Attendance</p>
                <input type="month" bind:value={downloadMonth}
                    class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-indigo-400"/>
                <button on:click={downloadAttendanceData} disabled={downloading}
                    class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f] disabled:opacity-50 whitespace-nowrap">
                    {downloading ? 'Downloading…' : '⬇ Download Attendance Excel'}
                </button>
            </div>

            <!-- Upload section -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t border-slate-200">
                <p class="text-xs font-medium text-slate-600 shrink-0">Step 2: Upload Final Payroll</p>
                <input bind:this={fileInput} type="file" accept=".xlsx,.xls"
                    class="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white file:text-slate-700 file:shadow-sm"/>
                <button on:click={handleUpload} disabled={uploading}
                    class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">
                    {uploading ? 'Processing…' : '⬆ Upload Payroll Excel'}
                </button>
            </div>
            {#if uploadMsg}
                <p class="text-xs {uploadMsg.includes('fail') || uploadMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}">{uploadMsg}</p>
            {/if}
        </div>
    {/if}

    <p class="text-xs text-slate-400">{filtered.length} payslip{filtered.length !== 1 ? 's' : ''}</p>
</div>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else if paged.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg class="w-10 h-10 mb-2 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
        </svg>
        <p class="text-sm">No payslips found.</p>
    </div>
{:else}
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table class="w-full text-sm">
            <thead class="bg-slate-50"><tr>
                {#each ['Employee','Code','Period','Gross','Deductions','Net Pay',''] as h}
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                {/each}
            </tr></thead>
            <tbody class="divide-y divide-slate-50 bg-white">
                {#each paged as r}
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-4 py-3 font-medium text-slate-800">{r.Employee_Name ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-500 font-mono text-xs">{r.Employee_Code ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-600 text-xs">{r.Payroll_Description ?? '—'}</td>
                        <td class="px-4 py-3 text-emerald-700 text-xs font-medium">{fmtCurrency(r.Gross_Salary)}</td>
                        <td class="px-4 py-3 text-rose-700 text-xs">{fmtCurrency(r.Total_Deductions)}</td>
                        <td class="px-4 py-3 text-indigo-700 text-xs font-bold">{fmtCurrency(r.Net_Pay)}</td>
                        <td class="px-4 py-3 text-right">
                            <button on:click={() => openView(r.Payroll_ID)} class="text-xs text-indigo-600 hover:text-indigo-800">View</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="sm:hidden space-y-2">
        {#each paged as r}
            <button on:click={() => openView(r.Payroll_ID)}
                class="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left hover:shadow-sm active:scale-[0.99]">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-slate-800 text-sm">{r.Employee_Name ?? '—'}</span>
                    <span class="text-xs font-bold text-indigo-700">{fmtCurrency(r.Net_Pay)}</span>
                </div>
                <p class="text-xs text-slate-500">{r.Payroll_Description ?? '—'} · {r.Employee_Code ?? ''}</p>
                <p class="text-xs text-slate-400 mt-0.5">Gross: {fmtCurrency(r.Gross_Salary)} · Ded: {fmtCurrency(r.Total_Deductions)}</p>
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