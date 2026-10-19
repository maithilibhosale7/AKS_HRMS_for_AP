<script>
    /**
     * Expense_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Employee submits expense claims; Manager/HR approves.
     *
     * Header: Expense Period (Start/End), Description, OD linkage
     * Line items: Expense_Type, Date, From/To Location, Amount, Receipt, Remarks
     * Summary: Total Amount, Per Day Amount, Item count
     * 2-level approval with date, decision, remarks per level
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';
    import AKS_HRMS_Attachment       from '$lib/components/AKS_HRMS_Components/Shared/AKS_HRMS_Attachment.svelte';
    import Expense_List              from './Expense_List.svelte';

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
        New_Expense_Details: {
            Expense_ID: 'New', OD_ID: null,
            Expense_Start_Date: '', Expense_End_Date: '',
            Expense_Description: '',
            Expense_Items: [],
            Total_Amount: 0, Per_Day_Amount: 0,
            Status: 'Pending',
            Level1_Approver_ID: '', Level1_Approver: '',
            Level1_Approval_Date: '', Level1_Approval: 'Pending', Level1_Approval_Remarks: '',
            Level2_Approver_ID: '', Level2_Approver: '',
            Level2_Approval_Date: '', Level2_Approval: 'Pending', Level2_Approval_Remarks: ''
        }
    };

    // ── Role-aware approval ────────────────────────────────────────────
    $: isL1Approver = D.New_Expense_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    $: isL2Approver = D.New_Expense_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    $: canApprove   = isL1Approver || isL2Approver || isHRAdmin;

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        if (editId === 'Add') {
            D = await post(API_PATHS.API_URL_Add_New_Expense_Entry_Data, {
                Employee_Self_ID: user.Employee_Self_ID
            });
            Page_Mode = 'Add';
            // Add one empty item row
            if (!D.New_Expense_Details.Expense_Items?.length) addItem();
        } else {
            D = await post(API_PATHS.API_URL_Get_Expense_Entry_Data_by_ID, { Edit_ID: editId });
        }
        loading = false;
    });

    // ── Line item CRUD ─────────────────────────────────────────────────
    function addItem() {
        if (!D.New_Expense_Details.Expense_Items) D.New_Expense_Details.Expense_Items = [];
        const idx = D.New_Expense_Details.Expense_Items.length;
        D.New_Expense_Details.Expense_Items = [...D.New_Expense_Details.Expense_Items, {
            Expense_Type: '',
            Date_of_Expense: new Date().toISOString().split('T')[0],
            From_Location: '', To_Location: '',
            Amount: '',
            Receipt_Attached: [],
            Remarks: ''
        }];
    }

    function removeItem(idx) {
        if ((D.New_Expense_Details.Expense_Items?.length ?? 0) <= 1) return;
        D.New_Expense_Details.Expense_Items.splice(idx, 1);
        D.New_Expense_Details.Expense_Items = [...D.New_Expense_Details.Expense_Items];
        recalcTotals();
    }

    // ── Amount calculation ─────────────────────────────────────────────
    function parseAmt(v) {
        if (typeof v === 'string') v = v.replace(/,/g, '');
        return parseFloat(v) || 0;
    }

    function fmtAmt(v) {
        return parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function recalcTotals() {
        const items = D.New_Expense_Details.Expense_Items ?? [];
        const total = items.reduce((sum, item) => sum + parseAmt(item.Amount), 0);
        D.New_Expense_Details.Total_Amount = fmtAmt(total);

        // Per Day = Total / number of calendar days in period
        const start = new Date(D.New_Expense_Details.Expense_Start_Date);
        const end   = new Date(D.New_Expense_Details.Expense_End_Date);
        let numDays = 0;
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
            numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        D.New_Expense_Details.Per_Day_Amount = numDays > 0 ? fmtAmt(total / numDays) : fmtAmt(0);
        D = { ...D };
    }

    function onAmountChange() { recalcTotals(); }
    function onDateChange()   { recalcTotals(); }

    // ── Status calculation ─────────────────────────────────────────────
    function StatusChangeHandler(level) {
        if (!D.New_Expense_Details) return;
        const l1 = D.New_Expense_Details.Level1_Approval;
        const l2 = D.New_Expense_Details.Level2_Approval;
        if      (l1 === 'Rejected' || l2 === 'Rejected') D.New_Expense_Details.Status = 'Rejected';
        else if (l1 === 'Approved' && l2 === 'Approved')  D.New_Expense_Details.Status = 'Approved';
        else if (l1 === 'Approved' || l2 === 'Approved')  D.New_Expense_Details.Status = 'In-Progress';
        else D.New_Expense_Details.Status = 'Pending';
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        if (Page_Mode === 'Add') {
            if (!D.New_Expense_Details.Expense_Start_Date) return alert('Please select a start date.');
            if (!D.New_Expense_Details.Expense_End_Date)   return alert('Please select an end date.');
            if ((D.New_Expense_Details.Expense_Items?.length ?? 0) === 0) return alert('Please add at least one expense item.');
        }
        saving = true;
        const result = await post(API_PATHS.API_URL_Save_Expense_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            Expense_Details: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
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
            <span class="px-3 py-1.5 text-slate-600">New Expense Claim</span>
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
                    {D.Employee_Details?.Employee_Code ?? ''} · {D.Employee_Details?.Department_Name ?? ''}
                </p>
                <p class="text-xs text-slate-400">
                    L1: {D.New_Expense_Details?.Level1_Approver ?? '—'} · L2: {D.New_Expense_Details?.Level2_Approver ?? '—'}
                </p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium shrink-0
                {D.New_Expense_Details?.Status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                 D.New_Expense_Details?.Status === 'Rejected' ? 'bg-red-100 text-red-700' :
                 D.New_Expense_Details?.Status === 'In-Progress' ? 'bg-blue-100 text-blue-700' :
                 'bg-yellow-100 text-yellow-700'}">
                {D.New_Expense_Details?.Status ?? 'Pending'}
            </span>
        </div>
    </div>

    <!-- ── Tab bar: NEW only ─────────────────────────────────────── -->
    {#if Page_Mode === 'Add'}
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium mb-4 w-fit">
            <button on:click={() => activeTab = 'new'}
                class="px-3 py-1.5 rounded-lg transition-colors
                    {activeTab === 'new' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                New Expense Claim
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
            <Expense_List />
        </div>
    {:else}

    <!-- ── Summary cards ─────────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-white border border-slate-100 rounded-xl p-3">
            <p class="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
            <p class="text-lg font-bold text-slate-800">₹{D.New_Expense_Details?.Total_Amount ?? '0.00'}</p>
        </div>
        <div class="bg-white border border-slate-100 rounded-xl p-3">
            <p class="text-[10px] text-slate-400 uppercase tracking-wider">Per Day</p>
            <p class="text-lg font-bold text-slate-800">₹{D.New_Expense_Details?.Per_Day_Amount ?? '0.00'}</p>
        </div>
        <div class="bg-white border border-slate-100 rounded-xl p-3">
            <p class="text-[10px] text-slate-400 uppercase tracking-wider">Items</p>
            <p class="text-lg font-bold text-slate-800">{D.New_Expense_Details?.Expense_Items?.length ?? 0}</p>
        </div>
    </div>

    <!-- ── Header fields ─────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Period Start</label>
            {#if isView}<p class="text-sm text-slate-800 py-1">{D.New_Expense_Details.Expense_Start_Date || '—'}</p>
            {:else}<input type="date" bind:value={D.New_Expense_Details.Expense_Start_Date} on:change={onDateChange}
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Period End</label>
            {#if isView}<p class="text-sm text-slate-800 py-1">{D.New_Expense_Details.Expense_End_Date || '—'}</p>
            {:else}<input type="date" bind:value={D.New_Expense_Details.Expense_End_Date} on:change={onDateChange}
                min={D.New_Expense_Details.Expense_Start_Date || ''}
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Description</label>
            {#if isView}<p class="text-sm text-slate-800 py-1 whitespace-pre-line">{D.New_Expense_Details.Expense_Description || '—'}</p>
            {:else}<input type="text" bind:value={D.New_Expense_Details.Expense_Description} placeholder="Trip purpose / summary"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>
    </div>

    <!-- ── Expense Items ─────────────────────────────────────────── -->
    <div class="border-t border-slate-100 pt-4 mb-4">
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-slate-600">Expense Items</h3>
            {#if isEdit}
                <button on:click={addItem}
                    class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs rounded-xl hover:bg-[#16304f]">+ Add Item</button>
            {/if}
        </div>

        {#if !D.New_Expense_Details.Expense_Items?.length}
            <p class="text-xs text-slate-400 py-6 text-center">No expense items. Click "+ Add Item" to begin.</p>
        {:else}
            <div class="space-y-3">
                {#each D.New_Expense_Details.Expense_Items as item, idx}
                    <div class="bg-white border border-slate-100 rounded-2xl p-4">
                        <!-- Item header -->
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-semibold text-slate-500">Item {idx + 1}</span>
                            <div class="flex items-center gap-3">
                                {#if item.Amount}
                                    <span class="text-xs font-bold text-slate-700">₹{item.Amount}</span>
                                {/if}
                                {#if isEdit && (D.New_Expense_Details.Expense_Items.length > 1)}
                                    <button on:click={() => removeItem(idx)}
                                        class="text-red-500 text-xs hover:text-red-700">✕ Remove</button>
                                {/if}
                            </div>
                        </div>

                        <!-- Row 1: Type + Date -->
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label class="block text-[10px] text-slate-400 mb-0.5">Expense Type</label>
                                {#if isView}<p class="text-xs text-slate-800">{item.Expense_Type || '—'}</p>
                                {:else}<input type="text" bind:value={D.New_Expense_Details.Expense_Items[idx].Expense_Type}
                                    placeholder="e.g. Travel, Food, Stay"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                            </div>
                            <div>
                                <label class="block text-[10px] text-slate-400 mb-0.5">Date</label>
                                {#if isView}<p class="text-xs text-slate-800">{item.Date_of_Expense || '—'}</p>
                                {:else}<input type="date" bind:value={D.New_Expense_Details.Expense_Items[idx].Date_of_Expense}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                            </div>
                        </div>

                        <!-- Row 2: From / To Location -->
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label class="block text-[10px] text-slate-400 mb-0.5">From</label>
                                {#if isView}<p class="text-xs text-slate-800">{item.From_Location || '—'}</p>
                                {:else}<input type="text" bind:value={D.New_Expense_Details.Expense_Items[idx].From_Location}
                                    placeholder="Origin"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                            </div>
                            <div>
                                <label class="block text-[10px] text-slate-400 mb-0.5">To</label>
                                {#if isView}<p class="text-xs text-slate-800">{item.To_Location || '—'}</p>
                                {:else}<input type="text" bind:value={D.New_Expense_Details.Expense_Items[idx].To_Location}
                                    placeholder="Destination"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                            </div>
                        </div>

                        <!-- Row 3: Amount + Remarks -->
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                <label class="block text-[10px] text-slate-400 mb-0.5">Amount (₹)</label>
                                {#if isView}<p class="text-xs font-semibold text-slate-800">₹{item.Amount || '0'}</p>
                                {:else}<input type="text" bind:value={D.New_Expense_Details.Expense_Items[idx].Amount}
                                    on:change={onAmountChange}
                                    placeholder="0.00"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                            </div>
                            <div>
                                <label class="block text-[10px] text-slate-400 mb-0.5">Remarks</label>
                                {#if isView}<p class="text-xs text-slate-800">{item.Remarks || '—'}</p>
                                {:else}<input type="text" bind:value={D.New_Expense_Details.Expense_Items[idx].Remarks}
                                    placeholder="Optional notes"
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                            </div>
                        </div>

                        <!-- Receipt upload -->
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Receipt</label>
                            <AKS_HRMS_Attachment bind:value={D.New_Expense_Details.Expense_Items[idx].Receipt_Attached}/>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
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
                        <p class="text-xs font-semibold text-slate-700">Level {row.level}: {D.New_Expense_Details[row.approverKey] ?? '—'}</p>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium
                            {D.New_Expense_Details[row.approvalKey] === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                             D.New_Expense_Details[row.approvalKey] === 'Rejected' ? 'bg-red-100 text-red-700' :
                             'bg-yellow-100 text-yellow-700'}">
                            {D.New_Expense_Details[row.approvalKey] ?? 'Pending'}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Date</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_Expense_Details[row.dateKey] || '—'}</p>
                            {:else}
                                <input type="date" bind:value={D.New_Expense_Details[row.dateKey]}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Decision</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_Expense_Details[row.approvalKey] ?? 'Pending'}</p>
                            {:else}
                                <select bind:value={D.New_Expense_Details[row.approvalKey]}
                                    on:change={() => StatusChangeHandler(row.level)}
                                    class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400">
                                    {#each ['Pending','Approved','Rejected'] as s}<option value={s}>{s}</option>{/each}
                                </select>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-0.5">Remarks</label>
                            {#if isView || !row.enabled}
                                <p class="text-xs text-slate-700">{D.New_Expense_Details[row.remarksKey] || '—'}</p>
                            {:else}
                                <input type="text" bind:value={D.New_Expense_Details[row.remarksKey]} placeholder="Optional"
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
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Submit Claim' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}

<style>
    /* Hide nested Add button inside embedded *_List to prevent nested modal */
    :global(.embedded-hrms-list button.sm\:ml-auto) { display: none !important; }
</style>