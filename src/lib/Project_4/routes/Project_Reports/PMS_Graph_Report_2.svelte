<script>

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
  let departmentSummary = {};
  let overallSummary = {};

  

  let Departments = [];
  let Employees = [];

  onMount(async () => {
    // Initial Data Load or Setup can be done here if needed
    // Get Filter_Condition
    let Get_Corporate_Report_Masters_Res = await fetch(API_PATHS.API_URL_Get_Corporate_Report_Masters, {
      method: 'POST'
    });

    Get_Corporate_Report_Masters_Res  = await Get_Corporate_Report_Masters_Res.json();
    Departments = Get_Corporate_Report_Masters_Res['Departments'];
    Employees = Get_Corporate_Report_Masters_Res['Employees'];
  });

  // Generate report
  async function onSubmit() {
    loading = true;
    try {
      // Filter Conditions
      const all_data = JSON.stringify({
        Department : document.getElementById('Department').value,
        Employee : 'All',
        Year : document.getElementById('Year').value,
        Tenure : document.getElementById('Tenure').value,
      });

      const res = await fetch(API_PATHS.API_URL_Report_Code_Gen+'Corporate_PMS_Report', {
        method: 'POST',
        body: all_data
      })

      if (!res.ok) throw new Error("Report API not reachable");

      const data = await res.json();
      const tableData = data.Table_Data;

      if (tableData && tableData.length > 0) {
        // Get all employee IDs from Employees object
        const allEmployeeIds = Object.keys(Employees);
        // Get IDs of employees who have filled data (from tableData)
        const filledIds = new Set(tableData.map(e => e.Employee_Self_ID || e.Employee_ID || e.Employee_Tag));

        // Count filled and not filled
        const filledCount = tableData.length;
        const notFilledCount = allEmployeeIds.length - filledCount;

        h1Data = tableData.map((e) => ({
          name: e.Employee_Name,
          self: e.Cumulative_H1_Self_Rating || 0,
          manager: e.Cumulative_H1_Manager_Rating || 0,
          final: e.Cumulative_H1_Rating || 0,
        }));

        h2Data = tableData.map((e) => ({
          name: e.Employee_Name,
          self: e.Cumulative_H2_Self_Rating || 0,
          manager: e.Cumulative_H2_Manager_Rating || 0,
          final: e.Cumulative_H2_Rating || 0,
        }));

        finalData = tableData.map((e) => ({
          name: e.Employee_Name,
          self: e.Cumulative_Self_Rating || 0,
          manager: e.Cumulative_Manager_Rating || 0,
          final: e.Cumulative_Final_Rating || 0,
        }));

        // Calculate department and overall summaries for the table
        calculateDepartmentSummary(tableData);
        calculateOverallSummary(tableData);

        drawCharts();
      } else {
        // If no data, show all as not filled
        departmentSummary = {};
        overallSummary = {};
        alert("No data found!");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to fetch report.");
    } finally {
      loading = false;
    }
  }


  // Draw charts using D3
  // Tab state for rating type
  let activeTab = 'self'; // 'self', 'manager', 'final'

  function drawCharts() {
    if (activeTab === 'self') {
      drawLineChart("#singleChart", h1Data, "Self Ratings", 'self');
    } else if (activeTab === 'manager') {
      drawLineChart("#singleChart", h1Data, "Manager Ratings", 'manager');
    } else if (activeTab === 'final') {
      drawLineChart("#singleChart", h1Data, "Final Ratings", 'final');
    }
  }

// Draw a line chart with auto-scaling x-axis and y-axis as employee count
function drawLineChart(selector, data, title, key) {
  const container = d3.select(selector);
  container.selectAll("*").remove(); // Clear previous chart

  const margin = { top: 90, right: 40, bottom: 100, left: 80 };
  
  // Filter out invalid data
  const filtered = data.filter(d => {
    const val = Number(d[key]);
    return !isNaN(val) && val > 0;
  });

  // Group by rating value - aggregate counts
  const ratingMap = new Map();
  
  filtered.forEach(d => {
    const val = Number(d[key]);
    // Round to 1 decimal place to group similar values
    const roundedVal = Math.round(val * 10) / 10;
    
    if (!ratingMap.has(roundedVal)) {
      ratingMap.set(roundedVal, {
        x: roundedVal,
        count: 0
      });
    }
    
    ratingMap.get(roundedVal).count += 1;
  });

  // Convert map to array and sort
  const points = Array.from(ratingMap.values())
    .map(entry => ({
      x: entry.x,
      y: entry.count,
      label: `Rating: ${entry.x.toFixed(1)}`
    }))
    .sort((a, b) => a.x - b.x);

  // If no data points, show empty chart message
  if (points.length === 0) {
    container.append("div")
      .style("text-align", "center")
      .style("padding", "40px")
      .style("color", "#6b7280")
      .text("No data available for this chart");
    return;
  }

  // Calculate dimensions
  const containerWidth = container.node().getBoundingClientRect().width;
  const width = Math.min(800, containerWidth - margin.left - margin.right);
  const height = 500 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "chart-svg")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Color mapping
  const colors = {
    'self': '#10b981',
    'manager': '#3b82f6', 
    'direct_reports': '#f59e0b',
    'peers': '#8b5cf6'
  };
  const color = colors[key] || '#6b7280';

  // X scale
  const xValues = points.map(d => d.x);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  
  const xPadding = (xMax - xMin) * 0.1 || 0.5;
  const xDomain = [xMin - xPadding, xMax + xPadding];
  
  const x = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width])
    .nice();

  // Y scale
  const yMax = Math.max(...points.map(d => d.y));
  let yTickStep;
  if (yMax <= 5) yTickStep = 1;
  else if (yMax <= 10) yTickStep = 2;
  else if (yMax <= 20) yTickStep = 5;
  else yTickStep = Math.ceil(yMax / 5);
  
  const maxTickValue = Math.ceil(yMax / yTickStep) * yTickStep;
  const y = d3.scaleLinear()
    .domain([0, maxTickValue])
    .range([height, 0]);

  // Generate Y tick values
  const yTickValues = [];
  for (let i = 0; i <= maxTickValue; i += yTickStep) {
    yTickValues.push(i);
  }

  // Draw horizontal grid lines
  svg.append("g")
    .attr("class", "grid-lines")
    .selectAll("line.horizontal")
    .data(yTickValues)
    .enter()
    .append("line")
    .attr("class", "horizontal")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#e5e7eb")
    .attr("stroke-width", 1);

  // X-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .tickValues(xValues)
      .tickFormat(d => d % 1 === 0 ? d.toString() : d.toFixed(1))
      .tickSize(6)
      .tickPadding(10)
    )
    .selectAll(".tick text")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("fill", "#4b5563");

  svg.select(".x-axis .domain")
    .attr("stroke", "#9ca3af")
    .attr("stroke-width", 1.5);

  // Y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y)
      .tickValues(yTickValues)
      .tickSize(6)
      .tickPadding(10)
    )
    .selectAll(".tick text")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("fill", "#4b5563");

  svg.select(".y-axis .domain")
    .attr("stroke", "#9ca3af")
    .attr("stroke-width", 1.5);

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -55)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("fill", "#374151")
    .text("Number of Employees");

  // X-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("fill", "#374151")
    .text("Rating Score");

  // Main chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "800")
    .style("fill", "#1f2937")
    .text(title);

  // Subtitle with statistics
  const totalEmployees = points.reduce((sum, point) => sum + point.y, 0);
  const avgRating = points.reduce((sum, point) => sum + (point.x * point.y), 0) / totalEmployees;
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#6b7280")
    .text(`Total: ${totalEmployees} employees | Average: ${avgRating.toFixed(1)} | Unique ratings: ${points.length}`);

  // Draw area under line
  const area = d3.area()
    .x(d => x(d.x))
    .y0(height)
    .y1(d => y(d.y))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(points)
    .attr("class", "area")
    .attr("fill", color)
    .attr("fill-opacity", 0.08)
    .attr("d", area);

  // Draw line
  const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(points)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round")
    .attr("d", line);

  // Draw points - ONE PER UNIQUE RATING
  const dotsGroup = svg.append("g")
    .attr("class", "data-points");

  points.forEach(point => {
    const pointGroup = dotsGroup.append("g")
      .attr("class", "data-point")
      .attr("transform", `translate(${x(point.x)},${y(point.y)})`)
      .style("cursor", "pointer");

    // Create tooltip group (hidden by default)
    const tooltipGroup = pointGroup.append("g")
      .attr("class", "tooltip")
      .attr("transform", "translate(0, -45)")
      .style("opacity", 0)
      .style("pointer-events", "none");

    // Tooltip background
    tooltipGroup.append("rect")
      .attr("width", 140)
      .attr("height", 50)
      .attr("x", -70)
      .attr("y", -50)
      .attr("rx", 8)
      .attr("fill", "white")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("filter", "drop-shadow(0 4px 12px rgba(0,0,0,0.1))");

    // Tooltip arrow
    tooltipGroup.append("path")
      .attr("d", "M-10,-5 L0,5 L10,-5 Z")
      .attr("fill", "white")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    // Tooltip content
    const tooltipContent = tooltipGroup.append("g")
      .attr("transform", "translate(0, -25)");

    // Rating value
    tooltipContent.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -10)
      .style("font-size", "16px")
      .style("font-weight", "700")
      .style("fill", "#1f2937")
      .text(`Rating: ${point.x.toFixed(1)}`);

    // Employee count
    tooltipContent.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 10)
      .style("font-size", "14px")
      .style("fill", "#6b7280")
      .text(`${point.y} employee${point.y !== 1 ? 's' : ''}`);

    // Percentage of total
    const percentage = ((point.y / totalEmployees) * 100).toFixed(1);
    tooltipContent.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 25)
      .style("font-size", "12px")
      .style("fill", "#9ca3af")
      .text(`${percentage}% of total`);

    // Glow effect circle
    pointGroup.append("circle")
      .attr("class", "point-glow")
      .attr("r", 12)
      .attr("fill", color)
      .attr("fill-opacity", 0.15);

    // Main point circle
    pointGroup.append("circle")
      .attr("class", "point-core")
      .attr("r", 7)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 3);

    // Count label above point
    pointGroup.append("text")
      .attr("class", "point-label")
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "700")
      .style("fill", color)
      .style("opacity", 0)
      .text(point.y);

    // Hover interactions
    pointGroup.on("mouseover", function() {
      const group = d3.select(this);
      
      // Enlarge point
      group.select(".point-glow")
        .transition()
        .duration(150)
        .attr("r", 16);
        
      group.select(".point-core")
        .transition()
        .duration(150)
        .attr("r", 9)
        .attr("stroke-width", 4);
        
      group.select(".point-label")
        .transition()
        .duration(150)
        .style("opacity", 1);

      // Show tooltip at the point
      group.select(".tooltip")
        .transition()
        .duration(150)
        .style("opacity", 1);
    })
    .on("mouseout", function() {
      const group = d3.select(this);
      
      // Restore point size
      group.select(".point-glow")
        .transition()
        .duration(150)
        .attr("r", 12);
        
      group.select(".point-core")
        .transition()
        .duration(150)
        .attr("r", 7)
        .attr("stroke-width", 3);
        
      group.select(".point-label")
        .transition()
        .duration(150)
        .style("opacity", 0);

      // Hide tooltip
      group.select(".tooltip")
        .transition()
        .duration(150)
        .style("opacity", 0);
    });
  });

  // Add legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(10, -60)`);

  legend.append("rect")
    .attr("width", 16)
    .attr("height", 16)
    .attr("rx", 4)
    .attr("fill", color)
    .attr("opacity", 0.8);

  legend.append("text")
    .attr("x", 22)
    .attr("y", 12)
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("fill", "#374151")
    .text(`Each point shows total employees at that rating`);

  // Animate line drawing
  const linePath = svg.select(".line");
  const lineLength = linePath.node().getTotalLength();
  
  linePath
    .attr("stroke-dasharray", lineLength)
    .attr("stroke-dashoffset", lineLength)
    .transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);
}

// Add CSS styles

  let domReady = false;

  onMount(() => {
    domReady = true;
  });

  $: if (domReady && !document.getElementById('chart-styles')) {
    const style = document.createElement('style');
    style.id = 'chart-styles';
    style.textContent = `
      .chart-svg {
        display: block;
        margin: 0 auto;
        overflow: visible;
      }
      
      .data-point {
        transition: transform 0.15s ease;
      }
      
      .point-label {
        transition: opacity 0.15s ease;
      }
      
      .tooltip {
        transition: opacity 0.15s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // Department-wise summary logic (copied from Corporate_PMS_Report_Department_Wise.svelte)
  // Only declare expandedDepartments and expandedEmployees here
  let expandedDepartments = new Set();
  let expandedEmployees = new Set();

  // Filter state for UI
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

  // Calculate overall summary
  function calculateOverallSummary(Table_Data) {
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
  function calculateDepartmentSummary(Table_Data) {
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
  }

  // Toggle department expansion
  function toggleDepartment(dept) {
    expandedDepartments = new Set(expandedDepartments); // Create a new Set to trigger reactivity
    if (expandedDepartments.has(dept)) {
      expandedDepartments.delete(dept);
    } else {
      expandedDepartments.add(dept);
    }
  }

  // Toggle employee expansion (not used in current UI, but included for completeness)
  function toggleEmployee(empId) {
    expandedEmployees = new Set(expandedEmployees);
    if (expandedEmployees.has(empId)) {
      expandedEmployees.delete(empId);
    } else {
      expandedEmployees.add(empId);
    }
  }
</script>

<!-- UI Layout -->
<div class=" bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
  <div class="max-w-7xl mx-auto">

    <!-- Page Title -->
    <div class="text-center mb-4">
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Corporate PMS Report</h1>
    </div>

    <!-- FILTERS CARD -->
    <div class="bg-white rounded-2xl shadow-lg p-4 mb-10 border border-gray-200">
      <form on:submit|preventDefault={onSubmit}>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- LEFT -->
          <div class="space-y-4">

            <!-- YEAR -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-800" for="Year">Year</label>
              <select id="Year" name="Year" class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Financial Year: 2025-2026">Financial Year: 2025-2026</option>
              </select>
            </div>

            <!-- TENURE -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-800" for="Tenure">Tenure</label>
              <select id="Tenure" name="Tenure" on:change={handleTenureChange}
                class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500">
                <option value="All">All</option>
                <option value="Less than 1 Year">Less than 1 Year</option>
                <option value="1 to 3 Years">1 to 3 Years</option>
                <option value="More than 3 Years">More than 3 Years</option>
              </select>
            </div>

          </div>

          <!-- RIGHT -->
          <div class="space-y-4">

            <!-- DEPARTMENT -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-800" for="Department">Department</label>
              <select id="Department" name="Department" on:change={handleDepartmentChange}
                class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500">
                <option value="All">All</option>
                {#each Departments as department}
                  <option value={department}>{department}</option>
                {/each}
              </select>
            </div>

            <!-- EMPLOYEE -->
            <!-- <div>
              <label class="block mb-1 text-sm font-medium text-gray-800" for="Employee">Employee</label>
              <select id="Employee" name="Employee" on:change={handleEmployeeChange}
                class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500">

                <option value="All">All</option>
                {#each Object.entries(Employees) as [employee_self_id, employee_data]}
                  {#if 
                    (Selected_Department === 'All' || Selected_Department === employee_data.Department) &&
                    (Selected_Tenure === 'All' ||
                    (Selected_Tenure === '<1' && employee_data.Tenure_Value < 1) ||
                    (Selected_Tenure === '1-3' && employee_data.Tenure_Value >= 1 && employee_data.Tenure_Value <= 3) ||
                    (Selected_Tenure === '>3' && employee_data.Tenure_Value > 3))
                  }
                    <option value={employee_self_id}>
                      {employee_data.Employee_Tag} — {employee_data.Department}
                    </option>
                  {/if}
                {/each}
              </select>
            </div> -->

          </div>

        </div>

        <!-- SEARCH BUTTON -->
        <div class="flex justify-end mt-4">
          <button 
            class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">
            Search
          </button>
        </div>

      </form>
    </div>

    <!-- TABS -->
    <!-- TABS ABOVE CHART CARD -->
    <div class="flex gap-2 ml-4 mb-0 mt-2 justify-start">
      <button 
        on:click={() => { activeTab = 'self'; drawCharts(); }}
        class={`px-6 py-2 rounded-t-lg font-semibold transition-all border-b-4 
          ${activeTab==='self' 
            ? 'border-blue-600 bg-white text-blue-700 shadow' 
            : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'}`
        }>
        Self
      </button>
      <button 
        on:click={() => { activeTab = 'manager'; drawCharts(); }}
        class={`px-6 py-2 rounded-t-lg font-semibold transition-all border-b-4
          ${activeTab==='manager' 
            ? 'border-blue-600 bg-white text-blue-700 shadow' 
            : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'}`
        }>
        Manager
      </button>
      <button 
        on:click={() => { activeTab = 'final'; drawCharts(); }}
        class={`px-6 py-2 rounded-t-lg font-semibold transition-all border-b-4
          ${activeTab==='final' 
            ? 'border-blue-600 bg-white text-blue-700 shadow' 
            : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'}`
        }>
        Final
      </button>
    </div>

    <div class="bg-white shadow-xl rounded-2xl border border-gray-200">
      <div class="p-6">
        <div id="singleChart" class="chart-container"></div>
      </div>
    </div>
    
    <!-- Department Summary -->
    <div>
      <div class="bg-white rounded-2xl shadow-md p-8 border border-gray-200">

        <h2 class="text-xl font-semibold mb-6 text-gray-800">Department-wise Summary</h2>

        <div class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full text-sm">
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
                      {expandedDepartments.has(dept) ? "−" : "+"}
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
</div>

<style>
  .chart-container {
    overflow-x: auto;
    padding-bottom: 10px;
  }
</style>
