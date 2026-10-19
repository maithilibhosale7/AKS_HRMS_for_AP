<script>
    /**
     * RFM_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Recruitment pipeline: Received → Shortlisted → Interview 1/2/3 → Offered → Accepted
     * Each candidate card shows fields relevant to their current stage.
     * On "Accepted" candidates: a "Convert to Onboarding" button triggers:
     *   1. Creates Employee_Self record (Status='Onboarding Pending')
     *   2. Creates Onboarding_Management record (Status='Pending')
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';
    import AKS_HRMS_Attachment       from '$lib/components/AKS_HRMS_Components/Shared/AKS_HRMS_Attachment.svelte';

    export let editId      = 'Add';
    export let initialMode = 'View';
    export let onSave      = () => {};

    let Live_Data;
    $: Live_Data = $Live_Data_Storage;
    $: user      = Live_Data.User_Information ?? {};

    let Page_Mode = editId === 'Add' ? 'Add' : initialMode;
    let loading   = true;
    let saving    = false;
    let converting = false;

    let Department_Data  = {};
    let Designation_Data = {};

    // RFM_Details_Data — the main data blob
    let D = {
        RFM_Date: '', Department_ID: '', Department_Name: '',
        Designation_ID: '', Designation_Name: '', Budget: 0,
        Received_Count: 0, Shortlisted_Count: 0,
        Interviewed_Count_1: 0, Interviewed_Count_2: 0, Interviewed_Count_3: 0,
        Offered_Count: 0, Accepted_Count: 0,
        Candidate_Data: {},
        Status: 'New'
    };

    // ── Pipeline tabs ──────────────────────────────────────────────────
    let activeTab = 'Received';
    const TABS = ['Received','Shortlisted','Interview 1','Interview 2','Interview 3','Offered','Accepted'];

    // Stage filter: which candidate statuses appear on each tab
    const TAB_FILTER = {
        'Received':    ['New','Shortlisted','Interviewed1','Interviewed2','Interviewed3','Offered','Accepted'],
        'Shortlisted': ['Shortlisted','Interviewed1','Interviewed2','Interviewed3','Offered','Accepted'],
        'Interview 1': ['Interviewed1','Interviewed2','Interviewed3','Offered','Accepted'],
        'Interview 2': ['Interviewed2','Interviewed3','Offered','Accepted'],
        'Interview 3': ['Interviewed3','Offered','Accepted'],
        'Offered':     ['Offered','Accepted'],
        'Accepted':    ['Accepted']
    };

    $: filteredCandidates = Object.entries(D.Candidate_Data ?? {}).filter(
        ([_, c]) => TAB_FILTER[activeTab]?.includes(c.Status)
    );

    // Pipeline count bar
    $: pipeline = [
        { label: 'Recv', count: D.Received_Count ?? 0 },
        { label: 'Short', count: D.Shortlisted_Count ?? 0 },
        { label: 'Int1', count: D.Interviewed_Count_1 ?? 0 },
        { label: 'Int2', count: D.Interviewed_Count_2 ?? 0 },
        { label: 'Int3', count: D.Interviewed_Count_3 ?? 0 },
        { label: 'Offer', count: D.Offered_Count ?? 0 },
        { label: 'Accept', count: D.Accepted_Count ?? 0 }
    ];

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        const masterData = await post(API_PATHS.API_URL_Get_Master_Data_for_RFM_Management);
        Department_Data  = masterData.Department_Data ?? {};
        Designation_Data = masterData.Designation_Data ?? {};

        if (editId === 'Add') {
            Page_Mode = 'Add';
            D.RFM_Date = new Date().toISOString().split('T')[0];
        } else {
            const res = await post(API_PATHS.API_URL_Get_RFM_Data_by_ID, { Edit_ID: editId });
            D = res.RFM_Details_Data ?? D;
        }
        loading = false;
    });

    // ── Dropdown handlers ──────────────────────────────────────────────
    function onDeptChange()  { D.Department_Name  = Department_Data[D.Department_ID]?.Department_Name ?? ''; }
    function onDesigChange() { D.Designation_Name = Designation_Data[D.Designation_ID]?.Designation_Name ?? ''; }

    // ── Candidate CRUD ─────────────────────────────────────────────────
    function addCandidate() {
        const idx = String(Object.keys(D.Candidate_Data ?? {}).length + 1);
        if (!D.Candidate_Data) D.Candidate_Data = {};
        D.Candidate_Data[idx] = {
            Candidate_Name: '', Source: '', About_Candidate: '',
            CV: [],
            Status: 'New',
            Shortlist_Date:'', Shortlist_Comments:'',
            Interview_Date_1:'', Interview_Comments_1:'',
            Interview_Date_2:'', Interview_Comments_2:'',
            Interview_Date_3:'', Interview_Comments_3:'',
            Offer_Date:'', Offer_Comments:'', Offer_Amount:0,
            Accepted_Date:'', Accepted_Comments:'', Accepted_Amount:0, Proposed_Joining_Date:''
        };
        D.Received_Count = (D.Received_Count ?? 0) + 1;
        D = { ...D };
    }

    function removeCandidate(idx) {
        if (D.Candidate_Data[idx]?.Status !== 'New') return;
        delete D.Candidate_Data[idx];
        D.Received_Count = Math.max(0, (D.Received_Count ?? 1) - 1);
        D = { ...D };
    }

    // ── Stage progression ──────────────────────────────────────────────
    const STAGE_ORDER = ['New','Shortlisted','Interviewed1','Interviewed2','Interviewed3','Offered','Accepted'];
    const COUNT_KEYS = [null,'Shortlisted_Count','Interviewed_Count_1','Interviewed_Count_2','Interviewed_Count_3','Offered_Count','Accepted_Count'];

    function advanceCandidate(idx, targetStage) {
        const c = D.Candidate_Data[idx];
        if (!c) return;
        const targetIdx = STAGE_ORDER.indexOf(targetStage);
        const currentIdx = STAGE_ORDER.indexOf(c.Status);

        if (targetIdx > currentIdx) {
            // Advance
            const countKey = COUNT_KEYS[targetIdx];
            if (countKey) D[countKey] = (D[countKey] ?? 0) + 1;
            c.Status = targetStage;
        } else if (targetIdx === currentIdx - 1) {
            // Revert one step back
            const countKey = COUNT_KEYS[currentIdx];
            if (countKey) D[countKey] = Math.max(0, (D[countKey] ?? 1) - 1);
            c.Status = targetStage;
        }
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        saving = true;
        const result = await post(API_PATHS.API_URL_Save_RFM_Data, {
            User_Information: user, Edit_ID: editId, RFM_Details: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }

    // ── Convert accepted candidate to Onboarding ───────────────────────
    async function convertToOnboarding(idx) {
        const c = D.Candidate_Data[idx];
        if (!c || c.Status !== 'Accepted') return;
        if (!confirm(`Create Employee_Self + Onboarding for "${c.Candidate_Name}"?`)) return;

        converting = true;
        const result = await post(API_PATHS.API_URL_Convert_RFM_to_Onboarding, {
            User_Information: user,
            RFM_ID: editId,
            Candidate_Index: idx,
            Candidate_Data: c,
            Department_Name: D.Department_Name,
            Designation_Name: D.Designation_Name
        });
        converting = false;

        if (result.status === 'success') {
            c.Converted_to_Onboarding = true;
            c.Employee_Self_ID = result.Employee_Self_ID ?? '';
            D = { ...D };
            alert(`Employee_Self created (ID: ${result.Employee_Self_ID}). Onboarding record created.`);
        } else {
            alert(result.message ?? 'Conversion failed.');
        }
    }

    // ── Status badge colors ────────────────────────────────────────────
    const STATUS_COLORS = {
        New:'bg-slate-100 text-slate-600', Shortlisted:'bg-blue-100 text-blue-700',
        Interviewed1:'bg-indigo-100 text-indigo-700', Interviewed2:'bg-violet-100 text-violet-700',
        Interviewed3:'bg-purple-100 text-purple-700', Offered:'bg-amber-100 text-amber-700',
        Accepted:'bg-emerald-100 text-emerald-700'
    };
</script>

<!-- ── Mode toggle ──────────────────────────────────────────────── -->
<div class="flex items-center justify-between mb-4">
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">
        {#if Page_Mode !== 'Add'}
            {#each ['View','Edit'] as m}
                <button on:click={() => Page_Mode = m}
                    class="px-3 py-1.5 rounded-lg transition-colors {Page_Mode===m ? 'bg-white shadow text-slate-800' : 'text-slate-500'}">{m}</button>
            {/each}
        {:else}
            <span class="px-3 py-1.5 text-slate-600">New RFM</span>
        {/if}
    </div>
    <div class="flex items-center gap-2">
        <select bind:value={D.Status} disabled={Page_Mode === 'View'}
            class="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none disabled:bg-slate-50">
            {#each ['New','Open','Closed','Cancelled'] as s}<option value={s}>{s}</option>{/each}
        </select>
    </div>
</div>

{#if loading}
    <div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
{:else}
    <!-- ── Header fields ─────────────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
            {#if Page_Mode==='View'}
                <p class="block text-[11px] font-medium text-slate-500 mb-0.5">RFM Date</p>
                <p class="text-sm text-slate-800 py-1">{D.RFM_Date || '—'}</p>
            {:else}
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5" for="rfm-date">RFM Date</label>
                <input id="rfm-date" type="date" bind:value={D.RFM_Date} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
            {/if}
        </div>
        <div>
            {#if Page_Mode==='View'}
                <p class="block text-[11px] font-medium text-slate-500 mb-0.5">Department</p>
                <p class="text-sm text-slate-800 py-1">{D.Department_Name || '—'}</p>
            {:else}
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5" for="rfm-department">Department</label>
                <select id="rfm-department" bind:value={D.Department_ID} on:change={onDeptChange} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">Select</option>
                    {#each Object.entries(Department_Data) as [id,d]}<option value={id}>{d.Department_Name}</option>{/each}
                </select>
            {/if}
        </div>
        <div>
            {#if Page_Mode==='View'}
                <p class="block text-[11px] font-medium text-slate-500 mb-0.5">Designation</p>
                <p class="text-sm text-slate-800 py-1">{D.Designation_Name || '—'}</p>
            {:else}
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5" for="rfm-designation">Designation</label>
                <select id="rfm-designation" bind:value={D.Designation_ID} on:change={onDesigChange} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">Select</option>
                    {#each Object.entries(Designation_Data) as [id,d]}<option value={id}>{d.Designation_Name}</option>{/each}
                </select>
            {/if}
        </div>
        <div>
            {#if Page_Mode==='View'}
                <p class="block text-[11px] font-medium text-slate-500 mb-0.5">Budget (₹)</p>
                <p class="text-sm text-slate-800 py-1">₹{D.Budget ?? 0}</p>
            {:else}
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5" for="rfm-budget">Budget (₹)</label>
                <input id="rfm-budget" type="number" step="0.01" bind:value={D.Budget} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
            {/if}
        </div>
    </div>

    <!-- ── Pipeline counter bar ──────────────────────────────────── -->
    <div class="flex gap-1 mb-4 overflow-x-auto pb-1">
        {#each pipeline as p, i}
            <div class="shrink-0 text-center px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 min-w-[50px]">
                <p class="text-[10px] text-slate-400">{p.label}</p>
                <p class="text-sm font-bold text-slate-700">{p.count}</p>
            </div>
            {#if i < pipeline.length - 1}<span class="text-slate-300 self-center">→</span>{/if}
        {/each}
    </div>

    <!-- ── Tab bar ───────────────────────────────────────────────── -->
    <div class="flex gap-1 overflow-x-auto pb-1 mb-4 border-b border-slate-100">
        {#each TABS as tab}
            <button on:click={() => activeTab = tab}
                class="px-3 py-2 text-[11px] font-medium whitespace-nowrap rounded-t-lg shrink-0
                    {activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-500 -mb-px bg-white' : 'text-slate-500'}">
                {tab}
            </button>
        {/each}
    </div>

    <!-- ── Candidate cards ───────────────────────────────────────── -->
    {#if activeTab === 'Received' && Page_Mode !== 'View'}
        <div class="flex justify-end mb-3">
            <button on:click={addCandidate} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs rounded-xl hover:bg-[#16304f]">+ Add Candidate</button>
        </div>
    {/if}

    {#if filteredCandidates.length === 0}
        <p class="text-xs text-slate-400 py-8 text-center">No candidates at this stage.</p>
    {:else}
        <div class="space-y-3">
            {#each filteredCandidates as [idx, c]}
                <div class="bg-white border border-slate-100 rounded-2xl p-4">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <span class="text-[10px] text-slate-400">#{idx}</span>
                            {#if Page_Mode !== 'View' && activeTab === 'Received'}
                                <input type="text" bind:value={D.Candidate_Data[idx].Candidate_Name} placeholder="Candidate name"
                                    class="block w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-0.5 focus:outline-none focus:border-indigo-400"/>
                            {:else}
                                <p class="text-sm font-semibold text-slate-800">{c.Candidate_Name || '—'}</p>
                            {/if}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium {STATUS_COLORS[c.Status] ?? 'bg-slate-100'}">{c.Status}</span>
                            {#if Page_Mode !== 'View' && c.Status === 'New'}
                                <button on:click={() => removeCandidate(idx)} class="text-red-500 text-xs">✕</button>
                            {/if}
                        </div>
                    </div>

                    {#if Page_Mode !== 'View'}
                        <!-- Source + About (editable on Received tab) -->
                        {#if activeTab === 'Received'}
                            <div class="grid grid-cols-3 gap-2 mb-2">
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-source">Source</label>
                                    <input id="cand-{idx}-source" type="text" bind:value={D.Candidate_Data[idx].Source} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div class="col-span-2"><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-about">About</label>
                                    <input id="cand-{idx}-about" type="text" bind:value={D.Candidate_Data[idx].About_Candidate} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                            </div>
                            <AKS_HRMS_Attachment bind:value={D.Candidate_Data[idx].CV}/>
                        {/if}

                        <!-- Shortlist fields -->
                        {#if activeTab === 'Shortlisted' && (c.Status === 'Shortlisted')}
                            <div class="grid grid-cols-3 gap-2 mb-2">
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-shortlist-date">Shortlist Date</label>
                                    <input id="cand-{idx}-shortlist-date" type="date" bind:value={D.Candidate_Data[idx].Shortlist_Date} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div class="col-span-2"><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-shortlist-comments">Comments</label>
                                    <input id="cand-{idx}-shortlist-comments" type="text" bind:value={D.Candidate_Data[idx].Shortlist_Comments} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                            </div>
                        {/if}

                        <!-- Interview fields -->
                        {#each [['Interview 1','Interviewed1','Interview_Date_1','Interview_Comments_1'],['Interview 2','Interviewed2','Interview_Date_2','Interview_Comments_2'],['Interview 3','Interviewed3','Interview_Date_3','Interview_Comments_3']] as [tabName, stage, dateKey, commentsKey]}
                            {#if activeTab === tabName && c.Status === stage}
                                <div class="grid grid-cols-3 gap-2 mb-2">
                                    <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-{dateKey}">{tabName} Date</label>
                                        <input id="cand-{idx}-{dateKey}" type="date" bind:value={D.Candidate_Data[idx][dateKey]} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                    <div class="col-span-2"><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-{commentsKey}">Comments</label>
                                        <input id="cand-{idx}-{commentsKey}" type="text" bind:value={D.Candidate_Data[idx][commentsKey]} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                </div>
                            {/if}
                        {/each}

                        <!-- Offer fields -->
                        {#if activeTab === 'Offered' && c.Status === 'Offered'}
                            <div class="grid grid-cols-4 gap-2 mb-2">
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-offer-date">Offer Date</label>
                                    <input id="cand-{idx}-offer-date" type="date" bind:value={D.Candidate_Data[idx].Offer_Date} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div class="col-span-2"><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-offer-comments">Comments</label>
                                    <input id="cand-{idx}-offer-comments" type="text" bind:value={D.Candidate_Data[idx].Offer_Comments} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-offer-amount">Amount</label>
                                    <input id="cand-{idx}-offer-amount" type="number" step="0.01" bind:value={D.Candidate_Data[idx].Offer_Amount} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                            </div>
                        {/if}

                        <!-- Accepted fields -->
                        {#if activeTab === 'Accepted' && c.Status === 'Accepted'}
                            <div class="grid grid-cols-4 gap-2 mb-2">
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-accepted-date">Accepted Date</label>
                                    <input id="cand-{idx}-accepted-date" type="date" bind:value={D.Candidate_Data[idx].Accepted_Date} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-accepted-amount">Amount</label>
                                    <input id="cand-{idx}-accepted-amount" type="number" step="0.01" bind:value={D.Candidate_Data[idx].Accepted_Amount} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-joining-date">Joining Date</label>
                                    <input id="cand-{idx}-joining-date" type="date" bind:value={D.Candidate_Data[idx].Proposed_Joining_Date} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                                <div><label class="block text-[10px] text-slate-400 mb-0.5" for="cand-{idx}-accepted-comments">Comments</label>
                                    <input id="cand-{idx}-accepted-comments" type="text" bind:value={D.Candidate_Data[idx].Accepted_Comments} class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"/></div>
                            </div>
                            <!-- Convert to Onboarding button -->
                            {#if !c.Converted_to_Onboarding}
                                <button on:click={() => convertToOnboarding(idx)} disabled={converting}
                                    class="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                                    {converting ? 'Creating…' : '→ Convert to Onboarding'}
                                </button>
                            {:else}
                                <p class="mt-2 text-xs text-emerald-600 font-medium">✓ Converted (Employee ID: {c.Employee_Self_ID ?? '—'})</p>
                            {/if}
                        {/if}

                        <!-- Stage advance button -->
                        {#if activeTab === 'Received' && c.Status === 'New'}
                            <button on:click={() => advanceCandidate(idx, 'Shortlisted')} class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">→ Shortlist</button>
                        {:else if activeTab === 'Shortlisted' && c.Status === 'Shortlisted'}
                            <button on:click={() => advanceCandidate(idx, 'Interviewed1')} class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">→ Move to Interview 1</button>
                        {:else if activeTab === 'Interview 1' && c.Status === 'Interviewed1'}
                            <button on:click={() => advanceCandidate(idx, 'Interviewed2')} class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">→ Move to Interview 2</button>
                        {:else if activeTab === 'Interview 2' && c.Status === 'Interviewed2'}
                            <button on:click={() => advanceCandidate(idx, 'Interviewed3')} class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">→ Move to Interview 3</button>
                        {:else if activeTab === 'Interview 3' && c.Status === 'Interviewed3'}
                            <button on:click={() => advanceCandidate(idx, 'Offered')} class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">→ Make Offer</button>
                        {:else if activeTab === 'Offered' && c.Status === 'Offered'}
                            <button on:click={() => advanceCandidate(idx, 'Accepted')} class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">→ Mark Accepted</button>
                        {/if}
                    {:else}
                        <!-- View mode: show summary -->
                        <p class="text-xs text-slate-500">{c.Source ?? ''} · {c.About_Candidate ?? ''}</p>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <!-- ── Action bar ────────────────────────────────────────────── -->
    {#if Page_Mode !== 'View'}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
            <button on:click={closeModal} class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button on:click={save} disabled={saving}
                class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Create RFM' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}