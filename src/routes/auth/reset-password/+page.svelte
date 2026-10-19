<script>
    import { onMount } from 'svelte';
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
    import { AuthService } from '$lib/services/AuthService';
    import { SessionStore } from '$lib/stores/SessionStore';
    import { addToast } from 'as-toast';
    import { goto } from '$app/navigation';

    let newPass = '';
    let confirmPass = '';
    let userId = null;

    onMount(() => {
        // Two paths arrive here:
        //   1. Forced-reset (logged in, password_expired=true) — user is in SessionStore.
        //   2. Forgot-password (just verified OTP) — user_id was parked in sessionStorage
        //      by forgot-password/+page.svelte after a successful verify_otp call.
        const session = $SessionStore;
        userId = session.user?.Master_User_ID
               ?? Number(sessionStorage.getItem('password_reset_user_id'))
               ?? null;

        if (!userId) {
            addToast('Session expired. Please log in again.', 'error');
            goto('/auth/login');
        }
    });

    async function handleReset() {
        if (newPass !== confirmPass) {
            addToast('Passwords do not match', 'error');
            return;
        }
        const res = await AuthService.passwordManager('update_password', {
            password: newPass,
            user_id: userId
        });
        if (res.status === 'success') {
            sessionStorage.removeItem('password_reset_user_id');
            addToast('Password Updated Successfully', 'success');
            window.location.href = '/';
        } else {
            addToast(res.message || 'Password update failed', 'error');
        }
    }
</script>

<div class="background" style="background-image: url({Project_Theme_Settings.login_background_image});">
    <div class="login-container w-[90%] sm:w-[450px] p-10">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Password Expired</h2>
        <p class="text-sm text-gray-500 mb-8">For security purposes, you must update your password every 90 days.</p>

        <form on:submit|preventDefault={handleReset} class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">New Password</label>
                <input type="password" bind:value={newPass} required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirm Password</label>
                <input type="password" bind:value={confirmPass} required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>

            <button type="submit"
                class="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">
                Update Password & Access Dashboard
            </button>
        </form>
    </div>
</div>

<style>
    /* Reusing styles from login.svelte */
    .background { background-repeat: no-repeat; background-position: center; background-size: cover; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .login-container { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 2rem; border: 1px solid white; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
</style>