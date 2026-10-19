<script>
    /**
     * HRMS_Settings.svelte
     * ─────────────────────────────────────────────────────────────────
     * HR Admin settings panel with 8 tabs:
     *  1. Work Locations — Location name + weekly off day
     *  2. Shifts — Shift name, in/out times, grace period
     *  3. Leave Types — Leave type config (quota, carry-forward, etc.)
     *  4. Departments — Department lookup (F5b de-registered)
     *  5. Designations — Designation lookup + L1/L2 reporting (F5b de-registered)
     *  6. Attendance Types — Attendance Type lookup + value (F5b de-registered)
     *  7. Upload Holidays — Bulk Excel upload
     *  8. Upload Leave Balances — Bulk Excel upload
     */

    import { onMount }           from 'svelte';
    import { post }              from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }         from '$lib/API_PATHS';

    let Live_Data; $: Live_Data = $Live_Data_Storage; $: user = Live_Data.User_Information ?? {};

    let activeTab = 'locations';
    let loading   = true;

    let shifts          = [];
    let locations       = [];
    let leaveTypes      = [];
    let departments     = [];
    let designations    = [];
    let attendanceTypes = [];

    // Edit state
    let editingRow  = null; // { table, id, data }
    let saving      = false;

    // Upload state
    let uploadingHolidays = false;
    let uploadingBalances = false;
    let uploadResult      = null;

    const TABS = [
        { id: 'locations',       label: 'Work Locations',   icon: '📍' },
        { id: 'shifts',          label: 'Shifts',           icon: '⏱️' },
        { id: 'leaveTypes',      label: 'Leave Types',      icon: '📋' },
        { id: 'departments',     label: 'Departments',      icon: '🏢' },
        { id: 'designations',    label: 'Designations',     icon: '👔' },
        { id: 'attendanceTypes', label: 'Attendance Types', icon: '✅' },
        { id: 'holidays',        label: 'Upload Holidays',  icon: '📅' },
        { id: 'balances',        label: 'Upload Balances',  icon: '📊' }
    ];

    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    onMount(fetchAll);

    async function fetchAll() {
        loading = true;
        try {
            const res = await post(API_PATHS.API_URL_Get_HRMS_Settings_Data);
            shifts          = res.Shift_Master         ?? [];
            locations       = res.Work_Location_Master ?? [];
            leaveTypes      = res.Leave_Type_Master    ?? [];
            departments     = res.Department           ?? [];
            designations    = res.Designation          ?? [];
            attendanceTypes = res.Attendance_Type      ?? [];
        } catch (e) { console.error(e); }
        loading = false;
    }

    // ── Generic CRUD ──────────────────────────────────────────────────
    function startAdd(table) {
        const blank = {
            locations:       { Location_Name: '', Weekly_Off_Day: 0 },
            shifts:          { Shift_Name: '', S_InTime: '09:00', S_OutTime: '18:00', Grace_Period_Minutes: 0, Is_Night_Shift: 0 },
            leaveTypes:      { Leave_Type_Name: '', Leave_Type_Code: '', Default_Quota: 0, Is_Carry_Forward: 0, Max_Carry_Forward_Days: 0, Is_Encashable: 0, Is_Sandwich_Rule_Applicable: 0, Max_Consecutive_Days: 0, Min_Days_Before_Application: 0, Negative_Balance_Allowed: 0 },
            departments:     { Department_Name: '', Remarks: '' },
            designations:    { Designation_Name: '', Level_1_Reporting_To_Designation_ID: '', Level_2_Reporting_To_Designation_ID: '', Remarks: '' },
            attendanceTypes: { Attendance_Type_Name: '', Attendance_Type_Value: 0, Remarks: '' }
        };
        editingRow = { table, id: 'Add', data: { ...blank[table] } };
    }

    function startEdit(table, row) {
        const idKey = {
            locations:       'Location_ID',
            shifts:          'Shift_ID',
            leaveTypes:      'Leave_Type_ID',
            departments:     'Department_ID',
            designations:    'Designation_ID',
            attendanceTypes: 'Attendance_Type_ID'
        };
        editingRow = { table, id: row[idKey[table]], data: { ...row } };
    }

    function cancelEdit() { editingRow = null; }

    async function saveRow() {
        if (!editingRow) return;
        saving = true;
        const apiMap = {
            locations:       API_PATHS.API_URL_Save_Work_Location_Master,
            shifts:          API_PATHS.API_URL_Save_Shift_Master,
            leaveTypes:      API_PATHS.API_URL_Save_Leave_Type_Master,
            departments:     API_PATHS.API_URL_Save_Department,
            designations:    API_PATHS.API_URL_Save_Designation,
            attendanceTypes: API_PATHS.API_URL_Save_Attendance_Type
        };
        const result = await post(apiMap[editingRow.table], {
            Edit_ID: editingRow.id,
            Data: editingRow.data,
            Master_Company_ID: user.Master_Company_ID,
            Master_User_ID:    user.Master_User_ID,
            Employee_Self_ID:  user.Employee_Self_ID
        });
        saving = false;
        if (result.status === 'success') { editingRow = null; await fetchAll(); }
        else alert(result.message ?? 'Save failed.');
    }

    async function deleteRow(table, id) {
        if (!confirm('Delete this entry?')) return;
        const apiMap = {
            locations:       API_PATHS.API_URL_Delete_Work_Location_Master,
            shifts:          API_PATHS.API_URL_Delete_Shift_Master,
            leaveTypes:      API_PATHS.API_URL_Delete_Leave_Type_Master,
            departments:     API_PATHS.API_URL_Delete_Department,
            designations:    API_PATHS.API_URL_Delete_Designation,
            attendanceTypes: API_PATHS.API_URL_Delete_Attendance_Type
        };
        await post(apiMap[table], { Delete_ID: id });
        await fetchAll();
    }

    // ── File Upload ───────────────────────────────────────────────────
    async function uploadFile(type) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('User_Information', JSON.stringify(user));

            const apiUrl = type === 'holidays'
                ? API_PATHS.API_URL_Upload_Holidays_Bulk
                : API_PATHS.API_URL_Upload_Leave_Balance_Bulk;

            if (type === 'holidays') uploadingHolidays = true;
            else uploadingBalances = true;
            uploadResult = null;

            try {
                // Use fetch directly for FormData (not JSON)
                const proxyUrl = apiUrl;
                const resp = await fetch(proxyUrl, { method: 'POST', body: formData });
                const result = await resp.json();
                uploadResult = result;
            } catch (err) {
                uploadResult = { status: 'error', message: 'Upload failed: ' + err.message };
            }

            if (type === 'holidays') uploadingHolidays = false;
            else uploadingBalances = false;
        };
        input.click();
    }
</script>

<div class="space-y-4">

    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {#each TABS as tab}
            <button on:click={() => { activeTab = tab.id; uploadResult = null; }}
                class="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                    {activeTab === tab.id ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}">
                {tab.icon} {tab.label}
            </button>
        {/each}
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>

    <!-- ═══ WORK LOCATIONS ═══ -->
    {:else if activeTab === 'locations'}
        <div class="flex justify-between items-center">
            <p class="text-xs text-slate-400">{locations.length} location(s)</p>
            <button on:click={() => startAdd('locations')} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f]">+ Add Location</button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
                <thead class="bg-slate-50"><tr>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Location Name</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Weekly Off</th>
                    <th class="text-right text-xs font-semibold text-slate-500 px-4 py-3 w-24">Actions</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50 bg-white">
                    {#each locations as loc}
                        <tr class="hover:bg-slate-50/50">
                            <td class="px-4 py-3 font-medium text-slate-800">{loc.Location_Name}</td>
                            <td class="px-4 py-3 text-slate-600">{DAYS[loc.Weekly_Off_Day] ?? 'Sunday'}</td>
                            <td class="px-4 py-3 text-right">
                                <button on:click={() => startEdit('locations', loc)} class="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button on:click={() => deleteRow('locations', loc.Location_ID)} class="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    <!-- ═══ SHIFTS ═══ -->
    {:else if activeTab === 'shifts'}
        <div class="flex justify-between items-center">
            <p class="text-xs text-slate-400">{shifts.length} shift(s)</p>
            <button on:click={() => startAdd('shifts')} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f]">+ Add Shift</button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
                <thead class="bg-slate-50"><tr>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Shift Name</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">In Time</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Out Time</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Grace (min)</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Night</th>
                    <th class="text-right text-xs font-semibold text-slate-500 px-4 py-3 w-24">Actions</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50 bg-white">
                    {#each shifts as s}
                        <tr class="hover:bg-slate-50/50">
                            <td class="px-4 py-3 font-medium text-slate-800">{s.Shift_Name}</td>
                            <td class="px-4 py-3 text-slate-600">{s.S_InTime}</td>
                            <td class="px-4 py-3 text-slate-600">{s.S_OutTime}</td>
                            <td class="px-4 py-3 text-slate-600">{s.Grace_Period_Minutes}</td>
                            <td class="px-4 py-3">{Number(s.Is_Night_Shift) ? '🌙 Yes' : 'No'}</td>
                            <td class="px-4 py-3 text-right">
                                <button on:click={() => startEdit('shifts', s)} class="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button on:click={() => deleteRow('shifts', s.Shift_ID)} class="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    <!-- ═══ LEAVE TYPES ═══ -->
    {:else if activeTab === 'leaveTypes'}
        <div class="flex justify-between items-center">
            <p class="text-xs text-slate-400">{leaveTypes.length} leave type(s)</p>
            <button on:click={() => startAdd('leaveTypes')} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f]">+ Add Leave Type</button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
                <thead class="bg-slate-50"><tr>
                    {#each ['Code','Name','Quota','Carry Fwd','Max CF','Encash','Sandwich','Neg Bal',''] as h}
                        <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">{h}</th>
                    {/each}
                </tr></thead>
                <tbody class="divide-y divide-slate-50 bg-white">
                    {#each leaveTypes as lt}
                        <tr class="hover:bg-slate-50/50">
                            <td class="px-3 py-3 font-mono text-xs text-indigo-600 font-bold">{lt.Leave_Type_Code}</td>
                            <td class="px-3 py-3 font-medium text-slate-800">{lt.Leave_Type_Name}</td>
                            <td class="px-3 py-3 text-slate-600">{lt.Default_Quota}</td>
                            <td class="px-3 py-3">{Number(lt.Is_Carry_Forward) ? '✓' : '—'}</td>
                            <td class="px-3 py-3 text-slate-600">{Number(lt.Is_Carry_Forward) ? lt.Max_Carry_Forward_Days : '—'}</td>
                            <td class="px-3 py-3">{Number(lt.Is_Encashable) ? '✓' : '—'}</td>
                            <td class="px-3 py-3">{Number(lt.Is_Sandwich_Rule_Applicable) ? '✓' : '—'}</td>
                            <td class="px-3 py-3">{Number(lt.Negative_Balance_Allowed) ? '✓' : '—'}</td>
                            <td class="px-3 py-3 text-right">
                                <button on:click={() => startEdit('leaveTypes', lt)} class="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button on:click={() => deleteRow('leaveTypes', lt.Leave_Type_ID)} class="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    <!-- ═══ DEPARTMENTS ═══ -->
    {:else if activeTab === 'departments'}
        <div class="flex justify-between items-center">
            <p class="text-xs text-slate-400">{departments.length} department(s)</p>
            <button on:click={() => startAdd('departments')} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f]">+ Add Department</button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
                <thead class="bg-slate-50"><tr>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">ID</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Department Name</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Remarks</th>
                    <th class="text-right text-xs font-semibold text-slate-500 px-4 py-3 w-24">Actions</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50 bg-white">
                    {#each departments as d}
                        <tr class="hover:bg-slate-50/50">
                            <td class="px-4 py-3 font-mono text-xs text-slate-500">{d.Department_ID}</td>
                            <td class="px-4 py-3 font-medium text-slate-800">{d.Department_Name}</td>
                            <td class="px-4 py-3 text-slate-600">{d.Remarks ?? ''}</td>
                            <td class="px-4 py-3 text-right">
                                <button on:click={() => startEdit('departments', d)} class="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button on:click={() => deleteRow('departments', d.Department_ID)} class="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    <!-- ═══ DESIGNATIONS ═══ -->
    {:else if activeTab === 'designations'}
        <div class="flex justify-between items-center">
            <p class="text-xs text-slate-400">{designations.length} designation(s)</p>
            <button on:click={() => startAdd('designations')} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f]">+ Add Designation</button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
                <thead class="bg-slate-50"><tr>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">ID</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Designation Name</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">L1 Reporting</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">L2 Reporting</th>
                    <th class="text-right text-xs font-semibold text-slate-500 px-4 py-3 w-24">Actions</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50 bg-white">
                    {#each designations as dg}
                        <tr class="hover:bg-slate-50/50">
                            <td class="px-4 py-3 font-mono text-xs text-slate-500">{dg.Designation_ID}</td>
                            <td class="px-4 py-3 font-medium text-slate-800">{dg.Designation_Name}</td>
                            <td class="px-4 py-3 text-slate-600">{dg.Level_1_Reporting_To_Designation_ID ?? '—'}</td>
                            <td class="px-4 py-3 text-slate-600">{dg.Level_2_Reporting_To_Designation_ID ?? '—'}</td>
                            <td class="px-4 py-3 text-right">
                                <button on:click={() => startEdit('designations', dg)} class="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button on:click={() => deleteRow('designations', dg.Designation_ID)} class="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    <!-- ═══ ATTENDANCE TYPES ═══ -->
    {:else if activeTab === 'attendanceTypes'}
        <div class="flex justify-between items-center">
            <p class="text-xs text-slate-400">{attendanceTypes.length} attendance type(s)</p>
            <button on:click={() => startAdd('attendanceTypes')} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f]">+ Add Attendance Type</button>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-sm">
                <thead class="bg-slate-50"><tr>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">ID</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Name</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Value</th>
                    <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Remarks</th>
                    <th class="text-right text-xs font-semibold text-slate-500 px-4 py-3 w-24">Actions</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50 bg-white">
                    {#each attendanceTypes as at}
                        <tr class="hover:bg-slate-50/50">
                            <td class="px-4 py-3 font-mono text-xs text-slate-500">{at.Attendance_Type_ID}</td>
                            <td class="px-4 py-3 font-medium text-slate-800">{at.Attendance_Type_Name}</td>
                            <td class="px-4 py-3 text-slate-600">{at.Attendance_Type_Value ?? ''}</td>
                            <td class="px-4 py-3 text-slate-600">{at.Remarks ?? ''}</td>
                            <td class="px-4 py-3 text-right">
                                <button on:click={() => startEdit('attendanceTypes', at)} class="text-xs text-indigo-600 hover:text-indigo-800 mr-2">Edit</button>
                                <button on:click={() => deleteRow('attendanceTypes', at.Attendance_Type_ID)} class="text-xs text-red-500 hover:text-red-700">Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

    <!-- ═══ UPLOAD HOLIDAYS ═══ -->
    {:else if activeTab === 'holidays'}
        <div class="bg-slate-50 rounded-2xl p-5 space-y-4">
            <div>
                <h3 class="text-sm font-semibold text-slate-800 mb-1">Upload Holidays from Excel</h3>
                <p class="text-xs text-slate-400">Upload an Excel file with holiday data. Duplicates (same date + location) are automatically skipped.</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <p class="text-xs font-medium text-slate-600 mb-2">Expected columns (Row 1 = headers):</p>
                <div class="grid grid-cols-5 gap-2 text-[11px]">
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">A: Holiday_Date</span>
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">B: Holiday_Name</span>
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">C: Holiday_Type</span>
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">D: Work_Location</span>
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">E: Description</span>
                </div>
                <p class="text-[10px] text-slate-400 mt-2">Holiday_Type: Public / Restricted / Optional. Work_Location: All Locations / Head Office / Factory (must match Work_Location_Master entries).</p>
            </div>
            <button on:click={() => uploadFile('holidays')} disabled={uploadingHolidays}
                class="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {uploadingHolidays ? 'Uploading…' : '📁 Select & Upload File'}
            </button>
        </div>
        {#if uploadResult}
            <div class="rounded-xl border p-4 {uploadResult.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}">
                <p class="text-sm font-medium {uploadResult.status === 'success' ? 'text-emerald-800' : 'text-red-800'}">{uploadResult.message}</p>
                {#if uploadResult.errors?.length > 0}
                    <details class="mt-2"><summary class="text-xs text-slate-500 cursor-pointer">Show {uploadResult.errors.length} warning(s)</summary>
                        <ul class="mt-1 text-xs text-slate-500 space-y-0.5">{#each uploadResult.errors as err}<li>{err}</li>{/each}</ul>
                    </details>
                {/if}
            </div>
        {/if}

    <!-- ═══ UPLOAD LEAVE BALANCES ═══ -->
    {:else if activeTab === 'balances'}
        <div class="bg-slate-50 rounded-2xl p-5 space-y-4">
            <div>
                <h3 class="text-sm font-semibold text-slate-800 mb-1">Upload Leave Balances from Excel</h3>
                <p class="text-xs text-slate-400">Set or update leave balances for all employees. Each row sets the Assigned count for one leave type per employee.</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <p class="text-xs font-medium text-slate-600 mb-2">Expected columns (Row 1 = headers):</p>
                <div class="grid grid-cols-3 gap-2 text-[11px]">
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">A: Employee_Code</span>
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">B: Leave_Type_Code</span>
                    <span class="bg-slate-100 px-2 py-1 rounded font-mono">C: Assigned_Count</span>
                </div>
                <p class="text-[10px] text-slate-400 mt-2">Employee_Code: must match the employee's code in Employee Details. Leave_Type_Code: CL, PL, SL, CO, etc. (must match Leave_Type_Master).</p>
            </div>
            <button on:click={() => uploadFile('balances')} disabled={uploadingBalances}
                class="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                {uploadingBalances ? 'Uploading…' : '📁 Select & Upload File'}
            </button>
        </div>
        {#if uploadResult}
            <div class="rounded-xl border p-4 {uploadResult.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}">
                <p class="text-sm font-medium {uploadResult.status === 'success' ? 'text-emerald-800' : 'text-red-800'}">{uploadResult.message}</p>
                {#if uploadResult.errors?.length > 0}
                    <details class="mt-2"><summary class="text-xs text-slate-500 cursor-pointer">Show {uploadResult.errors.length} warning(s)</summary>
                        <ul class="mt-1 text-xs text-slate-500 space-y-0.5">{#each uploadResult.errors as err}<li>{err}</li>{/each}</ul>
                    </details>
                {/if}
            </div>
        {/if}
    {/if}
</div>

<!-- ═══ EDIT MODAL (inline overlay) ═══ -->
{#if editingRow}
    <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" on:click|self={cancelEdit}>
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <h3 class="text-sm font-semibold text-slate-800">
                {editingRow.id === 'Add' ? 'Add' : 'Edit'}
                {editingRow.table === 'locations'       ? 'Work Location'
                 : editingRow.table === 'shifts'        ? 'Shift'
                 : editingRow.table === 'leaveTypes'    ? 'Leave Type'
                 : editingRow.table === 'departments'   ? 'Department'
                 : editingRow.table === 'designations'  ? 'Designation'
                 : editingRow.table === 'attendanceTypes' ? 'Attendance Type'
                 : ''}
            </h3>

            {#if editingRow.table === 'locations'}
                <div class="space-y-3">
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Location Name</label>
                        <input type="text" bind:value={editingRow.data.Location_Name} placeholder="e.g. Head Office" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Weekly Off Day</label>
                        <select bind:value={editingRow.data.Weekly_Off_Day} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                            {#each DAYS as day, i}<option value={i}>{day}</option>{/each}
                        </select></div>
                </div>

            {:else if editingRow.table === 'shifts'}
                <div class="space-y-3">
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Shift Name</label>
                        <input type="text" bind:value={editingRow.data.Shift_Name} placeholder="e.g. General" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">In Time</label>
                            <input type="time" bind:value={editingRow.data.S_InTime} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Out Time</label>
                            <input type="time" bind:value={editingRow.data.S_OutTime} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Grace Period (min)</label>
                            <input type="number" bind:value={editingRow.data.Grace_Period_Minutes} min="0" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Night Shift</label>
                            <select bind:value={editingRow.data.Is_Night_Shift} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                                <option value={0}>No</option><option value={1}>Yes</option>
                            </select></div>
                    </div>
                </div>

            {:else if editingRow.table === 'leaveTypes'}
                <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Leave Code</label>
                            <input type="text" bind:value={editingRow.data.Leave_Type_Code} placeholder="CL" maxlength="10" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 font-mono"/></div>
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Leave Name</label>
                            <input type="text" bind:value={editingRow.data.Leave_Type_Name} placeholder="Casual Leave" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    </div>
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Default Annual Quota</label>
                        <input type="number" bind:value={editingRow.data.Default_Quota} min="0" step="0.5" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" bind:checked={editingRow.data.Is_Carry_Forward} class="rounded"/> Carry Forward</label>
                        <label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" bind:checked={editingRow.data.Is_Encashable} class="rounded"/> Encashable</label>
                        <label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" bind:checked={editingRow.data.Is_Sandwich_Rule_Applicable} class="rounded"/> Sandwich Rule</label>
                        <label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" bind:checked={editingRow.data.Negative_Balance_Allowed} class="rounded"/> Allow Negative</label>
                    </div>
                    {#if editingRow.data.Is_Carry_Forward}
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Max Carry Forward Days</label>
                            <input type="number" bind:value={editingRow.data.Max_Carry_Forward_Days} min="0" step="0.5" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    {/if}
                </div>

            {:else if editingRow.table === 'departments'}
                <div class="space-y-3">
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Department Name</label>
                        <input type="text" bind:value={editingRow.data.Department_Name} placeholder="e.g. Finance" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Remarks</label>
                        <textarea bind:value={editingRow.data.Remarks} rows="2" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"></textarea></div>
                </div>

            {:else if editingRow.table === 'designations'}
                <div class="space-y-3">
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Designation Name</label>
                        <input type="text" bind:value={editingRow.data.Designation_Name} placeholder="e.g. Manager" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">L1 Reporting To</label>
                            <select bind:value={editingRow.data.Level_1_Reporting_To_Designation_ID} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                                <option value="">— None —</option>
                                {#each designations as opt}
                                    {#if opt.Designation_ID !== editingRow.data.Designation_ID}
                                        <option value={opt.Designation_ID}>{opt.Designation_Name}</option>
                                    {/if}
                                {/each}
                            </select></div>
                        <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">L2 Reporting To</label>
                            <select bind:value={editingRow.data.Level_2_Reporting_To_Designation_ID} class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                                <option value="">— None —</option>
                                {#each designations as opt}
                                    {#if opt.Designation_ID !== editingRow.data.Designation_ID}
                                        <option value={opt.Designation_ID}>{opt.Designation_Name}</option>
                                    {/if}
                                {/each}
                            </select></div>
                    </div>
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Remarks</label>
                        <textarea bind:value={editingRow.data.Remarks} rows="2" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"></textarea></div>
                </div>

            {:else if editingRow.table === 'attendanceTypes'}
                <div class="space-y-3">
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Attendance Type Name</label>
                        <input type="text" bind:value={editingRow.data.Attendance_Type_Name} placeholder="e.g. Regular" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Attendance Type Value (day weight)</label>
                        <input type="number" bind:value={editingRow.data.Attendance_Type_Value} step="0.01" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
                    <div><label class="block text-[11px] font-medium text-slate-500 mb-0.5">Remarks</label>
                        <textarea bind:value={editingRow.data.Remarks} rows="2" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"></textarea></div>
                </div>
            {/if}

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button on:click={cancelEdit} class="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button on:click={saveRow} disabled={saving} class="px-5 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    </div>
{/if}
