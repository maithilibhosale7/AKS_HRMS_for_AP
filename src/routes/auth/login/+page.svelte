<script>
    import { onMount } from 'svelte';
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
    import { AuthService } from '$lib/services/AuthService';
    import { loadUserContext } from '$lib/services/UserContextService';
    import { SessionStore } from '$lib/stores/SessionStore';
    import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';
    import { addToast } from 'as-toast';
    import { goto } from '$app/navigation';
    import { hrmsHome } from '$lib/hrmsHome';
    import InstallApp from '$lib/components/InstallApp.svelte';

    let username = '';
    let password = '';
    let isSubmitting = false;

    async function handleLogin() {
        isSubmitting = true;
        const result = await AuthService.login(username, password);
        
        if (result.status === 'success') {
            addToast('Login Successful!', 'success');

            // --- NEW CODE START ---
            // Set a "Session Marker" cookie. 
            // No 'Expires' or 'Max-Age' means it dies when the browser closes.
            document.cookie = "aks_session_active=true; path=/; SameSite=Strict";
            // --- NEW CODE END ---
            
            // Hydrate Stores
            SessionStore.set({
                authenticated: true,
                user: result.user,       // 1. Save the full user object (SessionStore expects 'user', not 'user_id')
                token: result.token,     // 2. CRITICAL: Save the token so SessionStore doesn't wipe itself
                password_expired: result.password_expired || false
            });

            Live_Data_Storage.update(data => ({
                ...data,
                User_Information: result.user
            }));

            // Phase 3-cutover: load module sections + identity_summary BEFORE goto so
            // Navmenu / Dashboards / HRMS mount with hydrated Module_Sections (avoids
            // empty-state flicker on the post-login redirect).
            await loadUserContext(result.user?.Master_User_ID);

            // --- UPDATED ROUTING LOGIC ---
            // Use SvelteKit's internal router instead of a hard browser reload
            if (result.password_expired) {
                goto('/auth/reset-password');
            } else {
                goto(hrmsHome(result.user));
            }
        } else {
            addToast(result.message || 'Invalid Credentials', 'error');
        }
        isSubmitting = false;
    }
</script>

<div class="background" style="background-image: url({Project_Theme_Settings.login_background_image});">
    <div class="login-container w-[90%] sm:w-[400px] p-8">
        <div class="flex justify-center items-center mb-8 h-24">
            <img src={Project_Theme_Settings.client_logo} alt="Logo" class="max-h-full max-w-full object-contain" />
        </div>

        <form on:submit|preventDefault={handleLogin} class="space-y-5">
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input type="text" bind:value={username} required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" bind:value={password} required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
            </div>

            <button type="submit" disabled={isSubmitting}
                class="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition-colors">
                {isSubmitting ? 'Verifying...' : 'Login'}
            </button>
        </form>

        <div class="mt-6 text-center">
            <a href="/auth/forgot-password" class="text-sm font-medium text-cyan-700 hover:underline">Forgot Password?</a>
        </div>
        <InstallApp tone="login" />
    </div>
</div>

<style>
    .background {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .login-container {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
</style>