import { l as head, a as attr, e as ensure_array_like } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
/* empty css                                                      */
import "../../../../chunks/Live_Data_Storage.js";
import "@sveltejs/kit";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let userList = [];
    let startDate = "";
    let endDate = "";
    let selectedUser = "All";
    head("xnrzli", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>User Activity Logs | Project</title>`);
      });
    });
    $$renderer2.push(`<div class="w-full bg-gray-50 p-6 min-h-screen"><div class="w-full flex justify-between items-center mb-6"><h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2"><svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> System Activity Logs</h1></div> <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-end gap-4"><div class="flex flex-col"><label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" for="startDate">Start Date</label> <input type="date" id="startDate"${attr("value", startDate)} class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"/></div> <div class="flex flex-col"><label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" for="endDate">End Date</label> <input type="date" id="endDate"${attr("value", endDate)} class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"/></div> <div class="flex flex-col min-w-[200px]"><label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" for="userFilter">User</label> `);
    $$renderer2.select(
      {
        id: "userFilter",
        value: selectedUser,
        class: "border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "All" }, ($$renderer4) => {
          $$renderer4.push(`All Users`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(userList);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let user = each_array[$$index];
          $$renderer3.option({ value: user.Master_User_ID }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(user.Username)} (ID: ${escape_html(user.Employee_ID)})`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <button class="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-md hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Search Logs</button></div> <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div class="overflow-x-auto max-h-[calc(100vh-16rem)] custom-scrollbar svelte-xnrzli"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50 sticky top-0 z-10 shadow-sm"><tr><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp / IP</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action Type</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<tr><td colspan="6" class="px-6 py-12 text-center text-gray-400"><div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div> Fetching Logs...</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
  });
}
export {
  _page as default
};
