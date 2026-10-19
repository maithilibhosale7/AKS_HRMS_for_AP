export function isHrAdmin(user) {
	return !user?.HRMS_Access || user.HRMS_Access === 'HR Admin';
}

export function pmsGroupsForUser(user) {
	if (isHrAdmin(user)) return [];
	const m = user?.HRMS_Modules ?? {};
	const items = [];
	if (m.PMS_Add_Points) {
		items.push({ label: 'KRA / KPI Masters', type: 'route', href: '/KRA_KPI' });
		items.push({ label: 'Add KRA / KPI', type: 'route', href: '/KRA_KPI_Master_Add' });
	}
	if (m.PMS_Enter_Rating || m.PMS_Manager) {
		items.push({ label: 'Performance Cycle', type: 'route', href: '/KRA_KPI_Transaction' });
		items.push({ label: 'Enter Rating', type: 'route', href: '/KRA_KPI_Transaction' });
	}
	return items.length ? [{ group: 'PMS', items }] : [];
}

/** Who this user fills ratings for. Employees go straight to their own form. */
export function pmsFillScope(user) {
	if (isHrAdmin(user)) return 'all';
	const m = user?.HRMS_Modules ?? {};
	if (m.PMS_Manager) return 'team';
	return 'self';
}

export function filterPmsActions(list, user, kind) {
	if (!list || isHrAdmin(user)) return list;
	const m = user?.HRMS_Modules ?? {};
	const next = { ...list };
	const drop = (names) => {
		for (const [key, row] of Object.entries(next)) {
			if (names.includes(row?.action_dropdown_option)) delete next[key];
		}
	};
	if (kind === 'master') {
		if (!m.PMS_Add_Points) drop(['Add', 'Edit', 'Start PMS Cycle']);
		if (!m.PMS_Enter_Rating && !m.PMS_Manager) drop(['Add KRA KPI Rating']);
	}
	if (kind === 'rating') {
		if (!m.PMS_Enter_Rating && !m.PMS_Manager) drop(['Add', 'Edit', 'Update']);
		if (!m.PMS_Reports && !m.PMS_Manager) drop(['View PMS Report']);
	}
	return next;
}
