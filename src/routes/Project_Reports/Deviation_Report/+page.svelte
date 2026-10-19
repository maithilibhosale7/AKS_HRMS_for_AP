
<script>
	import { exportTableToXlsx } from '$lib/Excel_xlsx';
	import { onMount } from 'svelte';
	import { API_PATHS } from '$lib/API_PATHS';

	export let dataval_result = [];

	async function exportxlxs(a, b) {
		await exportTableToXlsx(a, b);
	}

	let Departments = [];
	let Employees = [];

	onMount(async () => {
		let Get_Corporate_Report_Masters_Res = await fetch(API_PATHS.API_URL_Get_Corporate_Report_Masters, {
			method: 'POST'
		});
		Get_Corporate_Report_Masters_Res = await Get_Corporate_Report_Masters_Res.json();
		Departments = Get_Corporate_Report_Masters_Res['Departments'];
		Employees = Get_Corporate_Report_Masters_Res['Employees'];
	});

	async function onSubmit(e) {
		const all_data = JSON.stringify({
			Department: document.getElementById('Department').value,
			Employee: document.getElementById('Employee').value,
			Year: document.getElementById('Year').value,
			Tenure: document.getElementById('Tenure').value
		});
		const res = await fetch(API_PATHS.API_URL_Corporate_PMS_Report, {
			method: 'POST',
			body: all_data
		});
		dataval_result = await res.json();
	}

	let Selected_Department = 'All';
	function handleDepartmentChange(event) {
		Selected_Department = event.target.value;
	}

	let Selected_Employee = 'All';
	function handleEmployeeChange(event) {
		Selected_Employee = Employees[event.target.value]?.Employee_Tag || 'All';
	}

	let Selected_Tenure = 'All';
	function handleTenureChange(event) {
		const tenureMapping = {
			"All": "All",
			"Less than 1 Year": "<1",
			"1 to 3 Years": "1-3",
			"More than 3 Years": ">3"
		};
		Selected_Tenure = tenureMapping[event.target.value] || "All";
	}

	// Deviation slider logic
	let deviationValue = 0;
	function calculateDeviation(row) {
		// Example: Cumulative_Self_Rating vs Cumulative_Manager_Rating
		let self = parseFloat(row.Cumulative_Self_Rating) || 0;
		let manager = parseFloat(row.Cumulative_Manager_Rating) || 0;

		if (self > 0 && manager > 0) {
			return Math.abs(self - manager);
		} else {
			return 0;
		}
	}
</script>

<svelte:head>
	<title>Deviation Report | Recon</title>
</svelte:head>

<div class="relative w-full h-full hidden" id="loader_block">  
	<div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
		<img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
	</div>
</div>


<div class="w-full mx-auto p-4">
	<div class="bg-white rounded-2xl shadow-xl p-6">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
			<h2 id="ReportTitle" class="text-2xl font-bold text-[#4E342E] tracking-tight">Deviation Report</h2>
		</div>

		<!-- Filters -->
		<form on:submit|preventDefault={onSubmit} class="bg-[#FAF6F2] rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-end gap-4 shadow-sm">
			<div class="flex flex-col md:flex-row gap-4 w-full">
				<div class="flex-1 min-w-[150px]">
					<label for="Year" class="block text-xs font-semibold text-gray-700 mb-1">Year</label>
					<select name="Year" id="Year" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400">
						<option value="Financial Year: 2025-2026">Financial Year: 2025-2026</option>
					</select>
				</div>
				<div class="flex-1 min-w-[150px]">
					<label for="Tenure" class="block text-xs font-semibold text-gray-700 mb-1">Tenure</label>
					<select name="Tenure" id="Tenure" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400" on:change={handleTenureChange}>
						<option value="All">All</option>
						<option value="Less than 1 Year">Less than 1 Year</option>
						<option value="1 to 3 Years">1 to 3 Years</option>
						<option value="More than 3 Years">More than 3 Years</option>
					</select>
				</div>
				<div class="flex-1 min-w-[150px]">
					<label for="Department" class="block text-xs font-semibold text-gray-700 mb-1">Department</label>
					<select name="Department" id="Department" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400" on:change={handleDepartmentChange}>
						<option value="All">All</option>
						{#each Departments as department}
							<option value={department}>{department}</option>
						{/each}
					</select>
				</div>
				<div class="flex-1 min-w-[150px]">
					<label for="Employee" class="block text-xs font-semibold text-gray-700 mb-1">Employee</label>
					<select name="Employee" id="Employee" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400" on:change={handleEmployeeChange}>
						<option value="All">All</option>
						{#each Object.entries(Employees) as [employee_self_id, employee_data]}
							{#if (Selected_Department === 'All' || Selected_Department === employee_data.Department) &&
								(Selected_Tenure === 'All' || 
									(Selected_Tenure === '<1' && employee_data.Tenure_Value < 1) ||
									(Selected_Tenure === '1-3' && employee_data.Tenure_Value >= 1 && employee_data.Tenure_Value <= 3) ||
									(Selected_Tenure === '>3' && employee_data.Tenure_Value > 3))}
								<option value={employee_self_id}>{employee_data.Employee_Tag} - {employee_data.Department}</option>
							{/if}
						{/each}
					</select>
				</div>
                <div class="flex-1 min-w-[150px]">
                    <label for="deviationSlider" class="block mb-2 text-base font-semibold text-[#4E342E]">Deviation Filter</label>
                    <div class="flex items-center gap-3">
                        <input
                            type="range"
                            id="deviationSlider"
                            min="0"
                            max="5"
                            step="0.1"
                            bind:value={deviationValue}
                            class="flex-1 h-1.5 bg-[#EFEBE9] rounded-full shadow-sm appearance-none outline-none accent-[#A1887F]"
                            style="accent-color:#A1887F;"
                        />
                        <span class="inline-block bg-[#EFEBE9] text-[#4E342E] font-semibold px-4 py-1 rounded-full shadow-sm border border-[#D7CCC8] text-base min-w-[40px] text-center">{deviationValue}</span>
                    </div>
                    
            </div>
			</div>
			<div class="mt-4 md:mt-0 md:ml-4">
				<button class="rounded-lg bg-[#795548] px-6 py-2 text-white font-semibold shadow hover:bg-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#D7CCC8]">Search</button>
			</div>
		</form>

		<!-- Report Info -->
		<div class="flex flex-wrap gap-4 mb-4 text-[#4E342E] text-base">
			<div><span class="font-semibold">Year:</span> <span>{dataval_result.Year || 'ALL'}</span></div>
			<div><span class="font-semibold">Department:</span> <span>{dataval_result.Department || 'ALL'}</span></div>
			<div><span class="font-semibold">Employee:</span> <span>{Selected_Employee}</span></div>

			<button
				on:click={() => exportxlxs('PMS_Deviation_Report')}
				type="submit"
				class="ml-auto inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"
			>
				Export
			</button>
		</div>


		<!-- Data Table -->
		<div class="overflow-x-auto rounded-xl border border-[#D7CCC8] shadow-sm">
			<table id="ReportData" class="min-w-full text-sm text-[#4E342E]">
				<thead class="bg-[#EFEBE9] text-[#4E342E] font-semibold">
					<tr>
						<th class="py-2 px-3 text-left">Sr. No.</th>
						<th class="py-2 px-3 text-left">Year</th>
						<th class="py-2 px-3 text-left">Employee Code</th>
						<th class="py-2 px-3 text-left">Employee Name</th>
						<th class="py-2 px-3 text-left">DOJ</th>
						<th class="py-2 px-3 text-left">Designation</th>
						<th class="py-2 px-3 text-left">Department</th>
						<th class="py-2 px-3 text-left">Tenure</th>
						<th class="py-2 px-3 text-left">Last Increment Date</th>

						<th class="py-2 px-3 text-left">Manager Emp Code</th>
						<th class="py-2 px-3 text-left">Manager Name</th>
						<th class="py-2 px-3 text-left">Manager Designation</th>


						<th class="py-2 px-3 text-left">Cumulative Self Rating</th>
						<th class="py-2 px-3 text-left">Cumulative Manager Rating</th>
						<th class="py-2 px-3 text-left">Final Rating</th>
						<th class="py-2 px-3 text-left">Deviation</th>
					</tr>
				</thead>
				<tbody>
					{#if dataval_result.Table_Data && dataval_result.Table_Data.length > 0}
						{#each dataval_result.Table_Data as row (row.Serial_Number)}
							{#if calculateDeviation(row) >= deviationValue}
								<tr class="even:bg-[#FAF6F2] hover:bg-[#EFEBE9] transition-colors">
									<td class="py-2 px-3">{row.Serial_Number}</td>
									<td class="py-2 px-3">{row.Year}</td>
									<td class="py-2 px-3">{row.Employee_Code}</td>
									<td class="py-2 px-3">{row.Employee_Name}</td>
									<td class="py-2 px-3">{row.DOJ}</td>
									<td class="py-2 px-3">{row.Designation}</td>
									<td class="py-2 px-3">{row.Department}</td>
									<td class="py-2 px-3">{row.Tenure}</td>
									<td class="py-2 px-3">{row.Last_Increment_Date}</td>

									<td class="py-2 px-3">{row.Manager_Employee_Code}</td>
									<td class="py-2 px-3">{row.Manager_Employee_Name}</td>
									<td class="py-2 px-3">{row.Manager_Designation}</td>

									<td class="py-2 px-3">{row.Cumulative_Self_Rating}</td>
									<td class="py-2 px-3">{row.Cumulative_Manager_Rating}</td>
									<td class="py-2 px-3">{row.Cumulative_Final_Rating}</td>
									<td class="py-2 px-3 font-bold text-[#795548]">{calculateDeviation(row).toFixed(2)}</td>
								</tr>
							{/if}
						{/each}
					{:else}
						<tr>
							<td colspan="13" class="text-center py-6 text-[#BCAAA4]">No data available</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
