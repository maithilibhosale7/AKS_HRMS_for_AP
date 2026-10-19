<script>
    /**
     * Employee_List.svelte — FINALIZED
     * ─────────────────────────────────────────────────────────────────
     * Searchable, filterable employee list opened as a modal from
     * HR_Admin_Dashboard or User_Dashboard.
     *
     * Filters: Search (name/code), Department, Designation, Status
     * Actions: Add, View, Edit (HR Admin only)
     */

    import { onMount }       from 'svelte';
    import { post }          from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage.js';
    import { API_PATHS }     from '$lib/API_PATHS';
    import { openModal }     from '$lib/stores/AKS_HRMS_Modal_Store';
    import Employee_AddEdit  from './Employee_AddEdit.svelte';

    // ── User context ───────────────────────────────────────────────────
    let Live_Data;
    $: Live_Data  = $Live_Data_Storage;
    $: user       = Live_Data.User_Information ?? {};
    $: isHRAdmin  = user?.HRMS_Access === 'HR Admin';

    // ── State ──────────────────────────────────────────────────────────
    let records            = [];
    let loading            = true;
    let searchQuery        = '';
    let filterStatus       = 'All';
    let filterDepartment   = 'All';
    let filterDesignation  = 'All';
    let showFilters        = false;     // toggle for mobile filter drawer

    // ── Master data for filter dropdowns ────────────────────────────────
    let Department_Data   = {};    // { Department_ID: { Department_Name, ... }, ... }
    let Designation_Data  = {};    // { Designation_ID: { Designation_Name, ... }, ... }

    // ── Derived: unique values for filter selects ───────────────────────
    $: departmentOptions  = Object.values(Department_Data).map(d => ({ id: String(d.Department_ID), name: d.Department_Name }));
    $: designationOptions = Object.values(Designation_Data).map(d => ({ id: String(d.Designation_ID), name: d.Designation_Name }));

    // ── Pagination ─────────────────────────────────────────────────────
    let currentPage = 1;
    const PAGE_SIZE = 10;

    $: filtered = records.filter(r => {
        const matchesSearch = !searchQuery ||
            r.Employee_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.Employee_Code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus      = filterStatus      === 'All' || r.Status           === filterStatus;
        const matchesDepartment  = filterDepartment  === 'All' || String(r.Department_ID)  === filterDepartment;
        const matchesDesignation = filterDesignation === 'All' || String(r.Designation_ID) === filterDesignation;
        return matchesSearch && matchesStatus && matchesDepartment && matchesDesignation;
    });

    $: totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    $: paged      = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page on any filter change
    $: { searchQuery; filterStatus; filterDepartment; filterDesignation; currentPage = 1; }

    $: activeFilterCount = (filterStatus !== 'All' ? 1 : 0) +
                           (filterDepartment !== 'All' ? 1 : 0) +
                           (filterDesignation !== 'All' ? 1 : 0);

    // ── Data fetch ─────────────────────────────────────────────────────
    onMount(async () => {
        // Load master data (for filter dropdowns) and employee list in parallel
        const [masterData, employeeList] = await Promise.all([
            post(API_PATHS.API_URL_Get_Master_Data_for_Employee_Details),
            post(API_PATHS.API_URL_Get_Employee_Details_Data)
        ]);

        Department_Data  = masterData.Department_Data  ?? {};
        Designation_Data = masterData.Designation_Data  ?? {};
        records          = Array.isArray(employeeList) ? employeeList : [];
        loading          = false;
    });

    // ── Refresh after Add/Edit ─────────────────────────────────────────
    async function refreshList() {
        records = await post(API_PATHS.API_URL_Get_Employee_Details_Data);
        if (!Array.isArray(records)) records = [];
    }

    // ── Actions ────────────────────────────────────────────────────────
    function openAdd() {
        openModal(Employee_AddEdit, { editId: 'Add', onSave: refreshList }, { title: 'Add Employee', size: 'xl' });
    }
    function openView(id) {
        openModal(Employee_AddEdit, { editId: id, initialMode: 'View', onSave: refreshList }, { title: 'Employee Profile', size: 'xl' });
    }
    function openEdit(id) {
        openModal(Employee_AddEdit, { editId: id, initialMode: 'Edit', onSave: refreshList }, { title: 'Edit Employee', size: 'xl' });
    }

    function clearFilters() {
        searchQuery       = '';
        filterStatus      = 'All';
        filterDepartment  = 'All';
        filterDesignation = 'All';
    }

    // ── Status badge colors ────────────────────────────────────────────
    const STATUS_COLORS = {
        Active:      'bg-emerald-100 text-emerald-700',
        Resigned:    'bg-red-100 text-red-700',
        Absconding:  'bg-amber-100 text-amber-700',
        'On Notice': 'bg-yellow-100 text-yellow-700'
    };
</script>

<!-- ── Header: Search + Filters + Add ──────────────────────────── -->
<div class="space-y-3 mb-5">

    <!-- Row 1: Search + Filter toggle + Add button -->
    <div class="flex items-center gap-2">
        <!-- Search -->
        <div class="relative flex-1 sm:flex-none sm:w-64">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input bind:value={searchQuery}
                placeholder="Search name or code…"
                class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/>
        </div>

        <!-- Filter toggle (mobile + desktop) -->
        <button on:click={() => showFilters = !showFilters}
            class="relative px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
            <span class="hidden sm:inline">Filters</span>
            {#if activeFilterCount > 0}
                <span class="w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                </span>
            {/if}
        </button>

        <!-- Add button -->
        {#if isHRAdmin}
            <button on:click={openAdd}
                class="ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] transition-colors whitespace-nowrap shrink-0">
                + Add Employee
            </button>
        {/if}
    </div>

    <!-- Row 2: Filter dropdowns (collapsible) -->
    {#if showFilters}
        <div class="flex flex-col sm:flex-row gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <select bind:value={filterDepartment}
                class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 sm:w-48">
                <option value="All">All Departments</option>
                {#each departmentOptions as dept}
                    <option value={dept.id}>{dept.name}</option>
                {/each}
            </select>

            <select bind:value={filterDesignation}
                class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 sm:w-48">
                <option value="All">All Designations</option>
                {#each designationOptions as desig}
                    <option value={desig.id}>{desig.name}</option>
                {/each}
            </select>

            <select bind:value={filterStatus}
                class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 sm:w-40">
                <option value="All">All Status</option>
                {#each ['Active', 'Resigned', 'Absconding', 'On Notice'] as s}
                    <option value={s}>{s}</option>
                {/each}
            </select>

            {#if activeFilterCount > 0}
                <button on:click={clearFilters}
                    class="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-2 self-center whitespace-nowrap">
                    Clear all
                </button>
            {/if}
        </div>
    {/if}

    <!-- Result count -->
    <p class="text-xs text-slate-400">
        {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
        {#if activeFilterCount > 0 || searchQuery}
            <span class="text-slate-300">·</span> filtered from {records.length} total
        {/if}
    </p>
</div>

<!-- ── Table / Cards ───────────────────────────────────────────── -->
{#if loading}
    <div class="flex justify-center py-16">
        <div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
{:else if paged.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg class="w-10 h-10 mb-2 text-slate-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/>
        </svg>
        <p class="text-sm">No employees found.</p>
        {#if activeFilterCount > 0 || searchQuery}
            <button on:click={clearFilters} class="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-2">Clear filters</button>
        {/if}
    </div>
{:else}
    <!-- Desktop table -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table class="w-full text-sm">
            <thead class="bg-slate-50">
                <tr>
                    {#each ['Code','Name','Department','Designation','Grade','Location','Status',''] as h}
                        <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                    {/each}
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 bg-white">
                {#each paged as r}
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-4 py-3 text-slate-600 font-mono text-xs">{r.Employee_Code ?? '—'}</td>
                        <td class="px-4 py-3">
                            <button on:click={() => openView(r.Employee_Details_ID)}
                                class="font-medium text-slate-800 hover:text-indigo-600 transition-colors text-left">
                                {r.Employee_Name ?? '—'}
                            </button>
                        </td>
                        <td class="px-4 py-3 text-slate-600">{r.Department_Name ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-600">{r.Designation_Name ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-500">{r.Grade ?? '—'}</td>
                        <td class="px-4 py-3 text-slate-500">{r.Work_Location ?? '—'}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-medium
                                {STATUS_COLORS[r.Status] ?? 'bg-slate-100 text-slate-500'}">
                                {r.Status ?? '—'}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex gap-3 justify-end">
                                <button on:click={() => openView(r.Employee_Details_ID)}
                                    class="text-xs text-indigo-600 hover:text-indigo-800">View</button>
                                {#if isHRAdmin}
                                    <button on:click={() => openEdit(r.Employee_Details_ID)}
                                        class="text-xs text-slate-500 hover:text-slate-700">Edit</button>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden space-y-2">
        {#each paged as r}
            <button on:click={() => openView(r.Employee_Details_ID)}
                class="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left hover:shadow-sm transition-shadow active:scale-[0.99]">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-slate-800 text-sm">{r.Employee_Name ?? '—'}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium
                        {STATUS_COLORS[r.Status] ?? 'bg-slate-100 text-slate-500'}">
                        {r.Status ?? '—'}
                    </span>
                </div>
                <p class="text-xs text-slate-500">{r.Designation_Name ?? '—'} · {r.Department_Name ?? '—'}</p>
                <div class="flex items-center justify-between mt-1.5">
                    <span class="text-xs text-slate-400 font-mono">{r.Employee_Code ?? '—'}</span>
                    <span class="text-xs text-slate-400">{r.Work_Location ?? ''}</span>
                </div>
            </button>
        {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>
                {(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div class="flex gap-1">
                <button on:click={() => currentPage = Math.max(1, currentPage - 1)} disabled={currentPage===1}
                    class="px-2.5 py-1.5 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200 transition-colors">← Prev</button>
                <!-- Page numbers (show max 5) -->
                {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    return start + i;
                }).filter(p => p <= totalPages) as pg}
                    <button on:click={() => currentPage = pg}
                        class="w-8 h-8 rounded-lg text-xs font-medium transition-colors
                            {currentPage === pg ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 hover:bg-slate-200'}">
                        {pg}
                    </button>
                {/each}
                <button on:click={() => currentPage = Math.min(totalPages, currentPage + 1)} disabled={currentPage===totalPages}
                    class="px-2.5 py-1.5 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200 transition-colors">Next →</button>
            </div>
        </div>
    {/if}
{/if}