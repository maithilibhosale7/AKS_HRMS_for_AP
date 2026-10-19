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
  import { filterPmsActions } from '$lib/pmsAccess.js'
 
      
  //
  // LIVE DATA Initialization
  //
  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

  // Sample Page URL: /dynamic_tlists_add?table=Customer_Purchase_Order*T41_4*Sales
	export let Page_URL_Parameters = $page.url.searchParams.get('settings') ?? ''; // Previously table_all
  export let Page_URL_Parameters_Set = Page_URL_Parameters.split('*');
  export let Main_Menu = Page_URL_Parameters_Set[0];
  export let Menu_Heading = Page_URL_Parameters_Set[1];
  export let Menu_Sub_Heading = Page_URL_Parameters_Set[2];
  export let Table_ID = Page_URL_Parameters_Set[3];
  export let Data_Table_Name = Page_URL_Parameters_Set[4];
  export let Linked_Data_Table_Name = Page_URL_Parameters_Set[5];
  export let Display_Scenario_ID = Page_URL_Parameters_Set[6];

  let Live_Data;

  $: {
    Live_Data = $Live_Data_Storage;
  }

  
  // Fetch the data from backend
  onMount(async () => {

    // Show Loader Icon
    let element_loader = document.getElementById("loader_block");
    element_loader.classList.remove("hidden");

    // Clear Live Data Execution Information and Scenario Config
    Live_Data.Execution_Information = {};
    Live_Data.Scenario_Config = {};
    Live_Data = { ...Live_Data };
    Live_Data_Storage.set(Live_Data);

    // Updating Page Information in Live Data
    Live_Data.Page_Information.PageURL = $page.url;
    Live_Data.Page_Information.Main_Menu = Main_Menu;
    Live_Data.Page_Information.Menu_Heading = Menu_Heading;
    Live_Data.Page_Information.Menu_Sub_Heading = Menu_Sub_Heading;
    Live_Data.Page_Information.Table_ID = Table_ID;
    Live_Data.Page_Information.Table_Name = Data_Table_Name;
    Live_Data.Page_Information.Linked_Table_Name = Linked_Data_Table_Name;
    Live_Data.Page_Information.Display_Settings_ID = Display_Scenario_ID;
    Live_Data_Storage.set(Live_Data); // Don't forget to update the store

    let Filter_Condition = {};
    try {
        if (API_PATHS.API_URL_Get_Filter_Condition_for_Page_Information) {
            const Filter_Condition_res = await fetch(API_PATHS.API_URL_Get_Filter_Condition_for_Page_Information, {
              method: 'POST',
              body: JSON.stringify({ "Live_Data": Live_Data })
            });
            Filter_Condition = await Filter_Condition_res.json();
        }
    } catch (e) {
        Filter_Condition = {};
    }
    Live_Data.Page_Information.Filter_Condition = Filter_Condition;
    Live_Data_Storage.set(Live_Data);

    let Action_Dropdown_List = null;
    try {
        if (API_PATHS.API_URL_Get_Action_Dropdown_List) {
            const Action_Dropdown_List_res = await fetch(API_PATHS.API_URL_Get_Action_Dropdown_List, {
              method: 'POST',
              body: JSON.stringify({ "Live_Data": Live_Data })
            });
            Action_Dropdown_List = await Action_Dropdown_List_res.json();
        }
    } catch (e) {
        Action_Dropdown_List = null;
    }
    if (!Action_Dropdown_List || typeof Action_Dropdown_List !== 'object' || Array.isArray(Action_Dropdown_List) || Object.keys(Action_Dropdown_List).length === 0) {
        Action_Dropdown_List = {
        Add: { action_dropdown_option: 'Add', Access: 1, Filter_Status: 1 },
        Edit: { action_dropdown_option: 'Edit', Access: 1, Filter_Status: 1 },
        AddRating: { action_dropdown_option: 'Add KRA KPI Rating', Access: 1, Filter_Status: 1 },
        StartCycle: { action_dropdown_option: 'Start PMS Cycle', Access: 1, Filter_Status: 1 }
    };
    }
    Live_Data.Page_Information.Action_Dropdown_List = Action_Dropdown_List;
    Live_Data_Storage.set(Live_Data);

    try {
      const res = await fetch(API_PATHS.API_URL_KRA_KPI_Get_Table_View_Data);
      const data = await res.json();

      kraKpiData = data.records || [];
      filteredData = [...kraKpiData]; // Initialize filtered data
      totalPages = Math.ceil(filteredData.length / itemsPerPage); // Calculate total pages
      updatePaginatedData(); // Initialize paginated data

      departmentsData = data.departments || [];

    } catch (err) {
      console.error("Failed to fetch KRA/KPI data", err);
    }

    // Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");
  });


  let kraKpiData = [];
  let selectedRows = [];
  let departmentsData = [];
  let selectedDepartments = [];


  function ActionButton() {

    // Show Loader Icon
    let element_loader = document.getElementById("loader_block");
    element_loader.classList.remove("hidden");

    let Selected_Action = document.getElementById('data_action').value;

    let Action_Dropdown_Execution_Data = Live_Data.Page_Information.Action_Dropdown_List[Selected_Action];
    let Selected_IDs = Live_Data.Page_Information.Selected_IDs.toString();

    let action_dropdown_option = Action_Dropdown_Execution_Data.action_dropdown_option; // Scenario ID or Scenario Config
    let action_dropdown_effect = Action_Dropdown_Execution_Data.action_dropdown_effect; // Scenario ID or Scenario Config
    let pagetype = Action_Dropdown_Execution_Data.pagetype;
    let linked = Action_Dropdown_Execution_Data.linked;

    console.log("For ", Selected_IDs, " doing ", action_dropdown_option, " ", pagetype);

    let redirectURL = '';

    if (action_dropdown_option === 'Add') {

      redirectURL = "/KRA_KPI_Master_Add";
      console.log(redirectURL);

      window.location.href = redirectURL;
    } else if (action_dropdown_option === 'Edit') {
      
      redirectURL = "/KRA_KPI_Master_Edit?id="+Selected_IDs;
      window.location.href = redirectURL;
      
    } else if (action_dropdown_option === 'Add KRA KPI Rating') {
      
      redirectURL = "/KRA_KPI_Trans_Add?id="+Selected_IDs;      
      window.location.href = redirectURL;

    } else if (action_dropdown_option === 'Start PMS Cycle') {

      openPopup();

    } else if (action_dropdown_option === 'Delete') {

      if (confirm(`Are you sure to delete ${Selected_IDs} record(s)?`)) {
        alert("Delete operation triggered");
      }

    }

    // Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");
  }

  let user_selection = []; // Array to hold user selections
  $: $Live_Data_Storage.Page_Information.Selected_IDs = user_selection;

  //
  // Function to handle User Selection
  //
  function handleSelection(uid) {
    if (user_selection.includes(uid)) {
      user_selection = user_selection.filter(id => id !== uid);
    } else {
      user_selection.push(uid);
    }

    // Force Svelte to detect and immediately update the selection label
    user_selection = [...user_selection];
    Live_Data.Page_Information.Selected_IDs = user_selection;

    Update_Action_Dropdown('handleSelection');
        
    console.log(user_selection);
  }

  //
  // Update Action Dropdown
  //
  async function Update_Action_Dropdown(by) {

    console.log("Calling Update_Action_Dropdown ", by)
    if (!API_PATHS.API_URL_Update_Action_Dropdown_List) return;

    let Update_Action_Dropdown_List_res = await fetch(API_PATHS.API_URL_Update_Action_Dropdown_List, {
    method: 'POST',
    body: JSON.stringify({
      "Live_Data":Live_Data
      })
    });
    Update_Action_Dropdown_List_res = await Update_Action_Dropdown_List_res.json();

    Live_Data.Page_Information.Action_Dropdown_List = Update_Action_Dropdown_List_res;

    Live_Data_Storage.set(Live_Data); // Don't forget to update the store
  }


  // Pagination Variables
  let currentPage = 1; // Current page number
  let itemsPerPage = 10; // Number of items per page
  let totalPages = 0; // Total number of pages
  let filteredData = []; // Data after applying search filter
  let paginatedData = []; // Data for the current page
  let searchQuery = "";

  // Function to handle search
  function handleSearch() {
    if (searchQuery.trim() !== '') {
      filteredData = kraKpiData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      filteredData = [...kraKpiData]; // Reset to original data if search query is empty
    }
    totalPages = Math.ceil(filteredData.length / itemsPerPage); // Update total pages
    currentPage = 1; // Reset to the first page
    updatePaginatedData(); // Update paginated data
  }

  // Function to update paginated data
  function updatePaginatedData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedData = filteredData.slice(startIndex, endIndex);
  }

  // Pagination Functions
  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      updatePaginatedData();
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      updatePaginatedData();
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      updatePaginatedData();
    }
  }

  //
  // Start PMS Cycle Functionality
  //
  let isPopupOpen = false;

  function openPopup() {
    isPopupOpen = true;
  }

  function closePopup() {
    isPopupOpen = false;
    
    window.location.reload(); // Reload the page to reset state
  }

  function toggleDepartment(department) {
    if (selectedDepartments.includes(department)) {
      selectedDepartments = selectedDepartments.filter(dep => dep !== department);
    } else {
      selectedDepartments = [...selectedDepartments, department];
    }
  }

  function toggleSelectAll(event) {
    if (event.target.checked) {
      selectedDepartments = [...departmentsData];
    } else {
      selectedDepartments = [];
    }
  }

  async function applySelection() {
    // Show Loader Icon
    let element_loader = document.getElementById("loader_block");
    element_loader.classList.remove("hidden");

    console.log("Selected Departments: ", selectedDepartments);

    let Get_Start_PMS_Cycle_Res = await fetch(API_PATHS.API_URL_Start_PMS_Cycle_for_Departments, {
      method: 'POST',
      body: JSON.stringify({
        "selectedDepartments":selectedDepartments
      })
    });

    Get_Start_PMS_Cycle_Res  = await Get_Start_PMS_Cycle_Res.json();
    

    // Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");

    closePopup();
  }

</script>

<!-- Page Title Section / START -->
<svelte:head>
	<title>KRA / KPI Masters | AKS HRMS</title>
</svelte:head>
<!-- Page Title Section / End -->

<!-- LOADER ICON / START -->
<div class="relative w-full h-full hidden" id="loader_block">  
    <div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
        <img src="{Project_Theme_Settings.client_loader_icon}" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
    </div>
</div>
<!-- LOADER ICON / END -->

<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between my-4 gap-3">
  <h1 class="text-xl font-bold text-slate-800">KRA / KPI Masters</h1>
  <div class="flex gap-2">
    <input
      type="text"
      placeholder="Search..."
      bind:value={searchQuery}
      on:input={handleSearch}
      class="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button type="button" class="px-4 py-2 border border-slate-300 text-sm rounded-lg whitespace-nowrap" on:click={openPopup}>Start cycle</button>
    <button type="button" class="px-4 py-2 bg-[#1E3A5F] text-white text-sm rounded-lg whitespace-nowrap" on:click={() => window.location.href = '/KRA_KPI_Master_Add'}>Add KRA / KPI</button>
  </div>
</div>

<table class="w-full table-auto border border-gray-300">
  <thead class="bg-gray-100">
    <tr>
      <th class="px-4 py-3 text-left">Employee</th>
      <th class="px-4 py-3 text-left">Year</th>
      <th class="px-4 py-3 text-left">Status</th>
      <th class="px-4 py-3 text-left">KRAs</th>
      <th class="px-4 py-3"></th>
    </tr>
  </thead>
  <tbody>
    {#each paginatedData as row}
      <tr>
        <td class="px-4 py-3">
          <p class="font-medium text-slate-800">{row.Employee_Name}</p>
          <p class="text-xs text-slate-400">{row.Employee_Code}</p>
        </td>
        <td class="px-4 py-3">{row.Processing_Year}</td>
        <td class="px-4 py-3">{row.Status}</td>
        <td class="px-4 py-3">{(row.KRA_Details || []).length}</td>
        <td class="px-4 py-3 text-center">
          <button type="button" class="px-3 py-1.5 bg-[#1E3A5F] text-white text-sm rounded-lg" on:click={() => window.location.href = '/KRA_KPI_Master_Edit?id=' + row.Employee_KRA_KPI_Details_ID}>Open</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<div class="flex justify-between items-center mt-4">
  <button on:click={previousPage} disabled={currentPage === 1} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Previous</button>
  <span>Page {currentPage} of {totalPages}</span>
  <button on:click={nextPage} disabled={currentPage === totalPages} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Next</button>
</div>

{#if isPopupOpen}
  <!-- Department Selection Popup -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-96">
      <h2 class="text-lg font-bold mb-4">Select Departments</h2>
      <div class="mb-4">
        <label class="flex items-center mb-2">
          <input type="checkbox" on:change={toggleSelectAll} />
          <span class="ml-2">Select All</span>
        </label>
        {#each departmentsData as department}
          <label class="flex items-center mb-2">
            <input 
              type="checkbox" 
              value={department} 
              checked={selectedDepartments.includes(department)} 
              on:change={() => toggleDepartment(department)} 
            />
            <span class="ml-2">{department}</span>
          </label>
        {/each}
      </div>
      <div class="flex justify-end gap-2">
        <button class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" on:click={closePopup}>Cancel</button>
        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" on:click={applySelection}>Start</button>
      </div>
    </div>
  </div>
{/if}

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  th {
    background-color: #f2f2f2;
    text-align: left;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  tr:hover {
    background-color: #f1f1f1;
  }
  button {
    margin-right: 5px;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

