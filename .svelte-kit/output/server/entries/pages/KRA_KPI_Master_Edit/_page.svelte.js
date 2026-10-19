import { s as store_get, u as unsubscribe_stores, a as attr, e as ensure_array_like, c as attr_class } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { A as AutoResizeTextArea } from "../../../chunks/AutoResizeTextArea.js";
import { L as Live_Data_Storage } from "../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let h1Total, h2Total, isInProgress;
    let selectedEmployee = "";
    let kraList = [];
    let processingYear = "";
    let recordStatus = "";
    {
      store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    }
    kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.weightage || 0), 0), 0);
    h1Total = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.h1_weightage || 0), 0), 0);
    h2Total = kraList.reduce((total, kra) => total + kra.kpis.reduce((sum, kpi) => sum + Number(kpi.h2_weightage || 0), 0), 0);
    isInProgress = recordStatus === "In-Progress";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4"><div><h1 class="text-xl font-semibold text-gray-800">KRA KPI : Edit Page</h1></div> <div class="flex items-center gap-2"><button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"${attr("disabled", h1Total !== 100 || h2Total !== 100 || !selectedEmployee, true)}><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Update</button> <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg> Cancel</button></div></div> <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm"><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">${escape_html(selectedEmployee)}</label></div> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></div> <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm"><div class="flex items-center justify-between"><div class="text-sm font-medium text-gray-700">PMS Period</div> <div class="flex items-center gap-2"><span class="text-sm text-gray-500">${escape_html(processingYear)}</span></div></div></div> <div class="space-y-3"><div class="flex justify-between items-center mb-2"><h2 class="text-md font-medium text-gray-800">KRA</h2> <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg> Add KRA</button></div> <!--[-->`);
      const each_array = ensure_array_like(kraList);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let kra = each_array[i];
        $$renderer3.push(`<div class="bg-white rounded-lg border border-gray-200 shadow-sm"><div class="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3"><div class="lg:col-span-1"><label class="block text-s font-medium text-gray-700 mb-1">KRA NAME</label> `);
        AutoResizeTextArea($$renderer3, {
          placeholder: "Strategic objective...",
          className: "min-h-[50px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm",
          get value() {
            return kraList[i].name;
          },
          set value($$value) {
            kraList[i].name = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div>  <div class="lg:col-span-3"><div class="flex items-center mb-1 space-x-2 text-s"><div class="w-2/5 font-medium text-gray-700">KPI DESCRIPTION</div> <div class="w-1/12 text-gray-500 uppercase">H1 WEIGHT</div> <div class="w-1/12 text-gray-500 uppercase">H2 WEIGHT</div> <div class="w-1/6 text-gray-500 uppercase">TYPE</div> <div class="w-1/6 text-gray-500 uppercase">TARGET</div> <div class="w-1/4 text-gray-500 uppercase">DATA SOURCE</div> <div class="w-12 flex justify-end"><button class="text-indigo-600 hover:text-indigo-800 font-medium"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg></button></div></div> <div class="space-y-1"><!--[-->`);
        const each_array_1 = ensure_array_like(kra.kpis);
        for (let j = 0, $$length2 = each_array_1.length; j < $$length2; j++) {
          let kpi = each_array_1[j];
          $$renderer3.push(`<div class="flex items-center space-x-2"><div class="w-2/5">`);
          AutoResizeTextArea($$renderer3, {
            placeholder: "Enter KPI",
            className: "min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm",
            get value() {
              return kraList[i].kpis[j].name;
            },
            set value($$value) {
              kraList[i].kpis[j].name = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></div> <div class="w-1/12"><input type="number" min="0" max="100"${attr("value", kpi.h1_weightage)} placeholder="H1 Weightage"${attr("disabled", isInProgress && !!kpi.kpi_id, true)} class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"/></div> <div class="w-1/12"><input type="number" min="0" max="100"${attr("value", kpi.h2_weightage)} placeholder="H2 Weightage" class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"/></div> <div class="w-1/6">`);
          $$renderer3.select(
            {
              value: kpi.ratingType,
              class: "min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            },
            ($$renderer4) => {
              $$renderer4.option({ value: "" }, ($$renderer5) => {
                $$renderer5.push(`Select`);
              });
              $$renderer4.option({}, ($$renderer5) => {
                $$renderer5.push(`1-5 Scale`);
              });
              $$renderer4.option({}, ($$renderer5) => {
                $$renderer5.push(`Percentage`);
              });
              $$renderer4.option({}, ($$renderer5) => {
                $$renderer5.push(`Value`);
              });
            }
          );
          $$renderer3.push(`</div> <div class="w-1/6">`);
          if (kpi.ratingType === "Percentage") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="number" step="0.01"${attr("value", kpi.target)} placeholder="0-100%" class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"/>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "1-5 Scale") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<input type="number" min="1" max="5"${attr("value", kpi.target)} placeholder="1-5" class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"/>`);
            } else {
              $$renderer3.push("<!--[!-->");
              $$renderer3.push(`<input type="text"${attr("value", kpi.target)} placeholder="Target" class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"/>`);
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div> <div class="w-1/4"><input type="text"${attr("value", kpi.dataSource)} placeholder="Data source" class="min-h-[30px] w-full border border-gray-300 rounded-md px-2 py-1 text-sm"/></div> <div class="w-12 flex justify-center">`);
          if (!isInProgress || !kpi.kpi_id) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<button class="text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></button>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]--></div></div></div> <div class="bg-gray-50 px-3 py-1 flex justify-end border-t border-gray-200">`);
        if (!isInProgress || !kra.kra_id) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button class="text-red-600 hover:text-red-800 text-s font-medium flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> Remove KRA</button>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="mt-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-sm font-medium text-gray-700">H1 Total:</span> <span${attr_class(`text-lg font-semibold ${h1Total === 100 ? "text-green-600" : "text-red-600"}`)}>${escape_html(h1Total)}%</span> <span class="text-sm font-medium text-gray-700">H2 Total:</span> <span${attr_class(`text-lg font-semibold ${h2Total === 100 ? "text-green-600" : "text-red-600"}`)}>${escape_html(h2Total)}%</span></div></div> `);
      if (h1Total !== 100 || h2Total !== 100) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="flex items-center gap-1 text-red-600 text-sm"><span>`);
        if (h1Total !== 100) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`H1 must reach 100% (currently ${escape_html(h1Total)}%).`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (h2Total !== 100) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`H2 must reach 100% (currently ${escape_html(h2Total)}%).`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></span></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex items-center gap-1 text-green-600 text-sm"><span>H1 &amp; H2 weightage balanced ✓</span></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      {
        $$renderer3.push("<!--[!-->");
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
  });
}
export {
  _page as default
};
