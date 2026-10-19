import { json } from "@sveltejs/kit";
import { B as BACKEND_API_KEY, V as VITE_API_BASE_URL } from "../../../../chunks/private.js";
const HRMS_SLUGS = {
  // --- AKS HRMS / Employee ---
  "get-emp-details-data": "/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Employee_Details_Data",
  "get-mdata-emp-details": "/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Master_Data_for_Employee_Details",
  "get-mgr-detail-desg": "/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Manager_Details_based_on_Designation",
  "save-emp-details": "/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Save_Employee_Details_Data",
  "get-emp-details-id": "/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Employee_Details_by_ID",
  // --- AKS HRMS / Attendance ---
  "get-att-mgt-data": "/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Get_Attendance_Management_Data",
  "add-att-data": "/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Add_New_Attendance_Entry_Data",
  "save-att-data": "/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Save_Attendance_Entry_Data",
  "get-att-data-id": "/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Get_Attendance_Entry_Data_by_ID",
  "get-att-cal-id": "/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Get_Attendance_Calendar_Data_by_Employee_Self_ID",
  "proc-att-datasheet": { path: "/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Process_Attendance_Data_Sheet", stream: true },
  // --- AKS HRMS / CompOff ---
  "get-compoff-data": "/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Get_CompOff_Management_Data",
  "add-compoff-data": "/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Add_New_CompOff_Entry_Data",
  "save-compoff-data": "/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Save_CompOff_Entry_Data",
  "get-compoff-data-id": "/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Get_CompOff_Entry_Data_by_ID",
  // --- AKS HRMS / Leave ---
  "get-leave-data": "/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Get_Leave_Management_Data",
  "add-leave-data": "/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Add_New_Leave_Entry_Data",
  "save-leave-data": "/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Save_Leave_Entry_Data",
  "get-leave-data-id": "/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Get_Leave_Entry_Data_by_ID",
  // --- AKS HRMS / OD ---
  "get-od-data": "/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Get_OD_Management_Data",
  "add-od-data": "/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Add_New_OD_Entry_Data",
  "save-od-data": "/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Save_OD_Entry_Data",
  "get-od-data-id": "/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Get_OD_Entry_Data_by_ID",
  // --- AKS HRMS / Expense ---
  "get-expense-data": "/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Get_Expense_Management_Data",
  "add-expense-data": "/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Add_New_Expense_Entry_Data",
  "save-expense-data": "/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Save_Expense_Entry_Data",
  "get-expense-data-id": "/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Get_Expense_Entry_Data_by_ID",
  // --- AKS HRMS / Holiday ---
  "get-holiday-data": "/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Get_Holiday_Calendar_Data",
  "get-holiday-list-data": "/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Get_Holiday_List_Data",
  "get-holiday-entry-id": "/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Get_Holiday_Entry_by_ID",
  "save-holiday-entry": "/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Save_Holiday_Entry_Data",
  // --- AKS HRMS / RFM ---
  "get-rfm-data": "/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Get_RFM_Management_Data",
  "get-mstr-data-rfm": "/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Get_Master_Data_for_RFM_Management",
  "get-rfm-data-id": "/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Get_RFM_Data_by_ID",
  "save-rfm-data": "/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Save_RFM_Data",
  "cnv-rfm-onbrdng": "/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Convert_RFM_to_Onboarding",
  // --- AKS HRMS / Onboarding ---
  "get-onbrdng-data": "/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Onboarding_Management_Data",
  "get-mstr-data-onbrdng": "/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Master_Data_for_Onboarding_Management",
  "get-onbrdng-tmpl": "/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Onboarding_Template",
  "get-onbrdng-data-id": "/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Onboarding_Data_by_ID",
  "save-onbrdng-data": "/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Save_Onboarding_Data",
  // --- AKS HRMS / Exit ---
  "get-ext-data": "/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Exit_Management_Data",
  "get-mstr-data-ext": "/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Master_Data_for_Exit_Management",
  "get-ext-tmpl": "/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Exit_Template",
  "get-ext-data-id": "/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Exit_Data_by_ID",
  "save-ext-data": "/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Save_Exit_Data",
  // --- AKS HRMS / Payroll ---
  "get-pyrl-data": "/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Get_Payroll_Management_Table_Data",
  "get-pyrl-data-id": "/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Get_Payroll_Management_Data_by_ID",
  "up-f-pyrl-data": { path: "/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Upload_Final_Payroll_Data", stream: true },
  "dwn-att-pyrl": { path: "/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Download_Attendance_for_Payroll", stream: true },
  // --- AKS HRMS / Attachments ---
  "hrms-up-attachments": { path: "/API_Files/AKS_HRMS_Management/HRMS_Attachments_PHP_Code.php?type=Upload_Attachment", stream: true },
  "hrms-down-attachments": { path: "/API_Files/AKS_HRMS_Management/HRMS_Attachments_PHP_Code.php?type=Download_Attachment", stream: true },
  // --- AKS HRMS / Settings & Master Data ---
  "get-hrms-settings": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Get_HRMS_Settings_Data",
  "save-shift-master": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Shift_Master",
  "delete-shift-master": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Shift_Master",
  "save-work-location-master": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Work_Location_Master",
  "delete-work-location-master": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Work_Location_Master",
  "save-leave-type-master": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Leave_Type_Master",
  "delete-leave-type-master": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Leave_Type_Master",
  "save-department": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Department",
  "delete-department": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Department",
  "save-designation": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Designation",
  "delete-designation": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Designation",
  "save-attendance-type": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Attendance_Type",
  "delete-attendance-type": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Attendance_Type",
  "upload-holidays-bulk": { path: "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Upload_Holidays_Bulk", stream: true },
  "upload-leave-balance-bulk": { path: "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Upload_Leave_Balance_Bulk", stream: true },
  "get-leave-balance-export": "/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Get_Leave_Balance_Export_Data"
};
const KRA = "/API_Files/AKS_HRMS_Management/Save_KRA_KPI.php";
const CORP = "/API_Files/AKS_HRMS_Management/Corporate_Hierarchy_Management.php";
const REPORT = "/API_Files/AKS_HRMS_Management/Report_Code_Gen.php";
const MAIL = "/API_Files/AKS_HRMS_Management/Send_PMS_Email_PHP_Code.php";
const RECON_SLUGS = {
  "report-code-gen": REPORT,
  "get-corporate-report-masters": `${REPORT}?type=Get_Corporate_Report_Masters`,
  "get-all-corporate-employee-data": `${REPORT}?type=Get_All_Corporate_Employee_Data`,
  "corporate-pms-report": `${REPORT}?type=Corporate_PMS_Report`,
  "get-corporate-hierarchy-data": `${CORP}?type=Get_Employee_Self_Details`,
  "generate-corporate-update-request": `${CORP}?type=Generate_Update_Request_for_Approval`,
  "get-corporate-employee-updates": `${CORP}?type=Get_Corporate_Employee_Updates_Data`,
  "approve-corporate-employee-update": `${CORP}?type=Approve_Corporate_Employee_Update`,
  "reject-corporate-employee-update": `${CORP}?type=Reject_Corporate_Employee_Update`,
  "kra-kpi-table-view": `${KRA}?type=KRA_KPI_Get_Table_View_Data`,
  "kra-get-employee-self": `${KRA}?type=Get_Employee_Self_Data`,
  "kra-save-master": `${KRA}?type=Save_New_KRA_KPI_Master`,
  "kra-get-master": `${KRA}?type=Get_KRA_KPI_Master_by_ID`,
  "kra-edit-master": `${KRA}?type=Save_Update_KRA_KPI_Master`,
  "kra-start-pms-cycle": `${KRA}?type=Start_PMS_Cycle_for_Departments`,
  "kra-check-ongoing": `${KRA}?type=Check_Ongoing_Transaction`,
  "kra-sync-to-transaction": `${KRA}?type=Sync_New_KRA_KPI_To_Transaction`,
  "kra-trans-table-info": `${KRA}?type=KRA_KPI_Get_Transaction_Info`,
  "kra-get-master-data": `${KRA}?type=Get_KRA_KPI_Master_Data`,
  "kra-save-transaction": `${KRA}?type=Save_KRA_KPI_Transaction`,
  "kra-get-transaction": `${KRA}?type=Get_KRA_KPI_Transaction_Data`,
  "kra-update-transaction": `${KRA}?type=Save_Update_KRA_KPI_Transaction`,
  "kra-get-masters": `${KRA}?type=get_kra_kpi_masters`,
  "send-pms-bulk-emails": `${MAIL}?type=Send_PMS_Bulk_Emails`
};
const CORE_SLUGS = {
  // --- API Tester ---
  "gateway": "/API_Files/",
  // --- AI.RA Chatbot ---
  "hey-akschatbot": "/API_Files/Endpoints/AIRA/Gatekeeper_Controller.php",
  "schema-builder": "/API_Files/Endpoints/AIRA/Builders/Schema_Builder_Controller.php",
  "display-settings-builder": "/API_Files/Endpoints/AIRA/Builders/Display_Settings_Builder_Controller.php",
  "scenario-setup-builder": "/API_Files/Endpoints/AIRA/Builders/Scenario_Setup_Builder_Controller.php",
  "menu-map-builder": "/API_Files/Endpoints/AIRA/Builders/Menu_Map_Builder_Controller.php",
  "scenario-config-builder": "/API_Files/Endpoints/AIRA/Builders/Scenario_Config_Builder_Controller.php",
  "architect-plan": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Plan",
  "architect-approve": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Approve",
  "architect-status": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Status",
  "architect-resume": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Resume",
  "architect-reject": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Reject",
  "architect-regenerate": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Regenerate",
  "architect-rollback-review": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Rollback_Review",
  "architect-execute-rollback": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Execute_Rollback",
  "architect-continue": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Continue",
  "architect-conversation-load": "/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Conversation_Load",
  "architect-file-intake": { path: "/API_Files/Endpoints/AIRA/Architect/Architect_File_Intake_Controller.php", stream: true },
  "asset-map": "/API_Files/AIRA/Architect/Asset_Map_Controller.php",
  "ok-rbc-bot": "/API_Files/Endpoints/AIRA/Builders/Report_Builder_Controller.php",
  "ok-dhbc-bot": "/API_Files/Endpoints/AIRA/Builders/Dashboard_Builder_Controller.php",
  "ok-dcbc-bot": "/API_Files/Endpoints/AIRA/Builders/Document_Builder_Controller.php",
  "tableview-assist": "/API_Files/Endpoints/AIRA/Assistants/TableView_Assist_Controller.php",
  "dataentry-assist": "/API_Files/Endpoints/AIRA/Assistants/DataEntry_Assist_Controller.php",
  "report-viewer-assist": "/API_Files/Endpoints/AIRA/Assistants/ReportViewer_Assist_Controller.php",
  "query-compiler": "/API_Files/Endpoints/AIRA/Assistants/Query_Compiler_Controller.php",
  // --- Field Dreams ---
  "get-field-dreams-plan": "/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Get_Dreams_Plan",
  "run-algo-relev": "/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Run_Algorithm_Relevance",
  "run-field-dreams-for-table": "/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Run_Field_Dreams_For_Table",
  "run-linked-fields-pass": "/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Run_Linked_Fields_Pass",
  "get-field-context": "/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Get_Field_Context",
  "edit-field-context": "/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Edit_Field_Context",
  // --- Table Dreams ---
  "get-table-dreams-plan": "/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Get_Table_Dreams_Plan",
  "run-table-dreams-for-table": "/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Run_Table_Dreams_For_Table",
  "get-table-context": "/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Get_Table_Context",
  "edit-table-context": "/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Edit_Table_Context",
  // --- Scenario Dreams ---
  "get-scenario-dreams-plan": "/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Get_Scenario_Dreams_Plan",
  "run-scenario-dreams-for-table": "/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Run_Scenario_Dreams_For_Table",
  "get-scenario-context": "/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Get_Scenario_Context",
  "edit-scenario-context": "/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Edit_Scenario_Context",
  // --- Algorithm Dreams ---
  "get-algorithm-dreams-plan": "/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Get_Algorithm_Dreams_Plan",
  "run-algorithm-dreams-batch": "/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Run_Algorithm_Dreams_Batch",
  "get-algorithm-context": "/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Get_Algorithm_Context",
  "edit-algorithm-context": "/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Edit_Algorithm_Context",
  // --- Asset Dreams ---
  "get-asset-dreams-plan": "/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Get_Asset_Dreams_Plan",
  "run-asset-dreams-for-type": "/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Run_Asset_Dreams_For_Type",
  "get-asset-context": "/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Get_Asset_Context",
  "edit-asset-context": "/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Edit_Asset_Context",
  // --- Access Dreams ---
  "get-access-dreams-plan": "/API_Files/AIRA/Dreams/Access_Dreams/Access_Dreams.php?type=Get_Access_Dreams_Plan",
  "run-access-dreams-batch": "/API_Files/AIRA/Dreams/Access_Dreams/Access_Dreams.php?type=Run_Access_Dreams_Batch",
  // --- Dreams Compile ---
  "get-identity-status": "/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Get_Identity_Status",
  "get-identity-section": "/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Get_Identity_Section",
  "run-compile-section": "/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Run_Compile_Section",
  "run-compile-all": "/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Run_Compile_All",
  // --- User Activity ---
  "track-user-activity": "/API_Files/User_Management/User_Management_PHP_Code.php?type=Track_User_Activity",
  "get-user-list-for-logs": "/API_Files/User_Management/User_Management_PHP_Code.php?type=Get_User_List_For_Logs",
  "get-user-activity-logs": "/API_Files/User_Management/User_Management_PHP_Code.php?type=Get_User_Activity_Logs",
  // --- User Context (additive Phase 2 — unconsumed; legacy paths above remain authoritative) ---
  "get-user-context": "/API_Files/Endpoints/User_Context.php?type=Get_User_Context",
  "save-module-access": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Save_Module_Access",
  // --- Module Access ---
  "get-menu-map": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Menu_Map_for_User",
  "get-employee-details": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Employee_Details",
  "get-user-credentials": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_User_Credentials",
  "delete-user-creds": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Delete_User_Credentials",
  "update-central-master": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Update_Central_Master",
  "get-dashboards": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Dashboards_for_User",
  "get-reports": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Reports_for_User",
  "save-report-categorization": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Save_Report_Categorization",
  "get-hrms-access": "/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_HRMS_for_User",
  // --- Menu Map Setup ---
  "get-menu-map-mm": "/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Get_Menu_Map_Data",
  "get-setup-data-mm": "/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Get_All_Setup_Data",
  "update-menu-map-mm": "/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Update_Menu_Map_Data",
  "review-menu-map-mm": "/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Review_Menu_Map_Data",
  // --- Data Table Setup ---
  "get-table-list-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Get_Table_List",
  "get-new-table-data-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Get_New_Table_Data",
  "get-data-table-structure-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Get_Data_Table_Structure",
  "get-update-data-table-sql-query-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Update_Data_Table_SQL_Query",
  "review-data-table-sql-query-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Review_Data_Table_SQL_Query",
  "execute-data-table-sql-query-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Execute_Data_Table_SQL_Query",
  "update-scenarios-for-dt-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Update_Scenario_IDs_for_Table_Name",
  "update-display-settings-for-dt-dt": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Update_Display_Settings_IDs_for_Table_Name",
  "call-gemini-schema-copilot": "/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Call_Gemini_Schema_Copilot",
  // DEAD — Data Table AI routed through ok-dts-bot
  // --- Display Settings ---
  "get-table-list-ds-list-ds": "/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Get_User_List_and_Table_List_for_Display_Settings",
  "generate-ds-data-ds": "/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Generate_Display_Settings_Data",
  "get-ds-data-by-id-ds": "/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Get_Display_Settings_Data_by_ID",
  "generate-ds-map-preview-ds": "/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Generate_Display_Settings_Map_Preview",
  "save-ds-data-ds": "/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Save_Display_Settings_Data",
  "save-ds-data-for-users-ds": "/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Save_Display_Settings_Data_for_Users",
  // --- Scenario Setup ---
  "get-table-scenario-list-ss": "/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Get_Table_List_and_Scenario_List",
  "get-apui-data-ss": "/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Get_APUI_Conditions_Data",
  "generate-scenario-data-ss": "/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Generate_Scenario_Data",
  "save-scenario-data-ss": "/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Save_Scenario_Data",
  "save-apui-ss": "/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Save_APUI_Conditions",
  // --- Flowchart / Scenario Config Setup ---
  "get-lists-flowchart-fc": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Lists_for_Flowchart",
  "get-scenario-config-fc": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Scenario_Config",
  "save-scenario-config-fc": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Save_Scenario_Config",
  "save-algorithm": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Save_Algorithm",
  "save-notification-rule": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Save_Notification_Rule",
  "get-notification-users": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Notification_Users",
  "get-notification-rules": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Notification_Rules",
  "get-notification-documents": "/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Notification_Documents",
  // --- Notifications ---
  "get-unseen-notif-count": "/API_Files/Endpoints/Notification_Management.php?type=Get_Unseen_Count",
  "get-unseen-notifs": "/API_Files/Endpoints/Notification_Management.php?type=Get_Unseen_List",
  "get-notif-history": "/API_Files/Endpoints/Notification_Management.php?type=Get_History_Page",
  "mark-notifs-status": "/API_Files/Endpoints/Notification_Management.php?type=Mark_Status",
  // --- Report Builder ---
  "report-builder-init": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Get_Report_Builder_Initial_Data",
  "report-builder-get-config": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Get_Report_Configuration",
  "report-builder-generate": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Generate_Report_With_AI",
  // DEAD — AI generation routed through ok-rbc-bot
  "report-builder-save": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Save_Report_Configuration",
  "report-builder-execute": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Execute_Report",
  "get-dynamic-filter-options": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Get_Dynamic_Filter_Options",
  "autopopulate-linked-selection": "/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Autopopulate_Linked_Selection_Pop_Up",
  // --- Document Builder ---
  "doc-builder-init": "/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Get_Document_Builder_Initial_Data",
  "doc-builder-get-config": "/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Get_Document_Configuration",
  "doc-builder-generate": "/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Generate_Document_With_AI",
  // DEAD — AI generation routed through ok-dcbc-bot
  "doc-builder-save": "/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Save_Document_Configuration",
  "doc-builder-execute": "/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Execute_Document",
  // --- Dashboard Builder ---
  "dash-builder-init": "/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Get_Dashboard_Builder_Initial_Data",
  "dash-builder-get-config": "/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Get_Dashboard_Configuration",
  "dash-builder-generate": "/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Generate_Dashboard_With_AI",
  // DEAD — AI generation routed through ok-dhbc-bot
  "dash-builder-save": "/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Save_Dashboard_Configuration",
  "dash-builder-execute": "/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Execute_Dashboard",
  // --- TableView ---
  "tableview-management": "/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Validate_Action_Condition",
  "filter-action-dropdown": "/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Filter_Action_Dropdown_List",
  "get-display-data-s": "/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_Display_Data_for_Scenario",
  "get-display-data-ds": "/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_Display_Data_for_Display_Setting",
  "get-display-data-s-unique": "/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_UniqueValueSet_Display_Scenario_Data",
  // DEAD — UniqueValueSet built client-side in TableView.svelte
  "get-display-data-ds-unique": "/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_UniqueValueSet_Display_Settings_Data",
  // DEAD — UniqueValueSet built client-side in TableView.svelte
  // --- DataEntry ---
  "init-exec-info": "/API_Files/Endpoints/DataEntry_Management.php?type=Initialize_Execution_Information",
  "run-apui-call": "/API_Files/Endpoints/DataEntry_Management.php?type=Run_APUI_Call",
  "add-la-row": "/API_Files/Endpoints/DataEntry_Management.php?type=Add_Linked_Addition_Row",
  "submit-de": "/API_Files/Endpoints/DataEntry_Management.php?type=Submit_DataEntry",
  "clear-apui-cache": "/API_Files/Endpoints/DataEntry_Management.php?type=Clear_APUI_Cache",
  // --- Attachments (raw stream — preserves multipart boundary for uploads, binary body for downloads) ---
  "upload-attachment": { path: "/API_Files/DataEntry_Management/AKS_Attachments_Management.php?type=Upload_Attachment", stream: true },
  "download-attachment": { path: "/API_Files/DataEntry_Management/AKS_Attachments_Management.php?type=Download_Attachment", stream: true },
  // --- ScenarioConfig ---
  "gen-sc-obj": "/API_Files/Endpoints/ScenarioConfig_Management.php?type=Generate_Scenario_Config_Object",
  "gen-exe-obj": "/API_Files/Endpoints/ScenarioConfig_Management.php?type=Generate_Execution_Information_Object",
  "upd-exe-obj": "/API_Files/Endpoints/ScenarioConfig_Management.php?type=Update_Execution_Information_Object",
  // --- PPC Custom Views ---
  "get-cust-wise-ppc-dph-plng": "/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_PPC_Dispatch_Data",
  "get-cust-wise-ppc-wo-plng": "/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_PPC_Work_Order_Data",
  "get-display-data-lot-master": "/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_Lot_Master_Data",
  "get-display-data-mat-req": "/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_Material_Requisition_Data",
  // --- Tally XML Export ---
  "tally-xml": "/API_Files/Project_Customizations/Tally_XML_Management_PHP_Code.php?type=report_xml",
  // --- Sales KYC Form ---
  "get-kyc-by-id": "/API_Files/Project_Customizations/KYC_Management_PHP_Code.php?type=Get_Sales_KYC_Form_by_ID",
  "save-kyc": "/API_Files/Project_Customizations/KYC_Management_PHP_Code.php?type=Save_Sales_KYC_Form_Data"
};
const SLUG_MAP = { ...CORE_SLUGS, ...HRMS_SLUGS, ...RECON_SLUGS };
const ADMIN_ONLY_SLUGS = /* @__PURE__ */ new Set([
  // Module Access (Project Setup)
  "get-employee-details",
  "get-user-credentials",
  "get-menu-map",
  "delete-user-creds",
  "update-central-master",
  "get-dashboards",
  "get-reports",
  "save-report-categorization",
  "get-hrms-access",
  "save-module-access",
  // Menu Map Setup
  "get-menu-map-mm",
  "get-setup-data-mm",
  "update-menu-map-mm",
  "review-menu-map-mm",
  // Data Table Setup
  "get-table-list-dt",
  "get-new-table-data-dt",
  "get-data-table-structure-dt",
  "get-update-data-table-sql-query-dt",
  "review-data-table-sql-query-dt",
  "execute-data-table-sql-query-dt",
  "update-scenarios-for-dt-dt",
  "update-display-settings-for-dt-dt",
  "call-gemini-schema-copilot",
  // Display Settings
  "get-table-list-ds-list-ds",
  "generate-ds-data-ds",
  "get-ds-data-by-id-ds",
  "generate-ds-map-preview-ds",
  "save-ds-data-ds",
  "save-ds-data-for-users-ds",
  // Scenario Setup
  "get-table-scenario-list-ss",
  "get-apui-data-ss",
  "generate-scenario-data-ss",
  "save-scenario-data-ss",
  "save-apui-ss",
  // Scenario Configuration / Flowchart
  "get-lists-flowchart-fc",
  "get-scenario-config-fc",
  "save-scenario-config-fc",
  "save-algorithm",
  "save-notification-rule",
  "get-notification-users",
  "get-notification-rules",
  "get-notification-documents",
  // Report / Document / Dashboard BUILDER (execute slugs are NOT in this set)
  "report-builder-init",
  "report-builder-get-config",
  "report-builder-save",
  "report-builder-generate",
  "doc-builder-init",
  "doc-builder-get-config",
  "doc-builder-save",
  "doc-builder-generate",
  "dash-builder-init",
  "dash-builder-get-config",
  "dash-builder-save",
  "dash-builder-generate",
  // User Activity audit (read)
  "get-user-list-for-logs",
  "get-user-activity-logs",
  // Tally export
  "tally-xml",
  // Admin API tester (also covers 'gateway/<path>' suffix — see isAdminOnlySlug below)
  "gateway"
]);
function isAdminOnlySlug(slug) {
  return ADMIN_ONLY_SLUGS.has(slug) || slug.startsWith("gateway/");
}
function resolveGatewayCustomPath(slug) {
  if (!slug.startsWith("gateway/")) return null;
  const suffix = slug.slice("gateway/".length);
  if (!suffix) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(suffix);
  } catch {
    return null;
  }
  if (decoded.includes("..")) return null;
  if (decoded.startsWith("/")) return null;
  if (/^[a-z][a-z0-9+\-.]*:/i.test(decoded)) return null;
  return "/API_Files/" + suffix;
}
async function proxyRequest(request, params, method, locals = {}) {
  const slug = params.slug;
  if (isAdminOnlySlug(slug) && Number(locals?.user?.user_id) !== 1) {
    return json(
      { status: "error", message: "Forbidden: admin access required." },
      { status: 403 }
    );
  }
  let entry = SLUG_MAP[slug];
  if (!entry) {
    const customPath = resolveGatewayCustomPath(slug);
    if (customPath) entry = customPath;
  }
  if (!entry) {
    return json({ status: "error", message: "Unknown Endpoint", error: slug }, { status: 404 });
  }
  const isStream = typeof entry === "object" && entry.stream;
  const phpPath = typeof entry === "string" ? entry : entry.path;
  const reqUrl = new URL(request.url);
  const extraParams = reqUrl.searchParams.toString();
  const separator = phpPath.includes("?") ? "&" : "?";
  const targetUrl = extraParams ? `${VITE_API_BASE_URL}${phpPath}${separator}${extraParams}` : `${VITE_API_BASE_URL}${phpPath}`;
  try {
    if (isStream) {
      const headers = new Headers(request.headers);
      headers.set("X-API-KEY", BACKEND_API_KEY);
      headers.delete("host");
      const fetchOptions = { method, headers };
      if (method === "POST") {
        fetchOptions.body = request.body;
        fetchOptions.duplex = "half";
      }
      const phpResponse = await fetch(targetUrl, fetchOptions);
      return new Response(phpResponse.body, {
        status: phpResponse.status,
        headers: phpResponse.headers
      });
    } else {
      let body = null;
      if (method === "POST") {
        try {
          body = await request.json();
        } catch {
          body = {};
        }
      }
      const response = await fetch(targetUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": BACKEND_API_KEY
        },
        body: body ? JSON.stringify(body) : null
      });
      const data = await response.json();
      return json(data);
    }
  } catch (err) {
    console.error(`[Proxy Error] ${slug}:`, err);
    return json({ status: "error", message: "Backend Error" }, { status: 500 });
  }
}
async function POST({ request, params, locals }) {
  return proxyRequest(request, params, "POST", locals);
}
async function GET({ request, params, locals }) {
  return proxyRequest(request, params, "GET", locals);
}
export {
  GET,
  POST
};
