<script>
  //
  // Importing Libraries
	//
	import { page, session } from '$app/stores';
  import { onMount } from 'svelte';
    
  //
  // Importing Project Theme Settings
  //
  import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
  
  //
  // Importing API Paths
  //
  import { API_Base_URL, API_PATHS } from '../lib/API_PATHS'
 
      
  //
  // LIVE DATA Initialization
  //
  import { Live_Data_Storage } from '../stores/Live_Data_Storage';

  // Sample Page URL: /dynamic_tlists_add?table=Customer_Purchase_Order*T41_4*Sales

  export let Page_URL_Parameters = $page.url.searchParams.get('settings') ?? '';
  export let Page_URL_Parameters_Set = Page_URL_Parameters.split('*');
  export let Main_Menu = Page_URL_Parameters_Set[0] ?? '';
  export let Menu_Heading = Page_URL_Parameters_Set[1] ?? '';
  export let Menu_Sub_Heading = Page_URL_Parameters_Set[2] ?? '';
  export let Table_ID = Page_URL_Parameters_Set[3] ?? '';
  export let Data_Table_Name = Page_URL_Parameters_Set[4] ?? '';
  export let Linked_Data_Table_Name = Page_URL_Parameters_Set[5] ?? '';
  export let Display_Scenario_ID = Page_URL_Parameters_Set[6] ?? '';


  let Live_Data;

  $: {
    Live_Data = $Live_Data_Storage;
  }

  let kraKpiData = [];

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

    // Get Filter_Condition
    let Filter_Condition = await fetch(API_PATHS.API_URL_Get_Filter_Condition_for_Page_Information, {
      method: 'POST',
      body: JSON.stringify({
          "Live_Data":Live_Data
      })
    });

    Filter_Condition  = await Filter_Condition.json();
    Live_Data.Page_Information.Filter_Condition = Filter_Condition;
    Live_Data_Storage.set(Live_Data); // Don't forget to update the store

    // Get Action_Dropdown_List
    let Action_Dropdown_List = await fetch(API_PATHS.API_URL_Get_Action_Dropdown_List, {
      method: 'POST',
      body: JSON.stringify({
        "Live_Data":Live_Data
      })
    });

    Action_Dropdown_List  = await Action_Dropdown_List.json();
    Live_Data.Page_Information.Action_Dropdown_List = Action_Dropdown_List;
    console.log("Action_Dropdown_List: ", Live_Data.Page_Information.Action_Dropdown_List);
    Live_Data_Storage.set(Live_Data); // Don't forget to update the store

    try {
      const res = await fetch(API_PATHS.API_URL_Get_Table_Info_KRA_KPI_Trans, {
        method: 'POST',
        body: JSON.stringify({
          "Live_Data": Live_Data,
          "Filter_Condition": Live_Data.Page_Information.Filter_Condition
        })
      });
      const data = await res.json();

      kraKpiData = data.records || [];
      filteredData = [...kraKpiData]; // Initialize filtered data
      totalPages = Math.ceil(filteredData.length / itemsPerPage); // Calculate total pages
      updatePaginatedData(); // Initialize paginated data
    
    } catch (err) {
      console.error("Failed to fetch KRA/KPI data", err);
    }

    // Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");
  });

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
      redirectURL = "/KRA_KPI_Trans_Add?PageParameters=";
      console.log(redirectURL);
      window.location.href = redirectURL;

    } else if (action_dropdown_option === 'Edit' || action_dropdown_option === 'Update') {

      redirectURL = "/KRA_KPI_Trans_Edit?id="+Selected_IDs;
      window.location.href = redirectURL;
      
    } else if (action_dropdown_option === 'View PMS Report') {

      redirectURL = "/Project_Documents/PMS_Report?id="+Selected_IDs;
      window.location.href = redirectURL;
      
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

</script>

<!-- Page Title Section / START -->
<svelte:head>
	<title>PMS Activity | AKS for RECON</title>
</svelte:head>
<!-- Page Title Section / End -->


<!-- LOADER ICON / START -->
<div class="relative w-full h-full hidden" id="loader_block">  
    <div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
        <img src="{Project_Theme_Settings.client_loader_icon}" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
    </div>
</div>
<!-- LOADER ICON / END -->

<!-- Action Dropdown, Action Dropdown Button, Display Settings Button, Sub Menu Heading / START -->
<!-- Wrapper for the entire header -->
<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between my-4">

  <!-- Left section: Action Dropdown + Button -->
  <div class="w-full lg:w-auto mb-2 lg:mb-0">
    <!-- Action Dropdown, Action Dropdown Button / START -->
    <form on:submit|preventDefault={ActionButton}>
      <div class="flex space-x-2">
          <select name="data_action" id="data_action" required class="block w-28 lg:w-36 xl:w-48 2xl:w-56 bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-1.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">
                  
              <option value="">Please Choose...</option>	

              {#if Live_Data.Page_Information.Action_Dropdown_List}
                  {#if Object.keys(Live_Data.Page_Information.Action_Dropdown_List).length > 0}
                      {#each Object.entries(Live_Data.Page_Information.Action_Dropdown_List) as [Action_Dropdown_List_Key, Action_Dropdown_List_Data]}
                          {#if Action_Dropdown_List_Data.Access == 1 && Action_Dropdown_List_Data.Filter_Status == 1}
                              <option disabled={false} value={Action_Dropdown_List_Key} style="background-color: YELLOW;">
                                  {Action_Dropdown_List_Data.action_dropdown_option}
                              </option>
                          {:else}
                              <option disabled={true} value={Action_Dropdown_List_Key}>
                                  {Action_Dropdown_List_Data.action_dropdown_option}
                              </option>
                          {/if}
                      {/each}
                  {/if}
              {/if}
                  
          </select>
          <button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> Action </button>
      </div>
    </form>
    <!-- Action Dropdown, Action Dropdown Button / END -->
  </div>

  <!-- Center section: Page Title -->
  <div class="flex-grow text-center">
    <h1 class="text-xl font-bold text-black">PMS Activity</h1>
  </div>

  <!-- Search Bar -->
  <div class="flex-grow text-center">
    <input 
      type="text" 
      placeholder="Search..." 
      bind:value={searchQuery} 
      on:input={handleSearch} 
      class="search-box border border-gray-400 rounded-lg px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-full"
    />
  </div>
</div>


<!-- Table Display -->
<table class="w-full table-auto border border-gray-300">
  <thead class="bg-gray-100">
    <tr>
      <th scope="col" class="px-6 py-3"></th>
      <th scope="col" class="px-6 py-3">Processing Year</th>
      <th scope="col" class="px-6 py-3">Employee Code</th>
      <th scope="col" class="px-6 py-3">Employee Name</th>
      <th scope="col" class="px-6 py-3">Designation</th>
      <th scope="col" class="px-6 py-3">Department</th>
      <th scope="col" class="px-6 py-3">DOJ</th>
      <th scope="col" class="px-6 py-3">Tenure</th>
      <th scope="col" class="px-6 py-3">Last Increment Date</th>
      <th scope="col" class="px-6 py-3">Cumulative H1 Rating</th>
      <th scope="col" class="px-6 py-3">Cumulative H2 Rating</th>
      <th scope="col" class="px-6 py-3">Cumulative Final Rating</th>
    </tr>
  </thead>
  <tbody>
    {#each paginatedData as item, index}
    <tr>
      <td class="border px-4 py-2 text-center">
        <input type="checkbox" value={item.Employee_KRA_KPI_Transaction_ID} checked={user_selection.includes(item.Employee_KRA_KPI_Transaction_ID)} on:change={() => handleSelection(item.Employee_KRA_KPI_Transaction_ID)} />
      </td>
      <td class="px-6 py-4">{item.Processing_Year}</td>
      <td class="px-6 py-4">{item.Employee_Code}</td>
      <td class="px-6 py-4">{item.Employee_Name}</td>
      <td class="px-6 py-4">{item.Designation}</td>
      <td class="px-6 py-4">{item.Department}</td>
      <td class="px-6 py-4">{item.DOJ}</td>
      <td class="px-6 py-4">{item.Tenure}</td>
      <td class="px-6 py-4">{item.Last_Increment_Date}</td>
      <td class="px-6 py-4">{item.Cumulative_H1_Rating}</td>
      <td class="px-6 py-4">{item.Cumulative_H2_Rating}</td>
      <td class="px-6 py-4">{item.Cumulative_Final_Rating}</td>
    </tr>
    {/each}
  </tbody>
</table>

<div class="flex justify-between items-center mt-4">
  <button on:click={previousPage} disabled={currentPage === 1} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Previous</button>
  <span>Page {currentPage} of {totalPages}</span>
  <button on:click={nextPage} disabled={currentPage === totalPages} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Next</button>
</div>

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
</style>

