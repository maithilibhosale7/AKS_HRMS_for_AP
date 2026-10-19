import { b as bind_props, l as head, c as attr_class, e as ensure_array_like, a as attr } from "../../../../chunks/index2.js";
import "exceljs";
import { Z as fallback } from "../../../../chunks/utils2.js";
import "d3";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let dataval_result = fallback($$props["dataval_result"], () => ({}), true);
    let Available_Sales_Person_Dataset = {};
    let selectedKeys = [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("1vgtbbl", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Individual Performance | Project</title>`);
        });
      });
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->   <div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60"><img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse"/></div></div>  <div class="flex items-center justify-between mt-2 xl:my-4"><h2 id="ReportTitle" class="text-xl font-semibold leading-7 text-gray-900 mb-4 sm:truncate sm:text-2xl sm:tracking-tight lg:mb-0">Individual Performance</h2> <button type="submit" class="inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Export</button></div>  <div class="w-full block companysetup_tabs"><div class="tab-content bg-white p-3 border border-gray-300 rounded-xl" id="tabs-tabContent"><div class="tab-pane fade show active" id="tabs-companyinfo" role="tabpanel" aria-labelledby="tabs-companyinfo-tab"><div class="flex flex-col"><div class="overflow-x-auto sm:-mx-6 lg:-mx-8"><div class="py-2 inline-block min-w-full sm:px-6 lg:px-8"><div class="overflow-x-auto"><form>`);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="flex flex-wrap items-start"><div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/3 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Year</label></div> <div class="md:w-2/3"><select name="Year" id="Year" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
        $$renderer3.option({ value: "2024" }, ($$renderer4) => {
          $$renderer4.push(`2024`);
        });
        $$renderer3.option({ value: "2025" }, ($$renderer4) => {
          $$renderer4.push(`2025`);
        });
        $$renderer3.push(`</select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><button type="button" class="z-50 rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Zone</button></div> <div class="md:w-2/3"><input type="text" id="Zone_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/> <input type="hidden" id="Zone_ID" value="All"/></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><button type="button" class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Position</button></div> <div class="md:w-2/3"><div id="Position_ID_div"><input type="text" id="Position_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/> <input type="hidden" id="Position_ID" value="All"/></div></div></div></div>  <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/3 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Channels</label></div> <div class="md:w-2/3"><select name="Channels" id="Channels" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All`);
        });
        $$renderer3.option({ value: "E commerce" }, ($$renderer4) => {
          $$renderer4.push(`E commerce`);
        });
        $$renderer3.option({ value: "MT" }, ($$renderer4) => {
          $$renderer4.push(`MT`);
        });
        $$renderer3.option({ value: "GT" }, ($$renderer4) => {
          $$renderer4.push(`GT`);
        });
        $$renderer3.push(`</select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><button type="button" class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Region</button></div> <div class="md:w-2/3"><div id="Region_ID_div"><input type="text" id="Region_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/> <input type="hidden" id="Region_ID" value="All"/></div></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><button type="button" class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">HQ</button></div> <div class="md:w-2/3"><input type="text" id="HQ_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/> <input type="hidden" id="HQ_ID" value="All"/></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><button type="button" class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Brand</button></div> <div class="md:w-2/3"><div id="Brand_ID_div"><input type="text" id="Brand_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/> <input type="hidden" id="Brand_ID" value="All"/></div></div></div></div>  <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/3 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Contribution</label></div> <div class="md:w-2/3"><select name="Contribution" id="Contribution" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
        $$renderer3.option({ value: "Total" }, ($$renderer4) => {
          $$renderer4.push(`Total`);
        });
        $$renderer3.option({ value: "Self" }, ($$renderer4) => {
          $$renderer4.push(`Self`);
        });
        $$renderer3.option({ value: "Distributed" }, ($$renderer4) => {
          $$renderer4.push(`Distributor`);
        });
        $$renderer3.push(`</select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><button type="button" class="rounded border border-transparent bg-secondarycolor-500 w-30 h-8 px-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Branch / Town</button></div> <div class="md:w-2/3"><div id="Branch_ID_div"><input type="text" id="Branch_ID_Display" value="All" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/> <input type="hidden" id="Branch_ID" value="All"/></div></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Tenure</label></div> <div class="md:w-2/3"><select name="Tenure" id="Tenure" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All`);
        });
        $$renderer3.option({ value: "Less than 1 Year" }, ($$renderer4) => {
          $$renderer4.push(`Less than 1 Year`);
        });
        $$renderer3.option({ value: "1 to 3 Years" }, ($$renderer4) => {
          $$renderer4.push(`1 to 3 Years`);
        });
        $$renderer3.option({ value: "More than 3 Years" }, ($$renderer4) => {
          $$renderer4.push(`More than 3 Years`);
        });
        $$renderer3.push(`</select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="department">Threshold</label></div> <div class="md:w-2/3"><div id="Threshold_div"><input type="number" id="Threshold" value="95" min="0" max="100" class="block w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500"/></div></div></div></div></div>`);
      }
      $$renderer3.push(`<!--]--> <div class="mt-2 flex w-full flex-wrap items-center justify-between gap-3 px-3 text-center"><button type="button" class="rounded-xl border border-gray-400 bg-white px-5 py-2.5 text-md font-medium text-slate-700 shadow-sm transition hover:border-secondarycolor-500 hover:text-secondarycolor-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondarycolor-500">${escape_html("Hide Filters")}</button> <button class="rounded-lg border border-transparent bg-secondarycolor-500 px-5 py-2.5 text-md font-normal text-white shadow-xl transition hover:bg-secondarycolor-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondarycolor-500">Search</button></div></form></div></div></div></div>  <div id="ReportInputs" class="mt-2 flex flex-wrap items-center gap-4 xl:my-3"><div class="flex items-center text-[17px]"><span class="font-semibold">Year:</span> `);
      if (dataval_result.Year) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Year)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Zone:</span> `);
      if (dataval_result.Zone) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Zone)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Region:</span> `);
      if (dataval_result.Region) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Region)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Branch:</span> `);
      if (dataval_result.Branch) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Branch)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Level:</span> `);
      if (dataval_result.Level) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Level)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">HQ:</span> `);
      if (dataval_result.HQ) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.HQ)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Tenure:</span> `);
      if (dataval_result.Tenure) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Tenure)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Brand:</span> `);
      if (dataval_result.Brand) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Brand)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Threshold:</span> `);
      if (dataval_result.Threshold) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="font-regular ml-2">${escape_html(dataval_result.Threshold)}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="font-regular ml-2">ALL</span>`);
      }
      $$renderer3.push(`<!--]--></div></div></div></div> <div><div class="mt-4 space-y-4 rounded-xl border border-gray-300 bg-white p-3 shadow-sm"><button${attr_class(`px-2 py-2 rounded-md font-medium transition-all ${selectedKeys.length === Object.keys(Available_Sales_Person_Dataset).length ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-green-600 text-white hover:bg-green-700"} shadow-sm`)}>${escape_html(selectedKeys.length === Object.keys(Available_Sales_Person_Dataset).length ? "Deselect All" : "Select All")}</button> <div class="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-2 shadow-inner"><!--[-->`);
      const each_array = ensure_array_like(Object.keys(Available_Sales_Person_Dataset));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let key = each_array[$$index];
        $$renderer3.push(`<label${attr_class(`
							flex items-center space-x-2 p-2 mb-2 last:mb-0 rounded-md transition-all
							${selectedKeys.includes(key) ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}
							border hover:border-green-300 hover:shadow-sm
						`)}><input type="checkbox"${attr("checked", selectedKeys.includes(key), true)}${attr("value", key)} class="h-3 w-3 rounded border-gray-300 text-green-600 focus:ring-green-500"/> <span${attr_class(`font-medium ${selectedKeys.includes(key) ? "text-green-700" : "text-gray-700"}`)}>${escape_html(key)}</span></label>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      if (selectedKeys.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="text-sm text-gray-500 mt-2 px-1">${escape_html(selectedKeys.length)} ${escape_html(selectedKeys.length === 1 ? "person" : "people")} selected</div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div>  <div id="line-toggles" class="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm"></div> <div class="relative mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm min-h-[36rem]"><div id="line-style-legend" class="absolute right-2 top-2 z-10 flex max-w-fit flex-wrap justify-end rounded-xl border border-slate-200/40 bg-white/40 p-2.5 shadow-sm backdrop-blur-sm"></div> <div id="chart" class="h-full w-full overflow-hidden svelte-1vgtbbl"></div></div></div> `);
      if (selectedKeys.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="w-full mt-4"><h3 class="mb-3 text-lg font-semibold text-gray-800">Selected Sales Data</h3> <div class="w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"><div class="w-full max-h-[calc(100vh-100px)] overflow-auto"><table id="SelectedSalesData" width="100%" border="1" cellpadding="10" cellspacing="0" class="w-full min-w-[1100px] table-auto text-sm text-gray-700" style="border-collapse: collapse;"><thead class="sticky top-0 z-20 text-xs text-gray-900 bg-[#B7B7B7] font-semibold border-b border-gray-400"><tr class="border-b bg-[#B7B7B7]"><th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Employee Code</th><th class="bg-[#B7B7B7] min-w-[200px] py-2 px-4 text-center capitalize">Sales Person</th><th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">Level</th><th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">DOJ</th><th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Tenure</th><th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">Zone</th><th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Region</th><th class="bg-[#B7B7B7] min-w-[120px] py-2 px-4 text-center capitalize">Branch</th><th class="bg-[#B7B7B7] min-w-[100px] py-2 px-4 text-center capitalize">Brand</th></tr></thead><tbody><!--[-->`);
        const each_array_1 = ensure_array_like(selectedKeys);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let key = each_array_1[$$index_1];
          $$renderer3.push(`<tr class="border-b border-gray-200 bg-white text-slate-900 transition-colors duration-150"><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Employee_Code)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Sales_Person)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Level)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].DOJ)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Tenure)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Zone)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Region)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Branch)}</td><td class="py-2 px-4 text-center">${escape_html(Available_Sales_Person_Dataset[key].Brand)}</td></tr>`);
        }
        $$renderer3.push(`<!--]--></tbody></table></div></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="mt-6 rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-500 shadow-sm">No data available for the selected salespersons.</div>`);
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { dataval_result });
  });
}
export {
  _page as default
};
