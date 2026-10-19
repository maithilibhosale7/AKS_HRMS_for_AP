<script>
    import { Project_Theme_Settings } from '$lib/Project_Theme_Settings';
    import { AuthService } from '$lib/services/AuthService';
    import { addToast } from 'as-toast';
    import { goto } from '$app/navigation';

    let step = 'email'; // email -> otp
    let email = '';
    let otp = '';

    async function handleRequest() {
        const res = await AuthService.passwordManager('request_otp', { email });
        if (res.status === 'success') {
            step = 'otp';
            addToast('OTP sent to your email', 'info');
        }
    }

    async function handleVerify() {
        const res = await AuthService.passwordManager('verify_otp', { email, otp });
        if (res.status === 'success') {
            // Hand the verified user_id to the reset-password page via sessionStorage.
            // reset-password/+page.svelte reads and deletes this key on mount.
            sessionStorage.setItem('password_reset_user_id', res.data.user_id);
            addToast('OTP verified', 'success');
            goto('/auth/reset-password');
        } else {
            addToast(res.message || 'Incorrect OTP', 'error');
        }
    }
</script>

<div class="background" style="background-image: url({Project_Theme_Settings.login_background_image});">
    <div class="login-container w-[90%] sm:w-[400px] p-8 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Reset Password</h2>

        {#if step === 'email'}
            <p class="text-sm text-gray-600 mb-6">Enter your email address to receive a verification code.</p>
            <input type="email" bind:value={email} placeholder="name@company.com"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 mb-4 outline-none focus:ring-2 focus:ring-cyan-500" />
            <button on:click={handleRequest} class="w-full py-3 bg-cyan-600 text-white rounded-lg font-bold shadow-md hover:bg-cyan-700 transition-colors">
                Send Code
            </button>
        {:else if step === 'otp'}
            <p class="text-sm text-gray-600 mb-6">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
            <input type="text" bind:value={otp} maxlength="6"
                class="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg border border-gray-300 mb-4 outline-none focus:ring-2 focus:ring-cyan-500" />
            <button on:click={handleVerify} class="w-full py-3 bg-cyan-600 text-white rounded-lg font-bold shadow-md hover:bg-cyan-700 transition-colors">
                Verify OTP
            </button>
        {:else}
            <div class="py-4">
                <div class="text-green-500 text-5xl mb-4">✓</div>
                <p class="text-gray-700 font-medium">Reset instructions have been sent.</p>
                <a href="/auth/login" class="mt-6 inline-block text-cyan-600 font-bold hover:underline">Back to Login</a>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Reusing styles from login.svelte */
    .background { background-repeat: no-repeat; background-position: center; background-size: cover; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .login-container { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
</style>