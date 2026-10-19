<script>
    /**
     * AKS_Reports_User.svelte
     * ─────────────────────────────────────────────────────────────────
     * Employee self-service reports panel. 5 personal downloadable reports:
     *
     *   1. My Attendance Report     — Monthly daily attendance log
     *   2. My Leave Balance & History — Current balances + all leave applications
     *   3. My Expense Claims        — All my expense submissions
     *   4. My OD & CompOff History  — OD and CompOff requests with status
     *   5. Holiday Calendar         — Company-wide holiday list
     *
     * Data scoped to the logged-in employee's Employee_Self_ID.
     */

    import { post }              from '$lib/utils/api';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { downloadExcel, getCurrentMonth, getMonthName } from './AKS_ExcelExport.js';

    let Live_Data;
    $: Live_Data = $Live_Data_Storage;
    $: user = Live_Data.User_Information ?? {};

    let selectedMonth = getCurrentMonth();
    let generating = {};

    const REPORTS = [
        {
            id: 'my_attendance',
            label: 'My Attendance',
            description: 'Daily attendance with in/out times for the selected month',
            icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
            color: 'emerald',
            filter: 'month'
        },
        {
            id: 'my_leave',
            label: 'My Leave Balance & History',
            description: 'Current leave balances and all your leave applications',
            icon: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>`,
            color: 'amber',
            filter: 'none'
        },
        {
            id: 'my_expenses',
            label: 'My Expense Claims',
            description: 'All your expense submissions with approval status',
            icon: `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>`,
            color: 'orange',
            filter: 'none'
        },
        {
            id: 'my_od_compoff',
            label: 'My OD & CompOff History',
            description: 'On Duty and Compensatory Off requests with status',
            icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
            color: 'sky',
            filter: 'none'
        },
        {
            id: 'holiday_calendar',
            label: 'Holiday Calendar',
            description: 'Company holiday list for the current year',
            icon: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
            color: 'pink',
            filter: 'none'
        },
    ];

    const COLOR_MAP = {
        emerald: { bg: 'bg-emerald-50', accent: 'text-emerald-600', hover: 'hover:border-emerald-200' },
        amber:   { bg: 'bg-amber-50',   accent: 'text-amber-600',  hover: 'hover:border-amber-200' },
        orange:  { bg: 'bg-orange-50',  accent: 'text-orange-600', hover: 'hover:border-orange-200' },
        sky:     { bg: 'bg-sky-50',     accent: 'text-sky-600',    hover: 'hover:border-sky-200' },
        pink:    { bg: 'bg-pink-50',    accent: 'text-pink-600',   hover: 'hover:border-pink-200' },
    };

    async function generateReport(report) {
        generating = { ...generating, [report.id]: true };
        try {
            switch (report.id) {
                case 'my_attendance':   await genMyAttendance(); break;
                case 'my_leave':        await genMyLeave(); break;
                case 'my_expenses':     await genMyExpenses(); break;
                case 'my_od_compoff':   await genMyODCompOff(); break;
                case 'holiday_calendar': await genHolidayCalendar(); break;
            }
        } catch (err) {
            console.error(`Report error [${report.id}]:`, err);
            alert('Failed to generate report. Please try again.');
        }
        generating = { ...generating, [report.id]: false };
    }

    // ── 1. My Attendance ───────────────────────────────────────────────
    async function genMyAttendance() {
        const data = await post(API_PATHS.API_URL_Get_Attendance_Calendar_Data_by_ID, {
            Employee_Self_ID: user.Employee_Self_ID,
            Month: selectedMonth
        });
        if (!Array.isArray(data) || data.length === 0) return alert('No attendance data found for this month.');

        const rows = data.map(entry => ({
            Date:          entry.Att_Date ?? '',
            Day:           entry.Att_Date ? new Date(entry.Att_Date).toLocaleDateString('en-IN', { weekday: 'short' }) : '',
            Status:        entry.Status ?? '',
            In_Time:       entry.InTime ?? '',
            Out_Time:      entry.OutTime ?? '',
            Work_Duration: entry.Work_Duration ?? '',
            OT:            entry.OT ?? '',
            Total:         entry.Tot_Duration ?? '',
            Late_By:       entry.LateBy ?? '',
            Early_Going:   entry.EarlyGoingBy ?? '',
            Shift:         entry.Shift ?? '',
        }));

        // Add summary row
        const summary = rows.reduce((acc, r) => {
            if (r.Status === 'Present') acc.Present++;
            else if (r.Status === 'Absent') acc.Absent++;
            else if (r.Status === 'Leave') acc.Leave++;
            else if (r.Status === 'OD') acc.OD++;
            else if (r.Status === 'Holiday') acc.Holiday++;
            return acc;
        }, { Present: 0, Absent: 0, Leave: 0, OD: 0, Holiday: 0 });

        downloadExcel({
            fileName: `My_Attendance_${selectedMonth}`,
            sheets: [
                {
                    name: 'Daily Attendance',
                    headers: [
                        { label: 'Date', key: 'Date', type: 'date' },
                        { label: 'Day', key: 'Day' },
                        { label: 'Status', key: 'Status' },
                        { label: 'In Time', key: 'In_Time' },
                        { label: 'Out Time', key: 'Out_Time' },
                        { label: 'Work Hours', key: 'Work_Duration' },
                        { label: 'OT', key: 'OT' },
                        { label: 'Total', key: 'Total' },
                        { label: 'Late By', key: 'Late_By' },
                        { label: 'Early Going', key: 'Early_Going' },
                        { label: 'Shift', key: 'Shift' },
                    ],
                    rows
                },
                {
                    name: 'Summary',
                    headers: [
                        { label: 'Category', key: 'Category' },
                        { label: 'Days', key: 'Days' },
                    ],
                    rows: [
                        { Category: 'Present', Days: summary.Present },
                        { Category: 'Absent', Days: summary.Absent },
                        { Category: 'On Leave', Days: summary.Leave },
                        { Category: 'On Duty', Days: summary.OD },
                        { Category: 'Holiday', Days: summary.Holiday },
                        { Category: 'Total Entries', Days: rows.length },
                    ]
                }
            ]
        });
    }

    // ── 2. My Leave Balance & History ──────────────────────────────────
    async function genMyLeave() {
        const [detailsData, leaveData] = await Promise.all([
            post(API_PATHS.API_URL_Get_Employee_Details_by_ID, { Employee_Details_ID: user.Employee_Self_ID }),
            post(API_PATHS.API_URL_Get_Leave_Management_Data, { Employee_Self_ID: user.Employee_Self_ID })
        ]);

        // Balance sheet
        const lb = detailsData?.Leave_Balance ?? {};
        const balanceRows = Object.values(typeof lb === 'string' ? JSON.parse(lb) : lb).map(lt => ({
            Leave_Type: lt.Leave_Type_Name ?? '',
            Assigned:   lt.Assigned_Count ?? 0,
            Used:       lt.Approved_Count ?? 0,
            Pending:    lt.Pending_Count ?? 0,
            Balance:    lt.Leave_Balance ?? 0,
        }));

        // History
        const historyRows = (Array.isArray(leaveData) ? leaveData : []).map(entry => {
            const d = typeof entry.New_Leave_Details === 'string'
                ? JSON.parse(entry.New_Leave_Details)
                : (entry.New_Leave_Details ?? {});
            return {
                Leave_Type:  d.Leave_Type_Name ?? '',
                Start_Date:  d.Start_Date ?? '',
                End_Date:    d.End_Date ?? '',
                Days:        d.Number_of_Days ?? '',
                Half_Day:    (d.Half_Day_Start ? 'Start PM' : '') + (d.Half_Day_End ? ' End AM' : '') || 'No',
                Reason:      d.Reason_for_Leave ?? '',
                Status:      d.Status ?? '',
                Applied_On:  entry.System_Datetime_Creation ?? '',
            };
        });

        downloadExcel({
            fileName: `My_Leave_Report_${new Date().toISOString().split('T')[0]}`,
            sheets: [
                {
                    name: 'Current Balance',
                    headers: [
                        { label: 'Leave Type', key: 'Leave_Type' },
                        { label: 'Assigned', key: 'Assigned' },
                        { label: 'Used', key: 'Used' },
                        { label: 'Pending', key: 'Pending' },
                        { label: 'Balance', key: 'Balance' },
                    ],
                    rows: balanceRows
                },
                {
                    name: 'Leave History',
                    headers: [
                        { label: 'Leave Type', key: 'Leave_Type' },
                        { label: 'Start Date', key: 'Start_Date', type: 'date' },
                        { label: 'End Date', key: 'End_Date', type: 'date' },
                        { label: 'Days', key: 'Days' },
                        { label: 'Half Day', key: 'Half_Day' },
                        { label: 'Reason', key: 'Reason' },
                        { label: 'Status', key: 'Status' },
                        { label: 'Applied On', key: 'Applied_On', type: 'date' },
                    ],
                    rows: historyRows
                }
            ]
        });
    }

    // ── 3. My Expense Claims ──────────────────────────────────────────
    async function genMyExpenses() {
        const data = await post(API_PATHS.API_URL_Get_Expense_Management_Data, {
            Employee_Self_ID: user.Employee_Self_ID
        });
        if (!Array.isArray(data) || data.length === 0) return alert('No expense claims found.');

        const rows = data.map(entry => {
            const d = typeof entry.New_Expense_Details === 'string'
                ? JSON.parse(entry.New_Expense_Details) : (entry.New_Expense_Details ?? {});
            return {
                Date:        d.Expense_Date ?? '',
                Category:    d.Expense_Category ?? '',
                Description: d.Expense_Description ?? '',
                Amount:      d.Total_Amount ?? 0,
                Status:      d.Status ?? '',
                Submitted:   entry.System_Datetime_Creation ?? '',
            };
        });

        downloadExcel({
            fileName: `My_Expense_Claims_${new Date().toISOString().split('T')[0]}`,
            sheets: [{
                name: 'Expense Claims',
                headers: [
                    { label: 'Date', key: 'Date', type: 'date' },
                    { label: 'Category', key: 'Category' },
                    { label: 'Description', key: 'Description' },
                    { label: 'Amount', key: 'Amount', type: 'currency' },
                    { label: 'Status', key: 'Status' },
                    { label: 'Submitted On', key: 'Submitted', type: 'date' },
                ],
                rows
            }]
        });
    }

    // ── 4. My OD & CompOff History ────────────────────────────────────
    async function genMyODCompOff() {
        const [odData, compOffData] = await Promise.all([
            post(API_PATHS.API_URL_Get_OD_Management_Data, { Employee_Self_ID: user.Employee_Self_ID }).catch(() => []),
            post(API_PATHS.API_URL_Get_CompOff_Management_Data, { Employee_Self_ID: user.Employee_Self_ID }).catch(() => [])
        ]);

        const odRows = (Array.isArray(odData) ? odData : []).map(entry => {
            const d = typeof entry.New_OD_Details === 'string'
                ? JSON.parse(entry.New_OD_Details) : (entry.New_OD_Details ?? {});
            return {
                Type:       d.OD_Type ?? '',
                Start_Date: d.OD_Start_Date ?? '',
                End_Date:   d.OD_End_Date ?? '',
                Days:       d.Number_of_Days ?? '',
                Description: d.OD_Description ?? '',
                Status:     d.Status ?? '',
                Applied_On: entry.System_Datetime_Creation ?? '',
            };
        });

        const compOffRows = (Array.isArray(compOffData) ? compOffData : []).map(entry => {
            const d = typeof entry.New_CompOff_Details === 'string'
                ? JSON.parse(entry.New_CompOff_Details) : (entry.New_CompOff_Details ?? {});
            return {
                CompOff_Date: d.CompOff_Date ?? '',
                Description:  d.CompOff_Description ?? '',
                Status:       d.Status ?? '',
                Applied_On:   entry.System_Datetime_Creation ?? '',
            };
        });

        const sheets = [];
        sheets.push({
            name: 'On Duty',
            headers: [
                { label: 'OD Type', key: 'Type' },
                { label: 'Start Date', key: 'Start_Date', type: 'date' },
                { label: 'End Date', key: 'End_Date', type: 'date' },
                { label: 'Days', key: 'Days' },
                { label: 'Description', key: 'Description' },
                { label: 'Status', key: 'Status' },
                { label: 'Applied On', key: 'Applied_On', type: 'date' },
            ],
            rows: odRows
        });
        sheets.push({
            name: 'Comp Off',
            headers: [
                { label: 'Comp Off Date', key: 'CompOff_Date', type: 'date' },
                { label: 'Description', key: 'Description' },
                { label: 'Status', key: 'Status' },
                { label: 'Applied On', key: 'Applied_On', type: 'date' },
            ],
            rows: compOffRows
        });

        downloadExcel({
            fileName: `My_OD_CompOff_${new Date().toISOString().split('T')[0]}`,
            sheets
        });
    }

    // ── 5. Holiday Calendar ────────────────────────────────────────────
    async function genHolidayCalendar() {
        const data = await post(API_PATHS.API_URL_Get_Holiday_Calendar_Data);
        if (!Array.isArray(data) || data.length === 0) return alert('No holiday data found.');

        const currentYear = new Date().getFullYear();
        const rows = data
            .filter(h => new Date(h.Holiday_Date).getFullYear() === currentYear)
            .map(h => ({
                Date:     h.Holiday_Date ?? '',
                Day:      h.Holiday_Date ? new Date(h.Holiday_Date).toLocaleDateString('en-IN', { weekday: 'long' }) : '',
                Name:     h.Holiday_Name ?? '',
                Type:     h.Holiday_Type ?? '',
                Location: h.Work_Location ?? '',
            }));

        downloadExcel({
            fileName: `Holiday_Calendar_${currentYear}`,
            sheets: [{
                name: 'Holidays',
                headers: [
                    { label: 'Date', key: 'Date', type: 'date' },
                    { label: 'Day', key: 'Day' },
                    { label: 'Holiday Name', key: 'Name' },
                    { label: 'Type', key: 'Type' },
                    { label: 'Location', key: 'Location' },
                ],
                rows
            }]
        });
    }
</script>

<!-- ── Reports UI ─────────────────────────────────────────────────── -->
<div class="space-y-4">

    <!-- Filters Row -->
    <div class="flex flex-wrap items-end gap-3 bg-slate-50 rounded-2xl px-4 py-3">
        <div>
            <label class="block text-[10px] font-medium text-slate-400 mb-0.5">Month (for Attendance)</label>
            <input type="month" bind:value={selectedMonth}
                class="border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"/>
        </div>
        <p class="text-[10px] text-slate-400 ml-auto">Click any card to download as Excel</p>
    </div>

    <!-- Report Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each REPORTS as report}
            {@const colors = COLOR_MAP[report.color]}
            <button
                on:click={() => generateReport(report)}
                disabled={generating[report.id]}
                class="
                    relative bg-white border border-slate-100 rounded-2xl p-4
                    text-left group {colors.hover} hover:shadow-md
                    transition-all duration-150 active:scale-[0.98]
                    disabled:opacity-60 disabled:cursor-wait
                "
            >
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl {colors.bg} flex items-center justify-center shrink-0">
                        {#if generating[report.id]}
                            <div class="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        {:else}
                            <svg class="w-5 h-5 {colors.accent}" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                                {@html report.icon}
                            </svg>
                        {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-800 truncate">{report.label}</p>
                        <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">{report.description}</p>
                    </div>
                    <svg class="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </div>
            </button>
        {/each}
    </div>
</div>
