// Common API Paths

// Base API Path - Localhost
export const API_Base_URL = 'http://localhost/Recon/API Files/'; // Base API URL Path

// Base API Path - Actual Server
// export const API_Base_URL = 'https://www.aks-internal-server.com/aks_internal_projects/Project_4/'; // Base API URL Path

// Exportable API Path Variable
export const API_PATHS = {

    API_TestPath : API_Base_URL + 'TestPHPFile.php?type=',

    API_URL_Get_Menu_Map_for_User: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Menu_Map_for_User',
    API_URL_Get_Nav_Menu_for_User: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Nav_Menu_for_User',
    API_URL_Get_Employee_Details: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Employee_Details',
    API_URL_Get_User_Credentials: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_User_Credentials',
    API_URL_Delete_User_Credentials: API_Base_URL + 'System_Operation_PHP_Code.php?type=Delete_User_Credentials',
    API_URL_Update_Central_Master: API_Base_URL + 'System_Operation_PHP_Code.php?type=Update_Central_Master',
    API_URL_Save_Menu_Map_for_User: API_Base_URL + 'System_Operation_PHP_Code.php?type=Save_Menu_Map_for_User',
    API_URL_Generate_OTP: API_Base_URL + 'System_Operation_PHP_Code.php?type=Generate_OTP',
    API_URL_Verfiy_OTP: API_Base_URL + 'System_Operation_PHP_Code.php?type=Verfiy_OTP',
    API_URL_Reset_Password: API_Base_URL + 'System_Operation_PHP_Code.php?type=Reset_Password',

    API_URL_Get_Filter_Condition_for_Page_Information: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Filter_Condition_for_Page_Information',
    API_URL_Get_Action_Dropdown_List: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Action_Dropdown_List',
    API_URL_Update_Action_Dropdown_List: API_Base_URL + 'System_Operation_PHP_Code.php?type=Update_Action_Dropdown_List',
    API_URL_Get_Display_Data_from_Scenario: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Display_Data_from_Scenario',
    API_URL_Get_Linked_Selection_Data: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Linked_Selection_Data',
    API_URL_Get_Display_Data_from_Scenario_Deleted_Entries: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Display_Data_from_Scenario_Deleted_Entries',
    API_URL_Restore_Selected_IDs: API_Base_URL + 'System_Operation_PHP_Code.php?type=Restore_Selected_Records',
    API_URL_Delete_Selected_Records: API_Base_URL + 'System_Operation_PHP_Code.php?type=Delete_Selected_Records',
    API_URL_Get_UniqueValueSet_Display_Scenario_Data: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_UniqueValueSet_Display_Scenario_Data',
    API_URL_Generate_visibleData: API_Base_URL + 'System_Operation_PHP_Code.php?type=Generate_visibleData',

    API_URL_Validate_Data: API_Base_URL + 'System_Operation_PHP_Code.php?type=Validate_Data',
    API_URL_Get_Linked_Selection_Table_Data_Reports: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_Linked_Selection_Table_Data_Reports',
    API_URL_Get_UID_Values: API_Base_URL + 'System_Operation_PHP_Code.php?type=Get_UID_Values',
    API_URL_Update_Filter_Conditions: API_Base_URL + 'System_Operation_PHP_Code.php?type=Update_Filter_Conditions',

    API_URL_Get_Display_Setting_Data: API_Base_URL + 'Display_Settings_PHP_Code.php?type=Get_Display_Setting_Data',
    API_URL_Get_Display_Setting_Data_Deleted_Entries: API_Base_URL + 'Display_Settings_PHP_Code.php?type=Get_Display_Setting_Data_Deleted_Entries',
    API_URL_Get_Main_Table_Data: API_Base_URL + 'Display_Settings_PHP_Code.php?type=Get_Main_Table_Data',
    API_URL_Get_UniqueValueSet_Display_Settings_Data: API_Base_URL + 'Display_Settings_PHP_Code.php?type=Get_UniqueValueSet_Display_Settings_Data',
    API_URL_Generate_Display_Settings_Data: API_Base_URL + 'Display_Settings_PHP_Code.php?type=Generate_Display_Settings_Data',
    API_URL_Save_Display_Settings_Data: API_Base_URL + 'Display_Settings_PHP_Code.php?type=Save_Display_Settings_Data',
    

    API_URL_Initialize_Execution_Information: API_Base_URL + 'Add_Page_PHP_Code.php?type=Initialize_Execution_Information',
    API_URL_Load_Execution_Information: API_Base_URL + 'Add_Page_PHP_Code.php?type=Load_Execution_Information',
    API_URL_APUI_Function_Call: API_Base_URL + 'Add_Page_PHP_Code.php?type=APUI_Call',
    API_URL_Get_Dynamic_Dropdown_Values: API_Base_URL + 'Add_Page_PHP_Code.php?type=Get_Dynamic_Dropdown_Values',
    API_URL_Get_Linked_Selection_Table_Data: API_Base_URL + 'Add_Page_PHP_Code.php?type=Get_Linked_Selection_Table_Data',
    API_URL_Generate_Linked_Addition_Row: API_Base_URL + 'Add_Page_PHP_Code.php?type=Generate_Linked_Addition_Row',
    API_URL_Insert_Form_Data: API_Base_URL + 'Add_Page_PHP_Code.php?type=Insert_Form_Data',

    API_URL_Get_Linked_Selection_Selected_IDs_Data: API_Base_URL + 'Add_Page_PHP_Code.php?type=Get_Linked_Selection_Selected_IDs_Data',

    API_URL_Generate_Scenario_Config_Data: API_Base_URL + 'Add_Page_PHP_Code.php?type=Generate_Scenario_Config_Data',
    API_URL_Execute_Scenario_Config: API_Base_URL + 'Add_Page_PHP_Code.php?type=Execute_Scenario_Config',

    
    API_URL_Report_Code_Gen: API_Base_URL + 'Report_Code_Gen.php?type=',
    API_URL_Get_Corporate_Report_Masters: API_Base_URL + 'Report_Code_Gen.php?type=Get_Corporate_Report_Masters',
    API_URL_Get_All_Corporate_Employee_Data: API_Base_URL + 'Report_Code_Gen.php?type=Get_All_Corporate_Employee_Data',
    API_URL_Corporate_PMS_Report: API_Base_URL + 'Report_Code_Gen.php?type=Corporate_PMS_Report',
    API_URL_Get_All_Sales_Person_Data: API_Base_URL + 'Report_Code_Gen.php?type=Get_All_Sales_Person_Data',
    
    // Sales Hierarchy Management
    API_URL_Get_Sales_Hierarchy_Data: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Get_Sales_Hierarchy_Data',
    API_URL_Generate_Update_Request_for_Approval: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Generate_Update_Request_for_Approval',
    API_URL_Get_Sales_Person_Updates_Data: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Get_Sales_Person_Updates_Data',
    API_URL_Approve_Sales_Person_Update: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Approve_Sales_Person_Update',
    API_URL_Reject_Sales_Person_Update: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Reject_Sales_Person_Update',
    API_URL_Generate_Update_Position_Request_for_Approval: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Generate_Update_Position_Request_for_Approval',
    API_URL_Generate_Update_HQ_Request_for_Approval: API_Base_URL + 'Sales_Hierarchy_Management_PHP_Code.php?type=Generate_Update_HQ_Request_for_Approval',
    
    // Corporate Hierarchy Management
    API_URL_Get_Corporate_Hierarchy_Data: API_Base_URL + 'Corporate_Hierarchy_Management.php?type=Get_Employee_Self_Details',
    API_URL_Generate_Update_Request_for_Approval_Corporate: API_Base_URL + 'Corporate_Hierarchy_Management.php?type=Generate_Update_Request_for_Approval',
    API_URL_Get_Corporate_Employee_Updates_Data: API_Base_URL + 'Corporate_Hierarchy_Management.php?type=Get_Corporate_Employee_Updates_Data',
    API_URL_Approve_Corporate_Employee_Update: API_Base_URL + 'Corporate_Hierarchy_Management.php?type=Approve_Corporate_Employee_Update',
    API_URL_Reject_Corporate_Employee_Update: API_Base_URL + 'Corporate_Hierarchy_Management.php?type=Reject_Corporate_Employee_Update',

    // Sale Portal Data Upload
    API_URL_Generate_SQL_Statements: API_Base_URL + 'Sale_Portal_Data_Upload.php?type=Generate_SQL_Statements',
    API_URL_Upload_to_DB: API_Base_URL + 'Sale_Portal_Data_Upload.php?type=Upload_to_DB',

    // KRA KPI Management
    API_URL_KRA_KPI_Get_Table_View_Data: API_Base_URL + 'Save_KRA_KPI.php?type=KRA_KPI_Get_Table_View_Data', // TableView Page - Masters
    API_URL_Get_Employee_Self_Data: API_Base_URL + 'Save_KRA_KPI.php?type=Get_Employee_Self_Data', // Add Page - Masters
    API_URL_Save_KRA_KPI: API_Base_URL + 'Save_KRA_KPI.php?type=Save_New_KRA_KPI_Master', // Add Page - Masters
    API_URL_Get_KRA_KPI: API_Base_URL + 'Save_KRA_KPI.php?type=Get_KRA_KPI_Master_by_ID', // Edit Page - Masters
    API_URL_Edit_KRA_KPI: API_Base_URL + 'Save_KRA_KPI.php?type=Save_Update_KRA_KPI_Master', // Edit Page - Masters
    API_URL_Start_PMS_Cycle_for_Departments: API_Base_URL + 'Save_KRA_KPI.php?type=Start_PMS_Cycle_for_Departments',
    API_URL_Check_Ongoing_Transaction: API_Base_URL + 'Save_KRA_KPI.php?type=Check_Ongoing_Transaction',
    API_URL_Sync_New_KRA_KPI_To_Transaction: API_Base_URL + 'Save_KRA_KPI.php?type=Sync_New_KRA_KPI_To_Transaction',

    API_URL_Get_Table_Info_KRA_KPI_Trans: API_Base_URL + 'Save_KRA_KPI.php?type=KRA_KPI_Get_Transaction_Info', // TableView Page - Transaction
    API_URL_Get_KRA_KPI_Master_Data: API_Base_URL + 'Save_KRA_KPI.php?type=Get_KRA_KPI_Master_Data', // Add Page - Transaction
    API_URL_Save_KRA_KPI_Transaction: API_Base_URL + 'Save_KRA_KPI.php?type=Save_KRA_KPI_Transaction', // Add Page - Transaction
    API_URL_Get_KRA_KPI_Transaction_Data: API_Base_URL + 'Save_KRA_KPI.php?type=Get_KRA_KPI_Transaction_Data', // Edit Page - Transaction
    API_URL_Update_KRA_KPI_Transaction: API_Base_URL + 'Save_KRA_KPI.php?type=Save_Update_KRA_KPI_Transaction',
    
    
    API_URL_Masters: API_Base_URL + 'Save_KRA_KPI.php?type=get_kra_kpi_masters',

    API_URL_Send_PMS_Bulk_Emails: API_Base_URL + 'Send_PMS_Email_PHP_Code.php?type=Send_PMS_Bulk_Emails',

    
};