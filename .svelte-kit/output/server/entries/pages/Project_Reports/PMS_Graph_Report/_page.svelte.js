import { e as ensure_array_like, a as attr, c as attr_class, d as clsx } from "../../../../chunks/index2.js";
import "d3";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let h1Data = [];
    let h2Data = [];
    let finalData = [];
    let Departments = [];
    let Employees = [];
    let allRows = [];
    {
      if (!finalData || finalData.length === 0) {
        allRows = [];
      } else {
        allRows = finalData.map((e) => ({
          code: e.code,
          name: e.name,
          m_code: e.m_code,
          m_name: e.m_name,
          h1_self: h1Data.find((d) => d.name === e.name)?.self ?? "",
          h1_manager: h1Data.find((d) => d.name === e.name)?.manager ?? "",
          h1_final: h1Data.find((d) => d.name === e.name)?.final ?? "",
          h2_self: h2Data.find((d) => d.name === e.name)?.self ?? "",
          h2_manager: h2Data.find((d) => d.name === e.name)?.manager ?? "",
          h2_final: h2Data.find((d) => d.name === e.name)?.final ?? "",
          final_self: e.self,
          final_manager: e.manager,
          final_final: e.final,
          filled: true
        }));
      }
    }
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="p-6 bg-gray-100 min-h-screen"><h1 class="text-2xl font-bold mb-2 text-center">Corporate PMS Report</h1> <div class="flex flex-col"><div class="overflow-x-auto sm:-mx-6 lg:-mx-8"><div class="py-2 inline-block min-w-full sm:px-6 lg:px-8"><div class="overflow-x-auto"><div class="bg-white rounded-2xl shadow-lg p-4 border border-gray-200"><form><div class="flex flex-wrap"><div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Year">Year</label></div> <div class="md:w-2/3"><select name="Year" id="Year" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
    $$renderer2.option({ value: "Financial Year: 2025-2026" }, ($$renderer3) => {
      $$renderer3.push(`Financial Year: 2025-2026`);
    });
    $$renderer2.push(`</select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Tenure">Tenure</label></div> <div class="md:w-2/3"><select name="Tenure" id="Tenure" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
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
    $$renderer2.push(`</select></div></div></div>  <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Department">Department</label></div> <div class="md:w-2/3"><select name="Department" id="Department" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
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
    $$renderer2.push(`<!--]--></select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-sm font-medium md:text-left text-gray-900 pr-4" for="Employee">Employee</label></div> <div class="md:w-2/3"><select name="Employee" id="Employee" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
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
    $$renderer2.push(`<!--]--></select></div></div></div></div> <div class="flex flex-wrap items-center justify-end space-x-3 text-center"><button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Search</button></div></form></div></div></div></div></div>  <div class="mt-6 flex flex-row gap-8 flex-nowrap items-start"><div class="w-full lg:w-[60%] flex flex-col gap-6 min-w-[350px]"><!--[-->`);
    const each_array_2 = ensure_array_like([
      { id: "h1Chart", data: h1Data, title: "H1 Ratings" },
      { id: "h2Chart", data: h2Data, title: "H2 Ratings" },
      { id: "finalChart", data: finalData, title: "Final Ratings" }
    ]);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let chart = each_array_2[$$index_2];
      $$renderer2.push(`<div class="bg-white shadow-2xl rounded-2xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300"><div${attr("id", chart.id)} class="chart-container svelte-1kq7cjd"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="w-[40%] shrink min-w-[300px] max-w-full"><div class="bg-white shadow-2xl rounded-2xl p-6 h-full flex flex-col" style="height: 1517px; min-height: 1517px; max-height: 1517px;"><div class="flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white" style="max-width: 1000px; height: 100%;"><table class="min-w-[1000px] text-xs md:text-sm table-auto"><thead><tr class="bg-gray-50 text-gray-700"><th class="px-3 py-2 border-b">Emp Code</th><th class="px-3 py-2 border-b">Name</th><th class="px-3 py-2 border-b">H1 Self</th><th class="px-3 py-2 border-b">H1 Manager</th><th class="px-3 py-2 border-b">H1 Final</th><th class="px-3 py-2 border-b">H2 Self</th><th class="px-3 py-2 border-b">H2 Manager</th><th class="px-3 py-2 border-b">H2 Final</th><th class="px-3 py-2 border-b">Final Self</th><th class="px-3 py-2 border-b">Final Manager</th><th class="px-3 py-2 border-b">Final Final</th></tr></thead><tbody><!--[-->`);
    const each_array_3 = ensure_array_like(allRows);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let row = each_array_3[$$index_3];
      $$renderer2.push(`<tr${attr_class(clsx(row.filled ? "hover:bg-blue-50" : "hover:bg-red-50"))}><td class="px-3 py-2 border-b">${escape_html(row.code)}</td><td class="px-4 py-3"><div>${escape_html(row.name)}</div> <div class="text-xs text-gray-500">${escape_html(row.m_code)} : ${escape_html(row.m_name)}</div></td><td class="px-3 py-2 border-b">${escape_html(row.h1_self)}</td><td class="px-3 py-2 border-b">${escape_html(row.h1_manager)}</td><td class="px-3 py-2 border-b">${escape_html(row.h1_final)}</td><td class="px-3 py-2 border-b">${escape_html(row.h2_self)}</td><td class="px-3 py-2 border-b">${escape_html(row.h2_manager)}</td><td class="px-3 py-2 border-b">${escape_html(row.h2_final)}</td><td class="px-3 py-2 border-b">${escape_html(row.final_self)}</td><td class="px-3 py-2 border-b">${escape_html(row.final_manager)}</td><td class="px-3 py-2 border-b">${escape_html(row.final_final)}</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
