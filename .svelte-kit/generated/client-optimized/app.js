export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/AKS_HRMS/HR_Admin_Dashboard": [4,[2]],
		"/AKS_HRMS/User_Dashboard": [5,[2]],
		"/Corporate_Hierarchy_Approval": [10],
		"/Corporate_Hierarchy": [9],
		"/KRA_KPI_Master_Add": [12],
		"/KRA_KPI_Master_Edit": [13],
		"/KRA_KPI_Trans_Add": [15],
		"/KRA_KPI_Trans_Edit": [16],
		"/KRA_KPI_Transaction": [14],
		"/KRA_KPI": [11],
		"/Project_Documents/PMS_Report": [18],
		"/Project_Reports/All_Corporate_Employee_Data": [19],
		"/Project_Reports/Corporate_PMS_Report_All_Data": [21],
		"/Project_Reports/Corporate_PMS_Report_Department_Wise": [22],
		"/Project_Reports/Corporate_PMS_Report": [20],
		"/Project_Reports/Deviation_Report": [23],
		"/Project_Reports/Individual_Performance": [24],
		"/Project_Reports/PMS_Graph_Report_2": [26],
		"/Project_Reports/PMS_Graph_Report": [25],
		"/Project_Setup/Module_Access": [27],
		"/Project_Setup/User_Activity_Logs": [28],
		"/auth/forgot-password": [6],
		"/auth/login": [7],
		"/auth/reset-password": [8],
		"/no-access": [17]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';