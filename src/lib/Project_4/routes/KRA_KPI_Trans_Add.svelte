<script>
  //
  // Importing necessary libraries
  //
  import { page, session } from '$app/stores';
  import { onMount } from 'svelte';
  import AutoResizeTextarea from '$lib/components/AutoResizeTextArea.svelte';
  import { API_PATHS } from '../lib/API_PATHS';
  import { Live_Data_Storage } from '../stores/Live_Data_Storage';

  //
  // Importing Project Theme Settings
  //
  import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';

  //
  // Initializing Primary Variables
  //
  let systemId = '';
  let finalRemarks = '';
  let kraList = [];
  let selectedEmployee = '';
  let employeeDetails = {};
  let processingYear = "";

  let h1Rating = "N/A";
  let h2Rating = "N/A";
  let finalRating = "N/A";
  
  let showSuccess = false;


  //
  // Checking Session Data for User Validation
  //
  console.log("Session Data: ", $session);


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
    Live_Data.Execution_Information.employeeDetails = employeeDetails;
    Live_Data.Execution_Information.kraList = kraList;
    Live_Data.Execution_Information.finalRemarks = finalRemarks;
    Live_Data.Execution_Information.Processing_Year = processingYear;

    Live_Data_Storage.set(Live_Data);
  }

  //
  // Function to fetch KRA KPI Master Data and then converting it into KRA KPI Transaction Data
  //
  async function fetchKRADataById() {
    try {
      const res = await fetch(API_PATHS.API_URL_Get_KRA_KPI_Master_Data, {
        method: 'POST',
        body: JSON.stringify({
          id: systemId
        })
      });

      const rawText = await res.text();
      if (!rawText) {
        console.error("Empty response body from API");
        return;
      }

      const response = JSON.parse(rawText);
      if (response.status === 'success' && response.data) {
        const { employee_name, employee_code, employee_details, kra_list, Processing_Year } = response.data;

        selectedEmployee = employee_name;
        employeeDetails = {
          [employee_name]: employee_details
        };

        kraList = kra_list;
        processingYear = Processing_Year;

        updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
        console.log('KRA Data (processed):', { selectedEmployee, kraList });
      } else {
        console.error("API returned error:", response.message);
      }

    } catch (err) {
      console.error("Fetch failed:", err);
    }
  }

  // Field Activation Variables
  let isH1SelfRatingPeriod = true;
  let isH1ManagerRatingPeriod = true;
  let isH2SelfRatingPeriod = true;
  let isH2ManagerRatingPeriod = true;
  let isFinalRatingPeriod = true;

  //
  // Loading Data from Live_Data.Execution_Information or initialize with DB Data
  //
  onMount(async () => {
    
    // Setup systemId from URL
    const urlParams = new URLSearchParams(window.location.search);
    systemId = urlParams.get('id') ?? '';

    if (Live_Data.Execution_Information && Object.keys(Live_Data.Execution_Information).length === 0) {

      await fetchKRADataById();

      kraList = kraList.map(kra => ({
        ...kra,
        kpis: kra.kpis.map(kpi => ({
          ...kpi,
          H1_employee_actual: '',
          H1_manager_actual: '',
          H2_employee_actual: '',
          H2_manager_actual: '',
          HR_actual: '',
          H1_employee_remarks: '',
          H1_manager_remarks: '',
          H2_employee_remarks: '',
          H2_manager_remarks: '',
          HR_remarks: ''
        }))
      }));

      updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
    } else {
      selectedEmployee = $Live_Data_Storage.Execution_Information.selectedEmployee || '';
      employeeDetails = Live_Data.Execution_Information.employeeDetails || {};
      kraList = $Live_Data_Storage.Execution_Information.kraList || [];
      finalRemarks = $Live_Data_Storage.Execution_Information.finalRemarks || '';
      processingYear = Live_Data.Execution_Information.Processing_Year || '';
    }

    // // Determine which rating periods are active based on user role and date
    // const isSelf = Live_Data.User_Information.Employee_Self_ID === Employee_Code_ID;

    // if (isSelf) {
      
    //   isH1SelfRatingPeriod = ((currentMonth === 10 && currentDate >= 15 && currentDate <= 31) || (currentMonth === 11 && currentDate >= 1 && currentDate <= 31));
    //   isH2SelfRatingPeriod = (currentMonth === 4 && currentDate >= 1 && currentDate <= 31);

    //   if (
    //     // Iqbalbhai
    //     Live_Data.User_Information.Employee_Self_ID == '2'
      
    //     // // Rajesh Ji
    //     // Live_Data.User_Information.Employee_Self_ID == '34' || 

    //     // // Accounts
    //     // Live_Data.User_Information.Employee_Self_ID == '15' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '16' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '17' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '18' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '19' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '20' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '21' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '22' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '23'
    //   ) {
    //     isH1SelfRatingPeriod = true
    //   }

    // } else {
      
    //   isH1ManagerRatingPeriod = ((currentMonth === 10 && currentDate >= 15 && currentDate <= 31) || (currentMonth === 11 && currentDate >= 1 && currentDate <= 31));

    //   if (
    //     // Iqbalbhai
    //     Live_Data.User_Information.Employee_Self_ID == '2'
      
    //     // // Rajesh Ji
    //     // Live_Data.User_Information.Employee_Self_ID == '34' || 

    //     // // Accounts
    //     // Live_Data.User_Information.Employee_Self_ID == '15' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '16' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '17' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '18' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '19' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '20' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '21' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '22' ||
    //     // Live_Data.User_Information.Employee_Self_ID == '23'
    //   ) {
    //     isH1ManagerRatingPeriod = true
    //   }

    //   isH2ManagerRatingPeriod = (currentMonth === 4 && currentDate >= 1 && currentDate <= 31);
    //   isFinalRatingPeriod = (currentMonth === 5 && currentDate >= 1 && currentDate <= 31);

    // }
  });

  //
  // Build Payload for API Call
  //
  function preparePayload() {
    const kpiList = [];

    kraList.forEach(kra => {
      kra.kpis.forEach(kpi => {
        kpiList.push({
          KRA_ID: kra.KRA_ID,
          KPI_ID: kpi.kpiID,
          KPI_Name: kpi.name,
          Target: kpi.target ?? '',

          H1_employee_actual: kpi.H1_employee_actual,
          H1_manager_actual: kpi.H1_manager_actual,
          H2_employee_actual: kpi.H2_employee_actual,
          H2_manager_actual: kpi.H2_manager_actual,
          HR_actual: kpi.HR_actual,
          H1_employee_remarks: kpi.H1_employee_remarks ?? '',
          H1_manager_remarks: kpi.H1_manager_remarks ?? '',
          H2_employee_remarks: kpi.H2_employee_remarks ?? '',
          H2_manager_remarks: kpi.H2_manager_remarks ?? '',
          HR_remarks: kpi.HR_remarks ?? ''
        });
      });
    });

    return {
      Employee_KRA_KPI_Details_ID: systemId,
      Final_Remarks: finalRemarks,
      KRA_KPI_List: kpiList
    };
  }

  
  //
  // Function to Submit New KRA KPI Transaction
  //
  async function submitKRAData() {
    try {
      const payload = preparePayload();
      console.log("Submitting Payload:", payload); 
      // return;

      const response = await fetch(API_PATHS.API_URL_Save_KRA_KPI_Transaction, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      console.log("API Response:", result);

      if (result.status === "success") {
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
      console.error("Submit error:", err);
      alert("Error during submission.");
    }
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
  // Function to get average rating
  //
  function getAverageRating(H1_Rating, H2_Rating) {
    if (H1_Rating == 0 || H2_Rating == 0) {
      return H1_Rating + H2_Rating;
    } else {
      return Math.round(((H1_Rating + H2_Rating) / 2) * 4) / 4;
    }
  }

  //
  // Get final Ratings
  //
  function calculateRatings(kraList) {
    let h1Sum = 0, h1TotalWeight = 0;
    let h2Sum = 0, h2TotalWeight = 0;
    let finalSum = 0, finalTotalWeight = 0;

    for (const kra of kraList) {
      for (const kpi of kra.kpis) {
        const h1Weight = Number(kpi.h1_weightage || 0);
        const h2Weight = Number(kpi.h2_weightage || 0);
        const finalWeight = h1Weight + h2Weight;
        const target = Number(kpi.target);
        const ratingType = kpi.ratingType;
        const isPercentage = ratingType.toLowerCase().includes('percent') || ratingType.toLowerCase().includes('value');

        // ----- H1 Rating -----
        let h1Ratings = [kpi.H1_employee_actual, kpi.H1_manager_actual]
          .map(val => val === "" || val === null ? null : Number(val))
          .filter(val => typeof val === 'number' && !isNaN(val));

        if (h1Ratings.length > 0) {
          let h1Avg = h1Ratings.reduce((a, b) => a + b, 0) / h1Ratings.length;
          if (isPercentage && target > 0) {
            h1Avg = convertTo5PointScale(h1Avg, target);
          }
          h1Sum += h1Avg * h1Weight;        // CHANGED: was weight
          h1TotalWeight += h1Weight;         // CHANGED: was weight
        }

        // ----- H2 Rating -----
        let h2Ratings = [kpi.H2_employee_actual, kpi.H2_manager_actual]
          .map(val => val === "" || val === null ? null : Number(val))
          .filter(val => typeof val === 'number' && !isNaN(val));

        if (h2Ratings.length > 0) {
          let h2Avg = h2Ratings.reduce((a, b) => a + b, 0) / h2Ratings.length;
          if (isPercentage && target > 0) {
            h2Avg = convertTo5PointScale(h2Avg, target);
          }
          h2Sum += h2Avg * h2Weight;        
          h2TotalWeight += h2Weight;        
        }

        // ----- Final Rating -----
        let final = null;
        if (kpi.HR_actual !== "" && kpi.HR_actual !== null && !isNaN(Number(kpi.HR_actual))) {
          final = Number(kpi.HR_actual);
          if (isPercentage && target > 0) {
            final = convertTo5PointScale(final, target);
          }
        } else {
          // Use all 4 actuals
          let allRatings = [
            kpi.H1_employee_actual, kpi.H1_manager_actual,
            kpi.H2_employee_actual, kpi.H2_manager_actual
          ].map(val => val === "" || val === null ? null : Number(val))
          .filter(val => typeof val === 'number' && !isNaN(val));

          if (allRatings.length > 0) {
            final = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
            if (isPercentage && target > 0) {
              final = convertTo5PointScale(final, target);
            }
          }
        }

        if (final !== null) {
          finalSum += final * finalWeight;   
          finalTotalWeight += finalWeight;  
        }
      }
    }

    const h1Rating = h1TotalWeight > 0 ? (h1Sum / h1TotalWeight).toFixed(2) : "N/A";
    const h2Rating = h2TotalWeight > 0 ? (h2Sum / h2TotalWeight).toFixed(2) : "N/A";
    const finalRating = finalTotalWeight > 0 ? (finalSum / finalTotalWeight).toFixed(2) : "N/A";

    console.log(h1Rating, h2Rating, finalRating);

    return { h1Rating, h2Rating, finalRating };
  }

  //
  // Convert Percentage/Value to 5-point scale
  //
  function convertTo5PointScale(actual, target) {
    const percentage = (actual / target) * 100;

    if (percentage < 25) return 1;
    if (percentage < 50) return 2;
    if (percentage < 75) return 3;
    if (percentage < 100) return 4;
    return 5;
  }

  //
  // Update Final Ratings
  //
  $: if (kraList.length) {
    // Update Ratings
    const result = calculateRatings(kraList);
    h1Rating = result.h1Rating;
    h2Rating = result.h2Rating;
    finalRating = result.finalRating;
  }

  //
  // Function for AutoResizeTextArea
  //
  function handleBlur(event) {
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
    // const key = event.detail.name;
    // APUICall([key]);
  }

</script>
 
<div class="w-full p-6 bg-white shadow rounded-lg space-y-6">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Performance Management System - Year 2025-2026</h1>
    </div>  
    <div class="flex items-center gap-2">
      <button
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        on:click={submitKRAData}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Submit
      </button>

      <button
        class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
        on:click={CancelButton}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        Cancel
      </button>
    </div>
  </div>
  
  <!-- Employee Details -->
  {#if selectedEmployee}
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <!-- Employee Details -->
      <div class="bg-gray-100 p-4 rounded md:w-1/2">
        <h3 class="text-lg font-semibold mb-2">Employee Details</h3>
        <p><strong>Employee Code:</strong> {employeeDetails[selectedEmployee]?.Employee_Code}</p>
        <p><strong>Designation:</strong> {employeeDetails[selectedEmployee]?.Designation}</p>
        <p><strong>Department:</strong> {employeeDetails[selectedEmployee]?.Department}</p>
        <p><strong>DOJ:</strong> {employeeDetails[selectedEmployee]?.DOJ}</p>
        <p><strong>Tenure:</strong> {employeeDetails[selectedEmployee]?.Tenure}</p>
        <p><strong>Last Increment Date:</strong> {employeeDetails[selectedEmployee]?.Last_Increment_Date}</p>
      </div>
    
      <!-- Ratings Table -->
      <div class="bg-white p-4 rounded shadow md:w-1/2">
        <h3 class="text-lg font-semibold mb-2">Appraisal Ratings</h3>
        <table class="w-full text-sm text-left text-gray-700 border">
          <thead class="bg-gray-200 text-xs uppercase">
            <tr>
              <th class="px-4 py-2 border">Appraisal Period</th>
              <th class="px-4 py-2 border">Cumulative Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="px-4 py-2 border">APR-SEP</td>
              <td class="px-4 py-2 border text-blue-700">{h1Rating}</td>
            </tr>
            <tr class="border-b">
              <td class="px-4 py-2 border">OCT-MAR</td>
              <td class="px-4 py-2 border text-blue-700">{h2Rating}</td>
            </tr>
            <tr>
              <td class="px-4 py-2 border">APR-MAR</td>
              <td class="px-4 py-2 border text-blue-700">{finalRating}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  {/if}

  <!-- PMS Period Section -->
  <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-sm font-medium text-gray-700">PMS Period</div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">{processingYear}</span> <!-- Dynamically display the processing year -->
      </div>
    </div>
  </div>
  
  <!-- KRA Table -->
  <div class="w-full space-y-6">
    {#each kraList as kra, i}
      <div class="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
        <h4 class="text-xl font-bold text-blue-700 mb-2">KRA {i + 1}: {kra.name}</h4>
        <div class="w-full overflow-x-auto">
          <div class="min-w-[1200px]">
            <table class="w-full text-sm text-left text-gray-700 border">
              <thead class="bg-gray-200 text-gray-900">
                <tr>
                  <th class="min-w-[250px]"></th>
                  <th class="min-w-[100px]"></th>
                  <th class="min-w-[700px] text-center px-3 py-2 border" colspan=4>APPRAISAL PERIOD: APR-SEP CYCLE</th>
                  <th class="min-w-[700px] text-center px-3 py-2 border" colspan=4>APPRAISAL PERIOD: OCT-MAR CYCLE</th>
                  <th class="min-w-[350px] text-center px-3 py-2 border" colspan=4>APPRAISAL PERIOD: APR-MAR CYCLE</th>
                </tr>
                <tr>
                  <th class="min-w-[250px] px-3 py-2 border">KPI</th>
                  <th class="min-w-[100px] px-3 py-2 border">Weightage (%)</th>
                  
                  <th class="min-w-[100px] px-3 py-2 border">Self Rating</th>
                  <th class="min-w-[250px] px-3 py-2 border">Self Remarks</th>
                  <th class="min-w-[100px] px-3 py-2 border">Manager Rating</th>
                  <th class="min-w-[250px] px-3 py-2 border">Manager Remarks</th>

                  <th class="min-w-[100px] px-3 py-2 border">Self Rating</th>
                  <th class="min-w-[250px] px-3 py-2 border">Self Remarks</th>
                  <th class="min-w-[100px] px-3 py-2 border">Manager Rating</th>
                  <th class="min-w-[250px] px-3 py-2 border">Manager Remarks</th>
                  
                  <th class="min-w-[100px] px-3 py-2 border">Average Self Rating</th>
                  <th class="min-w-[100px] px-3 py-2 border">Average Manager Rating</th>
                  
                  <th class="min-w-[100px] px-3 py-2 border">Final Manager Rating</th>
                  <th class="min-w-[250px] px-3 py-2 border">Final Manager Remarks</th>
                </tr>
              </thead>
              <tbody>
                {#each kra.kpis as kpi}
                  <tr class="bg-white hover:bg-gray-100">
                    <td class="min-w-[250px] px-3 py-2 border">{kpi.name}</td>
                    <td class="min-w-[100px] px-3 py-2 border">H1: {kpi.h1_weightage}% / H2: {kpi.h2_weightage}%</td>

                    <!-- H1 Employee -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          bind:value={kpi.H1_employee_actual}
                          on:change={handleBlur}
                          class="w-full accent-green-500"
                          disabled={!isH1SelfRatingPeriod || kpi.h1_weightage == 0}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            bind:value={kpi.H1_employee_actual}
                            on:change={handleBlur}
                            min="1" max="5" step="0.25"
                            disabled={!isH1SelfRatingPeriod || kpi.h1_weightage == 0}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>
                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            bind:value={kpi.H1_employee_actual}
                            on:change={handleBlur}
                            placeholder={kpi.ratingType === 'Percentage' ? '%' : 'value'}
                            class="w-full border rounded-md px-2 py-1 text-sm w-20"
                            disabled={!isH1SelfRatingPeriod || kpi.h1_weightage == 0}
                          />
                          {#if kpi.target}
                            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                              / {kpi.target}
                            </span>
                          {/if}
                        </div>
                      {/if}
                    </td>                  
                    <td class="min-w-[250px] px-3 py-2 border">
                      <AutoResizeTextarea
                        id={kpi.key}
                        name={kpi.key}
                        bind:value={kpi.H1_employee_remarks}
                        placeholder="Enter value here"
                        className="min-h-[50px]"
                        disabled={!isH1SelfRatingPeriod || kpi.h1_weightage == 0}
                        on:blur={handleBlur}
                      />
                    </td>
                    <!-- H1 Manager -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          bind:value={kpi.H1_manager_actual}
                          on:change={handleBlur}
                          class="w-full accent-green-500"
                          disabled={!isH1ManagerRatingPeriod || kpi.h1_weightage == 0}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            bind:value={kpi.H1_manager_actual}
                            on:change={handleBlur}
                            min="1" max="5" step="0.25"
                            disabled={!isH1ManagerRatingPeriod || kpi.h1_weightage == 0}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>
                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              bind:value={kpi.H1_manager_actual}
                              on:change={handleBlur}
                              placeholder={kpi.ratingType === 'Percentage' ? ' %' : 'value'}
                              class="w-full border rounded-md px-2 py-1 text-sm w-20"
                              disabled={!isH1ManagerRatingPeriod || kpi.h1_weightage == 0}
                            />
                            {#if kpi.target}
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {kpi.target}
                              </span>
                            {/if}
                          </div>
                      {/if}
                    </td>                  
                    <td class="min-w-[250px] px-3 py-2 border">
                      <AutoResizeTextarea
                        id={kpi.key}
                        name={kpi.key}
                        bind:value={kpi.H1_manager_remarks}
                        placeholder="Enter value here"
                        className="min-h-[50px]"
                        disabled={!isH1ManagerRatingPeriod || kpi.h1_weightage == 0}
                        on:blur={handleBlur}
                      />
                    </td>
                    <!-- H2 Employee -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          bind:value={kpi.H2_employee_actual}
                          on:change={handleBlur}
                          class="w-full accent-green-500"
                          disabled={!isH2SelfRatingPeriod || kpi.h2_weightage == 0}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            bind:value={kpi.H2_employee_actual}
                            on:change={handleBlur}
                            min="1" max="5" step="0.25"
                            disabled={!isH2SelfRatingPeriod || kpi.h2_weightage == 0}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>
                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              bind:value={kpi.H2_employee_actual}
                              on:change={handleBlur}
                              placeholder={kpi.ratingType === 'Percentage' ? ' %' : 'value'}
                              class="w-full border rounded-md px-2 py-1 text-sm w-20"
                              disabled={!isH2SelfRatingPeriod || kpi.h2_weightage == 0}
                            />
                            {#if kpi.target}
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {kpi.target}
                              </span>
                            {/if}
                          </div>
                      {/if}
                    </td>                  
                    <td class="min-w-[250px] px-3 py-2 border">
                      <AutoResizeTextarea
                        id={kpi.key}
                        name={kpi.key}
                        bind:value={kpi.H2_employee_remarks}
                        placeholder="Enter value here"
                        className="min-h-[50px]"
                        disabled={!isH2SelfRatingPeriod || kpi.h2_weightage == 0}
                        on:blur={handleBlur}
                      />
                    </td>
                    <!-- H2 Manager -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          bind:value={kpi.H2_manager_actual}
                          on:change={handleBlur}
                          class="w-full accent-green-500"
                          disabled={!isH2ManagerRatingPeriod || kpi.h2_weightage == 0}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            bind:value={kpi.H2_manager_actual}
                            on:change={handleBlur}
                            min="1" max="5" step="0.25"
                            disabled={!isH2ManagerRatingPeriod || kpi.h2_weightage == 0}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>
                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              bind:value={kpi.H2_manager_actual}
                              on:change={handleBlur}
                              placeholder={kpi.ratingType === 'Percentage' ? ' %' : 'value'}
                              class="w-full border rounded-md px-2 py-1 text-sm w-20"
                              disabled={!isH2ManagerRatingPeriod || kpi.h2_weightage == 0}
                            />
                            {#if kpi.target}
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {kpi.target}
                              </span>
                            {/if}
                          </div>
                      {/if}
                    </td>           
                    <td class="min-w-[250px] px-3 py-2 border">
                      <AutoResizeTextarea
                        id={kpi.key}
                        name={kpi.key}
                        bind:value={kpi.H2_manager_remarks}
                        placeholder="Enter value here"
                        className="min-h-[50px]"
                        disabled={!isH2ManagerRatingPeriod || kpi.h2_weightage == 0}
                        on:blur={handleBlur}
                      />
                    </td>
                    
                    <!-- Average Self Rating -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          value={getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual)}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            value={getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual)}
                            min="1" max="5" step="0.25"
                            disabled={true}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>
                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual)}
                              placeholder={kpi.ratingType === 'Percentage' ? ' %' : 'value'}
                              class="w-full border rounded-md px-2 py-1 text-sm w-20"
                              disabled={true}
                            />
                            {#if kpi.target}
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {kpi.target}
                              </span>
                            {/if}
                          </div>
                      {/if}
                    </td>

                    <!-- Average Manager Rating -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          value={getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual)}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            value={getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual)}
                            min="1" max="5" step="0.25"
                            disabled={true}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>

                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual)}
                              placeholder={kpi.ratingType === 'Percentage' ? ' %' : 'value'}
                              class="w-full border rounded-md px-2 py-1 text-sm w-20"
                              disabled={true}
                            />
                            {#if kpi.target}
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {kpi.target}
                              </span>
                            {/if}
                          </div>
                      {/if}
                    </td>                  
                    
                    <!-- HR -->
                    <td class="min-w-[100px] px-3 py-2 border">
                      {#if kpi.ratingType === 'Rating' || kpi.ratingType === '1-5 Scale'}
                        <!-- Rating scale (1–5) -->
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.25"
                          bind:value={kpi.HR_actual}
                          on:change={handleBlur}
                          class="w-full accent-green-500"
                          disabled={!isFinalRatingPeriod}
                        />
                        <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                        <div class="relative">
                          <input
                            type="number"
                            bind:value={kpi.HR_actual}
                            on:change={handleBlur}
                            min="1" max="5" step="0.25"
                            disabled={!isFinalRatingPeriod}
                            class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                            /5
                          </span>
                        </div>
                        
                      {:else if kpi.ratingType === 'Percentage' || kpi.ratingType === 'Value'}
                        <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              bind:value={kpi.HR_actual}
                              on:change={handleBlur}
                              placeholder={kpi.ratingType === 'Percentage' ? ' %' : 'value'}
                              class="w-full border rounded-md px-2 py-1 text-sm w-20"
                              disabled={!isFinalRatingPeriod}
                            />
                            {#if kpi.target}
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                / {kpi.target}
                              </span>
                            {/if}
                          </div>
                      {/if}
                    </td> 
                    <td class="min-w-[250px] px-3 py-2 border">
                      <AutoResizeTextarea
                        id={kpi.key}
                        name={kpi.key}
                        bind:value={kpi.HR_remarks}
                        placeholder="Enter value here"
                        className="min-h-[50px]"
                        disabled={!isFinalRatingPeriod}
                        on:blur={handleBlur}
                      />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
    <!-- Final Remarks & Total Rating -->
    <div class="bg-gray-100 p-4 rounded-lg border border-gray-300 mt-6">
      <AutoResizeTextarea
        id="finalRemarks"
        name="finalRemarks"
        bind:value={finalRemarks}
        label="Final Remarks"
        placeholder="Enter any concluding remarks here..."
        className="border border-gray-300 p-2 rounded-md"
        on:blur={handleBlur}
      />
    </div>
  </div>

{#if showSuccess}
  <div class="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-500 animate-fade-in-out">
    KRA-KPI data saved successfully!
  </div>
{/if}

<style>
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>

  