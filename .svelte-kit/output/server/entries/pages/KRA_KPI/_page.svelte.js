import { s as store_get, m as store_mutate, l as head, a as attr, e as ensure_array_like, u as unsubscribe_stores, b as bind_props } from "../../../chunks/index2.js";
import { p as page } from "../../../chunks/stores.js";
import { Z as fallback } from "../../../chunks/utils2.js";
import { P as Project_Theme_Settings } from "../../../chunks/Project_Theme_Settings.js";
import { L as Live_Data_Storage } from "../../../chunks/Live_Data_Storage.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let Page_URL_Parameters = fallback($$props["Page_URL_Parameters"], () => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("settings"), true);
    let Page_URL_Parameters_Set = fallback($$props["Page_URL_Parameters_Set"], () => Page_URL_Parameters.split("*"), true);
    let Main_Menu = fallback($$props["Main_Menu"], () => Page_URL_Parameters_Set[0], true);
    let Menu_Heading = fallback($$props["Menu_Heading"], () => Page_URL_Parameters_Set[1], true);
    let Menu_Sub_Heading = fallback($$props["Menu_Sub_Heading"], () => Page_URL_Parameters_Set[2], true);
    let Table_ID = fallback($$props["Table_ID"], () => Page_URL_Parameters_Set[3], true);
    let Data_Table_Name = fallback($$props["Data_Table_Name"], () => Page_URL_Parameters_Set[4], true);
    let Linked_Data_Table_Name = fallback($$props["Linked_Data_Table_Name"], () => Page_URL_Parameters_Set[5], true);
    let Display_Scenario_ID = fallback($$props["Display_Scenario_ID"], () => Page_URL_Parameters_Set[6], true);
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
    head("fyyg9q", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>PMS Definitions | AKS for RECON</title>`);
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
    $$renderer2.push(`<!--]--></select> <button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2 svelte-fyyg9q">Action</button></div></form></div> <div class="flex-grow text-center"><h1 class="text-xl font-bold text-black">PMS Definitions</h1></div> <div class="flex-grow text-center"><input type="text" placeholder="Search..."${attr("value", searchQuery)} class="search-box border border-gray-400 rounded-lg px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-full"/></div></div> <table class="w-full table-auto border border-gray-300 svelte-fyyg9q"><thead class="bg-gray-100"><tr class="svelte-fyyg9q"><th class="border px-4 py-2 text-left svelte-fyyg9q">ID</th><th class="border px-4 py-2 text-left svelte-fyyg9q">Processing Year</th><th class="border px-4 py-2 text-left svelte-fyyg9q">Employee Details</th><th class="border px-4 py-2 text-left svelte-fyyg9q">KRA Details</th></tr></thead><tbody><!--[-->`);
    const each_array_1 = ensure_array_like(paginatedData);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let row = each_array_1[index];
      $$renderer2.push(`<tr class="svelte-fyyg9q"><td class="border px-4 py-2 text-center svelte-fyyg9q"><input type="checkbox"${attr("value", row.Employee_KRA_KPI_Details_ID)}${attr("checked", user_selection.includes(row.Employee_KRA_KPI_Details_ID), true)}/></td><td class="border px-4 py-2 relative text-center svelte-fyyg9q">${escape_html(row.Processing_Year)} <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 mt-2 font-bold px-2 py-1" style="padding-bottom: 10px;">${escape_html(row.Status)}</div></td><td class="border px-4 py-2 svelte-fyyg9q"><div><strong>Code:</strong> ${escape_html(row.Employee_Code)}</div> <div><strong>Name:</strong> ${escape_html(row.Employee_Name)}</div> <div><strong>Designation:</strong> ${escape_html(row.Designation)}</div> <div><strong>Department:</strong> ${escape_html(row.Department)}</div> <div><strong>DOJ:</strong> ${escape_html(row.DOJ)}</div> <div><strong>Tenure:</strong> ${escape_html(row.Tenure)}</div> <div><strong>Last Increment:</strong> ${escape_html(row.Last_Increment_Date)}</div></td><td class="border px-4 py-2 svelte-fyyg9q"><!--[-->`);
      const each_array_2 = ensure_array_like(row.KRA_Details);
      for (let $$index_2 = 0, $$length2 = each_array_2.length; $$index_2 < $$length2; $$index_2++) {
        let kra = each_array_2[$$index_2];
        $$renderer2.push(`<div><strong>${escape_html(kra.name)}</strong> <ul><!--[-->`);
        const each_array_3 = ensure_array_like(kra.kpis);
        for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
          let kpi = each_array_3[$$index_1];
          $$renderer2.push(`<li>${escape_html(kpi.name)} (H1 Weightage: ${escape_html(kpi.h1_weightage)}%, H2 Weightage: ${escape_html(kpi.h2_weightage)}%, Target: ${escape_html(kpi.target)}, Data Source: ${escape_html(kpi.dataSource)})</li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      }
      $$renderer2.push(`<!--]--></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table> <div class="flex justify-between items-center mt-4"><button${attr("disabled", currentPage === 1, true)} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 svelte-fyyg9q">Previous</button> <span>Page ${escape_html(currentPage)} of ${escape_html(totalPages)}</span> <button${attr("disabled", currentPage === totalPages, true)} class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 svelte-fyyg9q">Next</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
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
