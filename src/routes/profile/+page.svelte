<script>
    import { onMount } from 'svelte';
    import { post } from '$lib/utils/api';
    import { API_PATHS } from '$lib/API_PATHS';

    let profile = null;
    let failed = false;

    onMount(async () => {
        try {
            const data = await post(API_PATHS.API_URL_Get_User_Information, {});
            profile = data?.Profile || null;
            failed = !profile;
        } catch (_) {
            failed = true;
        }
    });

    $: name = profile?.Employee_Name || profile?.Master_User_Name || profile?.Username || '';
    $: initial = name ? name.charAt(0).toUpperCase() : '';
    $: department = profile?.Department_Name || profile?.Department || '';
    $: designation = profile?.Designation_Name || profile?.Designation || '';

    function shown(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }
</script>

<svelte:head>
    <title>My Profile | AKS HRMS</title>
</svelte:head>

<div class="bg-white rounded-xl border border-slate-200 p-5">
    <div class="flex items-center justify-between gap-3 mb-5">
        <h1 class="text-xl font-bold text-slate-800">My Profile</h1>
        <button type="button" class="px-4 py-2 text-sm border border-slate-300 rounded-lg" on:click={() => history.back()}>Back</button>
    </div>

    {#if failed}
        <p class="text-sm text-slate-500">The profile could not be loaded.</p>
    {:else if !profile}
        <p class="text-sm text-slate-500">Loading profile…</p>
    {:else}
        <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div class="w-12 h-12 rounded-full bg-cyan-600 text-white text-lg font-bold flex items-center justify-center">{initial}</div>
            <div>
                <p class="text-base font-semibold text-slate-900">{name}</p>
                {#if profile.Username}
                    <p class="text-xs text-slate-500">@{profile.Username}</p>
                {/if}
                {#if profile.Account_Status}
                    <p class="text-[11px] uppercase tracking-wide text-slate-400 mt-1">{profile.Account_Status}</p>
                {/if}
            </div>
        </div>

        <section class="pt-4">
            <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Account</h2>
            <dl class="grid grid-cols-1 sm:grid-cols-3 gap-y-2 text-sm">
                <dt class="text-slate-500">Email</dt>
                <dd class="sm:col-span-2 text-slate-800">{profile.Email_ID || '—'}</dd>
                <dt class="text-slate-500">Mobile</dt>
                <dd class="sm:col-span-2 text-slate-800">{profile.Mobile_Number || '—'}</dd>
                <dt class="text-slate-500">Password updated</dt>
                <dd class="sm:col-span-2 text-slate-800">{profile.Password_Last_Updated || '—'}</dd>
                <dt class="text-slate-500">Member since</dt>
                <dd class="sm:col-span-2 text-slate-800">{profile.System_Datetime_Creation || '—'}</dd>
            </dl>
        </section>

        <section class="pt-4 mt-4 border-t border-slate-100">
            <h2 class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Employee</h2>
            {#if profile.Employee_Name || profile.Employee_Code}
                <dl class="grid grid-cols-1 sm:grid-cols-3 gap-y-2 text-sm">
                    {#if shown(profile.Employee_Code)}
                        <dt class="text-slate-500">Code</dt>
                        <dd class="sm:col-span-2 text-slate-800">{profile.Employee_Code}</dd>
                    {/if}
                    {#if shown(designation)}
                        <dt class="text-slate-500">Designation</dt>
                        <dd class="sm:col-span-2 text-slate-800">{designation}</dd>
                    {/if}
                    {#if shown(department)}
                        <dt class="text-slate-500">Department</dt>
                        <dd class="sm:col-span-2 text-slate-800">{department}</dd>
                    {/if}
                    {#if shown(profile.Employee_Type)}
                        <dt class="text-slate-500">Type</dt>
                        <dd class="sm:col-span-2 text-slate-800">{profile.Employee_Type}</dd>
                    {/if}
                    {#if shown(profile.Employee_Email)}
                        <dt class="text-slate-500">Work email</dt>
                        <dd class="sm:col-span-2 text-slate-800">{profile.Employee_Email}</dd>
                    {/if}
                    {#if shown(profile.Employee_Mobile)}
                        <dt class="text-slate-500">Work mobile</dt>
                        <dd class="sm:col-span-2 text-slate-800">{profile.Employee_Mobile}</dd>
                    {/if}
                    {#if shown(profile.Date_of_Joining)}
                        <dt class="text-slate-500">Joined</dt>
                        <dd class="sm:col-span-2 text-slate-800">{profile.Date_of_Joining}</dd>
                    {/if}
                    {#if shown(profile.Employee_Status)}
                        <dt class="text-slate-500">Status</dt>
                        <dd class="sm:col-span-2 text-slate-800">{profile.Employee_Status}</dd>
                    {/if}
                </dl>
            {:else}
                <p class="text-sm text-slate-500">No employee record is linked to this login.</p>
            {/if}
        </section>
    {/if}
</div>
