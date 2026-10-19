<script context="module">
	export async function load({ session }) {
		if (session.user) {
			/*return {
				status: 302,
				redirect: '/'
			};*/
		}

		return {};
		
	}
</script>

<script>

	//
    // Importing API Paths
	//
	import { API_PATHS } from '$lib/API_PATHS'

	//
	// Importing Theme Settings
	//
	import { Project_Theme_Settings } from '$lib/Project_Theme_Settings'

	import { session } from '$app/stores';
	import { post } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import { writable } from "svelte/store";
	import { addToast } from 'as-toast';

	export const toasts = writable([]);

	let username = '';
	let password = '';
	let errors = null;
	let resetEmail = "";
    let resetMessage = "";
	let isModalOpen = false;
    let modalStep = "email"; // Track modal state: "email", "otp", "password"
    let otp = "";
    let newPassword = "";
    let confirmNewPassword = "";

	async function submit(event) {
		
		const response = await post(`auth/login_new`, { username, password });
        console.log("response: ", response);
		errors = response.errors;
		
		if (response.user) {
			$session.user = response.user;
		    addToast('Login Successful...', 'info');
			goto('/');
			// goto('../routes/Calendar.svelte');
		} else {
			addToast(errors['username'], 'warn');
		}
	}

	function openforgetpassword() {
        isModalOpen = true;
		modalStep = "email";
        resetMessage = "";
	}

	async function sendOtp() {

		if (!resetEmail) {
			resetMessage = "Please enter your email or username.";
			return;
		}

		// const response = await post(API_PATHS.API_URL_Generate_OTP, { resetEmail });
		// // const response = await post(`auth/generate_otp`, { resetEmail });
		// console.log("response: ", response);

		resetMessage = "Processing... Please wait.";
		await new Promise(resolve => setTimeout(resolve, 100)); 

		// API Call for Generate_OTP data
		let response = await fetch(API_PATHS.API_URL_Generate_OTP, {
			method: 'POST',
			body: JSON.stringify({
				"resetEmail":resetEmail,
			})
		});
		response  = await response.json();
		
		console.log("response: ", response);

		if (response['Status'] == 'Success') {
			resetMessage = "OTP has been sent to your email.";
			addToast("OTP has been sent to your email.", "info");
			modalStep = 'otp';
		} else {
			resetMessage = response['Message'];
		}
	}

	async function verifyOtp() {
		// const response = await post("auth/verify_otp", { resetEmail, otp });

		// API Call for Verfiy_OTP data
		let response = await fetch(API_PATHS.API_URL_Verfiy_OTP, {
			method: 'POST',
			body: JSON.stringify({
				"resetEmail":resetEmail,
				"otp": otp
			})
		});
		response  = await response.json();

		if (response['Status'] == "Success") {
			resetMessage = "You can now reset your password.";
			addToast("OTP verified. Please enter your new password.", "info");
			modalStep = "password";
		} else {
			resetMessage = response['Message'];
		}
	}

    async function resetPassword() {
		
		if (newPassword !== confirmNewPassword) {
			resetMessage = "Passwords do not match.";
			return;
		}

		// API Call for Reset_Password data
		let response = await fetch(API_PATHS.API_URL_Reset_Password, {
			method: 'POST',
			body: JSON.stringify({
				"resetEmail": resetEmail,
				"newPassword": newPassword
			})
		});
		response  = await response.json();

		if (response['Status'] == "Success") {
			
			addToast("Password has been reset successfully.", "info");

			username = '';
			password = '';
			errors = null;
			resetEmail = "";
			resetMessage = "";
			isModalOpen = false;
			modalStep = "email"; // Track modal state: "email", "otp", "password"
			otp = "";
			newPassword = "";
			confirmNewPassword = "";

		} else {
			resetMessage = response['Message'];
		}
	}
	
</script>

<svelte:head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">			 
	<title>Login | Project</title>
</svelte:head>

<div class="background" style="background-image: url('{Project_Theme_Settings.login_background_image}');">
	<div class="login-container">
		<div>
			<img src="{Project_Theme_Settings.client_logo}" alt="Project Logo" class="mb-4"/>
		</div>
		<h2 class="text-2xl font-semibold text-gray-900 mb-4">Login to your account</h2>
		<form on:submit|preventDefault={submit}>
			<input class="w-full p-3 border border-gray-300 rounded mb-3" type="text" placeholder="Username" bind:value={username} required />
			<input class="w-full p-3 border border-gray-300 rounded mb-3" type="password" placeholder="Password/OTP" bind:value={password} required />
			<div class="text-right mb-3">
				<a href="#" on:click={openforgetpassword} class="text-blue-600 hover:text-blue-800">Forgot Password?</a>
			</div>
			<button class="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Sign In</button>
		</form>
	</div>
</div>

{#if isModalOpen}
    <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
            {#if modalStep === "email"}
                <h2 class="text-lg font-semibold mb-4">Reset Password</h2>
                <input type="email" class="block w-full border border-gray-300 rounded-lg py-2 px-3" placeholder="Enter your email or username" bind:value={resetEmail} />
                <p class="text-sm text-red-600 mt-2">{resetMessage}</p>
                <div class="flex justify-end mt-4">
                    <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2" on:click={() => isModalOpen = false}>Cancel</button>
                    <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded-lg" on:click={sendOtp}>Send OTP</button>
                </div>
            
            {:else if modalStep === "otp"}
                <h2 class="text-lg font-semibold mb-4">Enter OTP</h2>
                <input type="text" class="block w-full border border-gray-300 rounded-lg py-2 px-3" placeholder="Enter OTP" bind:value={otp} />
                <p class="text-sm text-red-600 mt-2">{resetMessage}</p>
                <div class="flex justify-end mt-4">
                    <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded-lg" on:click={verifyOtp}>Verify OTP</button>
                </div>
            
            {:else if modalStep === "password"}
                <h2 class="text-lg font-semibold mb-4">Set New Password</h2>
                <input type="password" class="block w-full border border-gray-300 rounded-lg py-2 px-3" placeholder="New Password" bind:value={newPassword} />
                <input type="password" class="block w-full border border-gray-300 rounded-lg py-2 px-3 mt-2" placeholder="Confirm New Password" bind:value={confirmNewPassword} />
                <p class="text-sm text-red-600 mt-2">{resetMessage}</p>
                <div class="flex justify-end mt-4">
                    <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded-lg" on:click={resetPassword}>Reset Password</button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .background {
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: center;
    }
	.login-container {
		background: rgba(255, 255, 255, 0.719);
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
		text-align: center;
	}
</style>