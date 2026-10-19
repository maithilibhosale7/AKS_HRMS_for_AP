import { s as store_get, e as ensure_array_like, a as attr, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { A as AutoResizeTextArea } from "../../../../chunks/AutoResizeTextArea.js";
import { L as Live_Data_Storage } from "../../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let finalRemarks = "";
    let kraList = [];
    let processingYear = "";
    function getAverageRating(H1_Rating, H2_Rating) {
      if (H1_Rating == 0 || H2_Rating == 0) {
        return H1_Rating + H2_Rating;
      } else {
        return Math.round((H1_Rating + H2_Rating) / 2 * 4) / 4;
      }
    }
    function calculateRatings(kraList2) {
      let h1Sum = 0, h1TotalWeight = 0;
      let h2Sum = 0, h2TotalWeight = 0;
      let finalSum = 0, finalTotalWeight = 0;
      for (const kra of kraList2) {
        for (const kpi of kra.kpis) {
          const weight = Number(kpi.weightage);
          const target = Number(kpi.target);
          const ratingType = kpi.ratingType;
          const isPercentage = ratingType.toLowerCase().includes("percent") || ratingType.toLowerCase().includes("value");
          let h1Ratings = [kpi.H1_employee_actual, kpi.H1_manager_actual].map((val) => val === "" || val === null ? null : Number(val)).filter((val) => typeof val === "number" && !isNaN(val));
          if (h1Ratings.length > 0) {
            let h1Avg = h1Ratings.reduce((a, b) => a + b, 0) / h1Ratings.length;
            if (isPercentage && target > 0) {
              h1Avg = convertTo5PointScale(h1Avg, target);
            }
            h1Sum += h1Avg * weight;
            h1TotalWeight += weight;
          }
          let h2Ratings = [kpi.H2_employee_actual, kpi.H2_manager_actual].map((val) => val === "" || val === null ? null : Number(val)).filter((val) => typeof val === "number" && !isNaN(val));
          if (h2Ratings.length > 0) {
            let h2Avg = h2Ratings.reduce((a, b) => a + b, 0) / h2Ratings.length;
            if (isPercentage && target > 0) {
              h2Avg = convertTo5PointScale(h2Avg, target);
            }
            h2Sum += h2Avg * weight;
            h2TotalWeight += weight;
          }
          let final = null;
          if (kpi.HR_actual !== "" && kpi.HR_actual !== null && !isNaN(Number(kpi.HR_actual))) {
            final = Number(kpi.HR_actual);
            if (isPercentage && target > 0) {
              final = convertTo5PointScale(final, target);
            }
          } else {
            let allRatings = [
              kpi.H1_employee_actual,
              kpi.H1_manager_actual,
              kpi.H2_employee_actual,
              kpi.H2_manager_actual
            ].map((val) => val === "" || val === null ? null : Number(val)).filter((val) => typeof val === "number" && !isNaN(val));
            if (allRatings.length > 0) {
              final = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
              if (isPercentage && target > 0) {
                final = convertTo5PointScale(final, target);
              }
            }
          }
          if (final !== null) {
            finalSum += final * weight;
            finalTotalWeight += weight;
          }
        }
      }
      const h1Rating = h1TotalWeight > 0 ? (h1Sum / h1TotalWeight).toFixed(2) : "N/A";
      const h2Rating = h2TotalWeight > 0 ? (h2Sum / h2TotalWeight).toFixed(2) : "N/A";
      const finalRating = finalTotalWeight > 0 ? (finalSum / finalTotalWeight).toFixed(2) : "N/A";
      console.log(h1Rating, h2Rating, finalRating);
      return { h1Rating, h2Rating, finalRating };
    }
    function convertTo5PointScale(actual, target) {
      const percentage = actual / target * 100;
      if (percentage < 25) return 1;
      if (percentage < 50) return 2;
      if (percentage < 75) return 3;
      if (percentage < 100) return 4;
      return 5;
    }
    {
      store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    }
    if (kraList.length) {
      calculateRatings(kraList);
    }
    $$renderer2.push(`<div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60"><div class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse flex items-center justify-center">Loading...</div></div></div>  <div class="print-content svelte-1j59nbv"><div class="w-full p-6 bg-white shadow rounded-lg space-y-6 svelte-1j59nbv"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 no-print svelte-1j59nbv"><div class="svelte-1j59nbv"><h1 class="text-2xl font-bold text-gray-800 svelte-1j59nbv">Performance Management System - Year 2025-2026</h1></div> <div class="flex items-center gap-2 svelte-1j59nbv"><button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors svelte-1j59nbv"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 svelte-1j59nbv" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" class="svelte-1j59nbv"></path></svg> Print</button> <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors svelte-1j59nbv"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 svelte-1j59nbv" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" class="svelte-1j59nbv"></path></svg> Cancel</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm svelte-1j59nbv"><div class="flex items-center justify-between svelte-1j59nbv"><div class="text-sm font-medium text-gray-700 svelte-1j59nbv">PMS Period</div> <div class="flex items-center gap-2 svelte-1j59nbv"><span class="text-sm text-gray-500 svelte-1j59nbv">${escape_html(processingYear)}</span></div></div></div> <div class="w-full space-y-6 svelte-1j59nbv"><!--[-->`);
    const each_array = ensure_array_like(kraList);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let kra = each_array[i];
      $$renderer2.push(`<div class="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm svelte-1j59nbv"><h4 class="text-xl font-bold text-blue-700 mb-2 svelte-1j59nbv">KRA ${escape_html(i + 1)}: ${escape_html(kra.name)}</h4> <div class="w-full overflow-x-auto svelte-1j59nbv"><div class="min-w-[1200px] svelte-1j59nbv"><table class="w-full text-sm text-left text-gray-700 border svelte-1j59nbv"><thead class="bg-gray-200 text-gray-900 svelte-1j59nbv"><tr class="svelte-1j59nbv"><th class="min-w-[200px] px-3 py-2 border svelte-1j59nbv">KPI</th><th class="min-w-[25px] px-3 py-2 border svelte-1j59nbv">Weightage (%)</th><th class="px-3 py-2 border svelte-1j59nbv" colspan="5">Rating Data</th></tr></thead><tbody class="svelte-1j59nbv"><!--[-->`);
      const each_array_1 = ensure_array_like(kra.kpis);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let kpi = each_array_1[$$index];
        $$renderer2.push(`<tr class="bg-white hover:bg-gray-100 svelte-1j59nbv"><td class="min-w-[200px] px-3 py-2 border svelte-1j59nbv" rowspan="3">${escape_html(kpi.name)}</td><td class="min-w-[25px] px-3 py-2 border svelte-1j59nbv" rowspan="3">${escape_html(kpi.weightage)}</td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">APPRAISAL PERIOD: APR-SEP CYCLE</td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Self Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", kpi.H1_employee_actual)} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[100px] px-3 py-2 border svelte-1j59nbv">Self Remarks: `);
        AutoResizeTextArea($$renderer2, {
          id: kpi.key,
          name: kpi.key,
          value: kpi.H1_employee_remarks,
          placeholder: "Enter value here",
          className: "min-h-[50px]",
          disabled: true
        });
        $$renderer2.push(`<!----></td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Manager Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", kpi.H1_manager_actual)} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[100px] px-3 py-2 border svelte-1j59nbv">Manager Remarks: `);
        AutoResizeTextArea($$renderer2, {
          id: kpi.key,
          name: kpi.key,
          value: kpi.H1_manager_remarks,
          placeholder: "Enter value here",
          className: "min-h-[50px]",
          disabled: true
        });
        $$renderer2.push(`<!----></td></tr> <tr class="bg-white hover:bg-gray-100 svelte-1j59nbv"><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">APPRAISAL PERIOD: OCT-MAR CYCLE</td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Self Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", kpi.H2_employee_actual)} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[100px] px-3 py-2 border svelte-1j59nbv">Self Remarks: `);
        AutoResizeTextArea($$renderer2, {
          id: kpi.key,
          name: kpi.key,
          value: kpi.H2_employee_remarks,
          placeholder: "Enter value here",
          className: "min-h-[50px]",
          disabled: true
        });
        $$renderer2.push(`<!----></td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Manager Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", kpi.H2_manager_actual)} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[100px] px-3 py-2 border svelte-1j59nbv">Manager Remarks: `);
        AutoResizeTextArea($$renderer2, {
          id: kpi.key,
          name: kpi.key,
          value: kpi.H2_manager_remarks,
          placeholder: "Enter value here",
          className: "min-h-[50px]",
          disabled: true
        });
        $$renderer2.push(`<!----></td></tr> <tr class="bg-white hover:bg-gray-100 svelte-1j59nbv"><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">APPRAISAL PERIOD: APR-MAR CYCLE</td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Average Self Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Average Manager Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[50px] px-3 py-2 border svelte-1j59nbv">Final Manager Rating: <input type="number" min="1" max="5" step="0.25"${attr("value", kpi.HR_actual)} class="w-full accent-green-500 svelte-1j59nbv"${attr("disabled", true, true)}/></td><td class="min-w-[100px] px-3 py-2 border svelte-1j59nbv">Final Manager Remarks: `);
        AutoResizeTextArea($$renderer2, {
          id: kpi.key,
          name: kpi.key,
          value: kpi.HR_remarks,
          placeholder: "Enter value here",
          className: "min-h-[50px]",
          disabled: true
        });
        $$renderer2.push(`<!----></td></tr>`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="bg-gray-100 p-4 rounded-lg border border-gray-300 mt-6 svelte-1j59nbv">`);
    AutoResizeTextArea($$renderer2, {
      id: "finalRemarks",
      name: "finalRemarks",
      value: finalRemarks,
      label: "Final Remarks",
      placeholder: "Enter any concluding remarks here...",
      className: "border border-gray-300 p-2 rounded-md",
      disabled: true
    });
    $$renderer2.push(`<!----></div></div></div> `);
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
