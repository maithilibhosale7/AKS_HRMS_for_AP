<script>

    //
	// Importing Libraries
	//
	import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    //
    // Importing Project Theme Settings
    //
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';

    //
    // Importing API Paths
	//
	import { API_PATHS } from '$lib/API_PATHS'
    
    //
	// LIVE DATA Initialization
	//
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

    let Live_Data;

    $: {
        Live_Data = $Live_Data_Storage;
    }

    //
    // Primary Variable Declarations
    //
    let Corporate_Hierarchy_Data = [];
    let Departments = [];
    let Department_Wise_Designations = [];
    let Corporate_Employee_Updates_Data;

    let selectedStatus = 'All';
    let selectedDepartment = 'All';

    //
    // Page Loading
    //
    onMount(async function () {

        // Hide Sidebar if visible
        const sidebar = document.getElementById('sidebar');
        const withexpand_id = document.getElementById('withexpand_id');
        if (!sidebar.classList.contains('hidden')) {
            sidebar.classList.add('hidden');
            sidebar.removeAttribute('style');
            sidebar.style.backgroundColor = Project_Theme_Settings.sidebar_color;
            withexpand_id.classList.remove('lg:w-3/4','xl:w-4/5','2xl:w-5/6');
        }

        // Show Loader Icon
        let element_loader = document.getElementById("loader_block");
        element_loader.classList.remove("hidden");
            
        // API Call for DB Data
        let Get_Corporate_Hierarchy_Data = await fetch(API_PATHS.API_URL_Get_Corporate_Hierarchy_Data, {
            method: 'POST',
            body: JSON.stringify({
                "Live_Data":Live_Data
            })
        });

        Get_Corporate_Hierarchy_Data  = await Get_Corporate_Hierarchy_Data.json();

        Corporate_Hierarchy_Data = Get_Corporate_Hierarchy_Data['Employee_Self_Data'];
        Departments = Get_Corporate_Hierarchy_Data['Departments'];
        Department_Wise_Designations = Get_Corporate_Hierarchy_Data['Department_Wise_Designations'];
        Corporate_Employee_Updates_Data = Get_Corporate_Hierarchy_Data['Corporate_Employee_Updates_Data'];

        // Hide Loader Icon
        element_loader = document.getElementById("loader_block");
        element_loader.classList.add("hidden");
    });

    //
    // Search Functionality
    //
    let searchQuery = "";
    let Matching_Corporate_Employee_IDs = [];

    function handleSearch() {
        const query = searchQuery.trim().toLowerCase();

        Matching_Corporate_Employee_IDs = Corporate_Hierarchy_Data
            .filter(employee => 
            employee.Employee_Name?.toLowerCase().includes(query) || 
            employee.Employee_Code?.toLowerCase().includes(query)
            )
            .map(employee => employee.Employee_Self_ID);
    }

    //
    // Add New Corporate Employee
    //
    let showAddModal = false;
    let addEmployeeSelfData = {
        Employee_Code: '',
        Employee_Name: '',
        Department: '',
        Designation: '',
        Date_of_Joining: '',
        Date_of_Leaving: '',
        Last_Increment_Date: '',
        Reporting_To_Employee_Self_ID: '',
        Email_ID: '',
        Mobile: '',
        Status: 'Active',
        Remarks: '',
        Source: '',
        Type: '',
        ReplacementEmployeeID: '',
        OtherType: '',
        PMS_Eligibility: false
    };
    let Required_EmployeeSelfData = {
        Employee_Code: true,
        Employee_Name: true,
        Department: true,
        Designation: true,
        Date_of_Joining: true,
        Date_of_Leaving: false,
        Last_Increment_Date: false,
        Reporting_To_Employee_Self_ID: true,
        Email_ID: true,
        Mobile: true,
        Status: true,
        Remarks: false,
        Source: true,
        Type: true,
        ReplacementEmployeeID: false,
        OtherType: false,
        PMS_Eligibility: true
    };

    function openAddDialog() {
        showAddModal = true;
        // Reset fields
        addEmployeeSelfData = {
            Employee_Code: '',
            Employee_Name: '',
            Department: '',
            Designation: '',
            Date_of_Joining: '',
            Date_of_Leaving: '',
            Last_Increment_Date: '',
            Reporting_To_Employee_Self_ID: '',
            Email_ID: '',
            Mobile: '',
            Status: 'Active',
            Remarks: '',
            Source: '',
            Type: '',
            ReplacementEmployeeID: '',
            OtherType: '',
            PMS_Eligibility: false
        };
    }

    function closeAddDialog() {
        showAddModal = false;
        addEmployeeSelfData = {
            Employee_Code: '',
            Employee_Name: '',
            Department: '',
            Designation: '',
            Date_of_Joining: '',
            Date_of_Leaving: '',
            Last_Increment_Date: '',
            Reporting_To_Employee_Self_ID: '',
            Email_ID: '',
            Mobile: '',
            Status: 'Active',
            Remarks: '',
            Source: '',
            Type: '',
            ReplacementEmployeeID: '',
            OtherType: '',
            PMS_Eligibility: false
        };
    }

    let Check_Employee_Code_Message_Add = '';
    function Check_Employee_Code_Add() {

        const Employee_Code_Temp = addEmployeeSelfData.Employee_Code;

        const exists = Corporate_Hierarchy_Data.some(person => 
            person.Employee_Code?.trim().toLowerCase() === 
            Employee_Code_Temp?.trim().toLowerCase()
        );

        if (exists) {
            console.log("Employee_Code exists");
            Check_Employee_Code_Message_Add = addEmployeeSelfData.Employee_Code + ' already exists.';
            addEmployeeSelfData.Employee_Code = '';

        } else {
            console.log("Employee_Code not found");
            Check_Employee_Code_Message_Add = '';
        }
    }

    //
    // Edit Existing Corporate Employee
    //
    let showEditModal = false;
    let editEmployeeSelfID = '';
    let editEmployeeSelfData = {};
    let editEmployeeSelfData_Existing_Data = {};

    let Check_Employee_Code_Message_Edit = '';
    function Check_Employee_Code_Edit() {

        const Employee_Code_Temp = editEmployeeSelfData.Employee_Code;

        const exists = Corporate_Hierarchy_Data.some(person => 
            person.Employee_Code?.trim().toLowerCase() === 
            Employee_Code_Temp?.trim().toLowerCase()
        );

        if (exists) {
            console.log("Employee_Code exists");
            Check_Employee_Code_Message_Edit = editEmployeeSelfData.Employee_Code + ' already exists.';
            editEmployeeSelfData.Employee_Code = editEmployeeSelfData_Existing_Data.Employee_Code;

        } else {
            console.log("Employee_Code not found");
            Check_Employee_Code_Message_Edit = '';
        }
    }

    function closeEditDialog() {
        showEditModal = false;
        editEmployeeSelfID = '';
        editEmployeeSelfData = {};
        editEmployeeSelfData_Existing_Data = {};
    }

    async function Send_for_Approval(CorporateEmployeeID, updatedData) {

        const missingFields = Object.keys(Required_EmployeeSelfData)
            .filter(
            key =>
            Required_EmployeeSelfData[key] === true &&
            (
                !(key in updatedData) ||
                updatedData[key] === null ||
                updatedData[key] === undefined ||
                updatedData[key] === ''
            )
        );

        if (updatedData.Department === "New Department" && (!New_Department || New_Department.trim() === "")) {
            missingFields.push("New Department Name");
        }

        if (updatedData.Designation === "New Designation" && (!New_Designation || New_Designation.trim() === "")) {
            missingFields.push("New Designation Name");
        }

        if (missingFields.length > 0) {
            alert(
                `Please provide the following mandatory fields:\n\n${missingFields.join(', ')}`
            );
            return; // validation failed
        }

        if (updatedData.Department === "New Department") {
            updatedData.Department = New_Department;
        }

        if (updatedData.Designation === "New Designation") {
            updatedData.Designation = New_Designation;
        }

        // Logic to save the updated data
        console.log('Saving data for Corporate Employee:', CorporateEmployeeID, updatedData);
        
        let element_loader = document.getElementById("loader_block");
        element_loader.classList.remove("hidden");

        let Generate_Update_Request_for_Approval_Res = await fetch(API_PATHS.API_URL_Generate_Update_Request_for_Approval_Corporate, {
            method: 'POST',
            body: JSON.stringify({
                "Live_Data":Live_Data,
                "Corporate_Employee_ID": CorporateEmployeeID,
                "Updated_Data": updatedData
            })
        });

        Generate_Update_Request_for_Approval_Res = await Generate_Update_Request_for_Approval_Res.json();

        if (Generate_Update_Request_for_Approval_Res['status'] === 'success') {
            // Update the local data
            alert(Generate_Update_Request_for_Approval_Res['message']);
            closeEditDialog();
            window.location.reload();
        } else {
            alert('Error saving Corporate data. Please try again.');
        }
    }

    function handleCancel() {
        let RedirectURL = Live_Data.Page_Information.PageURL;
        
        if (RedirectURL) {
            window.location.href = RedirectURL;    
        } else {
            window.location.href = "/";
        }
    }

    let showRequests = false;
    function ViewRequests() {
        showRequests = true;
    }

    // Pending requests count for badge
    $: pendingRequestsCount = Array.isArray(Corporate_Employee_Updates_Data)
        ? Corporate_Employee_Updates_Data.filter(i => i.Status === 'Pending Approval').length
        : 0;

    let statusOptions = ["All", "Pending Approval", "Rejected"];
	let activeStatus = "Pending Approval";
    let filteredData;
    // Filtered items based on activeStatus

	$: if (Corporate_Employee_Updates_Data) {
        filteredData =
		activeStatus === "All"
			? Corporate_Employee_Updates_Data
			: Corporate_Employee_Updates_Data.filter(i => i.Status === activeStatus);
    }

    let New_Department = '';
    let New_Designation = '';

</script>

<svelte:head>
	<title>Corporate Employees Management | Recon</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b">
        <div class="px-4 py-4 mx-auto">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <!-- Page Title -->
                <div class="flex items-center gap-3">
                    <div class="w-3 h-10 rounded-r-full" style="background: #795548;"></div>
                    <div>
                        <h1 class="text-2xl font-bold text-[#4E342E]">Corporate Employees Management</h1>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-3">
                    <button
                        on:click={() => ViewRequests()}
                        class="relative flex items-center gap-2 px-4 py-2.5 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#795548] rounded-lg border border-[#D7CCC8] transition-all duration-200 group"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        <span class="font-semibold">Requests</span>
                        {#if pendingRequestsCount > 0}
                            <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                {pendingRequestsCount}
                            </span>
                        {/if}
                    </button>
                    
                    <button
                        on:click={openAddDialog}
                        class="flex items-center gap-2 px-4 py-2.5 bg-[#795548] hover:bg-[#6D4C41] text-white rounded-lg border border-[#795548] transition-all duration-200"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span class="font-semibold">Add Corporate Employee</span>
                    </button>
                    <button
                        class="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF6F2] text-[#4E342E] rounded-lg border border-[#D7CCC8] transition-all duration-200"
                        on:click={handleCancel}
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span class="font-semibold">Back</span>
                    </button>
                </div>
            </div>

            <!-- Filters Section -->
            <div class="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <!-- Search Bar - Left Side -->
                <div class="flex flex-col md:flex-row md:items-center w-full gap-4">
                    <div class="relative flex-1 min-w-[250px]">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            bind:value={searchQuery}
                            on:input={handleSearch}
                            placeholder="Search sales persons by name, ID, or employee code..."
                            class="w-full pl-10 pr-4 py-3 border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all duration-200 bg-white hover:bg-[#FAF6F2]"
                        />
                        {#if searchQuery}
                            <button
                                on:click={() => searchQuery = ''}
                                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        {/if}
                    </div>
                </div>

                <!-- Department Filter -->
                <div class="w-full md:w-auto">
                    <div class="w-full sm:w-48">
                        <select 
                            bind:value={selectedDepartment} 
                            class="w-full min-w-[150px] px-4 py-3 border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all duration-200 bg-white"
                        >
                            <option value="All">All Departments</option>
                            {#each Departments as Department}
                                <option value={Department}>{Department}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="w-full md:w-auto">
                    <div class="w-full sm:w-48">
                        <select 
                            bind:value={selectedStatus} 
                            class="w-full min-w-[150px] px-4 py-3 border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all duration-200 bg-white"
                        >
                            <option value="All">All Status</option>
                            <option value="Active" class="text-green-700">Active</option>
                            <option value="Absconding" class="text-red-700">Absconding</option>
                            <option value="Resigned" class="text-orange-700">Resigned</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-6 mx-auto">
        <!-- Corporate Hierarchy Data -->
        <div class="space-y-4">
            {#if Corporate_Hierarchy_Data && Corporate_Hierarchy_Data.length > 0}
                {#each Corporate_Hierarchy_Data as EmployeeSelf}
                    {#if 
                        (selectedDepartment == 'All' || selectedDepartment == EmployeeSelf.Department) && 
                        (selectedStatus == 'All' || selectedStatus == EmployeeSelf.Status) &&
                        (Matching_Corporate_Employee_IDs.length === 0 || Matching_Corporate_Employee_IDs.includes(EmployeeSelf.Employee_Self_ID))
                    }
                        <div class="simple-hierarchy-item">
                            <div class="simple-card">
                                <div class="simple-header">
                                    <div class="simple-avatar">
                                        {EmployeeSelf.Employee_Name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div class="simple-info">
                                        <div class="simple-name">{EmployeeSelf.Employee_Name}</div>
                                        <div class="simple-position">{EmployeeSelf.Designation}</div>
                                    </div>
                                    <div class="edit-button">
                                        <button 
                                            on:click={() => {
                                                showEditModal = true;
                                                editEmployeeSelfID = EmployeeSelf.Employee_Self_ID;
                                                editEmployeeSelfData = { ...EmployeeSelf };
                                                editEmployeeSelfData_Existing_Data = { ...EmployeeSelf };

                                                console.log(editEmployeeSelfData_Existing_Data);
                                            }}
                                            class="edit-btn-pro"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                                <div class="details-columns">
                                    <div class="column">
                                        <p><strong>Employee Code:</strong> {EmployeeSelf.Employee_Code}</p>
                                        <p><strong>Department:</strong> {EmployeeSelf.Department}</p>
                                        <p><strong>Reporting To:</strong> {EmployeeSelf.Reporting_To_Employee_Self_Name ? EmployeeSelf.Reporting_To_Employee_Self_Name : 'N/A'}</p>
                                        <p><strong>Status:</strong> {EmployeeSelf.Status ? EmployeeSelf.Status : 'N/A'}</p>
                                    </div>
                                    <div class="column">
                                        <p><strong>DOJ:</strong> {EmployeeSelf.Date_of_Joining}</p>
                                        <p><strong>DOL:</strong> {EmployeeSelf.Date_of_Leaving ? EmployeeSelf.Date_of_Leaving : 'N/A'}</p>
                                        <p><strong>Mobile:</strong> {EmployeeSelf.Mobile ? EmployeeSelf.Mobile : 'N/A'}</p>
                                        <p><strong>Email ID:</strong> {EmployeeSelf.Email_ID ? EmployeeSelf.Email_ID : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/each}
            {:else}
                <!-- Empty State -->
                <div class="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <div class="max-w-md mx-auto">
                        <div class="w-24 h-24 mx-auto mb-6 text-gray-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Corporate Employees Found</h3>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Edit Modal -->
{#if showEditModal}
    <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Background overlay -->
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

            <!-- Modal panel -->
            <div class="inline-block w-full my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
                <!-- Modal header -->
                <div class="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-8 rounded-full" style="background: {Project_Theme_Settings.primary_color};"></div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Edit Corporate Employee Details</h3>
                            <p class="text-sm text-gray-600">Update information</p>
                        </div>
                    </div>
                    <button
                        on:click={closeEditDialog}
                        class="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Modal content -->
                <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Left Column - Personal Details -->
                        <div class="space-y-6">
                            <div class="bg-blue-50 rounded-lg p-4">
                                <h4 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    Personal Information
                                </h4>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Employee Self ID</label>
                                        <input type="text" readonly bind:value={editEmployeeSelfData.Employee_Self_ID} 
                                            class="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-sm"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-600">*</span></label>
                                        <input type="text" 
                                            required 
                                            bind:value={editEmployeeSelfData.Employee_Name} 
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                        {#if editEmployeeSelfData.Employee_Name != editEmployeeSelfData_Existing_Data.Employee_Name}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Employee_Name}</label>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Department <span class="text-red-600">*</span></label>
                                        <select bind:value={editEmployeeSelfData.Department} 
                                            required
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Department</option>
                                            {#each Departments as Department}
                                                <option value={Department}>{Department}</option>
                                            {/each}
                                            <option value="New Department">New Department</option>
                                        </select>
                                        {#if editEmployeeSelfData.Department != editEmployeeSelfData_Existing_Data.Department}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Department}</label>
                                        {/if}
                                        {#if editEmployeeSelfData.Department === "New Department"}
                                            <input 
                                                type="text" 
                                                bind:value={New_Department}
                                                placeholder="Enter new department name" 
                                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Designation <span class="text-red-600">*</span></label>
                                        <select bind:value={editEmployeeSelfData.Designation} 
                                            required
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Designation</option>
                                            {#each Department_Wise_Designations[editEmployeeSelfData.Department] as Designation}
                                                <option value={Designation}>{Designation}</option>
                                            {/each}
                                            <option value="New Designation">New Designation</option>
                                        </select>
                                        {#if editEmployeeSelfData.Designation != editEmployeeSelfData_Existing_Data.Designation}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Designation}</label>
                                        {/if}
                                        {#if editEmployeeSelfData.Designation === "New Designation"}
                                            <input 
                                                type="text" 
                                                bind:value={New_Designation}
                                                placeholder="Enter new designation name" 
                                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Reporting To <span class="text-red-600">*</span></label>
                                        <select bind:value={editEmployeeSelfData.Reporting_To_Employee_Self_ID} 
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Manager</option>
                                            {#each Object.entries(Corporate_Hierarchy_Data) as [Employee_Self_ID, Employee_Self_Data]}
                                                <option value={Employee_Self_Data.Employee_Self_ID}>{Employee_Self_Data.Employee_Name}</option>
                                            {/each}
                                        </select>
                                        {#if editEmployeeSelfData.Reporting_To_Employee_Self_ID != editEmployeeSelfData_Existing_Data.Reporting_To_Employee_Self_ID}
                                            {#each Object.entries(Corporate_Hierarchy_Data) as [Employee_Self_ID, Employee_Self_Data]}
                                                {#if Employee_Self_Data.Employee_Self_ID == editEmployeeSelfData_Existing_Data.Reporting_To_Employee_Self_ID}
                                                    <label class="block text-xs mb-1">Previous value was {Employee_Self_Data.Employee_Name}</label>
                                                {/if}
                                            {/each}
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Status <span class="text-red-600">*</span></label>
                                        <select bind:value={editEmployeeSelfData.Status}
                                            on:change={() => {
                                                if (editEmployeeSelfData.Status == 'Resigned') {
                                                    Required_EmployeeSelfData.Date_of_Leaving = true;
                                                } else {
                                                    Required_EmployeeSelfData.Date_of_Leaving = false;
                                                }
                                            }}
                                            required
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="Active" class="text-green-700">Active</option>
                                            <option value="Absconding" class="text-red-700">Absconding</option>
                                            <option value="Resigned" class="text-orange-700">Resigned</option>
                                        </select>
                                        {#if editEmployeeSelfData.Status != editEmployeeSelfData_Existing_Data.Status}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Status}</label>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">PMS Eligibility <span class="text-red-600">*</span></label>
                                        <div class="mt-3 flex items-center gap-8">
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    class="w-4 h-4"
                                                    bind:group={editEmployeeSelfData.PMS_Eligibility}
                                                    value="Yes" />
                                                <span>Yes</span>
                                            </label>
                                        
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    class="w-4 h-4"
                                                    bind:group={editEmployeeSelfData.PMS_Eligibility}
                                                    value="No" />
                                                <span>No</span>
                                            </label>
                                        </div>                                                                              
                                    </div>
                                </div>
                            </div>

                            <!-- Contact Information -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    Contact Information
                                </h4>
                                
                                <div class="space-y-3">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-600">*</span></label>
                                            <input type="email" bind:value={editEmployeeSelfData.Email_ID} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                            {#if editEmployeeSelfData.Email_ID != editEmployeeSelfData_Existing_Data.Email_ID}
                                                <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Email_ID}</label>
                                            {/if}
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile <span class="text-red-600">*</span></label>
                                            <input type="text" bind:value={editEmployeeSelfData.Mobile} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                            {#if editEmployeeSelfData.Mobile != editEmployeeSelfData_Existing_Data.Mobile}
                                                <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Mobile}</label>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Employment Details -->
                        <div class="space-y-6">
                            <!-- Employment Details -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    Employment Details
                                </h4>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Employee Code <span class="text-red-600">*</span></label>
                                        <input type="text" on:change={Check_Employee_Code_Edit} bind:value={editEmployeeSelfData.Employee_Code} class="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-sm"/>
                                        {#if editEmployeeSelfData.Employee_Code != editEmployeeSelfData_Existing_Data.Employee_Code}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Employee_Code}</label>
                                        {/if}
                                        {#if Check_Employee_Code_Message_Edit != ''}
                                            <label class="block text-xs mb-1">{Check_Employee_Code_Message_Edit}</label>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Increment Date <span class="text-red-600">*</span></label>
                                        <input type="date" bind:value={editEmployeeSelfData.Last_Increment_Date} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                        {#if editEmployeeSelfData.Last_Increment_Date != editEmployeeSelfData_Existing_Data.Last_Increment_Date}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Last_Increment_Date}</label>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Date of Joining <span class="text-red-600">*</span></label>
                                        <input type="date" bind:value={editEmployeeSelfData.Date_of_Joining} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                        {#if editEmployeeSelfData.Date_of_Joining != editEmployeeSelfData_Existing_Data.Date_of_Joining}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Date_of_Joining}</label>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Leaving
                                            {#if Required_EmployeeSelfData.Date_of_Leaving}
                                                <span class="text-red-600">*</span>
                                            {/if}
                                        </label>
                                        <input type="date" bind:value={editEmployeeSelfData.Date_of_Leaving} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                        {#if editEmployeeSelfData.Date_of_Leaving != editEmployeeSelfData_Existing_Data.Date_of_Leaving}
                                            <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Date_of_Leaving}</label>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <!-- Remarks & Source -->
                            <div class="space-y-6">
                                <div class="bg-yellow-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/>
                                        </svg>
                                        Remarks & Source
                                    </h4>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                            <textarea bind:value={editEmployeeSelfData.Remarks} rows="2" class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                                            {#if editEmployeeSelfData.Remarks != editEmployeeSelfData_Existing_Data.Remarks}
                                                <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Remarks}</label>
                                            {/if}
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Source <span class="text-red-600">*</span></label>
                                            <select required bind:value={editEmployeeSelfData.Source} class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500">
                                                <option value="">Select Source</option>
                                                <option value="Consultant">Consultant</option>
                                                <option value="Portal">Portal</option>
                                                <option value="Reference">Reference</option>
                                            </select>
                                            {#if editEmployeeSelfData.Source != editEmployeeSelfData_Existing_Data.Source}
                                                <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Source}</label>
                                            {/if}
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Type <span class="text-red-600">*</span></label>
                                            <select 
                                                required 
                                                bind:value={editEmployeeSelfData.Type} 
                                                on:change={() => {
                                                    if (editEmployeeSelfData.Type === 'Replacement') {
                                                        Required_EmployeeSelfData.ReplacementEmployeeID = true;
                                                    } else {
                                                        Required_EmployeeSelfData.ReplacementEmployeeID = false;
                                                    }
                                                }}
                                                class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="New">New</option>
                                                <option value="Replacement">Replacement</option>
                                            </select>
                                            {#if editEmployeeSelfData.Type != editEmployeeSelfData_Existing_Data.Type}
                                                <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.Type}</label>
                                            {/if}
                                        </div>
                                        {#if editEmployeeSelfData.Type === 'Replacement'}
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Select Employee <span class="text-red-600">*</span></label>
                                                <select 
                                                    required 
                                                    bind:value={editEmployeeSelfData.ReplacementEmployeeID} 
                                                    on:change={() => {
                                                        if (editEmployeeSelfData.ReplacementEmployeeID === "0") {
                                                            Required_EmployeeSelfData.OtherType = true;
                                                        } else {
                                                            Required_EmployeeSelfData.OtherType = false;
                                                        }
                                                    }}
                                                    class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"
                                                >
                                                    <option value="">Select Employee</option>
                                                    {#each Object.entries(Corporate_Hierarchy_Data) as [empID, empData]}
                                                        <option value={empData.Employee_Self_ID}>{empData.Employee_Name}</option>
                                                    {/each}
                                                    <option value="0">Others</option>
                                                </select>
                                                {#if editEmployeeSelfData.ReplacementEmployeeID != editEmployeeSelfData_Existing_Data.ReplacementEmployeeID}
                                                    {#each Object.entries(Corporate_Hierarchy_Data) as [empID, empData]}
                                                        {#if empData.Employee_Self_ID == editEmployeeSelfData_Existing_Data.ReplacementEmployeeID}    
                                                            <label class="block text-xs mb-1">Previous value was {empData.Employee_Name}</label>
                                                        {/if}
                                                    {/each}
                                                {/if}
                                            </div>
                                        {/if}
                                        {#if editEmployeeSelfData.ReplacementEmployeeID === "0"}
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Specify Other Type <span class="text-red-600">*</span></label>
                                                <input required type="text" bind:value={editEmployeeSelfData.OtherType} class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500" />
                                                {#if editEmployeeSelfData.OtherType != editEmployeeSelfData_Existing_Data.OtherType}
                                                    <label class="block text-xs mb-1">Previous value was {editEmployeeSelfData_Existing_Data.OtherType}</label>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal footer -->
                <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        on:click={closeEditDialog}
                        class="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        on:click={() => { 
                            console.log('Save Clicked:', editEmployeeSelfID, editEmployeeSelfData, editEmployeeSelfData_Existing_Data); 

                            Send_for_Approval(editEmployeeSelfID, editEmployeeSelfData); 
                        }}
                        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Save Changes & Request Approval
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if showAddModal}
    <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Background overlay -->
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

            <!-- Modal panel -->
            <div class="inline-block w-full my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl">
                <!-- Modal header -->
                <div class="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-8 rounded-full" style="background: {Project_Theme_Settings.primary_color};"></div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Add Corporate Employee</h3>
                            <p class="text-sm text-gray-600">Enter new corporate employee details</p>
                        </div>
                    </div>
                    <button
                        on:click={closeAddDialog}
                        class="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Modal content -->
                <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Left Column - Personal Details -->
                        <div class="space-y-6">
                            <div class="bg-blue-50 rounded-lg p-4">
                                <h4 class="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    Personal Information
                                </h4>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Employee Self ID</label>
                                        <input type="text" readonly bind:value={addEmployeeSelfData.Employee_Self_ID} 
                                            class="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-sm"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-600">*</span></label>
                                        <input type="text" 
                                            required 
                                            bind:value={addEmployeeSelfData.Employee_Name} 
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Department <span class="text-red-600">*</span></label>
                                        <select bind:value={addEmployeeSelfData.Department} 
                                            required
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Department</option>
                                            {#each Departments as Department}
                                                <option value={Department}>{Department}</option>
                                            {/each}
                                            <option value="New Department">New Department</option>
                                        </select>
                                        {#if addEmployeeSelfData.Department === "New Department"}
                                            <input 
                                                type="text" 
                                                bind:value={New_Department}
                                                placeholder="Enter new department name" 
                                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Designation <span class="text-red-600">*</span></label>
                                        <select bind:value={addEmployeeSelfData.Designation} 
                                            required
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Designation</option>
                                            {#each Department_Wise_Designations[addEmployeeSelfData.Department] as Designation}
                                                <option value={Designation}>{Designation}</option>
                                            {/each}
                                            <option value="New Designation">New Designation</option>
                                        </select>
                                        {#if addEmployeeSelfData.Designation === "New Designation"}
                                            <input 
                                                type="text" 
                                                bind:value={New_Designation}
                                                placeholder="Enter new department name" 
                                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Reporting To <span class="text-red-600">*</span></label>
                                        <select bind:value={addEmployeeSelfData.Reporting_To_Employee_Self_ID} 
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select Manager</option>
                                            {#each Object.entries(Corporate_Hierarchy_Data) as [Employee_Self_ID, Employee_Self_Data]}
                                                <option value={Employee_Self_Data.Employee_Self_ID}>{Employee_Self_Data.Employee_Name}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Status <span class="text-red-600">*</span></label>
                                        <select bind:value={addEmployeeSelfData.Status}
                                            on:change={() => {
                                                if (addEmployeeSelfData.Status == 'Resigned') {
                                                    Required_EmployeeSelfData.Date_of_Leaving = true;
                                                } else {
                                                    Required_EmployeeSelfData.Date_of_Leaving = false;
                                                }
                                            }}
                                            required
                                            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="Active" class="text-green-700">Active</option>
                                            <option value="Absconding" class="text-red-700">Absconding</option>
                                            <option value="Resigned" class="text-orange-700">Resigned</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">PMS Eligibility <span class="text-red-600">*</span></label>
                                        <div class="mt-3 flex items-center gap-8">
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    class="w-4 h-4"
                                                    bind:group={addEmployeeSelfData.PMS_Eligibility}
                                                    value="Yes" />
                                                <span>Yes</span>
                                            </label>
                                        
                                            <label class="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    class="w-4 h-4"
                                                    bind:group={addEmployeeSelfData.PMS_Eligibility}
                                                    value="No" />
                                                <span>No</span>
                                            </label>
                                        </div>                                                                              
                                    </div>
                                </div>
                            </div>

                            <!-- Contact Information -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    Contact Information
                                </h4>
                                
                                <div class="space-y-3">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-600">*</span></label>
                                            <input type="email" bind:value={addEmployeeSelfData.Email_ID} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile <span class="text-red-600">*</span></label>
                                            <input type="text" bind:value={addEmployeeSelfData.Mobile} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Employment Details -->
                        <div class="space-y-6">
                            <!-- Employment Details -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    Employment Details
                                </h4>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Employee Code <span class="text-red-600">*</span></label>
                                        <input type="text" on:change={Check_Employee_Code_Add} bind:value={addEmployeeSelfData.Employee_Code} class="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-sm"/>
                                        {#if Check_Employee_Code_Message_Add != ''}
                                            <label class="block text-xs mb-1">{Check_Employee_Code_Message_Add}</label>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Increment Date</label>
                                        <input type="date" bind:value={addEmployeeSelfData.Last_Increment_Date} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Date of Joining <span class="text-red-600">*</span></label>
                                        <input type="date" bind:value={addEmployeeSelfData.Date_of_Joining} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Leaving
                                            {#if Required_EmployeeSelfData.Date_of_Leaving}
                                                <span class="text-red-600">*</span>
                                            {/if}
                                        </label>
                                        <input type="date" bind:value={addEmployeeSelfData.Date_of_Leaving} class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                </div>
                            </div>

                            <!-- Remarks & Source -->
                            <div class="space-y-6">
                                <div class="bg-yellow-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9"/>
                                        </svg>
                                        Remarks & Source
                                    </h4>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                            <textarea bind:value={addEmployeeSelfData.Remarks} rows="2" class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Source <span class="text-red-600">*</span></label>
                                            <select required bind:value={addEmployeeSelfData.Source} class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500">
                                                <option value="">Select Source</option>
                                                <option value="Consultant">Consultant</option>
                                                <option value="Portal">Portal</option>
                                                <option value="Reference">Reference</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Type <span class="text-red-600">*</span></label>
                                            <select 
                                                required 
                                                bind:value={addEmployeeSelfData.Type} 
                                                on:change={() => {
                                                    if (addEmployeeSelfData.Type === 'Replacement') {
                                                        Required_EmployeeSelfData.ReplacementEmployeeID = true;
                                                    } else {
                                                        Required_EmployeeSelfData.ReplacementEmployeeID = false;
                                                    }
                                                }}
                                                class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="New">New</option>
                                                <option value="Replacement">Replacement</option>
                                            </select>
                                        </div>
                                        {#if addEmployeeSelfData.Type === 'Replacement'}
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Select Employee <span class="text-red-600">*</span></label>
                                                <select 
                                                    required 
                                                    bind:value={addEmployeeSelfData.ReplacementEmployeeID} 
                                                    on:change={() => {
                                                        if (addEmployeeSelfData.ReplacementEmployeeID === "0") {
                                                            Required_EmployeeSelfData.OtherType = true;
                                                        } else {
                                                            Required_EmployeeSelfData.OtherType = false;
                                                        }
                                                    }}
                                                    class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"
                                                >
                                                    <option value="">Select Employee</option>
                                                    {#each Object.entries(Corporate_Hierarchy_Data) as [empID, empData]}
                                                        <option value={empData.Employee_Self_ID}>{empData.Employee_Name}</option>
                                                    {/each}
                                                    <option value="0">Others</option>
                                                </select>
                                            </div>
                                        {/if}
                                        {#if addEmployeeSelfData.ReplacementEmployeeID === "0"}
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Specify Other Type <span class="text-red-600">*</span></label>
                                                <input required type="text" bind:value={addEmployeeSelfData.OtherType} class="w-full border border-yellow-300 rounded px-3 py-2 text-sm focus:ring-yellow-500 focus:border-yellow-500" />
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal footer -->
                <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        on:click={closeAddDialog}
                        class="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        on:click={() => { 
                            console.log('Save Clicked:', addEmployeeSelfData); 

                            Send_for_Approval('New', addEmployeeSelfData);
                        }}
                        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Save Changes & Request Approval
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Requests Modal (Keep existing requests modal structure) -->
{#if showRequests}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

        <!-- Modal Box -->
        <div class="bg-white p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto relative space-y-6 min-w-[80%]">
            <button
                on:click={() => (showRequests = false)}
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
                ✕
            </button>
            <div class="w-full flex justify-center">
                <div class="relative bg-gray-200 rounded-full px-1 py-2 flex space-x-6 w-max">

                    <!-- Animated slider background -->
                    <div
                        class="absolute top-1 bottom-1 bg-blue-600 rounded-full transition-all duration-300"
                        style="
                            width: calc((100% - 1rem) / 3);
                            transform: translateX({statusOptions.indexOf(activeStatus) * 100}%);
                        "
                    ></div>

                    {#each statusOptions as option}
                        <button
                            on:click={() => (activeStatus = option)}
                            class="relative z-10 px-4 py-1 text-xs font-medium transition-colors duration-300"
                        >
                            <span class={activeStatus === option ? "text-white" : "text-gray-700"}>
                                {option}
                            </span>
                        </button>
                    {/each}
                </div>
            </div>
            <div class="overflow-x-auto bg-white shadow-md rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[10%]">Created By</th>
                            <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[10%]">Created On</th>
                            <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[20%]">Corporate Employee Name</th>
                            <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[35%]">Update Description</th>
                            <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[25%]">Status</th>
                        </tr>
                    </thead>

                    <tbody class="bg-white divide-y divide-gray-200">
                        {#if filteredData.length > 0}
                            {#each filteredData as item}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3">{item.Created_By_Name}</td>
                                    <td class="px-4 py-3">{item.Created_On_Date}</td>
                                    <td class="px-4 py-3">{item.Corporate_Employee_Name ? item.Corporate_Employee_Name : ''}</td>

                                    <td class="px-4 py-3 max-w-md">
                                        <div class="prose prose-sm">{@html item.Update_Description}</div>
                                    </td>

                                    <td class="px-4 py-3">
                                        {#if item.Status === "Pending Approval"}
                                            <span class="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">
                                                Pending Approval
                                            </span>
                                        {:else if item.Status === "Rejected"}
                                            <div class="flex flex-col space-y-1">
                                                <span class="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                                                    Rejected
                                                </span>
                                                <span class="px-2 py-1 text-xs font-semibold rounded text-gray-700">
                                                    By {item.Approved_By_Name} on {item.Approved_On_Date}
                                                </span>
                                            </div>
                                        {:else}
                                            <div class="flex flex-col space-y-1">
                                                <span class="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                                                    {item.Status}
                                                </span>
                                                <span class="px-2 py-1 text-xs font-semibold rounded">
                                                    By {item.Approved_By_Name} on {item.Approved_On_Date}
                                                </span>
                                            </div>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        {:else}
                            <!-- No records row spanning full table -->
                            <tr>
                                <td colspan="5" class="text-center py-4 text-gray-500">
                                    No records to show
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
{/if}

<style>
    .simple-hierarchy-item {
        margin: 10px 0;
    }
    .simple-card {
        background: #fff;
        border: 1px solid #D7CCC8;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 2px 8px rgba(121,85,72,0.08);
        transition: background-color 0.2s ease;
    }
    .simple-card:hover {
        background-color: #FAF6F2;
    }
    .simple-header {
        display: flex;
        align-items: center;
        gap: 18px;
        padding-bottom: 8px;
        border-bottom: 1px solid #D7CCC8;
    }
    .simple-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #A1887F 0%, #795548 100%);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        box-shadow: 0 2px 8px #79554840;
    }
    .simple-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .simple-name {
        font-size: 18px;
        font-weight: 600;
        color: #4E342E;
    }
    .simple-position {
        font-size: 13px;
        color: #795548;
    }
    .edit-btn-pro {
        background: linear-gradient(135deg, #A1887F 0%, #795548 100%);
        color: white;
        border: none;
        padding: 7px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 4px #79554840;
        transition: background 0.2s;
    }
    .edit-btn-pro:hover {
        background: linear-gradient(135deg, #8D6E63 0%, #6D4C41 100%);
    }
    .details-columns {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        margin-top: 8px;
    }
    .column {
        flex: 1;
        margin-right: 10px;
    }
    .simple-toggle-btn-pro {
        background: #EFEBE9;
        border: 1px solid #D7CCC8;
        border-radius: 6px;
        padding: 6px 14px;
        font-size: 13px;
        color: #795548;
        cursor: pointer;
        margin-top: 8px;
        margin-bottom: 0;
        font-weight: 500;
        transition: background 0.2s;
    }
    .simple-toggle-btn-pro:hover {
        background: #D7CCC8;
    }
    .simple-subordinates {
        margin-left: 32px;
        margin-top: 8px;
        border-left: 2px solid #D7CCC8;
        padding-left: 12px;
    }
    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    li {
        margin: 5px 0;
    }
</style>