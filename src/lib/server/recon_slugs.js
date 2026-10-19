// Project 4 performance and corporate proxy slugs.

const KRA = '/API_Files/AKS_HRMS_Management/Save_KRA_KPI.php';
const CORP = '/API_Files/AKS_HRMS_Management/Corporate_Hierarchy_Management.php';
const REPORT = '/API_Files/AKS_HRMS_Management/Report_Code_Gen.php';
const MAIL = '/API_Files/AKS_HRMS_Management/Send_PMS_Email_PHP_Code.php';

export const RECON_SLUGS = {
    'report-code-gen': REPORT,
    'get-corporate-report-masters': `${REPORT}?type=Get_Corporate_Report_Masters`,
    'get-all-corporate-employee-data': `${REPORT}?type=Get_All_Corporate_Employee_Data`,
    'corporate-pms-report': `${REPORT}?type=Corporate_PMS_Report`,

    'get-corporate-hierarchy-data': `${CORP}?type=Get_Employee_Self_Details`,
    'generate-corporate-update-request': `${CORP}?type=Generate_Update_Request_for_Approval`,
    'get-corporate-employee-updates': `${CORP}?type=Get_Corporate_Employee_Updates_Data`,
    'approve-corporate-employee-update': `${CORP}?type=Approve_Corporate_Employee_Update`,
    'reject-corporate-employee-update': `${CORP}?type=Reject_Corporate_Employee_Update`,

    'kra-kpi-table-view': `${KRA}?type=KRA_KPI_Get_Table_View_Data`,
    'kra-get-employee-self': `${KRA}?type=Get_Employee_Self_Data`,
    'kra-save-master': `${KRA}?type=Save_New_KRA_KPI_Master`,
    'kra-get-master': `${KRA}?type=Get_KRA_KPI_Master_by_ID`,
    'kra-edit-master': `${KRA}?type=Save_Update_KRA_KPI_Master`,
    'kra-start-pms-cycle': `${KRA}?type=Start_PMS_Cycle_for_Departments`,
    'kra-check-ongoing': `${KRA}?type=Check_Ongoing_Transaction`,
    'kra-sync-to-transaction': `${KRA}?type=Sync_New_KRA_KPI_To_Transaction`,
    'kra-trans-table-info': `${KRA}?type=KRA_KPI_Get_Transaction_Info`,
    'kra-get-master-data': `${KRA}?type=Get_KRA_KPI_Master_Data`,
    'kra-save-transaction': `${KRA}?type=Save_KRA_KPI_Transaction`,
    'kra-get-transaction': `${KRA}?type=Get_KRA_KPI_Transaction_Data`,
    'kra-update-transaction': `${KRA}?type=Save_Update_KRA_KPI_Transaction`,
    'kra-get-masters': `${KRA}?type=get_kra_kpi_masters`,

    'send-pms-bulk-emails': `${MAIL}?type=Send_PMS_Bulk_Emails`,
};
