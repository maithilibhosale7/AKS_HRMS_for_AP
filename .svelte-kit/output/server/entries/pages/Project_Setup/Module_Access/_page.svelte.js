import { s as store_get, l as head, e as ensure_array_like, f as attr_style, c as attr_class, d as clsx, u as unsubscribe_stores, g as stringify } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
/* empty css                                                      */
import "@sveltejs/kit";
import { L as Live_Data_Storage } from "../../../../chunks/Live_Data_Storage.js";
import { P as Project_Theme_Settings } from "../../../../chunks/Project_Theme_Settings.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let existing_headings, existing_sub_headings;
    const BRAND_PRIMARY = Project_Theme_Settings.nav_menu.heading_icon;
    const BRAND_PRIMARY_TEXT = Project_Theme_Settings.modal.buttons.select.text_color;
    const TAB_ACTIVE_BG = Project_Theme_Settings.nav_menu.main_bg;
    let Employee_Details = {};
    let Dashboards_for_User = [];
    let Reports_for_User = [];
    let employeeSearch = "";
    let selectedEmployeeName = "Select employee";
    {
      store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    }
    Object.entries(Employee_Details || {}).filter(([, name]) => name && name.toLowerCase().includes(employeeSearch.toLowerCase()));
    existing_headings = [
      ...new Set((Reports_for_User || []).map((r) => r.menu_heading).filter(Boolean))
    ];
    existing_sub_headings = [
      ...new Set((Reports_for_User || []).map((r) => r.menu_sub_heading).filter(Boolean))
    ];
    (() => {
      const categorized = {};
      const uncategorized = [];
      for (let i = 0; i < (Reports_for_User || []).length; i++) {
        const r = Reports_for_User[i];
        if (r.Access != 1) continue;
        const h = r.menu_heading || "";
        const sh = r.menu_sub_heading || "";
        if (!h) {
          uncategorized.push({ report: r, index: i });
        } else {
          if (!categorized[h]) categorized[h] = { heading_index: r.menu_heading_index || 999, subs: {} };
          else categorized[h].heading_index = Math.min(categorized[h].heading_index, r.menu_heading_index || 999);
          if (!categorized[h].subs[sh]) categorized[h].subs[sh] = { min_index: r.menu_sub_heading_index || 999, reports: [] };
          else categorized[h].subs[sh].min_index = Math.min(categorized[h].subs[sh].min_index, r.menu_sub_heading_index || 999);
          categorized[h].subs[sh].reports.push({ report: r, index: i });
        }
      }
      const sorted = Object.entries(categorized).sort((a, b) => a[1].heading_index - b[1].heading_index).map(([h, hdata]) => ({
        heading: h,
        heading_index: hdata.heading_index,
        subs: Object.entries(hdata.subs).sort((a, b) => a[1].min_index - b[1].min_index).map(([sh, shdata]) => ({
          sub_heading: sh,
          min_index: shdata.min_index,
          reports: [...shdata.reports].sort((a, b) => (a.report.menu_sub_heading_index || 999) - (b.report.menu_sub_heading_index || 999))
        }))
      }));
      return { sorted, uncategorized };
    })();
    [...Dashboards_for_User || []].filter((d) => d.Access == 1 && d.Status === "Published").sort((a, b) => (a.Display_Order || 999) - (b.Display_Order || 999));
    head("1tegau8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Module Access | Project Setup</title>`);
      });
    });
    $$renderer2.push(`<datalist id="heading-suggestions"><!--[-->`);
    const each_array = ensure_array_like(existing_headings);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let h = each_array[$$index];
      $$renderer2.option({ value: h }, ($$renderer3) => {
      });
    }
    $$renderer2.push(`<!--]--></datalist> <datalist id="sub-heading-suggestions"><!--[-->`);
    const each_array_1 = ensure_array_like(existing_sub_headings);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let s = each_array_1[$$index_1];
      $$renderer2.option({ value: s }, ($$renderer3) => {
      });
    }
    $$renderer2.push(`<!--]--></datalist> <div class="module-access-page svelte-1tegau8"${attr_style(`--brand-primary: ${stringify(BRAND_PRIMARY)}; --brand-primary-text: ${stringify(BRAND_PRIMARY_TEXT)}; --tab-active-bg: ${stringify(TAB_ACTIVE_BG)};`)}><form method="post"><div class="block lg:flex items-start lg:justify-between mt-2 xl:my-4 gap-4 svelte-1tegau8"><div class="block lg:flex shrink-0 svelte-1tegau8"><h2 class="font-semibold leading-7 text-gray-900 mb-4 sm:truncate text-lg xl:text-xl 2xl:text-2xl sm:tracking-tight lg:mb-0 mr-4 capitalize">Module Access</h2></div> <div class="flex-1 min-w-0 svelte-1tegau8"><div class="flex flex-col lg:flex-row gap-2 items-stretch svelte-1tegau8"><div class="relative lg:w-[320px] shrink-0 svelte-1tegau8"><div class="bg-white border border-gray-300 rounded-lg p-2.5 text-sm shadow-sm cursor-pointer flex justify-between items-center hover:brand-border svelte-1tegau8"><span${attr_class(clsx("text-gray-400"))}>${escape_html(selectedEmployeeName)}</span> <span class="text-gray-500">▾</span></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="flex shrink-0 space-x-2 sm:space-x-3 mb-8 lg:mb-0 mt-2 lg:mt-0 svelte-1tegau8"><input type="submit" class="btn-brand rounded-lg border border-transparent px-3 lg:px-6 py-2 text-md font-semibold shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer svelte-1tegau8" value="Save"/> <a href="/" class="rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center flex items-center">Cancel</a></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></form></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
