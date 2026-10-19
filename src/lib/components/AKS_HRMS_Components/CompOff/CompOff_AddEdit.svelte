<script>
    /**
     * CompOff_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Employee applies CompOff for a day they were marked 'Absent' in
     * attendance (within last 30 days). Manager/HR approves.
     *
     * New flow:
     *   1. On Add → API returns eligible_dates[] (Absent days, last 30d)
     *   2. Employee picks a date from dropdown (not free date input)
     *   3. Adds description/reason
     *   4. Submits → goes to L1/L2 approval
     *
     * Fields:
     *   CompOff_Date, CompOff_Description, Status
     *   + 2-level approval: Approver, Approval_Date, Approval, Remarks
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';
    import CompOff_List          from './CompOff_List.svelte';

    export let editId      = 'Add';
    export let initialMode = 'View';
    export let onSave      = () => {};

    // Tab state — only used in Add mode. Local; not routed through any store.
    let activeTab = 'new';

    let Live_Data;
    $: Live_Data  = $Live_Data_Storage;
    $: user       = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    $: isView = Page_Mode === 'View';
    $: isEdit = Page_Mode === 'Edit' || Page_Mode === 'Add';

    let Page_Mode = editId === 'Add' ? 'Add' : initialMode;
    let loading   = true;
    let saving    = false;

    // Main data object
    let D = {
        Employee_Self_ID: '',
        Employee_Details: {},
        New_CompOff_Details: {
            CompOff_ID: 'New',
            CompOff_Date: '',
            CompOff_Description: '',
            Status: 'Pending',
            Level1_Approver_ID: '', Level1_Approver: '',
            Level1_Approval_Date: '', Level1_Approval: 'Pending', Level1_Approval_Remarks: '',
            Level2_Approver_ID: '', Level2_Approver: '',
            Level2_Approval_Date: '', Level2_Approval: 'Pending', Level2_Approval_Remarks: ''
        },
        Eligible_Dates: []   // [{ date: 'YYYY-MM-DD', display: 'DD-MM-YYYY (Day)' }]
    };

    // ── Role-aware approval flags ──────────────────────────────────────
    $: isL1Approver = D.New_CompOff_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    $: isL2Approver = D.New_CompOff_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    $: canApprove   = isL1Approver || isL2Approver || isHRAdmin;

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        if (editId === 'Add') {
            D = await post(API_PATHS.API_URL_Add_New_CompOff_Entry_Data, {
                Employee_Self_ID: user.Employee_Self_ID
            });
            Page_Mode = 'Add';
        } else {
            D = await post(API_PATHS.API_URL_Get_CompOff_Entry_Data_by_ID, { Edit_ID: editId });
        }
        loading = false;
    });

    // ── Status calculation ─────────────────────────────────────────────
    function StatusChangeHandler(level) {
        if (!D.New_CompOff_Details) return;
        const l1 = D.New_CompOff_Details.Level1_Approval;
        const l2 = D.New_CompOff_Details.Level2_Approval;
        if      (l1 === 'Rejected' || l2 === 'Rejected') D.New_CompOff_Details.Status = 'Rejected';
        else if (l1 === 'Approved' && l2 === 'Approved')  D.New_CompOff_Details.Status = 'Approved';
        else if (l1 === 'Approved' || l2 === 'Approved')  D.New_CompOff_Details.Status = 'In-Progress';
        else D.New_CompOff_Details.Status = 'Pending';
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        // Validation
        if (Page_Mode === 'Add' && !D.New_CompOff_Details.CompOff_Date) {
            return alert('Please select a CompOff date.');
        }
        if (Page_Mode === 'Add' && !D.New_CompOff_Details.CompOff_Description?.trim()) {
            return alert('Please enter a reason/description.');
        }

        saving = true;
        const result = await post(API_PATHS.API_URL_Save_CompOff_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            CompOff_Details: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }

    // ── Format date for display ────────────────────────────────────────
    function fmtDate(dateStr) {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', weekday: 'short'
            });
        } catch { return dateStr; }
    }
</script>

<!-- ── Mode toggle + role badge ──────────────────────────────────── -->
<div class="flex items-center justify-between mb-4">
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">
        {#if Page_Mode !== 'Add'}
            {#each ['View', ...(isHRAdmin || canApprove ? ['Edit'] : [])] as m}
                <button on:click={() => Page_Mode = m}
                    class="px-3 py-1.5 rounded-lg transition-colors
                        {Page_Mode===m ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">{m}</button>
            {/each}
        {:else}
            <span class="px-3 py-1.5 text-slate-600">New Comp Off Request</span>
        {/if}
    </div>
    {#if canApprove && Page_Mode !== 'Add'}
        <span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl border border-amber-200">
            {isHRAdmin ? 'HR Admin' : isL1Approver ? 'L1 Approver' : 'L2 Approver'}
        </span>
    {/if}
</div>

{#if loading}
    <div class="flex justify-center py-16">
        <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
{:else}

    <!-- ── Employee info strip ───────────────────────────────────── -->
    <div class="bg-slate-50 rounded-2xl px-4 py-3 mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
                <p class="text-sm font-bold text-slate-800">{D.Employee_Details?.Employee_Name ?? '—'}</p>
                <p class="text-xs text-slate-500">
                    {D.Employee_Details?.Employee_Code ?? ''} · {D.Employee_Details?.Department_Name ?? ''} · {D.Employee_Details?.Designation_Name ?? ''}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">
                    L1: {D.New_CompOff_Details?.Level1_Approver ?? '—'} · L2: {D.New_CompOff_Details?.Level2_Approver ?? '—'}
                </p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium shrink-0
                {D.New_CompOff_Details?.Status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                 D.New_CompOff_Details?.Status === 'Rejected' ? 'bg-red-100 text-red-700' :
                 D.New_CompOff_Details?.Status === 'In-Progress' ? 'bg-blue-100 text-blue-700' :
                 'bg-yellow-100 text-yellow-700'}">
                {D.New_CompOff_Details?.Status ?? 'Pending'}
            </span>
        </div>
    </div>

    <!-- ── Tab bar: NEW only ─────────────────────────────────────── -->
    {#if Page_Mode === 'Add'}
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium mb-4 w-fit">
            <button on:click={() => activeTab = 'new'}
                class="px-3 py-1.5 rounded-lg transition-colors
                    {activeTab === 'new' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                New Comp Off Request
            </button>
            <button on:click={() => activeTab = 'table'}
                class="px-3 py-1.5 rounded-lg transition-colors
                    {activeTab === 'table' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                Table View
            </button>
        </div>
    {/if}

    {#if Page_Mode === 'Add' && activeTab === 'table'}
        <!-- Embedded My Requests list. Nested Add button is hidden via :global CSS below. -->
        <div class="embedded-hrms-list">
            <CompOff_List />
        </div>
    {:else}

    <!-- ── CompOff Details ───────────────────────────────────────── -->
    <div class="space-y-4 mb-5">

        <!-- CompOff Date — dropdown of eligible absent dates in Add mode -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">
                CompOff Date
                {#if Page_Mode === 'Add'}
                    <span class="text-slate-400 font-normal">(days marked Absent in last 30 days)</span>
                {/if}
            </label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1">{fmtDate(D.New_CompOff_Details.CompOff_Date)}</p>
            {:else if Page_Mode === 'Add'}
                {#if (D.Eligible_Dates ?? []).length === 0}
                    <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                        No eligible dates found. CompOff can only be applied for days where your attendance was marked as "Absent" within the last 30 days.
                    </div>
                {:else}
                    <select bind:value={D.New_CompOff_Details.CompOff_Date}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">— Select a date —</option>
                        {#each D.Eligible_Dates as ed}
                            <option value={ed.date}>{ed.display}</option>
                        {/each}
                    </select>
                {/if}
            {:else}
                <!-- Edit mode (manager/admin editing) — show date as readonly -->
                <p class="text-sm text-slate-800 py-1 bg-slate-50 rounded-xl px-3">{fmtDate(D.New_CompOff_Details.CompOff_Date)}</p>
            {/if}
        </div>

        <!-- CompOff Description / Reason -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Reason / Description</label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1 whitespace-pre-line">{D.New_CompOff_Details.CompOff_Description || '—'}</p>
            {:else}
                <textarea bind:value={D.New_CompOff_Details.CompOff_Description} rows="3"
                    placeholder="Why should this day be compensated?"
                    disabled={Page_Mode !== 'Add' && !canApprove}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none disabled:bg-slate-50"></textarea>
            {/if}
        </div>
    </div>
    {/if}

    <!-- ── Approval Section ──────────────────────────────────────── -->
    {#if Page_Mode !== 'Add'}
        <div class="border border-slate-100 rounded-2xl overflow-hidden mb-4">
            <div class="bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Approval</div>

            {#each [
                { level: 1,
                  approverKey:  'Level1_Approver',      approverIdKey:  'Level1_Approver_ID',
                  approvalKey:  'Level1_Approval',      dateKey:        'Level1_Approval_Date',
                  remarksKey:   'Level1_Approval_Remarks',
                  enabled:      isL1Approver || isHRAdmin },
                { level: 2,
                  approverKey:  'Level2_Approver',      approverIdKey:  'Level2_Approver_ID',
                  approvalKey:  'Level2_Approval',      dateKey:        'Level2_Approval_Date',
                  remarksKey:   'Level2_Approval_Remarks',
                  enabled:      isL2Approver || isHRAdmin }
            ] as row}
                <div class="px-4 py-3 border-t border-slate-50">
                    <!-- Level header -->
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-xs font-semibold text-slate-700">Level {row.level}: {D.New_CompOff_Details[row.approverKey] ?? '—'}</p>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium
                            {D.New_CompOff_Details[row.approvalKey] === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                             D.New_CompOff_Details[row.approvalKey] === 'Rejected' ? 'bg-red-100 text-red-700' :
                             'bg-yellow-100 text-yellow-700'}">
                            {D.New_CompOff_Details[row.approvalKey] ?? 'Pending'}
                        </span>
                    </div>

                    <!-- Approval fields in a responsive grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <!-- Approval Date -->
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Date</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_CompOff_Details[row.dateKey] || '—'}</p>
                            {:else}
                                <input type="date" bind:value={D.New_CompOff_Details[row.dateKey]}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
                            {/if}
                        </div>

                        <!-- Approval Status -->
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Decision</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_CompOff_Details[row.approvalKey] ?? 'Pending'}</p>
                            {:else}
                                <select bind:value={D.New_CompOff_Details[row.approvalKey]}
                                    on:change={() => StatusChangeHandler(row.level)}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400">
                                    {#each ['Pending','Approved','Rejected'] as s}<option value={s}>{s}</option>{/each}
                                </select>
                            {/if}
                        </div>

                        <!-- Remarks -->
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Remarks</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_CompOff_Details[row.remarksKey] || '—'}</p>
                            {:else}
                                <input type="text" bind:value={D.New_CompOff_Details[row.remarksKey]}
                                    placeholder="Optional remarks"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- ── Action bar ────────────────────────────────────────────── -->
    {#if Page_Mode !== 'View' && !(Page_Mode === 'Add' && activeTab === 'table')}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button on:click={closeModal}
                class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button on:click={save} disabled={saving || (Page_Mode === 'Add' && (D.Eligible_Dates ?? []).length === 0)}
                class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Submit Request' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}

<style>
    /* Hide nested Add button inside embedded *_List to prevent nested modal */
    :global(.embedded-hrms-list button.sm\:ml-auto) { display: none !important; }
</style>