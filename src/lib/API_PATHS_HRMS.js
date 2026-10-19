// HRMS PATH REGISTRY (F1a)
// Extracted from API_PATHS.js. HRMS components keep importing API_PATHS unchanged;
// this module is re-merged into API_PATHS via one integration line.

const BASE = '/api';

export const API_PATHS_HRMS = {

    // --- AKS HRMS ---
    API_URL_Get_Employee_Details_Data:                      `${BASE}/get-emp-details-data`,
    API_URL_Get_Master_Data_for_Employee_Details:           `${BASE}/get-mdata-emp-details`,
    API_URL_Get_Manager_Details_based_on_Designation:       `${BASE}/get-mgr-detail-desg`,
    API_URL_Save_Employee_Details_Data:                     `${BASE}/save-emp-details`,
    API_URL_Get_Employee_Details_by_ID:                     `${BASE}/get-emp-details-id`,

    // --- AKS HRMS / Attendance ---
    API_URL_Get_Attendance_Management_Data:                 `${BASE}/get-att-mgt-data`,
    API_URL_Add_New_Attendance_Entry_Data:                  `${BASE}/add-att-data`,
    API_URL_Save_Attendance_Entry_Data:                     `${BASE}/save-att-data`,
    API_URL_Get_Attendance_Entry_Data_by_ID:                `${BASE}/get-att-data-id`,
    API_URL_Get_Attendance_Calendar_Data_by_ID:             `${BASE}/get-att-cal-id`,
    API_URL_Process_Attendance_Data_Sheet:                  `${BASE}/proc-att-datasheet`,

    // --- AKS HRMS / CompOff ---
    API_URL_Get_CompOff_Management_Data:                    `${BASE}/get-compoff-data`,
    API_URL_Add_New_CompOff_Entry_Data:                     `${BASE}/add-compoff-data`,
    API_URL_Save_CompOff_Entry_Data:                        `${BASE}/save-compoff-data`,
    API_URL_Get_CompOff_Entry_Data_by_ID:                   `${BASE}/get-compoff-data-id`,

    // --- AKS HRMS / Leave ---
    API_URL_Get_Leave_Management_Data:                      `${BASE}/get-leave-data`,
    API_URL_Add_New_Leave_Entry_Data:                       `${BASE}/add-leave-data`,
    API_URL_Save_Leave_Entry_Data:                          `${BASE}/save-leave-data`,
    API_URL_Get_Leave_Entry_Data_by_ID:                     `${BASE}/get-leave-data-id`,

    // --- AKS HRMS / OD ---
    API_URL_Get_OD_Management_Data:                         `${BASE}/get-od-data`,
    API_URL_Add_New_OD_Entry_Data:                          `${BASE}/add-od-data`,
    API_URL_Save_OD_Entry_Data:                             `${BASE}/save-od-data`,
    API_URL_Get_OD_Entry_Data_by_ID:                        `${BASE}/get-od-data-id`,

    // --- AKS HRMS / Expense ---
    API_URL_Get_Expense_Management_Data:                    `${BASE}/get-expense-data`,
    API_URL_Add_New_Expense_Entry_Data:                     `${BASE}/add-expense-data`,
    API_URL_Save_Expense_Entry_Data:                        `${BASE}/save-expense-data`,
    API_URL_Get_Expense_Entry_Data_by_ID:                   `${BASE}/get-expense-data-id`,

    // --- AKS HRMS / Holiday ---
    API_URL_Get_Holiday_Calendar_Data:                      `${BASE}/get-holiday-data`,
    API_URL_Get_Holiday_List_Data:                          `${BASE}/get-holiday-list-data`,
    API_URL_Get_Holiday_Entry_by_ID:                        `${BASE}/get-holiday-entry-id`,
    API_URL_Save_Holiday_Entry_Data:                        `${BASE}/save-holiday-entry`,

    // --- AKS HRMS / RFM ---
    API_URL_Get_RFM_Management_Data:                        `${BASE}/get-rfm-data`,
    API_URL_Get_Master_Data_for_RFM_Management:             `${BASE}/get-mstr-data-rfm`,
    API_URL_Get_RFM_Data_by_ID:                             `${BASE}/get-rfm-data-id`,
    API_URL_Save_RFM_Data:                                  `${BASE}/save-rfm-data`,
    API_URL_Convert_RFM_to_Onboarding:                      `${BASE}/cnv-rfm-onbrdng`,

    // --- AKS HRMS / Onboarding ---
    API_URL_Get_Onboarding_Management_Data:                 `${BASE}/get-onbrdng-data`,
    API_URL_Get_Master_Data_for_Onboarding_Management:      `${BASE}/get-mstr-data-onbrdng`,
    API_URL_Get_Onboarding_Template:                        `${BASE}/get-onbrdng-tmpl`,
    API_URL_Get_Onboarding_Data_by_ID:                      `${BASE}/get-onbrdng-data-id`,
    API_URL_Save_Onboarding_Data:                           `${BASE}/save-onbrdng-data`,

    // --- AKS HRMS / Exit ---
    API_URL_Get_Exit_Management_Data:                       `${BASE}/get-ext-data`,
    API_URL_Get_Master_Data_for_Exit_Management:            `${BASE}/get-mstr-data-ext`,
    API_URL_Get_Exit_Template:                              `${BASE}/get-ext-tmpl`,
    API_URL_Get_Exit_Data_by_ID:                            `${BASE}/get-ext-data-id`,
    API_URL_Save_Exit_Data:                                 `${BASE}/save-ext-data`,

    // --- AKS HRMS / Payroll ---
    API_URL_Get_Payroll_Management_Table_Data:              `${BASE}/get-pyrl-data`,
    API_URL_Get_Payroll_Management_Data_by_ID:              `${BASE}/get-pyrl-data-id`,
    API_URL_Upload_Final_Payroll_Data:                      `${BASE}/up-f-pyrl-data`,
    API_URL_Download_Attendance_for_Payroll:                `${BASE}/dwn-att-pyrl`,

    // --- AKS HRMS / Attachments ---
    API_URL_HRMS_Upload_Attachment:                         `${BASE}/hrms-up-attachments`,
    API_URL_HRMS_Download_Attachment:                       `${BASE}/hrms-down-attachments`,

    // --- AKS HRMS / Settings & Master Data ---
    API_URL_Get_HRMS_Settings_Data:                         `${BASE}/get-hrms-settings`,
    API_URL_Save_Shift_Master:                              `${BASE}/save-shift-master`,
    API_URL_Delete_Shift_Master:                            `${BASE}/delete-shift-master`,
    API_URL_Save_Work_Location_Master:                      `${BASE}/save-work-location-master`,
    API_URL_Delete_Work_Location_Master:                    `${BASE}/delete-work-location-master`,
    API_URL_Save_Leave_Type_Master:                         `${BASE}/save-leave-type-master`,
    API_URL_Delete_Leave_Type_Master:                       `${BASE}/delete-leave-type-master`,
    API_URL_Save_Department:                                `${BASE}/save-department`,
    API_URL_Delete_Department:                              `${BASE}/delete-department`,
    API_URL_Save_Designation:                               `${BASE}/save-designation`,
    API_URL_Delete_Designation:                             `${BASE}/delete-designation`,
    API_URL_Save_Attendance_Type:                           `${BASE}/save-attendance-type`,
    API_URL_Delete_Attendance_Type:                         `${BASE}/delete-attendance-type`,
    API_URL_Upload_Holidays_Bulk:                           `${BASE}/upload-holidays-bulk`,
    API_URL_Upload_Leave_Balance_Bulk:                      `${BASE}/upload-leave-balance-bulk`,
    API_URL_Get_Leave_Balance_Export_Data:                  `${BASE}/get-leave-balance-export`,

};
