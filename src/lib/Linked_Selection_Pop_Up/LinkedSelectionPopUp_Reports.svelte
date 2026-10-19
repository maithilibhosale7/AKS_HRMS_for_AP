<script>
    export let isModalOpen = false;
    export let LS_Key = '';
    export let LS_Data_Table_Name = '';
    export let selection_type = 'single';
    export let filteredData = [];
    export let LS_Display_Scenario_ID = '';
</script>

{#if isModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 class="text-base font-semibold text-gray-800">List selection</h2>
            <p class="mt-2 text-sm text-gray-600">
                Choosing rows from {LS_Data_Table_Name || 'a list'} needs the old table-view engine, which is not part of this HRMS build.
            </p>
            <button
                type="button"
                class="mt-4 rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white"
                on:click={() => (isModalOpen = false)}
            >
                Close
            </button>
        </div>
    </div>
{/if}
