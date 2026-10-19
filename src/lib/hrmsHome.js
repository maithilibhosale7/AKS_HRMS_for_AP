/** Where a signed-in user lands in AKS HRMS.
 * Project1 users have no HRMS_Access column yet, so a missing flag opens the admin dashboard.
 * Blocked and Standard User apply once that flag is stored on the user.
 */
export function hrmsHome(user) {
	if (user?.HRMS_Access === 'Blocked') return '/no-access';
	if (user?.HRMS_Access === 'Standard User') return '/AKS_HRMS/User_Dashboard';
	return '/AKS_HRMS/HR_Admin_Dashboard';
}
