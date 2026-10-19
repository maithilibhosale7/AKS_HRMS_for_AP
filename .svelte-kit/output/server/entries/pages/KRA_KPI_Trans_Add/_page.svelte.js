import { s as store_get, u as unsubscribe_stores, e as ensure_array_like, a as attr } from "../../../chunks/index2.js";
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
          const h1Weight = Number(kpi.h1_weightage || 0);
          const h2Weight = Number(kpi.h2_weightage || 0);
          const finalWeight = h1Weight + h2Weight;
          const target = Number(kpi.target);
          const ratingType = kpi.ratingType;
          const isPercentage = ratingType.toLowerCase().includes("percent") || ratingType.toLowerCase().includes("value");
          let h1Ratings = [kpi.H1_employee_actual, kpi.H1_manager_actual].map((val) => val === "" || val === null ? null : Number(val)).filter((val) => typeof val === "number" && !isNaN(val));
          if (h1Ratings.length > 0) {
            let h1Avg = h1Ratings.reduce((a, b) => a + b, 0) / h1Ratings.length;
            if (isPercentage && target > 0) {
              h1Avg = convertTo5PointScale(h1Avg, target);
            }
            h1Sum += h1Avg * h1Weight;
            h1TotalWeight += h1Weight;
          }
          let h2Ratings = [kpi.H2_employee_actual, kpi.H2_manager_actual].map((val) => val === "" || val === null ? null : Number(val)).filter((val) => typeof val === "number" && !isNaN(val));
          if (h2Ratings.length > 0) {
            let h2Avg = h2Ratings.reduce((a, b) => a + b, 0) / h2Ratings.length;
            if (isPercentage && target > 0) {
              h2Avg = convertTo5PointScale(h2Avg, target);
            }
            h2Sum += h2Avg * h2Weight;
            h2TotalWeight += h2Weight;
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
            finalSum += final * finalWeight;
            finalTotalWeight += finalWeight;
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
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="w-full p-6 bg-white shadow rounded-lg space-y-6"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4"><div><h1 class="text-2xl font-bold text-gray-800">Performance Management System - Year 2025-2026</h1></div> <div class="flex items-center gap-2"><button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Submit</button> <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg> Cancel</button></div></div> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm"><div class="flex items-center justify-between"><div class="text-sm font-medium text-gray-700">PMS Period</div> <div class="flex items-center gap-2"><span class="text-sm text-gray-500">${escape_html(processingYear)}</span></div></div></div> <div class="w-full space-y-6"><!--[-->`);
      const each_array = ensure_array_like(kraList);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let kra = each_array[i];
        $$renderer3.push(`<div class="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm"><h4 class="text-xl font-bold text-blue-700 mb-2">KRA ${escape_html(i + 1)}: ${escape_html(kra.name)}</h4> <div class="w-full overflow-x-auto"><div class="min-w-[1200px]"><table class="w-full text-sm text-left text-gray-700 border"><thead class="bg-gray-200 text-gray-900"><tr><th class="min-w-[250px]"></th><th class="min-w-[100px]"></th><th class="min-w-[700px] text-center px-3 py-2 border" colspan="4">APPRAISAL PERIOD: APR-SEP CYCLE</th><th class="min-w-[700px] text-center px-3 py-2 border" colspan="4">APPRAISAL PERIOD: OCT-MAR CYCLE</th><th class="min-w-[350px] text-center px-3 py-2 border" colspan="4">APPRAISAL PERIOD: APR-MAR CYCLE</th></tr><tr><th class="min-w-[250px] px-3 py-2 border">KPI</th><th class="min-w-[100px] px-3 py-2 border">Weightage (%)</th><th class="min-w-[100px] px-3 py-2 border">Self Rating</th><th class="min-w-[250px] px-3 py-2 border">Self Remarks</th><th class="min-w-[100px] px-3 py-2 border">Manager Rating</th><th class="min-w-[250px] px-3 py-2 border">Manager Remarks</th><th class="min-w-[100px] px-3 py-2 border">Self Rating</th><th class="min-w-[250px] px-3 py-2 border">Self Remarks</th><th class="min-w-[100px] px-3 py-2 border">Manager Rating</th><th class="min-w-[250px] px-3 py-2 border">Manager Remarks</th><th class="min-w-[100px] px-3 py-2 border">Average Self Rating</th><th class="min-w-[100px] px-3 py-2 border">Average Manager Rating</th><th class="min-w-[100px] px-3 py-2 border">Final Manager Rating</th><th class="min-w-[250px] px-3 py-2 border">Final Manager Remarks</th></tr></thead><tbody><!--[-->`);
        const each_array_1 = ensure_array_like(kra.kpis);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let kpi = each_array_1[$$index];
          $$renderer3.push(`<tr class="bg-white hover:bg-gray-100"><td class="min-w-[250px] px-3 py-2 border">${escape_html(kpi.name)}</td><td class="min-w-[100px] px-3 py-2 border">H1: ${escape_html(kpi.h1_weightage)}% / H2: ${escape_html(kpi.h2_weightage)}%</td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H1_employee_actual)} class="w-full accent-green-500"${attr("disabled", kpi.h1_weightage == 0, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", kpi.H1_employee_actual)} min="1" max="5" step="0.25"${attr("disabled", kpi.h1_weightage == 0, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", kpi.H1_employee_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? "%" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", kpi.h1_weightage == 0, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border">`);
          AutoResizeTextArea($$renderer3, {
            id: kpi.key,
            name: kpi.key,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            disabled: kpi.h1_weightage == 0,
            get value() {
              return kpi.H1_employee_remarks;
            },
            set value($$value) {
              kpi.H1_employee_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H1_manager_actual)} class="w-full accent-green-500"${attr("disabled", kpi.h1_weightage == 0, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", kpi.H1_manager_actual)} min="1" max="5" step="0.25"${attr("disabled", kpi.h1_weightage == 0, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", kpi.H1_manager_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", kpi.h1_weightage == 0, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border">`);
          AutoResizeTextArea($$renderer3, {
            id: kpi.key,
            name: kpi.key,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            disabled: kpi.h1_weightage == 0,
            get value() {
              return kpi.H1_manager_remarks;
            },
            set value($$value) {
              kpi.H1_manager_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H2_employee_actual)} class="w-full accent-green-500"${attr("disabled", kpi.h2_weightage == 0, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", kpi.H2_employee_actual)} min="1" max="5" step="0.25"${attr("disabled", kpi.h2_weightage == 0, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", kpi.H2_employee_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", kpi.h2_weightage == 0, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border">`);
          AutoResizeTextArea($$renderer3, {
            id: kpi.key,
            name: kpi.key,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            disabled: kpi.h2_weightage == 0,
            get value() {
              return kpi.H2_employee_remarks;
            },
            set value($$value) {
              kpi.H2_employee_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H2_manager_actual)} class="w-full accent-green-500"${attr("disabled", kpi.h2_weightage == 0, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", kpi.H2_manager_actual)} min="1" max="5" step="0.25"${attr("disabled", kpi.h2_weightage == 0, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", kpi.H2_manager_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", kpi.h2_weightage == 0, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border">`);
          AutoResizeTextArea($$renderer3, {
            id: kpi.key,
            name: kpi.key,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            disabled: kpi.h2_weightage == 0,
            get value() {
              return kpi.H2_manager_remarks;
            },
            set value($$value) {
              kpi.H2_manager_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))} class="w-full accent-green-500"${attr("disabled", true, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))} min="1" max="5" step="0.25"${attr("disabled", true, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", true, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))} class="w-full accent-green-500"${attr("disabled", true, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))} min="1" max="5" step="0.25"${attr("disabled", true, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", true, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[100px] px-3 py-2 border">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.HR_actual)} class="w-full accent-green-500"${attr("disabled", false, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div> <div class="relative"><input type="number"${attr("value", kpi.HR_actual)} min="1" max="5" step="0.25"${attr("disabled", false, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1ba6kn3"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative"><input type="number" min="0" step="any"${attr("value", kpi.HR_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1ba6kn3"${attr("disabled", false, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border">`);
          AutoResizeTextArea($$renderer3, {
            id: kpi.key,
            name: kpi.key,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            disabled: false,
            get value() {
              return kpi.HR_remarks;
            },
            set value($$value) {
              kpi.HR_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td></tr>`);
        }
        $$renderer3.push(`<!--]--></tbody></table></div></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="bg-gray-100 p-4 rounded-lg border border-gray-300 mt-6">`);
      AutoResizeTextArea($$renderer3, {
        id: "finalRemarks",
        name: "finalRemarks",
        label: "Final Remarks",
        placeholder: "Enter any concluding remarks here...",
        className: "border border-gray-300 p-2 rounded-md",
        get value() {
          return finalRemarks;
        },
        set value($$value) {
          finalRemarks = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> `);
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
