import { l as head, e as ensure_array_like, a as attr, b as bind_props } from "../../../../chunks/index2.js";
import "exceljs";
import { Z as fallback } from "../../../../chunks/utils2.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let dataval_result = fallback($$props["dataval_result"], () => [], true);
    let Departments = [];
    let Employees = [];
    let Selected_Employee = "All";
    let deviationValue = 0;
    function calculateDeviation(row) {
      let self = parseFloat(row.Cumulative_Self_Rating) || 0;
      let manager = parseFloat(row.Cumulative_Manager_Rating) || 0;
      if (self > 0 && manager > 0) {
        return Math.abs(self - manager);
      } else {
        return 0;
      }
    }
    head("1o4puy1", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Deviation Report | Recon</title>`);
      });
    });
    $$renderer2.push(`<div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60"><img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse"/></div></div> <div class="w-full mx-auto p-4"><div class="bg-white rounded-2xl shadow-xl p-6"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"><h2 id="ReportTitle" class="text-2xl font-bold text-[#4E342E] tracking-tight">Deviation Report</h2></div> <form class="bg-[#FAF6F2] rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-end gap-4 shadow-sm"><div class="flex flex-col md:flex-row gap-4 w-full"><div class="flex-1 min-w-[150px]"><label for="Year" class="block text-xs font-semibold text-gray-700 mb-1">Year</label> <select name="Year" id="Year" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400">`);
    $$renderer2.option({ value: "Financial Year: 2025-2026" }, ($$renderer3) => {
      $$renderer3.push(`Financial Year: 2025-2026`);
    });
    $$renderer2.push(`</select></div> <div class="flex-1 min-w-[150px]"><label for="Tenure" class="block text-xs font-semibold text-gray-700 mb-1">Tenure</label> <select name="Tenure" id="Tenure" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400">`);
    $$renderer2.option({ value: "All" }, ($$renderer3) => {
      $$renderer3.push(`All`);
    });
    $$renderer2.option({ value: "Less than 1 Year" }, ($$renderer3) => {
      $$renderer3.push(`Less than 1 Year`);
    });
    $$renderer2.option({ value: "1 to 3 Years" }, ($$renderer3) => {
      $$renderer3.push(`1 to 3 Years`);
    });
    $$renderer2.option({ value: "More than 3 Years" }, ($$renderer3) => {
      $$renderer3.push(`More than 3 Years`);
    });
    $$renderer2.push(`</select></div> <div class="flex-1 min-w-[150px]"><label for="Department" class="block text-xs font-semibold text-gray-700 mb-1">Department</label> <select name="Department" id="Department" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400">`);
    $$renderer2.option({ value: "All" }, ($$renderer3) => {
      $$renderer3.push(`All`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(Departments);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let department = each_array[$$index];
      $$renderer2.option({ value: department }, ($$renderer3) => {
        $$renderer3.push(`${escape_html(department)}`);
      });
    }
    $$renderer2.push(`<!--]--></select></div> <div class="flex-1 min-w-[150px]"><label for="Employee" class="block text-xs font-semibold text-gray-700 mb-1">Employee</label> <select name="Employee" id="Employee" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-blue-400">`);
    $$renderer2.option({ value: "All" }, ($$renderer3) => {
      $$renderer3.push(`All`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array_1 = ensure_array_like(Object.entries(Employees));
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let [employee_self_id, employee_data] = each_array_1[$$index_1];
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.option({ value: employee_self_id }, ($$renderer3) => {
          $$renderer3.push(`${escape_html(employee_data.Employee_Tag)} - ${escape_html(employee_data.Department)}`);
        });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></select></div> <div class="flex-1 min-w-[150px]"><label for="deviationSlider" class="block mb-2 text-base font-semibold text-[#4E342E]">Deviation Filter</label> <div class="flex items-center gap-3"><input type="range" id="deviationSlider" min="0" max="5" step="0.1"${attr("value", deviationValue)} class="flex-1 h-1.5 bg-[#EFEBE9] rounded-full shadow-sm appearance-none outline-none accent-[#A1887F]" style="accent-color:#A1887F;"/> <span class="inline-block bg-[#EFEBE9] text-[#4E342E] font-semibold px-4 py-1 rounded-full shadow-sm border border-[#D7CCC8] text-base min-w-[40px] text-center">${escape_html(deviationValue)}</span></div></div></div> <div class="mt-4 md:mt-0 md:ml-4"><button class="rounded-lg bg-[#795548] px-6 py-2 text-white font-semibold shadow hover:bg-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#D7CCC8]">Search</button></div></form> <div class="flex flex-wrap gap-4 mb-4 text-[#4E342E] text-base"><div><span class="font-semibold">Year:</span> <span>${escape_html(dataval_result.Year || "ALL")}</span></div> <div><span class="font-semibold">Department:</span> <span>${escape_html(dataval_result.Department || "ALL")}</span></div> <div><span class="font-semibold">Employee:</span> <span>${escape_html(Selected_Employee)}</span></div> <button type="submit" class="ml-auto inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Export</button></div> <div class="overflow-x-auto rounded-xl border border-[#D7CCC8] shadow-sm"><table id="ReportData" class="min-w-full text-sm text-[#4E342E]"><thead class="bg-[#EFEBE9] text-[#4E342E] font-semibold"><tr><th class="py-2 px-3 text-left">Sr. No.</th><th class="py-2 px-3 text-left">Year</th><th class="py-2 px-3 text-left">Employee Code</th><th class="py-2 px-3 text-left">Employee Name</th><th class="py-2 px-3 text-left">DOJ</th><th class="py-2 px-3 text-left">Designation</th><th class="py-2 px-3 text-left">Department</th><th class="py-2 px-3 text-left">Tenure</th><th class="py-2 px-3 text-left">Last Increment Date</th><th class="py-2 px-3 text-left">Manager Emp Code</th><th class="py-2 px-3 text-left">Manager Name</th><th class="py-2 px-3 text-left">Manager Designation</th><th class="py-2 px-3 text-left">Cumulative Self Rating</th><th class="py-2 px-3 text-left">Cumulative Manager Rating</th><th class="py-2 px-3 text-left">Final Rating</th><th class="py-2 px-3 text-left">Deviation</th></tr></thead><tbody>`);
    if (dataval_result.Table_Data && dataval_result.Table_Data.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(dataval_result.Table_Data);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let row = each_array_2[$$index_2];
        if (calculateDeviation(row) >= deviationValue) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<tr class="even:bg-[#FAF6F2] hover:bg-[#EFEBE9] transition-colors"><td class="py-2 px-3">${escape_html(row.Serial_Number)}</td><td class="py-2 px-3">${escape_html(row.Year)}</td><td class="py-2 px-3">${escape_html(row.Employee_Code)}</td><td class="py-2 px-3">${escape_html(row.Employee_Name)}</td><td class="py-2 px-3">${escape_html(row.DOJ)}</td><td class="py-2 px-3">${escape_html(row.Designation)}</td><td class="py-2 px-3">${escape_html(row.Department)}</td><td class="py-2 px-3">${escape_html(row.Tenure)}</td><td class="py-2 px-3">${escape_html(row.Last_Increment_Date)}</td><td class="py-2 px-3">${escape_html(row.Manager_Employee_Code)}</td><td class="py-2 px-3">${escape_html(row.Manager_Employee_Name)}</td><td class="py-2 px-3">${escape_html(row.Manager_Designation)}</td><td class="py-2 px-3">${escape_html(row.Cumulative_Self_Rating)}</td><td class="py-2 px-3">${escape_html(row.Cumulative_Manager_Rating)}</td><td class="py-2 px-3">${escape_html(row.Cumulative_Final_Rating)}</td><td class="py-2 px-3 font-bold text-[#795548]">${escape_html(calculateDeviation(row).toFixed(2))}</td></tr>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<tr><td colspan="13" class="text-center py-6 text-[#BCAAA4]">No data available</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
    bind_props($$props, { dataval_result });
  });
}
export {
  _page as default
};
