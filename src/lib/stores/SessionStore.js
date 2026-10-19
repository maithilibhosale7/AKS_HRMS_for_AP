import { writable } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';

const initialState = {
    authenticated: false,
    user: null,
    token: null,
    password_expired: false
};

export const SessionStore = writable(initialState);

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

// --- NEW HELPER ---
function isBrowserSessionActive() {
    return document.cookie.split(';').some((item) => item.trim().startsWith('aks_session_active='));
}

if (typeof window !== 'undefined') {
    const storedSession = localStorage.getItem('AKS_Session');
    
    // --- UPDATED LOGIC ---
    // We only load from localStorage if the Browser Session Cookie is still alive.
    // If the cookie is gone, it means the user closed the browser.
    if (storedSession && isBrowserSessionActive()) {
        try {
            const parsed = JSON.parse(storedSession);
            
            if (parsed.token && !isTokenExpired(parsed.token)) {
                SessionStore.set(parsed);
            } else {
                SessionStore.set(initialState);
                localStorage.removeItem('AKS_Session');
            }
        } catch (e) {
            console.error("Failed to parse session", e);
        }
    } else {
        // Cookie is missing (Browser was closed) OR Storage is empty.
        // Ensure we wipe any stale data from localStorage.
        localStorage.removeItem('AKS_Session');
    }

    SessionStore.subscribe(value => {
        if (value.authenticated) {
            localStorage.setItem('AKS_Session', JSON.stringify(value));
            // Ensure cookie is set in case of refresh/re-hydration
            if (!isBrowserSessionActive()) {
                 document.cookie = "aks_session_active=true; path=/; SameSite=Strict";
            }
        } else {
            localStorage.removeItem('AKS_Session');
            // Also kill the cookie on explicit logout
            document.cookie = "aks_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict"; 
        }
    });
}