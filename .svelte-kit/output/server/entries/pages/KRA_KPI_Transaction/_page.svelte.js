import { s as store_get, m as store_mutate, l as head, a as attr, e as ensure_array_like, u as unsubscribe_stores, b as bind_props } from "../../../chunks/index2.js";
import { p as page } from "../../../chunks/stores.js";
import { Z as fallback } from "../../../chunks/utils2.js";
import { P as Project_Theme_Settings } from "../../../chunks/Project_Theme_Settings.js";
import { L as Live_Data_Storage } from "../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let Page_URL_Parameters = fallback($$props["Page_URL_Parameters"], () => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("settings") ?? "", true);
    let Page_URL_Parameters_Set = fallback($$props["Page_URL_Parameters_Set"], () => Page_URL_Parameters.split("*"), true);
    let Main_Menu = fallback($$props["Main_Menu"], () => Page_URL_Parameters_Set[0] ?? "", true);
    let Menu_Heading = fallback($$props["Menu_Heading"], () => Page_URL_Parameters_Set[1] ?? "", true);
    let Menu_Sub_Heading = fallback($$props["Menu_Sub_Heading"], () => Page_URL_Parameters_Set[2] ?? "", true);
    let Table_ID = fallback($$props["Table_ID"], () => Page_URL_Parameters_Set[3] ?? "", true);
    let Data_Table_Name = fallback($$props["Data_Table_Name"], () => Page_URL_Parameters_Set[4] ?? "", true);
    let Linked_Data_Table_Name = fallback($$props["Linked_Data_Table_Name"], () => Page_URL_Parameters_Set[5] ?? "", true);
    let Display_Scenario_ID = fallback($$props["Display_Scenario_ID"], () => Page_URL_Parameters_Set[6] ?? "", true);
    let Live_Data;
    let user_selection = [];
    let currentPage = 1;
    let totalPages = 0;
    let paginatedData = [];
    let searchQuery = "";
    {
      Live_Data = store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    }
    store_mutate($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage, store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage).Page_Information.Selected_IDs = user_selection);
    head("plkkgd", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>PMS Activity | AKS for RECON</title>`);
      });
    });
    $$renderer2.push(`<div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60"><img${attr("src", Project_Theme_Settings.client_loader_icon)} alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse"/></div></div>  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between my-4"><div class="w-full lg:w-auto mb-2 lg:mb-0"><form><div class="flex space-x-2"><select name="data_action" id="data_action" required class="block w-28 lg:w-36 xl:w-48 2xl:w-56 bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-1.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Please Choose...`);
    });
    if (Live_Data.Page_Information.Action_Dropdown_List) {
      $$renderer2.push("<!--[-->");
      if (Object.keys(Live_Data.Page_Information.Action_Dropdown_List).length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(Object.entries(Live_Data.Page_Information.Action_Dropdown_List));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let [Action_Dropdown_List_Key, Action_Dropdown_List_Data] = each_array[$$index];
          if (Action_Dropdown_List_Data.Access == 1 && Action_Dropdown_List_Data.Filter_Status == 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.option(
              {
                disabled: false,
                value: Action_Dropdown_List_Key,
                style: "background-color: YELLOW;"
              },
              ($$renderer3) => {
                $$renderer3.push(`${escape_html(Action_Dropdown_List_Data.action_dropdown_option)}`);
              }
            );
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.option({ disabled: true, value: Action_Dropdown_List_Key }, ($$renderer3) => {
              $$renderer3.push(`${escape_html(Action_Dropdown_List_Data.action_dropdown_option)}`);
            });
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></select> <button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2 svelte-plkkgd">Action</button></div></form></div> <div class="flex-grow text-center"><h1 class="text-xl font-bold text-black">PMS Activity</h1></div> <div class="flex-grow text-center"><input type="text" placeholder="Search..."${attr("value", searchQuery)} class="search-box border border-gray-400 rounded-lg px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-full"/></div></div> <table class="w-full table-auto border border-gray-300 svelte-plkkgd"><thead class="bg-gray-100"><tr class="svelte-plkkgd"><th scope="col" class="px-6 py-3 svelte-plkkgd"></th><th scope="col" class="px-6 py-3 svelte-plkkgd">Processing Year</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Employee Code</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Employee Name</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Designation</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Department</th><th scope="col" class="px-6 py-3 svelte-plkkgd">DOJ</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Tenure</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Last Increment Date</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Cumulative H1 Rating</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Cumulative H2 Rating</th><th scope="col" class="px-6 py-3 svelte-plkkgd">Cumulative Final Rating</th></tr></thead><tbody><!--[-->`);
    const each_array_1 = ensure_array_like(paginatedData);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let item = each_array_1[index];
      $$renderer2.push(`<tr class="svelte-plkkgd"><td class="border px-4 py-2 text-center svelte-plkkgd"><input type="checkbox"${attr("value", item.Employee_KRA_KPI_Transaction_ID)}${attr("checked", user_selection.includes(item.Employee_KRA_KPI_Transaction_ID), true)}/></td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Processing_Year)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Employee_Code)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Employee_Name)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Designation)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Department)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.DOJ)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Tenure)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Last_Increment_Date)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Cumulative_H1_Rating)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Cumulative_H2_Rating)}</td><td class="px-6 py-4 svelte-plkkgd">${escape_html(item.Cumulative_Final_Rating)}</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table> <div class="flex justify-between items-center mt-4"><button${attr("disabled", currentPage === 1, true)} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 svelte-plkkgd">Previous</button> <span>Page ${escape_html(currentPage)} of ${escape_html(totalPages)}</span> <button${attr("disabled", currentPage === totalPages, true)} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 svelte-plkkgd">Next</button></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      Page_URL_Parameters,
      Page_URL_Parameters_Set,
      Main_Menu,
      Menu_Heading,
      Menu_Sub_Heading,
      Table_ID,
      Data_Table_Name,
      Linked_Data_Table_Name,
      Display_Scenario_ID
    });
  });
}
export {
  _page as default
};
