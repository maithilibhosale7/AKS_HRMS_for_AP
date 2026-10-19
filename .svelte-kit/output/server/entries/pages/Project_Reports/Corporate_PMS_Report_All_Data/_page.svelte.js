import { b as bind_props, l as head, e as ensure_array_like } from "../../../../chunks/index2.js";
import "exceljs";
import { Z as fallback } from "../../../../chunks/utils2.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let dataval_result = fallback($$props["dataval_result"], () => [], true);
    let Departments = [];
    let Employees = [];
    let Selected_Employee = "All";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("ym3ih5", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Corporate PMS Report | Recon</title>`);
        });
      });
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->   <div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-50 inset-0 bg-black/60"><img src="img/loader_icon.svg" alt="Loader" class="w-auto h-[7rem] mx-auto bg-white p-4 rounded-xl animate-pulse"/></div></div>  <div class="flex items-center justify-between mt-2 xl:my-4"><h2 id="ReportTitle" class="text-xl font-semibold leading-7 text-gray-900 mb-4 xs:truncate xs:text-2xl xs:tracking-tight lg:mb-0">Corporate PMS Report - All Data</h2> <button type="submit" class="inline-flex rounded-lg border border-transparent bg-gray-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Export</button></div>  <div class="w-full block companysetup_tabs"><div class="tab-content bg-white p-5 border border-gray-300 rounded-xl" id="tabs-tabContent"><div class="tab-pane fade show active" id="tabs-companyinfo" role="tabpanel" aria-labelledby="tabs-companyinfo-tab"><div class="flex flex-col"><div class="overflow-x-auto xs:-mx-6 lg:-mx-8"><div class="py-2 inline-block min-w-full xs:px-6 lg:px-8"><div class="overflow-x-auto"><form><div class="flex flex-wrap"><div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-xs font-medium md:text-left text-gray-900 pr-4" for="Year">Year</label></div> <div class="md:w-2/3"><select name="Year" id="Year" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
      $$renderer3.option({ value: "Financial Year: 2025-2026" }, ($$renderer4) => {
        $$renderer4.push(`Financial Year: 2025-2026`);
      });
      $$renderer3.push(`</select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-xs font-medium md:text-left text-gray-900 pr-4" for="Tenure">Tenure</label></div> <div class="md:w-2/3"><select name="Tenure" id="Tenure" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
      $$renderer3.option({ value: "All" }, ($$renderer4) => {
        $$renderer4.push(`All`);
      });
      $$renderer3.option({ value: "Less than 1 Year" }, ($$renderer4) => {
        $$renderer4.push(`Less than 1 Year`);
      });
      $$renderer3.option({ value: "1 to 3 Years" }, ($$renderer4) => {
        $$renderer4.push(`1 to 3 Years`);
      });
      $$renderer3.option({ value: "More than 3 Years" }, ($$renderer4) => {
        $$renderer4.push(`More than 3 Years`);
      });
      $$renderer3.push(`</select></div></div></div>  <div class="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 xl:w-1/2 xl:flex-none"><div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-xs font-medium md:text-left text-gray-900 pr-4" for="Department">Department</label></div> <div class="md:w-2/3"><select name="Department" id="Department" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
      $$renderer3.option({ value: "All" }, ($$renderer4) => {
        $$renderer4.push(`All`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(Departments);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let department = each_array[$$index];
        $$renderer3.option({ value: department }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(department)}`);
        });
      }
      $$renderer3.push(`<!--]--></select></div></div>  <div class="md:flex md:items-center mb-3"><div class="md:w-1/3"><label class="block mb-2 text-xs font-medium md:text-left text-gray-900 pr-4" for="Employee">Employee</label></div> <div class="md:w-2/3"><select name="Employee" id="Employee" class="w-full bg-white font-normal text-md text-gray-700 border border-gray-400 rounded-xl py-3.5 px-4 leading-tight shadow-md focus:outline-none focus:bg-white focus:border-blue-500">`);
      $$renderer3.option({ value: "All" }, ($$renderer4) => {
        $$renderer4.push(`All`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(Object.entries(Employees));
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let [employee_self_id, employee_data] = each_array_1[$$index_1];
        {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ value: employee_self_id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(employee_data.Employee_Tag)} - ${escape_html(employee_data.Department)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--></select></div></div></div></div> <div class="flex flex-wrap items-center justify-end space-x-3 text-center"><button class="rounded-lg border border-transparent bg-secondarycolor-500 px-4 py-2 text-md font-normal text-white shadow-xl hover:bg-secondarycolor-700 focus:outline-none focus:ring-2 focus:ring-secondarycolor-500 focus:ring-offset-2">Search</button></div></form></div></div></div></div>  <div id="ReportInputs" class="lg:flex lg:items-center space-x-3 mt-2 xl:my-3"><div class="flex items-center text-[17px]"><span class="font-semibold">Year:</span> <span class="font-regular ml-2">${escape_html(dataval_result.Year || "ALL")}</span></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Department:</span> <span class="font-regular ml-2">${escape_html(dataval_result.Department || "ALL")}</span></div> <div class="flex items-center text-[17px]"><span class="font-semibold">Employee:</span> <span class="font-regular ml-2">${escape_html(Selected_Employee)}</span></div></div>  <div class="w-full overflow-x-auto"><table id="ReportData" width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;"><thead class="text-xs text-gray-900 bg-[#B7B7B7] border-2 font-semibold"><tr><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Serial_Number">Sr. No.</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Year">Year</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Employee_Code">Employee Code</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Employee_Name">Employee Name</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="DOJ">DOJ</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Designation">Designation</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Department">Department</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Tenure">Tenure</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Last_Increment_Date">Last Increment Date</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Manager_Employee_Code">Manager Emp Code</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Manager_Employee_Name">Manager Name</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Manager_Designation">Manager Designation</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="H1_Self_Rating">H1 Self Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="H1_Manager_Rating">H1 Manager Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Cumulative_H1_Rating">Cumulative H1 Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="H2_Self_Rating">H2 Self Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="H2_Manager_Rating">H2 Manager Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Cumulative_H2_Rating">Cumulative H2 Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Cumulative_Self_Rating">Cumulative Self Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Cumulative_Manager_Rating">Cumulative Manager Rating</th><th class="py-2 px-2 text-xs xl:text-xs 2xl:text-xs text-left capitalize sortable" data-key="Final_Rating">Final Rating</th></tr></thead><tbody>`);
      if (dataval_result.Table_Data && dataval_result.Table_Data.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(dataval_result.Table_Data);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let row = each_array_2[$$index_2];
          $$renderer3.push(`<tr class="border-b border-gray-200"><td>${escape_html(row.Serial_Number)}</td><td>${escape_html(row.Year)}</td><td>${escape_html(row.Employee_Code)}</td><td>${escape_html(row.Employee_Name)}</td><td>${escape_html(row.DOJ)}</td><td>${escape_html(row.Designation)}</td><td>${escape_html(row.Department)}</td><td>${escape_html(row.Tenure)}</td><td>${escape_html(row.Last_Increment_Date)}</td><td>${escape_html(row.Manager_Employee_Code)}</td><td>${escape_html(row.Manager_Employee_Name)}</td><td>${escape_html(row.Manager_Designation)}</td><td>${escape_html(row.Cumulative_H1_Self_Rating)}</td><td>${escape_html(row.Cumulative_H1_Manager_Rating)}</td><td>${escape_html(row.Cumulative_H1_Rating)}</td><td>${escape_html(row.Cumulative_H2_Self_Rating)}</td><td>${escape_html(row.Cumulative_H2_Manager_Rating)}</td><td>${escape_html(row.Cumulative_H2_Rating)}</td><td>${escape_html(row.Cumulative_Self_Rating)}</td><td>${escape_html(row.Cumulative_Manager_Rating)}</td><td>${escape_html(row.Cumulative_Final_Rating)}</td></tr>`);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<tr><td colspan="18" class="text-center py-4">No data available</td></tr>`);
      }
      $$renderer3.push(`<!--]--></tbody><tfoot><tr class="bg-gray-200 font-semibold"></tr></tfoot></table></div></div></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { dataval_result });
  });
}
export {
  _page as default
};
