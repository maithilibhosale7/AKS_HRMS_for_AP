<script>
    /**
     * AKS_Reports_Admin.svelte
     * ─────────────────────────────────────────────────────────────────
     * HR Admin reports panel. Provides 10 standard downloadable reports:
     *
     *   1. Employee Master        — Full employee directory with all key fields
     *   2. Attendance Summary     — Monthly present/absent/leave/OD counts per employee
     *   3. Attendance Detailed    — Daily attendance log with in/out times
     *   4. Leave Balance Report   — All employees' leave balances by type
     *   5. Leave Register         — All leave applications with status
     *   6. Payroll Summary        — Monthly payroll with earnings/deductions/net
     *   7. Headcount Report       — Department × Designation × Status matrix
     *   8. Expense Claims Report  — All expense submissions with approval status
     *   9. Holiday Calendar       — Annual holiday list
     *  10. Onboarding/Exit Status — Active onboardings and exits with checklist progress
     *
     * Each report fetches data from existing APIs and exports to Excel
     * client-side using SheetJS (AKS_ExcelExport.js).
     */

    import { post }              from '$lib/utils/api';
    import { API_PATHS }         from '$lib/API_PATHS';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { downloadExcel, getCurrentMonth, getMonthName } from './AKS_ExcelExport.js';

    let Live_Data;
    $: Live_Data = $Live_Data_Storage;
    $: user = Live_Data.User_Information ?? {};

    // ── State ──────────────────────────────────────────────────────────
    let selectedMonth = getCurrentMonth();
    let selectedYear  = new Date().getFullYear();
    let generating    = {};   // { reportId: true } while generating

    // ── Report Definitions ─────────────────────────────────────────────
    const REPORTS = [
        {
            id: 'employee_master',
            label: 'Employee Master',
            description: 'Full directory with department, designation, contact, status',
            icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
            color: 'blue',
            filter: 'none'
        },
        {
            id: 'attendance_summary',
            label: 'Attendance Summary',
            description: 'Monthly present, absent, leave, OD counts per employee',
            icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
            color: 'emerald',
            filter: 'month'
        },
        {
            id: 'attendance_detailed',
            label: 'Attendance Detailed',
            description: 'Daily log with in-time, out-time, duration, late/early',
            icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
            color: 'teal',
            filter: 'month'
        },
        {
            id: 'leave_balance',
            label: 'Leave Balance Report',
            description: 'All employees\u2019 leave balances by leave type',
            icon: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>`,
            color: 'amber',
            filter: 'none'
        },
        {
            id: 'leave_register',
            label: 'Leave Register',
            description: 'All leave applications with type, dates, days, status',
            icon: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>`,
            color: 'orange',
            filter: 'month'
        },
        {
            id: 'payroll_summary',
            label: 'Payroll Summary',
            description: 'Monthly earnings, deductions, and net payable per employee',
            icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>`,
            color: 'green',
            filter: 'month'
        },
        {
            id: 'headcount',
            label: 'Headcount Report',
            description: 'Department-wise employee count by designation and status',
            icon: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
            color: 'indigo',
            filter: 'none'
        },
        {
            id: 'expense_claims',
            label: 'Expense Claims Report',
            description: 'All expense claims with category, amount, approval status',
            icon: `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>`,
            color: 'rose',
            filter: 'month'
        },
        {
            id: 'holiday_calendar',
            label: 'Holiday Calendar',
            description: 'Annual holiday list with type and location',
            icon: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
            color: 'pink',
            filter: 'year'
        },
        {
            id: 'onboarding_exit',
            label: 'Onboarding & Exit Status',
            description: 'Active onboardings and exits with checklist completion %',
            icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>`,
            color: 'violet',
            filter: 'none'
        }
    ];

    const COLOR_MAP = {
        blue:    { bg: 'bg-blue-50',    accent: 'text-blue-600',    hover: 'hover:border-blue-200' },
        emerald: { bg: 'bg-emerald-50', accent: 'text-emerald-600', hover: 'hover:border-emerald-200' },
        teal:    { bg: 'bg-teal-50',    accent: 'text-teal-600',    hover: 'hover:border-teal-200' },
        amber:   { bg: 'bg-amber-50',   accent: 'text-amber-600',  hover: 'hover:border-amber-200' },
        orange:  { bg: 'bg-orange-50',  accent: 'text-orange-600', hover: 'hover:border-orange-200' },
        green:   { bg: 'bg-green-50',   accent: 'text-green-600',  hover: 'hover:border-green-200' },
        indigo:  { bg: 'bg-indigo-50',  accent: 'text-indigo-600', hover: 'hover:border-indigo-200' },
        rose:    { bg: 'bg-rose-50',    accent: 'text-rose-600',   hover: 'hover:border-rose-200' },
        pink:    { bg: 'bg-pink-50',    accent: 'text-pink-600',   hover: 'hover:border-pink-200' },
        violet:  { bg: 'bg-violet-50',  accent: 'text-violet-600', hover: 'hover:border-violet-200' },
    };

    // ── Report Generators ──────────────────────────────────────────────

    async function generateReport(report) {
        generating = { ...generating, [report.id]: true };
        try {
            switch (report.id) {
                case 'employee_master':      await genEmployeeMaster(); break;
                case 'attendance_summary':   await genAttendanceSummary(); break;
                case 'attendance_detailed':  await genAttendanceDetailed(); break;
                case 'leave_balance':        await genLeaveBalance(); break;
                case 'leave_register':       await genLeaveRegister(); break;
                case 'payroll_summary':      await genPayrollSummary(); break;
                case 'headcount':            await genHeadcount(); break;
                case 'expense_claims':       await genExpenseClaims(); break;
                case 'holiday_calendar':     await genHolidayCalendar(); break;
                case 'onboarding_exit':      await genOnboardingExit(); break;
            }
        } catch (err) {
            console.error(`Report generation error [${report.id}]:`, err);
            alert('Failed to generate report. Please try again.');
        }
        generating = { ...generating, [report.id]: false };
    }

    // ── 1. Employee Master ─────────────────────────────────────────────
    async function genEmployeeMaster() {
        const data = await post(API_PATHS.API_URL_Get_Employee_Details_Data);
        if (!Array.isArray(data) || data.length === 0) return alert('No employee data found.');

        const rows = data.map(emp => {
            const ed = typeof emp.Employee_Details === 'string' ? JSON.parse(emp.Employee_Details) : (emp.Employee_Details ?? {});
            const pi = typeof emp.Personal_Information === 'string' ? JSON.parse(emp.Personal_Information) : (emp.Personal_Information ?? {});
            const ci = typeof emp.Contact_Information === 'string' ? JSON.parse(emp.Contact_Information) : (emp.Contact_Information ?? {});
            return {
                Employee_Code:    ed.Employee_Code ?? emp.Employee_Self_ID ?? '',
                Employee_Name:    ed.Employee_Name ?? '',
                Department:       ed.Department_Name ?? '',
                Designation:      ed.Designation_Name ?? '',
                Date_of_Joining:  ed.Date_of_Joining ?? '',
                Status:           ed.Status ?? '',
                Gender:           pi.Gender ?? '',
                Date_of_Birth:    pi.Date_of_Birth ?? '',
                Email:            ci.Email ?? ed.Email ?? '',
                Mobile:           ci.Mobile ?? ed.Mobile ?? '',
                Work_Location:    ed.Work_Location ?? '',
                Reporting_To:     ed.Level_1_Reporting_Manager_Name ?? '',
                Grade:            ed.Grade ?? '',
            };
        });

        downloadExcel({
            fileName: `Employee_Master_${new Date().toISOString().split('T')[0]}`,
            sheets: [{
                name: 'Employee Master',
                headers: [
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Department', key: 'Department' },
                    { label: 'Designation', key: 'Designation' },
                    { label: 'Date of Joining', key: 'Date_of_Joining', type: 'date' },
                    { label: 'Status', key: 'Status' },
                    { label: 'Gender', key: 'Gender' },
                    { label: 'Date of Birth', key: 'Date_of_Birth', type: 'date' },
                    { label: 'Email', key: 'Email' },
                    { label: 'Mobile', key: 'Mobile' },
                    { label: 'Work Location', key: 'Work_Location' },
                    { label: 'Reporting To', key: 'Reporting_To' },
                    { label: 'Grade', key: 'Grade' },
                ],
                rows
            }]
        });
    }

    // ── 2. Attendance Summary ──────────────────────────────────────────
    async function genAttendanceSummary() {
        const data = await post(API_PATHS.API_URL_Get_Attendance_Management_Data, { Month: selectedMonth });
        if (!Array.isArray(data) || data.length === 0) return alert('No attendance data found for this month.');

        // Group by employee
        const empMap = {};
        data.forEach(entry => {
            const eid = entry.Employee_Self_ID ?? 'Unknown';
            if (!empMap[eid]) {
                empMap[eid] = {
                    Employee_Name: entry.Employee_Name ?? '',
                    Employee_Code: entry.Employee_Code ?? '',
                    Department:    entry.Department_Name ?? '',
                    Present: 0, Absent: 0, Leave: 0, OD: 0, CompOff: 0, Holiday: 0,
                    Total_Hours: 0, Late_Count: 0, Early_Going_Count: 0
                };
            }
            const status = entry.Status ?? entry.Attendance_Status ?? '';
            if (status === 'Present')  empMap[eid].Present++;
            else if (status === 'Absent')   empMap[eid].Absent++;
            else if (status === 'Leave')    empMap[eid].Leave++;
            else if (status === 'OD')       empMap[eid].OD++;
            else if (status === 'CompOff')  empMap[eid].CompOff++;
            else if (status === 'Holiday')  empMap[eid].Holiday++;

            if (entry.Total_Duration) {
                const parts = String(entry.Total_Duration).split(':');
                empMap[eid].Total_Hours += (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0) / 60;
            }
            if (entry.LateBy) empMap[eid].Late_Count++;
            if (entry.EarlyGoingBy) empMap[eid].Early_Going_Count++;
        });

        const rows = Object.values(empMap).map(e => ({
            ...e,
            Total_Hours: e.Total_Hours.toFixed(1),
            Working_Days: e.Present + e.OD + e.CompOff
        }));

        downloadExcel({
            fileName: `Attendance_Summary_${selectedMonth}`,
            sheets: [{
                name: 'Attendance Summary',
                headers: [
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Department', key: 'Department' },
                    { label: 'Present', key: 'Present' },
                    { label: 'Absent', key: 'Absent' },
                    { label: 'On Leave', key: 'Leave' },
                    { label: 'On Duty', key: 'OD' },
                    { label: 'Comp Off', key: 'CompOff' },
                    { label: 'Holiday', key: 'Holiday' },
                    { label: 'Working Days', key: 'Working_Days' },
                    { label: 'Total Hours', key: 'Total_Hours' },
                    { label: 'Late Count', key: 'Late_Count' },
                    { label: 'Early Going', key: 'Early_Going_Count' },
                ],
                rows
            }]
        });
    }

    // ── 3. Attendance Detailed ─────────────────────────────────────────
    async function genAttendanceDetailed() {
        const data = await post(API_PATHS.API_URL_Get_Attendance_Management_Data, { Month: selectedMonth });
        if (!Array.isArray(data) || data.length === 0) return alert('No attendance data found for this month.');

        const rows = data.map(entry => {
            const details = typeof entry.New_Attendance_Details === 'string'
                ? JSON.parse(entry.New_Attendance_Details)
                : (entry.New_Attendance_Details ?? {});
            const timings = details.Timings ?? [];
            const t = timings[0] ?? {};
            return {
                Employee_Name: entry.Employee_Name ?? '',
                Employee_Code: entry.Employee_Code ?? '',
                Date:          t.Att_Date ?? details.Attendance_Date ?? '',
                Shift:         t.Shift ?? '',
                In_Time:       t.InTime ?? '',
                Out_Time:      t.OutTime ?? '',
                Work_Duration: t.Work_Duration ?? '',
                OT:            t.OT ?? '',
                Total_Duration: t.Tot_Duration ?? details.Total_Duration ?? '',
                Late_By:       t.LateBy ?? '',
                Early_Going:   t.EarlyGoingBy ?? '',
                Status:        t.Status ?? details.Status ?? '',
            };
        });

        downloadExcel({
            fileName: `Attendance_Detailed_${selectedMonth}`,
            sheets: [{
                name: 'Attendance Detail',
                headers: [
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Date', key: 'Date', type: 'date' },
                    { label: 'Shift', key: 'Shift' },
                    { label: 'In Time', key: 'In_Time' },
                    { label: 'Out Time', key: 'Out_Time' },
                    { label: 'Work Duration', key: 'Work_Duration' },
                    { label: 'OT', key: 'OT' },
                    { label: 'Total Duration', key: 'Total_Duration' },
                    { label: 'Late By', key: 'Late_By' },
                    { label: 'Early Going', key: 'Early_Going' },
                    { label: 'Status', key: 'Status' },
                ],
                rows
            }]
        });
    }

    // ── 4. Leave Balance Report ────────────────────────────────────────
    async function genLeaveBalance() {
        const data = await post(API_PATHS.API_URL_Get_Employee_Details_Data);
        if (!Array.isArray(data) || data.length === 0) return alert('No employee data found.');

        const rows = [];
        data.forEach(emp => {
            const ed = typeof emp.Employee_Details === 'string' ? JSON.parse(emp.Employee_Details) : (emp.Employee_Details ?? {});
            const lb = typeof emp.Leave_Balance === 'string' ? JSON.parse(emp.Leave_Balance) : (emp.Leave_Balance ?? {});

            Object.entries(lb).forEach(([typeId, lt]) => {
                rows.push({
                    Employee_Code:    ed.Employee_Code ?? emp.Employee_Self_ID ?? '',
                    Employee_Name:    ed.Employee_Name ?? '',
                    Department:       ed.Department_Name ?? '',
                    Leave_Type:       lt.Leave_Type_Name ?? typeId,
                    Assigned:         lt.Assigned_Count ?? 0,
                    Approved:         lt.Approved_Count ?? 0,
                    Pending:          lt.Pending_Count ?? 0,
                    Balance:          lt.Leave_Balance ?? 0,
                });
            });
        });

        downloadExcel({
            fileName: `Leave_Balance_Report_${new Date().toISOString().split('T')[0]}`,
            sheets: [{
                name: 'Leave Balances',
                headers: [
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Department', key: 'Department' },
                    { label: 'Leave Type', key: 'Leave_Type' },
                    { label: 'Assigned', key: 'Assigned' },
                    { label: 'Approved/Used', key: 'Approved' },
                    { label: 'Pending', key: 'Pending' },
                    { label: 'Balance', key: 'Balance' },
                ],
                rows
            }]
        });
    }

    // ── 5. Leave Register ──────────────────────────────────────────────
    async function genLeaveRegister() {
        const data = await post(API_PATHS.API_URL_Get_Leave_Management_Data, { Month: selectedMonth });
        if (!Array.isArray(data) || data.length === 0) return alert('No leave data found for this period.');

        const rows = data.map(entry => {
            const details = typeof entry.New_Leave_Details === 'string'
                ? JSON.parse(entry.New_Leave_Details)
                : (entry.New_Leave_Details ?? {});
            return {
                Employee_Name:  entry.Employee_Name ?? '',
                Employee_Code:  entry.Employee_Code ?? '',
                Leave_Type:     details.Leave_Type_Name ?? '',
                Start_Date:     details.Start_Date ?? '',
                End_Date:       details.End_Date ?? '',
                Days:           details.Number_of_Days ?? '',
                Half_Day:       (details.Half_Day_Start ? 'Start PM' : '') + (details.Half_Day_End ? ' End AM' : '') || 'No',
                Reason:         details.Reason_for_Leave ?? '',
                Status:         details.Status ?? '',
                L1_Approver:    details.Level1_Approver ?? '',
                L1_Decision:    details.Level1_Approval ?? '',
                L2_Approver:    details.Level2_Approver ?? '',
                L2_Decision:    details.Level2_Approval ?? '',
                Applied_Date:   entry.System_Datetime_Creation ?? '',
            };
        });

        downloadExcel({
            fileName: `Leave_Register_${selectedMonth}`,
            sheets: [{
                name: 'Leave Register',
                headers: [
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Leave Type', key: 'Leave_Type' },
                    { label: 'Start Date', key: 'Start_Date', type: 'date' },
                    { label: 'End Date', key: 'End_Date', type: 'date' },
                    { label: 'Days', key: 'Days' },
                    { label: 'Half Day', key: 'Half_Day' },
                    { label: 'Reason', key: 'Reason' },
                    { label: 'Status', key: 'Status' },
                    { label: 'L1 Approver', key: 'L1_Approver' },
                    { label: 'L1 Decision', key: 'L1_Decision' },
                    { label: 'L2 Approver', key: 'L2_Approver' },
                    { label: 'L2 Decision', key: 'L2_Decision' },
                    { label: 'Applied Date', key: 'Applied_Date', type: 'date' },
                ],
                rows
            }]
        });
    }

    // ── 6. Payroll Summary ─────────────────────────────────────────────
    async function genPayrollSummary() {
        const data = await post(API_PATHS.API_URL_Get_Payroll_Management_Table_Data, { Month: selectedMonth });
        if (!Array.isArray(data) || data.length === 0) return alert('No payroll data found for this month.');

        const rows = data.map(entry => {
            const main = typeof entry.Payroll_Details_Main === 'string'
                ? JSON.parse(entry.Payroll_Details_Main)
                : (entry.Payroll_Details_Main ?? {});
            const pi = main.Personal_Info ?? {};
            return {
                Employee_Code:     pi.Emp_ID ?? '',
                Employee_Name:     pi.Employee_Name ?? '',
                Department:        pi.Department ?? '',
                Designation:       pi.Designation ?? '',
                Month_Days:        pi.Month_Days ?? '',
                Payable_Days:      pi.Payable_Days ?? '',
                LOP_Days:          pi.LOP_Days ?? 0,
                Total_Earnings:    main.Summary?.Total_Earnings ?? 0,
                Total_Deductions:  main.Summary?.Total_Deductions ?? 0,
                Net_Payable:       main.Summary?.Net_Payable ?? 0,
                Bank_Name:         pi.Bank_Name ?? '',
                Bank_Account:      pi.Bank_Account ?? '',
            };
        });

        downloadExcel({
            fileName: `Payroll_Summary_${selectedMonth}`,
            sheets: [{
                name: 'Payroll Summary',
                headers: [
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Department', key: 'Department' },
                    { label: 'Designation', key: 'Designation' },
                    { label: 'Month Days', key: 'Month_Days' },
                    { label: 'Payable Days', key: 'Payable_Days' },
                    { label: 'LOP Days', key: 'LOP_Days' },
                    { label: 'Total Earnings', key: 'Total_Earnings', type: 'currency' },
                    { label: 'Total Deductions', key: 'Total_Deductions', type: 'currency' },
                    { label: 'Net Payable', key: 'Net_Payable', type: 'currency' },
                    { label: 'Bank', key: 'Bank_Name' },
                    { label: 'Account No', key: 'Bank_Account' },
                ],
                rows
            }]
        });
    }

    // ── 7. Headcount Report ────────────────────────────────────────────
    async function genHeadcount() {
        const data = await post(API_PATHS.API_URL_Get_Employee_Details_Data);
        if (!Array.isArray(data) || data.length === 0) return alert('No employee data found.');

        // Summary rows: one row per department × status combo
        const summary = {};
        const detailed = [];
        data.forEach(emp => {
            const ed = typeof emp.Employee_Details === 'string' ? JSON.parse(emp.Employee_Details) : (emp.Employee_Details ?? {});
            const dept   = ed.Department_Name ?? 'Unassigned';
            const desg   = ed.Designation_Name ?? 'Unassigned';
            const status = ed.Status ?? 'Unknown';
            const key    = `${dept}|||${status}`;

            if (!summary[key]) summary[key] = { Department: dept, Status: status, Count: 0 };
            summary[key].Count++;

            detailed.push({
                Department: dept, Designation: desg, Status: status,
                Employee_Name: ed.Employee_Name ?? '', Employee_Code: ed.Employee_Code ?? '',
            });
        });

        downloadExcel({
            fileName: `Headcount_Report_${new Date().toISOString().split('T')[0]}`,
            sheets: [
                {
                    name: 'Summary',
                    headers: [
                        { label: 'Department', key: 'Department' },
                        { label: 'Status', key: 'Status' },
                        { label: 'Headcount', key: 'Count' },
                    ],
                    rows: Object.values(summary).sort((a, b) => a.Department.localeCompare(b.Department))
                },
                {
                    name: 'Detailed',
                    headers: [
                        { label: 'Department', key: 'Department' },
                        { label: 'Designation', key: 'Designation' },
                        { label: 'Emp Code', key: 'Employee_Code' },
                        { label: 'Employee Name', key: 'Employee_Name' },
                        { label: 'Status', key: 'Status' },
                    ],
                    rows: detailed.sort((a, b) => a.Department.localeCompare(b.Department))
                }
            ]
        });
    }

    // ── 8. Expense Claims ──────────────────────────────────────────────
    async function genExpenseClaims() {
        const data = await post(API_PATHS.API_URL_Get_Expense_Management_Data, { Month: selectedMonth });
        if (!Array.isArray(data) || data.length === 0) return alert('No expense data found for this month.');

        const rows = data.map(entry => {
            const details = typeof entry.New_Expense_Details === 'string'
                ? JSON.parse(entry.New_Expense_Details) : (entry.New_Expense_Details ?? {});
            return {
                Employee_Name:  entry.Employee_Name ?? '',
                Employee_Code:  entry.Employee_Code ?? '',
                Expense_Date:   details.Expense_Date ?? '',
                Category:       details.Expense_Category ?? '',
                Description:    details.Expense_Description ?? '',
                Amount:         details.Total_Amount ?? 0,
                Status:         details.Status ?? '',
                Submitted_On:   entry.System_Datetime_Creation ?? '',
            };
        });

        downloadExcel({
            fileName: `Expense_Claims_${selectedMonth}`,
            sheets: [{
                name: 'Expense Claims',
                headers: [
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Emp Code', key: 'Employee_Code' },
                    { label: 'Expense Date', key: 'Expense_Date', type: 'date' },
                    { label: 'Category', key: 'Category' },
                    { label: 'Description', key: 'Description' },
                    { label: 'Amount', key: 'Amount', type: 'currency' },
                    { label: 'Status', key: 'Status' },
                    { label: 'Submitted On', key: 'Submitted_On', type: 'date' },
                ],
                rows
            }]
        });
    }

    // ── 9. Holiday Calendar ────────────────────────────────────────────
    async function genHolidayCalendar() {
        const data = await post(API_PATHS.API_URL_Get_Holiday_Calendar_Data);
        if (!Array.isArray(data) || data.length === 0) return alert('No holiday data found.');

        const rows = data
            .filter(h => !selectedYear || new Date(h.Holiday_Date).getFullYear() === selectedYear)
            .map(h => ({
                Holiday_Date:  h.Holiday_Date ?? '',
                Day:           h.Holiday_Date ? new Date(h.Holiday_Date).toLocaleDateString('en-IN', { weekday: 'long' }) : '',
                Holiday_Name:  h.Holiday_Name ?? '',
                Holiday_Type:  h.Holiday_Type ?? '',
                Work_Location: h.Work_Location ?? '',
                Description:   h.Description ?? '',
            }));

        downloadExcel({
            fileName: `Holiday_Calendar_${selectedYear}`,
            sheets: [{
                name: 'Holiday Calendar',
                headers: [
                    { label: 'Date', key: 'Holiday_Date', type: 'date' },
                    { label: 'Day', key: 'Day' },
                    { label: 'Holiday Name', key: 'Holiday_Name' },
                    { label: 'Type', key: 'Holiday_Type' },
                    { label: 'Location', key: 'Work_Location' },
                    { label: 'Description', key: 'Description' },
                ],
                rows
            }]
        });
    }

    // ── 10. Onboarding & Exit Status ───────────────────────────────────
    async function genOnboardingExit() {
        const [onboardData, exitData] = await Promise.all([
            post(API_PATHS.API_URL_Get_Onboarding_Management_Data).catch(() => []),
            post(API_PATHS.API_URL_Get_Exit_Management_Data).catch(() => [])
        ]);

        const onboardRows = (Array.isArray(onboardData) ? onboardData : []).map(e => ({
            Employee_Name: e.Employee_Name ?? '', Status: e.Status ?? '',
            HR_Status: e.HR_Status ?? '', IT_Status: e.IT_Status ?? '',
            Accounts_Status: e.Accounts_Status ?? '', Line_Status: e.Line_Status ?? '',
            Onboarding_Date: e.Onboarding_Date ?? '', Created: e.System_Datetime_Creation ?? '',
        }));

        const exitRows = (Array.isArray(exitData) ? exitData : []).map(e => ({
            Employee_Name: e.Employee_Name ?? '', Status: e.Status ?? '',
            HR_Status: e.HR_Status ?? '', IT_Status: e.IT_Status ?? '',
            Accounts_Status: e.Accounts_Status ?? '', Line_Status: e.Line_Status ?? '',
            Exit_Date: e.Exit_Date ?? '', Created: e.System_Datetime_Creation ?? '',
        }));

        if (onboardRows.length === 0 && exitRows.length === 0) return alert('No onboarding or exit data found.');

        const sheets = [];
        if (onboardRows.length > 0) {
            sheets.push({
                name: 'Onboarding',
                headers: [
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Overall Status', key: 'Status' },
                    { label: 'HR', key: 'HR_Status' },
                    { label: 'IT', key: 'IT_Status' },
                    { label: 'Accounts', key: 'Accounts_Status' },
                    { label: 'Line Manager', key: 'Line_Status' },
                    { label: 'Onboarding Date', key: 'Onboarding_Date', type: 'date' },
                    { label: 'Created', key: 'Created', type: 'date' },
                ],
                rows: onboardRows
            });
        }
        if (exitRows.length > 0) {
            sheets.push({
                name: 'Exit',
                headers: [
                    { label: 'Employee Name', key: 'Employee_Name' },
                    { label: 'Overall Status', key: 'Status' },
                    { label: 'HR', key: 'HR_Status' },
                    { label: 'IT', key: 'IT_Status' },
                    { label: 'Accounts', key: 'Accounts_Status' },
                    { label: 'Line Manager', key: 'Line_Status' },
                    { label: 'Exit Date', key: 'Exit_Date', type: 'date' },
                    { label: 'Created', key: 'Created', type: 'date' },
                ],
                rows: exitRows
            });
        }

        downloadExcel({ fileName: `Onboarding_Exit_Status_${new Date().toISOString().split('T')[0]}`, sheets });
    }
</script>

<!-- ── Reports UI ─────────────────────────────────────────────────── -->
<div class="space-y-4">

    <!-- Filters Row -->
    <div class="flex flex-wrap items-end gap-3 bg-slate-50 rounded-2xl px-4 py-3">
        <div>
            <label class="block text-[10px] font-medium text-slate-400 mb-0.5">Month</label>
            <input type="month" bind:value={selectedMonth}
                class="border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white"/>
        </div>
        <div>
            <label class="block text-[10px] font-medium text-slate-400 mb-0.5">Year</label>
            <select bind:value={selectedYear}
                class="border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                {#each Array.from({length: 5}, (_, i) => new Date().getFullYear() - i) as y}
                    <option value={y}>{y}</option>
                {/each}
            </select>
        </div>
        <p class="text-[10px] text-slate-400 ml-auto">
            Reports marked <span class="text-emerald-500">●</span> use the selected month/year filter
        </p>
    </div>

    <!-- Report Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        <div class="flex items-center gap-1.5">
                            <p class="text-sm font-semibold text-slate-800 truncate">{report.label}</p>
                            {#if report.filter === 'month'}
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Uses month filter"></span>
                            {:else if report.filter === 'year'}
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Uses year filter"></span>
                            {/if}
                        </div>
                        <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">{report.description}</p>
                    </div>
                    <!-- Download icon -->
                    <svg class="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </div>
            </button>
        {/each}
    </div>
</div>
