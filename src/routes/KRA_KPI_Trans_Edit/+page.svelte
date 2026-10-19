<script>
  //
  // Importing necessary libraries
  //
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import AutoResizeTextarea from '$lib/components/AutoResizeTextArea.svelte';
  import { API_PATHS } from '$lib/API_PATHS';

import Pms_Rating_Form from '$lib/components/AKS_HRMS_Components/PMS/Pms_Rating_Form.svelte';

  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

  //
  // Importing Project Theme Settings
  //
  import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';

  let systemId = '';
  let finalRemarks = '';
  let kraList = [];
  let selectedEmployee = '';
  let employeeDetails = {};
  let processingYear = "";
  let Employee_Code_ID = "";

  let h1Rating = "N/A";
  let h2Rating = "N/A";
  let finalRating = "N/A";

  let showSuccess = false;
  let showValidationModal = false;
  let validationErrors = [];
  let firstInvalidField = null;

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
    Live_Data.Execution_Information.Employee_Code_ID = Employee_Code_ID;

    Live_Data_Storage.set(Live_Data);
  }


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

        Employee_Code_ID = employee_code;
        selectedEmployee = employee_name;
        employeeDetails = {
          [employee_name]: employee_details
        };

        kraList = kra_list;
        finalRemarks = final_remarks;
        processingYear = Processing_Year;

        updateLiveDataStore();
      }

    } catch (err) {
      console.error("Failed to load edit data:", err);
    }
  }

  // Field Activation Variables
  let isH1SelfRatingPeriod = false;
  let isH1ManagerRatingPeriod = false;
  let isH2SelfRatingPeriod = false;
  let isH2ManagerRatingPeriod = false;
  let isFinalRatingPeriod = false;

  //
  // Loading Data from Live_Data.Execution_Information or initialize with DB Data
  //
  onMount(async () => {

    const urlParams = new URLSearchParams(window.location.search);
    systemId = urlParams.get('id') ?? '';

    Live_Data.Execution_Information = {};
    Live_Data_Storage.set({ ...Live_Data });

    if (systemId) {
      if (!kraList.length && systemId) {
        await fetchData(); 
      }
    } else {
      selectedEmployee = $Live_Data_Storage.Execution_Information.selectedEmployee || '';
      employeeDetails = Live_Data.Execution_Information.employeeDetails || {};
      kraList = $Live_Data_Storage.Execution_Information.kraList || [];
      finalRemarks = $Live_Data_Storage.Execution_Information.finalRemarks || '';
      processingYear = Live_Data.Execution_Information.Processing_Year || '';
      Employee_Code_ID = Live_Data.Execution_Information.Employee_Code_ID || '';
    }

    // Determine which rating periods are active based on user role and date
    const isSelf = Live_Data.User_Information.Employee_Self_ID === Employee_Code_ID;

    if (isSelf) {
      
      isH1SelfRatingPeriod = ((currentMonth === 10 && currentDate >= 15 && currentDate <= 31) || (currentMonth === 11 && currentDate >= 1 && currentDate <= 31));
      isH2SelfRatingPeriod = (currentMonth === 4 && currentDate >= 1 && currentDate <= 31);

      if (
        // Iqbalbhai
        Live_Data.User_Information.Employee_Self_ID == '2'
      
        // // Rajesh Ji
        // Live_Data.User_Information.Employee_Self_ID == '34' || 

        // // Accounts
        // Live_Data.User_Information.Employee_Self_ID == '15' ||
        // Live_Data.User_Information.Employee_Self_ID == '16' ||
        // Live_Data.User_Information.Employee_Self_ID == '17' ||
        // Live_Data.User_Information.Employee_Self_ID == '18' ||
        // Live_Data.User_Information.Employee_Self_ID == '19' ||
        // Live_Data.User_Information.Employee_Self_ID == '20' ||
        // Live_Data.User_Information.Employee_Self_ID == '21' ||
        // Live_Data.User_Information.Employee_Self_ID == '22' ||
        // Live_Data.User_Information.Employee_Self_ID == '23'
      ) {
        isH1SelfRatingPeriod = true
      }

    } else {
      
      isH1ManagerRatingPeriod = ((currentMonth === 10 && currentDate >= 15 && currentDate <= 31) || (currentMonth === 11 && currentDate >= 1 && currentDate <= 31));

      if (
        // Iqbalbhai
        Live_Data.User_Information.Employee_Self_ID == '2'
      
        // // Rajesh Ji
        // Live_Data.User_Information.Employee_Self_ID == '34' || 

        // // Accounts
        // Live_Data.User_Information.Employee_Self_ID == '15' ||
        // Live_Data.User_Information.Employee_Self_ID == '16' ||
        // Live_Data.User_Information.Employee_Self_ID == '17' ||
        // Live_Data.User_Information.Employee_Self_ID == '18' ||
        // Live_Data.User_Information.Employee_Self_ID == '19' ||
        // Live_Data.User_Information.Employee_Self_ID == '20' ||
        // Live_Data.User_Information.Employee_Self_ID == '21' ||
        // Live_Data.User_Information.Employee_Self_ID == '22' ||
        // Live_Data.User_Information.Employee_Self_ID == '23'
      ) {
        isH1ManagerRatingPeriod = true
      }

      isH2ManagerRatingPeriod = (currentMonth === 4 && currentDate >= 1 && currentDate <= 31);
      isFinalRatingPeriod = (currentMonth === 5 && currentDate >= 1 && currentDate <= 31);

    }
  });
  

  //
  // Build Payload for API Call
  //
  function preparePayload() {
    const kpiList = [];

    kraList.forEach(kra => {
      kra.kpis.forEach(kpi => {
        kpiList.push({
          KRA_Transaction_ID: kra.KRA_Transaction_ID,
          KPI_Transaction_ID: kpi.KPI_Transaction_ID,
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
      Employee_KRA_KPI_Transaction_ID: systemId,
      Final_Remarks: finalRemarks,
      KRA_KPI_List: kpiList
    };
  }


  //
  // Function to validate required fields and collect errors
  //
  function validateRequiredFields() {
    validationErrors = [];
    firstInvalidField = null;

    // Check all required input fields
    const requiredFields = document.querySelectorAll('[required]');
    
    // If no fields are required due to period restrictions, make finalRemarks required for testing
    if (requiredFields.length === 0) {
      const finalRemarksField = document.getElementById('finalRemarks') || document.querySelector('textarea[name="finalRemarks"]');
      if (finalRemarksField && (!finalRemarks || finalRemarks.trim() === '')) {
        let fieldInfo = getFieldInfo(finalRemarksField);
        validationErrors.push(fieldInfo);
      }
    }
    
    for (const field of requiredFields) {
      if (!field.disabled && (!field.value || field.value.trim() === '')) {
        // Skip span elements and other non-input elements
        if (field.tagName.toLowerCase() === 'span' || field.tagName.toLowerCase() === 'div') {
          continue;
        }
        
        // Get field context for better error reporting
        let fieldInfo = getFieldInfo(field);
        validationErrors.push(fieldInfo);
        
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    }

    // If there are validation errors, highlight all missing fields immediately
    if (validationErrors.length > 0) {
      highlightAllMissingFields();
    }

    return validationErrors.length === 0;
  }

  //
  // Function to get contextual information about a field
  //
  function getFieldInfo(field) {
    // Find the closest table row or container
    const row = field.closest('tr');
    const kraContainer = field.closest('.border.border-gray-300.rounded-lg');
    
    let fieldType = 'Field';
    let context = '';

    if (row && kraContainer) {
      // Get KRA name from the container
      const kraHeader = kraContainer.querySelector('h4');
      const kraName = kraHeader ? kraHeader.textContent.trim() : 'Unknown KRA';
      
      // Get KPI name from the row
      const kpiCell = row.querySelector('td:first-child');
      const kpiName = kpiCell ? kpiCell.textContent.trim() : 'Unknown KPI';
      
      // Determine field type based on position in row
      const cellIndex = Array.from(row.cells).indexOf(field.closest('td'));
      const fieldTypes = [
        '', 'Weightage', 
        'H1 Self Rating', 'H1 Self Remarks', 'H1 Manager Rating', 'H1 Manager Remarks',
        'H2 Self Rating', 'H2 Self Remarks', 'H2 Manager Rating', 'H2 Manager Remarks',
        'Average Self Rating', 'Average Manager Rating', 'Final Manager Rating', 'Final Manager Remarks'
      ];
      
      fieldType = fieldTypes[cellIndex] || 'Field';
      context = `${kraName} - ${kpiName}`;
    } else if (field.id === 'finalRemarks' || field.name === 'finalRemarks' || field.closest('#finalRemarks')) {
      fieldType = 'Final Remarks';
      context = 'Bottom of form';
    }

    return {
      element: field,
      type: fieldType,
      context: context,
      label: `${fieldType}${context ? ` in ${context}` : ''}`
    };
  }

  //
  // Function to scroll to unfilled field
  //
  function scrollToField(field) {
    if (field && field.element) {
      field.element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
      
      setTimeout(() => {
        field.element.focus();
        highlightAllMissingFields();
      }, 500);
    }
  }

  //
  // Function to highlight all missing fields
  //
  function highlightAllMissingFields() {
    
    // Highlight all validation error fields
    validationErrors.forEach((error, index) => {
      if (error.element) {
        
        // Apply strong visual highlighting
        error.element.style.border = '3px solid #ef4444 !important';
        error.element.style.backgroundColor = '#fef2f2 !important';
        error.element.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5) !important';
        error.element.style.outline = '2px solid #ef4444 !important';
        
        // Add CSS class as well
        error.element.classList.add('missing-field-highlight');
        
        // Force a style update
        error.element.offsetHeight; // trigger reflow
      } else {
      }
    });

    // Fields stay highlighted until filled - no auto-clear timeout
  }

  //
  // Function to forcefully clear field highlighting
  //
  function clearFieldHighlighting(field) {
    if (!field) return;
    
    // Remove the CSS class
    field.classList.remove('missing-field-highlight');
    
    // Clear all inline styles with !important
    field.style.removeProperty('border');
    field.style.removeProperty('background-color');
    field.style.removeProperty('box-shadow');
    field.style.removeProperty('outline');
    
    // Force clear with !important override
    field.style.setProperty('border', 'initial', 'important');
    field.style.setProperty('background-color', 'initial', 'important');
    field.style.setProperty('box-shadow', 'initial', 'important');
    field.style.setProperty('outline', 'initial', 'important');
    
    // Then remove the override after a brief moment
    setTimeout(() => {
      field.style.removeProperty('border');
      field.style.removeProperty('background-color');
      field.style.removeProperty('box-shadow');
      field.style.removeProperty('outline');
    }, 10);
    
    // Force a style recalculation
    field.offsetHeight;
  }

  //
  // Function to clear all field highlights
  //
  function clearAllHighlights() {
    const highlightedFields = document.querySelectorAll('.missing-field-highlight');
    highlightedFields.forEach(field => {
      clearFieldHighlighting(field);
    });
  }

  //
  // Function to close validation modal
  //
  function closeValidationModal() {
    showValidationModal = false;
    validationErrors = [];
  }


  //
  // Function to Submit Update KRA KPI Transaction
  //
  async function submitEditData() {

    // Show Loader Icon
    let element_loader = document.getElementById("loader_block");
    element_loader.classList.remove("hidden");

    // Validate required fields using new validation function
    if (!validateRequiredFields()) {
      showValidationModal = true;
      // Hide Loader Icon
      element_loader = document.getElementById("loader_block");
      element_loader.classList.add("hidden");
      return;
    }

    try {
      const payload = preparePayload();
      // return;

      const response = await fetch(API_PATHS.API_URL_Update_KRA_KPI_Transaction, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

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

    } catch (error) {
      console.error("Error updating:", error);
      alert("Error during update.");
    }

    // Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");
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

  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDate = now.getDate(); // 1-31

  //
  // Function to get average rating
  //
  function getAverageRating(H1_Rating, H2_Rating) {
    if (H1_Rating == 0 || H2_Rating == 0) {
      return H1_Rating + H2_Rating;
    } else {

      if (H1_Rating > 0 && H2_Rating > 0) {
        return ((Number(H1_Rating) + Number(H2_Rating)) / 2).toFixed(2);
      } else {
        return ((Number(H1_Rating) + Number(H2_Rating))).toFixed(2);
      }
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
          h1Sum += h1Avg * h1Weight;
          h1TotalWeight += h1Weight;
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
    if (kraList.length) {
      const result = calculateRatings(kraList);
      h1Rating = result.h1Rating;
      h2Rating = result.h2Rating;
      finalRating = result.finalRating;
    }
    
    // Handle both direct events and custom dispatched events
    let field, value, fieldName;
    if (event.detail && event.detail.name) {
      // This is a custom dispatched event from AutoResizeTextarea
      fieldName = event.detail.name;
      // Try multiple ways to find the textarea element
      field = document.getElementById(fieldName) || 
              document.querySelector(`[name="${fieldName}"]`) || 
              document.querySelector(`textarea[name="${fieldName}"]`) ||
              document.querySelector(`textarea[id="${fieldName}"]`);
      // Get the current value from the field itself or from the bound variable
      if (fieldName === 'finalRemarks') {
        value = finalRemarks;
      } else {
        value = field ? field.value : '';
      }
    } else {
      // This is a direct DOM event
      field = event.target;
      value = field.value;
      fieldName = field.name || field.id;
    }
    
    // Clear highlight from this field if it now has a value
    if (field && value && value.trim() !== '') {      
      // Use the aggressive clearing function ONLY on the specific field that has a value
      clearFieldHighlighting(field);
      
      // For rating fields, clear highlighting from all related rating components in the same cell
      if ((field.type === 'range' || (field.type === 'number' && field.classList.contains('w-20')))) {
        
        // Find the parent table cell
        const parentCell = field.closest('td');
        if (parentCell) {
          // Clear highlighting from all rating-related elements in this cell
          const relatedElements = parentCell.querySelectorAll('input[type="range"], input[type="number"], span.absolute');
          relatedElements.forEach(element => {
            if (element.classList.contains('missing-field-highlight')) {
              clearFieldHighlighting(element);
            }
          });
          
          // Also remove from validation errors any related elements in this cell
          const beforeLength = validationErrors.length;
          validationErrors = validationErrors.filter(error => {
            const isInSameCell = parentCell.contains(error.element);
            return !isInSameCell;
          });
        }
      } else {
        // For non-rating fields, just remove this specific field from validation errors
        const beforeLength = validationErrors.length;
        validationErrors = validationErrors.filter(error => {
          const match = error.element === field;
          return !match;
        });
      }
    }
    
    updateLiveDataStore(); // Sync current state of variables to Live_Data.Execution_Information
  }

  //
  // Function to handle input changes and clear highlights
  //
  function handleInputChange(event) {
    handleBlur(event);
  }

  //
  // Function to handle textarea changes specifically
  //
  function handleTextareaChange(event) {
    
    // Handle both direct events and custom dispatched events
    let field, value, fieldName;
    if (event.detail && event.detail.name) {
      // This is a custom dispatched event from AutoResizeTextarea
      fieldName = event.detail.name;
      // Try multiple ways to find the textarea element
      field = document.getElementById(fieldName) || 
              document.querySelector(`[name="${fieldName}"]`) || 
              document.querySelector(`textarea[name="${fieldName}"]`) ||
              document.querySelector(`textarea[id="${fieldName}"]`);
      value = event.detail.value;
    } else {
      // This is a direct DOM event
      field = event.target;
      value = field.value;
      fieldName = field.name || field.id;
    }
    
    // Clear highlight from this field if it now has a value
    if (field && value && value.trim() !== '') {
      // Use the new clearing function
      clearFieldHighlighting(field);
      
      // Remove this field from validation errors if it's there
      const beforeLength = validationErrors.length;
      validationErrors = validationErrors.filter(error => {
        const match = error.element === field;
        return !match;
      });
    }
    
    // Special handling for finalRemarks
    if (fieldName === 'finalRemarks' && value && value.trim() !== '') {
      // Update the bound variable to trigger reactive statement
      finalRemarks = value;
    }
    
    updateLiveDataStore();
  }

  //
  // Function to monitor KPI remark changes
  //
  $: console.log("kraList changed, length:", kraList.length, kraList);

  $: {
    if (kraList && kraList.length > 0) {
      kraList.forEach(kra => {
        if (kra.kpis) {
          kra.kpis.forEach(kpi => {
            console.log(`KPI: ${kpi.name} | h2_weightage: ${kpi.h2_weightage} | type: ${typeof kpi.h2_weightage}`);
            // Check each remark field and clear highlighting if it has content
            if (kpi.H1_employee_remarks && kpi.H1_employee_remarks.trim() !== '') {
              const element = document.getElementById(`${kpi.key}_H1_employee_remarks`);
              if (element && element.classList.contains('missing-field-highlight')) {
                clearFieldHighlighting(element);
                validationErrors = validationErrors.filter(error => error.element !== element);
              }
            }
            
            if (kpi.H1_manager_remarks && kpi.H1_manager_remarks.trim() !== '') {
              const element = document.getElementById(`${kpi.key}_H1_manager_remarks`);
              if (element && element.classList.contains('missing-field-highlight')) {
                clearFieldHighlighting(element);
                validationErrors = validationErrors.filter(error => error.element !== element);
              }
            }
            
            if (kpi.H2_employee_remarks && kpi.H2_employee_remarks.trim() !== '') {
              const element = document.getElementById(`${kpi.key}_H2_employee_remarks`);
              if (element && element.classList.contains('missing-field-highlight')) {
                clearFieldHighlighting(element);
                validationErrors = validationErrors.filter(error => error.element !== element);
              }
            }
            
            if (kpi.H2_manager_remarks && kpi.H2_manager_remarks.trim() !== '') {
              const element = document.getElementById(`${kpi.key}_H2_manager_remarks`);
              if (element && element.classList.contains('missing-field-highlight')) {
                clearFieldHighlighting(element);
                validationErrors = validationErrors.filter(error => error.element !== element);
              }
            }
            
            if (kpi.HR_remarks && kpi.HR_remarks.trim() !== '') {
              const element = document.getElementById(`${kpi.key}_HR_remarks`);
              if (element && element.classList.contains('missing-field-highlight')) {
                clearFieldHighlighting(element);
                validationErrors = validationErrors.filter(error => error.element !== element);
              }
            }
          });
        }
      });
    }
  }

  //
  // Function to handle any field value change (universal handler)
  //
  function handleFieldChange(element, value) {
    if (element && value && value.toString().trim() !== '') {
      element.classList.remove('missing-field-highlight');
      element.style.border = '';
      element.style.backgroundColor = '';
      element.style.boxShadow = '';
      
      // Remove this field from validation errors if it's there
      const beforeLength = validationErrors.length;
      validationErrors = validationErrors.filter(error => error.element !== element);
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
  onSave={submitEditData}
  onCancel={CancelButton}
  onChange={handleBlur}
/>

{#if showSuccess}
  <div class="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
    KRA-KPI data saved successfully!
  </div>
{/if}
