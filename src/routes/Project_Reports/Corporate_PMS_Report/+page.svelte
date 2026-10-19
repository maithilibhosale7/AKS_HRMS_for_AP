<!-------JS FUNCTIONS START------->
<script>

	//
	// Importing Libraries
	//
	import { exportTableToXlsx } from '$lib/Excel_xlsx';
    import { onMount } from 'svelte';

    //
    // Importing API Paths
	//
	import { API_PATHS } from '$lib/API_PATHS'

	//
	// UI Components
	//
	import LinkedSelectionPopUp_Reports from '$lib/Linked_Selection_Pop_Up/LinkedSelectionPopUp_Reports.svelte';
	
	export let dataval_result = [];
	
	async function exportxlxs(a,b) {
    	await exportTableToXlsx(a,b);
    }

    let Departments = [];
    let Employees = [];

    onMount(async () => {
        // Initial Data Load or Setup can be done here if needed
        // Get Filter_Condition
        let Get_Corporate_Report_Masters_Res = await fetch(API_PATHS.API_URL_Get_Corporate_Report_Masters, {
            method: 'POST'
        });

        Get_Corporate_Report_Masters_Res  = await Get_Corporate_Report_Masters_Res.json();
        Departments = Get_Corporate_Report_Masters_Res['Departments'];
        Employees = Get_Corporate_Report_Masters_Res['Employees'];
    });

	//
	// Linked Selection Pop Up
	//
	let isModalOpen = false; // Variable to manage Pop Up visibility
	let selection_type;
	let LS_Key;
	let LS_Data_Table_Name; // Variable to hold Data Table Name
	let filteredData; // Variable to hold Table Data
	let LS_Display_Scenario_ID = '';

	// Linked Selection / Open Pop Up Code / START openModal('Employee_Self','','single','Employee_Self_ID','M2_Display_1')
	async function OpenLinkedSelectionPopUp(Data_Table_Name, Filter_Condition, Selection_Type, Linked_Field_ID, Display_Settings_ID, Display_Scenario_ID) {

		// Show Loader Icon
		let element_loader = document.getElementById("loader_block");
		element_loader.classList.remove("hidden");

		LS_Data_Table_Name = Data_Table_Name;
		selection_type = Selection_Type;
		LS_Key = Linked_Field_ID;
		LS_Display_Scenario_ID = Display_Scenario_ID;


		// API Call for Linked Selection Pop Up Table Data
		let Linked_Table_Data_res = await fetch(API_PATHS.API_URL_Get_Linked_Selection_Table_Data_Reports, {
			method: 'POST',
			body: JSON.stringify({
				"Table_Name":LS_Data_Table_Name, 
				"Filter_Condition":Filter_Condition, 
				"Display_Scenario":Display_Settings_ID
			})
		});

		Linked_Table_Data_res  = await Linked_Table_Data_res.json();

		// Load Data into Pop Up Variables
		filteredData = Linked_Table_Data_res['Table_Data_Display'];

		isModalOpen = true;

		// LS Config Data
		let ls_pop_up_config_data = {
			"isModalOpen":isModalOpen,
			"selection_type":selection_type,
			"LS_Key":LS_Key,
			"LS_Data_Table_Name":LS_Data_Table_Name,
			"Display_Scenario_ID":LS_Display_Scenario_ID,
			"filteredData":filteredData,
			"filteredData dataype": typeof filteredData,
		};
		console.log("LS POP UP Config Data / START: ", ls_pop_up_config_data);

		// Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");
	}
	// Linked Selection / Open Pop Up Code / END

	async function onSubmit (e) {
		// let element_loader = document.getElementById("loader_block");
		// element_loader.classList.remove("hidden");
		
		// Filter Conditions
		const all_data = JSON.stringify({
			Department : document.getElementById('Department').value,
			Employee : document.getElementById('Employee').value,
			Year : document.getElementById('Year').value
		});

		const res = await fetch(API_PATHS.API_URL_Report_Code_Gen+'Corporate_PMS_Report', {	
			method: 'POST',
			body: all_data
		})
		
		dataval_result = await res.json();
		console.log(dataval_result);

		// let element_loader1 = document.getElementById("loader_block");
		// element_loader1.classList.add("hidden");
	}

    let Selected_Department = 'All';
    function handleDepartmentChange(event) {
        Selected_Department = event.target.value;
    }

    let Selected_Employee = 'All';
    function handleEmployeeChange(event) {
        Selected_Employee = Employees[event.target.value]?.Employee_Tag || 'All';
    }
	
</script>
<!-------JS FUNCTIONS END------->

{#if isModalOpen}
	<LinkedSelectionPopUp_Reports 
		bind:isModalOpen
		bind:LS_Key
		bind:LS_Data_Table_Name
		bind:selection_type
		bind:filteredData
		bind:LS_Display_Scenario_ID
	/>
{/if}

<!-------BROWSER TAB TITLE START------->
 <svelte:head>
	<title>Corporate PMS Report | Recon</title>
 </svelte:head>
<!-------BROWSER TAB TITLE END------->


<!-------LOADER ICON START------->
<div class="relative w-full h-full hidden" id="loader_block">  
	<div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
		<img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
	</div>
</div>
<!-------LOADER ICON END------->



<!-------PAGE TITLE START------->
<div class="flex items-center justify-between mt-2 xl:my-4">
		<h2 id="ReportTitle" class="text-xl font-semibold leading-7 text-gray-900 mb-4 sm:truncate sm:text-2xl sm:tracking-tight lg:mb-0">
			Corporate PMS Report
		</h2>
		<button  on:click={() => exportxlxs('Corporate_PMS_Report')} type="submit" class="inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">
			Export 
		</button>
</div>
<!-------PAGE TITLE END------->


<!-------REPORT START------->
<div class="w-full block companysetup_tabs">
	<div class="tab-content bg-white p-5 border border-gray-300 rounded-xl" id="tabs-tabContent">
		<div class="tab-pane fade show active" id="tabs-companyinfo" role="tabpanel" aria-labelledby="tabs-companyinfo-tab">
			
			<!-------REPORT FILTERS START------->
			<div class="flex flex-col">
				<div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
						<div class="overflow-x-auto">
							<form on:submit|preventDefault={onSubmit}>
								
								<div class="flex flex-wrap">

									<!-------REPORT FILTER LEFT SIDE START------->
                                    <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none">

                                        <!-------REPORT FILTER: YEAR START------->
                                        <div class="md:flex md:items-center mb-3">
                                            <div class="md:w-1/3">									
                                                <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Year">Year</label>
                                            </div>
                                            <div class="md:w-2/3">  
                                                <select name="Year" id="Year" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">
                                                    <option value="Financial Year: 2025-2026">Financial Year: 2025-2026</option>
                                                </select>			
                                            </div>
                                        </div>
                                        <!-------REPORT FILTER: YEAR END------->

									</div>
									<!-------REPORT FILTER LEFT SIDE END------->

									<!-------REPORT FILTER RIGHT SIDE START------->
									<div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none">
                                        
                                        <!-------REPORT FILTER: Department START------->
                                        <div class="md:flex md:items-center mb-3">
                                            <div class="md:w-1/3">									
                                                <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Department">Department</label>
                                            </div>
                                            <div class="md:w-2/3">  
                                                <select 
                                                    name="Department" 
                                                    id="Department" 
                                                    class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500" 
                                                    on:change={handleDepartmentChange}
                                                >
                                                    <option value="All">All</option>
                                                    {#each Departments as department}
                                                        <option value={department}>{department}</option>
                                                    {/each}
                                                </select>			
                                            </div>
                                        </div>
                                        <!-------REPORT FILTER: Department END------->
										
                                        <!-------REPORT FILTER: EMPLOYEE START------->
                                        <div class="md:flex md:items-center mb-3">
                                            <div class="md:w-1/3">									
                                                <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Employee">Employee</label>
                                            </div>
                                            <div class="md:w-2/3">  
                                                <select 
                                                    name="Employee" 
                                                    id="Employee" 
                                                    class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
                                                    on:change={handleEmployeeChange}
                                                >
                                                    <option value="All">All</option>
                                                    {#each Object.entries(Employees) as [employee_self_id, employee_data]}
                                                        {#if Selected_Department === 'All' || Selected_Department === employee_data.Department}
                                                            <option value={employee_self_id}>{employee_data.Employee_Tag} - {employee_data.Department}</option>
                                                        {/if}
                                                    {/each}
                                                </select>		
                                            </div>
                                        </div>
                                        <!-------REPORT FILTER: EMPLOYEE END------->

									</div>
									<!-------REPORT FILTER RIGHT SIDE END------->

								</div>

	                            <!-------REPORT FILTER: SEARCH BUTTON START------->
								<div class="flex flex-wrap items-center justify-end space-x-3 text-center">    
									<button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">
										Search
									</button>
								</div>
                                <!-------REPORT FILTER: SEARCH BUTTON END------->

							</form>                  
						</div>
					</div>
				</div>
			</div>
			<!-------REPORT FILTERS END------->



			<!-------REPORT TITLE START------->
			<div id="ReportInputs" class="lg:flex lg:items-center space-x-3 mt-2 xl:my-3">
                <div class="flex items-center text-[17px]">
                    <span class="font-semibold">Year:</span> 
                    <span class="font-regular ml-2">{dataval_result.Year || 'ALL'}</span>
                </div>

                <div class="flex items-center text-[17px]">
                    <span class="font-semibold">Department:</span> 
                    <span class="font-regular ml-2">{dataval_result.Department || 'ALL'}</span>
                </div>

                <div class="flex items-center text-[17px]">
                    <span class="font-semibold">Employee:</span> 
                    <span class="font-regular ml-2">{Selected_Employee}</span>
                </div>
				
			</div>
			<!-------REPORT TITLE END------->
 

			<!-------REPORT DATA START------->
			<div class="w-full overflow-x-auto"> 
				<table id="ReportData" width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">

                    <!-------REPORT DATA: HEADER START------->
					<thead class="text-xs text-gray-900 bg-primarycolor-500 font-semibold">
						<tr>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Serial_Number">
                                Sr. No.
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Year">
                                Year
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Department">
                                Department
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Employee_Code">
                                Employee Code
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Employee_Name">
                                Employee Name
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Designation">
                                Designation
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="DOJ">
                                DOJ
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Tenure">
                                Tenure
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Last_Increment_Date">
                                Last Increment Date
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="H1_Self_Rating">
                                H1 Self Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="H1_Manager_Rating">
                                H1 Manager Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Average_H1_Rating">
                                Average H1 Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="H2_Self_Rating">
                                H2 Self Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="H2_Manager_Rating">
                                H2 Manager Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Average_H2_Rating">
                                Average H2 Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Average_Self_Rating">
                                Average Self Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Average_Manager_Rating">
                                Average Manager Rating
                            </th>
                            <th class="py-2 px-2 text-xs xl:text-xs 2xl:text-sm text-left capitalize sortable" data-key="Final_Rating">
                                Final Rating
                            </th>
						</tr>
					</thead>
                    <!-------REPORT DATA: HEADER END------->

                    <!-------REPORT DATA: BODY START------->
					<tbody>
						{#if dataval_result.Table_Data && dataval_result.Table_Data.length > 0}
							{#each dataval_result.Table_Data as row}
								<tr class="border-b border-gray-200">
                                    <td>{row.Serial_Number}</td>
                                    <td>{row.Year}</td>
                                    <td>{row.Department}</td>
                                    <td>{row.Employee_Code}</td>
                                    <td>{row.Employee_Name}</td>
                                    <td>{row.Designation}</td>
                                    <td>{row.DOJ}</td>
                                    <td>{row.Tenure}</td>
                                    <td>{row.Last_Increment_Date}</td>
                                    <td>{row.Cumulative_H1_Self_Rating}</td>
                                    <td>{row.Cumulative_H1_Manager_Rating}</td>
                                    <td>{row.Cumulative_H1_Rating}</td>
                                    <td>{row.Cumulative_H2_Self_Rating}</td>
                                    <td>{row.Cumulative_H2_Manager_Rating}</td>
                                    <td>{row.Cumulative_H2_Rating}</td>
                                    <td>{row.Cumulative_Self_Rating}</td>
                                    <td>{row.Cumulative_Manager_Rating}</td>
                                    <td>{row.Cumulative_Final_Rating}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="18" class="text-center py-4">No data available</td>
							</tr>
						{/if}
					</tbody>
					<!-------REPORT DATA: BODY END------->

					<!-------REPORT DATA: FOOTER START------->
					<tfoot>
                        <tr class="bg-gray-200 font-semibold">
                        </tr>
					</tfoot>
					<!-------REPORT DATA: FOOTER END------->

				</table>
			</div>
			<!-------REPORT DATA END------->

		</div>
	</div>
</div>
<!-------REPORT END------->