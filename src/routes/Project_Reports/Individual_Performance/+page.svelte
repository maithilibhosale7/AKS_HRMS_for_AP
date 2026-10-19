<!-------JS FUNCTIONS START------->
<script>

	//
	// Importing Libraries
	//
	import Input from '$lib/elements/Input.svelte';
	import Textarea from "$lib/elements/Textarea.svelte"; 
	import { clickOutside } from '$lib/ioevents/click';
	import { exportTableToXlsx } from '$lib/Excel_xlsx';

	//
	// UI Components
	//
	import LinkedSelectionPopUp_Reports from '$lib/Linked_Selection_Pop_Up/LinkedSelectionPopUp_Reports.svelte';
	
	export let dataval_result = {};
	let leftOffsets = {};

	//
	// Excel Export Function
	//
	async function exportxlxs(a,b) {
    	await exportTableToXlsx(a,b);
    }

	let Dynamic_Filter_Conditions = {
		"Zone" : "",
		"Region" : "",
		"Branch" : ""
	};

	let Update_Dynamic_Filter_Conditions_Table_Name = "";

	async function Update_Dynamic_Filter_Conditions(Data_Table_Name) {

		// Show Loader Icon
		let element_loader = document.getElementById("loader_block");
		element_loader.classList.remove("hidden");

		if (Data_Table_Name != "Channels") {
			let Current_Zone_ID = document.getElementById('Zone_ID').value;
			let Current_Region_ID = document.getElementById('Region_ID').value;
			
			let Updated_Dynamic_Filter_Conditions = await fetch(API_PATHS.API_URL_Update_Filter_Conditions, {
				method: 'POST',
				body: JSON.stringify({
					"Data_Table_Name" : Data_Table_Name,
					"Dynamic_Filter_Conditions" : Dynamic_Filter_Conditions,
					"Current_Zone_ID" : Current_Zone_ID,
					"Current_Region_ID" : Current_Region_ID
				})
			});

			Updated_Dynamic_Filter_Conditions  = await Updated_Dynamic_Filter_Conditions.json();

			Dynamic_Filter_Conditions = Updated_Dynamic_Filter_Conditions['Dynamic_Filter_Conditions'];

			console.log("Dynamic_Filter_Conditions: ", Updated_Dynamic_Filter_Conditions);
		} else {
			let Current_Channel = document.getElementById('Channels').value;
			console.log("Current_Channel: ", Current_Channel);

			if (Current_Channel == "E Commerce") {
				Dynamic_Filter_Conditions["Zone"] = " Zone_ID = '5' "; 
			} else if (Current_Channel == "GT") {
				Dynamic_Filter_Conditions["Zone"] = " Zone_ID not in (5,6) ";
			} else if (Current_Channel == "MT") {
				Dynamic_Filter_Conditions["Zone"] = " Zone_ID = '6' ";
			}

			console.log("Dynamic_Filter_Conditions: ", Dynamic_Filter_Conditions);
		}

		// Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");

	}

	$: if (isModalOpen == false) {
		if (Update_Dynamic_Filter_Conditions_Table_Name == "Zone" || Update_Dynamic_Filter_Conditions_Table_Name == "Region") {
			Update_Dynamic_Filter_Conditions(Update_Dynamic_Filter_Conditions_Table_Name);
		}
	}

	//
	// Linked Selection Pop Up
	//
	let isModalOpen = false; // Variable to manage Pop Up visibility
	let selection_type;
	let LS_Key;
	let LS_Data_Table_Name; // Variable to hold Data Table Name
	let filteredData; // Variable to hold Table Data
	let LS_Display_Scenario_ID = '';

	// Linked Selection / Open Pop Up Code / START openModal('Employee_Self','','single','Employee_Self_ID','M2_Display_1')
	async function OpenLinkedSelectionPopUp(Data_Table_Name, Filter_Condition, Selection_Type, Linked_Field_ID, Display_Settings_ID, Display_Scenario_ID) {

		// Show Loader Icon
		let element_loader = document.getElementById("loader_block");
		element_loader.classList.remove("hidden");

		LS_Data_Table_Name = Data_Table_Name;
		selection_type = Selection_Type;
		LS_Key = Linked_Field_ID;
		LS_Display_Scenario_ID = Display_Scenario_ID;

		// API Call for Linked Selection Pop Up Table Data
		let Linked_Table_Data_res = await fetch(API_PATHS.API_URL_Get_Linked_Selection_Table_Data_Reports, {
			method: 'POST',
			body: JSON.stringify({
				"Table_Name":LS_Data_Table_Name, 
				"Filter_Condition":Dynamic_Filter_Conditions[Data_Table_Name], 
				"Display_Scenario":Display_Settings_ID
			})
		});

		Linked_Table_Data_res  = await Linked_Table_Data_res.json();

		// Load Data into Pop Up Variables
		filteredData = Linked_Table_Data_res['Table_Data_Display'];

		isModalOpen = true;

		// LS Config Data
		let ls_pop_up_config_data = {
			"isModalOpen":isModalOpen,
			"selection_type":selection_type,
			"LS_Key":LS_Key,
			"LS_Data_Table_Name":LS_Data_Table_Name,
			"Display_Scenario_ID":LS_Display_Scenario_ID,
			"filteredData":filteredData,
			"filteredData dataype": typeof filteredData,
		};
		console.log("LS POP UP Config Data / START: ", ls_pop_up_config_data);

		// Hide Loader Icon
		element_loader = document.getElementById("loader_block");
		element_loader.classList.add("hidden");

		Update_Dynamic_Filter_Conditions_Table_Name = LS_Data_Table_Name;
		console.log("Update_Dynamic_Filter_Conditions_Table_Name: ", Update_Dynamic_Filter_Conditions_Table_Name);
	}
	// Linked Selection / Open Pop Up Code / END

	//
    // Importing API Paths
	//
	import { API_PATHS } from '$lib/API_PATHS'

	let salesData = []; // fetched from API

	function applyIndividualPerformanceData(resetSelection = true) {
		salesData = Array.isArray(dataval_result?.Table_Data) ? dataval_result.Table_Data : [];

		if (!salesData.length) {
			Available_Sales_Person_Dataset = {};
			Line_Graph_Dataset = {};
			if (resetSelection) {
				selectedKeys = [];
			}
			drawGraph();
			return;
		}

		processSalesData();

		console.log("Available_Sales_Person_Dataset: ", Available_Sales_Person_Dataset);
		console.log("Line_Graph_Dataset: ", Line_Graph_Dataset);

		if (resetSelection) {
			selectedKeys = Object.keys(Available_Sales_Person_Dataset);
		}

		drawGraph();
	}

	async function loadReportData() {
		const all_data = JSON.stringify({
			Zone_ID : document.getElementById('Zone_ID').value,
			Region_ID : document.getElementById('Region_ID').value,
			HQ_ID : document.getElementById('HQ_ID').value,
			Branch_ID : document.getElementById('Branch_ID').value,
			Level_ID : document.getElementById('Position_ID').value,
			Brand_ID : document.getElementById('Brand_ID').value,
			Threshold : document.getElementById('Threshold').value,
			Tenure : document.getElementById('Tenure').value,
			Year : document.getElementById('Year').value
		});

		const res = await fetch(API_PATHS.API_URL_Report_Code_Gen+'Secondary_Sales_PMS_Report', {	
			method: 'POST',
			body: all_data
		});
		
		dataval_result = await res.json();
		console.log(dataval_result);

		applyIndividualPerformanceData(true);
	}

	async function onSubmit (e) {
		let element_loader = document.getElementById("loader_block");
		element_loader.classList.remove("hidden");

		await loadReportData();

		let element_loader1 = document.getElementById("loader_block");
		element_loader1.classList.add("hidden");
	}

	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';

	let Available_Sales_Person_Dataset = {};
	let Line_Graph_Dataset = {};
	let selectedKeys = [];
	let showFilterControls = true;
	
	let hasMounted = false;

	function sanitizeForClassName(value) {
		return String(value).replace(/[^a-zA-Z0-9_-]/g, '-');
	}

	function formatMetricLabel(metric) {
		const labels = {
			Percentage_Achievement: 'Current % Achievement',
			Percentage_Cumulative_Achievement: 'Current Cumulative %',
			Last_Year_Percentage_Achievement: 'Last Year % Achievement',
			Last_Year_Cumulative_Percentage_Achievement: 'Last Year Cumulative %'
		};

		return labels[metric] || metric.replace(/_/g, ' ');
	}

	function generateKey(standard) {
	  let parts = [standard.Employee_Code, standard.Sales_Person];
	  if (standard.Region !== 'Total') parts.push(standard.Region);
	  if (standard.Branch !== 'Total') parts.push(standard.Branch);
	  if (standard.Brand !== 'Total') parts.push(standard.Brand);
	  return parts.join(' | ');
	}
  
	function processSalesData() {
		Available_Sales_Person_Dataset = {};
		Line_Graph_Dataset = {};
	
		salesData.forEach((entry) => {
			const key = generateKey(entry.Standard);
			Available_Sales_Person_Dataset[key] = entry.Standard;
	
			const periodData = entry.Period_Data;
	
			const pa = {};
			const pca = {};
			const lypa = {};
			const lycpa = {};
	
			Object.keys(periodData).forEach((jc) => {
			const data = periodData[jc];
			pa[jc] = data.Percentage_Achievement;
			pca[jc] = data.Percentage_Cumulative_Achievement;
			lypa[jc] = data.Last_Year_Percentage_Achievement;
			lycpa[jc] = data.Last_Year_Cumulative_Percentage_Achievement;
			});
	
			Line_Graph_Dataset[key] = {
			Percentage_Achievement: pa,
			Percentage_Cumulative_Achievement: pca,
			Last_Year_Percentage_Achievement: lypa,
			Last_Year_Cumulative_Percentage_Achievement: lycpa
			};
		});
	}

function drawGraph() {
    const chartContainer = document.getElementById('chart');
    d3.select('#chart').selectAll('*').remove();

    const margin = { top: 18, right: 24, bottom: 44, left: 52 };
    const containerWidth = chartContainer?.parentElement?.clientWidth || chartContainer?.clientWidth || 1000;
    const containerHeight = chartContainer?.parentElement?.clientHeight || chartContainer?.clientHeight || 560;
    const width = Math.max(containerWidth - margin.left - margin.right - 8, 600);
    const height = Math.max(containerHeight - margin.top - margin.bottom - 8, 440);

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('class', 'w-full h-full')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xLabels = Array.from({ length: 13 }, (_, i) => `JC${i + 1}`);
    const xScale = d3.scalePoint().domain(xLabels).range([0, width]);

    const allValues = [];
    selectedKeys.forEach((key) => {
        const data = Line_Graph_Dataset[key];
        if (!data) return;
        Object.values(data).forEach(obj =>
            Object.values(obj).forEach(v => {
                if (!isNaN(v) && v !== 'SKIP' && v !== '') allValues.push(+v);
            })
        );
    });

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(allValues) || 100])
        .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g').attr('transform', `translate(0,${height})`).call(xAxis);
    svg.append('g').call(yAxis);

    const line = d3
        .line()
        .x((d) => xScale(d.jc))
        .y((d) => yScale(d.value));

    // High contrast color palette
    const colors = [
        '#E63946', '#1D3557', '#2A9D8F', '#F4A261', '#9B5DE5',
        '#06D6A0', '#EF476F', '#118AB2', '#FFD166', '#073B4C'
    ];

    const lineTypes = {
        Percentage_Achievement: 'solid',
        Percentage_Cumulative_Achievement: 'dash-dot',
        Last_Year_Percentage_Achievement: 'dotted',
        Last_Year_Cumulative_Percentage_Achievement: 'dashed',
    };

    const lineStyleToDashArray = {
        solid: '0',
        dashed: '12,6',
        dotted: '3,5',
        'dash-dot': '12,4,3,4'
    };

    let colorIdx = 0;
    const lineElements = []; // Store info for toggles

    selectedKeys.forEach((key) => {
        const dataObj = Line_Graph_Dataset[key];
        if (!dataObj) return;

        const baseColor = colors[colorIdx++ % colors.length];

        Object.keys(dataObj).forEach((metric) => {
            const values = Object.entries(dataObj[metric])
                .filter(([_, value]) => value !== 'SKIP' && value !== '' && !isNaN(value) && +value > 0)
                .map(([jc, value]) => ({ jc, value: +value }));

            if (values.length === 0) return;

            const dashArray = lineStyleToDashArray[lineTypes[metric]] || '0';
            const strokeWidth = metric === 'Percentage_Achievement' ? 3.5 : 2.8;
            // Create a unique safe class for this line group
            const groupClass = `line-group-${sanitizeForClassName(key)}-${sanitizeForClassName(metric)}`;

            // Draw path
            svg.append('path')
                .datum(values)
                .attr('class', `graph-line ${groupClass}`)
                .attr('fill', 'none')
                .attr('stroke', baseColor)
                .attr('stroke-width', strokeWidth)
                .attr('opacity', 1)
                .attr('stroke-dasharray', dashArray)
                .attr('d', line);

            // Draw circles
            svg.selectAll(null)
                .data(values)
                .enter()
                .append('circle')
                .attr('class', `graph-circle ${groupClass}`)
                .attr('cx', d => xScale(d.jc))
                .attr('cy', d => yScale(d.value))
                .attr('r', 5)
                .attr('fill', baseColor)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.5)
                .attr('opacity', 1);

            // Store for toggle panel
            lineElements.push({
                key: key,
                metric: metric,
                class: groupClass,
                color: baseColor
            });
        });
    });

    // Grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
        .selectAll('line')
        .attr('stroke', '#d0d0d0')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1);
    svg.selectAll('.grid path').style('display', 'none');

    // ----- Line Style Legend (unchanged) -----
    d3.select('#line-style-legend').selectAll('*').remove();
    const lineLegendStyles = [
        { label: 'Current % Achievement', style: 'solid' },
        { label: 'Current Cumulative %', style: 'dash-dot' },
        { label: 'Last Year % Achievement', style: 'dotted' },
        { label: 'Last Year Cumulative %', style: 'dashed' }
    ];
    const dashMap = {
        solid: '0',
        dashed: '12,6',
        dotted: '3,5',
        'dash-dot': '12,4,3,4'
    };
    const lineLegendContainer = d3.select('#line-style-legend')
        .append('div')
        .attr('class', 'flex flex-col space-y-2');
    for (let i = 0; i < lineLegendStyles.length; i += 2) {
        const row = lineLegendContainer.append('div').attr('class', 'flex space-x-4');
        [lineLegendStyles[i], lineLegendStyles[i + 1]].forEach(item => {
            if (item) {
                const legendItem = row.append('div').attr('class', 'flex items-center space-x-2');
                legendItem.append('svg')
                    .attr('width', 40)
                    .attr('height', 10)
                    .append('line')
                    .attr('x1', 0)
                    .attr('y1', 5)
                    .attr('x2', 40)
                    .attr('y2', 5)
                    .attr('stroke', '#333333')
                    .attr('stroke-width', 2.5)
                    .attr('stroke-dasharray', dashMap[item.style]);
                legendItem.append('span').text(item.label).style('font-size', '13px').style('font-weight', '500');
            }
        });
    }

    // ----- Color Legend (unchanged) -----
    // d3.select('#color-legend').selectAll('*').remove();
    // if (selectedKeys.length > 0) {
    //     const colorLegendContainer = d3.select('#color-legend')
    //         .append('div')
    //         .attr('class', 'flex flex-wrap gap-4 mt-4');
    //     selectedKeys.forEach((key, idx) => {
    //         const legendItem = colorLegendContainer.append('div').attr('class', 'flex items-center space-x-2').style('margin-bottom', '8px');
    //         legendItem.append('div')
    //             .attr('class', 'w-5 h-5 rounded-full')
    //             .style('background-color', colors[idx % colors.length])
    //             .style('border', '1px solid #ddd');
    //         legendItem.append('span').text(key).attr('class', 'text-sm text-gray-800').style('font-weight', '500');
    //     });
    // }

    // ----- Show/Hide Toggles Panel -----
    const toggleContainer = d3.select('#line-toggles');
    toggleContainer.html('');

    if (lineElements.length > 0) {
        toggleContainer.append('div')
            .attr('class', 'mb-2 text-sm font-semibold text-gray-800')
            .text('Show / Hide Particular Graph Lines');

        const toggleGroup = toggleContainer.append('div').attr('class', 'flex flex-wrap gap-3');

        lineElements.forEach(line => {
            const metricLabel = formatMetricLabel(line.metric);
            const label = `${line.key} — ${metricLabel}`;
            const itemId = `toggle-${line.class}`;

            const div = toggleGroup
                .append('label')
                .attr('for', itemId)
                .attr('class', 'flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm cursor-pointer');

            div.append('input')
                .attr('type', 'checkbox')
                .attr('id', itemId)
                .property('checked', true)
                .on('change', function() {
                    const isChecked = d3.select(this).property('checked');
                    d3.selectAll(`.${line.class}`).style('display', isChecked ? null : 'none');
                });

            div.append('span')
                .attr('class', 'inline-block h-3 w-3 rounded-full border border-gray-300')
                .style('background-color', line.color);

            div.append('span').text(label);
        });
    }
}

	function toggleSelectAll() {
		if (selectedKeys.length === Object.keys(Available_Sales_Person_Dataset).length) {
			selectedKeys = [];
		} else {
			selectedKeys = Object.keys(Available_Sales_Person_Dataset);
		}
	}

	onMount(async () => {
		hasMounted = true;
		await loadReportData();
	});

	afterUpdate(() => {
		if (hasMounted) {
			drawGraph();
		}
	});
</script>
  

{#if isModalOpen}
	<LinkedSelectionPopUp_Reports 
		bind:isModalOpen
		bind:LS_Key
		bind:LS_Data_Table_Name
		bind:selection_type
		bind:filteredData
		bind:LS_Display_Scenario_ID
	/>
{/if}

<!-------BROWSER TAB TITLE START------->
 <svelte:head>
	<title>Individual Performance | Project</title>
 </svelte:head>
<!-------BROWSER TAB TITLE END------->


<!-------LOADER ICON START------->
<div class="relative w-full h-full hidden" id="loader_block">  
	<div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 ">
		<img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse" />
	</div>
</div>
<!-------LOADER ICON END------->



<!-------PAGE TITLE START------->
<div class="flex items-center justify-between mt-2 xl:my-4">
    <h2 id="ReportTitle" class="text-xl font-semibold leading-7 text-gray-900 mb-4 sm:truncate sm:text-2xl sm:tracking-tight lg:mb-0">
        Individual Performance
    </h2>
	<button on:click={() => exportxlxs('Individual_Performance_Report', dataval_result.Table_Data)} type="submit" class="inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">
		Export
	</button>
</div>
<!-------PAGE TITLE END------->


<!-------REPORT START------->
<div class="w-full block companysetup_tabs">
	<div class="tab-content bg-white p-3 border border-gray-300 rounded-xl" id="tabs-tabContent">
		<div class="tab-pane fade show active" id="tabs-companyinfo" role="tabpanel" aria-labelledby="tabs-companyinfo-tab">
			
			<!-------REPORT FILTERS START------->
			<div class="flex flex-col">
				<div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
						<div class="overflow-x-auto">
							<form on:submit|preventDefault={onSubmit}>
								{#if showFilterControls}
								<div class="flex flex-wrap items-start">

									<!-------REPORT FILTER LEFT SIDE START------->
                                    <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/3 xl:flex-none">

										<!-------REPORT FILTER: YEAR START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">									
												<label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Year</label>
											</div>
											<div class="md:w-2/3">  
												<select name="Year" id="Year" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">
													<option value="2024">2024</option>
													<option value="2025">2025</option>
												</select>
											</div>
										</div>									 
										<!-------REPORT FILTER: YEAR END------->

										<!-------REPORT FILTER: ZONE START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">
												<button type="button" on:click={() => OpenLinkedSelectionPopUp('Zone','','multiple','Zone_ID','M3_A_Display_1','M3_A_Display_2')} class="z-50 rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													Zone
												</button>
											</div>
											<div class="md:w-2/3">
												<input type="text" id="Zone_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/>
												<input type="hidden" id="Zone_ID" value="All"/>
											</div>
										</div>
										<!-------REPORT FILTER: ZONE END------->

										<!-------REPORT FILTER: Position START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">	
												<button type="button"  on:click={() => OpenLinkedSelectionPopUp('Position','','multiple','Position_ID','M2_Display_1','M2_Display_1')} class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													Position
												</button>								
												<!-- <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Level</label> -->
											</div>
											<div class="md:w-2/3">
												<div id="Position_ID_div" class="">
													<input 
														type="text" 
														id="Position_ID_Display" 
														value="All"
														class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500" 
													/>
													<input 
														type="hidden" 
														id="Position_ID" 
														value="All"
													/>	
												</div>
											</div>
										</div>		
										<!-------REPORT FILTER: Position END------->

										<!-------REPORT FILTER: Distributor START------->
										<!-- <div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">
												<button type="button"  on:click={() => OpenLinkedSelectionPopUp('Distributor','','multiple','Distributor_ID','M9_Display_1','M9_Display_2')} class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													Distributor
												</button>									 -->
												<!-- <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Distributor</label> -->
											<!-- </div>
											<div class="md:w-2/3">
												<div id="Distributor_ID_div" class="">
													<input 
														type="text" 
														id="Distributor_ID_Display" 
														value="All"
														class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
													/>
													<input 
														type="hidden" 
														id="Distributor_ID" 
														value="All"
													/>	
												</div>
											</div>
										</div> -->
										<!-------REPORT FILTER: Distributor END------->

									</div>
									<!-------REPORT FILTER LEFT SIDE END------->

									<!-------REPORT FILTER MIDDLE SIDE END------->									
									<div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/3 xl:flex-none">

										<!-------REPORT FILTER: CHANNELS START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">									
												<label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Channels</label>
											</div>
											<div class="md:w-2/3">  
												<select 
													name="Channels" 
													id="Channels" 
													on:blur={() => Update_Dynamic_Filter_Conditions("Channels")}
													class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
												>
													<option value="All">All</option>
													<option value="E commerce">E commerce</option>
													<option value="MT">MT</option>
													<option value="GT">GT</option>
													<!-- <option value="D2C">D2C</option> -->
												</select>
											</div>
										</div>
										<!-------REPORT FILTER: CHANNELS END------->

										<!-------REPORT FILTER: REGION START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">
												<button type="button"  on:click={() => OpenLinkedSelectionPopUp('Region','','multiple','Region_ID','M3_Display_1','M3_Display_2')} class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													Region
												</button>									
												<!-- <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Region</label> -->
											</div>
											<div class="md:w-2/3">
												<div id="Region_ID_div" class="">
													<input 
														type="text" 
														id="Region_ID_Display" 
														value="All"
														class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
													/>
													<input 
														type="hidden" 
														id="Region_ID" 
														value="All"
													/>	
												</div>
											</div>
										</div>
										<!-------REPORT FILTER: REGION END------->

										<!-------REPORT FILTER: HQ START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">
												<button type="button" on:click={() => OpenLinkedSelectionPopUp('HQ','','multiple','HQ_ID','M3_C_Display_1','M3_C_Display_2')} class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													HQ
												</button>
											</div>
											<div class="md:w-2/3">
												<input type="text" id="HQ_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/>
												<input type="hidden" id="HQ_ID" value="All"/>
											</div>
										</div>
										<!-------REPORT FILTER: HQ START------->

										<!-------REPORT FILTER: BRAND START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">
												<button type="button"  on:click={() => OpenLinkedSelectionPopUp('Brand','','multiple','Brand_ID','M6_Display_1','M6_Display_2')} class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													Brand
												</button>									
												<!-- <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Brand</label> -->
											</div>
											<div class="md:w-2/3">
												<div id="Brand_ID_div" class="">
													<input 
														type="text" 
														id="Brand_ID_Display" 
														value="All"
														class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
													/>
													<input 
														type="hidden" 
														id="Brand_ID" 
														value="All"
													/>	
												</div>
											</div>
										</div>
										<!-------REPORT FILTER: BRAND END------->

									</div>
									<!-------REPORT FILTER MIDDLE SIDE END------->

									<!-------REPORT FILTER RIGHT SIDE END------->
									<div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/3 xl:flex-none">

										<!-------REPORT FILTER: Contribution START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">									
												<label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Contribution</label>
											</div>
											<div class="md:w-2/3">  
												<select name="Contribution" id="Contribution" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">
													<option value="Total">Total</option>
													<option value="Self">Self</option>
													<option value="Distributed">Distributor</option>
												</select>
											</div>
										</div>									 
										<!-------REPORT FILTER: Contribution END------->

										<!-------REPORT FILTER: BRANCH START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">	
												<button type="button"  on:click={() => OpenLinkedSelectionPopUp('Branch','','multiple','Branch_ID','M4_Display_1','M4_Display_2')} class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2"> 
													Branch / Town
												</button>								
												<!-- <label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Branch</label> -->
											</div>
											<div class="md:w-2/3">
												<div id="Branch_ID_div" class="">
													<input 
														type="text" 
														id="Branch_ID_Display" 
														value="All"
														class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
													/>
													<input 
														type="hidden" 
														id="Branch_ID" 
														value="All"
													/>	
												</div>
											</div>
										</div>
										<!-------REPORT FILTER: BRANCH END------->

										<!-------REPORT FILTER: TENURE START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">									
												<label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Tenure</label>
											</div>
											<div class="md:w-2/3">  
												<select name="Tenure" id="Tenure" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">
													<option value="All">All</option>
													<option value="Less than 1 Year">Less than 1 Year</option>
													<option value="1 to 3 Years">1 to 3 Years</option>
													<option value="More than 3 Years">More than 3 Years</option>
												</select>
											</div>
										</div>
										<!-------REPORT FILTER: TENURE END------->

										<!-------REPORT FILTER: THRESHOLD START------->
										<div class="md:flex md:items-center mb-3">
											<div class="md:w-1/3">									
												<label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Threshold</label>
											</div>
											<div class="md:w-2/3">
												<div id="Threshold_div" class="">
													<input 
														type="number" 
														id="Threshold"
														value="95"
														min="0"
														max="100" 
														class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"
													/>
												</div>
											</div>
										</div>	
										<!-------REPORT FILTER: THRESHOLD END------->
										
									</div>
									<!-------REPORT FILTER RIGHT SIDE END------->

								</div>

	                            <!-------REPORT FILTER: SEARCH BUTTON START------->
								{/if}

								<div class="mt-2 flex w-full flex-wrap items-center justify-between gap-3 px-3 text-center">    
									<button
										type="button"
										on:click={() => (showFilterControls = !showFilterControls)}
										class="rounded-xl border border-gray-400 bg-white px-5 py-2.5 text-md font-medium text-slate-700 shadow-sm transition hover:border-secondarycolor-500 hover:text-secondarycolor-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondarycolor-500"
									>
										{showFilterControls ? 'Hide Filters' : 'Show Filters'}
									</button>

									<button class="rounded-lg border border-transparent bg-secondarycolor-500 px-5 py-2.5 text-md font-normal text-white shadow-xl transition hover:bg-secondarycolor-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondarycolor-500">
										Search
									</button>
								</div>
                                <!-------REPORT FILTER: SEARCH BUTTON END------->

							</form>                  
						</div>
					</div>
				</div>
			</div>
			<!-------REPORT FILTERS END------->


			<!-------REPORT TITLE START------->
			<div id="ReportInputs" class="mt-2 flex flex-wrap items-center gap-4 xl:my-3">
				
				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Year:</span> 
					{#if dataval_result.Year}
						<span class="font-regular ml-2">{dataval_result.Year}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Zone:</span> 
					{#if dataval_result.Zone}
						<span class="font-regular ml-2">{dataval_result.Zone}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Region:</span> 
					{#if dataval_result.Region}
						<span class="font-regular ml-2">{dataval_result.Region}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>
				
				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Branch:</span> 
					{#if dataval_result.Branch}
						<span class="font-regular ml-2">{dataval_result.Branch}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Level:</span> 
					{#if dataval_result.Level}
						<span class="font-regular ml-2">{dataval_result.Level}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">HQ:</span> 
					{#if dataval_result.HQ}
						<span class="font-regular ml-2">{dataval_result.HQ}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Tenure:</span> 
					{#if dataval_result.Tenure}
						<span class="font-regular ml-2">{dataval_result.Tenure}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Brand:</span> 
					{#if dataval_result.Brand}
						<span class="font-regular ml-2">{dataval_result.Brand}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>

				<div class="flex items-center text-[17px]">
					<span class="font-semibold">Threshold:</span> 
					{#if dataval_result.Threshold}
						<span class="font-regular ml-2">{dataval_result.Threshold}</span>
					{:else}
                        <span class="font-regular ml-2">ALL</span>
                    {/if}
				</div>
				
			</div>
			<!-------REPORT TITLE END------->
		</div>
	</div>
		<div>
			<!-- SALESPERSON DROPDOWN : START -->
			<div class="mt-4 space-y-4 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
				<button
					on:click={toggleSelectAll}
					class={`px-2 py-2 rounded-md font-medium transition-all ${
					selectedKeys.length === Object.keys(Available_Sales_Person_Dataset).length
						? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						: 'bg-green-600 text-white hover:bg-green-700'
					} shadow-sm`}
				>
					{selectedKeys.length === Object.keys(Available_Sales_Person_Dataset).length ? 'Deselect All' : 'Select All'}
				</button>
	
				<div class="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-2 shadow-inner">
					{#each Object.keys(Available_Sales_Person_Dataset) as key}
						<label class={`
							flex items-center space-x-2 p-2 mb-2 last:mb-0 rounded-md transition-all
							${selectedKeys.includes(key) 
							? 'bg-green-50 border-green-200' 
							: 'bg-white border-gray-200'
							}
							border hover:border-green-300 hover:shadow-sm
						`}>
							<input
								type="checkbox"
								bind:group={selectedKeys}
								value={key}
								class="h-3 w-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
							/>
							<span class={`font-medium ${
								selectedKeys.includes(key) ? 'text-green-700' : 'text-gray-700'
							}`}>
								{key}
							</span>
						</label>
					{/each}
				</div>
	
				{#if selectedKeys.length > 0}
					<div class="text-sm text-gray-500 mt-2 px-1">
						{selectedKeys.length} {selectedKeys.length === 1 ? 'person' : 'people'} selected
					</div>
				{/if}
			</div>
			<!-- SALESPERSON DROPDOWN : END -->

			

			<!-- Line Toggle Panel : START -->
			<div id="line-toggles" class="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm"></div>
			<!-- Line Toggle Panel : END -->

			<div class="relative mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm min-h-[36rem]">
				<!-- Line Legends : START -->
				<div id="line-style-legend" class="absolute right-2 top-2 z-10 flex max-w-fit flex-wrap justify-end rounded-xl border border-slate-200/40 bg-white/40 p-2.5 shadow-sm backdrop-blur-sm"></div>
				<!-- Line Legends : STOP -->
				<div id="chart" class="h-full w-full overflow-hidden"></div>
			</div>

			<!-- <div id="color-legend" class="mt-4"></div> -->
		</div>
		
		<!-- Table View for Selected Sales Data -->
		{#if selectedKeys.length > 0}
			<div class="w-full mt-4">
				<h3 class="mb-3 text-lg font-semibold text-gray-800">Selected Sales Data</h3>
				<div class="w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
					<div class="w-full max-h-[calc(100vh-100px)] overflow-auto">
						<table id="SelectedSalesData" width="100%" border="1" cellpadding="10" cellspacing="0" class="w-full min-w-[1100px] table-auto text-sm text-gray-700" style="border-collapse: collapse;">
							<thead class="sticky top-0 z-20 text-xs text-gray-900 bg-[#B7B7B7] font-semibold border-b border-gray-400">
								<tr class="border-b bg-[#B7B7B7]">
									<th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Employee Code</th>
									<th class="bg-[#B7B7B7] min-w-[200px] py-2 px-4 text-center capitalize">Sales Person</th>
									<th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">Level</th>
									<th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">DOJ</th>
									<th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Tenure</th>
									<th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">Zone</th>
									<th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Region</th>
									<th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Branch</th>
									<th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">Brand</th>
								</tr>
							</thead>
							<tbody>
								{#each selectedKeys as key}
									<tr class="border-b border-gray-200 bg-white text-slate-900 transition-colors duration-150">
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Employee_Code}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Sales_Person}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Level}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].DOJ}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Tenure}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Zone}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Region}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Branch}</td>
										<td class="py-2 px-4 text-center">{Available_Sales_Person_Dataset[key].Brand}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{:else}
			<div class="mt-6 rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-500 shadow-sm">No data available for the selected salespersons.</div>
		{/if}

</div>
			
<style>
	#chart {
	  margin-top: 0;
	}
</style>