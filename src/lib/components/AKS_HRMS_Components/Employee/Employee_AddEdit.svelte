<script>
    /**
     * Employee_AddEdit.svelte — FULL IMPLEMENTATION
     * ─────────────────────────────────────────────────────────────────
     * Handles Add / View / Edit for a single employee record.
     * 8 tabs, ~70+ fields, all ported from Employee_Profile_Page.svelte.
     * Mobile-first responsive design (cards replace tables on small screens).
     *
     * Tabs:
     *   1. Employee Details   — org structure, designation, reporting managers
     *   2. Personal Details   — personal info + family details table
     *   3. Identification     — Aadhaar, PAN, Passport, PF, ESI, etc.
     *   4. Education & Prof   — qualifications, certifications, skills (tag chips)
     *   5. Contact Info       — addresses, phone numbers, emails
     *   6. Bank Details       — account info
     *   7. Leave Balance      — leave type allocations (read-only counts)
     *   8. Promotion History  — promotion/increment log
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { closeModal }        from '$lib/stores/AKS_HRMS_Modal_Store';
    import AKS_HRMS_Attachment       from '$lib/components/AKS_HRMS_Components/Shared/AKS_HRMS_Attachment.svelte';

    // ── Props ──────────────────────────────────────────────────────────
    export let editId      = 'Add';
    export let initialMode = 'View';
    export let onSave      = () => {};

    // ── User context ───────────────────────────────────────────────────
    let Live_Data;
    $: Live_Data  = $Live_Data_Storage;
    $: user       = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    // ── State ──────────────────────────────────────────────────────────
    let Page_Mode   = editId === 'Add' ? 'Add' : initialMode;
    let activeTab   = 'Employee Details';
    let saving      = false;
    let loading     = true;

    const TABS = [
        'Employee Details', 'Personal Details', 'Identification & Legal',
        'Education & Professional', 'Contact Info', 'Bank Details',
        'Leave Balance', 'Promotion History'
    ];

    // ── View/Edit helper ───────────────────────────────────────────────
    $: isView = Page_Mode === 'View';
    $: isEdit = Page_Mode === 'Edit' || Page_Mode === 'Add';

    // ── Master data ────────────────────────────────────────────────────
    let Employee_Self_Data          = {};
    let Department_Data             = {};
    let Designation_Data            = {};
    let Leave_Type_Data             = {};
    let Level_1_Reporting_Manager_Data = {};
    let Level_2_Reporting_Manager_Data = {};

    // ── Form data ──────────────────────────────────────────────────────
    let D = {
        Employee_Self_ID: '',
        Employee_Details: {
            Employee_Self_ID: '', Employee_Name: '', Employee_Code: '',
            Department_ID: '', Department_Name: '',
            Designation_ID: '', Designation_Name: '',
            Grade: '', Paygroup: '', Work_Location: '', Cost_Centre: '',
            Level_1_Reporting_To_Designation_ID: '', Level_1_Reporting_To_Designation_Name: '',
            Level_1_Reporting_Manager_ID: '', Level_1_Reporting_Manager_Name: '',
            Level_2_Reporting_To_Designation_ID: '', Level_2_Reporting_To_Designation_Name: '',
            Level_2_Reporting_Manager_ID: '', Level_2_Reporting_Manager_Name: '',
            Date_of_Joining: '', Date_of_Confirmation: '', Date_of_Leaving: '',
            Status: 'Active'
        },
        Personal_Information: {
            Gender: '', Marital_Status: '', Date_of_Birth: '', Anniversary_Date: '',
            Birth_Location: '', Blood_Group: '', Medical_Information: '',
            Family_Details: []
        },
        Education_and_Professional_Information: {
            Qualifications: [], Certifications: [], Previous_Companies: [],
            Total_Experience: '', Languages: [], Skills: [],
            Resume: []
        },
        Contact_Information: {
            Present_Address: '', Permanent_Address: '',
            Phone_Numbers: [], Official_Email: '', Personal_Email: ''
        },
        Identification_Documents: {
            Aadhaar_Number: '', PAN_Number: '', Passport_Number: '',
            Passport_Issue_Date: '', Passport_Expiry_Date: '',
            Driving_License: '', UAN_Number: '', PF_Number: '', ESIC_Number: '',
            LIN_Number: '', LIC_Gratuity_Number: '', Mediclaim_Policy: '',
            Documents: []
        },
        Bank_Details: {
            Account_Number: '', Bank_Name: '', Branch_Name: '', IFSC_Code: ''
        },
        Promotion_and_Increment_History: [],
        Leave_Balance: []
    };

    // ── Lifecycle ──────────────────────────────────────────────────────
    onMount(async () => {
        const masterData   = await post(API_PATHS.API_URL_Get_Master_Data_for_Employee_Details);
        Employee_Self_Data = masterData.Employee_Self_Data ?? {};
        Department_Data    = masterData.Department_Data    ?? {};
        Designation_Data   = masterData.Designation_Data   ?? {};
        Leave_Type_Data    = masterData.Leave_Type_Data    ?? {};

        if (editId !== 'Add') {
            D = await post(API_PATHS.API_URL_Get_Employee_Details_by_ID, { Employee_Details_ID: editId });
            // Stringify IDs for select binding
            ['Designation_ID','Department_ID','Level_1_Reporting_Manager_ID','Level_2_Reporting_Manager_ID']
                .forEach(k => { if (D.Employee_Details[k]) D.Employee_Details[k] = String(D.Employee_Details[k]); });
            // Load manager dropdowns based on designation
            await loadManagersByDesignation();
        }
        loading = false;
    });

    // ── Designation change → reload managers ───────────────────────────
    async function onDesignationChange() {
        const desig = Designation_Data[D.Employee_Details.Designation_ID];
        if (!desig) return;
        D.Employee_Details.Designation_Name                   = desig.Designation_Name ?? '';
        D.Employee_Details.Level_1_Reporting_To_Designation_ID   = desig.Level_1_Reporting_To_Designation_ID ?? '';
        D.Employee_Details.Level_1_Reporting_To_Designation_Name = desig.Level_1_Reporting_To_Designation_Name ?? '';
        D.Employee_Details.Level_2_Reporting_To_Designation_ID   = desig.Level_2_Reporting_To_Designation_ID ?? '';
        D.Employee_Details.Level_2_Reporting_To_Designation_Name = desig.Level_2_Reporting_To_Designation_Name ?? '';
        await loadManagersByDesignation();
        D = { ...D };
    }

    async function loadManagersByDesignation() {
        const res = await post(API_PATHS.API_URL_Get_Manager_Details_based_on_Designation, {
            Designation_ID:                      D.Employee_Details.Designation_ID,
            Level_1_Reporting_To_Designation_ID: D.Employee_Details.Level_1_Reporting_To_Designation_ID,
            Level_2_Reporting_To_Designation_ID: D.Employee_Details.Level_2_Reporting_To_Designation_ID
        });
        Level_1_Reporting_Manager_Data = res.Level_1_Reporting_Manager_Data ?? {};
        Level_2_Reporting_Manager_Data = res.Level_2_Reporting_Manager_Data ?? {};
    }

    function onDepartmentChange() {
        D.Employee_Details.Department_Name = Department_Data[D.Employee_Details.Department_ID]?.Department_Name ?? '';
    }

    // Manager dropdowns key on Employee_Details_ID (the value stored in
    // *_Reporting_Manager_ID). Always look up against the loaded manager dict.
    function onManager1Change() {
        D.Employee_Details.Level_1_Reporting_Manager_Name =
            Level_1_Reporting_Manager_Data[D.Employee_Details.Level_1_Reporting_Manager_ID]?.Employee_Name ?? '';
    }

    function onManager2Change() {
        D.Employee_Details.Level_2_Reporting_Manager_Name =
            Level_2_Reporting_Manager_Data[D.Employee_Details.Level_2_Reporting_Manager_ID]?.Employee_Name ?? '';
    }

    // ── Employee selection (Add mode) ──────────────────────────────────
    function onEmployeeSelect() {
        const emp = Employee_Self_Data[D.Employee_Self_ID];
        if (emp) D.Employee_Details.Employee_Name = emp.Employee_Name ?? '';
    }

    // ── Family Details CRUD ────────────────────────────────────────────
    function addFamily() {
        D.Personal_Information.Family_Details = [...D.Personal_Information.Family_Details,
            { Name:'', Relation:'', DOB:'', Age:'', isNominee:false, nomineePercentage:0, IsEmergencyContact:false, Contact_Number:'' }
        ];
    }
    function removeFamily(i) {
        D.Personal_Information.Family_Details.splice(i, 1);
        D.Personal_Information.Family_Details = [...D.Personal_Information.Family_Details];
    }

    // ── Tag array CRUD (Qualifications, Certifications, etc.) ──────────
    function addTag(section, field) { D[section][field] = [...D[section][field], '']; }
    function removeTag(section, field, i) {
        D[section][field].splice(i, 1);
        D[section][field] = [...D[section][field]];
    }

    // ── Phone numbers CRUD ─────────────────────────────────────────────
    function addPhone() { D.Contact_Information.Phone_Numbers = [...D.Contact_Information.Phone_Numbers, '']; }
    function removePhone(i) {
        D.Contact_Information.Phone_Numbers.splice(i, 1);
        D.Contact_Information.Phone_Numbers = [...D.Contact_Information.Phone_Numbers];
    }

    // ── Promotion History CRUD ─────────────────────────────────────────
    function addPromotion() {
        D.Promotion_and_Increment_History = [...D.Promotion_and_Increment_History,
            { Date:'', New_Designation:'', New_Grade:'', New_Paygroup:'', New_Cost_Centre:'', New_Work_Location:'', Remarks:'', Increment_Percentage:'' }
        ];
    }
    function removePromotion(i) {
        D.Promotion_and_Increment_History.splice(i, 1);
        D.Promotion_and_Increment_History = [...D.Promotion_and_Increment_History];
    }

    // ── Leave Balance CRUD ─────────────────────────────────────────────
    function addLeaveRow() {
        if (!Array.isArray(D.Leave_Balance)) D.Leave_Balance = [];
        D.Leave_Balance = [...D.Leave_Balance,
            { Leave_Type_ID:'', Leave_Type_Name:'', Assigned_Count:0, Pending_Count:0, In_Progress_Count:0, Rejected_Count:0, Approved_Count:0, Utilized_Count:0, Leave_Balance:0, Leave_Entry_IDs:'' }
        ];
    }
    function removeLeaveRow(i) {
        D.Leave_Balance.splice(i, 1);
        D.Leave_Balance = [...D.Leave_Balance];
    }
    function onLeaveTypeSelect(i) {
        D.Leave_Balance[i].Leave_Type_Name = Leave_Type_Data[D.Leave_Balance[i].Leave_Type_ID]?.Leave_Type_Name ?? '';
        D = { ...D };
    }

    // ── Save ───────────────────────────────────────────────────────────
    async function save() {
        saving = true;
        const result = await post(API_PATHS.API_URL_Save_Employee_Details_Data, {
            User_Information: user,
            Edit_ID: editId,
            Employee_Self_ID: D.Employee_Self_ID,
            Employee_Details_Data: D
        });
        saving = false;
        if (result.status === 'success') { await onSave(); closeModal(); }
        else alert(result.message ?? 'Save failed.');
    }
</script>

<!-- ── Mode bar ────────────────────────────────────────────────────── -->
<div class="flex items-center justify-between mb-4">
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">
        {#if Page_Mode !== 'Add'}
            {#each ['View','Edit'] as m}
                <button on:click={() => { if(isHRAdmin || m==='View') Page_Mode = m; }}
                    class="px-3 py-1.5 rounded-lg transition-colors
                        {Page_Mode === m ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                    {m}
                </button>
            {/each}
        {:else}
            <span class="px-3 py-1.5 text-slate-600">New Employee</span>
        {/if}
    </div>
    {#if isView && isHRAdmin}
        <button on:click={() => Page_Mode = 'Edit'}
            class="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-medium rounded-xl">Edit</button>
    {/if}
</div>

<!-- ── Tabs (scroll on mobile) ──────────────────────────────────── -->
<div class="flex gap-1 overflow-x-auto pb-1 mb-4 border-b border-slate-100 -mx-1 px-1">
    {#each TABS as tab}
        <button on:click={() => activeTab = tab}
            class="px-3 py-2 text-[11px] sm:text-xs font-medium whitespace-nowrap rounded-t-lg transition-colors shrink-0
                {activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-500 -mb-px bg-white'
                    : 'text-slate-500 hover:text-slate-700'}">
            {tab}
        </button>
    {/each}
</div>

{#if loading}
    <div class="flex justify-center py-16">
        <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
{:else}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 1: Employee Details
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Employee Details'}

        <!-- Employee selector (Add mode only) -->
        {#if Page_Mode === 'Add'}
            <div class="mb-4">
                <label class="block text-xs font-medium text-slate-600 mb-1">Select Employee</label>
                <select bind:value={D.Employee_Self_ID} on:change={onEmployeeSelect}
                    class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                    <option value="">— Select Employee —</option>
                    {#each Object.entries(Employee_Self_Data) as [id, emp]}
                        <option value={id}>{emp.Employee_Name}</option>
                    {/each}
                </select>
            </div>
        {/if}

        <!-- Header strip -->
        {#if D.Employee_Details?.Employee_Name}
            <div class="bg-slate-50 rounded-2xl px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <p class="text-base font-bold text-slate-800">{D.Employee_Details.Employee_Name}</p>
                    <p class="text-xs text-slate-400">ID: {editId} · Self ID: {D.Employee_Self_ID}</p>
                </div>
                <div>
                    {#if isView}
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium
                            {D.Employee_Details.Status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                             D.Employee_Details.Status === 'Resigned' ? 'bg-red-100 text-red-700' :
                             'bg-amber-100 text-amber-700'}">
                            {D.Employee_Details.Status || '—'}
                        </span>
                    {:else}
                        <select bind:value={D.Employee_Details.Status}
                            class="border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400">
                            <option value="Active">Active</option>
                            <option value="Absconding">Absconding</option>
                            <option value="Resigned">Resigned</option>
                        </select>
                    {/if}
                </div>
            </div>
        {/if}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <!-- Employee Code -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Employee Code</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details.Employee_Code || '—'}</p>
                {:else}<input type="text" bind:value={D.Employee_Details.Employee_Code} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>
            <div></div>

            <!-- Designation -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Designation</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details.Designation_Name || '—'}</p>
                {:else}
                    <select bind:value={D.Employee_Details.Designation_ID} on:change={onDesignationChange}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select Designation</option>
                        {#each Object.entries(Designation_Data) as [id, d]}
                            <option value={id}>{d.Designation_Name}</option>
                        {/each}
                    </select>
                {/if}
            </div>
            <!-- Department -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Department</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details.Department_Name || '—'}</p>
                {:else}
                    <select bind:value={D.Employee_Details.Department_ID} on:change={onDepartmentChange}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select Department</option>
                        {#each Object.entries(Department_Data) as [id, d]}
                            <option value={id}>{d.Department_Name}</option>
                        {/each}
                    </select>
                {/if}
            </div>

            <!-- L1 Manager -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">
                    L1 Manager {#if D.Employee_Details.Level_1_Reporting_To_Designation_Name}
                        <span class="text-slate-400">({D.Employee_Details.Level_1_Reporting_To_Designation_Name})</span>
                    {/if}
                </label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details.Level_1_Reporting_Manager_Name || '—'}</p>
                {:else}
                    <select bind:value={D.Employee_Details.Level_1_Reporting_Manager_ID} on:change={onManager1Change}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select L1 Manager</option>
                        {#each Object.entries(Level_1_Reporting_Manager_Data) as [id, m]}
                            <option value={id}>{m.Employee_Name}</option>
                        {/each}
                    </select>
                {/if}
            </div>
            <!-- L2 Manager -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">
                    L2 Manager {#if D.Employee_Details.Level_2_Reporting_To_Designation_Name}
                        <span class="text-slate-400">({D.Employee_Details.Level_2_Reporting_To_Designation_Name})</span>
                    {/if}
                </label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details.Level_2_Reporting_Manager_Name || '—'}</p>
                {:else}
                    <select bind:value={D.Employee_Details.Level_2_Reporting_Manager_ID} on:change={onManager2Change}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select L2 Manager</option>
                        {#each Object.entries(Level_2_Reporting_Manager_Data) as [id, m]}
                            <option value={id}>{m.Employee_Name}</option>
                        {/each}
                    </select>
                {/if}
            </div>

            <!-- Grade, Paygroup, Cost Centre, Work Location -->
            {#each [
                ['Grade',         'Grade'],
                ['Paygroup',      'Paygroup'],
                ['Cost Centre',   'Cost_Centre'],
                ['Work Location', 'Work_Location']
            ] as [label, key]}
                <div>
                    <label class="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
                    {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details[key] || '—'}</p>
                    {:else}<input type="text" bind:value={D.Employee_Details[key]} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
                </div>
            {/each}

            <!-- Dates -->
            {#each [
                ['Date of Joining',       'Date_of_Joining'],
                ['Date of Confirmation',  'Date_of_Confirmation'],
                ['Date of Leaving',       'Date_of_Leaving']
            ] as [label, key]}
                <div>
                    <label class="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
                    {#if isView}<p class="text-sm text-slate-800 py-1">{D.Employee_Details[key] || '—'}</p>
                    {:else}<input type="date" bind:value={D.Employee_Details[key]} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
                </div>
            {/each}
        </div>
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 2: Personal Details
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Personal Details'}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-5">
            <!-- Gender -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Gender</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Personal_Information.Gender || '—'}</p>
                {:else}
                    <select bind:value={D.Personal_Information.Gender}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select</option>
                        {#each ['Male','Female','Other'] as g}<option value={g}>{g}</option>{/each}
                    </select>
                {/if}
            </div>
            <!-- Marital Status -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Marital Status</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D.Personal_Information.Marital_Status || '—'}</p>
                {:else}
                    <select bind:value={D.Personal_Information.Marital_Status}
                        class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                        <option value="">Select</option>
                        {#each ['Single','Married','Separated','Divorced','Widowed'] as s}<option value={s}>{s}</option>{/each}
                    </select>
                {/if}
            </div>
            {#each [
                ['Date of Birth',     'Date_of_Birth',     'date'],
                ['Anniversary Date',  'Anniversary_Date',  'date'],
                ['Birth Location',    'Birth_Location',    'text'],
                ['Blood Group',       'Blood_Group',       'text'],
                ['Medical Info',      'Medical_Information','text']
            ] as [label, key, type]}
                <div>
                    <label class="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
                    {#if isView}<p class="text-sm text-slate-800 py-1">{D.Personal_Information[key] || '—'}</p>
                    {:else}<input {type} bind:value={D.Personal_Information[key]} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
                </div>
            {/each}
        </div>

        <!-- Family Details -->
        <div class="border-t border-slate-100 pt-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs font-semibold text-slate-600">Family Details</h3>
                {#if isEdit}
                    <button on:click={addFamily} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs rounded-xl hover:bg-[#16304f]">+ Add</button>
                {/if}
            </div>
            {#if D.Personal_Information.Family_Details.length === 0}
                <p class="text-xs text-slate-400 py-4 text-center">No family members added.</p>
            {:else}
                <!-- Desktop table -->
                <div class="hidden lg:block overflow-x-auto rounded-xl border border-slate-100">
                    <table class="w-full text-sm">
                        <thead class="bg-slate-50"><tr>
                            {#each ['Name','Relation','DOB','Age','Nominee','%','Emergency','Phone'] as h}
                                <th class="text-left text-[10px] font-semibold text-slate-500 px-3 py-2">{h}</th>
                            {/each}
                            {#if isEdit}<th class="px-3 py-2"></th>{/if}
                        </tr></thead>
                        <tbody class="divide-y divide-slate-50">
                            {#each D.Personal_Information.Family_Details as fm, i}
                                <tr>
                                    <td class="px-3 py-2">{#if isView}{fm.Name || '—'}{:else}<input type="text" bind:value={D.Personal_Information.Family_Details[i].Name} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}</td>
                                    <td class="px-3 py-2">{#if isView}{fm.Relation || '—'}{:else}<input type="text" bind:value={D.Personal_Information.Family_Details[i].Relation} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}</td>
                                    <td class="px-3 py-2">{#if isView}{fm.DOB || '—'}{:else}<input type="date" bind:value={D.Personal_Information.Family_Details[i].DOB} class="border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}</td>
                                    <td class="px-3 py-2 w-16">{#if isView}{fm.Age || '—'}{:else}<input type="number" bind:value={D.Personal_Information.Family_Details[i].Age} class="w-14 border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}</td>
                                    <td class="px-3 py-2 text-center">{#if isView}{fm.isNominee ? '✓' : '—'}{:else}<input type="checkbox" bind:checked={D.Personal_Information.Family_Details[i].isNominee}/>{/if}</td>
                                    <td class="px-3 py-2 w-16">{#if isView}{fm.nomineePercentage ?? 0}%{:else}<input type="number" bind:value={D.Personal_Information.Family_Details[i].nomineePercentage} class="w-14 border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}</td>
                                    <td class="px-3 py-2 text-center">{#if isView}{fm.IsEmergencyContact ? '✓' : '—'}{:else}<input type="checkbox" bind:checked={D.Personal_Information.Family_Details[i].IsEmergencyContact}/>{/if}</td>
                                    <td class="px-3 py-2">{#if isView}{fm.Contact_Number || '—'}{:else}<input type="text" bind:value={D.Personal_Information.Family_Details[i].Contact_Number} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}</td>
                                    {#if isEdit}<td class="px-3 py-2"><button on:click={() => removeFamily(i)} class="text-red-500 text-xs hover:text-red-700">✕</button></td>{/if}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                <!-- Mobile cards -->
                <div class="lg:hidden space-y-2">
                    {#each D.Personal_Information.Family_Details as fm, i}
                        <div class="bg-white border border-slate-100 rounded-2xl p-3">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex-1 grid grid-cols-2 gap-2 text-xs">
                                    <div><span class="text-slate-400">Name:</span> {#if isView}{fm.Name || '—'}{:else}<input type="text" bind:value={D.Personal_Information.Family_Details[i].Name} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs mt-0.5"/>{/if}</div>
                                    <div><span class="text-slate-400">Relation:</span> {#if isView}{fm.Relation || '—'}{:else}<input type="text" bind:value={D.Personal_Information.Family_Details[i].Relation} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs mt-0.5"/>{/if}</div>
                                    <div><span class="text-slate-400">DOB:</span> {#if isView}{fm.DOB || '—'}{:else}<input type="date" bind:value={D.Personal_Information.Family_Details[i].DOB} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs mt-0.5"/>{/if}</div>
                                    <div><span class="text-slate-400">Phone:</span> {#if isView}{fm.Contact_Number || '—'}{:else}<input type="text" bind:value={D.Personal_Information.Family_Details[i].Contact_Number} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs mt-0.5"/>{/if}</div>
                                </div>
                                {#if isEdit}<button on:click={() => removeFamily(i)} class="text-red-500 text-xs ml-2">✕</button>{/if}
                            </div>
                            <div class="flex gap-4 text-[10px] text-slate-500">
                                <label class="flex items-center gap-1">
                                    {#if isView}{fm.isNominee ? '✓ Nominee' : ''}{:else}<input type="checkbox" bind:checked={D.Personal_Information.Family_Details[i].isNominee} class="rounded"/> Nominee{/if}
                                </label>
                                <label class="flex items-center gap-1">
                                    {#if isView}{fm.IsEmergencyContact ? '✓ Emergency' : ''}{:else}<input type="checkbox" bind:checked={D.Personal_Information.Family_Details[i].IsEmergencyContact} class="rounded"/> Emergency{/if}
                                </label>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 3: Identification & Legal
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Identification & Legal'}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 mb-5">
            {#each [
                ['Aadhaar Number',      'Aadhaar_Number',      'text'],
                ['PAN Number',          'PAN_Number',          'text'],
                ['Passport Number',     'Passport_Number',     'text'],
                ['Passport Issue Date', 'Passport_Issue_Date', 'date'],
                ['Passport Expiry',     'Passport_Expiry_Date','date'],
                ['Driving License',     'Driving_License',     'text'],
                ['UAN Number',          'UAN_Number',          'text'],
                ['PF Number',           'PF_Number',           'text'],
                ['ESIC Number',         'ESIC_Number',         'text'],
                ['LIN Number',          'LIN_Number',          'text'],
                ['LIC Gratuity Number', 'LIC_Gratuity_Number', 'text'],
                ['Mediclaim Policy',    'Mediclaim_Policy',    'text']
            ] as [label, key, type]}
                <div>
                    <label class="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
                    {#if isView}<p class="text-sm text-slate-800 py-1">{D.Identification_Documents[key] || '—'}</p>
                    {:else}<input {type} bind:value={D.Identification_Documents[key]} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
                </div>
            {/each}
        </div>
        <!-- Documents attachment -->
        <div class="border-t border-slate-100 pt-4">
            <AKS_HRMS_Attachment bind:value={D.Identification_Documents.Documents}/>
        </div>
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 4: Education & Professional
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Education & Professional'}
        {@const EDU = 'Education_and_Professional_Information'}
        <div class="space-y-5">
            <!-- Tag arrays: Qualifications, Certifications, Previous Companies, Languages, Skills -->
            {#each [
                ['Qualifications',     'Qualifications'],
                ['Certifications',     'Certifications'],
                ['Previous Companies', 'Previous_Companies'],
                ['Languages',          'Languages'],
                ['Skills',             'Skills']
            ] as [label, field]}
                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <label class="text-[11px] font-medium text-slate-500">{label}</label>
                        {#if isEdit}
                            <button on:click={() => addTag(EDU, field)}
                                class="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium">+ Add</button>
                        {/if}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each D[EDU][field] as item, idx}
                            <div class="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-xs">
                                {#if isView}
                                    <span>{item || '—'}</span>
                                {:else}
                                    <input type="text" bind:value={D[EDU][field][idx]}
                                        class="bg-transparent border-none outline-none w-24 text-xs text-indigo-700 placeholder-indigo-300"
                                        placeholder="Type here…"/>
                                    <button on:click={() => removeTag(EDU, field, idx)} class="text-red-400 hover:text-red-600">✕</button>
                                {/if}
                            </div>
                        {/each}
                        {#if D[EDU][field].length === 0}
                            <span class="text-xs text-slate-400">None added</span>
                        {/if}
                    </div>
                </div>
            {/each}

            <!-- Total Experience -->
            <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-0.5">Total Experience</label>
                {#if isView}<p class="text-sm text-slate-800 py-1">{D[EDU].Total_Experience || '—'}</p>
                {:else}<input type="text" bind:value={D[EDU].Total_Experience} placeholder="e.g. 5 years 3 months" class="w-full sm:w-64 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
            </div>

            <!-- Resume attachment -->
            <div class="border-t border-slate-100 pt-4">
                <AKS_HRMS_Attachment bind:value={D[EDU].Resume}/>
            </div>
        </div>
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 5: Contact Info
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Contact Info'}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-5">
            {#each [
                ['Present Address',   'Present_Address'],
                ['Permanent Address', 'Permanent_Address'],
                ['Official Email',    'Official_Email'],
                ['Personal Email',    'Personal_Email']
            ] as [label, key]}
                <div class={label.includes('Address') ? 'sm:col-span-1' : ''}>
                    <label class="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
                    {#if isView}<p class="text-sm text-slate-800 py-1 whitespace-pre-line">{D.Contact_Information[key] || '—'}</p>
                    {:else}
                        {#if label.includes('Address')}
                            <textarea bind:value={D.Contact_Information[key]} rows="3"
                                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"></textarea>
                        {:else}
                            <input type="email" bind:value={D.Contact_Information[key]}
                                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
                        {/if}
                    {/if}
                </div>
            {/each}
        </div>

        <!-- Phone Numbers -->
        <div class="border-t border-slate-100 pt-4">
            <div class="flex items-center justify-between mb-2">
                <label class="text-[11px] font-medium text-slate-500">Phone Numbers</label>
                {#if isEdit}<button on:click={addPhone} class="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium">+ Add</button>{/if}
            </div>
            <div class="space-y-2">
                {#each D.Contact_Information.Phone_Numbers as phone, i}
                    <div class="flex items-center gap-2">
                        {#if isView}<p class="text-sm text-slate-800">{phone || '—'}</p>
                        {:else}
                            <input type="tel" bind:value={D.Contact_Information.Phone_Numbers[i]}
                                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
                            <button on:click={() => removePhone(i)} class="text-red-500 text-xs hover:text-red-700">✕</button>
                        {/if}
                    </div>
                {/each}
                {#if D.Contact_Information.Phone_Numbers.length === 0}
                    <p class="text-xs text-slate-400">No phone numbers added.</p>
                {/if}
            </div>
        </div>
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 6: Bank Details
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Bank Details'}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {#each [
                ['Account Number', 'Account_Number'],
                ['Bank Name',      'Bank_Name'],
                ['Branch',         'Branch_Name'],
                ['IFSC Code',      'IFSC_Code']
            ] as [label, key]}
                <div>
                    <label class="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
                    {#if isView}<p class="text-sm text-slate-800 py-1">{D.Bank_Details[key] || '—'}</p>
                    {:else}<input type="text" bind:value={D.Bank_Details[key]} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>{/if}
                </div>
            {/each}
        </div>
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 7: Leave Balance
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Leave Balance'}
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-slate-600">Leave Balance Summary</h3>
            {#if isEdit}
                <button on:click={addLeaveRow} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs rounded-xl hover:bg-[#16304f]">+ Add Leave Type</button>
            {/if}
        </div>

        {#if !Array.isArray(D.Leave_Balance) || D.Leave_Balance.length === 0}
            <p class="text-xs text-slate-400 py-8 text-center">No leave types configured.</p>
        {:else}
            <!-- Desktop table -->
            <div class="hidden lg:block overflow-x-auto rounded-xl border border-slate-100">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50"><tr>
                        {#each ['Leave Type','Assigned','Pending','In-Prog','Rejected','Approved','Used','Balance'] as h}
                            <th class="text-left text-[10px] font-semibold text-slate-500 px-3 py-2">{h}</th>
                        {/each}
                        {#if isEdit}<th class="px-3 py-2"></th>{/if}
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        {#each D.Leave_Balance as lb, i}
                            <tr>
                                <td class="px-3 py-2 min-w-[140px]">
                                    {#if isView}{Leave_Type_Data[lb.Leave_Type_ID]?.Leave_Type_Name ?? lb.Leave_Type_Name ?? '—'}
                                    {:else}
                                        <select bind:value={D.Leave_Balance[i].Leave_Type_ID} on:change={() => onLeaveTypeSelect(i)}
                                            class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs">
                                            <option value="">Select</option>
                                            {#each Object.entries(Leave_Type_Data) as [id, lt]}
                                                <option value={Number(id)}>{lt.Leave_Type_Name}</option>
                                            {/each}
                                        </select>
                                    {/if}
                                </td>
                                <td class="px-3 py-2">{#if isEdit}<input type="number" step="0.5" bind:value={D.Leave_Balance[i].Assigned_Count} class="w-14 border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{:else}{lb.Assigned_Count}{/if}</td>
                                <td class="px-3 py-2 text-slate-400">{lb.Pending_Count}</td>
                                <td class="px-3 py-2 text-slate-400">{lb.In_Progress_Count}</td>
                                <td class="px-3 py-2 text-slate-400">{lb.Rejected_Count}</td>
                                <td class="px-3 py-2 text-slate-400">{lb.Approved_Count}</td>
                                <td class="px-3 py-2 text-slate-400">{lb.Utilized_Count}</td>
                                <td class="px-3 py-2 font-semibold text-slate-800">{lb.Leave_Balance}</td>
                                {#if isEdit}<td class="px-3 py-2"><button on:click={() => removeLeaveRow(i)} class="text-red-500 text-xs">✕</button></td>{/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <!-- Mobile cards -->
            <div class="lg:hidden space-y-2">
                {#each D.Leave_Balance as lb, i}
                    <div class="bg-white border border-slate-100 rounded-2xl p-3">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-slate-800">{Leave_Type_Data[lb.Leave_Type_ID]?.Leave_Type_Name ?? lb.Leave_Type_Name ?? 'Leave Type'}</span>
                            {#if isEdit}<button on:click={() => removeLeaveRow(i)} class="text-red-500 text-xs">✕</button>{/if}
                        </div>
                        {#if isEdit}
                            <div class="flex gap-2 mb-2">
                                <select bind:value={D.Leave_Balance[i].Leave_Type_ID} on:change={() => onLeaveTypeSelect(i)}
                                    class="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                                    <option value="">Select Type</option>
                                    {#each Object.entries(Leave_Type_Data) as [id, lt]}
                                        <option value={Number(id)}>{lt.Leave_Type_Name}</option>
                                    {/each}
                                </select>
                                <div class="flex items-center gap-1 text-xs text-slate-500">
                                    <span>Assigned:</span>
                                    <input type="number" step="0.5" bind:value={D.Leave_Balance[i].Assigned_Count} class="w-14 border border-slate-200 rounded-lg px-2 py-1 text-xs"/>
                                </div>
                            </div>
                        {/if}
                        <div class="grid grid-cols-4 gap-1 text-[10px] text-center">
                            {#each [['Pend', lb.Pending_Count], ['Appr', lb.Approved_Count], ['Used', lb.Utilized_Count], ['Bal', lb.Leave_Balance]] as [l, v]}
                                <div class="bg-slate-50 rounded-lg py-1.5">
                                    <p class="text-slate-400">{l}</p>
                                    <p class="font-semibold text-slate-700">{v}</p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}

    <!-- ────────────────────────────────────────────────────────────────
         TAB 8: Promotion History
    ──────────────────────────────────────────────────────────────────── -->
    {#if activeTab === 'Promotion History'}
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-slate-600">Promotion & Increment History</h3>
            {#if isEdit}
                <button on:click={addPromotion} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs rounded-xl hover:bg-[#16304f]">+ Add</button>
            {/if}
        </div>

        {#if D.Promotion_and_Increment_History.length === 0}
            <p class="text-xs text-slate-400 py-8 text-center">No promotion history.</p>
        {:else}
            <!-- Desktop table -->
            <div class="hidden lg:block overflow-x-auto rounded-xl border border-slate-100">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50"><tr>
                        {#each ['Date','Designation','Grade','Paygroup','Cost Centre','Location','Remarks','Incr %'] as h}
                            <th class="text-left text-[10px] font-semibold text-slate-500 px-3 py-2">{h}</th>
                        {/each}
                        {#if isEdit}<th class="px-3 py-2"></th>{/if}
                    </tr></thead>
                    <tbody class="divide-y divide-slate-50">
                        {#each D.Promotion_and_Increment_History as p, i}
                            <tr>
                                {#each [['Date','date'],['New_Designation','text'],['New_Grade','text'],['New_Paygroup','text'],['New_Cost_Centre','text'],['New_Work_Location','text'],['Remarks','text'],['Increment_Percentage','text']] as [key, type]}
                                    <td class="px-3 py-2">
                                        {#if isView}{p[key] || '—'}
                                        {:else}<input {type} bind:value={D.Promotion_and_Increment_History[i][key]} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs"/>{/if}
                                    </td>
                                {/each}
                                {#if isEdit}<td class="px-3 py-2"><button on:click={() => removePromotion(i)} class="text-red-500 text-xs">✕</button></td>{/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <!-- Mobile cards -->
            <div class="lg:hidden space-y-2">
                {#each D.Promotion_and_Increment_History as p, i}
                    <div class="bg-white border border-slate-100 rounded-2xl p-3">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <p class="text-sm font-medium text-slate-800">{p.New_Designation || 'New Entry'}</p>
                                <p class="text-xs text-slate-400">{p.Date || 'No date'} · {p.Increment_Percentage ? p.Increment_Percentage + '%' : ''}</p>
                            </div>
                            {#if isEdit}<button on:click={() => removePromotion(i)} class="text-red-500 text-xs">✕</button>{/if}
                        </div>
                        {#if isEdit}
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                {#each [['Date','Date','date'],['Designation','New_Designation','text'],['Grade','New_Grade','text'],['Paygroup','New_Paygroup','text'],['Cost Centre','New_Cost_Centre','text'],['Location','New_Work_Location','text'],['Incr %','Increment_Percentage','text'],['Remarks','Remarks','text']] as [label, key, type]}
                                    <div>
                                        <span class="text-slate-400">{label}</span>
                                        <input {type} bind:value={D.Promotion_and_Increment_History[i][key]} class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs mt-0.5"/>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="grid grid-cols-2 gap-1 text-xs text-slate-500">
                                <span>Grade: {p.New_Grade || '—'}</span>
                                <span>Paygroup: {p.New_Paygroup || '—'}</span>
                                <span>Location: {p.New_Work_Location || '—'}</span>
                                <span>Cost Centre: {p.New_Cost_Centre || '—'}</span>
                            </div>
                            {#if p.Remarks}
                                <p class="text-xs text-slate-400 mt-1">Note: {p.Remarks}</p>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    {/if}

    <!-- ── Action bar ──────────────────────────────────────────────── -->
    {#if Page_Mode !== 'View'}
        <div class="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
            <button on:click={closeModal}
                class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
                Cancel
            </button>
            <button on:click={save} disabled={saving}
                class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {saving ? 'Saving…' : Page_Mode === 'Add' ? 'Create Employee' : 'Save Changes'}
            </button>
        </div>
    {/if}
{/if}