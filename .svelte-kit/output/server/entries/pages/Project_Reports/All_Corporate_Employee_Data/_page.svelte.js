import { e as ensure_array_like, c as attr_class, a as attr, b as bind_props, g as stringify } from "../../../../chunks/index2.js";
import "exceljs";
import { Z as fallback } from "../../../../chunks/utils2.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let filtered_data;
    let dataval_result = fallback($$props["dataval_result"], () => [], true);
    let Departments = [];
    let Selected_Department = "All";
    let Selected_Tenure = "All";
    let Selected_Status = "All";
    let Selected_PMS_Eligibility = "Yes";
    let Selected_PMS_Defined = "Yes";
    let Selected_H1_Status = "No Filter";
    let Selected_H2_Status = "No Filter";
    function formatDate(dateString) {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString("en-IN");
      } catch (e) {
        return null;
      }
    }
    function getEmployeeReminderGroups(reminderMap) {
      return {
        h1: [
          `H1 #1: ${formatDate(reminderMap?.H1_Self_Rem_1) || "Not Sent"}`,
          `H1 #2: ${formatDate(reminderMap?.H1_Self_Rem_2) || "Not Sent"}`,
          `H1 #3: ${formatDate(reminderMap?.H1_Self_Rem_3) || "Not Sent"}`
        ],
        h2: [
          `H2 #1: ${formatDate(reminderMap?.H2_Self_Rem_1) || "Not Sent"}`,
          `H2 #2: ${formatDate(reminderMap?.H2_Self_Rem_2) || "Not Sent"}`,
          `H2 #3: ${formatDate(reminderMap?.H2_Self_Rem_3) || "Not Sent"}`
        ]
      };
    }
    function getManagerReminderGroups(reminderMap) {
      return {
        h1: [
          `H1 #1: ${formatDate(reminderMap?.H1_Mgr_Rem_1) || "Not Sent"}`,
          `H1 #2: ${formatDate(reminderMap?.H1_Mgr_Rem_2) || "Not Sent"}`,
          `H1 #3: ${formatDate(reminderMap?.H1_Mgr_Rem_3) || "Not Sent"}`
        ],
        h2: [
          `H2 #1: ${formatDate(reminderMap?.H2_Mgr_Rem_1) || "Not Sent"}`,
          `H2 #2: ${formatDate(reminderMap?.H2_Mgr_Rem_2) || "Not Sent"}`,
          `H2 #3: ${formatDate(reminderMap?.H2_Mgr_Rem_3) || "Not Sent"}`
        ]
      };
    }
    function getLaunchDateGroups(reminderMap) {
      return {
        h1: [
          `H1: ${formatDate(reminderMap?.H1_Launch_Date) || "Not Sent"}`
        ],
        h2: [
          `H2: ${formatDate(reminderMap?.H2_Launch_Date) || "Not Sent"}`
        ]
      };
    }
    const now = /* @__PURE__ */ new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDate = now.getDate();
    let isProcessingEmails = false;
    let managerEmailDates = {};
    filtered_data = (dataval_result || []).filter((row) => {
      const matchesDept = Selected_Department === "All";
      const matchesTenure = Selected_Tenure === "All";
      const matchesStatus = row.Status !== "Resigned" && row.Status !== "Absconding" || Selected_Status !== "All";
      const matchesEligibility = row.PMS_Eligibility === Selected_PMS_Eligibility;
      const matchesDefined = row.PMS_Defined === Selected_PMS_Defined;
      let matchesH1 = true;
      let matchesH2 = true;
      return matchesDept && matchesTenure && matchesStatus && matchesEligibility && matchesDefined && matchesH1 && matchesH2;
    });
    {
      if (filtered_data && filtered_data.length > 0) {
        const managers = /* @__PURE__ */ new Map();
        filtered_data.forEach((emp) => {
          const mgrCode = emp.Manager_Employee_Code;
          if (!managers.has(mgrCode)) {
            managers.set(mgrCode, {
              H1_Mgr_Rem_1: emp.H1_Mgr_Rem_1,
              H1_Mgr_Rem_2: emp.H1_Mgr_Rem_2,
              H1_Mgr_Rem_3: emp.H1_Mgr_Rem_3,
              H2_Mgr_Rem_1: emp.H2_Mgr_Rem_1,
              H2_Mgr_Rem_2: emp.H2_Mgr_Rem_2,
              H2_Mgr_Rem_3: emp.H2_Mgr_Rem_3
            });
          }
        });
        managerEmailDates = {};
        managers.forEach((mgr, mgrCode) => {
          managerEmailDates[mgrCode] = {
            H1_Mgr_Rem_1: mgr.H1_Mgr_Rem_1,
            H1_Mgr_Rem_2: mgr.H1_Mgr_Rem_2,
            H1_Mgr_Rem_3: mgr.H1_Mgr_Rem_3,
            H2_Mgr_Rem_1: mgr.H2_Mgr_Rem_1,
            H2_Mgr_Rem_2: mgr.H2_Mgr_Rem_2,
            H2_Mgr_Rem_3: mgr.H2_Mgr_Rem_3
          };
        });
      }
    }
    $$renderer2.push(`<div class="p-4 font-sans"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm"><div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Department</label> `);
    $$renderer2.select(
      {
        value: (
          // Count unique managers who still have at least one pending H1 review
          // Default: all active employees
          Selected_Department
        ),
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All Departments`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(Departments);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let dept = each_array[$$index];
          $$renderer3.option({ value: dept.Department || dept }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(dept.Department || dept)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tenure</label> `);
    $$renderer2.select(
      {
        value: Selected_Tenure,
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All Tenure`);
        });
        $$renderer3.option({ value: "&lt;1" }, ($$renderer4) => {
          $$renderer4.push(`Less than 1 Year`);
        });
        $$renderer3.option({ value: "1-3" }, ($$renderer4) => {
          $$renderer4.push(`1 to 3 Years`);
        });
        $$renderer3.option({ value: ">3" }, ($$renderer4) => {
          $$renderer4.push(`More than 3 Years`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">PMS Eligibility</label> `);
    $$renderer2.select(
      {
        value: Selected_PMS_Eligibility,
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All`);
        });
        $$renderer3.option({ value: "Yes" }, ($$renderer4) => {
          $$renderer4.push(`Yes`);
        });
        $$renderer3.option({ value: "No" }, ($$renderer4) => {
          $$renderer4.push(`No`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">PMS Defined</label> `);
    $$renderer2.select(
      {
        value: Selected_PMS_Defined,
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All`);
        });
        $$renderer3.option({ value: "Yes" }, ($$renderer4) => {
          $$renderer4.push(`Yes`);
        });
        $$renderer3.option({ value: "No" }, ($$renderer4) => {
          $$renderer4.push(`No`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label> `);
    $$renderer2.select(
      {
        value: Selected_Status,
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All Status`);
        });
        $$renderer3.option({ value: "Active" }, ($$renderer4) => {
          $$renderer4.push(`Active`);
        });
        $$renderer3.option({ value: "Resigned" }, ($$renderer4) => {
          $$renderer4.push(`Resigned`);
        });
        $$renderer3.option({ value: "Absconding" }, ($$renderer4) => {
          $$renderer4.push(`Absconding`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">H1 PMS Status</label> `);
    $$renderer2.select(
      {
        value: Selected_H1_Status,
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "No Filter" }, ($$renderer4) => {
          $$renderer4.push(`No Filter`);
        });
        $$renderer3.option({ value: "H1 Pending" }, ($$renderer4) => {
          $$renderer4.push(`H1 Pending`);
        });
        $$renderer3.option({ value: "H1 Self Pending" }, ($$renderer4) => {
          $$renderer4.push(`H1 Self Pending`);
        });
        $$renderer3.option({ value: "H1 Mgr Pending" }, ($$renderer4) => {
          $$renderer4.push(`H1 Mgr Pending`);
        });
      }
    );
    $$renderer2.push(`</div> <div><label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">H2 PMS Status</label> `);
    $$renderer2.select(
      {
        value: Selected_H2_Status,
        class: "w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/30"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "No Filter" }, ($$renderer4) => {
          $$renderer4.push(`No Filter`);
        });
        $$renderer3.option({ value: "H2 Pending" }, ($$renderer4) => {
          $$renderer4.push(`H2 Pending`);
        });
        $$renderer3.option({ value: "H2 Self Pending" }, ($$renderer4) => {
          $$renderer4.push(`H2 Self Pending`);
        });
        $$renderer3.option({ value: "H2 Mgr Pending" }, ($$renderer4) => {
          $$renderer4.push(`H2 Mgr Pending`);
        });
      }
    );
    $$renderer2.push(`</div> <div class="flex items-end"><button class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-2 px-2 rounded-lg transition-all duration-200 text-sm h-[38px] shadow-sm">Export Excel</button></div></div> <div class="mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm"><div class="flex items-center justify-between mb-4"><label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bulk PMS Communications</label> <span class="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">System Date: ${escape_html(currentDate)}/${escape_html(currentMonth)}/${escape_html(now.getFullYear())}</span></div> <div class="space-y-4"><div${attr_class(`flex flex-wrap items-center gap-3 p-3 rounded-lg ${stringify(
      "bg-gray-50/50 border-l-4 border-indigo-400"
    )} transition-all`)}><span${attr_class(`text-xs font-bold ${stringify("text-indigo-700")} w-16`)}>H1 Row:</span> <div class="flex flex-wrap gap-2"><button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200 shadow-sm transition-all">Send H1 Launch Mail</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 shadow-sm transition-all">Send Reminder to Employee (H1)</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 shadow-sm transition-all">Send Reminder to Manager (H1)</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200 shadow-sm transition-all">Cycle Extension for Employee (H1)</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed border border-violet-200 shadow-sm transition-all">Cycle Extension for Manager (H1)</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`flex flex-wrap items-center gap-3 p-3 rounded-lg ${stringify(
      "bg-gray-50/50 border-l-4 border-indigo-400"
    )} transition-all`)}><span${attr_class(`text-xs font-bold ${stringify("text-indigo-700")} w-16`)}>H2 Row:</span> <div class="flex flex-wrap gap-2"><button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-200 shadow-sm transition-all">Send H2 Launch Mail</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 shadow-sm transition-all">Send Reminder to Employee (H2)</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 shadow-sm transition-all">Send Reminder to Manager (H2)</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200 shadow-sm transition-all">Cycle Extension for Employee (H2)</button> <button${attr("disabled", isProcessingEmails, true)} class="px-3 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed border border-violet-200 shadow-sm transition-all">Cycle Extension for Manager (H2)</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div class="overflow-x-auto"><table id="ReportData" class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 border-b border-gray-200"><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Code</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Name</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Employee Design.</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Department</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mgr Code</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mgr Name</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mgr Design.</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">DOJ</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">DOL</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tenure</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Eligible</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Defined</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Launch Date Mail</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Reminder to Employee</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Reminder to Manager</th><th class="p-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">PMS Status</th></tr></thead><tbody class="divide-y divide-gray-100">`);
    const each_array_1 = ensure_array_like(filtered_data);
    if (each_array_1.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let row = each_array_1[$$index_1];
        $$renderer2.push(`<tr class="hover:bg-gray-50/80 transition-colors duration-150"><td class="p-3 text-sm text-gray-600 font-mono">${escape_html(row.Employee_Code)}</td><td class="p-3 text-sm font-semibold text-gray-800">${escape_html(row.Employee_Name)}</td><td class="p-3 text-sm text-gray-500">${escape_html(row.Designation)}</td><td class="p-3 text-sm text-gray-500">${escape_html(row.Department)}</td><td class="p-3 text-sm text-gray-600 font-mono">${escape_html(row.Manager_Employee_Code)}</td><td class="p-3 text-sm font-medium text-gray-800">${escape_html(row.Manager_Employee_Name)}</td><td class="p-3 text-sm text-gray-500">${escape_html(row.Manager_Employee_Name)}</td><td class="p-3 text-sm text-gray-500">${escape_html(row.DOJ)}</td><td class="p-3 text-sm text-gray-500">${escape_html(row.DOL)}</td><td class="p-3 text-sm"><span${attr_class(`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${row.Status === "Active" ? "bg-emerald-50 text-emerald-700" : row.Status === "Resigned" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`)}>${escape_html(row.Status)}</span></td><td class="p-3 text-sm text-gray-500">${escape_html(row.Tenure)}</td><td class="p-3 text-sm"><span${attr_class(`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${row.PMS_Eligibility === "Yes" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`)}>${escape_html(row.PMS_Eligibility)}</span></td><td class="p-3 text-sm"><span${attr_class(`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${row.PMS_Defined === "Yes" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`)}>${escape_html(row.PMS_Defined)}</span></td><td class="p-3 text-sm"><div class="min-w-[130px] space-y-2"><div class="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-emerald-900 shadow-sm">${escape_html(getLaunchDateGroups(row).h1.join("\n"))}</div> <div class="rounded border border-teal-200 bg-teal-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-teal-900 shadow-sm">${escape_html(getLaunchDateGroups(row).h2.join("\n"))}</div></div></td><td class="p-3 text-sm"><div class="min-w-[150px] space-y-2"><div class="rounded border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-sky-900 shadow-sm">${escape_html(getEmployeeReminderGroups(row).h1.join("\n"))}</div> <div class="rounded border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-violet-900 shadow-sm">${escape_html(getEmployeeReminderGroups(row).h2.join("\n"))}</div></div></td><td class="p-3 text-sm"><div class="min-w-[150px] space-y-2"><div class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-amber-900 shadow-sm">${escape_html(getManagerReminderGroups(managerEmailDates[row.Manager_Employee_Code]).h1.join("\n"))}</div> <div class="rounded border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-orange-900 shadow-sm">${escape_html(getManagerReminderGroups(managerEmailDates[row.Manager_Employee_Code]).h2.join("\n"))}</div></div></td><td class="p-3 text-sm"><div class="min-w-[150px] space-y-2"><div class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-slate-700 shadow-sm">${escape_html(`H1 Self: ${row.H1_Self_Status ? "Done" : "Pending"}
H1 Manager: ${row.H1_Manager_Status ? "Done" : "Pending"}`)}</div> <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium leading-6 whitespace-pre text-slate-700 shadow-sm">${escape_html(`H2 Self: ${row.H2_Self_Status ? "Done" : "Pending"}
H2 Manager: ${row.H2_Manager_Status ? "Done" : "Pending"}`)}</div></div></td></tr>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<tr><td colspan="17" class="p-12 text-center text-gray-400 italic bg-gray-50/30">No employees matching these filters.</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { dataval_result });
  });
}
export {
  _page as default
};
