<script>
  
  //
  // Importing necessary libraries
  //
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import AutoResizeTextarea from '$lib/Components/AutoResizeTextArea.svelte';
  import { API_PATHS } from '$lib/API_PATHS';
  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';


  //
  // Initializing Primary Variables
  //
  let editId = null;
  let employees = [];
  let employeeDetails = [];
  let selectedEmployee = '';
  let kraList = [];
  let submitting = false;
  let showSuccess = false;
  let processingYear = "";
  let recordStatus = '';  


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
    Live_Data.Execution_Information.edit_id = editId;
    Live_Data.Execution_Information.selectedEmployee = selectedEmployee;
    Live_Data.Execution_Information.kraList = kraList;
    Live_Data.Execution_Information.employees = employees;
    Live_Data.Execution_Information.employeeDetails = employeeDetails;
    Live_Data.Execution_Information.Processing_Year = processingYear;
    Live_Data_Storage.set(Live_Data);
  }

  //
  // Loading Data from Live_Data.Execution_Information or Get Data from DB
  // 
  //
  onMount(async () => {
    
    // Setup editId from URL
    const urlParams = new URLSearchParams(window.location.search);
    editId = urlParams.get('id');
    if (!editId) return alert("No edit ID provided.");

    if (Live_Data.Execution_Information && Object.keys(Live_Data.Execution_Information).length === 0) {
      const res = await fetch(API_PATHS.API_URL_Get_KRA_KPI, {
        method: 'POST',
        body: JSON.stringify({
          id: editId
        })
      });
      const data = await res.json();
      console.log("API Response:", data);

      if (data.status === "success" && data.data) {
        const { employee_name, kra_list } = data.data;

        selectedEmployee = employee_name;
        kraList = data.data.kra_list.map(kra => ({
          kra_id: kra.kra_id, 
          name: kra.name,
          kpis: kra.kpis.map(kpi => ({
            kpi_id: kpi.kpi_id, 
            name: kpi.name,
            h1_weightage: kpi.h1_weightage,
            h2_weightage: kpi.h2_weightage,
            ratingType: kpi.ratingType,
            target: kpi.target,
            dataSource: kpi.dataSource
          }))
        }));

        console.log(data.data.employeeDetails);
        employeeDetails = data.data.employeeDetails;
        processingYear = data.data.Processing_Year;

        recordStatus = data.data.Status || '';
        Live_Data.Execution_Information.recordStatus = recordStatus;

        recordStatus = Live_Data.Execution_Information.recordStatus || '';

        employees = employee_name;

        updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information

      } else {
        alert("Failed to load KRA/KPI details: " + (data.message || "Unknown error"));
      }
    } else {
      employees = Live_Data.Execution_Information.employees;
      employeeDetails = Live_Data.Execution_Information.employeeDetails;
      selectedEmployee = Live_Data.Execution_Information.selectedEmployee;
      kraList = Live_Data.Execution_Information.kraList;
      editId = Live_Data.Execution_Information.edit_id;
      processingYear = Live_Data.Execution_Information.Processing_Year;
    }
  });


  //
  // Function to add KRA
  //
  function addKRA() {
    kraList = [...kraList, { kra_id: null, name: '', kpis: [] }];
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }


  //
  // Function to remove KRA
  //
  function removeKRA(index) {
    kraList = kraList.filter((_, i) => i !== index);
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }

  //
  // Function to add KPI to KRA
  //
  function addKPI(kraIndex) {
    kraList = kraList.map((kra, i) =>
      i === kraIndex
        ? {
            ...kra,
            kpis: [...kra.kpis, {
              kpi_id: null,
              name: '',
              h1_weightage: 0, 
              h2_weightage: 0,
              ratingType: '',
              target: '',
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
  $: totalWeight = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.weightage || 0), 0), 0);

  
  //
  // Build Payload for API Call
  //
  function buildEditPayload() {
    return {  
      kra_list: kraList.map(kra => ({
        kra_id: kra.kra_id ?? null,
        name  : kra.name,
        kpis  : kra.kpis.map(kpi => ({
          kpi_id     : kpi.kpi_id ?? null,
          name       : kpi.name,
          h1_weightage: +kpi.h1_weightage,
          h2_weightage: +kpi.h2_weightage,
          ratingType : kpi.ratingType,
          target     : kpi.target,
          dataSource : kpi.dataSource
        }))
      })),
      edit_id: editId                    
    };
  }


  //
  // Function to Submit Updates to KRA and KPIs
  //
  async function submitKRAKPI() {

    // Data validation - Employee not selected
    formNotice = '';
    if (!selectedEmployee) {
      formNotice = 'Select an employee.';
      return;
    }

    const employeeCode = employeeDetails[selectedEmployee]?.Employee_Self_ID || '';
    if (!employeeCode) {
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
    const payload = buildEditPayload();

    try {
      const res = await fetch(API_PATHS.API_URL_Edit_KRA_KPI, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      console.log('raw ⇢', text);

      if (!text.trim()) {
        throw new Error("Empty response from server");
      }

      const result = JSON.parse(text);

      if (result.status === "success") {

        // Step 2: Check if employee has an In-Progress transaction
        const checkRes = await fetch(API_PATHS.API_URL_Check_Ongoing_Transaction, {
          method: 'POST',
          body: JSON.stringify({ employee_self_id: employeeCode })
        });

        const checkResult = await checkRes.json();

        // Step 3: If In-Progress transaction exists, sync new KPIs into it
        if (checkResult.status === "success" && checkResult.transaction_id) {

          const syncRes = await fetch(API_PATHS.API_URL_Sync_New_KRA_KPI_To_Transaction, {
            method: 'POST',
            body: JSON.stringify({
              transaction_id: checkResult.transaction_id,
              kra_detail_id: editId  // returned from Save_New_KRA_KPI_Master
            })
          });

          const syncResult = await syncRes.json();
          if (syncResult.status !== "success") {
            alert("Master saved but failed to sync to ongoing transaction: " + syncResult.message);
          }
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
      } else {
        alert("Error: " + result.message);
      }

    } catch (err) {
      console.error("Error while submitting:", err);
      alert("Failed to submit: " + err.message);
    }

    submitting = false;
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
  function handleBlur() {
    updateLiveDataStore();
  }

  let formNotice = '';
  $: h1Total = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.h1_weightage || 0), 0), 0);
  $: h2Total = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.h2_weightage || 0), 0), 0);

  //if status is in-progress donot allow user to delete any KRA or KPI 
  $: isInProgress = recordStatus === 'In-Progress';

</script>


 <!-- Header Section -->
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
  <div>
    <h1 class="text-xl font-semibold text-gray-800">KRA KPI : Edit Page</h1>
  </div>

  <div class="flex items-center gap-2">
    <button
      class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
      on:click={submitKRAKPI}
      disabled={h1Total !== 100 || h2Total !== 100 || !selectedEmployee}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
        Update
    </button>
    <button
      class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
      on:click={() => CancelButton()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
      Cancel
    </button>
  </div>
</div>

<!-- Employee Selection Card -->
<div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{selectedEmployee}</label>
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
                
                <!--H1 Weight -->
                <div class="w-1/12">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    bind:value={kpi.h1_weightage}
                    placeholder="H1 Weightage"
                    on:input={updateLiveDataStore}
                    disabled={isInProgress && !!kpi.kpi_id}
                    class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>

                <!--H2 Weight -->
                <div class="w-1/12">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    bind:value={kpi.h2_weightage}
                    placeholder="H2 Weightage"
                    on:input={updateLiveDataStore}
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
                  {#if !isInProgress || !kpi.kpi_id}
                    <button 
                      on:click={() => removeKPI(i, j)}
                      class="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- KRA Footer -->
      <div class="bg-gray-50 px-3 py-1 flex justify-end border-t border-gray-200">
        {#if !isInProgress || !kra.kra_id}
          <button 
            class="text-red-600 hover:text-red-800 text-s font-medium flex items-center gap-1"
            on:click={() => removeKRA(i)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Remove KRA
          </button>
        {/if}
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
</div>

{#if showSuccess}
  <div class="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-500 animate-fade-in-out">
    KRA-KPI data saved successfully!
  </div>
{/if}
