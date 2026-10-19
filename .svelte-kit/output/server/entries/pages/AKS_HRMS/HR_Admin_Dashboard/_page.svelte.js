import { e as ensure_array_like, c as attr_class, g as stringify, a as attr, b as bind_props, s as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "@sveltejs/kit";
import { L as Live_Data_Storage } from "../../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "../../../../chunks/AKS_HRMS_Modal_Store.js";
import { Z as fallback } from "../../../../chunks/utils2.js";
import { h as html } from "../../../../chunks/Expense_AddEdit.svelte_svelte_type_style_lang.js";
import "xlsx-js-style";
function AKS_Calendar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let calendarGrid, eventsByDate, monthLabel;
    let events = fallback($$props["events"], () => [], true);
    let mode = fallback($$props["mode"], "user");
    let compact = fallback($$props["compact"], false);
    let today = /* @__PURE__ */ new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();
    const MONTH_NAMES = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const TYPE_DOT = {
      holiday: "bg-red-400",
      present: "bg-emerald-400",
      absent: "bg-rose-400",
      leave: "bg-amber-400",
      leave_pending: "bg-yellow-300 border border-yellow-400",
      od: "bg-sky-400",
      compoff: "bg-violet-400",
      weekend_worked: "bg-orange-400"
    };
    const TYPE_BG = {
      holiday: "bg-red-50",
      present: "bg-emerald-50",
      absent: "bg-rose-50",
      leave: "bg-amber-50",
      od: "bg-sky-50",
      compoff: "bg-violet-50"
    };
    function buildGrid(year, month) {
      const firstWeekday = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrev = new Date(year, month, 0).getDate();
      const days = [];
      for (let i = firstWeekday - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, daysInPrev - i),
          current: false
        });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        days.push({ date: new Date(year, month, d), current: true });
      }
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        days.push({ date: new Date(year, month + 1, d), current: false });
      }
      return days;
    }
    function indexEvents(evts) {
      const map = {};
      for (const evt of evts) {
        if (!map[evt.date]) map[evt.date] = [];
        map[evt.date].push(evt);
      }
      return map;
    }
    function toKey(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    function isToday(date) {
      return toKey(date) === toKey(today);
    }
    function isWeekend(date) {
      const d = date.getDay();
      return d === 0 || d === 6;
    }
    function getPrimaryType(evts) {
      if (!evts?.length) return null;
      const priority = ["absent", "leave", "od", "compoff", "present", "holiday"];
      for (const p of priority) {
        if (evts.find((e) => e.type === p)) return p;
      }
      return evts[0].type;
    }
    calendarGrid = buildGrid(currentYear, currentMonth);
    eventsByDate = indexEvents(events);
    monthLabel = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    $$renderer2.push(`<div class="bg-white rounded-2xl border border-slate-100 shadow-sm select-none"><div class="flex items-center justify-between px-4 pt-4 pb-3"><button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Previous month"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg></button> <div class="text-center"><p class="text-sm font-semibold text-slate-800">${escape_html(monthLabel)}</p> `);
    if (!compact) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="text-xs text-indigo-500 hover:text-indigo-700 mt-0.5 transition-colors">Today</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Next month"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg></button></div> <div class="grid grid-cols-7 px-3 pb-1"><!--[-->`);
    const each_array = ensure_array_like(DAY_HEADERS);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let d = each_array[i];
      $$renderer2.push(`<div${attr_class(`text-center text-[10px] font-semibold tracking-wide ${stringify(i === 0 || i === 6 ? "text-rose-400" : "text-slate-400")}`)}>${escape_html(d)}</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="grid grid-cols-7 gap-0.5 px-3 pb-3"><!--[-->`);
    const each_array_1 = ensure_array_like(calendarGrid);
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let day = each_array_1[$$index_2];
      const key = toKey(day.date);
      const dayEvts = eventsByDate[key] ?? [];
      const todayDay = isToday(day.date);
      const weekend = isWeekend(day.date);
      const primType = getPrimaryType(dayEvts);
      const cellBg = mode === "user" && primType && TYPE_BG[primType] ? TYPE_BG[primType] : "";
      $$renderer2.push(`<button${attr_class(` relative flex flex-col items-center ${stringify(compact ? "py-1" : "py-1.5")} rounded-xl transition-all group ${stringify(day.current ? "cursor-pointer hover:bg-slate-50" : "opacity-30 cursor-default")} ${stringify(todayDay ? "ring-2 ring-indigo-400 ring-offset-1" : "")} ${stringify(!todayDay && cellBg ? cellBg : "")} ${stringify(!todayDay && !cellBg && weekend && day.current ? "bg-slate-50/60" : "")} `)}><span${attr_class(` w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${stringify(todayDay ? "bg-indigo-500 text-white font-bold" : "")} ${stringify(!todayDay && weekend && day.current ? "text-rose-400" : "")} ${stringify(!todayDay && !weekend ? "text-slate-700" : "")} `)}>${escape_html(day.date.getDate())}</span> `);
      if (!compact && dayEvts.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex gap-0.5 mt-0.5 flex-wrap justify-center"><!--[-->`);
        const each_array_2 = ensure_array_like(dayEvts.slice(0, 3));
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let evt = each_array_2[$$index_1];
          $$renderer2.push(`<span${attr_class(`w-1.5 h-1.5 rounded-full ${stringify(TYPE_DOT[evt.type] ?? "bg-slate-400")}`)}${attr("title", evt.label)}></span>`);
        }
        $$renderer2.push(`<!--]--> `);
        if (dayEvts.length > 3) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="text-[9px] text-slate-400 leading-none">+${escape_html(dayEvts.length - 3)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (mode === "admin" && dayEvts.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-[9px] text-slate-500 leading-none mt-0.5">${escape_html(dayEvts.reduce((acc, e) => acc + (e.count ?? 1), 0))}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (!compact) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="px-4 pb-4 border-t border-slate-50 pt-3"><div class="flex flex-wrap gap-x-3 gap-y-1.5">`);
      if (mode === "user") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_3 = ensure_array_like([
          ["present", "Present"],
          ["absent", "Absent"],
          ["leave", "Leave"],
          ["leave_pending", "Pending"],
          ["od", "OD"],
          ["compoff", "CompOff"],
          ["holiday", "Holiday"]
        ]);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let [type, label] = each_array_3[$$index_3];
          $$renderer2.push(`<span class="flex items-center gap-1 text-[10px] text-slate-500"><span${attr_class(`w-2 h-2 rounded-full ${stringify(TYPE_DOT[type])}`)}></span> ${escape_html(label)}</span>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_4 = ensure_array_like([
          ["leave", "On Leave"],
          ["od", "On Duty"],
          ["holiday", "Holiday"]
        ]);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let [type, label] = each_array_4[$$index_4];
          $$renderer2.push(`<span class="flex items-center gap-1 text-[10px] text-slate-500"><span${attr_class(`w-2 h-2 rounded-full ${stringify(TYPE_DOT[type])}`)}></span> ${escape_html(label)}</span>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { events, mode, compact });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let user, filteredApprovals;
    let Live_Data;
    let stats = {
      total_employees: {
        value: "—",
        label: "Total Employees",
        trend: null,
        color: "blue"
      },
      present_today: {
        value: "—",
        label: "Present Today",
        trend: null,
        color: "green"
      },
      on_leave_today: {
        value: "—",
        label: "On Leave Today",
        trend: null,
        color: "amber"
      },
      pending_approvals: {
        value: "—",
        label: "Pending Approvals",
        trend: null,
        color: "red"
      }
    };
    let pendingApprovals = [];
    let calendarEvents = [];
    let activeFilter = "All";
    const MODULES = [
      {
        id: "employees",
        label: "Employees",
        description: "Manage profiles & records",
        icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
        bg: "bg-blue-50",
        accent: "text-blue-600",
        badge: null,
        popupKey: "Employee_List"
      },
      {
        id: "attendance",
        label: "Attendance",
        description: "Daily in/out & OT tracking",
        icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
        bg: "bg-emerald-50",
        accent: "text-emerald-600",
        badge: null,
        popupKey: "Attendance_List"
      },
      {
        id: "leave",
        label: "Leave",
        description: "Applications & balances",
        icon: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="17" y1="17" x2="22" y2="22"/><line x1="22" y1="17" x2="17" y2="22"/>`,
        bg: "bg-amber-50",
        accent: "text-amber-600",
        badge: null,
        popupKey: "Leave_List"
      },
      {
        id: "od",
        label: "On Duty",
        description: "OD requests & approvals",
        icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
        bg: "bg-sky-50",
        accent: "text-sky-600",
        badge: null,
        popupKey: "OD_List"
      },
      {
        id: "compoff",
        label: "Comp Off",
        description: "Compensatory offs",
        icon: `<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
        bg: "bg-violet-50",
        accent: "text-violet-600",
        badge: null,
        popupKey: "CompOff_List"
      },
      {
        id: "expense",
        label: "Expenses",
        description: "Claims & reimbursements",
        icon: `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>`,
        bg: "bg-orange-50",
        accent: "text-orange-600",
        badge: null,
        popupKey: "Expense_List"
      },
      {
        id: "payroll",
        label: "Payroll",
        description: "Salary processing & payslips",
        icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>`,
        bg: "bg-green-50",
        accent: "text-green-600",
        badge: null,
        popupKey: "Payroll_List"
      },
      {
        id: "onboarding",
        label: "Onboarding",
        description: "New hire journeys",
        icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>`,
        bg: "bg-teal-50",
        accent: "text-teal-600",
        badge: null,
        popupKey: "Onboarding_List"
      },
      {
        id: "exit",
        label: "Exit",
        description: "Offboarding & clearances",
        icon: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
        bg: "bg-rose-50",
        accent: "text-rose-600",
        badge: null,
        popupKey: "Exit_List"
      },
      {
        id: "rfm",
        label: "RFM",
        description: "Recruitment & feedback",
        icon: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
        bg: "bg-indigo-50",
        accent: "text-indigo-600",
        badge: null,
        popupKey: "RFM_List"
      },
      {
        id: "holidays",
        label: "Holidays",
        description: "Holiday calendar management",
        icon: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
        bg: "bg-pink-50",
        accent: "text-pink-600",
        badge: null,
        popupKey: "Holiday_List"
      },
      {
        label: "Settings",
        value: "",
        sub: "Master Data & Uploads",
        color: "slate",
        icon: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
        popupKey: "HRMS_Settings"
      }
    ];
    const STAT_COLORS = {
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-500",
        val: "text-blue-700"
      },
      green: {
        bg: "bg-emerald-50",
        icon: "text-emerald-500",
        val: "text-emerald-700"
      },
      amber: {
        bg: "bg-amber-50",
        icon: "text-amber-500",
        val: "text-amber-700"
      },
      red: {
        bg: "bg-rose-50",
        icon: "text-rose-500",
        val: "text-rose-700"
      }
    };
    const STAT_ICONS = {
      blue: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`,
      green: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
      amber: `<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/>`,
      red: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`
    };
    let approvalsPage = 1;
    const PAGE_SIZE = 8;
    const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    user = Live_Data.User_Information ?? {};
    filteredApprovals = pendingApprovals;
    Math.ceil(filteredApprovals.length / PAGE_SIZE);
    filteredApprovals.slice((approvalsPage - 1) * PAGE_SIZE, approvalsPage * PAGE_SIZE);
    $$renderer2.push(`<div class="px-4 sm:px-6 py-5 space-y-6 max-w-[1400px] mx-auto"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><h2 class="text-xl font-bold text-slate-800 tracking-tight">Good ${escape_html((/* @__PURE__ */ new Date()).getHours() < 12 ? "morning" : (/* @__PURE__ */ new Date()).getHours() < 17 ? "afternoon" : "evening")},
                ${escape_html(user?.Employee_Name?.split(" ")[0] ?? "Admin")} 👋</h2> <p class="text-sm text-slate-500 mt-0.5">${escape_html(todayStr)}</p></div> <div class="flex gap-2"><button class="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl hover:bg-[#16304f] transition-colors shadow-sm">+ Add Employee</button></div></div> <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"><!--[-->`);
    const each_array = ensure_array_like(Object.entries(stats));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [key, stat] = each_array[$$index];
      const colors = STAT_COLORS[stat.color];
      $$renderer2.push(`<div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3 group hover:shadow-md transition-shadow"><div${attr_class(`w-10 h-10 rounded-xl ${stringify(colors.bg)} flex items-center justify-center shrink-0`)}><svg${attr_class(`w-5 h-5 ${stringify(colors.icon)}`)} fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${html(STAT_ICONS[stat.color])}</svg></div> <div class="min-w-0"><p class="text-[11px] text-slate-500 leading-tight">${escape_html(stat.label)}</p> <p${attr_class(`text-2xl font-bold ${stringify(colors.val)} mt-0.5 leading-none`)}>${escape_html("—")}</p></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5"><div class="space-y-5"><div><h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Modules</h3> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"><!--[-->`);
    const each_array_1 = ensure_array_like(MODULES);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let mod = each_array_1[$$index_1];
      $$renderer2.push(`<button class="relative bg-white border border-slate-100 rounded-2xl p-4 text-left group hover:shadow-md hover:border-slate-200 transition-all duration-150 active:scale-[0.98]">`);
      if (mod.badge) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">${escape_html(mod.badge)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div${attr_class(`w-9 h-9 rounded-xl ${stringify(mod.bg)} flex items-center justify-center mb-3`)}><svg${attr_class(`w-4.5 h-4.5 ${stringify(mod.accent)}`)} fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${html(mod.icon)}</svg></div> <p class="text-sm font-semibold text-slate-800 leading-tight">${escape_html(mod.label)}</p> <p class="text-[11px] text-slate-400 mt-0.5 leading-tight hidden sm:block">${escape_html(mod.description)}</p></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><div class="px-5 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center gap-3"><div><h3 class="text-sm font-semibold text-slate-800">Pending Approvals</h3> <p class="text-xs text-slate-400 mt-0.5">${escape_html(filteredApprovals.length)} request${escape_html(filteredApprovals.length !== 1 ? "s" : "")} awaiting action</p></div> <div class="sm:ml-auto flex gap-1.5 flex-wrap"><!--[-->`);
    const each_array_2 = ensure_array_like(["All", "Leave", "OD", "CompOff"]);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let f = each_array_2[$$index_2];
      $$renderer2.push(`<button${attr_class(` px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stringify(activeFilter === f ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")} `)}>${escape_html(f)}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="space-y-4"><div><h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Calendar</h3> `);
    AKS_Calendar($$renderer2, { events: calendarEvents, mode: "admin" });
    $$renderer2.push(`<!----></div> <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3"><p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</p> <!--[-->`);
    const each_array_5 = ensure_array_like([
      {
        label: "Leaves Approved",
        value: "—",
        color: "bg-emerald-400"
      },
      {
        label: "Leaves Pending",
        value: stats.pending_approvals.value,
        color: "bg-amber-400"
      },
      { label: "OD Requests", value: "—", color: "bg-sky-400" },
      { label: "Expense Claims", value: "—", color: "bg-orange-400" }
    ]);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let item = each_array_5[$$index_5];
      $$renderer2.push(`<div class="flex items-center justify-between"><div class="flex items-center gap-2"><span${attr_class(`w-2 h-2 rounded-full ${stringify(item.color)}`)}></span> <span class="text-xs text-slate-600">${escape_html(item.label)}</span></div> <span class="text-sm font-semibold text-slate-800">${escape_html(item.value)}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><button class="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><svg class="w-4.5 h-4.5 text-indigo-600" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></div> <div class="text-left"><h3 class="text-sm font-semibold text-slate-800">Download Reports</h3> <p class="text-xs text-slate-400">10 standard HR reports — Employee, Attendance, Leave, Payroll, and more</p></div></div> <svg${attr_class(`w-4 h-4 text-slate-400 transition-transform ${stringify("")}`)} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button> `);
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
