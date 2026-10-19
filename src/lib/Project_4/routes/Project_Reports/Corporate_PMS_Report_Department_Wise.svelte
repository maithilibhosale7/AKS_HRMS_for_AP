<script>
    import { onMount } from 'svelte';
    import { API_PATHS } from '$lib/API_PATHS';
    import * as d3 from 'd3';

    let Table_Data = [];
    let overallSummary = {};
    let departmentSummary = {};
    let expandedDepartments = new Set();
    let expandedEmployees = new Set();
    let chartContainer;
    // Employees master list is no longer used for summary calculations

    // export let dataval_result = [];

    // Fetch data on mount
    onMount(async () => {
        // Only fetch Table_Data from Corporate_PMS_Report
        const res = await fetch(API_PATHS.API_URL_Corporate_PMS_Report, {
            method: "POST",
            body: JSON.stringify({
                Department: "All",
                Employee: "All",
                Year: "Financial Year: 2025-2026",
                Tenure: "All",
            }),
        });

        const data = await res.json();
        Table_Data = data.Table_Data || [];
        calculateOverallSummary();
        calculateDepartmentSummary();

        // console.log("Fetched Table_Data:", Table_Data);
        console.log("Overall Summary:", overallSummary);
        console.log("Department Summary:", departmentSummary);
    });

    // Calculate overall summary
    function calculateOverallSummary() {
        const totalIndividuals = Table_Data.length;
        let notFilledCount = 0;
        function isUnfilled(entry) {
            const fields = [
                entry?.Cumulative_H1_Self_Rating,
                entry?.Cumulative_H1_Manager_Rating,
                entry?.Cumulative_H1_Rating,
                entry?.Cumulative_H2_Self_Rating,
                entry?.Cumulative_H2_Manager_Rating,
                entry?.Cumulative_H2_Rating
            ];
            return fields.every(val => Number(val) === 0 || val === undefined || val === null);
        }
        Table_Data.forEach(entry => {
            if (isUnfilled(entry)) {
                notFilledCount++;
            }
        });
        const avg = (key) => {
            const validRatings = Table_Data.filter(row => parseFloat(row[key] || 0) > 0);
            const totalValid = validRatings.length;
            return validRatings.reduce((sum, row) => sum + parseFloat(row[key] || 0), 0) / (totalValid || 1);
        };

        overallSummary = {
            totalIndividuals,
            notFilledCount,
            avgH1Self: avg("Cumulative_H1_Self_Rating"),
            avgH1Manager: avg("Cumulative_H1_Manager_Rating"),
            avgH1: avg("Cumulative_H1_Rating"),
            avgH2Self: avg("Cumulative_H2_Self_Rating"),
            avgH2Manager: avg("Cumulative_H2_Manager_Rating"),
            avgH2: avg("Cumulative_H2_Rating"),
            avgFinal: avg("Cumulative_Final_Rating"),
        };
    }

    // Calculate department-wise summary
    function calculateDepartmentSummary() {
        departmentSummary = {};
        // Build department-wise employee lists from Table_Data
        Table_Data.forEach(row => {
            const dept = row.Department;
            if (!departmentSummary[dept]) {
                departmentSummary[dept] = {
                    totalIndividuals: 0,
                    notFilledCount: 0,
                    totalIndividualsWithH1Self: 0,
                    avgH1Self: 0,
                    totalIndividualsWithH1Manager: 0,
                    avgH1Manager: 0,
                    totalIndividualsWithH1: 0,
                    avgH1: 0,
                    totalIndividualsWithH2Self: 0,
                    avgH2Self: 0,
                    totalIndividualsWithH2Manager: 0,
                    avgH2Manager: 0,
                    totalIndividualsWithH2: 0,
                    avgH2: 0,
                    totalIndividualsWithFinal: 0,
                    avgFinal: 0,
                    employees: [],
                };
            }
            departmentSummary[dept].totalIndividuals++;
            departmentSummary[dept].employees.push(row);
            // Not filled: all ratings are zero or missing
            function isUnfilled(entry) {
                const fields = [
                    entry?.Cumulative_H1_Self_Rating,
                    entry?.Cumulative_H1_Manager_Rating,
                    entry?.Cumulative_H1_Rating,
                    entry?.Cumulative_H2_Self_Rating,
                    entry?.Cumulative_H2_Manager_Rating,
                    entry?.Cumulative_H2_Rating
                ];
                return fields.every(val => Number(val) === 0 || val === undefined || val === null);
            }
            if (isUnfilled(row)) {
                departmentSummary[dept].notFilledCount++;
            }
            if (row.Cumulative_H1_Self_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithH1Self++;
            }
            departmentSummary[dept].avgH1Self += parseFloat(row.Cumulative_H1_Self_Rating || 0);
            if (row.Cumulative_H1_Manager_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithH1Manager++;
            }
            departmentSummary[dept].avgH1Manager += parseFloat(row.Cumulative_H1_Manager_Rating || 0);
            if (row.Cumulative_H1_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithH1++;
            }
            departmentSummary[dept].avgH1 += parseFloat(row.Cumulative_H1_Rating || 0);
            if (row.Cumulative_H2_Self_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithH2Self++;
            }
            departmentSummary[dept].avgH2Self += parseFloat(row.Cumulative_H2_Self_Rating || 0);
            if (row.Cumulative_H2_Manager_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithH2Manager++;
            }
            departmentSummary[dept].avgH2Manager += parseFloat(row.Cumulative_H2_Manager_Rating || 0);
            if (row.Cumulative_H2_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithH2++;
            }
            departmentSummary[dept].avgH2 += parseFloat(row.Cumulative_H2_Rating || 0);
            if (row.Cumulative_Final_Rating > 0) {
                departmentSummary[dept].totalIndividualsWithFinal++;
            }
            departmentSummary[dept].avgFinal += parseFloat(row.Cumulative_Final_Rating || 0);
        });

        // Calculate averages for each department
        Object.keys(departmentSummary).forEach((dept) => {
            const deptData = departmentSummary[dept];
            deptData.avgH1Self /= deptData.totalIndividualsWithH1Self || 1;
            deptData.avgH1Manager /= deptData.totalIndividualsWithH1Manager || 1;
            deptData.avgH1 /= deptData.totalIndividualsWithH1 || 1;
            deptData.avgH2Self /= deptData.totalIndividualsWithH2Self || 1;
            deptData.avgH2Manager /= deptData.totalIndividualsWithH2Manager || 1;
            deptData.avgH2 /= deptData.totalIndividualsWithH2 || 1;
            deptData.avgFinal /= deptData.totalIndividualsWithFinal || 1;
        });
        // Draw chart after summary is calculated
        setTimeout(drawDepartmentBarChart, 0);
    }

    // Draw department bar chart with D3.js
    function drawDepartmentBarChart() {
        // Clear any existing chart
        const container = document.getElementById('departmentBarChart');
        if (!container) return;
        container.innerHTML = '';
        
        const depts = Object.keys(departmentSummary);
        
        // Prepare data
        const cleanData = depts.map(dept => {
            const deptData = departmentSummary[dept];
            return {
                name: dept,
                self: deptData.avgH1Self || 0,
                manager: deptData.avgH1Manager || 0,
                final: deptData.avgFinal || 0
            };
        });
        
        // Colors (same as original)
        const colors = {
            self: '#22c55e',
            manager: '#3b82f6',
            final: '#f59e0b'
        };
        
        // Calculate dimensions
        const n = cleanData.length;
        const barWidth = 18;
        const groupSpacing = 85;
        const margin = { left: 60, right: 40, top: 70, bottom: 60 };
        const chartWidth = Math.max(800, n * groupSpacing + margin.left + margin.right);
        const chartHeight = 350;
        
        // Create SVG container
        const svg = d3.select('#departmentBarChart')
            .append('svg')
            .attr('width', chartWidth)
            .attr('height', chartHeight + 50)
            .style('background', 'white')
            .style('display', 'block');
        
        // Create main chart group
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Scales
        const x0 = d3.scaleBand()
            .domain(cleanData.map(d => d.name))
            .range([0, chartWidth - margin.left - margin.right])
            .padding(0.2);
        
        const x1 = d3.scaleBand()
            .domain(['self', 'manager', 'final'])
            .range([0, x0.bandwidth()])
            .padding(0.1);
        
        const y = d3.scaleLinear()
            .domain([0, 5])
            .nice()
            .range([chartHeight - margin.bottom, 0]);
        
        // For each department, determine which categories are present (nonzero)
        // We'll draw only those bars, and space them evenly within the group
        const allCategories = ['self', 'manager', 'final'];
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(255, 255, 255, 0.98)')
            .style('border', '1px solid #D1D5DB')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('font-size', '12px')
            .style('font-family', "'Segoe UI', 'Roboto', sans-serif")
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');

        // Draw bars for each department
        g.selectAll('g.bar-group')
            .data(cleanData)
            .enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', d => `translate(${x0(d.name)},0)`)
            .each(function(d) {
                // For this department, get present categories
                const presentCats = allCategories.filter(cat => d[cat] > 0);
                // Compute local scale for this group
                const localX = d3.scaleBand()
                    .domain(presentCats)
                    .range([0, x0.bandwidth()])
                    .padding(0.15);
                // Draw bars for present categories
                d3.select(this)
                    .selectAll('rect')
                    .data(presentCats)
                    .enter()
                    .append('rect')
                    .attr('x', cat => localX(cat))
                    .attr('y', cat => y(d[cat]))
                    .attr('width', localX.bandwidth())
                    .attr('height', cat => chartHeight - margin.bottom - y(d[cat]))
                    .attr('fill', cat => colors[cat])
                    .attr('rx', 3)
                    .style('cursor', 'pointer')
                    .on('mouseover', function(event, cat) {
                        tooltip.transition().duration(200).style('opacity', 0.98);
                        tooltip.html(`
                            <strong>${d.name}</strong><br/>
                            ${cat === 'self' ? 'Self Rating' : cat === 'manager' ? 'Manager Rating' : 'Final Rating'}: 
                            <strong>${d[cat].toFixed(2)}</strong>
                        `)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                        d3.select(this)
                            .style('opacity', 0.8)
                            .style('stroke', '#000')
                            .style('stroke-width', '1px');
                    })
                    .on('mouseout', function() {
                        tooltip.transition().duration(200).style('opacity', 0);
                        d3.select(this)
                            .style('opacity', 1)
                            .style('stroke', 'none');
                    });
            });
        
        // X-axis
        const xAxis = g.append('g')
            .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
            .call(d3.axisBottom(x0))
            .call(g => g.select('.domain')
                .attr('stroke', '#000')
                .attr('stroke-width', 1))
            .call(g => g.selectAll('.tick line')
                .attr('stroke', 'none'))
            .call(g => g.selectAll('.tick text')
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('font-family', "'Segoe UI', 'Roboto', sans-serif")
                .style('fill', '#374151')
                .style('text-anchor', 'middle')
                .text(d => {
                    if (d.length > 10) {
                        return d.substring(0, 8) + '...';
                    }
                    return d;
                }));
        
        // Y-axis
        const yAxis = g.append('g')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => d % 1 === 0 ? d : ''))
            .call(g => g.select('.domain')
                .attr('stroke', '#000')
                .attr('stroke-width', 1))
            .call(g => g.selectAll('.tick line')
                .attr('stroke', 'rgba(0, 0, 0, 0.08)')
                .attr('stroke-width', 1))
            .call(g => g.selectAll('.tick text')
                .style('font-size', '11px')
                .style('font-weight', '500')
                .style('font-family', "'Segoe UI', 'Roboto', sans-serif")
                .style('fill', '#6B7280'));
        
        // Grid lines
        g.selectAll('.grid-line')
            .data(y.ticks(5))
            .enter()
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', chartWidth - margin.left - margin.right)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', 'rgba(0, 0, 0, 0.08)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
        
        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${margin.left}, 20)`);
        
        const legendItems = [];
        if (categories.includes('self')) legendItems.push({ color: colors.self, label: 'Self Rating' });
        if (categories.includes('manager')) legendItems.push({ color: colors.manager, label: 'Manager Rating' });
        if (categories.includes('final')) legendItems.push({ color: colors.final, label: 'Final Rating' });
        
        legendItems.forEach((item, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(${i * 120}, 0)`);
            
            legendItem.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .attr('rx', 3)
                .attr('fill', item.color);
            
            legendItem.append('text')
                .attr('x', 18)
                .attr('y', 10)
                .style('font-size', '12px')
                .style('font-weight', '600')
                .style('font-family', "'Segoe UI', 'Roboto', sans-serif")
                .style('fill', '#374151')
                .text(item.label);
        });
        
        // Create scrollable container
        const scrollWrapper = document.createElement('div');
        scrollWrapper.style.cssText = `
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            padding: 20px;
        `;
        
        const chartContainerDiv = document.createElement('div');
        chartContainerDiv.style.cssText = `
            width: ${chartWidth}px;
            height: ${chartHeight + 100}px;
            min-width: 100%;
        `;
        
        chartContainerDiv.appendChild(svg.node());
        scrollWrapper.appendChild(chartContainerDiv);
        container.appendChild(scrollWrapper);
        
        // Add scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            div[style*="overflow-x: auto"]::-webkit-scrollbar {
                height: 8px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
                background: #9ca3af;
                border-radius: 4px;
            }
            div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb:hover {
                background: #6b7280;
            }
            .d3-tooltip {
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);
    }

    // Toggle department expansion
    function toggleDepartment(dept) {
        console.log("Toggling department:", dept);
        expandedDepartments = new Set(expandedDepartments); // Create a new Set to trigger reactivity
        if (expandedDepartments.has(dept)) {
            expandedDepartments.delete(dept);
        } else {
            expandedDepartments.add(dept);
        }
    }

    // Toggle employee expansion
    function toggleEmployee(empId) {
        if (expandedEmployees.has(empId)) {
            expandedEmployees.delete(empId);
        } else {
            expandedEmployees.add(empId);
        }
    }

    $: console.log("expandedDepartments:", expandedDepartments);


    //
    // Export function
    //
    import ExcelJS from 'exceljs';

    async function exportReportToXLSX() {
        const workbook = new ExcelJS.Workbook();

        //===========================================================
        // 1. COMMON STYLE HELPERS
        //===========================================================
        const applyHeaderStyles = (headerRow) => {
            headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 12 };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "D8BFD8" }, // Light Purple
            };
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } }
            };
            });
        };

        const applyBodyStyles = (row) => {
            row.eachCell((cell) => {
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        };

        //===========================================================
        // 2. HELPER: Convert HTML Table → 2D Array
        //===========================================================
        function parseTable(tableId) {
            const table = document.getElementById(tableId);
            const rows = [...table.querySelectorAll("tr")];
            return rows.map((tr) => {
                return [...tr.querySelectorAll("th, td")].map((td) => td.innerText.trim());
            });
        }

        //===========================================================
        // 3. WORKSHEET 1 — SUMMARY TABLE
        //===========================================================
        const summarySheet = workbook.addWorksheet("Summary");

        const summaryData = parseTable("Report_Summary");

        // First row = header
        const summaryHeader = summarySheet.addRow(summaryData[0]);
        applyHeaderStyles(summaryHeader);

        // Body rows
        summaryData.slice(1).forEach((r) => {
            let row = summarySheet.addRow(r);
            applyBodyStyles(row);
        });

        summarySheet.columns.forEach((col) => { col.width = 22; });

        //===========================================================
        // 4. WORKSHEET 2 — DETAILS TABLE
        //===========================================================
        const detailsSheet = workbook.addWorksheet("Details");

        const detailsData = parseTable("Report_Details");

        // First row = header
        const detailsHeader = detailsSheet.addRow(detailsData[0]);
        applyHeaderStyles(detailsHeader);

        // Body rows
        detailsData.slice(1).forEach((r) => {
            let row = detailsSheet.addRow(r);
            applyBodyStyles(row);
        });

        detailsSheet.columns.forEach((col) => { col.width = 22; });

        //===========================================================
        // 5. DOWNLOAD FILE
        //===========================================================
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Corporate_PMS_Report_Department_Wise.xlsx";
        link.click();
    }

</script>
<!-------JS FUNCTIONS END------->


<svelte:head>
	<title>Department Wise Corporate PMS Report | Recon</title>
</svelte:head>

<div class="relative w-full h-full hidden" id="loader_block">  
	<div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
		<img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
	</div>
</div>

{#if Table_Data.length === 0}
	<p class="text-center text-gray-500">No data available.</p>
{:else}
	<!-- Table View -->
<div class="p-4 bg-gray-100 min-h-screen">

	<div class="flex items-center justify-between mt-2 xl:my-4">
		<h1 class="text-xl font-bold text-gray-800 tracking-wide">
			Corporate PMS Report – Department Wise
		</h1>
		<button  on:click={exportReportToXLSX} type="button" class="inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2 ml-4">
			Export 
		</button>
	</div>

	<!-- Overall Summary -->
	<div class="mb-10">
		<div class="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
			<h2 class="text-xl font-semibold mb-6 text-gray-800">Overall Summary</h2>

			<div class="overflow-hidden rounded-xl border border-gray-200">
				<table id="Report_Summary" class="w-full text-sm">
					<thead class="bg-gray-50 text-gray-700 border-b">
						<tr>
							<th class="px-4 py-3 font-medium text-left">Total Individuals</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative H1 Self</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative H1 Manager</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative H1</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative H2 Self</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative H2 Manager</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative H2</th>
							<th class="px-4 py-3 font-medium text-left">Cumulative Final</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-gray-100">
						<tr class="bg-white hover:bg-gray-50">
							<td class="px-4 py-3 font-semibold">
								{overallSummary.totalIndividuals}
								<span class="text-xs text-gray-500">(Not Filled: {overallSummary.notFilledCount})</span>
							</td>

							<td class="px-4 py-3">{overallSummary.avgH1Self.toFixed(2)}</td>
							<td class="px-4 py-3">{overallSummary.avgH1Manager.toFixed(2)}</td>
							<td class="px-4 py-3">{overallSummary.avgH1.toFixed(2)}</td>
							<td class="px-4 py-3">{overallSummary.avgH2Self.toFixed(2)}</td>
							<td class="px-4 py-3">{overallSummary.avgH2Manager.toFixed(2)}</td>
							<td class="px-4 py-3">{overallSummary.avgH2.toFixed(2)}</td>
							<td class="px-4 py-3">{overallSummary.avgFinal.toFixed(2)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Department Summary -->
	<div>
		<div class="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
			<h2 class="text-xl font-semibold mb-6 text-gray-800">Department-wise Summary</h2>

			<!-- Bar Graph: Department Ratings -->
			<div class="mt-10 mb-4">
                <div class="chart-container" style="overflow-x: auto; overflow-y: hidden; white-space: nowrap; width: 100%;">
                    <div id="departmentBarChart" style="display: inline-block; min-width: 800px; width: auto;"></div>
                </div>
			</div>

			<div class="overflow-hidden rounded-xl border border-gray-200">
				<table id="Report_Details" class="w-full text-sm">
					<thead class="bg-gray-50 text-gray-700 border-b">
						<tr>
							<th class="px-4 py-3"></th>
							<th class="px-4 py-3 font-medium text-left">Department</th>
							<th class="px-4 py-3 font-medium text-left">Total</th>
                            {#if expandedDepartments.size > 0}
                                <th class="px-4 py-3 font-medium text-left">Manager Details</th>
                            {/if}
							<th class="px-4 py-3 font-medium text-left">H1 Self</th>
							<th class="px-4 py-3 font-medium text-left">H1 Manager</th>
							<th class="px-4 py-3 font-medium text-left">H1</th>
							<th class="px-4 py-3 font-medium text-left">H2 Self</th>
							<th class="px-4 py-3 font-medium text-left">H2 Manager</th>
							<th class="px-4 py-3 font-medium text-left">H2</th>
							<th class="px-4 py-3 font-medium text-left">Final</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each Object.entries(departmentSummary) as [dept, data]}
							<tr class={expandedDepartments.has(dept) 
								? "bg-blue-50 transition" 
								: "hover:bg-gray-50 transition"}>
								<td class="px-4 py-3 text-center">
									<button
										on:click={() => toggleDepartment(dept)}
										class="px-3 py-1 rounded-lg transition text-sm
										bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white shadow-sm">
										{expandedDepartments.has(dept) ? "-" : "+"}
									</button>
								</td>
								<td class="px-4 py-3 font-semibold text-gray-900">{dept}</td>
								<td class="px-4 py-3 font-semibold">
									{data.totalIndividuals}
									<span class="text-xs text-gray-500">
										(Not Filled: {data.notFilledCount})
									</span>
								</td>
                                {#if expandedDepartments.size > 0}
								    <td class="px-4 py-3"></td>
                                {/if}
                                <td class="px-4 py-3">{data.avgH1Self.toFixed(2)}</td>
								<td class="px-4 py-3">{data.avgH1Manager.toFixed(2)}</td>
								<td class="px-4 py-3">{data.avgH1.toFixed(2)}</td>
								<td class="px-4 py-3">{data.avgH2Self.toFixed(2)}</td>
								<td class="px-4 py-3">{data.avgH2Manager.toFixed(2)}</td>
								<td class="px-4 py-3">{data.avgH2.toFixed(2)}</td>
								<td class="px-4 py-3">{data.avgFinal.toFixed(2)}</td>
							</tr>
							<!-- EMPLOYEE DETAILS -->
							{#if expandedDepartments.has(dept)}
								{#each data.employees as emp, index}
									<tr class="bg-gray-50">
										<td class="px-4 py-3 text-gray-500">{index + 1}</td>
										<td class="px-4 py-3">{emp.Employee_Name}</td>
										<td class="px-4 py-3">{emp.Employee_Code}</td>
                                        {#if expandedDepartments.size > 0}
                                            <td class="px-4 py-3">{emp.Manager_Employee_Code} : {emp.Manager_Employee_Name}</td>
                                        {/if}
										<td class="px-4 py-3">{emp.Cumulative_H1_Self_Rating}</td>
										<td class="px-4 py-3">{emp.Cumulative_H1_Manager_Rating}</td>
										<td class="px-4 py-3">{emp.Cumulative_H1_Rating}</td>
										<td class="px-4 py-3">{emp.Cumulative_H2_Self_Rating}</td>
										<td class="px-4 py-3">{emp.Cumulative_H2_Manager_Rating}</td>
										<td class="px-4 py-3">{emp.Cumulative_H2_Rating}</td>
										<td class="px-4 py-3">{emp.Cumulative_Final_Rating}</td>
									</tr>
								{/each}
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
{/if}

<style>
/* Container styling */
.chart-container {
    width: 100%;
    min-height: 500px;
    background: white;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
}

/* Ensure bars are visible */
.chartjs-render-monitor {
  background: white !important;
}

/* Make bars crisp */
/* Remove canvas styling, not needed for D3 */
</style>