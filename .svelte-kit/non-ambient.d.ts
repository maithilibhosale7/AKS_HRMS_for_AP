
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/AKS_HRMS" | "/AKS_HRMS/HR_Admin_Dashboard" | "/AKS_HRMS/User_Dashboard" | "/Corporate_Hierarchy_Approval" | "/Corporate_Hierarchy" | "/KRA_KPI_Master_Add" | "/KRA_KPI_Master_Edit" | "/KRA_KPI_Trans_Add" | "/KRA_KPI_Trans_Edit" | "/KRA_KPI_Transaction" | "/KRA_KPI" | "/Project_Documents" | "/Project_Documents/PMS_Report" | "/Project_Reports" | "/Project_Reports/All_Corporate_Employee_Data" | "/Project_Reports/Corporate_PMS_Report_All_Data" | "/Project_Reports/Corporate_PMS_Report_Department_Wise" | "/Project_Reports/Corporate_PMS_Report" | "/Project_Reports/Deviation_Report" | "/Project_Reports/Individual_Performance" | "/Project_Reports/PMS_Graph_Report_2" | "/Project_Reports/PMS_Graph_Report" | "/Project_Setup" | "/Project_Setup/Module_Access" | "/Project_Setup/User_Activity_Logs" | "/api" | "/api/[...slug]" | "/auth" | "/auth/forgot-password" | "/auth/login" | "/auth/logout" | "/auth/reset-password" | "/no-access" | "/profile";
		RouteParams(): {
			"/api/[...slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { slug?: string };
			"/AKS_HRMS": Record<string, never>;
			"/AKS_HRMS/HR_Admin_Dashboard": Record<string, never>;
			"/AKS_HRMS/User_Dashboard": Record<string, never>;
			"/Corporate_Hierarchy_Approval": Record<string, never>;
			"/Corporate_Hierarchy": Record<string, never>;
			"/KRA_KPI_Master_Add": Record<string, never>;
			"/KRA_KPI_Master_Edit": Record<string, never>;
			"/KRA_KPI_Trans_Add": Record<string, never>;
			"/KRA_KPI_Trans_Edit": Record<string, never>;
			"/KRA_KPI_Transaction": Record<string, never>;
			"/KRA_KPI": Record<string, never>;
			"/Project_Documents": Record<string, never>;
			"/Project_Documents/PMS_Report": Record<string, never>;
			"/Project_Reports": Record<string, never>;
			"/Project_Reports/All_Corporate_Employee_Data": Record<string, never>;
			"/Project_Reports/Corporate_PMS_Report_All_Data": Record<string, never>;
			"/Project_Reports/Corporate_PMS_Report_Department_Wise": Record<string, never>;
			"/Project_Reports/Corporate_PMS_Report": Record<string, never>;
			"/Project_Reports/Deviation_Report": Record<string, never>;
			"/Project_Reports/Individual_Performance": Record<string, never>;
			"/Project_Reports/PMS_Graph_Report_2": Record<string, never>;
			"/Project_Reports/PMS_Graph_Report": Record<string, never>;
			"/Project_Setup": Record<string, never>;
			"/Project_Setup/Module_Access": Record<string, never>;
			"/Project_Setup/User_Activity_Logs": Record<string, never>;
			"/api": { slug?: string };
			"/api/[...slug]": { slug: string };
			"/auth": Record<string, never>;
			"/auth/forgot-password": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/auth/logout": Record<string, never>;
			"/auth/reset-password": Record<string, never>;
			"/no-access": Record<string, never>;
			"/profile": Record<string, never>
		};
		Pathname(): "/" | "/AKS_HRMS" | "/AKS_HRMS/" | "/AKS_HRMS/HR_Admin_Dashboard" | "/AKS_HRMS/HR_Admin_Dashboard/" | "/AKS_HRMS/User_Dashboard" | "/AKS_HRMS/User_Dashboard/" | "/Corporate_Hierarchy_Approval" | "/Corporate_Hierarchy_Approval/" | "/Corporate_Hierarchy" | "/Corporate_Hierarchy/" | "/KRA_KPI_Master_Add" | "/KRA_KPI_Master_Add/" | "/KRA_KPI_Master_Edit" | "/KRA_KPI_Master_Edit/" | "/KRA_KPI_Trans_Add" | "/KRA_KPI_Trans_Add/" | "/KRA_KPI_Trans_Edit" | "/KRA_KPI_Trans_Edit/" | "/KRA_KPI_Transaction" | "/KRA_KPI_Transaction/" | "/KRA_KPI" | "/KRA_KPI/" | "/Project_Documents" | "/Project_Documents/" | "/Project_Documents/PMS_Report" | "/Project_Documents/PMS_Report/" | "/Project_Reports" | "/Project_Reports/" | "/Project_Reports/All_Corporate_Employee_Data" | "/Project_Reports/All_Corporate_Employee_Data/" | "/Project_Reports/Corporate_PMS_Report_All_Data" | "/Project_Reports/Corporate_PMS_Report_All_Data/" | "/Project_Reports/Corporate_PMS_Report_Department_Wise" | "/Project_Reports/Corporate_PMS_Report_Department_Wise/" | "/Project_Reports/Corporate_PMS_Report" | "/Project_Reports/Corporate_PMS_Report/" | "/Project_Reports/Deviation_Report" | "/Project_Reports/Deviation_Report/" | "/Project_Reports/Individual_Performance" | "/Project_Reports/Individual_Performance/" | "/Project_Reports/PMS_Graph_Report_2" | "/Project_Reports/PMS_Graph_Report_2/" | "/Project_Reports/PMS_Graph_Report" | "/Project_Reports/PMS_Graph_Report/" | "/Project_Setup" | "/Project_Setup/" | "/Project_Setup/Module_Access" | "/Project_Setup/Module_Access/" | "/Project_Setup/User_Activity_Logs" | "/Project_Setup/User_Activity_Logs/" | "/api" | "/api/" | `/api/${string}` & {} | `/api/${string}/` & {} | "/auth" | "/auth/" | "/auth/forgot-password" | "/auth/forgot-password/" | "/auth/login" | "/auth/login/" | "/auth/logout" | "/auth/logout/" | "/auth/reset-password" | "/auth/reset-password/" | "/no-access" | "/no-access/" | "/profile" | "/profile/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | "/icons/apple-touch-icon.png" | "/icons/icon-192.png" | "/icons/icon-512.png" | "/icons/icon-maskable-512.png" | "/img/.DS_Store" | "/img/asian_logo.svg" | "/img/loader_icon.svg" | "/img/login_img.jpg" | "/img/logo.svg" | "/manifest.webmanifest" | "/robots.txt" | string & {};
	}
}