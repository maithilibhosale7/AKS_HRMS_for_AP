<script>
    /**
     * HR_Admin_Dashboard +page.svelte
     * ─────────────────────────────────────────────────────────────────
     * The central command center for HR Admins. Shows:
     *   - Summary stats (employees, attendance, leaves, pending approvals)
     *   - Quick-access grid for all 12 HRMS sub-modules (open as modals)
     *   - Pending approvals table (cross-module: Leave + OD + CompOff)
     *   - Holiday calendar with leave overlay
     *
     * Popups: uses AKS_HRMS_Modal_Store openModal() pattern
     */

    import { onMount }    from 'svelte';
    import { goto } from '$app/navigation';
    import { post } from '$lib/utils/api';

    import { Live_Data_Storage }       from '$lib/stores/Live_Data_Storage.js';
    import { isSidebarOpen }           from '$lib/stores/LayoutStore.js';
    import { API_PATHS }               from '$lib/API_PATHS';
    import { openModal }               from '$lib/stores/AKS_HRMS_Modal_Store';
    import AKS_Calendar                from '$lib/components/AKS_HRMS_Components/Shared/AKS_Calendar.svelte';

    // ── Sub-module popup components (import as needed) ─────────────────
    import {
        Employee_List, Attendance_List, Leave_List, OD_List,
        CompOff_List, Expense_List, Payroll_List, Onboarding_List,
        Exit_List, RFM_List, Holiday_List,
        Employee_AddEdit, Attendance_AddEdit, Leave_AddEdit, OD_AddEdit,
        CompOff_AddEdit, Expense_AddEdit, Payroll_AddEdit, Onboarding_AddEdit,
        Exit_AddEdit, RFM_AddEdit, Holiday_AddEdit,
        AKS_Reports_Admin, HRMS_Settings
    } from '$lib/components/AKS_HRMS_Components';

    // ── V3: user comes from layout data ────────────────────────────────
    let Live_Data;
    $: Live_Data = $Live_Data_Storage;
    $: user = Live_Data.User_Information ?? {};

    // ── State ──────────────────────────────────────────────────────────
    let stats = {
        total_employees:    { value: '—', label: 'Total Employees',      trend: null, color: 'blue'   },
        present_today:      { value: '—', label: 'Present Today',        trend: null, color: 'green'  },
        on_leave_today:     { value: '—', label: 'On Leave Today',       trend: null, color: 'amber'  },
        pending_approvals:  { value: '—', label: 'Pending Approvals',    trend: null, color: 'red'    }
    };

    let pendingApprovals   = [];
    let calendarEvents     = [];
    let loading            = true;
    let approvalsLoading   = true;
    let statsLoading       = true;
    let activeFilter       = 'All';   // All | Leave | OD | CompOff
    let reportsOpen        = false;

    // ── Module grid definition ─────────────────────────────────────────
    // Each entry maps to a sub-module popup + its anchor hash for deep-linking
    const MODULES = [
        {
            id: 'employees',
            label: 'Employees',
            description: 'Manage profiles & records',
            icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
            bg: 'bg-blue-50',   accent: 'text-blue-600',   badge: null,
            popupKey: 'Employee_List'
        },
        {
            id: 'attendance',
            label: 'Attendance',
            description: 'Daily in/out & OT tracking',
            icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
            bg: 'bg-emerald-50', accent: 'text-emerald-600', badge: null,
            popupKey: 'Attendance_List'
        },
        {
            id: 'leave',
            label: 'Leave',
            description: 'Applications & balances',
            icon: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="17" y1="17" x2="22" y2="22"/><line x1="22" y1="17" x2="17" y2="22"/>`,
            bg: 'bg-amber-50',  accent: 'text-amber-600',  badge: null,
            popupKey: 'Leave_List'
        },
        {
            id: 'od',
            label: 'On Duty',
            description: 'OD requests & approvals',
            icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
            bg: 'bg-sky-50',    accent: 'text-sky-600',    badge: null,
            popupKey: 'OD_List'
        },
        {
            id: 'compoff',
            label: 'Comp Off',
            description: 'Compensatory offs',
            icon: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
            bg: 'bg-violet-50', accent: 'text-violet-600', badge: null,
            popupKey: 'CompOff_List'
        },
        {
            id: 'expense',
            label: 'Expenses',
            description: 'Claims & reimbursements',
            icon: `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>`,
            bg: 'bg-orange-50', accent: 'text-orange-600', badge: null,
            popupKey: 'Expense_List'
        },
        {
            id: 'payroll',
            label: 'Payroll',
            description: 'Salary processing & payslips',
            icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>`,
            bg: 'bg-green-50',  accent: 'text-green-600',  badge: null,
            popupKey: 'Payroll_List'
        },
        {
            id: 'onboarding',
            label: 'Onboarding',
            description: 'New hire journeys',
            icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>`,
            bg: 'bg-teal-50',   accent: 'text-teal-600',   badge: null,
            popupKey: 'Onboarding_List'
        },
        {
            id: 'exit',
            label: 'Exit',
            description: 'Offboarding & clearances',
            icon: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
            bg: 'bg-rose-50',   accent: 'text-rose-600',   badge: null,
            popupKey: 'Exit_List'
        },
        {
            id: 'rfm',
            label: 'RFM',
            description: 'Recruitment & feedback',
            icon: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
            bg: 'bg-indigo-50', accent: 'text-indigo-600', badge: null,
            popupKey: 'RFM_List'
        },
        {
            id: 'pms',
            label: 'PMS',
            description: 'KRA, KPI and performance cycle',
            icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
            bg: 'bg-purple-50', accent: 'text-purple-600', badge: null,
            href: '/KRA_KPI'
        },
        {
            id: 'holidays',
            label: 'Holidays',
            description: 'Holiday calendar management',
            icon: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
            bg: 'bg-pink-50',   accent: 'text-pink-600',   badge: null,
            popupKey: 'Holiday_List'
        },
        {
            label: 'Settings',
            value: '',
            sub: 'Master Data & Uploads',
            color: 'slate',
            icon: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
            popupKey: 'HRMS_Settings'
        }
    ];

    // ── Stat card color maps ───────────────────────────────────────────
    const STAT_COLORS = {
        blue:  { bg: 'bg-blue-50',   icon: 'text-blue-500',   val: 'text-blue-700'   },
        green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', val: 'text-emerald-700' },
        amber: { bg: 'bg-amber-50',  icon: 'text-amber-500',  val: 'text-amber-700'  },
        red:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   val: 'text-rose-700'   }
    };

    const STAT_ICONS = {
        blue:  `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`,
        green: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
        amber: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>`,
        red:   `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`
    };

    // ── Filter & derived pending list ──────────────────────────────────
    $: filteredApprovals = activeFilter === 'All'
        ? pendingApprovals
        : pendingApprovals.filter(a => a.Module === activeFilter);

    // ── Pagination ────────────────────────────────────────────────────
    let approvalsPage = 1;
    const PAGE_SIZE   = 8;
    $: totalPages     = Math.ceil(filteredApprovals.length / PAGE_SIZE);
    $: pagedApprovals = filteredApprovals.slice((approvalsPage - 1) * PAGE_SIZE, approvalsPage * PAGE_SIZE);

    // ── Data fetch ────────────────────────────────────────────────────
    onMount(async () => {
        $isSidebarOpen = false;

        fetchStats();
        fetchPendingApprovals();
        fetchCalendarEvents();

        loading = false;
    });

    async function fetchStats() {
        try {
            statsLoading = true;
            // These endpoints will be built during deep-dives.
            // For now they gracefully degrade to '—'.

            // Employee count
            const empData = await post(API_PATHS.API_URL_Get_Employee_Details_Data);
            stats.total_employees.value = Array.isArray(empData) ? empData.length : '—';

            // Attendance today
            const today = new Date().toISOString().split('T')[0];
            const attData = await post(API_PATHS.API_URL_Get_Attendance_Management_Data, { Date_Filter: today });
            stats.present_today.value = Array.isArray(attData) ? attData.filter(a => a.Status === 'Present').length : '—';

            statsLoading = false;
        } catch (err) {
            console.error('Stats fetch error:', err);
            statsLoading = false;
        }
    }

    async function fetchPendingApprovals() {
        try {
            approvalsLoading = true;

            // Fetch pending Leave, OD, and CompOff in parallel
            const leaveData = await post(API_PATHS.API_URL_Get_Leave_Management_Data, { Is_HR_Admin: true, Status: 'Pending' });
            const odData = await post(API_PATHS.API_URL_Get_OD_Management_Data, { Is_HR_Admin: true, Status: 'Pending' });
            const compoffData = await post(API_PATHS.API_URL_Get_CompOff_Management_Data, { Is_HR_Admin: true, Status: 'Pending' });

            // Normalise into a common shape
            const toRow = (item, module) => ({
                ID:            item.Leave_ID ?? item.OD_ID ?? item.CompOff_ID,
                Employee_Name: item.Employee_Name ?? '—',
                Module:        module,
                Details:       item.Leave_Type_Name ?? item.OD_Reason ?? item.CompOff_Reason ?? '—',
                Start_Date:    item.Start_Date ?? '—',
                End_Date:      item.End_Date   ?? item.Start_Date ?? '—',
                Status:        item.Status     ?? 'Pending',
                Applied_On:    item.Applied_Date ?? item.System_Datetime_Creation ?? '—'
            });

            pendingApprovals = [
                ...(Array.isArray(leaveData)   ? leaveData.map(d   => toRow(d,   'Leave'))   : []),
                ...(Array.isArray(odData)       ? odData.map(d       => toRow(d,   'OD'))     : []),
                ...(Array.isArray(compoffData)  ? compoffData.map(d  => toRow(d,   'CompOff')) : [])
            ];

            // Update badges on module cards
            const leavePendingCount  = Array.isArray(leaveData)   ? leaveData.length   : 0;
            const odPendingCount     = Array.isArray(odData)       ? odData.length       : 0;
            const compoffPendingCount = Array.isArray(compoffData) ? compoffData.length : 0;

            stats.pending_approvals.value = leavePendingCount + odPendingCount + compoffPendingCount;

            MODULES.find(m => m.id === 'leave')  .badge = leavePendingCount   || null;
            MODULES.find(m => m.id === 'od')     .badge = odPendingCount       || null;
            MODULES.find(m => m.id === 'compoff').badge = compoffPendingCount  || null;

            approvalsLoading = false;
        } catch (err) {
            console.error('Pending approvals fetch error:', err);
            approvalsLoading = false;
        }
    }

    async function fetchCalendarEvents() {
        try {
            const data  = await post(API_PATHS.API_URL_Get_Holiday_Calendar_Data);
            if (Array.isArray(data)) {
                calendarEvents = data.map(h => ({
                    date:  h.Holiday_Date,
                    type:  'holiday',
                    label: h.Holiday_Name,
                    count: null
                }));
            }
        } catch (err) {
            console.error('Calendar fetch error:', err);
        }
    }

    function handleCalendarMonthChange({ detail }) {
        // Re-fetch events for the new month if needed
        fetchCalendarEvents();
    }

    // ── Module popup launcher ─────────────────────────────────────────
    // Stub: real popup components will be wired up during each module's deep-dive.
    const POPUP_MAP = {
        Employee_List, Attendance_List, 
        Leave_List, OD_List, 
        CompOff_List, Expense_List, 
        Payroll_List, Onboarding_List, 
        Exit_List, RFM_List, Holiday_List,
        Employee_AddEdit, Attendance_AddEdit, Leave_AddEdit, OD_AddEdit,
        CompOff_AddEdit, Expense_AddEdit, Payroll_AddEdit, Onboarding_AddEdit,
        Exit_AddEdit, RFM_AddEdit, Holiday_AddEdit, HRMS_Settings
    };
    function launchModule(mod) {
        if (mod.href) {
            goto(mod.href);
            return;
        }
        openModal(POPUP_MAP[mod.popupKey], {}, { title: mod.label, size: 'xl' });
    }

    /**
     * FIX (P0): Wire the Review button to open the correct *_AddEdit modal
     * based on the row's Module type (Leave, OD, CompOff).
     * Passes editId and initialMode='Edit' so the approver lands in edit mode.
     * onSave callback refreshes the pending approvals table.
     */
    const MODULE_EDIT_MAP = {
        'Leave':   { component: Leave_AddEdit,   title: 'Leave Application' },
        'OD':      { component: OD_AddEdit,      title: 'On Duty Request' },
        'CompOff': { component: CompOff_AddEdit, title: 'Comp Off Request' },
    };

    function openApprovalForm(row) {
        const mapping = MODULE_EDIT_MAP[row.Module];
        if (!mapping) return;
        openModal(mapping.component, {
            editId: row.ID,
            initialMode: 'Edit',
            onSave: () => { fetchPendingApprovals(); fetchStats(); }
        }, { title: mapping.title, size: 'xl' });
    }

    // ── Status badge helper ───────────────────────────────────────────
    const STATUS_BADGE = {
        'Pending':     'bg-yellow-100 text-yellow-700',
        'In-Progress': 'bg-blue-100   text-blue-700',
        'Approved':    'bg-green-100  text-green-700',
        'Rejected':    'bg-red-100    text-red-700'
    };

    // ── Module badge color ────────────────────────────────────────────
    const MODULE_BADGE = {
        'Leave':   'bg-amber-100 text-amber-700',
        'OD':      'bg-sky-100   text-sky-700',
        'CompOff': 'bg-violet-100 text-violet-700'
    };

    // ── Today string ──────────────────────────────────────────────────
    const todayStr = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
</script>

<!-- ─────────────────────────────────────────────────────────────────────
     PAGE CONTENT
──────────────────────────────────────────────────────────────────────── -->
<div class="px-4 sm:px-6 py-5 space-y-6 max-w-[1400px] mx-auto">

    <!-- ── Welcome Header ─────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
            <h2 class="text-xl font-bold text-slate-800 tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
                {user?.Employee_Name?.split(' ')[0] ?? 'Admin'} 👋
            </h2>
            <p class="text-sm text-slate-500 mt-0.5">{todayStr}</p>
        </div>
        <div class="flex gap-2">
            <button
                on:click={() => launchModule(MODULES.find(m => m.id === 'employees'))}
                class="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] transition-colors shadow-sm"
            >
                + Add Employee
            </button>
        </div>
    </div>

    <!-- ── Stats Cards ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {#each Object.entries(stats) as [key, stat]}
            {@const colors = STAT_COLORS[stat.color]}
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3 group hover:shadow-md transition-shadow">
                <div class="w-10 h-10 rounded-xl {colors.bg} flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 {colors.icon}" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        {@html STAT_ICONS[stat.color]}
                    </svg>
                </div>
                <div class="min-w-0">
                    <p class="text-[11px] text-slate-500 leading-tight">{stat.label}</p>
                    <p class="text-2xl font-bold {colors.val} mt-0.5 leading-none">
                        {statsLoading ? '—' : stat.value}
                    </p>
                </div>
            </div>
        {/each}
    </div>

    <!-- ── Main Grid: Modules + Calendar ──────────────────────────────── -->
    <div class="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

        <!-- Left: Module Grid + Pending Approvals -->
        <div class="space-y-5">

            <!-- Module Quick-Access Grid -->
            <div>
                <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Modules</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {#each MODULES as mod}
                        <button
                            on:click={() => launchModule(mod)}
                            class="
                                relative bg-white border border-slate-100 rounded-2xl p-4
                                text-left group hover:shadow-md hover:border-slate-200
                                transition-all duration-150 active:scale-[0.98]
                            "
                        >
                            <!-- Badge -->
                            {#if mod.badge}
                                <span class="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {mod.badge}
                                </span>
                            {/if}

                            <div class="w-9 h-9 rounded-xl {mod.bg} flex items-center justify-center mb-3">
                                <svg class="w-4.5 h-4.5 {mod.accent}" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                                    {@html mod.icon}
                                </svg>
                            </div>
                            <p class="text-sm font-semibold text-slate-800 leading-tight">{mod.label}</p>
                            <p class="text-[11px] text-slate-400 mt-0.5 leading-tight hidden sm:block">{mod.description}</p>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Pending Approvals Table -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                <!-- Header + Filter -->
                <div class="px-5 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div>
                        <h3 class="text-sm font-semibold text-slate-800">Pending Approvals</h3>
                        <p class="text-xs text-slate-400 mt-0.5">{filteredApprovals.length} request{filteredApprovals.length !== 1 ? 's' : ''} awaiting action</p>
                    </div>
                    <div class="sm:ml-auto flex gap-1.5 flex-wrap">
                        {#each ['All', 'Leave', 'OD', 'CompOff'] as f}
                            <button
                                on:click={() => { activeFilter = f; approvalsPage = 1; }}
                                class="
                                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                    {activeFilter === f
                                        ? 'bg-[#1E3A5F] text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                "
                            >
                                {f}
                            </button>
                        {/each}
                    </div>
                </div>

                {#if approvalsLoading}
                    <div class="flex items-center justify-center py-12">
                        <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                {:else if pagedApprovals.length === 0}
                    <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                        <svg class="w-10 h-10 mb-2 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p class="text-sm">No pending approvals</p>
                    </div>
                {:else}
                    <!-- Desktop Table -->
                    <div class="hidden sm:block overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="bg-slate-50/80">
                                    <th class="text-left text-xs font-semibold text-slate-500 px-5 py-3">Employee</th>
                                    <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Module</th>
                                    <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Details</th>
                                    <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Period</th>
                                    <th class="text-left text-xs font-semibold text-slate-500 px-3 py-3">Status</th>
                                    <th class="text-right text-xs font-semibold text-slate-500 px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                {#each pagedApprovals as row}
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="px-5 py-3.5">
                                            <div class="flex items-center gap-2.5">
                                                <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                    <span class="text-indigo-600 text-[11px] font-bold">{row.Employee_Name.charAt(0)}</span>
                                                </div>
                                                <span class="font-medium text-slate-800 text-sm">{row.Employee_Name}</span>
                                            </div>
                                        </td>
                                        <td class="px-3 py-3.5">
                                            <span class="px-2 py-0.5 rounded-full text-[11px] font-medium {MODULE_BADGE[row.Module] ?? 'bg-slate-100 text-slate-600'}">
                                                {row.Module}
                                            </span>
                                        </td>
                                        <td class="px-3 py-3.5 text-slate-600 text-sm">{row.Details}</td>
                                        <td class="px-3 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                            {row.Start_Date}{row.End_Date !== row.Start_Date ? ` → ${row.End_Date}` : ''}
                                        </td>
                                        <td class="px-3 py-3.5">
                                            <span class="px-2 py-0.5 rounded-full text-[11px] font-medium {STATUS_BADGE[row.Status] ?? ''}">
                                                {row.Status}
                                            </span>
                                        </td>
                                        <td class="px-5 py-3.5 text-right">
                                            <button
                                                on:click={() => openApprovalForm(row)}
                                                class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                Review →
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- Mobile Cards (below sm) -->
                    <div class="sm:hidden divide-y divide-slate-50">
                        {#each pagedApprovals as row}
                            <div class="px-4 py-3.5">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="font-medium text-slate-800 text-sm">{row.Employee_Name}</span>
                                            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-medium {MODULE_BADGE[row.Module] ?? ''}">
                                                {row.Module}
                                            </span>
                                        </div>
                                        <p class="text-xs text-slate-500">{row.Details}</p>
                                        <p class="text-xs text-slate-400 mt-0.5">{row.Start_Date} → {row.End_Date}</p>
                                    </div>
                                    <div class="flex flex-col items-end gap-2 shrink-0 ml-3">
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium {STATUS_BADGE[row.Status] ?? ''}">
                                            {row.Status}
                                        </span>
                                        <button class="text-xs text-indigo-600 font-medium">Review →</button>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <!-- Pagination -->
                    {#if totalPages > 1}
                        <div class="px-5 py-3 border-t border-slate-50 flex items-center justify-between">
                            <p class="text-xs text-slate-400">
                                Showing {(approvalsPage - 1) * PAGE_SIZE + 1}–{Math.min(approvalsPage * PAGE_SIZE, filteredApprovals.length)} of {filteredApprovals.length}
                            </p>
                            <div class="flex gap-1">
                                <button
                                    on:click={() => approvalsPage = Math.max(1, approvalsPage - 1)}
                                    disabled={approvalsPage === 1}
                                    class="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 hover:bg-slate-200 transition-colors"
                                >← Prev</button>
                                <button
                                    on:click={() => approvalsPage = Math.min(totalPages, approvalsPage + 1)}
                                    disabled={approvalsPage === totalPages}
                                    class="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 hover:bg-slate-200 transition-colors"
                                >Next →</button>
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>

        <!-- Right: Calendar -->
        <div class="space-y-4">
            <div>
                <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Calendar</h3>
                <AKS_Calendar
                    events={calendarEvents}
                    mode="admin"
                    on:monthChange={handleCalendarMonthChange}
                    on:dateClick={({ detail }) => {
                        if (detail.events.length) {
                            console.log('Admin clicked:', detail.date, detail.events);
                        }
                    }}
                />
            </div>

            <!-- Mini Leave Stats (below calendar) -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
                {#each [
                    { label: 'Leaves Approved',   value: '—', color: 'bg-emerald-400' },
                    { label: 'Leaves Pending',     value: stats.pending_approvals.value, color: 'bg-amber-400' },
                    { label: 'OD Requests',        value: '—', color: 'bg-sky-400' },
                    { label: 'Expense Claims',     value: '—', color: 'bg-orange-400' },
                ] as item}
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full {item.color}"></span>
                            <span class="text-xs text-slate-600">{item.label}</span>
                        </div>
                        <span class="text-sm font-semibold text-slate-800">{item.value}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- ── Reports Section ─────────────────────────────────────────────── -->
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
                    <h3 class="text-sm font-semibold text-slate-800">Download Reports</h3>
                    <p class="text-xs text-slate-400">10 standard HR reports — Employee, Attendance, Leave, Payroll, and more</p>
                </div>
            </div>
            <svg class="w-4 h-4 text-slate-400 transition-transform {reportsOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </button>
        {#if reportsOpen}
            <div class="px-5 pb-5 border-t border-slate-50">
                <AKS_Reports_Admin />
            </div>
        {/if}
    </div>

</div>