<script>
  // Helper for select value
  function getSelectValue(id) {
    const el = document.getElementById(id);
    return el && el.tagName === 'SELECT' ? (/** @type {HTMLSelectElement} */ (el)).value : '';
  }
  //
  // Importing API Paths
  //
  import { API_PATHS } from '$lib/API_PATHS'

  import { onMount } from "svelte";
  import * as d3 from "d3";

  let loading = false;
  let h1Data = [];
  let h2Data = [];
  let finalData = [];

  let Departments = [];
  let Employees = [];

  onMount(async () => {
    // Initial Data Load
    let Get_Corporate_Report_Masters_Res = await fetch(API_PATHS.API_URL_Get_Corporate_Report_Masters, {
      method: 'POST'
    });

    Get_Corporate_Report_Masters_Res = await Get_Corporate_Report_Masters_Res.json();
    Departments = Get_Corporate_Report_Masters_Res['Departments'];
    Employees = Get_Corporate_Report_Masters_Res['Employees'];
  });

  // Generate report
  async function onSubmit() {
    loading = true;
    try {
      const all_data = JSON.stringify({
        Department: getSelectValue('Department'),
        Employee: getSelectValue('Employee'),
        Year: getSelectValue('Year'),
        Tenure: getSelectValue('Tenure')
      });

      const res = await fetch(API_PATHS.API_URL_Corporate_PMS_Report, {
        method: 'POST',
        body: all_data
      });

      if (!res.ok) throw new Error("Report API not reachable");

      const data = await res.json();
      const tableData = data.Table_Data;

      if (tableData && tableData.length > 0) {
        const filteredTableData = tableData.filter(e =>
          (e.Cumulative_H1_Self_Rating || 0) > 0 ||
          (e.Cumulative_H1_Manager_Rating || 0) > 0 ||
          (e.Cumulative_H1_Rating || 0) > 0 ||
          (e.Cumulative_H2_Self_Rating || 0) > 0 ||
          (e.Cumulative_H2_Manager_Rating || 0) > 0 ||
          (e.Cumulative_H2_Rating || 0) > 0 ||
          (e.Cumulative_Self_Rating || 0) > 0 ||
          (e.Cumulative_Manager_Rating || 0) > 0 ||
          (e.Cumulative_Final_Rating || 0) > 0
        );

        h1Data = filteredTableData.map((e) => ({
          name: e.Employee_Name,
          self: e.Cumulative_H1_Self_Rating || 0,
          manager: e.Cumulative_H1_Manager_Rating || 0,
          final: e.Cumulative_H1_Rating || 0,
        }));

        h2Data = filteredTableData.map((e) => ({
          name: e.Employee_Name,
          self: e.Cumulative_H2_Self_Rating || 0,
          manager: e.Cumulative_H2_Manager_Rating || 0,
          final: e.Cumulative_H2_Rating || 0,
        }));

        finalData = filteredTableData.map((e) => ({
          code: e.Employee_Code,
          name: e.Employee_Name,
          m_code: e.Manager_Employee_Code,
          m_name: e.Manager_Employee_Name,
          self: e.Cumulative_Self_Rating || 0,
          manager: e.Cumulative_Manager_Rating || 0,
          final: e.Cumulative_Final_Rating || 0,
        }));

        drawCharts();
      } else {
        alert("No data found!");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to fetch report.");
    } finally {
      loading = false;
    }
  }

  // Draw all charts
  function drawCharts() {
    drawBarChart("#h1Chart", h1Data, "H1 Ratings");
    drawBarChart("#h2Chart", h2Data, "H2 Ratings");
    drawBarChart("#finalChart", finalData, "Final Ratings");
  }

function drawBarChart(selector, data, title) {
  const container = d3.select(selector);
  container.selectAll("*").remove();

  const margin = { top: 40, right: 20, bottom: 90, left: 60 };
  const height = 300;

  const cleanData = data.map(d => ({
    name: d.name,
    values: [
      ...(d.self > 0 ? [{ key: "self", value: d.self }] : []),
      ...(d.manager > 0 ? [{ key: "manager", value: d.manager }] : []),
      ...(d.final > 0 ? [{ key: "final", value: d.final }] : [])
    ]
  }));

  const n = cleanData.length;

  const barWidth = 20;          // BAR WIDTH
  const innerGap = 0;           // << ZERO GAP BETWEEN SELF/MGR/FINAL

  // Increase employee spacing a bit
  const employeeSpacing = 75;   // Try 75 → adjust if needed

  const dynamicWidth = Math.max(
    500,
    n * employeeSpacing + margin.left + margin.right
  );

  const scrollBox = container
    .append("div")
    .style("overflow-x", "auto")
    .style("white-space", "nowrap");

  const svg = scrollBox.append("svg")
    .attr("width", dynamicWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const width = dynamicWidth - margin.left - margin.right;

  // Fix label placement for 1 or 2 data points
  let bandPaddingInner = 0.12;
  let bandPaddingOuter = 0.08;
  if (cleanData.length <= 2) {
    bandPaddingInner = 0.3;
    bandPaddingOuter = 0.3;
  }
  const x0 = d3.scaleBand()
    .domain(cleanData.map(d => d.name))
    .range([0, width])
    .paddingInner(bandPaddingInner)
    .paddingOuter(bandPaddingOuter);

  const y = d3.scaleLinear().domain([0, 5]).range([height, 0]);

  const colors = {
    self: "#22c55e",
    manager: "#3b82f6",
    final: "#f59e0b"
  };

  const keys = ['self', 'manager', 'final'];
  // Add gradient effects for bars and legend
  const gradients = svg.append("defs")
    .selectAll("linearGradient")
    .data(Object.keys(colors))
    .enter()
    .append("linearGradient")
    .attr("id", d => `gradient-${d}`)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradients.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => d3.color(colors[d]).brighter(0.3));

  gradients.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d => colors[d]);

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(0, -25)`);

  const legendItems = legend.selectAll(".legend-item")
    .data(keys)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 130}, 0)`);

  legendItems.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", 4)
    .attr("fill", d => `url(#gradient-${d})`)
    .style("stroke", d => d3.color(colors[d]).darker(0.2))
    .style("stroke-width", 1);

  legendItems.append("text")
    .attr("x", 25)
    .attr("y", 12)
    .text(d => `${d.charAt(0).toUpperCase() + d.slice(1)} Rating`)
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("fill", "#374151");


  // Custom x-axis styled like y-axis
  const xAxis = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);
  // Draw axis line (black, thick)
  xAxis.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5);
  // Add tick marks below each bar group
  xAxis.selectAll("line.x-tick")
    .data(cleanData)
    .enter()
    .append("line")
    .attr("class", "x-tick")
    .attr("x1", d => x0(d.name) + (d.values.length * barWidth + (d.values.length - 1) * innerGap) / 2)
    .attr("x2", d => x0(d.name) + (d.values.length * barWidth + (d.values.length - 1) * innerGap) / 2)
    .attr("y1", 0)
    .attr("y2", 12)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5);
  // Render labels below each tick
  xAxis.selectAll("text")
    .data(cleanData)
    .enter()
    .append("text")
    .attr("x", d => x0(d.name) + (d.values.length * barWidth + (d.values.length - 1) * innerGap) / 2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("fill", "#374151")
    .text(d => {
      const first = d.name.split(" ")[0];
      return first.length > 8 ? first.slice(0,8) : first;
    });
    
  svg.append("g").call(d3.axisLeft(y));

  // Enhanced bars with hover effects and gradients
  const barGroups = svg.selectAll("g.bar-group")
    .data(cleanData)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(${x0(d.name)},0)`);

  barGroups.each(function (d) {
    const g = d3.select(this);

    // Bars with animation
    const bars = g.selectAll("rect")
      .data(d.values)
      .enter()
      .append("rect")
      .attr("x", (bar, i) => i * (barWidth + innerGap))
      .attr("y", height)
      .attr("width", barWidth)
      .attr("height", 0)
      .attr("fill", bar => `url(#gradient-${bar.key})`)
      .attr("rx", 3)
      .style("stroke", bar => d3.color(colors[bar.key]).darker(0.3))
      .style("stroke-width", 1)
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .on("mouseover", function(event, bar) {
        d3.select(this)
          .style("filter", "brightness(1.1)")
          .style("stroke-width", 2);

        tooltip = {
           ...tooltip,
           show: true, 
           x: event.pageX , 
           y: event.pageY , 
           name: d.name, 
           value: Number(bar.value).toFixed(2), 
           key: bar.key 
          };
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("filter", "brightness(1)")
          .style("stroke-width", 1);

        tooltip = { show: false, x: 0, y: 0, name: '', value: '', key: '' };
      });

    bars.transition()
      .duration(800)
      .delay((bar, i) => i * 100)
      .attr("y", bar => y(bar.value))
      .attr("height", bar => height - y(bar.value))
      .ease(d3.easeElasticOut.amplitude(0.5).period(0.5));

    // ...existing code...
  });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 70)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text(title);
}


  // Tooltip state for bar hover
  let tooltip = {
    show: false,
    x: 0,
    y: 0,
    name: '',
    value: '',
    key: ''
  };
  
  // Filter states
  let Selected_Department = 'All';
  function handleDepartmentChange(e) {
    Selected_Department = e.target.value;
  }

  let Selected_Employee = 'All';
  function handleEmployeeChange(e) {
    Selected_Employee = Employees[e.target.value]?.Employee_Tag || 'All';
  }

  // Tenure (restored exactly)
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

  // Table rows: show all employees (filled and not filled)
  let allRows = [];
  $: {
    // Only show table data if a filter is applied or search is performed
    if (
      Selected_Department === 'All' &&
      Selected_Employee === 'All' &&
      Selected_Tenure === 'All' &&
      (!finalData || finalData.length === 0)
    ) {
      allRows = [];
    } else {
      // Build table rows only from Table_Data (finalData/h1Data/h2Data)
      allRows = finalData.map(e => ({
        code: e.code,
        name: e.name,
        m_code: e.m_code,
        m_name: e.m_name,
        h1_self: h1Data.find(d => d.name === e.name)?.self ?? '',
        h1_manager: h1Data.find(d => d.name === e.name)?.manager ?? '',
        h1_final: h1Data.find(d => d.name === e.name)?.final ?? '',
        h2_self: h2Data.find(d => d.name === e.name)?.self ?? '',
        h2_manager: h2Data.find(d => d.name === e.name)?.manager ?? '',
        h2_final: h2Data.find(d => d.name === e.name)?.final ?? '',
        final_self: e.self,
        final_manager: e.manager,
        final_final: e.final,
        filled: true
      }));
    }
  }
 </script>

  {#if tooltip.show}
    <div class="d3-tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
      <div><b>{tooltip.name}</b></div>
      <div>Type: {tooltip.key.charAt(0).toUpperCase() + tooltip.key.slice(1)}</div>
      <div>Value: {tooltip.value}</div>
    </div>
  {/if}


<!-- UI Layout -->
<div class="p-6 bg-gray-100 min-h-screen">
  <h1 class="text-2xl font-bold mb-2 text-center">Corporate PMS Report</h1>

  <!-------REPORT FILTERS START------->
  <div class="flex flex-col">
    <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
        <div class="overflow-x-auto">
          <div class="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
            <form on:submit|preventDefault={onSubmit}>	
              <div class="flex flex-wrap">

                <!-------REPORT FILTER LEFT SIDE START------->
                <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none">

                  <!-------REPORT FILTER: YEAR START------->
                  <div class="md:flex md:items-center mb-3">
                    <div class="md:w-1/3">									
                      <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Year">Year</label>
                    </div>
                    <div class="md:w-2/3">  
                      <select name="Year" id="Year" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">
                        <option value="Financial Year: 2025-2026">Financial Year: 2025-2026</option>
                      </select>			
                    </div>
                  </div>
                  <!-------REPORT FILTER: YEAR END------->

                  <!-------REPORT FILTER: TENURE START------->
                  <div class="md:flex md:items-center mb-3">
                    <div class="md:w-1/3">									
                      <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Tenure">Tenure</label>
                    </div>
                    <div class="md:w-2/3">  
                      <select 
                        name="Tenure" 
                        id="Tenure" 
                        class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
                        on:change={handleTenureChange}
                      >
                        <option value="All">All</option> 
                        <option value="Less than 1 Year">Less than 1 Year</option>
                        <option value="1 to 3 Years">1 to 3 Years</option>
                        <option value="More than 3 Years">More than 3 Years</option>
                      </select>			
                    </div>
                  </div>
                  <!-------REPORT FILTER: TENURE END------->

                </div>
                <!-------REPORT FILTER LEFT SIDE END------->

                <!-------REPORT FILTER RIGHT SIDE START------->
                <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none">
                                        
                  <!-------REPORT FILTER: Department START------->
                  <div class="md:flex md:items-center mb-3">
                    <div class="md:w-1/3">									
                      <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Department">Department</label>
                    </div>
                    <div class="md:w-2/3">  
                      <select 
                        name="Department" 
                        id="Department" 
                        class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500" 
                        on:change={handleDepartmentChange}
                      >
                      <option value="All">All</option>
                        {#each Departments as department}
                          <option value={department}>{department}</option>
                        {/each}
                      </select>			
                    </div>
                  </div>
                  <!-------REPORT FILTER: Department END------->

                  <!-------REPORT FILTER: EMPLOYEE START------->
                  <div class="md:flex md:items-center mb-3">
                    <div class="md:w-1/3">									
                      <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Employee">Employee</label>
                    </div>
                    <div class="md:w-2/3">  
                      <select 
                        name="Employee" 
                        id="Employee" 
                        class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
                        on:change={handleEmployeeChange}
                      >
                        <option value="All">All</option>
                        {#each Object.entries(Employees) as [employee_self_id, employee_data]}
                          {#if 
                            (Selected_Department === 'All' || Selected_Department === employee_data.Department) &&
                            (Selected_Tenure === 'All' || 
                            (Selected_Tenure === '<1' && employee_data.Tenure_Value < 1) ||
                            (Selected_Tenure === '1-3' && employee_data.Tenure_Value >= 1 && employee_data.Tenure_Value <= 3) ||
                            (Selected_Tenure === '>3' && employee_data.Tenure_Value > 3))
                          }
                            <option value={employee_self_id}>{employee_data.Employee_Tag} - {employee_data.Department}</option>
                          {/if}
                        {/each}
                      </select>		
                    </div>
                  </div>
                  <!-------REPORT FILTER: EMPLOYEE END------->

                </div>
                <!-------REPORT FILTER RIGHT SIDE END------->

              </div>

              <!-------REPORT FILTER: SEARCH BUTTON START------->
              <div class="flex flex-wrap items-center justify-end space-x-3 text-center">    
                <button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">
                  Search
                </button>
              </div>
              <!-------REPORT FILTER: SEARCH BUTTON END------->
            </form>  
          </div>                
        </div>
      </div>
    </div>
  </div>
  <!-------REPORT FILTERS END------->

  <!-- Charts and Table Side by Side -->
  <div class="mt-6 flex flex-row gap-8 flex-nowrap items-start">
    <!-- Enhanced Graphs Section -->
    <div class="w-full lg:w-[60%] flex flex-col gap-6 min-w-[350px]">
      {#each [
        { id: "h1Chart", data: h1Data, title: "H1 Ratings" },
        { id: "h2Chart", data: h2Data, title: "H2 Ratings" },
        { id: "finalChart", data: finalData, title: "Final Ratings" }
      ] as chart}
        <div class="bg-white shadow-2xl rounded-2xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300">
          <div id={chart.id} class="chart-container"></div>
        </div>
      {/each}
    </div>
    <!-- Table Right: 3/7 -->
    <div class="w-[40%] shrink min-w-[300px] max-w-full">
      <div class="bg-white shadow-2xl rounded-2xl p-6 h-full flex flex-col" style="height: 1517px; min-height: 1517px; max-height: 1517px;">
        <!-- Removed filled/not filled tab buttons -->
        <div class="flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white" style="max-width: 1000px; height: 100%;">
          <table class="min-w-[1000px] text-xs md:text-sm table-auto">
            <thead>
              <tr class="bg-gray-50 text-gray-700">
                <th class="px-3 py-2 border-b">Emp Code</th>
                <th class="px-3 py-2 border-b">Name</th>
                <th class="px-3 py-2 border-b">H1 Self</th>
                <th class="px-3 py-2 border-b">H1 Manager</th>
                <th class="px-3 py-2 border-b">H1 Final</th>
                <th class="px-3 py-2 border-b">H2 Self</th>
                <th class="px-3 py-2 border-b">H2 Manager</th>
                <th class="px-3 py-2 border-b">H2 Final</th>
                <th class="px-3 py-2 border-b">Final Self</th>
                <th class="px-3 py-2 border-b">Final Manager</th>
                <th class="px-3 py-2 border-b">Final Final</th>
              </tr>
            </thead>
            <tbody>
              {#each allRows as row}
                <tr class={row.filled ? 'hover:bg-blue-50' : 'hover:bg-red-50'}>
                  <!-- <td class="px-3 py-2 border-b">{row.name}</td> -->
                   <td class="px-3 py-2 border-b">{row.code}</td>
                  <td class="px-4 py-3">
                    <div>{row.name}</div>
                    <div class="text-xs text-gray-500">
                      {row.m_code} : {row.m_name}
                    </div>
                  </td>                  
                  <td class="px-3 py-2 border-b">{row.h1_self}</td>
                  <td class="px-3 py-2 border-b">{row.h1_manager}</td>
                  <td class="px-3 py-2 border-b">{row.h1_final}</td>
                  <td class="px-3 py-2 border-b">{row.h2_self}</td>
                  <td class="px-3 py-2 border-b">{row.h2_manager}</td>
                  <td class="px-3 py-2 border-b">{row.h2_final}</td>
                  <td class="px-3 py-2 border-b">{row.final_self}</td>
                  <td class="px-3 py-2 border-b">{row.final_manager}</td>
                  <td class="px-3 py-2 border-b">{row.final_final}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</div>

<style>
  .chart-container {
    width: 100%;
    min-width: 350px;
    max-width: 1000px;
    /* No scrollbars, always full width */
    overflow-x: visible;
  }
  .d3-tooltip {
    position: fixed;
    background: #fff;
    border: 2px solid red;
    padding: 8px 14px;
    border-radius: 8px;
    pointer-events: none;
    font-size: 15px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    z-index: 9999;
    display: block;
    white-space: pre-line;
    min-width: 120px;
    max-width: 320px;
  }
</style>