<script>
    /**
     * Leave_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Employee applies leave; Manager/HR approves. Role-aware.
     *
     * Features:
     *   - Leave type dropdown (from employee's Leave_Balance)
     *     with available balance shown inline
     *   - Half-day option: Start half-day (PM) / End half-day (AM)
     *   - Auto day count excluding Sundays (HO rule; Factory = Friday
     *     exclusion — configurable via WEEKLY_OFF constant)
     *   - Balance warning: red when days > balance, blue when days = balance
     *   - Leave balance summary table
     *   - 2-level approval with per-level date, decision, remarks
     *   - Reason/remarks field
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';
    import Leave_List            from './Leave_List.svelte';

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
        Leave_Balance: {},       // { Leave_Type_ID: { Leave_Type_Name, Assigned_Count, Leave_Balance, ... } }
        New_Leave_Details: {
            Start_Date: '', End_Date: '',
            Leave_Type_ID: '', Leave_Type_Name: '',
            Number_of_Days: 0, Number_of_Days_Styling: '',
            Half_Day_Start: false, Half_Day_End: false,
            Reason_for_Leave: '',
            Status: 'Pending',
            Level1_Approver_ID: '', Level1_Approver: '',
            Level1_Approval_Date: '', Level1_Approval: 'Pending', Level1_Approval_Remarks: '',
            Level2_Approver_ID: '', Level2_Approver: '',
            Level2_Approval_Date: '', Level2_Approval: 'Pending', Level2_Approval_Remarks: ''
        }
    };

    // ── Weekly off configuration ───────────────────────────────────────
    // FIX (P1): Replaced hardcoded WEEKLY_OFF_DAY = 0 with dynamic value from Employee_Details.
    // The backend should return Weekly_Off_Day in Employee_Details (from Work_Location_Master).
    // Falls back to 0 (Sunday) if not set.
    $: WEEKLY_OFF_DAY = D.Employee_Details?.Weekly_Off_Day ?? 0;

    // ── Holiday data (for day-count exclusion) ────────────────────────
    // FIX (P1): Holidays were NOT excluded from leave day count.
    // Now fetched on mount and checked in recalcDays().
    let holidays = [];  // Array of date strings: ['2025-01-26', '2025-08-15', ...]

    // ── Role-aware approval ────────────────────────────────────────────
    $: isL1Approver = D.New_Leave_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    $: isL2Approver = D.New_Leave_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    $: canApprove   = isL1Approver || isL2Approver || isHRAdmin;

    // ── Derived: selected leave type balance ───────────────────────────
    $: selectedLeaveBalance = D.Leave_Balance?.[D.New_Leave_Details?.Leave_Type_ID] ?? null;
    $: availableBalance     = selectedLeaveBalance?.Leave_Balance ?? 0;

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        // FIX (P1): Fetch holidays so recalcDays() can exclude them
        try {
            const holidayData = await post(API_PATHS.API_URL_Get_Holiday_Calendar_Data);
            if (Array.isArray(holidayData)) {
                holidays = holidayData.map(h => h.Holiday_Date);
            }
        } catch (err) { console.error('Holiday fetch error:', err); }

        if (editId === 'Add') {
            D = await post(API_PATHS.API_URL_Add_New_Leave_Entry_Data, {
                Employee_Self_ID: user.Employee_Self_ID
            });
            Page_Mode = 'Add';
        } else {
            D = await post(API_PATHS.API_URL_Get_Leave_Entry_Data_by_ID, { Edit_ID: editId });
        }
        loading = false;
    });

    // ── Leave type change ──────────────────────────────────────────────
    function onLeaveTypeChange() {
        const lb = D.Leave_Balance?.[D.New_Leave_Details.Leave_Type_ID];
        D.New_Leave_Details.Leave_Type_Name = lb?.Leave_Type_Name ?? '';
        recalcDays();
    }

    // ── Day count calculation ──────────────────────────────────────────
    /**
     * Counts working days between Start_Date and End_Date (inclusive),
     * excluding the configured weekly off day.
     * Adjusts for half-day start/end (each subtracts 0.5).
     */
    function recalcDays() {
        const startStr = D.New_Leave_Details.Start_Date;
        const endStr   = D.New_Leave_Details.End_Date;

        if (!startStr || !endStr) {
            D.New_Leave_Details.Number_of_Days = 0;
            D.New_Leave_Details.Number_of_Days_Styling = '';
            D = { ...D };
            return;
        }

        const start = new Date(startStr);
        const end   = new Date(endStr);

        // Validate
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            D.New_Leave_Details.Number_of_Days = 0;
            D = { ...D };
            return;
        }

        if (start > end) {
            D.New_Leave_Details.End_Date = '';
            D.New_Leave_Details.Number_of_Days = 0;
            D = { ...D };
            return;
        }

        // Count days excluding weekly off AND holidays
        // FIX (P1): Added holiday exclusion — previously only weekly off was excluded
        let count = 0;
        const cursor = new Date(start);
        while (cursor <= end) {
            const dayOfWeek = cursor.getDay();
            const dateStr = cursor.toISOString().split('T')[0];
            if (dayOfWeek !== WEEKLY_OFF_DAY && !holidays.includes(dateStr)) {
                count++;
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        // Half-day adjustments
        if (D.New_Leave_Details.Half_Day_Start && count > 0) count -= 0.5;
        if (D.New_Leave_Details.Half_Day_End   && count > 0) count -= 0.5;

        // Guard: if same day with both half-days checked, that's nonsensical → clamp to 0.5
        if (startStr === endStr && D.New_Leave_Details.Half_Day_Start && D.New_Leave_Details.Half_Day_End) {
            count = 0; // Can't take both halves off and call it half day
        }
        // Same day, one half-day → 0.5
        if (startStr === endStr && (D.New_Leave_Details.Half_Day_Start || D.New_Leave_Details.Half_Day_End)) {
            count = 0.5;
        }

        D.New_Leave_Details.Number_of_Days = Math.max(0, count);

        // Balance styling
        const bal = availableBalance;
        if (count > bal) {
            D.New_Leave_Details.Number_of_Days_Styling = 'exceeds';
        } else if (count === bal) {
            D.New_Leave_Details.Number_of_Days_Styling = 'exact';
        } else {
            D.New_Leave_Details.Number_of_Days_Styling = '';
        }

        D = { ...D };
    }

    // Trigger recalc on any date/half-day change
    function onDateChange()    { recalcDays(); }
    function onHalfDayChange() { recalcDays(); }

    // ── Status calculation ─────────────────────────────────────────────
    function StatusChangeHandler(level) {
        if (!D.New_Leave_Details) return;
        const l1 = D.New_Leave_Details.Level1_Approval;
        const l2 = D.New_Leave_Details.Level2_Approval;
        if      (l1 === 'Rejected' || l2 === 'Rejected') D.New_Leave_Details.Status = 'Rejected';
        else if (l1 === 'Approved' && l2 === 'Approved')  D.New_Leave_Details.Status = 'Approved';
        else if (l1 === 'Approved' || l2 === 'Approved')  D.New_Leave_Details.Status = 'In-Progress';
        else D.New_Leave_Details.Status = 'Pending';
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        if (Page_Mode === 'Add') {
            if (!D.New_Leave_Details.Leave_Type_ID)      return alert('Please select a leave type.');
            if (!D.New_Leave_Details.Start_Date)          return alert('Please select a start date.');
            if (!D.New_Leave_Details.End_Date)            return alert('Please select an end date.');
            if (D.New_Leave_Details.Number_of_Days <= 0)  return alert('Number of days must be greater than 0.');
            if (!D.New_Leave_Details.Reason_for_Leave?.trim()) return alert('Please enter a reason.');
        }

        saving = true;
        const result = await post(API_PATHS.API_URL_Save_Leave_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            Leave_Details: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }

    // ── Leave Cancellation ────────────────────────────────────────────
    // FIX (P1): Employees can now cancel Pending leaves. Approved leaves require HR approval.
    let cancelling = false;
    $: canCancel = Page_Mode === 'View' && editId !== 'Add'
        && D.New_Leave_Details?.Status === 'Pending'
        && (D.Employee_Self_ID == user.Employee_Self_ID || isHRAdmin);
    $: canRequestCancel = Page_Mode === 'View' && editId !== 'Add'
        && (D.New_Leave_Details?.Status === 'Approved' || D.New_Leave_Details?.Status === 'In-Progress')
        && (D.Employee_Self_ID == user.Employee_Self_ID || isHRAdmin);

    async function cancelLeave() {
        if (!confirm('Are you sure you want to cancel this leave application?')) return;
        cancelling = true;
        const result = await post(API_PATHS.API_URL_Save_Leave_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            Leave_Details: { ...D, New_Leave_Details: { ...D.New_Leave_Details, Status: 'Cancelled' } },
            Action: 'Cancel'
        });
        cancelling = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Cancellation failed.');
    }
    function fmtDate(d) {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
        catch { return d; }
    }

    // ── Helpers ─────────────────────────────────────────────────────────
    const DAYS_STYLE = {
        exceeds: 'bg-red-100 text-red-700 border-red-200',
        exact:   'bg-blue-100 text-blue-700 border-blue-200',
        '':      'bg-white'
    };
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
            <span class="px-3 py-1.5 text-slate-600">New Leave Application</span>
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
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span class="text-indigo-600 font-bold text-xs">{D.Employee_Details?.Employee_Name?.charAt(0) ?? '?'}</span>
                </div>
                <div>
                    <p class="text-sm font-bold text-slate-800">{D.Employee_Details?.Employee_Name ?? '—'}</p>
                    <p class="text-xs text-slate-500">
                        {D.Employee_Details?.Employee_Code ?? ''} · {D.Employee_Details?.Department_Name ?? ''}
                    </p>
                    <p class="text-xs text-slate-400">
                        L1: {D.New_Leave_Details?.Level1_Approver ?? '—'} · L2: {D.New_Leave_Details?.Level2_Approver ?? '—'}
                    </p>
                </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium shrink-0
                {D.New_Leave_Details?.Status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                 D.New_Leave_Details?.Status === 'Rejected' ? 'bg-red-100 text-red-700' :
                 D.New_Leave_Details?.Status === 'In-Progress' ? 'bg-blue-100 text-blue-700' :
                 'bg-yellow-100 text-yellow-700'}">
                {D.New_Leave_Details?.Status ?? 'Pending'}
            </span>
        </div>
    </div>

    <!-- ── Tab bar: NEW only ─────────────────────────────────────── -->
    {#if Page_Mode === 'Add'}
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium mb-4 w-fit">
            <button on:click={() => activeTab = 'new'}
                class="px-3 py-1.5 rounded-lg transition-colors
                    {activeTab === 'new' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                New Leave Application
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
            <Leave_List />
        </div>
    {:else}

    <!-- ── Leave Balance summary (compact) ───────────────────────── -->
    {#if D.Leave_Balance && Object.keys(D.Leave_Balance).length > 0}
        <div class="mb-4">
            <p class="text-[11px] font-medium text-slate-500 mb-1.5">Leave Balances</p>
            <div class="flex gap-2 overflow-x-auto pb-1">
                {#each Object.entries(D.Leave_Balance) as [id, lb]}
                    {@const isSelected = String(id) === String(D.New_Leave_Details?.Leave_Type_ID)}
                    <div class="shrink-0 px-3 py-2 rounded-xl border text-xs min-w-[100px]
                        {isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-100 bg-white'}">
                        <p class="font-medium text-slate-700 truncate">{lb.Leave_Type_Name ?? '—'}</p>
                        <div class="flex justify-between mt-1">
                            <span class="text-slate-400">{lb.Assigned_Count ?? 0}</span>
                            <span class="font-bold {(lb.Leave_Balance ?? 0) <= 0 ? 'text-red-600' : 'text-emerald-600'}">
                                {lb.Leave_Balance ?? 0}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- ── Leave Application Fields ──────────────────────────────── -->
    <div class="space-y-4 mb-5">

        <!-- Leave Type -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Leave Type</label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1">{D.New_Leave_Details.Leave_Type_Name || '—'}
                    {#if selectedLeaveBalance}
                        <span class="text-xs text-slate-400 ml-1">(Balance: {availableBalance})</span>
                    {/if}
                </p>
            {:else}
                <select bind:value={D.New_Leave_Details.Leave_Type_ID} on:change={onLeaveTypeChange}
                    disabled={Page_Mode !== 'Add'}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 disabled:bg-slate-50">
                    <option value="">Select Leave Type</option>
                    {#if D.Leave_Balance}
                        {#each Object.entries(D.Leave_Balance) as [id, lb]}
                            <option value={id}>{lb.Leave_Type_Name} (Bal: {lb.Leave_Balance ?? 0})</option>
                        {/each}
                    {/if}
                </select>
            {/if}
        </div>

        <!-- Dates row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <!-- Start Date -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Start Date</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{fmtDate(D.New_Leave_Details.Start_Date)}</p>
                {:else}<input type="date" bind:value={D.New_Leave_Details.Start_Date} on:change={onDateChange}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
            <!-- End Date -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">End Date</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{fmtDate(D.New_Leave_Details.End_Date)}</p>
                {:else}<input type="date" bind:value={D.New_Leave_Details.End_Date} on:change={onDateChange}
                    min={D.New_Leave_Details.Start_Date || ''}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
            <!-- Number of Days -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Days</label>
                <div class="px-3 py-2 rounded-xl border text-sm font-semibold
                    {DAYS_STYLE[D.New_Leave_Details.Number_of_Days_Styling] ?? 'bg-white border-slate-200'}">
                    {D.New_Leave_Details.Number_of_Days}
                    {#if D.New_Leave_Details.Number_of_Days_Styling === 'exceeds'}
                        <span class="text-[10px] font-normal ml-1">⚠ exceeds</span>
                    {/if}
                </div>
            </div>
            <!-- Half-day toggles (only in edit/add) -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Half Day</label>
                {#if isView}
                    <p class="text-sm text-slate-800 py-1">
                        {D.New_Leave_Details.Half_Day_Start ? 'Start (PM)' : ''}
                        {D.New_Leave_Details.Half_Day_Start && D.New_Leave_Details.Half_Day_End ? ' + ' : ''}
                        {D.New_Leave_Details.Half_Day_End ? 'End (AM)' : ''}
                        {!D.New_Leave_Details.Half_Day_Start && !D.New_Leave_Details.Half_Day_End ? 'No' : ''}
                    </p>
                {:else}
                    <div class="flex flex-col gap-1.5 py-1">
                        <label class="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input type="checkbox" bind:checked={D.New_Leave_Details.Half_Day_Start} on:change={onHalfDayChange}
                                class="rounded border-slate-300"/>
                            Start day PM only
                        </label>
                        <label class="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input type="checkbox" bind:checked={D.New_Leave_Details.Half_Day_End} on:change={onHalfDayChange}
                                class="rounded border-slate-300"/>
                            End day AM only
                        </label>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Excluded days info -->
        {#if isEdit && D.New_Leave_Details.Start_Date && D.New_Leave_Details.End_Date}
            <p class="text-[10px] text-slate-400 -mt-2">
                {WEEKLY_OFF_DAY === 0 ? 'Sundays' : WEEKLY_OFF_DAY === 5 ? 'Fridays' : `Day ${WEEKLY_OFF_DAY}`} and public holidays are excluded from the day count.
            </p>
        {/if}

        <!-- Reason -->
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Reason for Leave</label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1 whitespace-pre-line">{D.New_Leave_Details.Reason_for_Leave || '—'}</p>
            {:else}
                <textarea bind:value={D.New_Leave_Details.Reason_for_Leave} rows="3"
                    placeholder="Briefly describe the reason for your leave"
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
                  approverKey: 'Level1_Approver', approverIdKey: 'Level1_Approver_ID',
                  approvalKey: 'Level1_Approval', dateKey: 'Level1_Approval_Date',
                  remarksKey:  'Level1_Approval_Remarks',
                  enabled:     isL1Approver || isHRAdmin },
                { level: 2,
                  approverKey: 'Level2_Approver', approverIdKey: 'Level2_Approver_ID',
                  approvalKey: 'Level2_Approval', dateKey: 'Level2_Approval_Date',
                  remarksKey:  'Level2_Approval_Remarks',
                  enabled:     isL2Approver || isHRAdmin }
            ] as row}
                <div class="px-4 py-3 border-t border-slate-50">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-xs font-semibold text-slate-700">Level {row.level}: {D.New_Leave_Details[row.approverKey] ?? '—'}</p>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium
                            {D.New_Leave_Details[row.approvalKey] === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                             D.New_Leave_Details[row.approvalKey] === 'Rejected' ? 'bg-red-100 text-red-700' :
                             'bg-yellow-100 text-yellow-700'}">
                            {D.New_Leave_Details[row.approvalKey] ?? 'Pending'}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Date</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_Leave_Details[row.dateKey] || '—'}</p>
                            {:else}
                                <input type="date" bind:value={D.New_Leave_Details[row.dateKey]}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Decision</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_Leave_Details[row.approvalKey] ?? 'Pending'}</p>
                            {:else}
                                <select bind:value={D.New_Leave_Details[row.approvalKey]}
                                    on:change={() => StatusChangeHandler(row.level)}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400">
                                    {#each ['Pending','Approved','Rejected'] as s}<option value={s}>{s}</option>{/each}
                                </select>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Remarks</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_Leave_Details[row.remarksKey] || '—'}</p>
                            {:else}
                                <input type="text" bind:value={D.New_Leave_Details[row.remarksKey]} placeholder="Optional"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- ── Action bar ────────────────────────────────────────────── -->
    <!-- FIX (P1): Added Cancel Leave button for Pending leaves -->
    {#if canCancel || canRequestCancel}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100 mb-4">
            <button on:click={cancelLeave} disabled={cancelling}
                class="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60">
                {cancelling ? 'Cancelling…' : canCancel ? 'Cancel Leave' : 'Request Cancellation'}
            </button>
        </div>
    {/if}
    {#if Page_Mode !== 'View' && !(Page_Mode === 'Add' && activeTab === 'table')}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button on:click={closeModal}
                class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button on:click={save} disabled={saving}
                class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Submit Application' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}

<style>
    /* Hide nested Add button inside embedded *_List to prevent nested modal */
    :global(.embedded-hrms-list button.sm\:ml-auto) { display: none !important; }
</style>