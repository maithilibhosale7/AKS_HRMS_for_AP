import { s as store_get, u as unsubscribe_stores, a as attr, e as ensure_array_like } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { A as AutoResizeTextArea } from "../../../chunks/AutoResizeTextArea.js";
import { L as Live_Data_Storage } from "../../../chunks/Live_Data_Storage.js";
import { P as Project_Theme_Settings } from "../../../chunks/Project_Theme_Settings.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let finalRemarks = "";
    let kraList = [];
    let processingYear = "";
    let validationErrors = [];
    let isH1SelfRatingPeriod = false;
    let isH1ManagerRatingPeriod = false;
    let isH2SelfRatingPeriod = false;
    let isH2ManagerRatingPeriod = false;
    function clearFieldHighlighting(field) {
      if (!field) return;
      field.classList.remove("missing-field-highlight");
      field.style.removeProperty("border");
      field.style.removeProperty("background-color");
      field.style.removeProperty("box-shadow");
      field.style.removeProperty("outline");
      field.style.setProperty("border", "initial", "important");
      field.style.setProperty("background-color", "initial", "important");
      field.style.setProperty("box-shadow", "initial", "important");
      field.style.setProperty("outline", "initial", "important");
      setTimeout(
        () => {
          field.style.removeProperty("border");
          field.style.removeProperty("background-color");
          field.style.removeProperty("box-shadow");
          field.style.removeProperty("outline");
        },
        10
      );
      field.offsetHeight;
    }
    const now = /* @__PURE__ */ new Date();
    now.getMonth() + 1;
    now.getDate();
    function getAverageRating(H1_Rating, H2_Rating) {
      if (H1_Rating == 0 || H2_Rating == 0) {
        return H1_Rating + H2_Rating;
      } else {
        if (H1_Rating > 0 && H2_Rating > 0) {
          return ((Number(H1_Rating) + Number(H2_Rating)) / 2).toFixed(2);
        } else {
          return (Number(H1_Rating) + Number(H2_Rating)).toFixed(2);
        }
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
    console.log("kraList changed, length:", kraList.length, kraList);
    {
      if (kraList && kraList.length > 0) {
        kraList.forEach((kra) => {
          if (kra.kpis) {
            kra.kpis.forEach((kpi) => {
              console.log(`KPI: ${kpi.name} | h2_weightage: ${kpi.h2_weightage} | type: ${typeof kpi.h2_weightage}`);
              if (kpi.H1_employee_remarks && kpi.H1_employee_remarks.trim() !== "") {
                const element = document.getElementById(`${kpi.key}_H1_employee_remarks`);
                if (element && element.classList.contains("missing-field-highlight")) {
                  clearFieldHighlighting(element);
                  validationErrors = validationErrors.filter((error) => error.element !== element);
                }
              }
              if (kpi.H1_manager_remarks && kpi.H1_manager_remarks.trim() !== "") {
                const element = document.getElementById(`${kpi.key}_H1_manager_remarks`);
                if (element && element.classList.contains("missing-field-highlight")) {
                  clearFieldHighlighting(element);
                  validationErrors = validationErrors.filter((error) => error.element !== element);
                }
              }
              if (kpi.H2_employee_remarks && kpi.H2_employee_remarks.trim() !== "") {
                const element = document.getElementById(`${kpi.key}_H2_employee_remarks`);
                if (element && element.classList.contains("missing-field-highlight")) {
                  clearFieldHighlighting(element);
                  validationErrors = validationErrors.filter((error) => error.element !== element);
                }
              }
              if (kpi.H2_manager_remarks && kpi.H2_manager_remarks.trim() !== "") {
                const element = document.getElementById(`${kpi.key}_H2_manager_remarks`);
                if (element && element.classList.contains("missing-field-highlight")) {
                  clearFieldHighlighting(element);
                  validationErrors = validationErrors.filter((error) => error.element !== element);
                }
              }
              if (kpi.HR_remarks && kpi.HR_remarks.trim() !== "") {
                const element = document.getElementById(`${kpi.key}_HR_remarks`);
                if (element && element.classList.contains("missing-field-highlight")) {
                  clearFieldHighlighting(element);
                  validationErrors = validationErrors.filter((error) => error.element !== element);
                }
              }
            });
          }
        });
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="relative w-full h-full hidden svelte-1tnz79y" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60 svelte-1tnz79y"><img${attr("src", Project_Theme_Settings.client_loader_icon)} alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse svelte-1tnz79y"/></div></div> <div class="w-full p-6 bg-white shadow rounded-lg space-y-6 svelte-1tnz79y"><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 svelte-1tnz79y"><div class="svelte-1tnz79y"><h1 class="text-2xl font-bold text-gray-800 svelte-1tnz79y">Performance Management System - Year 2025-2026</h1></div> <div class="flex items-center gap-2 svelte-1tnz79y"><button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors svelte-1tnz79y"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 svelte-1tnz79y" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" class="svelte-1tnz79y"></path></svg> Submit</button> <button class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors svelte-1tnz79y"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 svelte-1tnz79y" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" class="svelte-1tnz79y"></path></svg> Cancel</button></div></div> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm svelte-1tnz79y"><div class="flex items-center justify-between svelte-1tnz79y"><div class="text-sm font-medium text-gray-700 svelte-1tnz79y">PMS Period</div> <div class="flex items-center gap-2 svelte-1tnz79y"><span class="text-sm text-gray-500 svelte-1tnz79y">${escape_html(processingYear)}</span></div></div></div> <div class="w-full space-y-6 svelte-1tnz79y"><!--[-->`);
      const each_array = ensure_array_like(kraList);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let kra = each_array[i];
        $$renderer3.push(`<div class="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm svelte-1tnz79y"><h4 class="text-xl font-bold text-blue-700 mb-2 svelte-1tnz79y">KRA ${escape_html(i + 1)}: ${escape_html(kra.name)}</h4> <div class="w-full overflow-x-auto svelte-1tnz79y"><div class="min-w-[1200px] svelte-1tnz79y"><table class="w-full text-sm text-left text-gray-700 border svelte-1tnz79y"><thead class="bg-gray-200 text-gray-900 svelte-1tnz79y"><tr class="svelte-1tnz79y"><th class="min-w-[250px] svelte-1tnz79y"></th><th class="min-w-[100px] svelte-1tnz79y"></th><th class="min-w-[700px] text-center px-3 py-2 border svelte-1tnz79y" colspan="4">APPRAISAL PERIOD: APR-SEP CYCLE</th><th class="min-w-[700px] text-center px-3 py-2 border svelte-1tnz79y" colspan="4">APPRAISAL PERIOD: OCT-MAR CYCLE</th><th class="min-w-[350px] text-center px-3 py-2 border svelte-1tnz79y" colspan="4">APPRAISAL PERIOD: APR-MAR CYCLE</th></tr><tr class="svelte-1tnz79y"><th class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">KPI</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Weightage (%)</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Self Rating</th><th class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">Self Remarks</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Manager Rating</th><th class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">Manager Remarks</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Self Rating</th><th class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">Self Remarks</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Manager Rating</th><th class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">Manager Remarks</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Average Self Rating</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Average Manager Rating</th><th class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">Final Manager Rating</th><th class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">Final Manager Remarks</th></tr></thead><tbody class="svelte-1tnz79y"><!--[-->`);
        const each_array_1 = ensure_array_like(kra.kpis);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let kpi = each_array_1[$$index];
          $$renderer3.push(`<tr class="bg-white hover:bg-gray-100 svelte-1tnz79y"><td class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">${escape_html(kpi.name)}</td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">H1: ${escape_html(kpi.h1_weightage)}% / H2: ${escape_html(kpi.h2_weightage)}%</td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H1_employee_actual)} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", !isH1SelfRatingPeriod, true)}${attr("required", isH1SelfRatingPeriod, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", kpi.H1_employee_actual)} min="1" max="5" step="0.25"${attr("disabled", !isH1SelfRatingPeriod, true)}${attr("required", isH1SelfRatingPeriod, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", kpi.H1_employee_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? "%" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", !isH1SelfRatingPeriod, true)}${attr("required", isH1SelfRatingPeriod, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">`);
          AutoResizeTextArea($$renderer3, {
            id: `${kpi.key}_H1_employee_remarks`,
            name: `${kpi.key}_H1_employee_remarks`,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            readonly: !isH1SelfRatingPeriod,
            required: isH1SelfRatingPeriod,
            get value() {
              return kpi.H1_employee_remarks;
            },
            set value($$value) {
              kpi.H1_employee_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H1_manager_actual)} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", !isH1ManagerRatingPeriod, true)}${attr("required", isH1ManagerRatingPeriod, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", kpi.H1_manager_actual)} min="1" max="5" step="0.25"${attr("disabled", !isH1ManagerRatingPeriod, true)}${attr("required", isH1ManagerRatingPeriod, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", kpi.H1_manager_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", !isH1ManagerRatingPeriod, true)}${attr("required", isH1ManagerRatingPeriod, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">`);
          AutoResizeTextArea($$renderer3, {
            id: `${kpi.key}_H1_manager_remarks`,
            name: `${kpi.key}_H1_manager_remarks`,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            readonly: !isH1ManagerRatingPeriod,
            required: isH1ManagerRatingPeriod,
            get value() {
              return kpi.H1_manager_remarks;
            },
            set value($$value) {
              kpi.H1_manager_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H2_employee_actual)} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", !isH2SelfRatingPeriod, true)}${attr("required", isH2SelfRatingPeriod, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", kpi.H2_employee_actual)} min="1" max="5" step="0.25"${attr("disabled", !isH2SelfRatingPeriod, true)}${attr("required", isH2SelfRatingPeriod, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", kpi.H2_employee_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", !isH2SelfRatingPeriod, true)}${attr("required", isH2SelfRatingPeriod, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">`);
          AutoResizeTextArea($$renderer3, {
            id: `${kpi.key}_H2_employee_remarks`,
            name: `${kpi.key}_H2_employee_remarks`,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            readonly: !isH2SelfRatingPeriod,
            required: isH2SelfRatingPeriod,
            get value() {
              return kpi.H2_employee_remarks;
            },
            set value($$value) {
              kpi.H2_employee_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.H2_manager_actual)} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", !isH2ManagerRatingPeriod, true)}${attr("required", isH2ManagerRatingPeriod, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", kpi.H2_manager_actual)} min="1" max="5" step="0.25"${attr("disabled", !isH2ManagerRatingPeriod, true)}${attr("required", isH2ManagerRatingPeriod, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", kpi.H2_manager_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", !isH2ManagerRatingPeriod, true)}${attr("required", isH2ManagerRatingPeriod, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">`);
          AutoResizeTextArea($$renderer3, {
            id: `${kpi.key}_H2_manager_remarks`,
            name: `${kpi.key}_H2_manager_remarks`,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            readonly: !isH2ManagerRatingPeriod,
            required: isH2ManagerRatingPeriod,
            get value() {
              return kpi.H2_manager_remarks;
            },
            set value($$value) {
              kpi.H2_manager_remarks = $$value;
              $$settled = false;
            }
          });
          $$renderer3.push(`<!----></td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", true, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))} min="1" max="5" step="0.25"${attr("disabled", true, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", getAverageRating(kpi.H1_employee_actual, kpi.H2_employee_actual))}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", true, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", true, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))} min="1" max="5" step="0.25"${attr("disabled", true, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", getAverageRating(kpi.H1_manager_actual, kpi.H2_manager_actual))}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", true, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[100px] px-3 py-2 border svelte-1tnz79y">`);
          if (kpi.ratingType === "Rating" || kpi.ratingType === "1-5 Scale") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<input type="range" min="1" max="5" step="0.25"${attr("value", kpi.HR_actual)} class="w-full accent-green-500 svelte-1tnz79y"${attr("disabled", true, true)}/> <div class="flex justify-between w-full text-sm text-gray-500 mt-1 px-1 svelte-1tnz79y"><span class="svelte-1tnz79y">1</span><span class="svelte-1tnz79y">2</span><span class="svelte-1tnz79y">3</span><span class="svelte-1tnz79y">4</span><span class="svelte-1tnz79y">5</span></div> <div class="relative svelte-1tnz79y"><input type="number"${attr("value", kpi.HR_actual)} min="1" max="5" step="0.25"${attr("disabled", true, true)} class="w-20 px-2 py-1 text-left text-xs border-b border-gray-300 focus:border-green-500 focus:outline-none svelte-1tnz79y"/> <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none svelte-1tnz79y">/5</span></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            if (kpi.ratingType === "Percentage" || kpi.ratingType === "Value") {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="relative svelte-1tnz79y"><input type="number" min="0" step="any"${attr("value", kpi.HR_actual)}${attr("placeholder", kpi.ratingType === "Percentage" ? " %" : "value")} class="w-full border rounded-md px-2 py-1 text-sm w-20 svelte-1tnz79y"${attr("disabled", true, true)}/> `);
              if (kpi.target) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 svelte-1tnz79y">/ ${escape_html(kpi.target)}</span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></td><td class="min-w-[250px] px-3 py-2 border svelte-1tnz79y">`);
          AutoResizeTextArea($$renderer3, {
            id: `${kpi.key}_HR_remarks`,
            name: `${kpi.key}_HR_remarks`,
            placeholder: "Enter value here",
            className: "min-h-[50px]",
            readonly: true,
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
      $$renderer3.push(`<!--]--></div> <div class="bg-gray-100 p-4 rounded-lg border border-gray-300 mt-6 svelte-1tnz79y">`);
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
      $$renderer3.push(`<!--]--> `);
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
