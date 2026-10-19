<script>
  //
  // Importing necessary libraries
  //
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import AutoResizeTextarea from '$lib/Components/AutoResizeTextArea.svelte';
  import { API_PATHS } from '$lib/API_PATHS';

import Pms_Rating_Form from '$lib/components/AKS_HRMS_Components/PMS/Pms_Rating_Form.svelte';

  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

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

    if (!systemId) {
      goto('/KRA_KPI_Transaction');
      return;
    }

    Live_Data.Execution_Information = {};
    Live_Data_Storage.set({ ...Live_Data });

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

    updateLiveDataStore();

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
  function handleBlur() {
    updateLiveDataStore();
    if (kraList.length) {
      const result = calculateRatings(kraList);
      h1Rating = result.h1Rating;
      h2Rating = result.h2Rating;
      finalRating = result.finalRating;
    }
  }

</script>
 
<svelte:head>
  <title>Enter Rating | AKS HRMS</title>
</svelte:head>

<Pms_Rating_Form
  bind:kraList
  bind:finalRemarks
  {selectedEmployee}
  {employeeDetails}
  {processingYear}
  {h1Rating}
  {h2Rating}
  {finalRating}
  onSave={submitKRAData}
  onCancel={CancelButton}
  onChange={handleBlur}
/>

{#if showSuccess}
  <div class="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
    KRA-KPI data saved successfully!
  </div>
{/if}
  