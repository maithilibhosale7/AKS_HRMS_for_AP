<script>
    /**
     * Exit_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * 4 department checklists (HR, IT, Accounts, Line Manager).
     * On Add → Employee_Self status → 'Exit in Process'
     * On all checklists complete → Employee_Self status → 'Resigned'
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

    let Page_Mode = editId === 'Add' ? 'Add' : initialMode;
    let loading = true; let saving = false;
    let Employee_Self_Data = {};
    let activeTab = 'HR';
    const DEPT_TABS = ['HR', 'IT', 'Accounts', 'Line'];

    let D = {
        Resignation_Date: '',
        Notice_Period_Days: '',
        Last_Working_Date: '',
        Reason_for_Exit: ''
    };

    function checklistProgress(cl) {
        if (!cl || typeof cl !== 'object') return { done:0, total:0, pct:0 };
        const vals = Object.values(cl); const t = vals.length; const d = vals.filter(Boolean).length;
        return { done:d, total:t, pct: t > 0 ? Math.round(d/t*100) : 0 };
    }

    $: hrProg  = checklistProgress(D.HR_Checklist);
    $: itProg  = checklistProgress(D.IT_Checklist);
    $: accProg = checklistProgress(D.Accounts_Checklist);
    $: linProg = checklistProgress(D.Line_Checklist);
    $: allComplete = hrProg.pct === 100 && itProg.pct === 100 && accProg.pct === 100 && linProg.pct === 100;

    function getChecklist(dept) {
        if (dept === 'HR') return { checklist: D.HR_Checklist, statusKey:'HR_Status', remarksKey:'HR_Remarks', prog:hrProg };
        if (dept === 'IT') return { checklist: D.IT_Checklist, statusKey:'IT_Status', remarksKey:'IT_Remarks', prog:itProg };
        if (dept === 'Accounts') return { checklist: D.Accounts_Checklist, statusKey:'Accounts_Status', remarksKey:'Accounts_Remarks', prog:accProg };
        return { checklist: D.Line_Checklist, statusKey:'Line_Status', remarksKey:'Line_Remarks', prog:linProg };
    }

    function autoStatus() {
        for (const dept of DEPT_TABS) {
            const { checklist, statusKey } = getChecklist(dept);
            const { pct } = checklistProgress(checklist);
            D[statusKey] = pct === 100 ? 'Complete' : pct > 0 ? 'In Progress' : '';
        }
        D.Status = allComplete ? 'Complete' : (hrProg.pct + itProg.pct + accProg.pct + linProg.pct > 0 ? 'In Progress' : 'New');
        D = { ...D };
    }

    onMount(async () => {
        const masterData = await post(API_PATHS.API_URL_Get_Master_Data_for_Exit_Management);
        Employee_Self_Data = masterData.Employee_Self_Data ?? {};
        if (editId === 'Add') {
            D = await post(API_PATHS.API_URL_Get_Exit_Template);
            Page_Mode = 'Add';
        } else {
            const res = await post(API_PATHS.API_URL_Get_Exit_Data_by_ID, { Edit_ID: editId });
            D = res.Exit_Details ?? {};
        }
        loading = false;
    });

    function onEmployeeChange() { D.Employee_Name = Employee_Self_Data[D.Employee_Self_ID]?.Employee_Name ?? ''; }

    /**
     * FIX (P2): Auto-compute Last Working Date from Resignation Date + Notice Period
     */
    function computeLastWorkingDate() {
        if (!D.Resignation_Date || !D.Notice_Period_Days) {
            D.Last_Working_Date = '';
            return;
        }
        const resignDate = new Date(D.Resignation_Date);
        if (isNaN(resignDate.getTime())) { D.Last_Working_Date = ''; return; }
        
        resignDate.setDate(resignDate.getDate() + Number(D.Notice_Period_Days));
        D.Last_Working_Date = resignDate.toISOString().split('T')[0];
        D.Exit_Date = D.Last_Working_Date; // Set Exit Date = Last Working Date
        D = { ...D };
    }

    async function save() {
        if (Page_Mode === 'Add' && !D.Employee_Self_ID) return alert('Please select an employee.');
        autoStatus();
        saving = true;
        const result = await post(API_PATHS.API_URL_Save_Exit_Data, {
            User_Information: user, Edit_ID: editId,
            Exit_Details: D,
            All_Complete: allComplete
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }
</script>

<div class="flex items-center justify-between mb-4">
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">
        {#if Page_Mode !== 'Add'}
            {#each ['View','Edit'] as m}<button on:click={() => Page_Mode = m} class="px-3 py-1.5 rounded-lg transition-colors {Page_Mode===m ? 'bg-white shadow text-slate-800' : 'text-slate-500'}">{m}</button>{/each}
        {:else}<span class="px-3 py-1.5 text-slate-600">New Exit Entry</span>{/if}
    </div>
    <span class="px-2.5 py-1 rounded-full text-xs font-medium
        {D.Status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : D.Status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}">
        {D.Status ?? 'New'}
    </span>
</div>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Exit Date</label>
            {#if Page_Mode==='View'}<p class="text-sm text-slate-800 py-1">{D.Exit_Date || '—'}</p>
            {:else}<input type="date" bind:value={D.Exit_Date} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>
        <div class="sm:col-span-2">
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Employee</label>
            {#if Page_Mode==='View' || Page_Mode==='Edit'}
                <p class="text-sm font-semibold text-slate-800 py-1">{D.Employee_Name ?? '—'} <span class="text-xs text-slate-400 font-normal">ID: {D.Employee_Self_ID ?? ''}</span></p>
            {:else}
                <select bind:value={D.Employee_Self_ID} on:change={onEmployeeChange} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">Select Employee</option>
                    {#each Object.entries(Employee_Self_Data) as [id, emp]}<option value={id}>{emp.Employee_Name}</option>{/each}
                </select>
            {/if}
        </div>
    </div>

    <!-- FIX (P2): Added Resignation and Notice Period tracking fields -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Resignation Date</label>
            {#if Page_Mode==='View'}<p class="text-sm text-slate-800 py-1">{D.Resignation_Date || '—'}</p>
            {:else}<input type="date" bind:value={D.Resignation_Date} on:change={computeLastWorkingDate}
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Notice Period (Days)</label>
            {#if Page_Mode==='View'}<p class="text-sm text-slate-800 py-1">{D.Notice_Period_Days ?? '—'}</p>
            {:else}<input type="number" bind:value={D.Notice_Period_Days} on:change={computeLastWorkingDate}
                min="0" placeholder="e.g. 30, 60, 90"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
        </div>
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Last Working Date</label>
            <p class="text-sm font-semibold text-slate-800 py-1 bg-slate-50 rounded-xl px-3">
                {D.Last_Working_Date || '(auto-computed)'}
            </p>
        </div>
        <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Reason for Exit</label>
            {#if Page_Mode==='View'}<p class="text-sm text-slate-800 py-1">{D.Reason_for_Exit || '—'}</p>
            {:else}
                <select bind:value={D.Reason_for_Exit} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">Select Reason</option>
                    {#each ['Resignation', 'Termination', 'Contract End', 'Retirement', 'Mutual Separation', 'Other'] as r}
                        <option value={r}>{r}</option>
                    {/each}
                </select>
            {/if}
        </div>
    </div>

    <!-- Progress bars -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {#each [{label:'HR', prog:hrProg}, {label:'IT', prog:itProg}, {label:'Accounts', prog:accProg}, {label:'Line', prog:linProg}] as { label, prog }}
            <button on:click={() => activeTab = label} class="bg-white border rounded-xl p-2.5 text-left {activeTab === label ? 'border-indigo-300' : 'border-slate-100'}">
                <div class="flex justify-between text-[10px] text-slate-500 mb-1"><span class="font-medium">{label}</span><span>{prog.done}/{prog.total}</span></div>
                <div class="w-full bg-slate-100 rounded-full h-1.5"><div class="h-1.5 rounded-full transition-all {prog.pct === 100 ? 'bg-emerald-500' : 'bg-red-500'}" style="width: {prog.pct}%"></div></div>
            </button>
        {/each}
    </div>

    {@const { checklist, statusKey, remarksKey, prog } = getChecklist(activeTab)}
    <div class="border border-slate-100 rounded-2xl overflow-hidden mb-4">
        <div class="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600">{activeTab} Checklist ({prog.done}/{prog.total})</span>
            {#if D[statusKey]}<span class="text-[10px] px-2 py-0.5 rounded-full {D[statusKey] === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">{D[statusKey]}</span>{/if}
        </div>
        {#if checklist}
            <div class="divide-y divide-slate-50">
                {#each Object.entries(checklist) as [item, checked]}
                    <label class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50/50">
                        <input type="checkbox" bind:checked={checklist[item]} on:change={autoStatus} disabled={Page_Mode === 'View'} class="mt-0.5 rounded border-slate-300"/>
                        <span class="text-xs text-slate-700 {checked ? 'line-through text-slate-400' : ''}">{item}</span>
                    </label>
                {/each}
            </div>
        {/if}
        {#if Page_Mode !== 'View'}
            <div class="px-4 py-3 border-t border-slate-50">
                <label class="block text-[10px] text-slate-400 mb-0.5">{activeTab} Remarks</label>
                <input type="text" bind:value={D[remarksKey]} placeholder="Optional remarks" class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"/>
            </div>
        {:else if D[remarksKey]}<div class="px-4 py-2 text-xs text-slate-500 border-t border-slate-50">Remarks: {D[remarksKey]}</div>{/if}
    </div>

    {#if allComplete}
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 mb-4">
            All exit checklists complete. Saving will update Employee_Self status to "Resigned".
        </div>
    {/if}

    {#if Page_Mode !== 'View'}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button on:click={closeModal} class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button on:click={save} disabled={saving} class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Create Exit Entry' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}