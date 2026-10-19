import { a as attr, b as bind_props, c as attr_class, d as clsx, s as store_get, e as ensure_array_like, u as unsubscribe_stores, f as attr_style, g as stringify, h as store_set, j as slot } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { Z as fallback } from "../../chunks/utils2.js";
/* empty css                                                */
import { h as html } from "../../chunks/Expense_AddEdit.svelte_svelte_type_style_lang.js";
import { w as writable } from "../../chunks/index.js";
import { S as SessionStore } from "../../chunks/SessionStore.js";
import { L as Live_Data_Storage } from "../../chunks/Live_Data_Storage.js";
import "@sveltejs/kit";
import { P as Project_Theme_Settings } from "../../chunks/Project_Theme_Settings.js";
import { e as escape_html } from "../../chunks/context.js";
import "../../chunks/AKS_HRMS_Modal_Store.js";
import "xlsx-js-style";
function Cancel($$renderer, $$props) {
  let cssPropPrefix;
  let type = fallback($$props["type"], "info");
  cssPropPrefix = `--as-toast-${type}-color`;
  $$renderer.push(`<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.571429 0.571436C0.255838 0.887027 0.255838 1.3987 0.571429 1.71429L6.28571 7.42858C6.6013 7.74417 7.11298 7.74417 7.42857 7.42858C7.74416 7.11299 7.74416 6.60131 7.42857 6.28572L1.71429 0.571437C1.3987 0.255845 0.887021 0.255845 0.571429 0.571436Z"${attr("fill", `var(${cssPropPrefix}, var(--as-toast-color, black))`)}></path><path d="M7.42857 0.57141C7.11298 0.255819 6.60131 0.255819 6.28571 0.57141L0.571431 6.28569C0.25584 6.60128 0.255839 7.11296 0.57143 7.42855C0.887021 7.74414 1.3987 7.74414 1.71429 7.42855L7.42857 1.71427C7.74416 1.39868 7.74416 0.887002 7.42857 0.57141Z"${attr("fill", `var(${cssPropPrefix}, var(--as-toast-color, black))`)}></path></svg>`);
  bind_props($$props, { type });
}
const toasts = writable([]);
function Toast($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let toast = $$props["toast"];
    let cancelIcon = $$props["cancelIcon"];
    $$renderer2.push(`<div${attr_class(clsx(toast.type), "svelte-ubin27")}><span role="status">${html(toast.msg)}</span> <button aria-label="Cancel Button" class="svelte-ubin27">`);
    $$renderer2.push("<!---->");
    cancelIcon?.($$renderer2, { type: toast.type });
    $$renderer2.push(`<!----></button></div>`);
    bind_props($$props, { toast, cancelIcon });
  });
}
function Toasts($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let toastComponent = fallback($$props["toastComponent"], Toast);
    let cancelIcon = fallback($$props["cancelIcon"], Cancel);
    if (store_get($$store_subs ??= {}, "$toasts", toasts).length) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<ul class="svelte-rls162"><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let toast = each_array[$$index];
        $$renderer2.push(`<li>`);
        $$renderer2.push("<!---->");
        toastComponent?.($$renderer2, { toast, cancelIcon });
        $$renderer2.push(`<!----></li>`);
      }
      $$renderer2.push(`<!--]--></ul>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { toastComponent, cancelIcon });
  });
}
const isSidebarOpen = writable(true);
const isLoaderOpen = writable(false);
function Header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user;
    user = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage).User_Information || {};
    $$renderer2.push(`<header class="sticky top-0 z-40 w-full shadow-sm h-16 flex items-center"${attr_style(`background-color: ${stringify(Project_Theme_Settings.header_color)};`)}><nav class="flex w-full items-center justify-between px-4 sm:px-6"><div class="flex items-center"><button class="p-3 -ml-2 rounded-full hover:bg-black/5 transition-colors focus:outline-none" aria-label="Toggle Menu"><svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button> <img${attr("src", Project_Theme_Settings.AKS_Logo)} alt="Logo" class="h-7 sm:h-9 w-auto ml-2 bg-white rounded-md shadow-sm border border-gray-100 px-2 py-1 object-contain"/></div> <div class="flex items-center space-x-2 sm:space-x-4"><div class="relative"><button class="flex items-center group p-1 rounded-full hover:bg-black/5 transition-all"><div class="text-right mr-3 hidden md:block"><p class="text-xs font-bold text-gray-800 leading-tight">${escape_html(user.username || "User")}</p> <p class="text-[10px] text-gray-500 uppercase tracking-tighter">${escape_html(user.role || "Member")}</p></div> <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm transition-transform group-active:scale-95">${escape_html(user.username ? user.username.charAt(0).toUpperCase() : "U")}</div></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></nav></header>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Employee_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered, activeFilterCount;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterDesignation = "All";
    let Department_Data = {};
    let Designation_Data = {};
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    Object.values(Department_Data).map((d) => ({ id: String(d.Department_ID), name: d.Department_Name }));
    Object.values(Designation_Data).map((d) => ({ id: String(d.Designation_ID), name: d.Designation_Name }));
    filtered = records.filter((r) => {
      const matchesDesignation = filterDesignation === "All";
      return matchesDesignation;
    });
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    activeFilterCount = 0 + 0 + 0;
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex items-center gap-2"><div class="relative flex-1 sm:flex-none sm:w-64"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr(
      "value",
      // ── Data fetch ─────────────────────────────────────────────────────
      // Load master data (for filter dropdowns) and employee list in parallel
      // ── Refresh after Add/Edit ─────────────────────────────────────────
      // ── Actions ────────────────────────────────────────────────────────
      // ── Status badge colors ────────────────────────────────────────────
      searchQuery
    )} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div> <button class="relative px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg> <span class="hidden sm:inline">Filters</span> `);
    if (activeFilterCount > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">${escape_html(activeFilterCount)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> `);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] transition-colors whitespace-nowrap shrink-0">+ Add Employee</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p class="text-xs text-slate-400">${escape_html(filtered.length)} employee${escape_html(filtered.length !== 1 ? "s" : "")} `);
    if (activeFilterCount > 0 || searchQuery) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="text-slate-300">·</span> filtered from ${escape_html(records.length)} total`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Attendance_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let uploading = false;
    let currentPage = 1;
    const PAGE_SIZE = 15;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">`);
    if (
      // ── Data fetch ─────────────────────────────────────────────────────
      // ── Actions ────────────────────────────────────────────────────────
      // ── Biometric CSV/Excel Upload (HR Admin) ─────────────────────────
      isHRAdmin
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like([
          "All",
          "Present",
          "Absent",
          "Leave",
          "OD",
          "Holiday",
          "Week Off",
          "New"
        ]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <div class="sm:ml-auto flex gap-2">`);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ Add Entry</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"><div class="flex items-center gap-2 flex-1 min-w-0"><svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> <input type="file" accept=".csv,.xlsx,.xls" class="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white file:text-slate-700 file:shadow-sm file:cursor-pointer"/></div> <button${attr("disabled", uploading, true)} class="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">${escape_html("Upload Attendance Data")}</button></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Leave_AddEdit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, isL1Approver, isL2Approver, canApprove, selectedLeaveBalance;
    let editId = fallback($$props["editId"], "Add");
    let initialMode = fallback($$props["initialMode"], "View");
    let onSave = fallback($$props["onSave"], () => {
    });
    let Live_Data;
    let Page_Mode = editId === "Add" ? "Add" : initialMode;
    let D = {
      Employee_Self_ID: "",
      Leave_Balance: {},
      // { Leave_Type_ID: { Leave_Type_Name, Assigned_Count, Leave_Balance, ... } }
      New_Leave_Details: {
        Leave_Type_ID: "",
        Status: "Pending",
        Level1_Approver_ID: "",
        Level2_Approver_ID: ""
      }
    };
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    isL1Approver = D.New_Leave_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    isL2Approver = D.New_Leave_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    canApprove = isL1Approver || isL2Approver || isHRAdmin;
    selectedLeaveBalance = D.Leave_Balance?.[D.New_Leave_Details?.Leave_Type_ID] ?? null;
    selectedLeaveBalance?.Leave_Balance ?? 0;
    Page_Mode === "View" && editId !== "Add" && D.New_Leave_Details?.Status === "Pending" && (D.Employee_Self_ID == user.Employee_Self_ID || isHRAdmin);
    $$renderer2.push(`<div class="flex items-center justify-between mb-4"><div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">`);
    if (Page_Mode !== "Add") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(["View", ...isHRAdmin || canApprove ? ["Edit"] : []]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let m = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`px-3 py-1.5 rounded-lg transition-colors ${stringify(Page_Mode === m ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700")}`)}>${escape_html(m)}</button>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="px-3 py-1.5 text-slate-600">New Leave Application</span>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (canApprove && Page_Mode !== "Add") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl border border-amber-200">${escape_html(isHRAdmin ? "HR Admin" : isL1Approver ? "L1 Approver" : "L2 Approver")}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { editId, initialMode, onSave });
  });
}
function Leave_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2">`);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "Pending", "In-Progress", "Approved", "Rejected"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ Apply Leave</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function OD_AddEdit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, isL1Approver, isL2Approver, canApprove;
    let editId = fallback($$props["editId"], "Add");
    let initialMode = fallback($$props["initialMode"], "View");
    let onSave = fallback($$props["onSave"], () => {
    });
    let Live_Data;
    let Page_Mode = editId === "Add" ? "Add" : initialMode;
    let D = {
      New_OD_Details: {
        Level1_Approver_ID: "",
        Level2_Approver_ID: ""
      }
    };
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    isL1Approver = D.New_OD_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    isL2Approver = D.New_OD_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    canApprove = isL1Approver || isL2Approver || isHRAdmin;
    $$renderer2.push(`<div class="flex items-center justify-between mb-4"><div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">`);
    if (Page_Mode !== "Add") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(["View", ...isHRAdmin || canApprove ? ["Edit"] : []]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let m = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`px-3 py-1.5 rounded-lg transition-colors ${stringify(Page_Mode === m ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700")}`)}>${escape_html(m)}</button>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="px-3 py-1.5 text-slate-600">New On Duty Request</span>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (canApprove && Page_Mode !== "Add") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl border border-amber-200">${escape_html(isHRAdmin ? "HR Admin" : isL1Approver ? "L1 Approver" : "L2 Approver")}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { editId, initialMode, onSave });
  });
}
function OD_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2">`);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "Pending", "In-Progress", "Approved", "Rejected"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ New OD Request</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function CompOff_AddEdit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, isL1Approver, isL2Approver, canApprove;
    let editId = fallback($$props["editId"], "Add");
    let initialMode = fallback($$props["initialMode"], "View");
    let onSave = fallback($$props["onSave"], () => {
    });
    let Live_Data;
    let Page_Mode = editId === "Add" ? "Add" : initialMode;
    let D = {
      New_CompOff_Details: {
        Level1_Approver_ID: "",
        Level2_Approver_ID: ""
      }
    };
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    isL1Approver = D.New_CompOff_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    isL2Approver = D.New_CompOff_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    canApprove = isL1Approver || isL2Approver || isHRAdmin;
    $$renderer2.push(`<div class="flex items-center justify-between mb-4"><div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">`);
    if (Page_Mode !== "Add") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(["View", ...isHRAdmin || canApprove ? ["Edit"] : []]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let m = each_array[$$index];
        $$renderer2.push(`<button${attr_class(`px-3 py-1.5 rounded-lg transition-colors ${stringify(Page_Mode === m ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700")}`)}>${escape_html(m)}</button>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="px-3 py-1.5 text-slate-600">New Comp Off Request</span>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (canApprove && Page_Mode !== "Add") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl border border-amber-200">${escape_html(isHRAdmin ? "HR Admin" : isL1Approver ? "L1 Approver" : "L2 Approver")}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { editId, initialMode, onSave });
  });
}
function CompOff_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2">`);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "Pending", "In-Progress", "Approved", "Rejected"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ Apply Comp Off</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Expense_AddEdit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, isL1Approver, isL2Approver, canApprove;
    let editId = fallback($$props["editId"], "Add");
    let initialMode = fallback($$props["initialMode"], "View");
    let onSave = fallback($$props["onSave"], () => {
    });
    let Live_Data;
    let Page_Mode = editId === "Add" ? "Add" : initialMode;
    let D = {
      New_Expense_Details: {
        Level1_Approver_ID: "",
        Level2_Approver_ID: ""
      }
    };
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    isL1Approver = D.New_Expense_Details?.Level1_Approver_ID == user.Employee_Self_ID;
    isL2Approver = D.New_Expense_Details?.Level2_Approver_ID == user.Employee_Self_ID;
    canApprove = isL1Approver || isL2Approver || isHRAdmin;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex items-center justify-between mb-4"><div class="flex gap-1 bg-slate-100 rounded-xl p-1 text-xs font-medium">`);
      if (Page_Mode !== "Add") {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["View", ...isHRAdmin || canApprove ? ["Edit"] : []]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let m = each_array[$$index];
          $$renderer3.push(`<button${attr_class(`px-3 py-1.5 rounded-lg transition-colors ${stringify(Page_Mode === m ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700")}`)}>${escape_html(m)}</button>`);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<span class="px-3 py-1.5 text-slate-600">New Expense Claim</span>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      if (canApprove && Page_Mode !== "Add") {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl border border-amber-200">${escape_html(isHRAdmin ? "HR Admin" : isL1Approver ? "L1 Approver" : "L2 Approver")}</span>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { editId, initialMode, onSave });
  });
}
function Expense_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2">`);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "Pending", "In-Progress", "Approved", "Rejected"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ New Expense Claim</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Payroll_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    let uploading = false;
    let downloading = false;
    let downloadMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => !filterMonth || r.Payroll_Description?.includes(filterMonth));
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2">`);
    if (
      // ── Download Attendance Data (Excel) ───────────────────────────────
      // Build start/end dates from month picker
      // ── Upload Final Payroll (Excel) ───────────────────────────────────
      isHRAdmin
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="relative flex-1 sm:flex-none sm:w-48"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search name or code…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <input type="month"${attr("value", filterMonth)} class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div> `);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2"><div class="flex flex-col sm:flex-row items-start sm:items-center gap-2"><p class="text-xs font-medium text-slate-600 shrink-0">Step 1: Download Attendance</p> <input type="month"${attr("value", downloadMonth)} class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-indigo-400"/> <button${attr("disabled", downloading, true)} class="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-medium rounded-lg hover:bg-[#16304f] disabled:opacity-50 whitespace-nowrap">${escape_html("⬇ Download Attendance Excel")}</button></div> <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t border-slate-200"><p class="text-xs font-medium text-slate-600 shrink-0">Step 2: Upload Final Payroll</p> <input type="file" accept=".xlsx,.xls" class="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white file:text-slate-700 file:shadow-sm"/> <button${attr("disabled", uploading, true)} class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">${escape_html("⬆ Upload Payroll Excel")}</button></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p class="text-xs text-slate-400">${escape_html(filtered.length)} payslip${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Onboarding_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    Live_Data.User_Information ?? {};
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2"><div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input${attr("value", searchQuery)} placeholder="Search employee…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "New", "In Progress", "Complete"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ New Onboarding</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Exit_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    Live_Data.User_Information ?? {};
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2"><div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input${attr("value", searchQuery)} placeholder="Search employee…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "New", "In Progress", "Complete"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ New Exit Entry</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function RFM_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterStatus = "All";
    let currentPage = 1;
    const PAGE_SIZE = 10;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    Live_Data.User_Information ?? {};
    filtered = records.filter((r) => !searchQuery);
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2"><div class="relative flex-1 sm:flex-none sm:w-52"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search dept / designation…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div> `);
    $$renderer2.select(
      {
        value: filterStatus,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "New", "Open", "Closed", "Cancelled"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ New RFM</button></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} record${escape_html(filtered.length !== 1 ? "s" : "")}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Holiday_List($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, filtered;
    let Live_Data;
    let records = [];
    let searchQuery = "";
    let filterType = "All";
    let filterYear = String((/* @__PURE__ */ new Date()).getFullYear());
    let currentPage = 1;
    const PAGE_SIZE = 15;
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isHRAdmin = user?.HRMS_Access === "HR Admin";
    filtered = records.filter((r) => {
      const matchesYear = !filterYear || r.Holiday_Date?.includes(filterYear);
      return matchesYear;
    });
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    {
      currentPage = 1;
    }
    filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    $$renderer2.push(`<div class="space-y-3 mb-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2"><div class="relative flex-1 sm:flex-none sm:w-48"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <input${attr("value", searchQuery)} placeholder="Search holiday…" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/></div> `);
    $$renderer2.select(
      {
        value: filterType,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["All", "Public", "Restricted", "Optional"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let t = each_array[$$index];
          $$renderer3.option({ value: t }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(t)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` `);
    $$renderer2.select(
      {
        value: filterYear,
        class: "border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like([
          String((/* @__PURE__ */ new Date()).getFullYear()),
          String((/* @__PURE__ */ new Date()).getFullYear() - 1),
          String((/* @__PURE__ */ new Date()).getFullYear() + 1)
        ]);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let y = each_array_1[$$index_1];
          $$renderer3.option({ value: y }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(y)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` `);
    if (isHRAdmin) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="sm:ml-auto px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] whitespace-nowrap">+ Add Holiday</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <p class="text-xs text-slate-400">${escape_html(filtered.length)} holiday${escape_html(filtered.length !== 1 ? "s" : "")} in ${escape_html(filterYear)}</p></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function AKS_HRMS_Navmenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let navGroups;
    let theme = $$props["theme"];
    let isHRAdmin = fallback($$props["isHRAdmin"], false);
    let openGroup = null;
    const ADMIN_NAV = [
      {
        group: "Overview",
        items: [
          {
            label: "Dashboard",
            type: "route",
            href: "/AKS_HRMS/HR_Admin_Dashboard"
          }
        ]
      },
      {
        group: "People",
        items: [
          {
            label: "Employees",
            type: "list",
            component: Employee_List,
            modalTitle: "Employees"
          },
          {
            label: "Onboarding",
            type: "list",
            component: Onboarding_List,
            modalTitle: "Onboarding"
          },
          {
            label: "Exit Management",
            type: "list",
            component: Exit_List,
            modalTitle: "Exit Management"
          }
        ]
      },
      {
        group: "Time & Attendance",
        items: [
          {
            label: "Attendance",
            type: "list",
            component: Attendance_List,
            modalTitle: "Attendance"
          },
          {
            label: "Leave",
            type: "list",
            component: Leave_List,
            modalTitle: "Leave Management"
          },
          {
            label: "On Duty (OD)",
            type: "list",
            component: OD_List,
            modalTitle: "On Duty"
          },
          {
            label: "Comp Off",
            type: "list",
            component: CompOff_List,
            modalTitle: "Comp Off"
          },
          {
            label: "Holiday Calendar",
            type: "list",
            component: Holiday_List,
            modalTitle: "Holiday Calendar"
          }
        ]
      },
      {
        group: "Finance",
        items: [
          {
            label: "Payroll",
            type: "list",
            component: Payroll_List,
            modalTitle: "Payroll"
          },
          {
            label: "Expenses",
            type: "list",
            component: Expense_List,
            modalTitle: "Expense Claims"
          }
        ]
      },
      {
        group: "Recruitment",
        items: [
          {
            label: "RFM",
            type: "list",
            component: RFM_List,
            modalTitle: "Recruitment"
          }
        ]
      },
      {
        group: "Performance",
        items: [
          { label: "KRA / KPI Masters", type: "route", href: "/KRA_KPI" },
          {
            label: "Add KRA / KPI",
            type: "route",
            href: "/KRA_KPI_Master_Add"
          },
          {
            label: "Performance Cycle",
            type: "route",
            href: "/KRA_KPI_Transaction"
          },
          {
            label: "Add Rating",
            type: "route",
            href: "/KRA_KPI_Trans_Add"
          },
          {
            label: "Printable PMS Report",
            type: "route",
            href: "/Project_Documents/PMS_Report"
          }
        ]
      },
      {
        group: "Corporate",
        items: [
          {
            label: "Corporate Hierarchy",
            type: "route",
            href: "/Corporate_Hierarchy"
          },
          {
            label: "Hierarchy Approval",
            type: "route",
            href: "/Corporate_Hierarchy_Approval"
          },
          {
            label: "All Corporate Employees",
            type: "route",
            href: "/Project_Reports/All_Corporate_Employee_Data"
          }
        ]
      },
      {
        group: "Performance Reports",
        items: [
          {
            label: "Corporate PMS Report",
            type: "route",
            href: "/Project_Reports/Corporate_PMS_Report"
          },
          {
            label: "PMS All Data",
            type: "route",
            href: "/Project_Reports/Corporate_PMS_Report_All_Data"
          },
          {
            label: "PMS by Department",
            type: "route",
            href: "/Project_Reports/Corporate_PMS_Report_Department_Wise"
          },
          {
            label: "Individual Performance",
            type: "route",
            href: "/Project_Reports/Individual_Performance"
          },
          {
            label: "PMS Graph",
            type: "route",
            href: "/Project_Reports/PMS_Graph_Report"
          },
          {
            label: "PMS Graph 2",
            type: "route",
            href: "/Project_Reports/PMS_Graph_Report_2"
          },
          {
            label: "Deviation Report",
            type: "route",
            href: "/Project_Reports/Deviation_Report"
          }
        ]
      },
      {
        group: "Access",
        items: [
          {
            label: "Module Access",
            type: "route",
            href: "/Project_Setup/Module_Access"
          },
          {
            label: "User Activity Logs",
            type: "route",
            href: "/Project_Setup/User_Activity_Logs"
          }
        ]
      }
    ];
    const USER_NAV = [
      {
        group: "My Workspace",
        items: [
          {
            label: "My Dashboard",
            type: "route",
            href: "/AKS_HRMS/User_Dashboard"
          }
        ]
      },
      {
        group: "Requests",
        items: [
          {
            label: "Apply Leave",
            type: "add",
            component: Leave_AddEdit,
            modalTitle: "Apply Leave"
          },
          {
            label: "On Duty (OD)",
            type: "add",
            component: OD_AddEdit,
            modalTitle: "On Duty Request"
          },
          {
            label: "Comp Off",
            type: "add",
            component: CompOff_AddEdit,
            modalTitle: "Comp Off Request"
          },
          {
            label: "Expenses",
            type: "add",
            component: Expense_AddEdit,
            modalTitle: "Expense Claim"
          }
        ]
      },
      {
        group: "My Records",
        items: [
          {
            label: "Attendance",
            type: "list",
            component: Attendance_List,
            modalTitle: "My Attendance"
          },
          {
            label: "My Leave Requests",
            type: "list",
            component: Leave_List,
            modalTitle: "My Leave Requests"
          },
          {
            label: "My OD Requests",
            type: "list",
            component: OD_List,
            modalTitle: "My OD Requests"
          },
          {
            label: "My Comp Off",
            type: "list",
            component: CompOff_List,
            modalTitle: "My Comp Off"
          },
          {
            label: "My Expenses",
            type: "list",
            component: Expense_List,
            modalTitle: "My Expenses"
          },
          {
            label: "Payslips",
            type: "list",
            component: Payroll_List,
            modalTitle: "My Payslips"
          }
        ]
      }
    ];
    navGroups = isHRAdmin ? ADMIN_NAV : USER_NAV;
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(navGroups);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let group = each_array[$$index_1];
      $$renderer2.push(`<div class="heading-group mt-3 first:mt-0 svelte-mqqoow"><button class="w-full flex items-center justify-between px-1 py-2 text-[14px] font-semibold rounded-lg transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/10 svelte-mqqoow"${attr_style(`color: ${stringify(theme.heading_text)}; background-color: ${stringify(openGroup === group.group ? theme.heading_active_bg + "25" : "transparent")};`)}><div class="flex items-center gap-1 min-h-[24px]"><span class="text-base opacity-30 flex-shrink-0">▸</span> <span class="font-semibold leading-tight break-words text-left block max-w-[170px]">${escape_html(group.group)}</span></div></button> `);
      if (openGroup === group.group) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="pl-3 mt-1 space-y-1 border-l-2"><!--[-->`);
        const each_array_1 = ensure_array_like(group.items);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let item = each_array_1[$$index];
          $$renderer2.push(`<button class="nav-link w-full text-left px-2 py-1.5 text-[13px] transition-all rounded-lg hover:bg-black/10 hover:pl-6 focus:outline-none focus:ring-1 focus:ring-black/10 svelte-mqqoow"${attr_style(`color: ${stringify(theme.sub_text)};`)}><span class="flex items-center gap-2">${escape_html(item.label)}</span></button>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { theme, isHRAdmin });
  });
}
function Navmenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isHRAdmin, hasAccess;
    const theme = Project_Theme_Settings.nav_menu;
    user = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage)?.User_Information ?? {};
    isHRAdmin = !user?.HRMS_Access || user.HRMS_Access === "HR Admin";
    hasAccess = user?.HRMS_Access !== "Blocked";
    if (hasAccess) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<nav class="flex flex-col py-4">`);
      AKS_HRMS_Navmenu($$renderer2, { theme, isHRAdmin });
      $$renderer2.push(`<!----></nav>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="px-4 py-6 text-xs text-gray-400">This account has no HRMS access.</p>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<aside id="sidebar"${attr_class(`flex-col h-screen top-0 border-r border-black/5 transition-all duration-300 shadow-2xl lg:shadow-none lg:overflow-hidden ${stringify(store_get($$store_subs ??= {}, "$isSidebarOpen", isSidebarOpen) ? "flex fixed lg:sticky z-50 lg:z-40 w-64 lg:w-1/4 xl:w-1/5 2xl:w-1/6" : "hidden lg:flex lg:sticky lg:w-0")}`)}${attr_style(`background-color: ${stringify(Project_Theme_Settings.sidebar_color)};`)}><div class="flex items-center justify-center py-8 px-6"><a href="/" class="transition-transform hover:scale-105 bg-white rounded"><img class="h-20 w-auto max-w-[150px]" style="object-fit: contain;"${attr("src", Project_Theme_Settings.client_logo)} alt="Client Logo"/></a></div> <div class="flex-grow overflow-y-auto custom-scrollbar px-4 svelte-6dohdz">`);
    Navmenu($$renderer2);
    $$renderer2.push(`<!----></div> <div class="p-4 mt-auto border-t border-black/5"><div class="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold"><img${attr("src", Project_Theme_Settings.AKS_Logo)} alt="AKS" class="h-6 w-auto bg-white rounded shadow-sm border border-gray-200 px-1.5 py-0.5 opacity-75 object-contain"/> <span>AKS HRMS</span></div></div></aside> `);
    if (store_get($$store_subs ??= {}, "$isSidebarOpen", isSidebarOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" role="presentation"></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Footer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<footer class="w-full border-t border-gray-200 py-3 mt-auto"${attr_style(`background-color: ${stringify(Project_Theme_Settings.header_color)};`)}><div class="container mx-auto px-4"><div class="flex flex-col md:flex-row items-center justify-between gap-2"><div class="text-center md:text-left"><p class="text-[10px] md:text-sm text-gray-500 font-medium leading-relaxed">Conceptualised &amp; Designed by <span class="text-cyan-700 font-bold">AIRA Kloud Suite</span> <span class="hidden sm:inline">|</span> <br class="sm:hidden"/> © 2021-${escape_html((/* @__PURE__ */ new Date()).getFullYear())} AIRA Consulting Pvt. Ltd. ®, Mumbai.</p></div> <div class="flex items-center space-x-4"><a href="/" class="text-[10px] md:text-sm font-semibold text-gray-500 hover:text-cyan-600 transition-colors">Live Tool</a> <span class="h-3 w-[1px] bg-gray-300"></span> <p class="text-[10px] md:text-sm text-gray-400 italic">v3.0.1-stable</p></div></div></div></footer>`);
  });
}
function Loader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_set(isLoaderOpen, false);
    if (store_get($$store_subs ??= {}, "$isLoaderOpen", isLoaderOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-500 inset-0 bg-black/60"><img${attr("src", Project_Theme_Settings.client_loader_icon)} alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse"/></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isAuthRoute;
    isAuthRoute = store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/auth");
    if (isAuthRoute) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<main class="w-full h-screen bg-gray-50"><!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]--></main>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$SessionStore", SessionStore).authenticated) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="relative min-h-screen md:flex">`);
        Sidebar($$renderer2);
        $$renderer2.push(`<!----> `);
        Loader($$renderer2);
        $$renderer2.push(`<!----> <div id="main-content" class="flex flex-col flex-1 min-w-0 h-screen bg-gray-50">`);
        Header($$renderer2);
        $$renderer2.push(`<!----> <main class="flex-grow py-3 md:py-2 md:px-3 overflow-y-auto overflow-x-hidden custom-scrollbar"><!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]--></main> `);
        Footer($$renderer2);
        $$renderer2.push(`<!----></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="w-full h-screen flex items-center justify-center bg-gray-100"><p class="text-gray-500 font-medium animate-pulse">Loading...</p></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <div class="toast-host svelte-12qhfyh">`);
    Toasts($$renderer2, {});
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
