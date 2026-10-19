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
	import { API_PATHS } from '$lib/API_PATHS';

    //
	// LIVE DATA Initialization
	//
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

    let Live_Data;

    $: {
        Live_Data = $Live_Data_Storage;
    }


    let Corporate_Employee_Updates_Data;

    onMount(async function () {

        // Show Loader Icon
        let element_loader = document.getElementById("loader_block");
        element_loader.classList.remove("hidden");
            
        // API Call for Display_Data_from_Scenario
        let Get_Corporate_Employee_Updates_Data_Res = await fetch(API_PATHS.API_URL_Get_Corporate_Employee_Updates_Data, {
            method: 'POST'
        });

        Get_Corporate_Employee_Updates_Data_Res  = await Get_Corporate_Employee_Updates_Data_Res.json();
        Corporate_Employee_Updates_Data = Get_Corporate_Employee_Updates_Data_Res['Corporate_Employee_Updates_Data'];

        // Hide Loader Icon
        element_loader = document.getElementById("loader_block");
        element_loader.classList.add("hidden");
    });

    let Open_Modal = false;
    let Modal_Heading = '';
    let Approve_Reject_item = [];
    let Approve_Reject_Remarks = '';

    async function approve(item) {

        // Confirm user intention
        const confirmAction = confirm("Are you sure you want to approve this update?");
        if (!confirmAction) return; // Stop if user clicks Cancel

        try {
            let response = await fetch(API_PATHS.API_URL_Approve_Corporate_Employee_Update, {
                method: 'POST',
                body: JSON.stringify({
                    Live_Data: Live_Data,
                    Update_Item: item,
                    Remarks : Approve_Reject_Remarks
                })
            });

            let Approve_Corporate_Employee_Updates_Data_Res = await response.json();

            // Check result
            if (Approve_Corporate_Employee_Updates_Data_Res.status === "Success") {
                alert("Update approved successfully!");
                location.reload(); // Reload page
            } else {
                alert("Failed to approve update: " + (Approve_Corporate_Employee_Updates_Data_Res.message || ""));
            }

        } catch (err) {
            console.error("Error approving update:", err);
            alert("An unexpected error occurred. Please try again.");
        }
    }

    async function reject(item) {

        // Confirm user intention
        const confirmAction = confirm("Are you sure you want to reject this update?");
        if (!confirmAction) return;

        try {
            let response = await fetch(API_PATHS.API_URL_Reject_Corporate_Employee_Update, {
                method: 'POST',
                body: JSON.stringify({
                    Live_Data: Live_Data,
                    Update_Item: item,
                    Remarks : Approve_Reject_Remarks
                })
            });

            let Reject_Corporate_Employee_Updates_Data_Res = await response.json();

            // Check result
            if (Reject_Corporate_Employee_Updates_Data_Res.status === "Success") {
                alert("Update rejected successfully!");
                location.reload();
            } else {
                alert("Failed to reject update: " + (Reject_Corporate_Employee_Updates_Data_Res.message || ""));
            }

        } catch (err) {
            console.error("Error rejecting update:", err);
            alert("An unexpected error occurred. Please try again.");
        }
    }


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

    function handleCancel() {
        let RedirectURL = Live_Data.Page_Information.PageURL;
        
        if (RedirectURL) {
            window.location.href = RedirectURL;    
        } else {
            window.location.href = "/";
        }
    } 
</script>

<div class="w-full flex items-center mb-4">

    <!-- Left: Page Title -->
    <div class="flex-grow text-left">
        <h1 class="text-2xl font-bold" style="color: {Project_Theme_Settings.primary_color};">
            Corporate Hierarchy - Approvals
        </h1>
    </div>

    <!-- Right: Back Button -->
    <button
        on:click={() => handleCancel()}
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded shadow-sm transition"
    >
        ← Back
    </button>

</div>


{#if Corporate_Employee_Updates_Data}
    <div class="p-6 space-y-6">

        <!-- =======================
            STATUS FILTER SLIDER
        =========================== -->
        <div class="w-full flex justify-center">
            <div class="relative bg-gray-200 rounded-full px-1 py-2 flex space-x-6 w-max">

                <!-- Animated slider background -->
                <div
                    class="absolute top-1 bottom-1 bg-blue-600 rounded-full transition-all duration-300"
                    style="
                        width: calc((100% - 1rem) / 3);
                        transform: translateX(
                            {statusOptions.indexOf(activeStatus) * 100}%
                        );
                    "
                ></div>

                {#each statusOptions as option}
                    <button
                        on:click={() => (activeStatus = option)}
                        class="relative z-10 px-4 py-1 text-xs font-medium transition-colors duration-300"
                    >
                        <span
                            class={
                                activeStatus === option
                                    ? "text-white"
                                    : "text-gray-700"
                            }
                        >
                            {option}
                        </span>
                    </button>
                {/each}
            </div>
        </div>

        <!-- =======================
            APPROVAL TABLE
        =========================== -->

        <div class="overflow-x-auto bg-white shadow-md rounded-lg">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                            Created By
                        </th>
                        <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                            Created On
                        </th>
                        <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[20%]">
                            Corporate Employee Name
                        </th>
                        <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[30%]">
                            Update Description
                        </th>
                        <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[20%]">
                            Status
                        </th>
                        <th class="px-4 py-3 font-medium text-gray-600 uppercase tracking-wider w-[10%]">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody class="bg-white divide-y divide-gray-200">
                    {#each filteredData as item}
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">{item.Created_By_Name}</td>
                            <td class="px-4 py-3">{item.Created_On_Date}</td>
                            <td class="px-4 py-3">{item.Corporate_Employee_Name}</td>

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

                                        <span class="px-2 py-1 text-xs font-semibold rounded">
                                            Remarks: {item.Remarks ? item.Remarks : ''}
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
                                        
                                        <span class="px-2 py-1 text-xs font-semibold rounded">
                                            Remarks: {item.Remarks ? item.Remarks : ''}
                                        </span>
                                    </div>
                                {/if}
                            </td>

                            <td class="px-4 py-3">
                                <div class="flex flex-col space-y-2">
                            
                                    <button
                                        on:click={() => {
                                            Modal_Heading = 'Approve';
                                            Approve_Reject_item = item;
                                            Approve_Reject_Remarks = '';
                                            Open_Modal = true;
                                        }}
                                        disabled={item.Status !== "Pending Approval"}
                                        class="
                                            px-3 py-1 
                                            bg-green-600 text-white text-sm rounded 
                                            hover:bg-green-700 
                                            disabled:opacity-40 
                                            disabled:cursor-not-allowed 
                                            disabled:hover:bg-green-600
                                        "
                                    >
                                        Approve
                                    </button>
                            
                                    <button
                                        on:click={() => {
                                            Modal_Heading = 'Reject';
                                            Approve_Reject_item = item;
                                            Approve_Reject_Remarks = '';
                                            Open_Modal = true;
                                        }}
                                        disabled={item.Status !== "Pending Approval"}
                                        class="
                                            px-3 py-1 
                                            bg-red-600 text-white text-sm rounded 
                                            hover:bg-red-700 
                                            disabled:opacity-40 
                                            disabled:cursor-not-allowed 
                                            disabled:hover:bg-red-600
                                        "
                                    >
                                        Reject
                                    </button>
                            
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/if}


{#if Open_Modal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-1/3">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-bold">{Modal_Heading}</h2>
            </div>
            <div class="px-6 py-4">
                <textarea
                    bind:value={Approve_Reject_Remarks}
                    rows="4"
                    class="w-full p-2 border rounded"
                    placeholder="Enter remarks here..."
                ></textarea>
            </div>
            <div class="px-6 py-4 flex justify-end space-x-4 border-t">
                <button
                    on:click={() => {
                        Modal_Heading = '';
                        Approve_Reject_Remarks = '';
                        Approve_Reject_item = [];
                        Open_Modal = false;
                    }}
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                >
                    Cancel
                </button>
                <button
                    on:click={() => {
                        if (Modal_Heading == 'Approve') {
                            approve(Approve_Reject_item);
                        } else if (Modal_Heading == 'Reject') {
                            reject(Approve_Reject_item);
                        }

                        Modal_Heading = '';
                        Approve_Reject_Remarks = '';
                        Approve_Reject_item = [];
                        Open_Modal = false;
                    }}
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    disabled={!Approve_Reject_Remarks}
                >
                    Submit
                </button>
            </div>
        </div>
    </div>
{/if}

