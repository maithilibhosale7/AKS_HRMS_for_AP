import { e as ensure_array_like, c as attr_class, d as clsx } from "../../../../chunks/index2.js";
import "d3";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let departmentSummary = {};
    let Departments = [];
    let expandedDepartments = /* @__PURE__ */ new Set();
    $$renderer2.push(`<div class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"><div class="max-w-7xl mx-auto"><div class="text-center mb-4"><h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Corporate PMS Report</h1></div> <div class="bg-white rounded-2xl shadow-lg p-4 mb-10 border border-gray-200"><form><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="space-y-4"><div><label class="block mb-1 text-sm font-medium text-gray-800" for="Year">Year</label> <select id="Year" name="Year" class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">`);
    $$renderer2.option({ value: "Financial Year: 2025-2026" }, ($$renderer3) => {
      $$renderer3.push(`Financial Year: 2025-2026`);
    });
    $$renderer2.push(`</select></div> <div><label class="block mb-1 text-sm font-medium text-gray-800" for="Tenure">Tenure</label> <select id="Tenure" name="Tenure" class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500">`);
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
    $$renderer2.push(`</select></div></div> <div class="space-y-4"><div><label class="block mb-1 text-sm font-medium text-gray-800" for="Department">Department</label> <select id="Department" name="Department" class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500">`);
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
    $$renderer2.push(`<!--]--></select></div></div></div> <div class="flex justify-end mt-4"><button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Search</button></div></form></div>  <div class="flex gap-2 ml-4 mb-0 mt-2 justify-start"><button${attr_class(
      `px-6 py-2 rounded-t-lg font-semibold transition-all border-b-4 
          ${"border-blue-600 bg-white text-blue-700 shadow"}`,
      "svelte-fe0n6i"
    )}>Self</button> <button${attr_class(
      `px-6 py-2 rounded-t-lg font-semibold transition-all border-b-4
          ${"border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
      "svelte-fe0n6i"
    )}>Manager</button> <button${attr_class(
      `px-6 py-2 rounded-t-lg font-semibold transition-all border-b-4
          ${"border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
      "svelte-fe0n6i"
    )}>Final</button></div> <div class="bg-white shadow-xl rounded-2xl border border-gray-200"><div class="p-6"><div id="singleChart" class="chart-container svelte-fe0n6i"></div></div></div> <div><div class="bg-white rounded-2xl shadow-md p-8 border border-gray-200"><h2 class="text-xl font-semibold mb-6 text-gray-800">Department-wise Summary</h2> <div class="overflow-hidden rounded-xl border border-gray-200"><table class="w-full text-sm"><thead class="bg-gray-50 text-gray-700 border-b"><tr><th class="px-4 py-3"></th><th class="px-4 py-3 font-medium text-left">Department</th><th class="px-4 py-3 font-medium text-left">Total</th>`);
    if (expandedDepartments.size > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<th class="px-4 py-3 font-medium text-left">Manager Details</th>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><th class="px-4 py-3 font-medium text-left">H1 Self</th><th class="px-4 py-3 font-medium text-left">H1 Manager</th><th class="px-4 py-3 font-medium text-left">H1</th><th class="px-4 py-3 font-medium text-left">H2 Self</th><th class="px-4 py-3 font-medium text-left">H2 Manager</th><th class="px-4 py-3 font-medium text-left">H2</th><th class="px-4 py-3 font-medium text-left">Final</th></tr></thead><tbody class="divide-y divide-gray-100"><!--[-->`);
    const each_array_1 = ensure_array_like(Object.entries(departmentSummary));
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let [dept, data] = each_array_1[$$index_2];
      $$renderer2.push(`<tr${attr_class(clsx(expandedDepartments.has(dept) ? "bg-blue-50 transition" : "hover:bg-gray-50 transition"))}><td class="px-4 py-3 text-center"><button class="px-3 py-1 rounded-lg transition text-sm bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white shadow-sm">${escape_html(expandedDepartments.has(dept) ? "−" : "+")}</button></td><td class="px-4 py-3 font-semibold text-gray-900">${escape_html(dept)}</td><td class="px-4 py-3 font-semibold">${escape_html(data.totalIndividuals)} <span class="text-xs text-gray-500">(Not Filled: ${escape_html(data.notFilledCount)})</span></td>`);
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
        const each_array_2 = ensure_array_like(data.employees);
        for (let index = 0, $$length2 = each_array_2.length; index < $$length2; index++) {
          let emp = each_array_2[index];
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
    $$renderer2.push(`<!--]--></tbody></table></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
