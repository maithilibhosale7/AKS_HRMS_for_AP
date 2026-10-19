import { s as store_get, l as head, a as attr, e as ensure_array_like, u as unsubscribe_stores } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { L as Live_Data_Storage } from "../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let pendingRequestsCount;
    let Corporate_Hierarchy_Data = [];
    let Departments = [];
    let Corporate_Employee_Updates_Data;
    let selectedStatus = "All";
    let selectedDepartment = "All";
    let searchQuery = "";
    let Matching_Corporate_Employee_IDs = [];
    {
      store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    }
    pendingRequestsCount = Array.isArray(Corporate_Employee_Updates_Data) ? Corporate_Employee_Updates_Data.filter((i) => i.Status === "Pending Approval").length : 0;
    head("blxaqc", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Corporate Employees Management | Recon</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen bg-gray-50"><div class="bg-white shadow-sm border-b"><div class="px-4 py-4 mx-auto"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div class="flex items-center gap-3"><div class="w-3 h-10 rounded-r-full" style="background: #795548;"></div> <div><h1 class="text-2xl font-bold text-[#4E342E]">Corporate Employees Management</h1></div></div> <div class="flex items-center gap-3"><button class="relative flex items-center gap-2 px-4 py-2.5 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#795548] rounded-lg border border-[#D7CCC8] transition-all duration-200 group"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> <span class="font-semibold">Requests</span> `);
    if (pendingRequestsCount > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">${escape_html(pendingRequestsCount)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> <button class="flex items-center gap-2 px-4 py-2.5 bg-[#795548] hover:bg-[#6D4C41] text-white rounded-lg border border-[#795548] transition-all duration-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span class="font-semibold">Add Corporate Employee</span></button> <button class="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF6F2] text-[#4E342E] rounded-lg border border-[#D7CCC8] transition-all duration-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> <span class="font-semibold">Back</span></button></div></div> <div class="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div class="flex flex-col md:flex-row md:items-center w-full gap-4"><div class="relative flex-1 min-w-[250px]"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <input type="text"${attr("value", searchQuery)} placeholder="Search sales persons by name, ID, or employee code..." class="w-full pl-10 pr-4 py-3 border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all duration-200 bg-white hover:bg-[#FAF6F2]"/> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="w-full md:w-auto"><div class="w-full sm:w-48">`);
    $$renderer2.select(
      {
        value: selectedDepartment,
        class: "w-full min-w-[150px] px-4 py-3 border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all duration-200 bg-white"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All Departments`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(Departments);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let Department = each_array[$$index];
          $$renderer3.option({ value: Department }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(Department)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div></div> <div class="w-full md:w-auto"><div class="w-full sm:w-48">`);
    $$renderer2.select(
      {
        value: selectedStatus,
        class: "w-full min-w-[150px] px-4 py-3 border border-[#D7CCC8] rounded-lg focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all duration-200 bg-white"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All Status`);
        });
        $$renderer3.option({ value: "Active", class: "text-green-700" }, ($$renderer4) => {
          $$renderer4.push(`Active`);
        });
        $$renderer3.option({ value: "Absconding", class: "text-red-700" }, ($$renderer4) => {
          $$renderer4.push(`Absconding`);
        });
        $$renderer3.option({ value: "Resigned", class: "text-orange-700" }, ($$renderer4) => {
          $$renderer4.push(`Resigned`);
        });
      }
    );
    $$renderer2.push(`</div></div></div></div></div> <div class="px-4 py-6 mx-auto"><div class="space-y-4">`);
    if (Corporate_Hierarchy_Data && Corporate_Hierarchy_Data.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(Corporate_Hierarchy_Data);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let EmployeeSelf = each_array_1[$$index_1];
        if (Matching_Corporate_Employee_IDs.length === 0 || Matching_Corporate_Employee_IDs.includes(EmployeeSelf.Employee_Self_ID)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="simple-hierarchy-item svelte-blxaqc"><div class="simple-card svelte-blxaqc"><div class="simple-header svelte-blxaqc"><div class="simple-avatar svelte-blxaqc">${escape_html(EmployeeSelf.Employee_Name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase())}</div> <div class="simple-info svelte-blxaqc"><div class="simple-name svelte-blxaqc">${escape_html(EmployeeSelf.Employee_Name)}</div> <div class="simple-position svelte-blxaqc">${escape_html(EmployeeSelf.Designation)}</div></div> <div class="edit-button"><button class="edit-btn-pro svelte-blxaqc">Edit</button></div></div> <div class="details-columns svelte-blxaqc"><div class="column svelte-blxaqc"><p><strong>Employee Code:</strong> ${escape_html(EmployeeSelf.Employee_Code)}</p> <p><strong>Department:</strong> ${escape_html(EmployeeSelf.Department)}</p> <p><strong>Reporting To:</strong> ${escape_html(EmployeeSelf.Reporting_To_Employee_Self_Name ? EmployeeSelf.Reporting_To_Employee_Self_Name : "N/A")}</p> <p><strong>Status:</strong> ${escape_html(EmployeeSelf.Status ? EmployeeSelf.Status : "N/A")}</p></div> <div class="column svelte-blxaqc"><p><strong>DOJ:</strong> ${escape_html(EmployeeSelf.Date_of_Joining)}</p> <p><strong>DOL:</strong> ${escape_html(EmployeeSelf.Date_of_Leaving ? EmployeeSelf.Date_of_Leaving : "N/A")}</p> <p><strong>Mobile:</strong> ${escape_html(EmployeeSelf.Mobile ? EmployeeSelf.Mobile : "N/A")}</p> <p><strong>Email ID:</strong> ${escape_html(EmployeeSelf.Email_ID ? EmployeeSelf.Email_ID : "N/A")}</p></div></div></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="bg-white rounded-xl shadow-sm border p-12 text-center"><div class="max-w-md mx-auto"><div class="w-24 h-24 mx-auto mb-6 text-gray-300"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">No Corporate Employees Found</h3></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
