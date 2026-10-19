// UserContextService — Phase 3 cutover read helper.
//
// Collapses 4 independent post-login fetches (Get_Nav_Menu / Get_Reports_Menu /
// Get_User_Dashboards / Get_HRMS_Menu) plus identity hydration into ONE
// Get_User_Context call. Returns identity_summary + Menu/Reports/Dashboards/HRMS
// sections that are byte-equivalent to the legacy per-user endpoints (Phase 2
// equivalence-harness verified).
//
// The merge into Live_Data.User_Information is ADDITIVE — it preserves the
// 9 static-at-login fields seeded by login (Employee_Self_ID, Master_User_ID,
// Username, Master_User_Name, Email_ID, Account_Status, Password_Last_Updated,
// Failed_Login_Attempts, Master_Company_ID) and overlays the 4 live-recomputed
// identity flags (Has_Dashboards / AI_Chatbot / AI_Builder / HRMS_Access).
//
// Dedup: keyed by userId. If a load is in-flight, callers get the same promise.
// If a userId has already loaded this session, callers get a resolved no-op.
// Reset on logout via resetUserContextCache() so a re-login refetches cleanly.

import { post } from '$lib/utils/api';
import { API_PATHS } from '$lib/API_PATHS';
import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

const inflight = new Map();   // userId -> Promise
const loaded   = new Set();   // userId set (this browser session)

export function resetUserContextCache() {
    inflight.clear();
    loaded.clear();
}

export function loadUserContext(userId) {
    if (userId === undefined || userId === null || userId === '') {
        return Promise.resolve(null);
    }

    const key = String(userId);

    if (inflight.has(key)) return inflight.get(key);
    if (loaded.has(key))   return Promise.resolve(null);

    const p = (async () => {
        try {
            const ctx = await post(API_PATHS.API_URL_Get_User_Context, { User_ID: userId });

            Live_Data_Storage.update((cur) => {
                const next = cur ?? {};
                next.User_Information = {
                    ...(next.User_Information || {}),
                    ...(ctx?.identity_summary || {})
                };
                next.Module_Sections = {
                    Menu:       ctx?.Menu       || {},
                    Reports:    ctx?.Reports    || {},
                    Dashboards: ctx?.Dashboards || { Status: 'Success', Dashboards: [] },
                    HRMS:       ctx?.HRMS       || { Modules: {} }
                };
                return next;
            });

            loaded.add(key);
            return ctx;
        } catch (err) {
            console.error('loadUserContext failed:', err);
            return null;
        } finally {
            inflight.delete(key);
        }
    })();

    inflight.set(key, p);
    return p;
}
