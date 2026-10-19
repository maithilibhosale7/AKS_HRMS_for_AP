export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","img/.DS_Store","img/asian_logo.svg","img/loader_icon.svg","img/login_img.jpg","img/logo.svg","robots.txt"]),
	mimeTypes: {".svg":"image/svg+xml",".jpg":"image/jpeg",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Cp6RFJ0p.js",app:"_app/immutable/entry/app.wwSVl7SS.js",imports:["_app/immutable/entry/start.Cp6RFJ0p.js","_app/immutable/chunks/COFjhaom.js","_app/immutable/chunks/BfK85uqf.js","_app/immutable/chunks/DBEmdN4K.js","_app/immutable/chunks/CD3NhAu9.js","_app/immutable/chunks/8UtF8RsF.js","_app/immutable/chunks/D-AIaRcu.js","_app/immutable/entry/app.wwSVl7SS.js","_app/immutable/chunks/DBEmdN4K.js","_app/immutable/chunks/BfK85uqf.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DIDfl6xt.js","_app/immutable/chunks/DuJqOdhY.js","_app/immutable/chunks/BbN94G8x.js","_app/immutable/chunks/C0z9OomD.js","_app/immutable/chunks/BxXotwio.js","_app/immutable/chunks/D-AIaRcu.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/26.js')),
			__memo(() => import('./nodes/27.js')),
			__memo(() => import('./nodes/28.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/AKS_HRMS/HR_Admin_Dashboard",
				pattern: /^\/AKS_HRMS\/HR_Admin_Dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/AKS_HRMS/User_Dashboard",
				pattern: /^\/AKS_HRMS\/User_Dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/Corporate_Hierarchy_Approval",
				pattern: /^\/Corporate_Hierarchy_Approval\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/Corporate_Hierarchy",
				pattern: /^\/Corporate_Hierarchy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/KRA_KPI_Master_Add",
				pattern: /^\/KRA_KPI_Master_Add\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/KRA_KPI_Master_Edit",
				pattern: /^\/KRA_KPI_Master_Edit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/KRA_KPI_Trans_Add",
				pattern: /^\/KRA_KPI_Trans_Add\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/KRA_KPI_Trans_Edit",
				pattern: /^\/KRA_KPI_Trans_Edit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/KRA_KPI_Transaction",
				pattern: /^\/KRA_KPI_Transaction\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/KRA_KPI",
				pattern: /^\/KRA_KPI\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/Project_Documents/PMS_Report",
				pattern: /^\/Project_Documents\/PMS_Report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/Project_Reports/All_Corporate_Employee_Data",
				pattern: /^\/Project_Reports\/All_Corporate_Employee_Data\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/Project_Reports/Corporate_PMS_Report_All_Data",
				pattern: /^\/Project_Reports\/Corporate_PMS_Report_All_Data\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/Project_Reports/Corporate_PMS_Report_Department_Wise",
				pattern: /^\/Project_Reports\/Corporate_PMS_Report_Department_Wise\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/Project_Reports/Corporate_PMS_Report",
				pattern: /^\/Project_Reports\/Corporate_PMS_Report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/Project_Reports/Deviation_Report",
				pattern: /^\/Project_Reports\/Deviation_Report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/Project_Reports/Individual_Performance",
				pattern: /^\/Project_Reports\/Individual_Performance\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/Project_Reports/PMS_Graph_Report_2",
				pattern: /^\/Project_Reports\/PMS_Graph_Report_2\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/Project_Reports/PMS_Graph_Report",
				pattern: /^\/Project_Reports\/PMS_Graph_Report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/Project_Setup/Module_Access",
				pattern: /^\/Project_Setup\/Module_Access\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/Project_Setup/User_Activity_Logs",
				pattern: /^\/Project_Setup\/User_Activity_Logs\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/api/[...slug]",
				pattern: /^\/api(?:\/([^]*))?\/?$/,
				params: [{"name":"slug","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/_...slug_/_server.js'))
			},
			{
				id: "/auth/forgot-password",
				pattern: /^\/auth\/forgot-password\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: __memo(() => import('./entries/endpoints/auth/forgot-password/_server.js'))
			},
			{
				id: "/auth/login",
				pattern: /^\/auth\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: __memo(() => import('./entries/endpoints/auth/login/_server.js'))
			},
			{
				id: "/auth/logout",
				pattern: /^\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/auth/logout/_server.js'))
			},
			{
				id: "/auth/reset-password",
				pattern: /^\/auth\/reset-password\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/no-access",
				pattern: /^\/no-access\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
