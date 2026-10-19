import { json } from '@sveltejs/kit';
import { VITE_API_BASE_URL, BACKEND_API_KEY } from '$env/static/private';
import { HRMS_SLUGS } from '$lib/server/hrms_slugs.js';
import { RECON_SLUGS } from '$lib/server/recon_slugs.js';

// Maps clean slugs → PHP path (with type baked in).
// Entries with stream:true bypass JSON parsing and return the raw response body
// (used for multipart uploads, binary downloads, and PDF exports).
// HRMS slug entries live in $lib/server/hrms_slugs.js and are re-merged into
// SLUG_MAP below via a single integration line.
const CORE_SLUGS = {

    // --- API Tester ---
    'gateway' : '/API_Files/',

    // --- AI.RA Chatbot ---
    'hey-akschatbot':   '/API_Files/Endpoints/AIRA/Gatekeeper_Controller.php',
    'schema-builder':   '/API_Files/Endpoints/AIRA/Builders/Schema_Builder_Controller.php',
    'display-settings-builder': '/API_Files/Endpoints/AIRA/Builders/Display_Settings_Builder_Controller.php',
    'scenario-setup-builder': '/API_Files/Endpoints/AIRA/Builders/Scenario_Setup_Builder_Controller.php',
    'menu-map-builder':       '/API_Files/Endpoints/AIRA/Builders/Menu_Map_Builder_Controller.php',
    'scenario-config-builder': '/API_Files/Endpoints/AIRA/Builders/Scenario_Config_Builder_Controller.php',
    'architect-plan':    '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Plan',
    'architect-approve': '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Approve',
    'architect-status':     '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Status',
    'architect-resume':          '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Resume',
    'architect-reject':          '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Reject',
    'architect-regenerate':      '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Regenerate',
    'architect-rollback-review': '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Rollback_Review',
    'architect-execute-rollback':'/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Execute_Rollback',
    'architect-continue':          '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Continue',
    'architect-conversation-load': '/API_Files/Endpoints/AIRA/Architect/Architect_Controller.php?type=Conversation_Load',
    'architect-file-intake': { path: '/API_Files/Endpoints/AIRA/Architect/Architect_File_Intake_Controller.php', stream: true },
    'asset-map':             '/API_Files/AIRA/Architect/Asset_Map_Controller.php',
    'ok-rbc-bot':       '/API_Files/Endpoints/AIRA/Builders/Report_Builder_Controller.php',
    'ok-dhbc-bot':      '/API_Files/Endpoints/AIRA/Builders/Dashboard_Builder_Controller.php',
    'ok-dcbc-bot':      '/API_Files/Endpoints/AIRA/Builders/Document_Builder_Controller.php',
    'tableview-assist':     '/API_Files/Endpoints/AIRA/Assistants/TableView_Assist_Controller.php',
    'dataentry-assist':     '/API_Files/Endpoints/AIRA/Assistants/DataEntry_Assist_Controller.php',
    'report-viewer-assist': '/API_Files/Endpoints/AIRA/Assistants/ReportViewer_Assist_Controller.php',
    'query-compiler':       '/API_Files/Endpoints/AIRA/Assistants/Query_Compiler_Controller.php',

    // --- Field Dreams ---
    'get-field-dreams-plan':      '/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Get_Dreams_Plan',
    'run-algo-relev':             '/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Run_Algorithm_Relevance',
    'run-field-dreams-for-table': '/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Run_Field_Dreams_For_Table',
    'run-linked-fields-pass':     '/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Run_Linked_Fields_Pass',
    'get-field-context':          '/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Get_Field_Context',
    'edit-field-context':         '/API_Files/AIRA/Dreams/Field_Dreams/Field_Dreams.php?type=Edit_Field_Context',

    // --- Table Dreams ---
    'get-table-dreams-plan':      '/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Get_Table_Dreams_Plan',
    'run-table-dreams-for-table': '/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Run_Table_Dreams_For_Table',
    'get-table-context':          '/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Get_Table_Context',
    'edit-table-context':         '/API_Files/AIRA/Dreams/Table_Dreams/Table_Dreams.php?type=Edit_Table_Context',

    // --- Scenario Dreams ---
    'get-scenario-dreams-plan':       '/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Get_Scenario_Dreams_Plan',
    'run-scenario-dreams-for-table':  '/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Run_Scenario_Dreams_For_Table',
    'get-scenario-context':           '/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Get_Scenario_Context',
    'edit-scenario-context':          '/API_Files/AIRA/Dreams/Scenario_Dreams/Scenario_Dreams.php?type=Edit_Scenario_Context',

    // --- Algorithm Dreams ---
    'get-algorithm-dreams-plan':  '/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Get_Algorithm_Dreams_Plan',
    'run-algorithm-dreams-batch': '/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Run_Algorithm_Dreams_Batch',
    'get-algorithm-context':      '/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Get_Algorithm_Context',
    'edit-algorithm-context':     '/API_Files/AIRA/Dreams/Algorithm_Dreams/Algorithm_Dreams.php?type=Edit_Algorithm_Context',

    // --- Asset Dreams ---
    'get-asset-dreams-plan':     '/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Get_Asset_Dreams_Plan',
    'run-asset-dreams-for-type': '/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Run_Asset_Dreams_For_Type',
    'get-asset-context':         '/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Get_Asset_Context',
    'edit-asset-context':        '/API_Files/AIRA/Dreams/Asset_Dreams/Asset_Dreams.php?type=Edit_Asset_Context',

    // --- Access Dreams ---
    'get-access-dreams-plan':   '/API_Files/AIRA/Dreams/Access_Dreams/Access_Dreams.php?type=Get_Access_Dreams_Plan',
    'run-access-dreams-batch':  '/API_Files/AIRA/Dreams/Access_Dreams/Access_Dreams.php?type=Run_Access_Dreams_Batch',

    // --- Dreams Compile ---
    'get-identity-status':    '/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Get_Identity_Status',
    'get-identity-section':   '/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Get_Identity_Section',
    'run-compile-section':    '/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Run_Compile_Section',
    'run-compile-all':        '/API_Files/AIRA/Dreams/Compile/Identity_Compiler.php?type=Run_Compile_All',

    // --- User Activity ---
    'track-user-activity':    '/API_Files/User_Management/User_Management_PHP_Code.php?type=Track_User_Activity',
    'get-user-list-for-logs': '/API_Files/User_Management/User_Management_PHP_Code.php?type=Get_User_List_For_Logs',
    'get-user-activity-logs': '/API_Files/User_Management/User_Management_PHP_Code.php?type=Get_User_Activity_Logs',

    // --- User Context (additive Phase 2 — unconsumed; legacy paths above remain authoritative) ---
    'get-user-context':      '/API_Files/Endpoints/User_Context.php?type=Get_User_Context',
    'get-user-information':  '/API_Files/Endpoints/User_Information.php?type=Get_User_Information',
    'save-module-access':    '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Save_Module_Access',

    // --- Module Access ---
    'get-menu-map':          '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Menu_Map_for_User',
    'get-employee-details':  '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Employee_Details',
    'get-user-credentials':  '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_User_Credentials',
    'delete-user-creds':     '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Delete_User_Credentials',
    'update-central-master': '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Update_Central_Master',
    'get-dashboards':        '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Dashboards_for_User',
    'get-reports':                  '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_Reports_for_User',
    'save-report-categorization':   '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Save_Report_Categorization',
    'get-hrms-access':              '/API_Files/Project_Setup_Management/Module_Access_Management_PHP_Code.php?type=Get_HRMS_for_User',

    // --- Menu Map Setup ---
    'get-menu-map-mm':    '/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Get_Menu_Map_Data',
    'get-setup-data-mm':  '/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Get_All_Setup_Data',
    'update-menu-map-mm': '/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Update_Menu_Map_Data',
    'review-menu-map-mm': '/API_Files/Project_Setup_Management/Menu_Map_Management_PHP_Code.php?type=Review_Menu_Map_Data',

    // --- Data Table Setup ---
    'get-table-list-dt':                  '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Get_Table_List',
    'get-new-table-data-dt':              '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Get_New_Table_Data',
    'get-data-table-structure-dt':        '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Get_Data_Table_Structure',
    'get-update-data-table-sql-query-dt': '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Update_Data_Table_SQL_Query',
    'review-data-table-sql-query-dt':     '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Review_Data_Table_SQL_Query',
    'execute-data-table-sql-query-dt':    '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Execute_Data_Table_SQL_Query',
    'update-scenarios-for-dt-dt':         '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Update_Scenario_IDs_for_Table_Name',
    'update-display-settings-for-dt-dt':  '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Update_Display_Settings_IDs_for_Table_Name',
    'call-gemini-schema-copilot':         '/API_Files/Project_Setup_Management/Data_Table_Management_PHP_Code.php?type=Call_Gemini_Schema_Copilot', // DEAD — Data Table AI routed through ok-dts-bot

    // --- Display Settings ---
    'get-table-list-ds-list-ds':  '/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Get_User_List_and_Table_List_for_Display_Settings',
    'generate-ds-data-ds':        '/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Generate_Display_Settings_Data',
    'get-ds-data-by-id-ds':       '/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Get_Display_Settings_Data_by_ID',
    'generate-ds-map-preview-ds': '/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Generate_Display_Settings_Map_Preview',
    'save-ds-data-ds':            '/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Save_Display_Settings_Data',
    'save-ds-data-for-users-ds':  '/API_Files/Project_Setup_Management/Display_Settings_Management_PHP_Code.php?type=Save_Display_Settings_Data_for_Users',

    // --- Scenario Setup ---
    'get-table-scenario-list-ss': '/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Get_Table_List_and_Scenario_List',
    'get-apui-data-ss':           '/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Get_APUI_Conditions_Data',
    'generate-scenario-data-ss':  '/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Generate_Scenario_Data',
    'save-scenario-data-ss':      '/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Save_Scenario_Data',
    'save-apui-ss':               '/API_Files/Project_Setup_Management/Scenario_Management_PHP_Code.php?type=Save_APUI_Conditions',

    // --- Flowchart / Scenario Config Setup ---
    'get-lists-flowchart-fc':  '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Lists_for_Flowchart',
    'get-scenario-config-fc':  '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Scenario_Config',
    'save-scenario-config-fc': '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Save_Scenario_Config',
    'save-algorithm':          '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Save_Algorithm',
    'save-notification-rule':     '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Save_Notification_Rule',
    'get-notification-users':     '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Notification_Users',
    'get-notification-rules':     '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Notification_Rules',
    'get-notification-documents': '/API_Files/Project_Setup_Management/Scenario_Configuration_Management_PHP_Code.php?type=Get_Notification_Documents',

    // --- Notifications ---
    'get-unseen-notif-count': '/API_Files/Endpoints/Notification_Management.php?type=Get_Unseen_Count',
    'get-unseen-notifs':      '/API_Files/Endpoints/Notification_Management.php?type=Get_Unseen_List',
    'get-notif-history':      '/API_Files/Endpoints/Notification_Management.php?type=Get_History_Page',
    'mark-notifs-status':     '/API_Files/Endpoints/Notification_Management.php?type=Mark_Status',

    // --- Report Builder ---
    'report-builder-init':              '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Get_Report_Builder_Initial_Data',
    'report-builder-get-config':        '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Get_Report_Configuration',
    'report-builder-generate':          '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Generate_Report_With_AI', // DEAD — AI generation routed through ok-rbc-bot
    'report-builder-save':              '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Save_Report_Configuration',
    'report-builder-execute':           '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Execute_Report',
    'get-dynamic-filter-options':       '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Get_Dynamic_Filter_Options',
    'autopopulate-linked-selection':    '/API_Files/Project_Setup_Management/Report_Management_PHP_Code.php?type=Autopopulate_Linked_Selection_Pop_Up',

    // --- Document Builder ---
    'doc-builder-init':       '/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Get_Document_Builder_Initial_Data',
    'doc-builder-get-config': '/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Get_Document_Configuration',
    'doc-builder-generate':   '/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Generate_Document_With_AI', // DEAD — AI generation routed through ok-dcbc-bot
    'doc-builder-save':       '/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Save_Document_Configuration',
    'doc-builder-execute':    '/API_Files/Project_Setup_Management/Document_Management_PHP_Code.php?type=Execute_Document',
    // --- Dashboard Builder ---
    'dash-builder-init':       '/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Get_Dashboard_Builder_Initial_Data',
    'dash-builder-get-config': '/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Get_Dashboard_Configuration',
    'dash-builder-generate':   '/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Generate_Dashboard_With_AI', // DEAD — AI generation routed through ok-dhbc-bot
    'dash-builder-save':       '/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Save_Dashboard_Configuration',
    'dash-builder-execute':    '/API_Files/Project_Setup_Management/Dashboard_Management_PHP_Code.php?type=Execute_Dashboard',

    // --- TableView ---
    'tableview-management':       '/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Validate_Action_Condition',
    'filter-action-dropdown':     '/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Filter_Action_Dropdown_List',
    'get-display-data-s':         '/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_Display_Data_for_Scenario',
    'get-display-data-ds':        '/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_Display_Data_for_Display_Setting',
    'get-display-data-s-unique':  '/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_UniqueValueSet_Display_Scenario_Data',   // DEAD — UniqueValueSet built client-side in TableView.svelte
    'get-display-data-ds-unique': '/API_Files/TableView_Management/TableView_Management_PHP_Code.php?type=Get_UniqueValueSet_Display_Settings_Data', // DEAD — UniqueValueSet built client-side in TableView.svelte

    // --- DataEntry ---
    'init-exec-info':    '/API_Files/Endpoints/DataEntry_Management.php?type=Initialize_Execution_Information',
    'run-apui-call':     '/API_Files/Endpoints/DataEntry_Management.php?type=Run_APUI_Call',
    'add-la-row':        '/API_Files/Endpoints/DataEntry_Management.php?type=Add_Linked_Addition_Row',
    'submit-de':         '/API_Files/Endpoints/DataEntry_Management.php?type=Submit_DataEntry',
    'clear-apui-cache':  '/API_Files/Endpoints/DataEntry_Management.php?type=Clear_APUI_Cache',

    // --- Attachments (raw stream — preserves multipart boundary for uploads, binary body for downloads) ---
    'upload-attachment':   { path: '/API_Files/DataEntry_Management/AKS_Attachments_Management.php?type=Upload_Attachment',   stream: true },
    'download-attachment': { path: '/API_Files/DataEntry_Management/AKS_Attachments_Management.php?type=Download_Attachment', stream: true },

    // --- ScenarioConfig ---
    'gen-sc-obj':  '/API_Files/Endpoints/ScenarioConfig_Management.php?type=Generate_Scenario_Config_Object',
    'gen-exe-obj': '/API_Files/Endpoints/ScenarioConfig_Management.php?type=Generate_Execution_Information_Object',
    'upd-exe-obj': '/API_Files/Endpoints/ScenarioConfig_Management.php?type=Update_Execution_Information_Object',

    // --- PPC Custom Views ---
    'get-cust-wise-ppc-dph-plng': '/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_PPC_Dispatch_Data',
    'get-cust-wise-ppc-wo-plng':  '/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_PPC_Work_Order_Data',
    'get-display-data-lot-master': '/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_Lot_Master_Data',
    'get-display-data-mat-req':    '/API_Files/Project_Customizations/Custom_Display_Settings_PHP_Code.php?type=Get_Material_Requisition_Data',

    // --- Tally XML Export ---
    'tally-xml': '/API_Files/Project_Customizations/Tally_XML_Management_PHP_Code.php?type=report_xml',

    // --- Sales KYC Form ---
    'get-kyc-by-id': '/API_Files/Project_Customizations/KYC_Management_PHP_Code.php?type=Get_Sales_KYC_Form_by_ID',
    'save-kyc':      '/API_Files/Project_Customizations/KYC_Management_PHP_Code.php?type=Save_Sales_KYC_Form_Data',

};

const SLUG_MAP = { ...CORE_SLUGS, ...HRMS_SLUGS, ...RECON_SLUGS };

// Admin-only slug set — gated to Master_User_ID === 1 at the proxy.
// Covers Project Setup / admin ops (Module Access, Setup builders, audit
// log readers, Tally export, admin API Tester). Self-service slugs and
// HRMS role-gated slugs are intentionally absent. AIRA (Chatbot, Builders,
// Architect, Assistants, Dreams, Compile) is intentionally NOT gated here —
// deferred to a future AI restructuring pass.
const ADMIN_ONLY_SLUGS = new Set([
    // Module Access (Project Setup)
    'get-employee-details','get-user-credentials','get-menu-map','delete-user-creds',
    'update-central-master','get-dashboards','get-reports',
    'save-report-categorization','get-hrms-access','save-module-access',
    // Menu Map Setup
    'get-menu-map-mm','get-setup-data-mm','update-menu-map-mm','review-menu-map-mm',
    // Data Table Setup
    'get-table-list-dt','get-new-table-data-dt','get-data-table-structure-dt',
    'get-update-data-table-sql-query-dt','review-data-table-sql-query-dt',
    'execute-data-table-sql-query-dt','update-scenarios-for-dt-dt',
    'update-display-settings-for-dt-dt','call-gemini-schema-copilot',
    // Display Settings
    'get-table-list-ds-list-ds','generate-ds-data-ds','get-ds-data-by-id-ds',
    'generate-ds-map-preview-ds','save-ds-data-ds','save-ds-data-for-users-ds',
    // Scenario Setup
    'get-table-scenario-list-ss','get-apui-data-ss','generate-scenario-data-ss',
    'save-scenario-data-ss','save-apui-ss',
    // Scenario Configuration / Flowchart
    'get-lists-flowchart-fc','get-scenario-config-fc','save-scenario-config-fc',
    'save-algorithm','save-notification-rule','get-notification-users',
    'get-notification-rules','get-notification-documents',
    // Report / Document / Dashboard BUILDER (execute slugs are NOT in this set)
    'report-builder-init','report-builder-get-config','report-builder-save','report-builder-generate',
    'doc-builder-init','doc-builder-get-config','doc-builder-save','doc-builder-generate',
    'dash-builder-init','dash-builder-get-config','dash-builder-save','dash-builder-generate',
    // User Activity audit (read)
    'get-user-list-for-logs','get-user-activity-logs',
    // Tally export
    'tally-xml',
    // Admin API tester (also covers 'gateway/<path>' suffix — see isAdminOnlySlug below)
    'gateway',
]);

function isAdminOnlySlug(slug) {
    // Exact match OR custom-path under 'gateway/' — both are admin-only.
    return ADMIN_ONLY_SLUGS.has(slug) || slug.startsWith('gateway/');
}

// Resolve a custom 'gateway/<path>' slug for the admin API Tester.
// Returns a path string under /API_Files/, or null if the suffix is unsafe.
// SECURITY: confines the pass-through to /API_Files/ on VITE_API_BASE_URL —
// rejects path traversal and any absolute URL / scheme. Validates on a
// freshly-decoded copy (catches %2E%2E-style double encoding) but forwards
// the original suffix so legitimate %XX sequences in paths survive intact.
function resolveGatewayCustomPath(slug) {
    if (!slug.startsWith('gateway/')) return null;
    const suffix = slug.slice('gateway/'.length);
    if (!suffix) return null;

    let decoded;
    try { decoded = decodeURIComponent(suffix); } catch { return null; }

    if (decoded.includes('..')) return null;
    if (decoded.startsWith('/')) return null;
    if (/^[a-z][a-z0-9+\-.]*:/i.test(decoded)) return null;

    return '/API_Files/' + suffix;
}

async function proxyRequest(request, params, method, locals = {}) {
    const slug = params.slug;

    if (isAdminOnlySlug(slug) && Number(locals?.user?.user_id) !== 1) {
        return json(
            { status: 'error', message: 'Forbidden: admin access required.' },
            { status: 403 }
        );
    }

    let entry = SLUG_MAP[slug];

    if (!entry) {
        const customPath = resolveGatewayCustomPath(slug);
        if (customPath) entry = customPath;
    }

    if (!entry) {
        return json({ status: 'error', message: 'Unknown Endpoint', error: slug }, { status: 404 });
    }

    const isStream = typeof entry === 'object' && entry.stream;
    const phpPath  = typeof entry === 'string' ? entry : entry.path;
    // F-DE-8: forward any query params from the original request (e.g. ?file=... for download-attachment).
    // Use & if phpPath already has ?type=..., otherwise use ? (e.g. asset-map has no type param).
    const reqUrl      = new URL(request.url);
    const extraParams = reqUrl.searchParams.toString();
    const separator   = phpPath.includes('?') ? '&' : '?';
    const targetUrl   = extraParams
        ? `${VITE_API_BASE_URL}${phpPath}${separator}${extraParams}`
        : `${VITE_API_BASE_URL}${phpPath}`;

    try {
        if (isStream) {
            // Raw passthrough — preserves multipart boundaries, binary blobs, and PDF streams.
            const headers = new Headers(request.headers);
            headers.set('X-API-KEY', BACKEND_API_KEY);
            headers.delete('host');

            const fetchOptions = { method, headers };
            if (method === 'POST') {
                fetchOptions.body   = request.body;
                fetchOptions.duplex = 'half';
            }

            const phpResponse = await fetch(targetUrl, fetchOptions);
            return new Response(phpResponse.body, {
                status:  phpResponse.status,
                headers: phpResponse.headers
            });
        } else {
            // Standard JSON exchange.
            let body = null;
            if (method === 'POST') {
                try { body = await request.json(); } catch { body = {}; }
            }

            if (slug === 'get-user-information') {
                const sessionUserId = Number(locals?.user?.user_id);
                if (!sessionUserId) {
                    return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
                }
                body = { ...(body || {}), Master_User_ID: sessionUserId };
            }

            const response = await fetch(targetUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY':    BACKEND_API_KEY
                },
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();
            return json(data);
        }
    } catch (err) {
        console.error(`[Proxy Error] ${slug}:`, err);
        return json({ status: 'error', message: 'Backend Error' }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, params, locals }) {
    return proxyRequest(request, params, 'POST', locals);
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, params, locals }) {
    return proxyRequest(request, params, 'GET', locals);
}
