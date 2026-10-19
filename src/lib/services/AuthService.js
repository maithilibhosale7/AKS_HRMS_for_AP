/* FRONTEND SERVICE: Authentication Logic Wrapper.
- Purpose: Provides a clean API for UI components to handle login, logout, and password resets.
- Logic:
    1. abstract away the fetch() calls to SvelteKit server routes.
    2. centralize error handling for authentication actions.
    3. provide methods for the multi-step "Forgot Password" flow.
*/

import { SessionStore } from '../stores/SessionStore';
import { Live_Data_Storage } from '../stores/Live_Data_Storage';
import { resetUserContextCache } from './UserContextService';
import { goto } from '$app/navigation';

export const AuthService = {
    /**
     * Attempts to log a user in.
     * @param {string} username 
     * @param {string} password 
     */
    async login(username, password) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            return { ok: response.ok, ...result };
        } catch (error) {
            return { ok: false, message: "System connectivity error." };
        }
    },

    /**
     * Clears session storage and logs the user out.
     */
    async logout() {
        try {
            await fetch('/auth/logout', { method: 'POST' });
            
            // Reset stores to initial states
            SessionStore.set({ authenticated: false, user: null, token: null, password_expired: false });

            // Note: We don't clear the whole Live_Data_Storage to preserve non-sensitive config,
            // but we clear the User_Information block and the per-user Module_Sections.
            Live_Data_Storage.update(data => {
                data.User_Information = {};
                delete data.Module_Sections;
                return data;
            });

            // Reset in-flight/loaded guard so a re-login on the same browser refetches.
            resetUserContextCache();

            goto('/auth/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    },

    /**
     * Phase 1 - Password Reset Workflow
     * action: 'request_otp' | 'verify_otp' | 'update_password'
     */
    async passwordManager(action, payload) {
        try {
            const response = await fetch('/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload })
            });
            return await response.json();
        } catch (error) {
            return { status: 'error', message: "Password service unavailable." };
        }
    }
};