<script>
    /**
     * Attendance_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Handles Add / View / Edit for a single attendance entry.
     * Each entry has: Employee info, Attendance Type, Date, Timings[],
     *   Total_Duration, Status, Remarks.
     *
     * Timings row fields (from biometric/manual):
     *   Att_Date, InTime, OutTime, Shift, S_InTime, S_OutTime,
     *   Work_Duration, OT, Tot_Duration, LateBy, EarlyGoingBy,
     *   Status, Punch_Records
     *
     * Auto-calc on time change:
     *   Work_Duration = OutTime - InTime (handles overnight)
     *   Tot_Duration  = Work_Duration + OT
     *   LateBy        = InTime - S_InTime (if late)
     *   EarlyGoingBy  = S_OutTime - OutTime (if early)
     *   Total_Duration = sum of all Tot_Duration rows
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';

    export let editId      = 'Add';
    export let initialMode = 'View';
    export let onSave      = () => {};

    let Live_Data;
    $: Live_Data  = $Live_Data_Storage;
    $: user       = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    $: isView = Page_Mode === 'View';
    $: isEdit = Page_Mode === 'Edit' || Page_Mode === 'Add';

    let Page_Mode        = editId === 'Add' ? 'Add' : initialMode;
    let loading          = true;
    let saving           = false;
    let selectedEmployee = '';
    let Employee_Self_Data = {};

    // Main data object — populated by API
    let D = {
        Employee_Self_ID: '',
        Employee_Details: {},
        Attendance_Types: {},
        New_Attendance_Details: {
            Attendance_Date: '',
            Attendance_Type_ID: '',
            Attendance_Type_Name: '',
            Timings: [],
            Total_Duration: '00:00',
            Status: 'New',
            Remarks: ''
        }
    };

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        const masterData   = await post(API_PATHS.API_URL_Get_Master_Data_for_Employee_Details);
        Employee_Self_Data = masterData.Employee_Self_Data ?? {};

        if (editId === 'Add') {
            if (!isHRAdmin) {
                selectedEmployee = String(user.Employee_Self_ID);
                await onEmployeeChange();
            }
            Page_Mode = 'Add';
        } else {
            D = await post(API_PATHS.API_URL_Get_Attendance_Entry_Data_by_ID, { Edit_ID: editId });
            selectedEmployee = String(D.Employee_Self_ID ?? '');
        }
        loading = false;
    });

    // ── Employee selection (populates Employee_Details + blank template) ─
    async function onEmployeeChange() {
        if (!selectedEmployee) return;
        D = await post(API_PATHS.API_URL_Add_New_Attendance_Entry_Data, { Employee_Self_ID: selectedEmployee });
        // Add one empty timing row for manual entry
        if (!D.New_Attendance_Details.Timings || D.New_Attendance_Details.Timings.length === 0) {
            addTimingRow();
        }
    }

    // ── Attendance Type change ──────────────────────────────────────────
    function onAttendanceTypeChange() {
        const atypes = D.Attendance_Types ?? {};
        D.New_Attendance_Details.Attendance_Type_Name = 
            atypes[D.New_Attendance_Details.Attendance_Type_ID]?.Attendance_Type_Name ?? '';
        D = { ...D };
    }

    // ── Timing Row CRUD ────────────────────────────────────────────────
    const EMPTY_TIMING = {
        Att_Date:'', InTime:'', OutTime:'', Shift:'',
        S_InTime:'', S_OutTime:'', Work_Duration:'00:00', OT:'00:00',
        Tot_Duration:'00:00', LateBy:'', EarlyGoingBy:'', Status:'', Punch_Records:''
    };

    function addTimingRow() {
        if (!D.New_Attendance_Details.Timings) D.New_Attendance_Details.Timings = [];
        D.New_Attendance_Details.Timings = [...D.New_Attendance_Details.Timings, { ...EMPTY_TIMING }];
    }

    function removeTimingRow(idx) {
        if ((D.New_Attendance_Details.Timings?.length ?? 0) <= 1) return;
        D.New_Attendance_Details.Timings.splice(idx, 1);
        D.New_Attendance_Details.Timings = [...D.New_Attendance_Details.Timings];
        recalcTotalDuration();
    }

    // ── Time calculation engine (ported from V2) ───────────────────────
    function parseHHMM(str) {
        if (!str || !/^\d{1,2}:\d{2}/.test(str)) return null;
        const [h, m] = str.split(':').map(Number);
        return h * 60 + m;
    }

    function fmtHHMM(totalMins) {
        if (totalMins == null || totalMins < 0) return '00:00';
        return `${String(Math.floor(totalMins / 60)).padStart(2,'0')}:${String(totalMins % 60).padStart(2,'0')}`;
    }

    function HandleTimeChange(idx) {
        let grandTotal = 0;

        D.New_Attendance_Details.Timings = D.New_Attendance_Details.Timings.map((t) => {
            // Work Duration = OutTime - InTime
            const inM  = parseHHMM(t.InTime);
            const outM = parseHHMM(t.OutTime);
            let workMins = 0;
            if (inM != null && outM != null) {
                workMins = outM >= inM ? outM - inM : (outM + 1440) - inM; // overnight
            }
            t.Work_Duration = fmtHHMM(workMins);

            // OT — user-entered, default 00:00
            const otMins = parseHHMM(t.OT) ?? 0;
            if (!t.OT || !/^\d{1,2}:\d{2}$/.test(t.OT)) t.OT = '00:00';

            // Tot Duration = Work + OT
            const totMins = workMins + otMins;
            t.Tot_Duration = fmtHHMM(totMins);

            // LateBy = InTime - S_InTime (positive means late)
            const sInM = parseHHMM(t.S_InTime);
            if (inM != null && sInM != null && inM > sInM) {
                t.LateBy = fmtHHMM(inM - sInM);
            } else {
                t.LateBy = '';
            }

            // EarlyGoingBy = S_OutTime - OutTime (positive means left early)
            const sOutM = parseHHMM(t.S_OutTime);
            if (outM != null && sOutM != null && sOutM > outM) {
                t.EarlyGoingBy = fmtHHMM(sOutM - outM);
            } else {
                t.EarlyGoingBy = '';
            }

            grandTotal += totMins;
            return t;
        });

        D.New_Attendance_Details.Total_Duration = fmtHHMM(grandTotal);
        D = { ...D };
    }

    function recalcTotalDuration() {
        let total = 0;
        (D.New_Attendance_Details.Timings ?? []).forEach(t => {
            total += parseHHMM(t.Tot_Duration) ?? 0;
        });
        D.New_Attendance_Details.Total_Duration = fmtHHMM(total);
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        saving = true;
        const result = await post(API_PATHS.API_URL_Save_Attendance_Entry_Data, {
            User_Information: user,
            Edit_ID: editId,
            Attendance_Details: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }
</script>

<!-- ── Mode toggle ──────────────────────────────────────────────── -->
<div class="flex items-center justify-between mb-4">
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">
        {#if Page_Mode !== 'Add'}
            {#each ['View','Edit'] as m}
                <button on:click={() => { if(isHRAdmin || m==='View') Page_Mode = m; }}
                    class="px-3 py-1.5 rounded-lg transition-colors
                        {Page_Mode===m ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                    {m}
                </button>
            {/each}
        {:else}
            <span class="px-3 py-1.5 text-slate-600">New Attendance Entry</span>
        {/if}
    </div>
    {#if isView && isHRAdmin}
        <button on:click={() => Page_Mode = 'Edit'}
            class="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-medium rounded-xl">Edit</button>
    {/if}
</div>

{#if loading}
    <div class="flex justify-center py-16">
        <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
{:else}

    <!-- ── Employee selector (Add mode) ──────────────────────────── -->
    {#if Page_Mode === 'Add'}
        <div class="mb-4">
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Employee</label>
            <select bind:value={selectedEmployee} on:change={onEmployeeChange}
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="">— Select Employee —</option>
                {#each Object.entries(Employee_Self_Data) as [id, emp]}
                    <option value={id}>{emp.Employee_Name}</option>
                {/each}
            </select>
        </div>
    {/if}

    <!-- ── Employee info strip ───────────────────────────────────── -->
    {#if D.Employee_Details?.Employee_Name}
        <div class="bg-slate-50 rounded-2xl px-4 py-3 mb-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <p class="text-sm font-bold text-slate-800">{D.Employee_Details.Employee_Name}</p>
                    <p class="text-xs text-slate-500">
                        {D.Employee_Details.Employee_Code ?? ''} · {D.Employee_Details.Department_Name ?? ''} · {D.Employee_Details.Designation_Name ?? ''}
                    </p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium
                    {D.New_Attendance_Details.Status === 'New' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}">
                    {D.New_Attendance_Details.Status ?? 'New'}
                </span>
            </div>
        </div>
    {/if}

    <!-- ── Attendance header fields ──────────────────────────────── -->
    {#if D.New_Attendance_Details}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <!-- Attendance Type -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Attendance Type</label>
                {#if isView}
                    <p class="text-sm text-slate-800 py-1">{D.New_Attendance_Details.Attendance_Type_Name || '—'}</p>
                {:else}
                    <select bind:value={D.New_Attendance_Details.Attendance_Type_ID} on:change={onAttendanceTypeChange}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select Type</option>
                        {#each Object.entries(D.Attendance_Types ?? {}) as [id, atype]}
                            <option value={id}>{atype.Attendance_Type_Name}</option>
                        {/each}
                    </select>
                {/if}
            </div>
            <!-- Attendance Date -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Attendance Date</label>
                {#if isView}
                    <p class="text-sm text-slate-800 py-1">{D.New_Attendance_Details.Attendance_Date || '—'}</p>
                {:else}
                    <input type="date" bind:value={D.New_Attendance_Details.Attendance_Date}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
                {/if}
            </div>
            <!-- Total Duration (computed, always readonly) -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Total Duration</label>
                <p class="text-sm font-semibold text-indigo-700 py-1">{D.New_Attendance_Details.Total_Duration || '00:00'}</p>
            </div>
        </div>

        <!-- ── Timings section ───────────────────────────────────── -->
        <div class="border-t border-slate-100 pt-4 mb-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs font-semibold text-slate-600">Timing Records ({D.New_Attendance_Details.Timings?.length ?? 0})</h3>
                {#if isEdit}
                    <button on:click={addTimingRow}
                        class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs rounded-xl hover:bg-[#16304f]">+ Add Row</button>
                {/if}
            </div>

            {#if !D.New_Attendance_Details.Timings || D.New_Attendance_Details.Timings.length === 0}
                <p class="text-xs text-slate-400 py-6 text-center">No timing records. Click "+ Add Row" to begin.</p>
            {:else}
                <!-- Each timing row as a card (mobile-first, works on all screens) -->
                <div class="space-y-3">
                    {#each D.New_Attendance_Details.Timings as t, idx}
                        <div class="bg-white border border-slate-100 rounded-2xl p-4">
                            <!-- Row header -->
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-xs font-semibold text-slate-500">Row {idx + 1}</span>
                                <div class="flex items-center gap-3">
                                    {#if t.Status}
                                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t.Status}</span>
                                    {/if}
                                    {#if isEdit && (D.New_Attendance_Details.Timings.length > 1)}
                                        <button on:click={() => removeTimingRow(idx)}
                                            class="text-red-500 text-xs hover:text-red-700">✕ Remove</button>
                                    {/if}
                                </div>
                            </div>

                            <!-- Date row -->
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Date</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.Att_Date || '—'}</p>
                                    {:else}<input type="date" bind:value={D.New_Attendance_Details.Timings[idx].Att_Date}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Shift</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.Shift || '—'}</p>
                                    {:else}<input type="text" bind:value={D.New_Attendance_Details.Timings[idx].Shift} placeholder="e.g. General"
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                            </div>

                            <!-- Actual times -->
                            <div class="grid grid-cols-3 gap-2 mb-2">
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">In Time</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.InTime || '—'}</p>
                                    {:else}<input type="time" step="1" bind:value={D.New_Attendance_Details.Timings[idx].InTime}
                                        on:change={() => HandleTimeChange(idx)}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Out Time</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.OutTime || '—'}</p>
                                    {:else}<input type="time" step="1" bind:value={D.New_Attendance_Details.Timings[idx].OutTime}
                                        on:change={() => HandleTimeChange(idx)}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Work Duration</label>
                                    <p class="text-xs font-medium text-slate-800 py-1.5">{t.Work_Duration || '00:00'}</p>
                                </div>
                            </div>

                            <!-- Scheduled times -->
                            <div class="grid grid-cols-3 gap-2 mb-2">
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Sched. In</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.S_InTime || '—'}</p>
                                    {:else}<input type="time" step="1" bind:value={D.New_Attendance_Details.Timings[idx].S_InTime}
                                        on:change={() => HandleTimeChange(idx)}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Sched. Out</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.S_OutTime || '—'}</p>
                                    {:else}<input type="time" step="1" bind:value={D.New_Attendance_Details.Timings[idx].S_OutTime}
                                        on:change={() => HandleTimeChange(idx)}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">OT (HH:MM)</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.OT || '—'}</p>
                                    {:else}
                                    <!-- <input type="text" pattern="^([0-9]{{1,2}}):[0-5][0-9]$" placeholder="00:00" -->
                                    <input type="text" placeholder="00:00"
                                        bind:value={D.New_Attendance_Details.Timings[idx].OT}
                                        on:change={() => HandleTimeChange(idx)}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                            </div>

                            <!-- Computed values -->
                            <div class="grid grid-cols-3 gap-2 mb-2">
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Late By</label>
                                    <p class="text-xs text-slate-800 {t.LateBy ? 'text-red-600 font-medium' : ''}">{t.LateBy || '—'}</p>
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Early Going</label>
                                    <p class="text-xs text-slate-800 {t.EarlyGoingBy ? 'text-amber-600 font-medium' : ''}">{t.EarlyGoingBy || '—'}</p>
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Total Duration</label>
                                    <p class="text-xs font-semibold text-slate-800">{t.Tot_Duration || '00:00'}</p>
                                </div>
                            </div>

                            <!-- Status + Punch Records -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Status</label>
                                    {#if isView}<p class="text-xs text-slate-800">{t.Status || '—'}</p>
                                    {:else}<input type="text" bind:value={D.New_Attendance_Details.Timings[idx].Status}
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>{/if}
                                </div>
                                <div>
                                    <label class="block text-[10px] text-slate-400 mb-0.5">Punch Records</label>
                                    {#if isView}<p class="text-xs text-slate-800 whitespace-pre-line">{t.Punch_Records || '—'}</p>
                                    {:else}<textarea bind:value={D.New_Attendance_Details.Timings[idx].Punch_Records} rows="1"
                                        class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400 resize-none"></textarea>{/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- ── Remarks ───────────────────────────────────────────── -->
        <div class="mb-4">
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Remarks</label>
            {#if isView}
                <p class="text-sm text-slate-800 py-1">{D.New_Attendance_Details.Remarks || '—'}</p>
            {:else}
                <textarea bind:value={D.New_Attendance_Details.Remarks} rows="2"
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"></textarea>
            {/if}
        </div>
    {/if}

    <!-- ── Action bar ────────────────────────────────────────────── -->
    {#if Page_Mode !== 'View'}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button on:click={closeModal}
                class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button on:click={save} disabled={saving}
                class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Save Entry' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}