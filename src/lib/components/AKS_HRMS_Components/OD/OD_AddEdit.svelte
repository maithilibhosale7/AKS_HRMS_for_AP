<script>
    /**
     * OD_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Employee requests On Duty for a date range; Manager/HR approves.
     *
     * Fields:
     *   OD_Type (Pre-approved / Regularisation)
     *   OD_Start_Date, OD_End_Date → Number_of_Days (excl weekly off)
     *   In_Time, Out_Time
     *   OD_Description (purpose/location)
     *   2-level approval
     *
     * Weekly off exclusion: same WEEKLY_OFF_DAY constant as Leave.
     * TODO: Make dynamic per employee Work_Location (HO=Sun, Factory=Fri)
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';
    // FIX (P2): Added attachment support for OD (e.g., client approval letter)
    import AKS_HRMS_Attachment   from '$lib/components/AKS_HRMS_Components/Shared/AKS_HRMS_Attachment.svelte';
    import OD_List               from './OD_List.svelte';

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

    // ── Weekly off configuration ───────────────────────────────────────
    // FIX (P1): Replaced hardcoded constant with dynamic value from Employee_Details
    $: WEEKLY_OFF_DAY = D.Employee_Details?.Weekly_Off_Day ?? 0;

    // Main data object
    let D = {
        Employee_Self_ID: '',
        Employee_Details: {},
        New_OD_Details: {
            OD_ID: 'New',
            OD_Type: '',
            OD_Start_Date: '', OD_End_Date: '',
            Number_of_Days: 0,
            In_Time: '', Out_Time: '',
            OD_Description: '',
            Status: 'Pending',
            Level1_Approver_ID: '', Level1_Approver: '',
            Level1_Approval_Date: '', Level1_Approval: 'Pending', Level1_Approval_Remarks: '',
            Level2_Approver_ID: '', Level2_Approver: '',
            Level2_Approval_Date: '', Level2_Approval: 'Pending', Level2_Approval_Remarks: ''
        }
    };

    // ── Role-aware approval ────────────────────────────────────────────
    $: isL1Approver = D.New_OD_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    $: isL2Approver = D.New_OD_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    $: canApprove   = isL1Approver || isL2Approver || isHRAdmin;

    // ── OD Type options ────────────────────────────────────────────────
    const OD_TYPES = ['Pre-approved', 'Regularisation'];

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        if (editId === 'Add') {
            D = await post(API_PATHS.API_URL_Add_New_OD_Entry_Data, {
                Employee_Self_ID: user.Employee_Self_ID
            });
            Page_Mode = 'Add';
        } else {
            D = await post(API_PATHS.API_URL_Get_OD_Entry_Data_by_ID, { Edit_ID: editId });
        }
        loading = false;
    });

    // ── Day count calculation (same logic as Leave) ────────────────────
    function recalcDays() {
        const startStr = D.New_OD_Details.OD_Start_Date;
        const endStr   = D.New_OD_Details.OD_End_Date;

        if (!startStr || !endStr) {
            D.New_OD_Details.Number_of_Days = 0;
            D = { ...D };
            return;
        }

        const start = new Date(startStr);
        const end   = new Date(endStr);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            D.New_OD_Details.Number_of_Days = 0;
            if (start > end) D.New_OD_Details.OD_End_Date = '';
            D = { ...D };
            return;
        }

        let count = 0;
        const cursor = new Date(start);
        while (cursor <= end) {
            if (cursor.getDay() !== WEEKLY_OFF_DAY) count++;
            cursor.setDate(cursor.getDate() + 1);
        }

        D.New_OD_Details.Number_of_Days = count;
        D = { ...D };
    }

    function onDateChange() { recalcDays(); }

    // ── Status calculation ─────────────────────────────────────────────
    function StatusChangeHandler(level) {
        if (!D.New_OD_Details) return;
        const l1 = D.New_OD_Details.Level1_Approval;
        const l2 = D.New_OD_Details.Level2_Approval;
        if      (l1 === 'Rejected' || l2 === 'Rejected') D.New_OD_Details.Status = 'Rejected';
        else if (l1 === 'Approved' && l2 === 'Approved')  D.New_OD_Details.Status = 'Approved';
        else if (l1 === 'Approved' || l2 === 'Approved')  D.New_OD_Details.Status = 'In-Progress';
        else D.New_OD_Details.Status = 'Pending';
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        if (Page_Mode === 'Add') {
            if (!D.New_OD_Details.OD_Type)         return alert('Please select an OD type.');
            if (!D.New_OD_Details.OD_Start_Date)   return alert('Please select a start date.');
            if (!D.New_OD_Details.OD_End_Date)     return alert('Please select an end date.');
            if (!D.New_OD_Details.OD_Description?.trim()) return alert('Please enter a purpose/description.');
        }

        saving = true;
        const result = await post(API_PATHS.API_URL_Save_OD_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            OD_Details: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }

    function fmtDate(d) {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
        catch { return d; }
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
            <span class="px-3 py-1.5 text-slate-600">New On Duty Request</span>
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
                <p class="text-xs text-slate-400">
                    L1: {D.New_OD_Details?.Level1_Approver ?? '—'} · L2: {D.New_OD_Details?.Level2_Approver ?? '—'}
                </p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium shrink-0
                {D.New_OD_Details?.Status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                 D.New_OD_Details?.Status === 'Rejected' ? 'bg-red-100 text-red-700' :
                 D.New_OD_Details?.Status === 'In-Progress' ? 'bg-blue-100 text-blue-700' :
                 'bg-yellow-100 text-yellow-700'}">
                {D.New_OD_Details?.Status ?? 'Pending'}
            </span>
        </div>
    </div>

    <!-- ── Tab bar: NEW only ─────────────────────────────────────── -->
    {#if Page_Mode === 'Add'}
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium mb-4 w-fit">
            <button on:click={() => activeTab = 'new'}
                class="px-3 py-1.5 rounded-lg transition-colors
                    {activeTab === 'new' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                New On Duty Request
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
            <OD_List />
        </div>
    {:else}

    <!-- ── OD Details ────────────────────────────────────────────── -->
    <div class="space-y-4 mb-5">

        <!-- OD Type -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">OD Type</label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1">{D.New_OD_Details.OD_Type || '—'}</p>
            {:else}
                <select bind:value={D.New_OD_Details.OD_Type}
                    disabled={Page_Mode !== 'Add'}
                    class="w-full sm:w-64 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 disabled:bg-slate-50">
                    <option value="">Select OD Type</option>
                    {#each OD_TYPES as t}<option value={t}>{t}</option>{/each}
                </select>
            {/if}
        </div>

        <!-- Date range + Day count -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Start Date</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{fmtDate(D.New_OD_Details.OD_Start_Date)}</p>
                {:else}<input type="date" bind:value={D.New_OD_Details.OD_Start_Date} on:change={onDateChange}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">End Date</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{fmtDate(D.New_OD_Details.OD_End_Date)}</p>
                {:else}<input type="date" bind:value={D.New_OD_Details.OD_End_Date} on:change={onDateChange}
                    min={D.New_OD_Details.OD_Start_Date || ''}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Days</label>
                <p class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800">
                    {D.New_OD_Details.Number_of_Days ?? 0}
                </p>
            </div>
            <div class="hidden sm:block"></div>
        </div>

        {#if isEdit && D.New_OD_Details.OD_Start_Date && D.New_OD_Details.OD_End_Date}
            <p class="text-[10px] text-slate-400 -mt-2">
                {WEEKLY_OFF_DAY === 0 ? 'Sundays' : 'Fridays'} are excluded from the day count.
            </p>
        {/if}

        <!-- In/Out Time -->
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">In Time</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.New_OD_Details.In_Time || '—'}</p>
                {:else}<input type="time" bind:value={D.New_OD_Details.In_Time}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Out Time</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.New_OD_Details.Out_Time || '—'}</p>
                {:else}<input type="time" bind:value={D.New_OD_Details.Out_Time}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
        </div>

        <!-- Description / Purpose -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Purpose / Description</label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1 whitespace-pre-line">{D.New_OD_Details.OD_Description || '—'}</p>
            {:else}
                <textarea bind:value={D.New_OD_Details.OD_Description} rows="3"
                    placeholder="Describe the purpose of On Duty and location"
                    disabled={Page_Mode !== 'Add' && !canApprove}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none disabled:bg-slate-50"></textarea>
            {/if}
        </div>
    </div>

    <!-- ── Attachments ─────────────────────────────────────────── -->
    <!-- FIX (P2): OD requests can now attach supporting documents -->
    <div class="mb-4">
        <AKS_HRMS_Attachment
            Module_Name="OD_Entry"
            Record_ID={editId}
            Editable={isEdit}
        />
    </div>
    {/if}

    <!-- ── Approval Section ──────────────────────────────────────── -->
    {#if Page_Mode !== 'Add'}
        <div class="border border-slate-100 rounded-2xl overflow-hidden mb-4">
            <div class="bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Approval</div>
            {#each [
                { level: 1, approverKey: 'Level1_Approver', approverIdKey: 'Level1_Approver_ID',
                  approvalKey: 'Level1_Approval', dateKey: 'Level1_Approval_Date',
                  remarksKey: 'Level1_Approval_Remarks', enabled: isL1Approver || isHRAdmin },
                { level: 2, approverKey: 'Level2_Approver', approverIdKey: 'Level2_Approver_ID',
                  approvalKey: 'Level2_Approval', dateKey: 'Level2_Approval_Date',
                  remarksKey: 'Level2_Approval_Remarks', enabled: isL2Approver || isHRAdmin }
            ] as row}
                <div class="px-4 py-3 border-t border-slate-50">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-xs font-semibold text-slate-700">Level {row.level}: {D.New_OD_Details[row.approverKey] ?? '—'}</p>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium
                            {D.New_OD_Details[row.approvalKey] === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                             D.New_OD_Details[row.approvalKey] === 'Rejected' ? 'bg-red-100 text-red-700' :
                             'bg-yellow-100 text-yellow-700'}">
                            {D.New_OD_Details[row.approvalKey] ?? 'Pending'}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Date</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_OD_Details[row.dateKey] || '—'}</p>
                            {:else}
                                <input type="date" bind:value={D.New_OD_Details[row.dateKey]}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Decision</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_OD_Details[row.approvalKey] ?? 'Pending'}</p>
                            {:else}
                                <select bind:value={D.New_OD_Details[row.approvalKey]}
                                    on:change={() => StatusChangeHandler(row.level)}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400">
                                    {#each ['Pending','Approved','Rejected'] as s}<option value={s}>{s}</option>{/each}
                                </select>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Remarks</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_OD_Details[row.remarksKey] || '—'}</p>
                            {:else}
                                <input type="text" bind:value={D.New_OD_Details[row.remarksKey]} placeholder="Optional"
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
            <button on:click={save} disabled={saving}
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