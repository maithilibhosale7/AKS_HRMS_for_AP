<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { addToast } from 'as-toast';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';
    import { post } from '$lib/utils/api';
    import { API_PATHS } from '$lib/API_PATHS';
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';

    let logs = [];
    let userList = [];
    let isLoading = true;

    // Filter States
    let startDate = '';
    let endDate = '';
    let selectedUser = 'All';

    onMount(async () => {
        if ($Live_Data_Storage.User_Information.Master_User_ID != 1) {
            addToast('Access Denied', 'warn');
            goto('/');
            return;
        }
        // Set default dates: Today and 12 Months Ago
        const today = new Date();
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);

        startDate = lastYear.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];

        // Fetch User Dropdown
        await fetchUserList();
        
        // Fetch Initial Logs
        await fetchLogs();
    });

    async function fetchUserList() {
        try {
            let res = await post(API_PATHS.API_URL_Get_User_List_For_Logs, {});
            if (res.Status === 'Success') {
                userList = res.Users;
            }
        } catch (e) {
            console.error("Failed to load users", e);
        }
    }

    async function fetchLogs() {
        isLoading = true;
        try {
            let res = await post(API_PATHS.API_URL_Get_User_Activity_Logs, {
                Start_Date: startDate,
                End_Date: endDate,
                User_ID: selectedUser
            });

            if (res.Status === 'Success') {
                logs = res.Logs;
            }
        } catch (e) {
            console.error("Failed to load logs", e);
            alert("Network error fetching activity logs.");
        }
        isLoading = false;
    }

    // Helper to safely parse and format JSON details
    function formatDetails(jsonString) {
        if (!jsonString) return '-';
        try {
            const parsed = JSON.parse(jsonString);
            // Convert JSON object into a readable string "Key: Value | Key: Value"
            return Object.entries(parsed)
                .map(([k, v]) => `<span class="font-semibold text-gray-700">${k}:</span> ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                .join('<br/>');
        } catch (e) {
            return jsonString; // Fallback to raw text if not valid JSON
        }
    }

    // Helper to format timestamps
    function formatTime(timestamp) {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit', second:'2-digit' });
    }
</script>

<svelte:head>
    <title>User Activity Logs | Project</title>
</svelte:head>

<div class="w-full bg-gray-50 p-6 min-h-screen">
    
    <div class="w-full flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            System Activity Logs
        </h1>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-end gap-4">
        <div class="flex flex-col">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" for="startDate">Start Date</label>
            <input type="date" id="startDate" bind:value={startDate} class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>

        <div class="flex flex-col">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" for="endDate">End Date</label>
            <input type="date" id="endDate" bind:value={endDate} class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>

        <div class="flex flex-col min-w-[200px]">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" for="userFilter">User</label>
            <select id="userFilter" bind:value={selectedUser} class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="All">All Users</option>
                {#each userList as user}
                    <option value={user.Master_User_ID}>{user.Username} (ID: {user.Employee_ID})</option>
                {/each}
            </select>
        </div>

        <button on:click={fetchLogs} class="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-md hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Search Logs
        </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto max-h-[calc(100vh-16rem)] custom-scrollbar">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp / IP</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action Type</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#if isLoading}
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                                <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                Fetching Logs...
                            </td>
                        </tr>
                    {:else if logs.length === 0}
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500 italic">No activity logs found for this period.</td>
                        </tr>
                    {:else}
                        {#each logs as log}
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div class="font-semibold">{formatTime(log.Timestamp)}</div>
                                    <div class="text-xs text-gray-400">{log.IP_Address}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="font-bold text-gray-800">{log.Master_User_Name || 'System / Unknown'}</span>
                                    <div class="text-xs text-gray-500">ID: {log.User_ID}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="px-2.5 py-1 bg-gray-100 text-gray-700 font-mono text-xs rounded border border-gray-200">{log.Action_Type}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div><span class="font-semibold text-gray-500 text-xs uppercase">Table:</span> {log.Target_Table || '-'}</div>
                                    <div><span class="font-semibold text-gray-500 text-xs uppercase">Scenario:</span> {log.Target_Scenario || '-'}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="px-2.5 py-1 text-xs font-bold rounded-full 
                                        {log.Action_Status === 'Success' ? 'bg-green-100 text-green-800' : 
                                         log.Action_Status === 'Failed' ? 'bg-red-100 text-red-800' : 
                                         log.Action_Status === 'Cancelled' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                                        {log.Action_Status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-xs text-gray-600 max-w-md">
                                    <div class="bg-gray-50 p-2 rounded border border-gray-100 max-h-24 overflow-y-auto custom-scrollbar break-words">
                                        {@html formatDetails(log.Action_Details)}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>