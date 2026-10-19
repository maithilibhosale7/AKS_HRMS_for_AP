<script>
    import { exportTableToXlsx } from '$lib/Excel_xlsx';
    import { onMount } from 'svelte';
    import { API_PATHS } from '$lib/API_PATHS';
    import LinkedSelectionPopUp_Reports from '$lib/Linked_Selection_Pop_Up/LinkedSelectionPopUp_Reports.svelte';

    export let dataval_result = [];
    let Departments = [];
    let Employees = [];

    // Filter Variables
    let Selected_Department = 'All';
    let Selected_Tenure = 'All';
    let Selected_Status = 'All';
    let Selected_PMS_Eligibility = 'Yes'; // Defaulted to Yes
    let Selected_PMS_Defined = 'Yes';      // Defaulted to Yes
    let Selected_H1_Status = 'No Filter';
    let Selected_H2_Status = 'No Filter';

    // Reactive Filtering Logic
    $: filtered_data = (dataval_result || []).filter(row => {
        // 1. Department Filter
        const matchesDept = Selected_Department === 'All' || row.Department === Selected_Department;
        
        // 2. Tenure Filter
        const matchesTenure = Selected_Tenure === 'All' || row.Tenure_Category === Selected_Tenure;

        // 3. Employment Status Filter (Active, Resigned, Absconding)
        // By default (All), exclude Resigned and Absconding; show them only if explicitly selected
        const matchesStatus = 
            (Selected_Status === 'All' && row.Status !== 'Resigned' && row.Status !== 'Absconding') ||
            (Selected_Status !== 'All' && row.Status === Selected_Status);

        // 4. PMS Eligibility Filter
        const matchesEligibility = Selected_PMS_Eligibility === 'All' || row.PMS_Eligibility === Selected_PMS_Eligibility;
        
        // 5. PMS Defined Filter
        const matchesDefined = Selected_PMS_Defined === 'All' || row.PMS_Defined === Selected_PMS_Defined;

        // 6. H1 PMS Status Filter
        let matchesH1 = true;
        if (Selected_H1_Status === "H1 Pending") {
            matchesH1 = !row.H1_Manager_Status;
        } else if (Selected_H1_Status === "H1 Self Pending") {
            matchesH1 = !row.H1_Self_Status;
        } else if (Selected_H1_Status === "H1 Mgr Pending") {
            // Manager is pending only if Employee has already finished
            matchesH1 = row.H1_Self_Status && !row.H1_Manager_Status;
        }

        // 7. H2 PMS Status Filter
        let matchesH2 = true;
        if (Selected_H2_Status === "H2 Pending") {
            matchesH2 = !row.H2_Manager_Status;
        } else if (Selected_H2_Status === "H2 Self Pending") {
            matchesH2 = !row.H2_Self_Status;
        } else if (Selected_H2_Status === "H2 Mgr Pending") {
            // Manager is pending only if Employee has already finished
            matchesH2 = row.H2_Self_Status && !row.H2_Manager_Status;
        }

        return matchesDept && 
               matchesTenure && 
               matchesStatus && 
               matchesEligibility && 
               matchesDefined && 
               matchesH1 && 
               matchesH2;
    });

    onMount(async () => {
        let loader = document.getElementById("loader_block");
        loader?.classList.remove("hidden");

        // Fetch Masters for Dropdowns [cite: 31]
        const masterRes = await fetch(API_PATHS.API_URL_Get_Corporate_Report_Masters, { method: 'POST' });
        const masterData = await masterRes.json();
        Departments = masterData['Departments'];
        Employees = masterData['Employees'];

        // Fetch All Data on Load [cite: 32]
        const res = await fetch(API_PATHS.API_URL_Get_All_Corporate_Employee_Data, {
            method: 'POST',
            body: JSON.stringify({ Department: 'All', Tenure: 'All', Status: 'All' })
        });
        
        const responseData = await res.json();

        // Update this line to target Table_Data
        dataval_result = responseData.Table_Data || [];
        loader?.classList.add("hidden");
    });

    async function exportxlxs(a, b) {
        await exportTableToXlsx(a, b);
    }

    // Function to safely format date
    function formatDate(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return null;
            return date.toLocaleDateString('en-IN');
        } catch (e) {
            return null;
        }
    }

    function getReminderLines(reminderMap) {
        const reminderLines = [];

        if (formatDate(reminderMap?.H1_Self_Rem_1)) reminderLines.push(`H1 #1: ${formatDate(reminderMap.H1_Self_Rem_1)}`);
        if (formatDate(reminderMap?.H1_Self_Rem_2)) reminderLines.push(`H1 #2: ${formatDate(reminderMap.H1_Self_Rem_2)}`);
        if (formatDate(reminderMap?.H1_Self_Rem_3)) reminderLines.push(`H1 #3: ${formatDate(reminderMap.H1_Self_Rem_3)}`);
        if (formatDate(reminderMap?.H2_Self_Rem_1)) reminderLines.push(`H2 #1: ${formatDate(reminderMap.H2_Self_Rem_1)}`);
        if (formatDate(reminderMap?.H2_Self_Rem_2)) reminderLines.push(`H2 #2: ${formatDate(reminderMap.H2_Self_Rem_2)}`);
        if (formatDate(reminderMap?.H2_Self_Rem_3)) reminderLines.push(`H2 #3: ${formatDate(reminderMap.H2_Self_Rem_3)}`);

        return reminderLines;
    }

    function getEmployeeReminderGroups(reminderMap) {
        return {
            h1: [
                `H1 #1: ${formatDate(reminderMap?.H1_Self_Rem_1) || 'Not Sent'}`,
                `H1 #2: ${formatDate(reminderMap?.H1_Self_Rem_2) || 'Not Sent'}`,
                `H1 #3: ${formatDate(reminderMap?.H1_Self_Rem_3) || 'Not Sent'}`
            ],
            h2: [
                `H2 #1: ${formatDate(reminderMap?.H2_Self_Rem_1) || 'Not Sent'}`,
                `H2 #2: ${formatDate(reminderMap?.H2_Self_Rem_2) || 'Not Sent'}`,
                `H2 #3: ${formatDate(reminderMap?.H2_Self_Rem_3) || 'Not Sent'}`
            ]
        };
    }

    function getManagerReminderLines(reminderMap) {
        const reminderLines = [];

        if (formatDate(reminderMap?.H1_Mgr_Rem_1)) reminderLines.push(`H1 #1: ${formatDate(reminderMap.H1_Mgr_Rem_1)}`);
        if (formatDate(reminderMap?.H1_Mgr_Rem_2)) reminderLines.push(`H1 #2: ${formatDate(reminderMap.H1_Mgr_Rem_2)}`);
        if (formatDate(reminderMap?.H1_Mgr_Rem_3)) reminderLines.push(`H1 #3: ${formatDate(reminderMap.H1_Mgr_Rem_3)}`);
        if (formatDate(reminderMap?.H2_Mgr_Rem_1)) reminderLines.push(`H2 #1: ${formatDate(reminderMap.H2_Mgr_Rem_1)}`);
        if (formatDate(reminderMap?.H2_Mgr_Rem_2)) reminderLines.push(`H2 #2: ${formatDate(reminderMap.H2_Mgr_Rem_2)}`);
        if (formatDate(reminderMap?.H2_Mgr_Rem_3)) reminderLines.push(`H2 #3: ${formatDate(reminderMap.H2_Mgr_Rem_3)}`);

        return reminderLines;
    }

    function getManagerReminderGroups(reminderMap) {
        return {
            h1: [
                `H1 #1: ${formatDate(reminderMap?.H1_Mgr_Rem_1) || 'Not Sent'}`,
                `H1 #2: ${formatDate(reminderMap?.H1_Mgr_Rem_2) || 'Not Sent'}`,
                `H1 #3: ${formatDate(reminderMap?.H1_Mgr_Rem_3) || 'Not Sent'}`
            ],
            h2: [
                `H2 #1: ${formatDate(reminderMap?.H2_Mgr_Rem_1) || 'Not Sent'}`,
                `H2 #2: ${formatDate(reminderMap?.H2_Mgr_Rem_2) || 'Not Sent'}`,
                `H2 #3: ${formatDate(reminderMap?.H2_Mgr_Rem_3) || 'Not Sent'}`
            ]
        };
    }

    function getLaunchDateGroups(reminderMap) {
        return {
            h1: [`H1: ${formatDate(reminderMap?.H1_Launch_Date) || 'Not Sent'}`],
            h2: [`H2: ${formatDate(reminderMap?.H2_Launch_Date) || 'Not Sent'}`]
        };
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDate = now.getDate();

    // H1 Period: Oct 15th to Nov 31st
    // const isH1Period = (currentMonth === 10 && currentDate >= 15) || (currentMonth === 11);
    
    // H2 Period: April 1st to April 30th
    // const isH2Period = (currentMonth === 4);/

    // Testing override for today's date
    const isH1Period = true;
    const isH2Period = true;

    let isProcessingEmails = false;
    let showModal = false;
    let modalTitle = '';
    let modalMessage = '';
    let modalType = 'info'; // info | success | error | confirm
    let pendingEmailType = '';
    let managerEmailDates = {}; // Store manager email dates by manager code

    // Compute manager email dates when filtered_data changes
    $: {
        if (filtered_data && filtered_data.length > 0) {
            // Get unique managers and their reminder dates from the current data
            const managers = new Map();
            
            filtered_data.forEach(emp => {
                const mgrCode = emp.Manager_Employee_Code;
                if (!managers.has(mgrCode)) {
                    managers.set(mgrCode, {
                        H1_Mgr_Rem_1: emp.H1_Mgr_Rem_1,
                        H1_Mgr_Rem_2: emp.H1_Mgr_Rem_2,
                        H1_Mgr_Rem_3: emp.H1_Mgr_Rem_3,
                        H2_Mgr_Rem_1: emp.H2_Mgr_Rem_1,
                        H2_Mgr_Rem_2: emp.H2_Mgr_Rem_2,
                        H2_Mgr_Rem_3: emp.H2_Mgr_Rem_3
                    });
                }
            });

            // Store manager reminder dates
            managerEmailDates = {};
            managers.forEach((mgr, mgrCode) => {
                managerEmailDates[mgrCode] = {
                    H1_Mgr_Rem_1: mgr.H1_Mgr_Rem_1,
                    H1_Mgr_Rem_2: mgr.H1_Mgr_Rem_2,
                    H1_Mgr_Rem_3: mgr.H1_Mgr_Rem_3,
                    H2_Mgr_Rem_1: mgr.H2_Mgr_Rem_1,
                    H2_Mgr_Rem_2: mgr.H2_Mgr_Rem_2,
                    H2_Mgr_Rem_3: mgr.H2_Mgr_Rem_3
                };
            });
        }
    }

    function openModal(type, title, message) {
        modalType = type;
        modalTitle = title;
        modalMessage = message;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        modalTitle = '';
        modalMessage = '';
    }

    function getEligibleCount(emailType) {
        const active = filtered_data.filter(e => e.Status === 'Active');

        if (emailType === 'H1 Cycle Extension Employee') {
            return active.filter(e => !e.H1_Self_Status).length;
        }
        if (emailType === 'H2 Cycle Extension Employee') {
            return active.filter(e => !e.H2_Self_Status).length;
        }
        if (emailType === 'H1 Cycle Extension Manager') {
            // Count unique managers who still have at least one pending H1 review
            const managerMap = new Map();
            active.forEach(e => {
                const code = e.Manager_Employee_Code;
                if (!managerMap.has(code)) managerMap.set(code, []);
                managerMap.get(code).push(e);
            });
            let count = 0;
            managerMap.forEach((reportees) => {
                if (reportees.some(r => !r.H1_Manager_Status)) count++;
            });
            return count;
        }
        if (emailType === 'H2 Cycle Extension Manager') {
            const managerMap = new Map();
            active.forEach(e => {
                const code = e.Manager_Employee_Code;
                if (!managerMap.has(code)) managerMap.set(code, []);
                managerMap.get(code).push(e);
            });
            let count = 0;
            managerMap.forEach((reportees) => {
                if (reportees.some(r => !r.H2_Manager_Status)) count++;
            });
            return count;
        }
        // Default: all active employees
        return active.length;
    }

    function requestSendEmails(emailType) {
        pendingEmailType = emailType;
        const count = getEligibleCount(emailType);
        const unit = emailType.includes('Manager') ? 'manager(s)' : 'employee(s)';
        openModal('confirm', 'Confirm Email Trigger', `Are you sure you want to trigger "${emailType}" for ${count} eligible ${unit}?`);
    }

    async function confirmAndSendEmails() {
        const emailType = pendingEmailType;
        pendingEmailType = '';
        closeModal();
        await handleSendEmails(emailType);
    }

    async function handleSendEmails(emailType) {
        isProcessingEmails = true;
        let loader = document.getElementById("loader_block");
        loader?.classList.remove("hidden");

        try {
            const active_filtered_data = filtered_data.filter(emp => emp.Status === 'Active');
            const response = await fetch(API_PATHS.API_URL_Send_PMS_Bulk_Emails, {
                method: 'POST',
                body: JSON.stringify({
                    Email_Type: emailType,
                    Filtered_Data: active_filtered_data
                })
            });

            const result = await response.json();
            
            if (result.success) {
                openModal('success', 'Emails Processed', result.message || 'Email process completed successfully.');
            } else {
                openModal('error', 'Email Processing Failed', result.message || 'Failed to send emails');
            }
        } catch (error) {
            console.error("Email API Error:", error);
            openModal('error', 'Network Error', 'Network error occurred while sending emails.');
        } finally {
            isProcessingEmails = false;
            loader?.classList.add("hidden");
        }
    }

</script>

<div class="p-4 font-sans">
    <!-- Filters Section - Clean & Accessible -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
            <select bind:value={Selected_Department} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="All">All Departments</option>
                {#each Departments as dept}
                    <option value={dept.Department || dept}>{dept.Department || dept}</option>
                {/each}
            </select>
        </div>
    
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tenure</label>
            <select bind:value={Selected_Tenure} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="All">All Tenure</option>
                <option value="<1">Less than 1 Year</option>
                <option value="1-3">1 to 3 Years</option>
                <option value=">3">More than 3 Years</option>
            </select>
        </div>
    
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">PMS Eligibility</label>
            <select bind:value={Selected_PMS_Eligibility} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
        </div>
    
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">PMS Defined</label>
            <select bind:value={Selected_PMS_Defined} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
        </div>
    
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
            <select bind:value={Selected_Status} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Resigned">Resigned</option>
                <option value="Absconding">Absconding</option>
            </select>
        </div>
    
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">H1 PMS Status</label>
            <select bind:value={Selected_H1_Status} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="No Filter">No Filter</option>
                <option value="H1 Pending">H1 Pending</option>
                <option value="H1 Self Pending">H1 Self Pending</option>
                <option value="H1 Mgr Pending">H1 Mgr Pending</option>
            </select>
        </div>
    
        <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">H2 PMS Status</label>
            <select bind:value={Selected_H2_Status} class="w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30">
                <option value="No Filter">No Filter</option>
                <option value="H2 Pending">H2 Pending</option>
                <option value="H2 Self Pending">H2 Self Pending</option>
                <option value="H2 Mgr Pending">H2 Mgr Pending</option>
            </select>
        </div>
    
        <div class="flex items-end">
            <button 
                on:click={() => exportxlxs('corporate_report', 'Employee_PMS_Report')}
                class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-2 px-2 rounded-lg transition-all duration-200 text-sm h-[38px] shadow-sm"
            >
                Export Excel
            </button>
        </div>
    </div>

    <!-- Bulk Communications - Refined Card -->
    <div class="mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bulk PMS Communications</label>
            <span class="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                System Date: {currentDate}/{currentMonth}/{now.getFullYear()}
            </span>
        </div>
        
        <div class="space-y-4">
            <!-- H1 Row -->
            <div class="flex flex-wrap items-center gap-3 p-3 rounded-lg {isH1Period ? 'bg-gray-50/50 border-l-4 border-indigo-400' : 'bg-gray-50/30 opacity-60'} transition-all">
                <span class="text-xs font-bold {isH1Period ? 'text-indigo-700' : 'text-gray-500'} w-16">H1 Row:</span>
                <div class="flex flex-wrap gap-2">
                    <button 
                        disabled={!isH1Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H1 Launch')}
                        class="px-3 py-1.5 bg-white text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200 shadow-sm transition-all"
                    >
                        Send H1 Launch Mail
                    </button>
                    
                    <button 
                        disabled={!isH1Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H1 Self Reminder')}
                        class="px-3 py-1.5 bg-white text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 shadow-sm transition-all"
                    >
                        Send Reminder to Employee (H1)
                    </button>
                    
                    <button 
                        disabled={!isH1Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H1 Manager Reminder')}
                        class="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 shadow-sm transition-all"
                    >
                        Send Reminder to Manager (H1)
                    </button>

                    <button 
                        disabled={!isH1Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H1 Cycle Extension Employee')}
                        class="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200 shadow-sm transition-all"
                    >
                        Cycle Extension for Employee (H1)
                    </button>

                    <button 
                        disabled={!isH1Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H1 Cycle Extension Manager')}
                        class="px-3 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed border border-violet-200 shadow-sm transition-all"
                    >
                        Cycle Extension for Manager (H1)
                    </button>
                </div>
                {#if !isH1Period}
                    <span class="text-[10px] text-rose-500 italic font-medium ml-2">H1 Period Inactive</span>
                {/if}
            </div>
        
            <!-- H2 Row -->
            <div class="flex flex-wrap items-center gap-3 p-3 rounded-lg {isH2Period ? 'bg-gray-50/50 border-l-4 border-indigo-400' : 'bg-gray-50/30 opacity-60'} transition-all">
                <span class="text-xs font-bold {isH2Period ? 'text-indigo-700' : 'text-gray-500'} w-16">H2 Row:</span>
                <div class="flex flex-wrap gap-2">
                    <button 
                        disabled={!isH2Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H2 Launch')}
                        class="px-3 py-1.5 bg-white text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200 shadow-sm transition-all"
                    >
                        Send H2 Launch Mail
                    </button>
                    
                    <button 
                        disabled={!isH2Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H2 Self Reminder')}
                        class="px-3 py-1.5 bg-white text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 shadow-sm transition-all"
                    >
                        Send Reminder to Employee (H2)
                    </button>
                    
                    <button 
                        disabled={!isH2Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H2 Manager Reminder')}
                        class="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 shadow-sm transition-all"
                    >
                        Send Reminder to Manager (H2)
                    </button>

                    <button 
                        disabled={!isH2Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H2 Cycle Extension Employee')}
                        class="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200 shadow-sm transition-all"
                    >
                        Cycle Extension for Employee (H2)
                    </button>

                    <button 
                        disabled={!isH2Period || isProcessingEmails}
                        on:click={() => requestSendEmails('H2 Cycle Extension Manager')}
                        class="px-3 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed border border-violet-200 shadow-sm transition-all"
                    >
                        Cycle Extension for Manager (H2)
                    </button>
                </div>
                {#if !isH2Period}
                    <span class="text-[10px] text-rose-500 italic font-medium ml-2">H2 Period Inactive</span>
                {/if}
            </div>
        </div>
    </div>

    <!-- Data Table - Enhanced Readability -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table id="ReportData" class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Code</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Name</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Design.</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Department</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mgr Code</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mgr Name</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mgr Design.</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">DOJ</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">DOL</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tenure</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Eligible</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Defined</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Launch Date Mail</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Reminder to Employee</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Reminder to Manager</th>
                        <th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">PMS Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    {#each filtered_data as row}
                        <tr class="hover:bg-gray-50/80 transition-colors duration-150">
                            <td class="p-3 text-sm text-gray-600 font-mono">{row.Employee_Code}</td>
                            <td class="p-3 text-sm font-semibold text-gray-800">{row.Employee_Name}</td>
                            <td class="p-3 text-sm text-gray-500">{row.Designation}</td>
                            <td class="p-3 text-sm text-gray-500">{row.Department}</td>
                            <td class="p-3 text-sm text-gray-600 font-mono">{row.Manager_Employee_Code}</td>
                            <td class="p-3 text-sm font-medium text-gray-800">{row.Manager_Employee_Name}</td>
                            <td class="p-3 text-sm text-gray-500">{row.Manager_Employee_Name}</td>
                            <td class="p-3 text-sm text-gray-500">{row.DOJ}</td>
                            <td class="p-3 text-sm text-gray-500">{row.DOL}</td>
                            <td class="p-3 text-sm">
                                <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                    row.Status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 
                                    row.Status === 'Resigned' ? 'bg-amber-50 text-amber-700' : 
                                    'bg-rose-50 text-rose-700'
                                }`}>
                                    {row.Status}
                                </span>
                            </td>
                            <td class="p-3 text-sm text-gray-500">{row.Tenure}</td>
                            <td class="p-3 text-sm">
                                <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    row.PMS_Eligibility === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                    {row.PMS_Eligibility}
                                </span>
                            </td>
                            <td class="p-3 text-sm">
                                <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    row.PMS_Defined === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                    {row.PMS_Defined}
                                </span>
                            </td>
                            <td class="p-3 text-sm">
                                <div class="min-w-[130px] space-y-2">
                                    <div class="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-emerald-900 shadow-sm">
                                        {getLaunchDateGroups(row).h1.join('\n')}
                                    </div>
                                    <div class="rounded border border-teal-200 bg-teal-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-teal-900 shadow-sm">
                                        {getLaunchDateGroups(row).h2.join('\n')}
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 text-sm">
                                <div class="min-w-[150px] space-y-2">
                                    <div class="rounded border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-sky-900 shadow-sm">
                                        {getEmployeeReminderGroups(row).h1.join('\n')}
                                    </div>
                                    <div class="rounded border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-violet-900 shadow-sm">
                                        {getEmployeeReminderGroups(row).h2.join('\n')}
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 text-sm">
                                <div class="min-w-[150px] space-y-2">
                                    <div class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-amber-900 shadow-sm">
                                        {getManagerReminderGroups(managerEmailDates[row.Manager_Employee_Code]).h1.join('\n')}
                                    </div>
                                    <div class="rounded border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-orange-900 shadow-sm">
                                        {getManagerReminderGroups(managerEmailDates[row.Manager_Employee_Code]).h2.join('\n')}
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 text-sm">
                                <div class="min-w-[150px] space-y-2">
                                    <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-slate-700 shadow-sm">
                                        {`H1 Self: ${row.H1_Self_Status ? 'Done' : 'Pending'}\nH1 Manager: ${row.H1_Manager_Status ? 'Done' : 'Pending'}`}
                                    </div>
                                    <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-slate-700 shadow-sm">
                                        {`H2 Self: ${row.H2_Self_Status ? 'Done' : 'Pending'}\nH2 Manager: ${row.H2_Manager_Status ? 'Done' : 'Pending'}`}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="17" class="p-12 text-center text-gray-400 italic bg-gray-50/30">No employees matching these filters.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

{#if showModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
        <div class="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 class="text-sm font-bold text-gray-800 tracking-wide">{modalTitle}</h3>
                <button on:click={closeModal} class="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors" aria-label="Close">×</button>
            </div>
            <div class="px-6 py-5">
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{modalMessage}</p>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
                {#if modalType === 'confirm'}
                    <button on:click={closeModal} class="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">
                        Cancel
                    </button>
                    <button on:click={confirmAndSendEmails} class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all">
                        Confirm
                    </button>
                {:else}
                    <button
                        on:click={closeModal}
                        class="px-5 py-1.5 rounded-lg text-sm font-semibold text-white {modalType === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} shadow-sm transition-all"
                    >
                        OK
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}