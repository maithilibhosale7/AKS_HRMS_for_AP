// Project 4 performance and corporate paths.
// Screens call these names. The proxy maps each slug to the PHP already in AKS_HRMS_Management.

const BASE = '/api';

export const API_PATHS_RECON = {
    API_URL_Report_Code_Gen: `${BASE}/report-code-gen?type=`,
    API_URL_Get_Corporate_Report_Masters: `${BASE}/get-corporate-report-masters`,
    API_URL_Get_All_Corporate_Employee_Data: `${BASE}/get-all-corporate-employee-data`,
    API_URL_Corporate_PMS_Report: `${BASE}/corporate-pms-report`,

    API_URL_Get_Corporate_Hierarchy_Data: `${BASE}/get-corporate-hierarchy-data`,
    API_URL_Generate_Update_Request_for_Approval_Corporate: `${BASE}/generate-corporate-update-request`,
    API_URL_Get_Corporate_Employee_Updates_Data: `${BASE}/get-corporate-employee-updates`,
    API_URL_Approve_Corporate_Employee_Update: `${BASE}/approve-corporate-employee-update`,
    API_URL_Reject_Corporate_Employee_Update: `${BASE}/reject-corporate-employee-update`,

    API_URL_KRA_KPI_Get_Table_View_Data: `${BASE}/kra-kpi-table-view`,
    API_URL_Get_Employee_Self_Data: `${BASE}/kra-get-employee-self`,
    API_URL_Save_KRA_KPI: `${BASE}/kra-save-master`,
    API_URL_Get_KRA_KPI: `${BASE}/kra-get-master`,
    API_URL_Edit_KRA_KPI: `${BASE}/kra-edit-master`,
    API_URL_Start_PMS_Cycle_for_Departments: `${BASE}/kra-start-pms-cycle`,
    API_URL_Check_Ongoing_Transaction: `${BASE}/kra-check-ongoing`,
    API_URL_Sync_New_KRA_KPI_To_Transaction: `${BASE}/kra-sync-to-transaction`,

    API_URL_Get_Table_Info_KRA_KPI_Trans: `${BASE}/kra-trans-table-info`,
    API_URL_Get_KRA_KPI_Master_Data: `${BASE}/kra-get-master-data`,
    API_URL_Save_KRA_KPI_Transaction: `${BASE}/kra-save-transaction`,
    API_URL_Get_KRA_KPI_Transaction_Data: `${BASE}/kra-get-transaction`,
    API_URL_Update_KRA_KPI_Transaction: `${BASE}/kra-update-transaction`,
    API_URL_Masters: `${BASE}/kra-get-masters`,

    API_URL_Send_PMS_Bulk_Emails: `${BASE}/send-pms-bulk-emails`,
};
