<script>
    /**
     * User_Dashboard +page.svelte
     * ─────────────────────────────────────────────────────────────────
     * The employee's personal workspace. Shows:
     *   - Greeting + today's attendance status
     *   - Leave balance progress cards (one per leave type)
     *   - Quick action buttons (Apply Leave, OD, CompOff, Expense)
     *   - Personal attendance calendar (month view with attendance/leave/holiday overlay)
     *   - Manager section: pending approvals for direct reportees (if is_manager = 1)
     *
     */

    import { onMount }    from 'svelte';
    import { post } from '$lib/utils/api';

    import { Live_Data_Storage }       from '$lib/stores/Live_Data_Storage.js';
    import { isSidebarOpen }           from '$lib/stores/LayoutStore.js';
    import { API_PATHS }               from '$lib/API_PATHS';
    import { openModal }               from '$lib/stores/AKS_HRMS_Modal_Store';
    import AKS_Calendar                from '$lib/components/AKS_HRMS_Components/Shared/AKS_Calendar.svelte';

    // ── Sub-module popup stubs (wired in during deep-dives) ────────────
    import {
        Employee_List, Attendance_List, Leave_List, OD_List,
        CompOff_List, Expense_List, Payroll_List, Onboarding_List,
        Exit_List, RFM_List, Holiday_List,
        Employee_AddEdit, Attendance_AddEdit, Leave_AddEdit, OD_AddEdit,
        CompOff_AddEdit, Expense_AddEdit, Payroll_AddEdit, Onboarding_AddEdit,
        Exit_AddEdit, RFM_AddEdit, Holiday_AddEdit,
        AKS_Reports_User
    } from '$lib/components/AKS_HRMS_Components';

    // ── V3: user comes from layout data ────────────────────────────────
    let Live_Data;
    $: Live_Data = $Live_Data_Storage;
    $: user = Live_Data.User_Information ?? {};
    $: isManager = user.Is_Manager === 1;

    // ── State ──────────────────────────────────────────────────────────
    // HRMS modules now sourced from Live_Data.Module_Sections (loaded once on
    // login/cold-reload via loadUserContext). Replaces the legacy per-page
    // Get_HRMS_Menu_for_User fetch.
    $: HRMS_Menu = $Live_Data_Storage?.Module_Sections?.HRMS ?? { Modules: {} };
    let employeeDetails         = null;
    let leaveBalances           = [];         // [{ Leave_Type_Name, Assigned, Used, Pending, Balance }]
    let todayAttendance         = null;       // { Status, InTime, OutTime } or null
    let calendarEvents          = [];
    let teamPendingApprovals    = [];
    let recentActivity          = [];

    let loadingDetails          = true;
    let loadingCalendar         = true;
    let loadingTeamApprovals    = true;

    let teamFilter              = 'All';
    let reportsOpen             = false;
    let teamPage                = 1;
    const TEAM_PAGE_SIZE        = 6;

    // ── Greeting ───────────────────────────────────────────────────────
    $: greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return  'Good evening';
    })();

    $: firstName = user.Employee_Name?.split(' ')[0] ?? '';

    const todayStr = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // ── Attendance status display ──────────────────────────────────────
    const ATT_STATUS = {
        Present:  { label: 'Present',      bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', icon: '✓' },
        Absent:   { label: 'Absent',        bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-400',    icon: '✕' },
        Leave:    { label: 'On Leave',      bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: '🌴' },
        OD:       { label: 'On Duty',       bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-400',     icon: '📋' },
        Holiday:  { label: 'Holiday',       bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  icon: '🎉' },
        default:  { label: 'Not Marked',    bg: 'bg-slate-50',   text: 'text-slate-500',   dot: 'bg-slate-300',   icon: '—' }
    };

    $: attDisplay = ATT_STATUS[todayAttendance?.Status] ?? ATT_STATUS.default;

    // ── Quick Actions ─────────────────────────────────────────────────
    const QUICK_ACTIONS = [
        {
            id:      'apply_leave',
            label:   'Apply Leave',
            icon:    `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="17" y1="17" x2="22" y2="22"/><line x1="22" y1="17" x2="17" y2="22"/>`,
            bg:      'bg-amber-50',   accent: 'text-amber-600',
            hoverBg: 'hover:bg-amber-100',
            popupKey: 'Leave_AddEdit',
            Module_Name: 'Leave_List'
        },
        {
            id:      'apply_od',
            label:   'On Duty',
            icon:    `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
            bg:      'bg-sky-50',     accent: 'text-sky-600',
            hoverBg: 'hover:bg-sky-100',
            popupKey: 'OD_AddEdit',
            Module_Name: 'OD_List'
        },
        {
            id:      'apply_compoff',
            label:   'Comp Off',
            icon:    `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
            bg:      'bg-violet-50',  accent: 'text-violet-600',
            hoverBg: 'hover:bg-violet-100',
            popupKey: 'CompOff_AddEdit',
            Module_Name: 'CompOff_List'
        },
        {
            id:      'submit_expense',
            label:   'Expense',
            icon:    `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>`,
            bg:      'bg-orange-50',  accent: 'text-orange-600',
            hoverBg: 'hover:bg-orange-100',
            popupKey: 'Expense_AddEdit',
            Module_Name: 'Expense_List'
        },
        {
            id:      'view_attendance',
            label:   'Attendance',
            icon:    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
            bg:      'bg-emerald-50', accent: 'text-emerald-600',
            hoverBg: 'hover:bg-emerald-100',
            popupKey: 'Attendance_List'
        },
        {
            id:      'view_payslips',
            label:   'Payslips',
            icon:    `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>`,
            bg:      'bg-green-50',   accent: 'text-green-600',
            hoverBg: 'hover:bg-green-100',
            popupKey: 'Payroll_List'
        },
    ];

    // ── Team approvals filter + paging ────────────────────────────────
    $: filteredTeamApprovals = teamFilter === 'All'
        ? teamPendingApprovals
        : teamPendingApprovals.filter(a => a.Module === teamFilter);

    $: totalTeamPages  = Math.ceil(filteredTeamApprovals.length / TEAM_PAGE_SIZE);
    $: pagedTeamApprovals = filteredTeamApprovals.slice(
        (teamPage - 1) * TEAM_PAGE_SIZE,
        teamPage * TEAM_PAGE_SIZE
    );

    const STATUS_BADGE = {
        'Pending':     'bg-yellow-100 text-yellow-700',
        'In-Progress': 'bg-blue-100   text-blue-700',
        'Approved':    'bg-green-100  text-green-700',
        'Rejected':    'bg-red-100    text-red-700'
    };
    const MODULE_BADGE = {
        'Leave':   'bg-amber-100 text-amber-700',
        'OD':      'bg-sky-100   text-sky-700',
        'CompOff': 'bg-violet-100 text-violet-700'
    };

    // ── Leave balance colour palette ──────────────────────────────────
    const BALANCE_COLORS = [
        { bar: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700'   },
        { bar: 'bg-sky-400',     bg: 'bg-sky-50',     text: 'text-sky-700'     },
        { bar: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
        { bar: 'bg-violet-400',  bg: 'bg-violet-50',  text: 'text-violet-700'  },
        { bar: 'bg-rose-400',    bg: 'bg-rose-50',    text: 'text-rose-700'    },
        { bar: 'bg-indigo-400',  bg: 'bg-indigo-50',  text: 'text-indigo-700'  },
    ];

    // ── Data loading ──────────────────────────────────────────────────
    onMount(async () => {
        $isSidebarOpen = false;

        fetchEmployeeData();
        fetchCalendarEvents();
        if (isManager) fetchTeamPendingApprovals();

    });

    async function fetchEmployeeData() {
        try {
            loadingDetails = true;

            const details     = await post(API_PATHS.API_URL_Get_Employee_Details_by_ID, { Employee_Details_ID: user.Employee_Self_ID });
            employeeDetails = details;

            // ── Leave balances ─────────────────────────────────────────
            const lb = details?.Leave_Balance ?? {};
            leaveBalances = Object.values(lb).map(lt => ({
                Leave_Type_Name: lt.Leave_Type_Name ?? '—',
                Assigned:        Number(lt.Assigned_Count)  ?? 0,
                Used:            Number(lt.Approved_Count)  ?? 0,
                Pending:         Number(lt.Pending_Count)   ?? 0,
                Balance:         Number(lt.Leave_Balance)   ?? 0
            }));

            // ── Today's attendance ─────────────────────────────────────
            const today   = new Date().toISOString().split('T')[0];
            const attData  = await post(API_PATHS.API_URL_Get_Attendance_Calendar_Data_by_ID, { Employee_Self_ID: user.Employee_Self_ID, Month: today.slice(0, 7) });
            if (Array.isArray(attData)) {
                todayAttendance = attData.find(a => a.Att_Date === today) ?? null;
            }

            loadingDetails = false;
        } catch (err) {
            console.error('Employee data fetch error:', err);
            loadingDetails = false;
        }
    }

    async function fetchCalendarEvents() {
        try {
            loadingCalendar = true;

            // Fetch holidays + personal attendance for current month
            const month = new Date().toISOString().slice(0, 7);
            const holidays = await post(API_PATHS.API_URL_Get_Holiday_Calendar_Data);
            const attendance = await post(API_PATHS.API_URL_Get_Attendance_Calendar_Data_by_ID, { Employee_Self_ID: user.Employee_Self_ID, Month: month });

            const events = [];

            // Holidays
            if (Array.isArray(holidays)) {
                for (const h of holidays) {
                    events.push({ date: h.Holiday_Date, type: 'holiday', label: h.Holiday_Name });
                }
            }

            // Personal attendance
            if (Array.isArray(attendance)) {
                for (const a of attendance) {
                    const typeMap = {
                        Present: 'present',
                        Absent:  'absent',
                        Leave:   'leave',
                        OD:      'od',
                        CompOff: 'compoff'
                    };
                    events.push({
                        date:  a.Att_Date,
                        type:  typeMap[a.Status] ?? 'absent',
                        label: a.Status + (a.InTime ? ` (${a.InTime})` : '')
                    });
                }
            }

            calendarEvents  = events;
            loadingCalendar = false;
        } catch (err) {
            console.error('Calendar fetch error:', err);
            loadingCalendar = false;
        }
    }

    async function handleCalendarMonthChange({ detail }) {
        // Reload attendance + holiday data for the navigated month
        try {
            const month = `${detail.year}-${String(detail.month + 1).padStart(2, '0')}`;
            const holidays = await post(API_PATHS.API_URL_Get_Holiday_Calendar_Data);
            const attendance = await post(API_PATHS.API_URL_Get_Attendance_Calendar_Data_by_ID, { Employee_Self_ID: user.Employee_Self_ID, Month: month });

            const events = [];

            if (Array.isArray(holidays)) {
                for (const h of holidays) {
                    events.push({ date: h.Holiday_Date, type: 'holiday', label: h.Holiday_Name });
                }
            }
            if (Array.isArray(attendance)) {
                const typeMap = { Present: 'present', Absent: 'absent', Leave: 'leave', OD: 'od', CompOff: 'compoff' };
                for (const a of attendance) {
                    events.push({
                        date:  a.Att_Date,
                        type:  typeMap[a.Status] ?? 'absent',
                        label: a.Status
                    });
                }
            }
            calendarEvents = events;
        } catch (err) {
            console.error('Calendar month change error:', err);
        }
    }

    async function fetchTeamPendingApprovals() {
        try {
            loadingTeamApprovals = true;

            const leaveData = await post(API_PATHS.API_URL_Get_Leave_Management_Data, { Manager_Employee_Self_ID: user.Employee_Self_ID, Status: 'Pending'});
            const odData = await post(API_PATHS.API_URL_Get_OD_Management_Data, { Manager_Employee_Self_ID: user.Employee_Self_ID, Status: 'Pending'});
            const compoffData = await post(API_PATHS.API_URL_Get_CompOff_Management_Data, { Manager_Employee_Self_ID: user.Employee_Self_ID, Status: 'Pending'});

            const toRow = (item, module) => ({
                ID:            item.Leave_ID ?? item.OD_ID ?? item.CompOff_ID,
                Employee_Name: item.Employee_Name ?? '—',
                Module:        module,
                Details:       item.Leave_Type_Name ?? item.OD_Reason ?? item.CompOff_Reason ?? '—',
                Start_Date:    item.Start_Date ?? '—',
                End_Date:      item.End_Date   ?? item.Start_Date ?? '—',
                Status:        item.Status     ?? 'Pending',
                Days:          item.Number_of_Days ?? '—',
                Level1_Approver_ID: item.Level1_Approver_ID ?? null,
                Level2_Approver_ID: item.Level2_Approver_ID ?? null
            });

            teamPendingApprovals = [
                ...(Array.isArray(leaveData)   ? leaveData.map(d   => toRow(d, 'Leave'))   : []),
                ...(Array.isArray(odData)       ? odData.map(d     => toRow(d, 'OD'))       : []),
                ...(Array.isArray(compoffData)  ? compoffData.map(d => toRow(d, 'CompOff')) : [])
            ];

            loadingTeamApprovals = false;
        } catch (err) {
            console.error('Team approvals fetch error:', err);
            loadingTeamApprovals = false;
        }
    }

    // ── Quick action launcher ─────────────────────────────────────────
    const POPUP_MAP = {
        Employee_List, Attendance_List, 
        Leave_List, OD_List, 
        CompOff_List, Expense_List, 
        Payroll_List, Onboarding_List, 
        Exit_List, RFM_List, Holiday_List,
        Employee_AddEdit, Attendance_AddEdit, Leave_AddEdit, OD_AddEdit,
        CompOff_AddEdit, Expense_AddEdit, Payroll_AddEdit, Onboarding_AddEdit,
        Exit_AddEdit, RFM_AddEdit, Holiday_AddEdit
    };
    function launchAction(mod) {
        openModal(POPUP_MAP[mod.popupKey], {}, { title: mod.label, size: 'xl' });
    }

    /**
     * FIX (P0): Wire Review & Quick Approve buttons for team pending approvals.
     */
    const MODULE_EDIT_MAP = {
        'Leave':   { component: Leave_AddEdit,   title: 'Leave Application',  saveApi: API_PATHS.API_URL_Save_Leave_Entry_Data,   detailsKey: 'Leave_Details' },
        'OD':      { component: OD_AddEdit,      title: 'On Duty Request',    saveApi: API_PATHS.API_URL_Save_OD_Entry_Data,      detailsKey: 'OD_Details' },
        'CompOff': { component: CompOff_AddEdit, title: 'Comp Off Request',  saveApi: API_PATHS.API_URL_Save_CompOff_Entry_Data, detailsKey: 'CompOff_Details' },
    };

    function openReviewForm(row) {
        const mapping = MODULE_EDIT_MAP[row.Module];
        if (!mapping) return;
        openModal(mapping.component, {
            editId: row.ID,
            initialMode: 'Edit',
            onSave: () => { fetchTeamPendingApprovals(); fetchEmployeeData(); }
        }, { title: mapping.title, size: 'xl' });
    }

    async function quickApprove(row) {
        const mapping = MODULE_EDIT_MAP[row.Module];
        if (!mapping) return;

        if (!confirm(`Approve ${row.Module} request from ${row.Employee_Name}?`)) return;

        try {
            // Determine which approval level this manager controls
            const isL1 = row.Level1_Approver_ID == user.Employee_Self_ID;
            const today = new Date().toISOString().split('T')[0];

            const approvalUpdate = {};
            if (isL1) {
                approvalUpdate.Level1_Approval = 'Approved';
                approvalUpdate.Level1_Approval_Date = today;
            } else {
                approvalUpdate.Level2_Approval = 'Approved';
                approvalUpdate.Level2_Approval_Date = today;
            }

            const result = await post(mapping.saveApi, {
                User_Information: user,
                Edit_ID: row.ID,
                Quick_Approval: approvalUpdate
            });

            if (result.status === 'success') {
                fetchTeamPendingApprovals();
                fetchEmployeeData();
            } else {
                alert(result.message ?? 'Approval failed.');
            }
        } catch (err) {
            console.error('Quick approve error:', err);
            alert('An error occurred during approval.');
        }
    }
</script>

<!-- ─────────────────────────────────────────────────────────────────────
     PAGE CONTENT
──────────────────────────────────────────────────────────────────────── -->
<div class="px-4 sm:px-6 py-5 space-y-6 max-w-[1200px] mx-auto">

    <!-- ── Greeting Banner ────────────────────────────────────────────── -->
    <div class="bg-[#1E3A5F] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex-1">
            <p class="text-white/60 text-sm">{todayStr}</p>
            <h2 class="text-xl sm:text-2xl font-bold text-white mt-0.5 tracking-tight">
                {greeting}, {firstName} 👋
            </h2>
            {#if user.Designation_Name}
                <p class="text-white/50 text-sm mt-1">{user.Designation_Name}
                    {#if user.Department_Name} · {user.Department_Name}{/if}
                </p>
            {/if}
        </div>

        <!-- Today's attendance pill -->
        <div class="shrink-0 {attDisplay.bg} rounded-xl px-4 py-3 min-w-[140px]">
            <p class="text-xs font-medium text-slate-500 mb-0.5">Today</p>
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full {attDisplay.dot}"></span>
                <span class="text-sm font-semibold {attDisplay.text}">{attDisplay.label}</span>
            </div>
            {#if todayAttendance?.InTime}
                <p class="text-xs text-slate-400 mt-1">In: {todayAttendance.InTime}
                    {#if todayAttendance.OutTime} · Out: {todayAttendance.OutTime}{/if}
                </p>
            {/if}
        </div>
    </div>

    <!-- ── Leave Balance Cards ─────────────────────────────────────────── -->
    {#if leaveBalances.length > 0}
        <div>
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Leave Balances</h3>
            <!-- Horizontal scroll on mobile, wrap on desktop -->
            <div class="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible">
                {#each leaveBalances as lb, i}
                    {@const colors = BALANCE_COLORS[i % BALANCE_COLORS.length]}
                    {@const usedPct = lb.Assigned > 0 ? Math.min(100, Math.round(((lb.Used + lb.Pending) / lb.Assigned) * 100)) : 0}
                    <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-[160px] sm:min-w-0 shrink-0 sm:shrink">
                        <p class="text-xs text-slate-500 truncate mb-2 font-medium">{lb.Leave_Type_Name}</p>
                        <!-- Progress bar -->
                        <div class="h-1.5 bg-slate-100 rounded-full mb-2 overflow-hidden">
                            <div
                                class="{colors.bar} h-full rounded-full transition-all duration-500"
                                style="width: {usedPct}%"
                            ></div>
                        </div>
                        <div class="flex justify-between items-end">
                            <div>
                                <span class="text-xl font-bold text-slate-800">{lb.Balance}</span>
                                <span class="text-xs text-slate-400">/{lb.Assigned}</span>
                            </div>
                            {#if lb.Pending > 0}
                                <span class="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                                    {lb.Pending} pending
                                </span>
                            {/if}
                        </div>
                        <p class="text-[10px] text-slate-400 mt-0.5">{lb.Used} used</p>
                    </div>
                {/each}
            </div>
        </div>
    {:else if !loadingDetails}
        <!-- Empty state for leave balances -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 text-center text-sm text-slate-400 shadow-sm">
            Leave balances not configured. Contact HR.
        </div>
    {/if}

    <!-- ── Main Grid: Calendar + Right Panel ──────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

        <!-- Left: Calendar -->
        <div>
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">My Calendar</h3>
            {#if loadingCalendar}
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center py-16">
                    <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            {:else}
                <AKS_Calendar
                    events={calendarEvents}
                    mode="user"
                    on:monthChange={handleCalendarMonthChange}
                    on:dateClick={({ detail }) => console.log('User clicked:', detail)}
                />
            {/if}
        </div>

        <!-- Right: Quick Actions -->
        <div class="space-y-5">
            <div>
                <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div class="grid grid-cols-3 lg:grid-cols-2 gap-2">
                    {#each QUICK_ACTIONS as action}
                        {#if HRMS_Menu?.Modules?.[action.popupKey] || HRMS_Menu?.Modules?.[action.Module_Name]}
                            <button
                                on:click={() => launchAction(action)}
                                class="
                                    bg-white border border-slate-100 rounded-2xl p-3 text-center
                                    group hover:shadow-md hover:border-slate-200
                                    transition-all duration-150 active:scale-[0.97]
                                    {action.hoverBg}
                                "
                            >
                                <div class="w-9 h-9 rounded-xl {action.bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                    <svg class="w-4.5 h-4.5 {action.accent}" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                                        {@html action.icon}
                                    </svg>
                                </div>
                                <p class="text-xs font-semibold text-slate-700 leading-tight">{action.label}</p>
                            </button>
                        {/if}
                    {/each}
                </div>
            </div>

            <!-- My Recent Activity -->
            <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-50">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</p>
                </div>
                <div class="divide-y divide-slate-50">
                    {#if loadingDetails}
                        {#each Array(3) as _}
                            <div class="px-4 py-3 animate-pulse flex gap-3">
                                <div class="w-2 h-2 rounded-full bg-slate-200 mt-1.5"></div>
                                <div class="flex-1">
                                    <div class="h-3 bg-slate-200 rounded w-3/4 mb-1.5"></div>
                                    <div class="h-2.5 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="px-4 py-3 text-center text-xs text-slate-400 py-6">
                            Recent activity will appear here
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- ── Manager Section: Team Pending Approvals ─────────────────────── -->
    {#if isManager}
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            <!-- Header -->
            <div class="px-5 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-sm font-semibold text-slate-800">Team Pending Approvals</h3>
                        {#if teamPendingApprovals.length > 0}
                            <span class="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {teamPendingApprovals.length}
                            </span>
                        {/if}
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">Requests from your direct reportees</p>
                </div>
                <div class="sm:ml-auto flex gap-1.5">
                    {#each ['All', 'Leave', 'OD', 'CompOff'] as f}
                        <button
                            on:click={() => { teamFilter = f; teamPage = 1; }}
                            class="
                                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                {teamFilter === f
                                    ? 'bg-[#1E3A5F] text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                            "
                        >
                            {f}
                        </button>
                    {/each}
                </div>
            </div>

            {#if loadingTeamApprovals}
                <div class="flex items-center justify-center py-10">
                    <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            {:else if pagedTeamApprovals.length === 0}
                <div class="flex flex-col items-center justify-center py-10 text-slate-400">
                    <svg class="w-10 h-10 mb-2 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm">All caught up — no pending approvals</p>
                </div>
            {:else}
                <!-- Desktop Table -->
                <div class="hidden sm:block overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-slate-50/80">
                                <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Employee</th>
                                <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Type</th>
                                <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Details</th>
                                <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Period</th>
                                <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Days</th>
                                <th class="text-right text-xs font-semibold text-slate-500 px-5 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            {#each pagedTeamApprovals as row}
                                <!-- Highlight rows where this manager is the Level1 approver -->
                                {@const isMyApproval = row.Level1_Approver_ID == user.Employee_Self_ID || row.Level2_Approver_ID == user.Employee_Self_ID}
                                <tr class="{isMyApproval ? 'bg-amber-50/40' : ''} hover:bg-slate-50/50 transition-colors">
                                    <td class="px-5 py-3.5">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                <span class="text-indigo-600 text-[11px] font-bold">{row.Employee_Name.charAt(0)}</span>
                                            </div>
                                            <span class="font-medium text-slate-800 text-sm">{row.Employee_Name}</span>
                                        </div>
                                    </td>
                                    <td class="px-3 py-3.5">
                                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium {MODULE_BADGE[row.Module] ?? ''}">
                                            {row.Module}
                                        </span>
                                    </td>
                                    <td class="px-3 py-3.5 text-slate-600 text-sm">{row.Details}</td>
                                    <td class="px-3 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                        {row.Start_Date}{row.End_Date !== row.Start_Date ? ` → ${row.End_Date}` : ''}
                                    </td>
                                    <td class="px-3 py-3.5 text-slate-700 text-sm font-medium">{row.Days}</td>
                                    <td class="px-5 py-3.5 text-right">
                                        {#if isMyApproval}
                                            <div class="flex gap-2 justify-end">
                                                <button
                                                    on:click={() => quickApprove(row)}
                                                    class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-200 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    on:click={() => openReviewForm(row)}
                                                    class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        {:else}
                                            <span class="text-xs text-slate-400">Pending L1</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Cards -->
                <div class="sm:hidden divide-y divide-slate-50">
                    {#each pagedTeamApprovals as row}
                        {@const isMyApproval = row.Level1_Approver_ID == user.Employee_Self_ID || row.Level2_Approver_ID == user.Employee_Self_ID}
                        <div class="px-4 py-3.5 {isMyApproval ? 'bg-amber-50/30' : ''}">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                                        <span class="font-medium text-slate-800 text-sm">{row.Employee_Name}</span>
                                        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-medium {MODULE_BADGE[row.Module] ?? ''}">
                                            {row.Module}
                                        </span>
                                    </div>
                                    <p class="text-xs text-slate-500">{row.Details}</p>
                                    <p class="text-xs text-slate-400 mt-0.5">
                                        {row.Start_Date} → {row.End_Date} · {row.Days} day{row.Days !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                {#if isMyApproval}
                                    <div class="flex flex-col gap-1.5 shrink-0">
                                        <button
                                            on:click={() => quickApprove(row)}
                                            class="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            on:click={() => openReviewForm(row)}
                                            class="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg"
                                        >
                                            Review
                                        </button>
                                    </div>
                                {:else}
                                    <span class="text-xs text-slate-400 shrink-0">Pending L1</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Pagination -->
                {#if totalTeamPages > 1}
                    <div class="px-5 py-3 border-t border-slate-50 flex items-center justify-between">
                        <p class="text-xs text-slate-400">
                            Showing {(teamPage - 1) * TEAM_PAGE_SIZE + 1}–{Math.min(teamPage * TEAM_PAGE_SIZE, filteredTeamApprovals.length)} of {filteredTeamApprovals.length}
                        </p>
                        <div class="flex gap-1">
                            <button
                                on:click={() => teamPage = Math.max(1, teamPage - 1)}
                                disabled={teamPage === 1}
                                class="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 hover:bg-slate-200"
                            >← Prev</button>
                            <button
                                on:click={() => teamPage = Math.min(totalTeamPages, teamPage + 1)}
                                disabled={teamPage === totalTeamPages}
                                class="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 hover:bg-slate-200"
                            >Next →</button>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    {/if}

    <!-- ── My Reports ─────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button
            on:click={() => reportsOpen = !reportsOpen}
            class="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
        >
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <svg class="w-4.5 h-4.5 text-indigo-600" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </div>
                <div class="text-left">
                    <h3 class="text-sm font-semibold text-slate-800">My Reports</h3>
                    <p class="text-xs text-slate-400">Download your attendance, leave, expenses, and more</p>
                </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 transition-transform {reportsOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </button>
        {#if reportsOpen}
            <div class="px-5 pb-5 border-t border-slate-50">
                <AKS_Reports_User />
            </div>
        {/if}
    </div>

</div>