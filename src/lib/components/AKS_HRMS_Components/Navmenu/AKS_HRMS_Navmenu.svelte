<script>
    /**
     * AKS_HRMS_Navmenu.svelte
     * ─────────────────────────────────────────────────────────────────
     * HRMS module navigation rendered as accordion groups inside the
     * main sidebar Navmenu. Opens modals for sub-modules, navigates
     * for dashboards.
     *
     * Place at: src/lib/components/AKS_HRMS_Components/Navmenu/AKS_HRMS_Navmenu.svelte
     *
     * Props:
     *   theme  – nav_menu theme object from Project_Theme_Settings
     *
     * Events:
     *   navigate – dispatched after any nav action (so parent can close mobile drawer)
     */

    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { slide } from 'svelte/transition';

    import { openModal } from '$lib/stores/AKS_HRMS_Modal_Store';
    import { pmsGroupsForUser } from '$lib/pmsAccess.js';
    import {
        Employee_List, Attendance_List, Leave_List, OD_List,
        CompOff_List, Expense_List, Payroll_List, Onboarding_List,
        Exit_List, RFM_List, Holiday_List,
        Leave_AddEdit, OD_AddEdit, CompOff_AddEdit, Expense_AddEdit
    } from '$lib/components/AKS_HRMS_Components';

    export let theme;
    export let isHRAdmin = false;
    export let user = {};

    const dispatch = createEventDispatcher();

    // ── Internal accordion state (which group is expanded) ───────────
    let openGroup = null;

    function toggleGroup(name) {
        openGroup = openGroup === name ? null : name;
    }

    // ── Navigation helpers ───────────────────────────────────────────
    function doOpenList(component, title) {
        openModal(component, {}, { title, size: 'xl' });
        dispatch('navigate');
    }

    function doOpenAdd(component, title) {
        openModal(component, { editId: 'Add' }, { title, size: 'xl' });
        dispatch('navigate');
    }

    function doGoto(href) {
        goto(href);
        dispatch('navigate');
    }

    // ── Nav definitions ──────────────────────────────────────────────
    const ADMIN_NAV = [
        { group: 'Overview', items: [
            { label: 'Dashboard', type: 'route', href: '/AKS_HRMS/HR_Admin_Dashboard' },
        ]},
        { group: 'People', items: [
            { label: 'Employees',       type: 'list', component: Employee_List,   modalTitle: 'Employees' },
            { label: 'Onboarding',      type: 'list', component: Onboarding_List, modalTitle: 'Onboarding' },
            { label: 'Exit Management', type: 'list', component: Exit_List,       modalTitle: 'Exit Management' },
        ]},
        { group: 'Time & Attendance', items: [
            { label: 'Attendance',       type: 'list', component: Attendance_List, modalTitle: 'Attendance' },
            { label: 'Leave',            type: 'list', component: Leave_List,      modalTitle: 'Leave Management' },
            { label: 'On Duty (OD)',     type: 'list', component: OD_List,         modalTitle: 'On Duty' },
            { label: 'Comp Off',         type: 'list', component: CompOff_List,    modalTitle: 'Comp Off' },
            { label: 'Holiday Calendar', type: 'list', component: Holiday_List,    modalTitle: 'Holiday Calendar' },
        ]},
        { group: 'Finance', items: [
            { label: 'Payroll',  type: 'list', component: Payroll_List, modalTitle: 'Payroll' },
            { label: 'Expenses', type: 'list', component: Expense_List, modalTitle: 'Expense Claims' },
        ]},
        { group: 'Recruitment', items: [
            { label: 'RFM', type: 'list', component: RFM_List, modalTitle: 'Recruitment' },
        ]},
        { group: 'PMS', items: [
            { label: 'KRA / KPI Masters', type: 'route', href: '/KRA_KPI' },
            { label: 'Add KRA / KPI', type: 'route', href: '/KRA_KPI_Master_Add' },
            { label: 'Performance Cycle', type: 'route', href: '/KRA_KPI_Transaction' },
            { label: 'Add Rating', type: 'route', href: '/KRA_KPI_Transaction' },
        ]},
        { group: 'Corporate', items: [
            { label: 'Corporate Hierarchy', type: 'route', href: '/Corporate_Hierarchy' },
            { label: 'Hierarchy Approval', type: 'route', href: '/Corporate_Hierarchy_Approval' },
        ]},
        { group: 'Access', items: [
            { label: 'Module Access', type: 'route', href: '/Project_Setup/Module_Access' },
            { label: 'User Activity Logs', type: 'route', href: '/Project_Setup/User_Activity_Logs' },
        ]},
    ];

    const USER_NAV = [
        { group: 'My Workspace', items: [
            { label: 'My Dashboard', type: 'route', href: '/AKS_HRMS/User_Dashboard' },
        ]},
        { group: 'Requests', items: [
            { label: 'Apply Leave',  type: 'add', component: Leave_AddEdit,   modalTitle: 'Apply Leave' },
            { label: 'On Duty (OD)', type: 'add', component: OD_AddEdit,      modalTitle: 'On Duty Request' },
            { label: 'Comp Off',     type: 'add', component: CompOff_AddEdit, modalTitle: 'Comp Off Request' },
            { label: 'Expenses',     type: 'add', component: Expense_AddEdit, modalTitle: 'Expense Claim' },
        ]},
        { group: 'My Records', items: [
            { label: 'Attendance',         type: 'list', component: Attendance_List, modalTitle: 'My Attendance' },
            { label: 'My Leave Requests',  type: 'list', component: Leave_List,      modalTitle: 'My Leave Requests' },
            { label: 'My OD Requests',     type: 'list', component: OD_List,         modalTitle: 'My OD Requests' },
            { label: 'My Comp Off',        type: 'list', component: CompOff_List,    modalTitle: 'My Comp Off' },
            { label: 'My Expenses',        type: 'list', component: Expense_List,    modalTitle: 'My Expenses' },
            { label: 'Payslips',           type: 'list', component: Payroll_List,    modalTitle: 'My Payslips' },
        ]},
    ];

    $: navGroups = isHRAdmin ? ADMIN_NAV : [...USER_NAV, ...pmsGroupsForUser(user)];

    // ── Item click handler ───────────────────────────────────────────
    // Modal renderer lives in routes/AKS_HRMS/+layout.svelte, so modals only
    // paint while we are mounted under /AKS_HRMS. If the user clicks a modal
    // item from a non-HRMS route, first route to their HRMS dashboard so the
    // layout (and renderer) mounts, then push the modal.
    async function handleItemClick(item) {
        if (item.type === 'route') {
            doGoto(item.href);
            return;
        }

        const onHRMS = $page.url.pathname.startsWith('/AKS_HRMS');
        if (!onHRMS) {
            const dashboardRoute = isHRAdmin
                ? '/AKS_HRMS/HR_Admin_Dashboard'
                : '/AKS_HRMS/User_Dashboard';
            await goto(dashboardRoute);
        }

        if (item.type === 'add') {
            doOpenAdd(item.component, item.modalTitle);
        } else {
            doOpenList(item.component, item.modalTitle);
        }
    }
</script>

<!-- Renders inside the parent's HRMS accordion panel -->
{#each navGroups as group}
    <div class="heading-group mt-3 first:mt-0">
        <!-- Level 2: Group heading (collapsible) -->
        <button
            on:click={() => toggleGroup(group.group)}
            class="w-full flex items-center justify-between px-1 py-2 text-[14px] font-semibold rounded-lg transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/10"
            style="color: {theme.heading_text}; background-color: {openGroup === group.group ? theme.heading_active_bg + '25' : 'transparent'};"
        >
            <div class="flex items-center gap-1 min-h-[24px]">
                <span class="text-base opacity-30 flex-shrink-0">▸</span>
                <span class="font-semibold leading-tight break-words text-left block max-w-[170px]">{group.group}</span>
            </div>
        </button>

        <!-- Level 3: Items -->
        {#if openGroup === group.group}
            <div transition:slide|local class="pl-3 mt-1 space-y-1 border-l-2">
                {#each group.items as item}
                    <button
                        on:click={() => handleItemClick(item)}
                        class="nav-link w-full text-left px-2 py-1.5 text-[13px] transition-all rounded-lg hover:bg-black/10 hover:pl-6 focus:outline-none focus:ring-1 focus:ring-black/10"
                        style="color: {theme.sub_text};"
                    >
                        <span class="flex items-center gap-2">
                            {item.label}
                        </span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/each}

<style>
    .nav-link {
        transition: background 0.15s, color 0.15s, padding 0.15s;
    }
    .heading-group button {
        transition: background 0.15s, color 0.15s;
    }
</style>