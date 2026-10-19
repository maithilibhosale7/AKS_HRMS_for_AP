<script>
  //
  // Importing necessary libraries
  //
  import { page, session } from '$app/stores';
  import { onMount } from 'svelte';
  import AutoResizeTextarea from '$lib/components/AutoResizeTextArea.svelte';
  import { API_PATHS } from '$lib/API_PATHS';

  //
  // LIVE DATA Initialization
  //
  import { Live_Data_Storage } from '../../stores/Live_Data_Storage';
  
  let Live_Data;

  $: {
    Live_Data = $Live_Data_Storage;
  }

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
  // Function to fetch KRA KPI Master Data and then converting it into KRA KPI Transaction Data
  //
  async function fetchData() {
    try {
      const res = await fetch(API_PATHS.API_URL_Get_KRA_KPI_Transaction_Data, {
        method: 'POST',
        body: JSON.stringify({
          id: systemId
        })
      });

      const result = await res.json();
      console.log("Trans Edit Result:", result);

      if (result.status === "success" && result.data) {
        const { employee_name, employee_code, employee_details, kra_list, final_remarks, Processing_Year } = result.data;

        selectedEmployee = employee_name;
        employeeDetails = {
          [employee_name]: employee_details
        };

        kraList = kra_list;
        finalRemarks = final_remarks;
        processingYear = Processing_Year;
      }
    } catch (err) {
      console.error("Failed to load edit data:", err);
    }
  }

  //
  // Loading Data from Live_Data.Execution_Information or initialize with DB Data
  //
  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    systemId = urlParams.get('id') ?? '';

    await fetchData(); 
  });

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
        const weight = Number(kpi.weightage);
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
          h1Sum += h1Avg * weight;
          h1TotalWeight += weight;
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
          h2Sum += h2Avg * weight;
          h2TotalWeight += weight;
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
          finalSum += final * weight;
          finalTotalWeight += weight;
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
  // Function to print the document
  //
  function printDocument() {
    window.print();
  }

  //
  // Cancel button function
  //
  function CancelButton() {
    const Cancel_Redirect_URL = Live_Data?.Page_Information?.PageURL;
    if (Cancel_Redirect_URL) {
      window.location.href = Cancel_Redirect_URL;
    }
  }
</script>

<!-- LOADER ICON / START - REMOVED PROJECT_THEME_SETTINGS REFERENCE -->
<div class="relative w-full h-full hidden" id="loader_block">  
  <div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
      <div class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse flex items-center justify-center">
        Loading...
      </div>
  </div>
</div>
<!-- LOADER ICON / END -->

<!-- Add print-specific wrapper -->
<div class="print-content">
  <div class="w-full p-6 bg-white shadow rounded-lg space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 no-print">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Performance Management System - Year 2025-2026</h1>
      </div>  
      <div class="flex items-center gap-2">
        <button
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          on:click={printDocument}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
          </svg>
          Print
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
          <h3 class="text-lg font-semibold mb-2">{employeeDetails[selectedEmployee]?.Employee_Name}</h3>
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
          <span class="text-sm text-gray-500">{processingYear}</span>
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
                    <th class="min-w-[200px] px-3 py-2 border">KPI</th>
                    <th class="min-w-[25px] px-3 py-2 border">Weightage (%)</th>
                    <th class="px-3 py-2 border" colspan="5">Rating Data</th>
                  </tr>
                </thead>
                <tbody>
                  {#each kra.kpis as kpi}
                    <tr class="bg-white hover:bg-gray-100">
                      <td class="min-w-[200px] px-3 py-2 border" rowspan="3">{kpi.name}</td>
                      <td class="min-w-[25px] px-3 py-2 border" rowspan="3">{kpi.weightage}</td>

                      <td class="min-w-[50px] px-3 py-2 border">APPRAISAL PERIOD: APR-SEP CYCLE</td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Self Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={kpi.H1_employee_actual}
                          class="w-full accent-green-500"
                          disabled={true}
                          />
                      </td>
                      <td class="min-w-[100px] px-3 py-2 border">
                        Self Remarks:
                        <AutoResizeTextarea
                          id={kpi.key}
                          name={kpi.key}
                          value={kpi.H1_employee_remarks}
                          placeholder="Enter value here"
                          className="min-h-[50px]"
                          disabled={true}
                        ></AutoResizeTextarea>
                      </td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Manager Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={kpi.H1_manager_actual}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                      </td>
                      <td class="min-w-[100px] px-3 py-2 border">
                        Manager Remarks:
                        <AutoResizeTextarea
                          id={kpi.key}
                          name={kpi.key}
                          value={kpi.H1_manager_remarks}
                          placeholder="Enter value here"
                          className="min-h-[50px]"
                          disabled={true}
                        />
                      </td>
                    </tr>
                    <tr class="bg-white hover:bg-gray-100">
                      <td class="min-w-[50px] px-3 py-2 border">APPRAISAL PERIOD: OCT-MAR CYCLE</td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Self Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={kpi.H2_employee_actual}
                          class="w-full accent-green-500"
                          disabled={true}
                          />
                      </td>
                      <td class="min-w-[100px] px-3 py-2 border">
                        Self Remarks:
                        <AutoResizeTextarea
                          id={kpi.key}
                          name={kpi.key}
                          value={kpi.H2_employee_remarks}
                          placeholder="Enter value here"
                          className="min-h-[50px]"
                          disabled={true}
                        ></AutoResizeTextarea>
                      </td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Manager Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={kpi.H2_manager_actual}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                      </td>
                      <td class="min-w-[100px] px-3 py-2 border">
                        Manager Remarks:
                        <AutoResizeTextarea
                          id={kpi.key}
                          name={kpi.key}
                          value={kpi.H2_manager_remarks}
                          placeholder="Enter value here"
                          className="min-h-[50px]"
                          disabled={true}
                        />
                      </td>
                    </tr>
                    <tr class="bg-white hover:bg-gray-100">
                      <td class="min-w-[50px] px-3 py-2 border">APPRAISAL PERIOD: APR-MAR CYCLE</td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Average Self Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual)}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                      </td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Average Manager Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual)}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                      </td>
                      <td class="min-w-[50px] px-3 py-2 border">
                        Final Manager Rating:
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.25"
                          value={kpi.HR_actual}
                          class="w-full accent-green-500"
                          disabled={true}
                        />
                      </td>
                      <td class="min-w-[100px] px-3 py-2 border">
                        Final Manager Remarks:
                        <AutoResizeTextarea
                          id={kpi.key}
                          name={kpi.key}
                          value={kpi.HR_remarks}
                          placeholder="Enter value here"
                          className="min-h-[50px]"
                          disabled={true}
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
        value={finalRemarks}
        label="Final Remarks"
        placeholder="Enter any concluding remarks here..."
        className="border border-gray-300 p-2 rounded-md"
        disabled={true}
      />
    </div>
  </div>
</div>

{#if showSuccess}
  <div class="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-500 animate-fade-in-out no-print">
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

  /* Print-specific styles */
  @media print {
    /* Hide navigation, sidebar, and other page elements */
    body * {
      visibility: hidden;
    }
    
    .print-content,
    .print-content * {
      visibility: visible;
    }
    
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0;
      margin: 0;
    }
    
    /* Hide action buttons and other non-essential elements */
    .no-print {
      display: none !important;
    }
    
    /* Ensure proper page breaks */
    .border {
      border: 1px solid #000 !important;
    }
    
    table {
      page-break-inside: auto;
    }
    
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    thead {
      display: table-header-group;
    }
    
    /* Improve print appearance */
    .bg-gray-100 {
      background-color: #f3f4f6 !important;
      -webkit-print-color-adjust: exact;
    }
    
    .bg-gray-200 {
      background-color: #e5e7eb !important;
      -webkit-print-color-adjust: exact;
    }
    
    .bg-gray-50 {
      background-color: #f9fafb !important;
      -webkit-print-color-adjust: exact;
    }
    
    .text-blue-700 {
      color: #1d4ed8 !important;
      -webkit-print-color-adjust: exact;
    }
    
    /* Remove shadows and padding for print */
    .shadow,
    .shadow-sm,
    .shadow-lg {
      box-shadow: none !important;
    }
    
    .p-6 {
      padding: 0 !important;
    }
    
    .rounded-lg {
      border-radius: 0 !important;
    }
  }

  .no-print {
    /* This class is used for elements that should not appear in print */
  }
</style>