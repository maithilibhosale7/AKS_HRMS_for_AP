<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { addToast } from 'as-toast';
    import { API_PATHS } from '$lib/API_PATHS';
    import { post } from '$lib/utils/api';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';

    // Brand-accent token (theme-linked). Picked from nav_menu.heading_icon
    // which is also the modal.buttons.select bg + mandatory_mark + dropdown active accent.
    // Text colour follows the modal.buttons.select convention (dark on lime).
    const BRAND_PRIMARY = Project_Theme_Settings.nav_menu.heading_icon;       // '#B6F09C'
    const BRAND_PRIMARY_TEXT = Project_Theme_Settings.modal.buttons.select.text_color; // '#000000'
    // Dark fill for the active tab (white text on lime fails WCAG, so the active
    // tab uses the same dark surface as the nav menu — high contrast with #fff).
    const TAB_ACTIVE_BG = Project_Theme_Settings.nav_menu.main_bg;             // '#1E2025'

    let Live_Data;
    $: { Live_Data = $Live_Data_Storage; }

    // --- State ---
    let Status = false;
    let Employee_Details = {};
    let Selected_Employee_ID = '';
    let Selected_Central_Master_ID = '';
    let delete_status = false;

    let HRMS_Menu_for_User = { HRMS_Type: 'Blocked', Modules: {} };
    let AI_Chatbot_Access = 0;
    let AI_Builder_Access = 0;

    // Credentials (now Svelte-bound, no more getElementById)
    let Username = '';
    let Password = '';
    let passwordIsSet = false;
    let Show_Password = false;
    let Confirm_Delete = false;

    let employeeSearch = '';
    let showDropdown = false;
    let selectedEmployeeName = 'Select employee';

    $: Filtered_Employee_Details = Object.entries(Employee_Details || {}).filter(
        ([, name]) => name && name.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    // --- Lifecycle ---

    onMount(async function() {
        if (Live_Data.User_Information.Master_User_ID != 1) {
            addToast('Access Denied to User Rights', 'warn');
            goto('/');
            return;
        }
        try {
            Employee_Details = await post(API_PATHS.API_URL_Get_Employee_Details);
        } catch (e) {
            console.error("Failed to load employees:", e);
        }
    });

    // --- Data Loading ---

    async function Selected_Employee_ID_Change() {
        if (!Status) {
            try {
                const creds = await post(API_PATHS.API_URL_Get_User_Credentials, { Selected_Employee_ID });

                Selected_Central_Master_ID = creds['Master_User_ID'] || '';
                Username = creds['Username'] || '';
                Password = '';
                passwordIsSet = !!creds['Password_Is_Set'] || creds['Password'] === '<Password is already set>';
                delete_status = !!(creds['Username'] && (passwordIsSet || creds['Password']));
                AI_Chatbot_Access = creds['AI_Chatbot_Access'] ?? 0;
                AI_Builder_Access = creds['AI_Builder_Access'] ?? 0;
                Confirm_Delete = false;
                Show_Password = false;

                await Get_HRMS_for_User(Selected_Central_Master_ID);

                Status = true;
            } catch (e) {
                console.error("Failed fetching user credentials:", e);
            }
        } else {
            addToast('ERROR, Edit in Progress, Refresh Page!', 'warn');
            window.location.reload();
        }
    }

    async function Get_HRMS_for_User(cm_id) {
        try {
            const res = await post(API_PATHS.API_URL_Get_HRMS_for_User, { Selected_Central_Master_ID: cm_id });
            HRMS_Menu_for_User = {
                HRMS_Type: res?.HRMS_Type ?? 'Blocked',
                Modules:   res?.Modules   ?? {}
            };
        } catch (e) { console.error("Failed fetching HRMS access:", e); }
    }

    // --- Credentials ---

    async function Delete_User_Credentials() {
        if (!Confirm_Delete) { Confirm_Delete = true; return; }
        try {
            const res = await post(API_PATHS.API_URL_Delete_User_Credentials, { Central_Master_ID: Selected_Central_Master_ID });
            if (res.Status === 'Failed') { addToast(res.Error || 'Deletion failed', 'error'); Confirm_Delete = false; return; }
            addToast('User Credentials Deleted', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (e) {
            console.error("Failed deleting user credentials:", e);
            addToast('Network error during deletion', 'error');
            Confirm_Delete = false;
        }
    }

    // Phase 3-cutover: single Save_Module_Access call replaces the 4 legacy
    // per-module saves (Save_Menu_Map_for_User / Save_Reports_for_User /
    // Save_Dashboards_for_User / Save_HRMS_for_User). Writes all 4 module
    // sections atomically + refreshes Central_Master.HRMS_Access + Access_Summary.
    // Rejects target User_ID == 1 (Admin is never configured via this path).
    async function save_module_access(success_msg = 'Module Access Saved!') {
        if (!Selected_Central_Master_ID || Selected_Central_Master_ID == 1 || Selected_Central_Master_ID == 'New Login Credentials') {
            addToast('Save credentials first, then save module access.', 'warn');
            return false;
        }
        try {
            const res = await post(API_PATHS.API_URL_Save_Module_Access, {
                User_ID: Selected_Central_Master_ID,
                HRMS_Menu_for_User
            });
            if (!res || res?.Status !== 'Success') {
                addToast(res?.message || 'Failed to save module access', 'error');
                return false;
            }
            addToast(success_msg, 'success');
            return true;
        } catch (e) {
            console.error('Failed saving module access:', e);
            addToast('Network error during module access save', 'error');
            return false;
        }
    }

    // Unified Save (per-user). Single entry that:
    //   1. update-central-master  — creds + AI_Chatbot_Access + AI_Builder_Access
    //   2. save-module-access     — Menu + Reports + Dashboards + HRMS
    // The all-users "Report Menu Layout" save is intentionally NOT invoked here.
    async function onSubmit() {
        if (!Username && !Password) { addToast('ERROR, User Credentials are missing!', 'warn'); return; }

        try {
            const creds_res = await post(API_PATHS.API_URL_Update_Central_Master, {
                Selected_Employee_ID,
                Central_Master_ID: Selected_Central_Master_ID,
                Username,
                Password,
                AI_Chatbot_Access,
                AI_Builder_Access
            });
            if (creds_res.Status === 'Failed') { addToast(creds_res.Error || 'Failed to update credentials', 'error'); return; }

            if (Selected_Central_Master_ID == 'New Login Credentials') {
                Selected_Central_Master_ID = creds_res['New_Central_Master_ID'];
            }

            const ok = await save_module_access('Saved!');
            if (!ok) return;

            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            console.error("Failed saving:", e);
            addToast('Save Failed', 'error');
        }
    }

    // --- HRMS Access Tab ---

    function togglePasswordView() {
        if (passwordIsSet && !Password) {
            addToast('The saved password cannot be shown. Type a new one to replace it.', 'warn');
            return;
        }
        Show_Password = !Show_Password;
    }

    function toggle_hrms_module(moduleName) {
        HRMS_Menu_for_User.Modules[moduleName] = !HRMS_Menu_for_User.Modules[moduleName];
        HRMS_Menu_for_User = HRMS_Menu_for_User;
    }


</script>

<svelte:head>
    <title>Module Access | Project Setup</title>
</svelte:head>


<div class="module-access-page" style="--brand-primary: {BRAND_PRIMARY}; --brand-primary-text: {BRAND_PRIMARY_TEXT}; --tab-active-bg: {TAB_ACTIVE_BG};">
<form method="post" on:submit|preventDefault={onSubmit}>

    <!-- Header Row -->
    <div class="block lg:flex items-start lg:justify-between mt-2 xl:my-4 gap-4">
        <div class="block lg:flex shrink-0">
            <h2 class="font-semibold leading-7 text-gray-900 mb-4 sm:truncate text-lg xl:text-xl 2xl:text-2xl sm:tracking-tight lg:mb-0 mr-4 capitalize">
                Module Access
            </h2>
        </div>

        <!-- Employee Picker + Compact Credentials Card -->
        <div class="flex-1 min-w-0">
            <div class="flex flex-col lg:flex-row gap-2 items-stretch">

                <!-- Employee Dropdown -->
                <div class="relative lg:w-[320px] shrink-0">
                    <div
                        class="bg-white border border-gray-300 rounded-lg p-2.5 text-sm shadow-sm cursor-pointer flex justify-between items-center hover:brand-border"
                        on:click={() => showDropdown = !showDropdown}
                    >
                        <span class={selectedEmployeeName === 'Select employee' ? 'text-gray-400' : 'text-gray-900'}>{selectedEmployeeName}</span>
                        <span class="text-gray-500">▾</span>
                    </div>
                    {#if showDropdown}
                        <div class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                            <input type="text" placeholder="Search employee..."
                                class="w-full p-2 border-b text-sm outline-none brand-focus-ring"
                                bind:value={employeeSearch} />
                            {#if Filtered_Employee_Details.length === 0}
                                <div class="px-3 py-2 text-sm text-gray-500">No employees found</div>
                            {:else}
                                {#each Filtered_Employee_Details as [Employee_ID, Employee_Name]}
                                    <div class="px-3 py-2 text-sm cursor-pointer brand-hover-bg"
                                        on:click={() => {
                                            Selected_Employee_ID = Employee_ID;
                                            selectedEmployeeName = Employee_Name;
                                            employeeSearch = '';
                                            showDropdown = false;
                                            Selected_Employee_ID_Change();
                                        }}>
                                        {Employee_Name}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    {/if}
                </div>

                <!-- Compact Credentials Card (paired with the picker) -->
                {#if Selected_Employee_ID}
                    <div class="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <!-- Read-only identity chip -->
                        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-600 font-mono" title="Central Master ID (read-only)">
                            <span class="text-[10px] uppercase tracking-wide text-gray-400">ID</span>
                            <span class="text-gray-800">{Selected_Central_Master_ID || '—'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-gray-400" aria-hidden="true">
                                <path fill-rule="evenodd" d="M10 1a4 4 0 00-4 4v3H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm-2 7V5a2 2 0 114 0v3H8z" clip-rule="evenodd" />
                            </svg>
                        </div>

                        <!-- Username -->
                        <div class="flex items-center gap-1.5 min-w-0">
                            <label for="username_input" class="text-xs font-medium text-gray-500">User</label>
                            <input type="text" id="username_input" autocomplete="off"
                                bind:value={Username}
                                class="w-32 lg:w-40 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none brand-focus-ring"
                                placeholder="Username" />
                        </div>

                        <!-- Password with show/hide toggle -->
                        <div class="flex items-center gap-1.5 min-w-0">
                            <label for="password_input" class="text-xs font-medium text-gray-500">Pwd</label>
                            <div class="relative">
                                {#if Show_Password}
                                    <input type="text" id="password_input" autocomplete="new-password"
                                        bind:value={Password}
                                        class="w-40 lg:w-52 pl-2 pr-7 py-1 text-sm border border-gray-300 rounded-md focus:outline-none brand-focus-ring"
                                        placeholder={passwordIsSet ? 'Already set' : 'Password'} />
                                {:else}
                                    <input type="password" id="password_input" autocomplete="new-password"
                                        bind:value={Password}
                                        class="w-40 lg:w-52 pl-2 pr-7 py-1 text-sm border border-gray-300 rounded-md focus:outline-none brand-focus-ring"
                                        placeholder={passwordIsSet ? 'Already set' : 'Password'} />
                                {/if}
                                <button type="button" tabindex="-1"
                                    on:click={togglePasswordView}
                                    class="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700"
                                    title={Show_Password ? 'Hide password' : 'Show password'} aria-label={Show_Password ? 'Hide password' : 'Show password'}>
                                    {#if Show_Password}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745A10.029 10.029 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.953 9.953 0 00-4.512 1.074L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clip-rule="evenodd"/><path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 012.434-4.07L6.34 8.812a4 4 0 004.408 5.118z"/></svg>
                                    {:else}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                                    {/if}
                                </button>
                            </div>
                        </div>

                        <!-- Delete (demoted: icon, secondary, behind confirm) -->
                        <div class="ml-auto flex items-center gap-1.5">
                            {#if !Confirm_Delete}
                                <button type="button" on:click={Delete_User_Credentials} disabled={!delete_status}
                                    class="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    title="Delete user credentials" aria-label="Delete user credentials">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/></svg>
                                </button>
                            {:else}
                                <span class="text-xs text-red-600 font-medium">Delete?</span>
                                <button type="button" on:click={Delete_User_Credentials}
                                    class="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Confirm</button>
                                <button type="button" on:click={() => Confirm_Delete = false}
                                    class="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">Cancel</button>
                            {/if}
                        </div>
                    </div>
                {/if}

            </div>
        </div>

        <!-- Unified Save + Cancel -->
        <div class="flex shrink-0 space-x-2 sm:space-x-3 mb-8 lg:mb-0 mt-2 lg:mt-0">
            <input type="submit"
                class="btn-brand rounded-lg border border-transparent px-3 lg:px-6 py-2 text-md font-semibold shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                value="Save" />
            <a href="/"
                class="rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center flex items-center">
                Cancel
            </a>
        </div>
    </div>

    <!-- Tabs -->
    {#if Selected_Employee_ID}
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 lg:p-6 mt-4 overflow-y-auto max-h-[75vh]">

                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="font-bold text-gray-800">HRMS Access</h3>
                            <p class="text-xs text-gray-500 mt-0.5">Role Type controls the HRMS gate. Standard User exposes the per-module toggles below. Use the top-right <span class="font-semibold">Save</span> to persist.</p>
                        </div>
                    </div>

                    <div class="rounded-lg border border-gray-200 overflow-hidden mb-4">
                        <div class="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-gray-100">
                            <div class="col-span-9 text-sm font-bold text-gray-700">Role Type</div>
                            <div class="col-span-3 flex justify-center">
                                <select
                                    bind:value={HRMS_Menu_for_User.HRMS_Type}
                                    class="text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none brand-focus-ring">
                                    <option value="Blocked">Blocked</option>
                                    <option value="Standard User">Standard User</option>
                                    <option value="HR Admin">HR Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {#if HRMS_Menu_for_User.HRMS_Type === 'Standard User'}
                        <div class="rounded-lg border border-gray-200 overflow-hidden">
                            <div class="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 font-bold text-xs text-gray-600 uppercase tracking-wide">
                                <div class="col-span-9">Module</div>
                                <div class="col-span-3 text-center">Access</div>
                            </div>
                            {#each Object.entries(HRMS_Menu_for_User.Modules) as [moduleName, isGranted]}
                                <div class="grid grid-cols-12 gap-2 items-center px-4 py-2 border-t border-gray-100 hover:bg-gray-50">
                                    <div class="col-span-9 text-sm text-gray-800">{moduleName.replace(/_/g, ' ')}</div>
                                    <div class="col-span-3 flex justify-center">
                                        <div class="slider-container {isGranted ? 'active' : ''}" on:click={() => toggle_hrms_module(moduleName)}>
                                            <div class="slider-circle"></div>
                                            <div class="slider-label">{isGranted ? 'Yes' : 'No'}</div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else if HRMS_Menu_for_User.HRMS_Type === 'HR Admin'}
                        <div class="text-center py-6 text-sm text-gray-500">HR Admin has access to all HRMS modules.</div>
                    {:else}
                        <div class="text-center py-6 text-sm text-gray-500">HRMS Access is disabled (Blocked).</div>
                    {/if}
                </div>


        </div>
    {/if}

</form>
</div>

<style>
    /* Brand colour comes from the theme via the page wrapper's inline style
       (--brand-primary). All accents below are driven by that single token. */

    div { font-size: 100%; }

    .row {
        display: block;
        padding: 12px;
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 8px 0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .row:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }

    .horizontal-align { display: flex; align-items: center; gap: 10px; }
    .align-right { display: inline-block; margin-left: auto; }

    /* ===== Single shared yes/no toggle pill (was duplicated visually across
       Navigation, Reports, Dashboards, HRMS, AI tabs). One token-driven style. ===== */
    .slider-container {
        position: relative;
        width: 100px;
        height: 30px;
        background-color: #ddd;
        border-radius: 15px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .slider-container.active { background-color: var(--brand-primary); }

    .slider-circle {
        position: absolute;
        top: 3px; left: 3px;
        width: 24px; height: 24px;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.3s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .slider-container.active .slider-circle { transform: translateX(70px); }

    .slider-label {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        font-size: 12px;
        text-align: center;
        color: #6b7280;
        font-weight: bold;
        pointer-events: none;
        transition: color 0.3s ease;
    }
    .slider-container.active .slider-label { color: var(--brand-primary-text); }

    .toggle-container { display: flex; align-items: center; cursor: pointer; gap: 8px; font-weight: bold; color: #333; transition: color 0.3s ease; }
    .toggle-container:hover { color: var(--brand-primary); }

    .arrow { display: inline-block; transition: transform 0.3s ease; }
    .arrow.down { transform: rotate(90deg); }

    .dynamic-thickness { display: inline-block; height: 10px; width: var(--thickness); transition: width 0.3s ease; }

    /* ===== Brand-token-driven helpers (replace former hardcoded #86bc46 / #B6F09C) ===== */
    .btn-brand {
        background-color: var(--brand-primary);
        color: var(--brand-primary-text);
    }
    .btn-brand:hover { filter: brightness(0.92); }
    .btn-brand:focus { outline-color: var(--brand-primary); }

    .tab-active {
        background-color: var(--tab-active-bg);
        color: white;
        border-color: var(--tab-active-bg);
        font-weight: 700;
    }

    .brand-focus-ring:focus { outline: none; box-shadow: 0 0 0 2px var(--brand-primary); border-color: var(--brand-primary); }
    .brand-border:hover { border-color: var(--brand-primary); }
    .brand-hover-bg:hover { background-color: color-mix(in srgb, var(--brand-primary) 35%, white); }
    .brand-card { border-color: var(--brand-primary); }
    .brand-fillbar { background-color: color-mix(in srgb, var(--brand-primary) 25%, white); border: 1px solid var(--brand-primary); }
    .brand-fillbar-text { color: color-mix(in srgb, var(--brand-primary) 60%, #1f2937); }
</style>
