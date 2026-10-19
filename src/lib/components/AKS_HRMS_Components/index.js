/**
 * AKS_HRMS_Components/index.js
 * ─────────────────────────────────────────────────────────────────────
 * Central re-export of all HRMS sub-module components.
 * Import from this file in dashboards and anywhere else modules are launched.
 *
 * Usage in HR_Admin_Dashboard/+page.svelte:
 *   import { Employee_List, Leave_List, ... } from '$lib/components/AKS_HRMS_Components';
 *
 * Then wire into openModal:
 *   openModal(Employee_List, {}, { title: 'Employees' });
 */

// ── Shared ─────────────────────────────────────────────────────────────
export { default as AKS_Calendar } from './Shared/AKS_Calendar.svelte';
export { default as AKS_Modal }    from './Shared/AKS_Modal.svelte';

// ── Employee ───────────────────────────────────────────────────────────
export { default as Employee_List }    from './Employee/Employee_List.svelte';
export { default as Employee_AddEdit } from './Employee/Employee_AddEdit.svelte';

// ── Attendance ─────────────────────────────────────────────────────────
export { default as Attendance_List }    from './Attendance/Attendance_List.svelte';
export { default as Attendance_AddEdit } from './Attendance/Attendance_AddEdit.svelte';

// ── Leave ──────────────────────────────────────────────────────────────
export { default as Leave_List }    from './Leave/Leave_List.svelte';
export { default as Leave_AddEdit } from './Leave/Leave_AddEdit.svelte';

// ── OD ─────────────────────────────────────────────────────────────────
export { default as OD_List }    from './OD/OD_List.svelte';
export { default as OD_AddEdit } from './OD/OD_AddEdit.svelte';

// ── CompOff ────────────────────────────────────────────────────────────
export { default as CompOff_List }    from './CompOff/CompOff_List.svelte';
export { default as CompOff_AddEdit } from './CompOff/CompOff_AddEdit.svelte';

// ── Expense ────────────────────────────────────────────────────────────
export { default as Expense_List }    from './Expense/Expense_List.svelte';
export { default as Expense_AddEdit } from './Expense/Expense_AddEdit.svelte';

// ── Payroll ────────────────────────────────────────────────────────────
export { default as Payroll_List }    from './Payroll/Payroll_List.svelte';
export { default as Payroll_AddEdit } from './Payroll/Payroll_AddEdit.svelte';

// ── Onboarding ─────────────────────────────────────────────────────────
export { default as Onboarding_List }    from './Onboarding/Onboarding_List.svelte';
export { default as Onboarding_AddEdit } from './Onboarding/Onboarding_AddEdit.svelte';

// ── Exit ───────────────────────────────────────────────────────────────
export { default as Exit_List }    from './Exit/Exit_List.svelte';
export { default as Exit_AddEdit } from './Exit/Exit_AddEdit.svelte';

// ── RFM ────────────────────────────────────────────────────────────────
export { default as RFM_List }    from './RFM/RFM_List.svelte';
export { default as RFM_AddEdit } from './RFM/RFM_AddEdit.svelte';

// ── Holiday ────────────────────────────────────────────────────────────
export { default as Holiday_List }    from './Holiday/Holiday_List.svelte';
export { default as Holiday_AddEdit } from './Holiday/Holiday_AddEdit.svelte';

// ── Reports ────────────────────────────────────────────────────────────
export { default as AKS_Reports_Admin } from './Shared/AKS_Reports_Admin.svelte';
export { default as AKS_Reports_User }  from './Shared/AKS_Reports_User.svelte';

// ── Settings ───────────────────────────────────────────────────────────
export { default as HRMS_Settings } from './Shared/HRMS_Settings.svelte';

// import { post } from '$lib/utils/api';