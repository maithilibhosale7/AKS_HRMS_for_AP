import { s as store_get, c as attr_class, g as stringify, e as ensure_array_like, f as attr_style, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "@sveltejs/kit";
import { L as Live_Data_Storage } from "../../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "../../../../chunks/AKS_HRMS_Modal_Store.js";
import { h as html } from "../../../../chunks/Expense_AddEdit.svelte_svelte_type_style_lang.js";
import "xlsx-js-style";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, isManager, HRMS_Menu, greeting, firstName, attDisplay, filteredTeamApprovals;
    let Live_Data;
    let leaveBalances = [];
    let todayAttendance = null;
    let teamPendingApprovals = [];
    let teamFilter = "All";
    let teamPage = 1;
    const TEAM_PAGE_SIZE = 6;
    const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const ATT_STATUS = {
      Present: {
        label: "Present",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-400",
        icon: "✓"
      },
      Absent: {
        label: "Absent",
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-400",
        icon: "✕"
      },
      Leave: {
        label: "On Leave",
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-400",
        icon: "🌴"
      },
      OD: {
        label: "On Duty",
        bg: "bg-sky-50",
        text: "text-sky-700",
        dot: "bg-sky-400",
        icon: "📋"
      },
      Holiday: {
        label: "Holiday",
        bg: "bg-violet-50",
        text: "text-violet-700",
        dot: "bg-violet-400",
        icon: "🎉"
      },
      default: {
        label: "Not Marked",
        bg: "bg-slate-50",
        text: "text-slate-500",
        dot: "bg-slate-300",
        icon: "—"
      }
    };
    const QUICK_ACTIONS = [
      {
        id: "apply_leave",
        label: "Apply Leave",
        icon: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="17" y1="17" x2="22" y2="22"/><line x1="22" y1="17" x2="17" y2="22"/>`,
        bg: "bg-amber-50",
        accent: "text-amber-600",
        hoverBg: "hover:bg-amber-100",
        popupKey: "Leave_AddEdit",
        Module_Name: "Leave_List"
      },
      {
        id: "apply_od",
        label: "On Duty",
        icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
        bg: "bg-sky-50",
        accent: "text-sky-600",
        hoverBg: "hover:bg-sky-100",
        popupKey: "OD_AddEdit",
        Module_Name: "OD_List"
      },
      {
        id: "apply_compoff",
        label: "Comp Off",
        icon: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
        bg: "bg-violet-50",
        accent: "text-violet-600",
        hoverBg: "hover:bg-violet-100",
        popupKey: "CompOff_AddEdit",
        Module_Name: "CompOff_List"
      },
      {
        id: "submit_expense",
        label: "Expense",
        icon: `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>`,
        bg: "bg-orange-50",
        accent: "text-orange-600",
        hoverBg: "hover:bg-orange-100",
        popupKey: "Expense_AddEdit",
        Module_Name: "Expense_List"
      },
      {
        id: "view_attendance",
        label: "Attendance",
        icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
        bg: "bg-emerald-50",
        accent: "text-emerald-600",
        hoverBg: "hover:bg-emerald-100",
        popupKey: "Attendance_List"
      },
      {
        id: "view_payslips",
        label: "Payslips",
        icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>`,
        bg: "bg-green-50",
        accent: "text-green-600",
        hoverBg: "hover:bg-green-100",
        popupKey: "Payroll_List"
      }
    ];
    const BALANCE_COLORS = [
      {
        bar: "bg-amber-400",
        bg: "bg-amber-50",
        text: "text-amber-700"
      },
      { bar: "bg-sky-400", bg: "bg-sky-50", text: "text-sky-700" },
      {
        bar: "bg-emerald-400",
        bg: "bg-emerald-50",
        text: "text-emerald-700"
      },
      {
        bar: "bg-violet-400",
        bg: "bg-violet-50",
        text: "text-violet-700"
      },
      { bar: "bg-rose-400", bg: "bg-rose-50", text: "text-rose-700" },
      {
        bar: "bg-indigo-400",
        bg: "bg-indigo-50",
        text: "text-indigo-700"
      }
    ];
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    isManager = user.Is_Manager === 1;
    HRMS_Menu = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage)?.Module_Sections?.HRMS ?? { Modules: {} };
    greeting = (() => {
      const h = (/* @__PURE__ */ new Date()).getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    })();
    firstName = user.Employee_Name?.split(" ")[0] ?? "";
    attDisplay = ATT_STATUS[todayAttendance?.Status] ?? ATT_STATUS.default;
    filteredTeamApprovals = teamPendingApprovals;
    Math.ceil(filteredTeamApprovals.length / TEAM_PAGE_SIZE);
    filteredTeamApprovals.slice((teamPage - 1) * TEAM_PAGE_SIZE, teamPage * TEAM_PAGE_SIZE);
    $$renderer2.push(`<div class="px-4 sm:px-6 py-5 space-y-6 max-w-[1200px] mx-auto"><div class="bg-[#1E3A5F] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"><div class="flex-1"><p class="text-white/60 text-sm">${escape_html(
      // ── Leave balance colour palette ──────────────────────────────────
      // ── Data loading ──────────────────────────────────────────────────
      // ── Leave balances ─────────────────────────────────────────
      // ── Today's attendance ─────────────────────────────────────
      // Fetch holidays + personal attendance for current month
      // Holidays
      // Personal attendance
      // Reload attendance + holiday data for the navigated month
      // ── Quick action launcher ─────────────────────────────────────────
      /**
       * FIX (P0): Wire Review & Quick Approve buttons for team pending approvals.
       */
      // Determine which approval level this manager controls
      todayStr
    )}</p> <h2 class="text-xl sm:text-2xl font-bold text-white mt-0.5 tracking-tight">${escape_html(greeting)}, ${escape_html(firstName)} 👋</h2> `);
    if (user.Designation_Name) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-white/50 text-sm mt-1">${escape_html(user.Designation_Name)} `);
      if (user.Department_Name) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`· ${escape_html(user.Department_Name)}`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`shrink-0 ${stringify(attDisplay.bg)} rounded-xl px-4 py-3 min-w-[140px]`)}><p class="text-xs font-medium text-slate-500 mb-0.5">Today</p> <div class="flex items-center gap-2"><span${attr_class(`w-2.5 h-2.5 rounded-full ${stringify(attDisplay.dot)}`)}></span> <span${attr_class(`text-sm font-semibold ${stringify(attDisplay.text)}`)}>${escape_html(attDisplay.label)}</span></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (leaveBalances.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div><h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Leave Balances</h3> <div class="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible"><!--[-->`);
      const each_array = ensure_array_like(leaveBalances);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let lb = each_array[i];
        const colors = BALANCE_COLORS[i % BALANCE_COLORS.length];
        const usedPct = lb.Assigned > 0 ? Math.min(100, Math.round((lb.Used + lb.Pending) / lb.Assigned * 100)) : 0;
        $$renderer2.push(`<div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-[160px] sm:min-w-0 shrink-0 sm:shrink"><p class="text-xs text-slate-500 truncate mb-2 font-medium">${escape_html(lb.Leave_Type_Name)}</p> <div class="h-1.5 bg-slate-100 rounded-full mb-2 overflow-hidden"><div${attr_class(`${stringify(colors.bar)} h-full rounded-full transition-all duration-500`)}${attr_style(`width: ${stringify(usedPct)}%`)}></div></div> <div class="flex justify-between items-end"><div><span class="text-xl font-bold text-slate-800">${escape_html(lb.Balance)}</span> <span class="text-xs text-slate-400">/${escape_html(lb.Assigned)}</span></div> `);
        if (lb.Pending > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">${escape_html(lb.Pending)} pending</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <p class="text-[10px] text-slate-400 mt-0.5">${escape_html(lb.Used)} used</p></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <div class="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5"><div><h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">My Calendar</h3> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center py-16"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="space-y-5"><div><h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3> <div class="grid grid-cols-3 lg:grid-cols-2 gap-2"><!--[-->`);
    const each_array_1 = ensure_array_like(QUICK_ACTIONS);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let action = each_array_1[$$index_1];
      if (HRMS_Menu?.Modules?.[action.popupKey] || HRMS_Menu?.Modules?.[action.Module_Name]) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button${attr_class(` bg-white border border-slate-100 rounded-2xl p-3 text-center group hover:shadow-md hover:border-slate-200 transition-all duration-150 active:scale-[0.97] ${stringify(action.hoverBg)} `)}><div${attr_class(`w-9 h-9 rounded-xl ${stringify(action.bg)} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`)}><svg${attr_class(`w-4.5 h-4.5 ${stringify(action.accent)}`)} fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${html(action.icon)}</svg></div> <p class="text-xs font-semibold text-slate-700 leading-tight">${escape_html(action.label)}</p></button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"><div class="px-4 py-3 border-b border-slate-50"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</p></div> <div class="divide-y divide-slate-50">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(Array(3));
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        each_array_2[$$index_2];
        $$renderer2.push(`<div class="px-4 py-3 animate-pulse flex gap-3"><div class="w-2 h-2 rounded-full bg-slate-200 mt-1.5"></div> <div class="flex-1"><div class="h-3 bg-slate-200 rounded w-3/4 mb-1.5"></div> <div class="h-2.5 bg-slate-100 rounded w-1/2"></div></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div> `);
    if (isManager) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><div class="px-5 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center gap-3"><div><div class="flex items-center gap-2"><h3 class="text-sm font-semibold text-slate-800">Team Pending Approvals</h3> `);
      if (teamPendingApprovals.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">${escape_html(teamPendingApprovals.length)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <p class="text-xs text-slate-400 mt-0.5">Requests from your direct reportees</p></div> <div class="sm:ml-auto flex gap-1.5"><!--[-->`);
      const each_array_3 = ensure_array_like(["All", "Leave", "OD", "CompOff"]);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let f = each_array_3[$$index_3];
        $$renderer2.push(`<button${attr_class(` px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stringify(teamFilter === f ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")} `)}>${escape_html(f)}</button>`);
      }
      $$renderer2.push(`<!--]--></div></div> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex items-center justify-center py-10"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><button class="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><svg class="w-4.5 h-4.5 text-indigo-600" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div> <div class="text-left"><h3 class="text-sm font-semibold text-slate-800">My Reports</h3> <p class="text-xs text-slate-400">Download your attendance, leave, expenses, and more</p></div></div> <svg${attr_class(`w-4 h-4 text-slate-400 transition-transform ${stringify("")}`)} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
