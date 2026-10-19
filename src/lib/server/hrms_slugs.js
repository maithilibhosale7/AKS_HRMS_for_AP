// HRMS PROXY SLUG REGISTRY (F1b)
// Extracted from src/routes/api/[...slug]/+server.js. The shared proxy route
// re-merges this map into SLUG_MAP via one integration line; routing logic
// (string => plain JSON; { path, stream:true } => raw passthrough) is unchanged.

export const HRMS_SLUGS = {

    // --- AKS HRMS / Employee ---
    'get-emp-details-data':   '/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Employee_Details_Data',
    'get-mdata-emp-details':  '/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Master_Data_for_Employee_Details',
    'get-mgr-detail-desg':    '/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Manager_Details_based_on_Designation',
    'save-emp-details':       '/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Save_Employee_Details_Data',
    'get-emp-details-id':     '/API_Files/AKS_HRMS_Management/HRMS_Employee_Management_PHP_Code.php?type=Get_Employee_Details_by_ID',

    // --- AKS HRMS / Attendance ---
    'get-att-mgt-data':   '/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Get_Attendance_Management_Data',
    'add-att-data':       '/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Add_New_Attendance_Entry_Data',
    'save-att-data':      '/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Save_Attendance_Entry_Data',
    'get-att-data-id':    '/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Get_Attendance_Entry_Data_by_ID',
    'get-att-cal-id':     '/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Get_Attendance_Calendar_Data_by_Employee_Self_ID',
    'proc-att-datasheet': { path: '/API_Files/AKS_HRMS_Management/HRMS_Attendance_Management_PHP_Code.php?type=Process_Attendance_Data_Sheet', stream: true },

    // --- AKS HRMS / CompOff ---
    'get-compoff-data':    '/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Get_CompOff_Management_Data',
    'add-compoff-data':    '/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Add_New_CompOff_Entry_Data',
    'save-compoff-data':   '/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Save_CompOff_Entry_Data',
    'get-compoff-data-id': '/API_Files/AKS_HRMS_Management/HRMS_CompOff_Management_PHP_Code.php?type=Get_CompOff_Entry_Data_by_ID',

    // --- AKS HRMS / Leave ---
    'get-leave-data':    '/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Get_Leave_Management_Data',
    'add-leave-data':    '/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Add_New_Leave_Entry_Data',
    'save-leave-data':   '/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Save_Leave_Entry_Data',
    'get-leave-data-id': '/API_Files/AKS_HRMS_Management/HRMS_Leave_Management_PHP_Code.php?type=Get_Leave_Entry_Data_by_ID',

    // --- AKS HRMS / OD ---
    'get-od-data':    '/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Get_OD_Management_Data',
    'add-od-data':    '/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Add_New_OD_Entry_Data',
    'save-od-data':   '/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Save_OD_Entry_Data',
    'get-od-data-id': '/API_Files/AKS_HRMS_Management/HRMS_OD_Management_PHP_Code.php?type=Get_OD_Entry_Data_by_ID',

    // --- AKS HRMS / Expense ---
    'get-expense-data':    '/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Get_Expense_Management_Data',
    'add-expense-data':    '/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Add_New_Expense_Entry_Data',
    'save-expense-data':   '/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Save_Expense_Entry_Data',
    'get-expense-data-id': '/API_Files/AKS_HRMS_Management/HRMS_Expense_Management_PHP_Code.php?type=Get_Expense_Entry_Data_by_ID',

    // --- AKS HRMS / Holiday ---
    'get-holiday-data':      '/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Get_Holiday_Calendar_Data',
    'get-holiday-list-data': '/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Get_Holiday_List_Data',
    'get-holiday-entry-id':  '/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Get_Holiday_Entry_by_ID',
    'save-holiday-entry':    '/API_Files/AKS_HRMS_Management/HRMS_Holiday_Management_PHP_Code.php?type=Save_Holiday_Entry_Data',

    // --- AKS HRMS / RFM ---
    'get-rfm-data':       '/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Get_RFM_Management_Data',
    'get-mstr-data-rfm':  '/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Get_Master_Data_for_RFM_Management',
    'get-rfm-data-id':    '/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Get_RFM_Data_by_ID',
    'save-rfm-data':      '/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Save_RFM_Data',
    'cnv-rfm-onbrdng':    '/API_Files/AKS_HRMS_Management/HRMS_RFM_Management_PHP_Code.php?type=Convert_RFM_to_Onboarding',

    // --- AKS HRMS / Onboarding ---
    'get-onbrdng-data':      '/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Onboarding_Management_Data',
    'get-mstr-data-onbrdng': '/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Master_Data_for_Onboarding_Management',
    'get-onbrdng-tmpl':      '/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Onboarding_Template',
    'get-onbrdng-data-id':   '/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Get_Onboarding_Data_by_ID',
    'save-onbrdng-data':     '/API_Files/AKS_HRMS_Management/HRMS_Onboarding_Management_PHP_Code.php?type=Save_Onboarding_Data',

    // --- AKS HRMS / Exit ---
    'get-ext-data':      '/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Exit_Management_Data',
    'get-mstr-data-ext': '/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Master_Data_for_Exit_Management',
    'get-ext-tmpl':      '/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Exit_Template',
    'get-ext-data-id':   '/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Get_Exit_Data_by_ID',
    'save-ext-data':     '/API_Files/AKS_HRMS_Management/HRMS_Exit_Management_PHP_Code.php?type=Save_Exit_Data',

    // --- AKS HRMS / Payroll ---
    'get-pyrl-data':    '/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Get_Payroll_Management_Table_Data',
    'get-pyrl-data-id': '/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Get_Payroll_Management_Data_by_ID',
    'up-f-pyrl-data':   { path: '/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Upload_Final_Payroll_Data',     stream: true },
    'dwn-att-pyrl':     { path: '/API_Files/AKS_HRMS_Management/HRMS_Payroll_Management_PHP_Code.php?type=Download_Attendance_for_Payroll', stream: true },

    // --- AKS HRMS / Attachments ---
    'hrms-up-attachments':   { path: '/API_Files/AKS_HRMS_Management/HRMS_Attachments_PHP_Code.php?type=Upload_Attachment',   stream: true },
    'hrms-down-attachments': { path: '/API_Files/AKS_HRMS_Management/HRMS_Attachments_PHP_Code.php?type=Download_Attachment', stream: true },

    // --- AKS HRMS / Settings & Master Data ---
    'get-hrms-settings':          '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Get_HRMS_Settings_Data',
    'save-shift-master':          '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Shift_Master',
    'delete-shift-master':        '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Shift_Master',
    'save-work-location-master':  '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Work_Location_Master',
    'delete-work-location-master':'/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Work_Location_Master',
    'save-leave-type-master':     '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Leave_Type_Master',
    'delete-leave-type-master':   '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Leave_Type_Master',
    'save-department':            '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Department',
    'delete-department':          '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Department',
    'save-designation':           '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Designation',
    'delete-designation':         '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Designation',
    'save-attendance-type':       '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Save_Attendance_Type',
    'delete-attendance-type':     '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Delete_Attendance_Type',
    'upload-holidays-bulk':       { path: '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Upload_Holidays_Bulk',      stream: true },
    'upload-leave-balance-bulk':  { path: '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Upload_Leave_Balance_Bulk', stream: true },
    'get-leave-balance-export':   '/API_Files/AKS_HRMS_Management/HRMS_Settings_PHP_Code.php?type=Get_Leave_Balance_Export_Data',

};
