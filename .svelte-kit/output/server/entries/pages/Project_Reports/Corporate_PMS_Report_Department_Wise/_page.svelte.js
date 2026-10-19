import { l as head, e as ensure_array_like, c as attr_class, d as clsx } from "../../../../chunks/index2.js";
import "d3";
import "exceljs";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let Table_Data = [];
    let overallSummary = {};
    let departmentSummary = {};
    let expandedDepartments = /* @__PURE__ */ new Set();
    console.log("expandedDepartments:", expandedDepartments);
    head("1xszzyy", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Department Wise Corporate PMS Report | Recon</title>`);
      });
    });
    $$renderer2.push(`<div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60"><img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse"/></div></div> `);
    if (Table_Data.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-center text-gray-500">No data available.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="p-4 bg-gray-100 min-h-screen"><div class="flex items-center justify-between mt-2 xl:my-4"><h1 class="text-xl font-bold text-gray-800 tracking-wide">Corporate PMS Report – Department Wise</h1> <button type="button" class="inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2 ml-4">Export</button></div> <div class="mb-10"><div class="bg-white rounded-2xl shadow-md p-8 border border-gray-200"><h2 class="text-xl font-semibold mb-6 text-gray-800">Overall Summary</h2> <div class="overflow-hidden rounded-xl border border-gray-200"><table id="Report_Summary" class="w-full text-sm"><thead class="bg-gray-50 text-gray-700 border-b"><tr><th class="px-4 py-3 font-medium text-left">Total Individuals</th><th class="px-4 py-3 font-medium text-left">Cumulative H1 Self</th><th class="px-4 py-3 font-medium text-left">Cumulative H1 Manager</th><th class="px-4 py-3 font-medium text-left">Cumulative H1</th><th class="px-4 py-3 font-medium text-left">Cumulative H2 Self</th><th class="px-4 py-3 font-medium text-left">Cumulative H2 Manager</th><th class="px-4 py-3 font-medium text-left">Cumulative H2</th><th class="px-4 py-3 font-medium text-left">Cumulative Final</th></tr></thead><tbody class="divide-y divide-gray-100"><tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-semibold">${escape_html(overallSummary.totalIndividuals)} <span class="text-xs text-gray-500">(Not Filled: ${escape_html(overallSummary.notFilledCount)})</span></td><td class="px-4 py-3">${escape_html(overallSummary.avgH1Self.toFixed(2))}</td><td class="px-4 py-3">${escape_html(overallSummary.avgH1Manager.toFixed(2))}</td><td class="px-4 py-3">${escape_html(overallSummary.avgH1.toFixed(2))}</td><td class="px-4 py-3">${escape_html(overallSummary.avgH2Self.toFixed(2))}</td><td class="px-4 py-3">${escape_html(overallSummary.avgH2Manager.toFixed(2))}</td><td class="px-4 py-3">${escape_html(overallSummary.avgH2.toFixed(2))}</td><td class="px-4 py-3">${escape_html(overallSummary.avgFinal.toFixed(2))}</td></tr></tbody></table></div></div></div> <div><div class="bg-white rounded-2xl shadow-md p-8 border border-gray-200"><h2 class="text-xl font-semibold mb-6 text-gray-800">Department-wise Summary</h2> <div class="mt-10 mb-4"><div class="chart-container svelte-1xszzyy" style="overflow-x: auto; overflow-y: hidden; white-space: nowrap; width: 100%;"><div id="departmentBarChart" style="display: inline-block; min-width: 800px; width: auto;"></div></div></div> <div class="overflow-hidden rounded-xl border border-gray-200"><table id="Report_Details" class="w-full text-sm"><thead class="bg-gray-50 text-gray-700 border-b"><tr><th class="px-4 py-3"></th><th class="px-4 py-3 font-medium text-left">Department</th><th class="px-4 py-3 font-medium text-left">Total</th>`);
      if (expandedDepartments.size > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<th class="px-4 py-3 font-medium text-left">Manager Details</th>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--><th class="px-4 py-3 font-medium text-left">H1 Self</th><th class="px-4 py-3 font-medium text-left">H1 Manager</th><th class="px-4 py-3 font-medium text-left">H1</th><th class="px-4 py-3 font-medium text-left">H2 Self</th><th class="px-4 py-3 font-medium text-left">H2 Manager</th><th class="px-4 py-3 font-medium text-left">H2</th><th class="px-4 py-3 font-medium text-left">Final</th></tr></thead><tbody class="divide-y divide-gray-100"><!--[-->`);
      const each_array = ensure_array_like(Object.entries(departmentSummary));
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let [dept, data] = each_array[$$index_1];
        $$renderer2.push(`<tr${attr_class(clsx(expandedDepartments.has(dept) ? "bg-blue-50 transition" : "hover:bg-gray-50 transition"))}><td class="px-4 py-3 text-center"><button class="px-3 py-1 rounded-lg transition text-sm bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white shadow-sm">${escape_html(expandedDepartments.has(dept) ? "-" : "+")}</button></td><td class="px-4 py-3 font-semibold text-gray-900">${escape_html(dept)}</td><td class="px-4 py-3 font-semibold">${escape_html(data.totalIndividuals)} <span class="text-xs text-gray-500">(Not Filled: ${escape_html(data.notFilledCount)})</span></td>`);
        if (expandedDepartments.size > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<td class="px-4 py-3"></td>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--><td class="px-4 py-3">${escape_html(data.avgH1Self.toFixed(2))}</td><td class="px-4 py-3">${escape_html(data.avgH1Manager.toFixed(2))}</td><td class="px-4 py-3">${escape_html(data.avgH1.toFixed(2))}</td><td class="px-4 py-3">${escape_html(data.avgH2Self.toFixed(2))}</td><td class="px-4 py-3">${escape_html(data.avgH2Manager.toFixed(2))}</td><td class="px-4 py-3">${escape_html(data.avgH2.toFixed(2))}</td><td class="px-4 py-3">${escape_html(data.avgFinal.toFixed(2))}</td></tr> `);
        if (expandedDepartments.has(dept)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(data.employees);
          for (let index = 0, $$length2 = each_array_1.length; index < $$length2; index++) {
            let emp = each_array_1[index];
            $$renderer2.push(`<tr class="bg-gray-50"><td class="px-4 py-3 text-gray-500">${escape_html(index + 1)}</td><td class="px-4 py-3">${escape_html(emp.Employee_Name)}</td><td class="px-4 py-3">${escape_html(emp.Employee_Code)}</td>`);
            if (expandedDepartments.size > 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<td class="px-4 py-3">${escape_html(emp.Manager_Employee_Code)} : ${escape_html(emp.Manager_Employee_Name)}</td>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--><td class="px-4 py-3">${escape_html(emp.Cumulative_H1_Self_Rating)}</td><td class="px-4 py-3">${escape_html(emp.Cumulative_H1_Manager_Rating)}</td><td class="px-4 py-3">${escape_html(emp.Cumulative_H1_Rating)}</td><td class="px-4 py-3">${escape_html(emp.Cumulative_H2_Self_Rating)}</td><td class="px-4 py-3">${escape_html(emp.Cumulative_H2_Manager_Rating)}</td><td class="px-4 py-3">${escape_html(emp.Cumulative_H2_Rating)}</td><td class="px-4 py-3">${escape_html(emp.Cumulative_Final_Rating)}</td></tr>`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
