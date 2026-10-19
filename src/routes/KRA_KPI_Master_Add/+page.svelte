<script>
  //
  // Importing necessary libraries
  //
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import AutoResizeTextarea from '$lib/components/AutoResizeTextArea.svelte';
  import { API_PATHS } from '$lib/API_PATHS';
  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';


  //
  // Initializing Primary Variables
  //
  let employees = [];
  let employeeDetails = {};
  let selectedEmployee = '';
  let submitting = false;
  let kraList = [];
  let showSuccess = false;
  const currentYear = new Date().getFullYear();
  const processingYear = `Financial Year: ${currentYear}-${currentYear + 1}`;

  //
  // Checking Session Data for User Validation
  //
  

  //
  // Setting up Live_Data Object
  //
  let Live_Data;
  $: {
    Live_Data = $Live_Data_Storage;
  }


  //
  // Function to sync current state of variables to Live_Data.Execution_Information
  //
  function updateLiveDataStore() {
    Live_Data.Execution_Information.selectedEmployee = selectedEmployee;
    Live_Data.Execution_Information.kraList = kraList;
    Live_Data.Execution_Information.PMS_Processing_Year = processingYear;
    Live_Data_Storage.set(Live_Data);
  }


  //
  // Loading Data from Live_Data.Execution_Information or initialize with blank
  // Get Employee Self Data from DB
  //
  onMount(async () => {

    if (Live_Data.Execution_Information && Object.keys(Live_Data.Execution_Information).length === 0) {
      updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
    } else {
      selectedEmployee = Live_Data.Execution_Information.selectedEmployee;
      kraList = Live_Data.Execution_Information.kraList;
    }

    try {
      const res = await fetch(API_PATHS.API_URL_Get_Employee_Self_Data);
      const data = await res.json();
      employees = data.employees || [];
      employeeDetails = data.employeeDetails || [];
    } catch (err) {
      console.error("Failed to fetch Employee Self data", err);
    }
  });

  let searchTerm = ''; // Variable to store the user's search input
  let showDropdown = false; // Flag to toggle the visibility of the searchable list

  // Reactive variable to filter the employees list as the user types
  $: filteredEmployees = employees.filter(emp => 
    emp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to handle selection
  function selectEmployee(emp) {
    selectedEmployee = emp;
    searchTerm = emp; // Update input to show selected name
    showDropdown = false;
    updateLiveDataStore(); // Maintain existing logic
  }


  //
  // Function to add new KRA
  //
  function addKRA() {
    kraList = [...kraList, { name: '', kpis: [] }];
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }


  //
  // Function to delete KRA
  //
  function removeKRA(index) {
    kraList = kraList.filter((_, i) => i !== index);
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }


  //
  // Function to add new KPI to KRA
  //
  function addKPI(kraIndex) {
    kraList = kraList.map((kra, i) => 
      i === kraIndex
        ? { ...kra, kpis: [...kra.kpis, {
            name: '',
            h1_weightage: 0, 
            h2_weightage: 0,
            ratingType: '1-5 Scale',
            target: '5',
            dataSource: ''
          }] 
        }
      : kra
    );
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }


  //
  // Function to remove KPI from KRA
  //
  function removeKPI(kraIndex, kpiIndex) {
    kraList = kraList.map((kra, i) =>
      i === kraIndex
        ? {
            ...kra,
            kpis: kra.kpis.filter((_, j) => j !== kpiIndex)
          }
        : kra
    );
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }


  //
  // Compute totalWeight based on Weightages entered for KPIs
  //
  $: h1Total = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.h1_weightage || 0), 0), 0);
  $: h2Total = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.h2_weightage || 0), 0), 0);
  let formNotice = '';


  //
  // Function to submit new KRA KPI for a Selected Employee
  //
  async function submitKRAKPI() {

    // Data validation - Employee not selected
    formNotice = '';
    if (!selectedEmployee) {
      formNotice = 'Select an employee.';
      return;
    }

    const Employee_Self_ID = employeeDetails[selectedEmployee]?.Employee_Self_ID || '';
    if (!Employee_Self_ID) {
      formNotice = 'Employee record is missing an id.';
      return;
    }

    if (h1Total !== 100 || h2Total !== 100) {
      formNotice = `Apr–Sep weights are ${h1Total}% and Oct–Mar weights are ${h2Total}%. Each needs to total 100%.`;
      return;
    }

    for (const [i, kra] of kraList.entries()) {
      if (!kra.name?.trim()) {
        formNotice = `KRA ${i + 1} needs a name.`;
        return;
      }
      for (const [j, kpi] of kra.kpis.entries()) {
        if (!kpi.name?.trim()) {
          formNotice = `KPI ${j + 1} in KRA ${i + 1} needs a name.`;
          return;
        }
      }
    }

    // Submitting data to DB
    submitting = true;
    const res = await fetch(API_PATHS.API_URL_Save_KRA_KPI, {
      method: 'POST',
      body: JSON.stringify({
        employee_self_id: Employee_Self_ID,
        kra_list: kraList,
        Processing_Year: processingYear
      })
    });

    const result = await res.json(); 

    if (result.status !== "success") {
      alert("Error saving master: " + result.message);
      submitting = false;
      return;
    }

    Live_Data.Execution_Information = {};
    Live_Data.Scenario_Config = {};
    Live_Data = { ...Live_Data };
    Live_Data_Storage.set(Live_Data);
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
      window.location.href = Live_Data.Page_Information.PageURL;
    }, 2000);
  }

  //
  // Cancel new KRA KPI Creation
  //
  function CancelButton() {
    try {
      // Show loader if present
      const element_loader = document.getElementById("loader_block");
      if (element_loader) element_loader.classList.remove("hidden");

      // Get redirect URL from Live_Data
      const Cancel_Redirect_URL = Live_Data?.Page_Information?.PageURL;

      if (!Cancel_Redirect_URL) {
        console.error("Redirect URL not found in Live_Data.Page_Information");
        alert("Unable to cancel: missing navigation info.");
        return;
      }

      // Optional: clear related Live_Data keys if needed
      Live_Data.Execution_Information = {};
      Live_Data.Scenario_Config = {};
      Live_Data = { ...Live_Data };
      Live_Data_Storage.set(Live_Data);

      // Hide loader before navigating (optional)
      if (element_loader) element_loader.classList.add("hidden");

      // Redirect to target page
      window.location.href = Cancel_Redirect_URL;
    } catch (error) {
      console.error("Error during cancel:", error);
      alert("Something went wrong while cancelling.");
    }
  }

  //
  // Function for AutoResizeTextArea
  //
  function handleBlur(event) {
      updateLiveDataStore();  
    // const key = event.detail.name;
    // APUICall([key]);
  }

</script>

 <!-- Header Section -->
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
  <div>
    <h1 class="text-xl font-semibold text-gray-800">Add KRA / KPI</h1>
  </div>
</div>

<!-- Employee Selection Card -->
<div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="relative">
      <label class="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
      
      <div class="relative">
        <input
          type="text"
          placeholder="Search employee..."
          bind:value={searchTerm}
          on:focus={() => showDropdown = true}
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
        
        {#if selectedEmployee}
          <button 
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            on:click={() => { selectedEmployee = ''; searchTerm = ''; updateLiveDataStore(); }}
          >
            ✕
          </button>
        {/if}
      </div>
    
      {#if showDropdown}
        <div class="fixed inset-0 z-10" on:click={() => showDropdown = false}></div>
        
        <ul class="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-height-60 overflow-auto py-1">
          {#if filteredEmployees.length > 0}
            {#each filteredEmployees as emp}
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-indigo-600 hover:text-white transition-colors"
                  on:click={() => selectEmployee(emp)}
                >
                  {emp}
                </button>
              </li>
            {/each}
          {:else}
            <li class="px-3 py-2 text-sm text-gray-500">No employees found</li>
          {/if}
        </ul>
      {/if}
    </div>
    
    {#if selectedEmployee}
      <div class="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
        <div class="bg-gray-50 p-2 rounded">
          <p class="text-s text-gray-500 font-medium">Employee Code</p>
          <p class="font-medium">{employeeDetails[selectedEmployee]?.Employee_Code}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <p class="text-s text-gray-500 font-medium">Department</p>
          <p class="font-medium">{employeeDetails[selectedEmployee]?.Department}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <p class="text-s text-gray-500 font-medium">Designation</p>
          <p class="font-medium">{employeeDetails[selectedEmployee]?.Designation}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <p class="text-s text-gray-500 font-medium">DOJ</p>
          <p class="font-medium">{employeeDetails[selectedEmployee]?.DOJ}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <p class="text-s text-gray-500 font-medium">Tenure</p>
          <p class="font-medium">{employeeDetails[selectedEmployee]?.Tenure}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded">
          <p class="text-s text-gray-500 font-medium">Last Increment Date</p>
          <p class="font-medium">{employeeDetails[selectedEmployee]?.Last_Increment_Date}</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- PMS Period Section -->
<div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
  <div class="flex items-center justify-between">
    <div class="text-sm font-medium text-gray-700">PMS Period</div>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">{processingYear}</span> <!-- Dynamically display the processing year -->
    </div>
  </div>
</div>

<!-- KRA/KPI Section -->
<div class="space-y-3">
  <div class="flex justify-between items-center mb-2">
    <h2 class="text-md font-medium text-gray-800">KRA</h2>
    <button 
      class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"
      on:click={addKRA}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      Add KRA
    </button>
  </div>

  {#each kraList as kra, i}
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3">
        <!-- KRA Column -->
        <div class="lg:col-span-1">
          <label class="block text-s font-medium text-gray-700 mb-1">KRA NAME</label>
          <AutoResizeTextarea
            bind:value={kraList[i].name}
            placeholder="Strategic objective..."
            className="min-h-[50px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            on:blur={handleBlur}
          />
        </div>

       <!-- KPI Column -->
        <!-- KPI Column - Single Line Layout -->
        <div class="lg:col-span-3">
          <!-- Header Row -->
          <div class="flex items-center mb-1 space-x-2 text-s">
            <div class="w-2/5 font-medium text-gray-700">KPI DESCRIPTION</div>
            <div class="w-1/12 text-gray-500 uppercase">H1 WEIGHT</div>
            <div class="w-1/12 text-gray-500 uppercase">H2 WEIGHT</div>
            <div class="w-1/6 text-gray-500 uppercase">TYPE</div>
            <div class="w-1/6 text-gray-500 uppercase">TARGET</div>
            <div class="w-1/4 text-gray-500 uppercase">DATA SOURCE</div>
            <div class="w-12 flex justify-end">
              <button 
                class="text-indigo-600 hover:text-indigo-800 font-medium"
                on:click={() => addKPI(i)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- KPI Rows -->
          <div class="space-y-1">
            {#each kra.kpis as kpi, j}
              <div class="flex items-center space-x-2">
                <!-- Description -->
                <div class="w-2/5">
                  <AutoResizeTextarea
                    bind:value={kraList[i].kpis[j].name}
                    placeholder="Enter KPI"
                    className="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    on:blur={handleBlur}
                  />
                </div>
                
                <!-- Weight -->
                <div class="w-1/12">
                  <input 
                    type="number" min="0" max="100" 
                    bind:value={kpi.h1_weightage}
                    on:input={updateLiveDataStore}
                    placeholder="H1"
                    class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                <div class="w-1/12">
                  <input 
                    type="number" min="0" max="100" 
                    bind:value={kpi.h2_weightage}
                    on:input={updateLiveDataStore}
                    placeholder="H2"
                    class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                
                <!-- Type -->
                <div class="w-1/6">
                  <select 
                    bind:value={kpi.ratingType} 
                    on:input={updateLiveDataStore}
                    class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="">Select</option>
                    <option>1-5 Scale</option>
                    <option>Percentage</option>
                    <option>Value</option>
                  </select>
                </div>
                
                <!-- Target -->
                <div class="w-1/6">
                  {#if kpi.ratingType === 'Percentage'}
                    <input 
                      type="number"
                      step="0.01"
                      bind:value={kpi.target}
                      on:input={updateLiveDataStore}
                      placeholder="0-100%"
                      class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  {:else if kpi.ratingType === '1-5 Scale'}
                    <input 
                      type="number"
                      min="1"
                      max="5"
                      bind:value={kpi.target}
                      on:input={updateLiveDataStore}
                      placeholder="1-5"
                      class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  {:else}
                    <input 
                      type="text"
                      bind:value={kpi.target}
                      on:input={updateLiveDataStore}
                      placeholder="Target"
                      class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  {/if}
                </div>

                <!-- Data Source -->
                <div class="w-1/4">
                  <input
                    type="text"
                    bind:value={kpi.dataSource}
                    on:input={updateLiveDataStore}
                    placeholder="Data source"
                    class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                
                <!-- Delete Button -->
                <div class="w-12 flex justify-center">
                  <button 
                    on:click={() => removeKPI(i, j)}
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- KRA Footer -->
      <div class="bg-gray-50 px-3 py-1 flex justify-end border-t border-gray-200">
        <button 
          class="text-red-600 hover:text-red-800 text-s font-medium flex items-center gap-1"
          on:click={() => removeKRA(i)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Remove KRA
        </button>
      </div>
    </div>
  {/each}
</div>
<!-- Weight Summary -->
<div class="mt-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium text-gray-700">H1 Total:</span>
      <span class={`text-lg font-semibold ${h1Total === 100 ? 'text-green-600' : 'text-red-600'}`}>{h1Total}%</span>
      <span class="text-sm font-medium text-gray-700">H2 Total:</span>
      <span class={`text-lg font-semibold ${h2Total === 100 ? 'text-green-600' : 'text-red-600'}`}>{h2Total}%</span>
    </div>
  </div>
  {#if h1Total !== 100 || h2Total !== 100}
    <div class="flex items-center gap-1 text-red-600 text-sm">
      <span>
        {#if h1Total !== 100}Apr–Sep weights are {h1Total}%. They need to total 100%. {/if}
        {#if h2Total !== 100}Oct–Mar weights are {h2Total}%. They need to total 100%.{/if}
      </span>
    </div>
  {:else}
    <div class="flex items-center gap-1 text-green-600 text-sm">
      <span>Apr–Sep and Oct–Mar weights both total 100%.</span>
    </div>
  {/if}
  {#if formNotice}
    <p class="text-sm text-red-600 mt-2">{formNotice}</p>
  {/if}
  <div class="flex justify-end gap-2 mt-4">
    <button type="button" class="px-4 py-2 text-sm border border-slate-300 rounded-lg" on:click={() => CancelButton()}>Cancel</button>
    <button type="button" class="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg" on:click={submitKRAKPI}>Save</button>
  </div>
</div>

{#if showSuccess}
  <div class="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-500 animate-fade-in-out">
    KRA-KPI data saved successfully!
  </div>
{/if}
