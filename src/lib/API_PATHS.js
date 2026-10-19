// SECURE API PATHS
// All paths point to the SvelteKit Proxy. No PHP files or operation types are exposed.
//
// HRMS path keys live in ./API_PATHS_HRMS.js and are re-merged below via a single
// integration line. HRMS components keep importing API_PATHS unchanged.

import { API_PATHS_HRMS } from './API_PATHS_HRMS.js';
import { API_PATHS_RECON } from './API_PATHS_RECON.js';

const BASE = '/api';

const CORE_API_PATHS = {

    // --- API Tester ---
    API_URL_Core_Gateway:                          `${BASE}/gateway`,

    // --- AI.RA Chatbot ---
    API_URL_Process_Admin_Prompt_Gatekeeper:  `${BASE}/hey-akschatbot`,
    API_URL_Process_Schema_Builder:           `${BASE}/schema-builder`,
    API_URL_Process_Display_Settings_Builder: `${BASE}/display-settings-builder`,
    API_URL_Process_Scenario_Builder:         `${BASE}/scenario-setup-builder`,
    API_URL_Process_Menu_Map_Builder:         `${BASE}/menu-map-builder`,
    API_URL_Process_Scenario_Config_Builder:  `${BASE}/scenario-config-builder`,

    // Architect
    API_URL_Architect_Plan:    `${BASE}/architect-plan`,
    API_URL_Architect_Approve: `${BASE}/architect-approve`,
    API_URL_Architect_Status:      `${BASE}/architect-status`,
    API_URL_Architect_Resume:           `${BASE}/architect-resume`,
    API_URL_Architect_Reject:           `${BASE}/architect-reject`,
    API_URL_Architect_Regenerate:       `${BASE}/architect-regenerate`,
    API_URL_Architect_Rollback_Review:  `${BASE}/architect-rollback-review`,
    API_URL_Architect_Execute_Rollback: `${BASE}/architect-execute-rollback`,
    API_URL_Architect_Continue:         `${BASE}/architect-continue`,
    API_URL_Architect_File_Intake:      `${BASE}/architect-file-intake`,
    API_URL_Architect_Conversation_Load:`${BASE}/architect-conversation-load`,
    API_URL_Asset_Map:                  `${BASE}/asset-map`,
    API_URL_Process_Report_Builder:           `${BASE}/ok-rbc-bot`,
    API_URL_Process_Dashboard_Builder:        `${BASE}/ok-dhbc-bot`,
    API_URL_Process_Document_Builder:         `${BASE}/ok-dcbc-bot`,
    API_URL_Process_TableView_Assist:         `${BASE}/tableview-assist`,
    API_URL_Process_DataEntry_Assist:         `${BASE}/dataentry-assist`,
    API_URL_Process_ReportViewer_Assist:      `${BASE}/report-viewer-assist`,
    API_URL_Process_Query_Compiler:           `${BASE}/query-compiler`,

    // --- Field Dreams ---
    API_URL_Get_Field_Dreams_Plan:        `${BASE}/get-field-dreams-plan`,
    API_URL_Run_Algorithm_Relevance:      `${BASE}/run-algo-relev`,
    API_URL_Run_Field_Dreams_For_Table:   `${BASE}/run-field-dreams-for-table`,
    API_URL_Run_Linked_Fields_Pass:       `${BASE}/run-linked-fields-pass`,
    API_URL_Get_Field_Context:            `${BASE}/get-field-context`,
    API_URL_Edit_Field_Context:           `${BASE}/edit-field-context`,

    // --- Table Dreams ---
    API_URL_Get_Table_Dreams_Plan:        `${BASE}/get-table-dreams-plan`,
    API_URL_Run_Table_Dreams_For_Table:   `${BASE}/run-table-dreams-for-table`,
    API_URL_Get_Table_Context:            `${BASE}/get-table-context`,
    API_URL_Edit_Table_Context:           `${BASE}/edit-table-context`,

    // --- Scenario Dreams ---
    API_URL_Get_Scenario_Dreams_Plan:         `${BASE}/get-scenario-dreams-plan`,
    API_URL_Run_Scenario_Dreams_For_Table:    `${BASE}/run-scenario-dreams-for-table`,
    API_URL_Get_Scenario_Context:             `${BASE}/get-scenario-context`,
    API_URL_Edit_Scenario_Context:            `${BASE}/edit-scenario-context`,

    // --- Algorithm Dreams ---
    API_URL_Get_Algorithm_Dreams_Plan:    `${BASE}/get-algorithm-dreams-plan`,
    API_URL_Run_Algorithm_Dreams_Batch:   `${BASE}/run-algorithm-dreams-batch`,
    API_URL_Get_Algorithm_Context:        `${BASE}/get-algorithm-context`,
    API_URL_Edit_Algorithm_Context:       `${BASE}/edit-algorithm-context`,

    // --- Asset Dreams ---
    API_URL_Get_Asset_Dreams_Plan:        `${BASE}/get-asset-dreams-plan`,
    API_URL_Run_Asset_Dreams_For_Type:    `${BASE}/run-asset-dreams-for-type`,
    API_URL_Get_Asset_Context:            `${BASE}/get-asset-context`,
    API_URL_Edit_Asset_Context:           `${BASE}/edit-asset-context`,

    // --- Access Dreams ---
    API_URL_Get_Access_Dreams_Plan:       `${BASE}/get-access-dreams-plan`,
    API_URL_Run_Access_Dreams_Batch:      `${BASE}/run-access-dreams-batch`,

    // --- Dreams Compile ---
    API_URL_Get_Identity_Status:          `${BASE}/get-identity-status`,
    API_URL_Get_Identity_Section:         `${BASE}/get-identity-section`,
    API_URL_Run_Compile_Section:          `${BASE}/run-compile-section`,
    API_URL_Run_Compile_All:              `${BASE}/run-compile-all`,

    // --- User Activity ---
    API_URL_Track_User_Activity:    `${BASE}/track-user-activity`,
    API_URL_Get_User_List_For_Logs: `${BASE}/get-user-list-for-logs`,
    API_URL_Get_User_Activity_Logs: `${BASE}/get-user-activity-logs`,

    // --- User Context (additive Phase 2 — unconsumed; legacy paths above remain authoritative) ---
    API_URL_Get_User_Context:               `${BASE}/get-user-context`,
    API_URL_Get_User_Information:           `${BASE}/get-user-information`,
    API_URL_Save_Module_Access:             `${BASE}/save-module-access`,

    // --- Module Access ---
    API_URL_Get_Menu_Map_for_User:          `${BASE}/get-menu-map`,
    API_URL_Get_Employee_Details:           `${BASE}/get-employee-details`,
    API_URL_Get_User_Credentials:           `${BASE}/get-user-credentials`,
    API_URL_Delete_User_Credentials:        `${BASE}/delete-user-creds`,
    API_URL_Update_Central_Master:          `${BASE}/update-central-master`,
    API_URL_Get_Dashboards_for_User:        `${BASE}/get-dashboards`,
    API_URL_Get_Reports_for_User:           `${BASE}/get-reports`,
    API_URL_Save_Report_Categorization:     `${BASE}/save-report-categorization`,
    API_URL_Get_HRMS_for_User:              `${BASE}/get-hrms-access`,

    // --- Menu Map Setup ---
    API_URL_Get_Menu_Map_Data:    `${BASE}/get-menu-map-mm`,
    API_URL_Get_All_Setup_Data:   `${BASE}/get-setup-data-mm`,
    API_URL_Update_Menu_Map_Data: `${BASE}/update-menu-map-mm`,
    API_URL_Review_Menu_Map_Data: `${BASE}/review-menu-map-mm`,

    // --- Data Table Setup ---
    API_URL_Get_Table_List:                             `${BASE}/get-table-list-dt`,
    API_URL_Get_New_Table_Data:                         `${BASE}/get-new-table-data-dt`,
    API_URL_Get_Data_Table_Structure:                   `${BASE}/get-data-table-structure-dt`,
    API_URL_Update_Data_Table_SQL_Query:                `${BASE}/get-update-data-table-sql-query-dt`,
    API_URL_Review_Data_Table_SQL_Query:                `${BASE}/review-data-table-sql-query-dt`,
    API_URL_Execute_Data_Table_SQL_Query:               `${BASE}/execute-data-table-sql-query-dt`,
    API_URL_Update_Scenario_IDs_for_Table_Name:         `${BASE}/update-scenarios-for-dt-dt`,
    API_URL_Update_Display_Settings_for_Table_Name:     `${BASE}/update-display-settings-for-dt-dt`,
    API_URL_Call_Gemini_Schema_Copilot:                 `${BASE}/call-gemini-schema-copilot`,

    // --- Display Settings ---
    API_URL_Get_Table_List_and_Display_Settings_List:   `${BASE}/get-table-list-ds-list-ds`,
    API_URL_Generate_Display_Settings_Data:             `${BASE}/generate-ds-data-ds`,
    API_URL_Get_Display_Settings_Data_by_ID:            `${BASE}/get-ds-data-by-id-ds`,
    API_URL_Generate_Display_Settings_Map_Preview:      `${BASE}/generate-ds-map-preview-ds`,
    API_URL_Save_Display_Settings_Data:                 `${BASE}/save-ds-data-ds`,
    API_URL_Save_Display_Settings_Data_for_Users:       `${BASE}/save-ds-data-for-users-ds`,

    // --- Scenario Setup ---
    API_URL_Get_Table_List_and_Scenario_List: `${BASE}/get-table-scenario-list-ss`,
    API_URL_Get_APUI_Conditions_Data:         `${BASE}/get-apui-data-ss`,
    API_URL_Generate_Scenario_Data:           `${BASE}/generate-scenario-data-ss`,
    API_URL_Save_Scenario_Data:               `${BASE}/save-scenario-data-ss`,
    API_URL_Save_APUI_Conditions:             `${BASE}/save-apui-ss`,

    // --- Flowchart / Scenario Config Setup ---
    API_URL_Get_Lists_for_Flowchart: `${BASE}/get-lists-flowchart-fc`,
    API_URL_Get_Scenario_Config:     `${BASE}/get-scenario-config-fc`,
    API_URL_Save_Scenario_Config:    `${BASE}/save-scenario-config-fc`,
    API_URL_Save_Algorithm:          `${BASE}/save-algorithm`,
    API_URL_Save_Notification_Rule:      `${BASE}/save-notification-rule`,
    API_URL_Get_Notification_Users:      `${BASE}/get-notification-users`,
    API_URL_Get_Notification_Rules:      `${BASE}/get-notification-rules`,
    API_URL_Get_Notification_Documents:  `${BASE}/get-notification-documents`,

    // --- Notifications ---
    API_URL_Get_Unseen_Notification_Count: `${BASE}/get-unseen-notif-count`,
    API_URL_Get_Unseen_Notifications:      `${BASE}/get-unseen-notifs`,
    API_URL_Get_Notification_History:      `${BASE}/get-notif-history`,
    API_URL_Mark_Notifications_Status:     `${BASE}/mark-notifs-status`,

    // --- Report Builder ---
    API_URL_Get_Report_Builder_Initial_Data:      `${BASE}/report-builder-init`,
    API_URL_Get_Report_Configuration:             `${BASE}/report-builder-get-config`,
    API_URL_Generate_Report_With_AI:              `${BASE}/report-builder-generate`,
    API_URL_Save_Report_Configuration:            `${BASE}/report-builder-save`,
    API_URL_Execute_Report:                       `${BASE}/report-builder-execute`,
    API_URL_Get_Dynamic_Filter_Options:           `${BASE}/get-dynamic-filter-options`,
    API_URL_Autopopulate_Linked_Selection_Pop_Up: `${BASE}/autopopulate-linked-selection`,

    // --- Document Builder ---
    API_URL_Get_Document_Builder_Initial_Data: `${BASE}/doc-builder-init`,
    API_URL_Get_Document_Configuration:        `${BASE}/doc-builder-get-config`,
    API_URL_Generate_Document_With_AI:         `${BASE}/doc-builder-generate`,
    API_URL_Save_Document_Configuration:       `${BASE}/doc-builder-save`,
    API_URL_Execute_Document:                  `${BASE}/doc-builder-execute`,

    // --- Dashboard Builder ---
    API_URL_Get_Dashboard_Builder_Initial_Data: `${BASE}/dash-builder-init`,
    API_URL_Get_Dashboard_Configuration:        `${BASE}/dash-builder-get-config`,
    API_URL_Generate_Dashboard_With_AI:         `${BASE}/dash-builder-generate`,
    API_URL_Save_Dashboard_Configuration:       `${BASE}/dash-builder-save`,
    API_URL_Execute_Dashboard:                  `${BASE}/dash-builder-execute`,

    // --- PPC Custom Views ---
    API_URL_Get_Display_Data_for_PPC_Dispatch_Planning: `${BASE}/get-cust-wise-ppc-dph-plng`,
    API_URL_Get_Display_Data_for_PPC_Work_Order:        `${BASE}/get-cust-wise-ppc-wo-plng`,
    API_URL_Get_Display_Data_for_Lot_Master:            `${BASE}/get-display-data-lot-master`,
    API_URL_Get_Display_Data_for_Material_Requisition:  `${BASE}/get-display-data-mat-req`,

    // --- TableView ---
    API_URL_Validate_Action_Condition:                  `${BASE}/tableview-management`,
    API_URL_Filter_Action_Dropdown_List:                `${BASE}/filter-action-dropdown`,
    API_URL_Get_Display_Data_for_Scenario:              `${BASE}/get-display-data-s`,
    API_URL_Get_Display_Data_for_Display_Settings:      `${BASE}/get-display-data-ds`,
    API_URL_Get_UniqueValueSet_Display_Scenario_Data:   `${BASE}/get-display-data-s-unique`,
    API_URL_Get_UniqueValueSet_Display_Settings_Data:   `${BASE}/get-display-data-ds-unique`,

    // --- DataEntry ---
    API_URL_Initialize_Execution_Information: `${BASE}/init-exec-info`,
    API_URL_Run_APUI_Call:                    `${BASE}/run-apui-call`,
    API_URL_Add_Linked_Addition_Row:          `${BASE}/add-la-row`,
    API_URL_Submit_DataEntry:                 `${BASE}/submit-de`,
    API_URL_Clear_APUI_Cache:                 `${BASE}/clear-apui-cache`,

    // --- Data Entry / Attachments ---
    API_URL_Upload_Attachment:   `${BASE}/upload-attachment`,
    API_URL_Download_Attachment: `${BASE}/download-attachment`,

    // --- ScenarioConfig ---
    API_URL_Generate_Scenario_Config_Object:        `${BASE}/gen-sc-obj`,
    API_URL_Generate_Execution_Information_Object:  `${BASE}/gen-exe-obj`,
    API_URL_Update_Execution_Information_Object:    `${BASE}/upd-exe-obj`,

    // --- Tally XML Export ---
    API_URL_Tally_XML_Export: `${BASE}/tally-xml`,

    // --- Sales KYC Form ---
    API_URL_Get_KYC_by_ID: `${BASE}/get-kyc-by-id`,
    API_URL_Save_KYC:      `${BASE}/save-kyc`,

};

export const API_PATHS = { ...CORE_API_PATHS, ...API_PATHS_HRMS, ...API_PATHS_RECON };
