<script>
  //
  // Importing Libraries
	//
	import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
    
  //
  // Importing API Paths
  //
  import { API_PATHS } from '$lib/API_PATHS'
  import { pmsFillScope } from '$lib/pmsAccess.js'
  import { hrmsHome } from '$lib/hrmsHome'
 
      
  //
  // LIVE DATA Initialization
  //
  import { Live_Data_Storage } from '$lib/stores/Live_Data_Storage';

  let Live_Data;

  $: {
    Live_Data = $Live_Data_Storage;
  }

  let kraKpiData = [];
  let ready = false;
  let emptyMessage = '';

  function openRating(url, returnTo) {
    Live_Data.Execution_Information = {};
    Live_Data.Page_Information = {
      ...(Live_Data.Page_Information || {}),
      PageURL: returnTo
    };
    Live_Data_Storage.set({ ...Live_Data });
    goto(url);
  }

  async function ownDetailsId(user) {
    try {
      const res = await fetch(API_PATHS.API_URL_KRA_KPI_Get_Table_View_Data);
      const data = await res.json();
      const selfId = String(user?.Employee_Self_ID ?? '');
      const mine = (data.records || []).filter((row) => String(row.Employee_Self_ID) === selfId);
      return mine[0]?.Employee_KRA_KPI_Details_ID || '';
    } catch (err) {
      console.error('Failed to find this employee KRA form', err);
      return '';
    }
  }

  onMount(async () => {
    const user = Live_Data?.User_Information ?? {};
    const scope = pmsFillScope(user);
    const filter = scope === 'self' ? 'SELF_PMS' : scope === 'team' ? 'REPORTEE_PMS' : '';
    const home = hrmsHome(user);

    let records = [];
    try {
      const res = await fetch(API_PATHS.API_URL_Get_Table_Info_KRA_KPI_Trans, {
        method: 'POST',
        body: JSON.stringify({
          Live_Data,
          Filter_Condition: filter
        })
      });
      const data = await res.json();
      records = Array.isArray(data.records) ? data.records : [];
    } catch (err) {
      console.error('Failed to fetch KRA/KPI data', err);
    }

    if (scope === 'self') {
      if (records.length > 0) {
        openRating('/KRA_KPI_Trans_Edit?id=' + records[0].Employee_KRA_KPI_Transaction_ID, home);
        return;
      }
      const detailsId = await ownDetailsId(user);
      if (detailsId) {
        openRating('/KRA_KPI_Trans_Add?id=' + detailsId, home);
        return;
      }
      emptyMessage = 'Your performance form is not ready yet.';
      ready = true;
      return;
    }

    if (records.length === 1) {
      openRating('/KRA_KPI_Trans_Edit?id=' + records[0].Employee_KRA_KPI_Transaction_ID, home);
      return;
    }

    if (records.length === 0) {
      emptyMessage = 'No performance forms to fill.';
      ready = true;
      return;
    }

    kraKpiData = records;
    filteredData = [...kraKpiData];
    totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    updatePaginatedData();
    ready = true;
  });

  // Pagination Variables
  let currentPage = 1; // Current page number
  let itemsPerPage = 10; // Number of items per page
  let totalPages = 0; // Total number of pages
  let filteredData = []; // Data after applying search filter
  let paginatedData = []; // Data for the current page
  let searchQuery = "";

  // Function to handle search
  function handleSearch() {
    if (searchQuery.trim() !== '') {
      filteredData = kraKpiData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      filteredData = [...kraKpiData]; // Reset to original data if search query is empty
    }
    totalPages = Math.ceil(filteredData.length / itemsPerPage); // Update total pages
    currentPage = 1; // Reset to the first page
    updatePaginatedData(); // Update paginated data
  }

  // Function to update paginated data
  function updatePaginatedData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedData = filteredData.slice(startIndex, endIndex);
  }

  // Pagination Functions
  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      updatePaginatedData();
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      updatePaginatedData();
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      updatePaginatedData();
    }
  }

</script>

<svelte:head>
	<title>Performance Cycle | AKS HRMS</title>
</svelte:head>

{#if !ready}
  <p class="py-16 text-center text-sm text-slate-500">Opening your performance form...</p>
{:else if emptyMessage}
  <div class="py-16 text-center">
    <h1 class="text-xl font-bold text-slate-800 mb-2">Performance Cycle</h1>
    <p class="text-sm text-slate-500">{emptyMessage}</p>
  </div>
{:else}
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between my-4 gap-3">
    <h1 class="text-xl font-bold text-slate-800">Performance Cycle</h1>
    <input
      type="text"
      placeholder="Search..."
      bind:value={searchQuery}
      on:input={handleSearch}
      class="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-72"
    />
  </div>

  <table class="w-full table-auto border border-gray-300">
    <thead class="bg-gray-100">
      <tr>
        <th scope="col" class="px-6 py-3">Employee</th>
        <th scope="col" class="px-6 py-3">Year</th>
        <th scope="col" class="px-6 py-3">Final rating</th>
        <th scope="col" class="px-6 py-3"></th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedData as item}
      <tr>
        <td class="px-6 py-4">
          <p class="font-medium text-slate-800">{item.Employee_Name}</p>
          <p class="text-xs text-slate-400">{item.Employee_Code}</p>
        </td>
        <td class="px-6 py-4">{item.Processing_Year}</td>
        <td class="px-6 py-4">{item.Cumulative_Final_Rating}</td>
        <td class="px-4 py-2 text-center">
          <button
            type="button"
            class="px-3 py-1.5 bg-[#1E3A5F] text-white text-sm rounded-lg"
            on:click={() => openRating('/KRA_KPI_Trans_Edit?id=' + item.Employee_KRA_KPI_Transaction_ID, '/KRA_KPI_Transaction')}
          >Open</button>
        </td>
      </tr>
      {/each}
    </tbody>
  </table>

  <div class="flex justify-between items-center mt-4">
    <button on:click={previousPage} disabled={currentPage === 1} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Previous</button>
    <span>Page {currentPage} of {totalPages}</span>
    <button on:click={nextPage} disabled={currentPage === totalPages} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Next</button>
  </div>
{/if}

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  th {
    background-color: #f2f2f2;
    text-align: left;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  tr:hover {
    background-color: #f1f1f1;
  }
  button {
    margin-right: 5px;
  }
</style>

