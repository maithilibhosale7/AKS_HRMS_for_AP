import { s as store_get, f as attr_style, u as unsubscribe_stores, g as stringify } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { P as Project_Theme_Settings } from "../../../chunks/Project_Theme_Settings.js";
import { L as Live_Data_Storage } from "../../../chunks/Live_Data_Storage.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    {
      store_get($$store_subs ??= {}, "$Live_Data_Storage", Live_Data_Storage);
    }
    $$renderer2.push(`<div class="w-full flex items-center mb-4"><div class="flex-grow text-left"><h1 class="text-2xl font-bold"${attr_style(`color: ${stringify(Project_Theme_Settings.primary_color)};`)}>Corporate Hierarchy - Approvals</h1></div> <button class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded shadow-sm transition">← Back</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
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
