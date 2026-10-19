import { f as attr_style, c as attr_class, j as slot, b as bind_props, g as stringify, e as ensure_array_like, s as store_get, a as attr, u as unsubscribe_stores, k as spread_props } from "../../../chunks/index2.js";
import { m as modal_stack } from "../../../chunks/AKS_HRMS_Modal_Store.js";
import { Z as fallback } from "../../../chunks/utils2.js";
import { e as escape_html } from "../../../chunks/context.js";
import { P as Project_Theme_Settings } from "../../../chunks/Project_Theme_Settings.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function AKS_Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let size = fallback($$props["size"], "xl");
    let title = fallback($$props["title"], "");
    let closeable = fallback($$props["closeable"], true);
    let zIndex = fallback($$props["zIndex"], 50);
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-xl",
      lg: "max-w-3xl",
      xl: "max-w-5xl",
      full: "max-w-[95vw] h-[92vh]"
    };
    $$renderer2.push(`<div class="fixed inset-0 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto"${attr_style(`z-index: ${stringify(zIndex)}; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(2px);`)} role="dialog" aria-modal="true"><div${attr_class(`relative w-full ${stringify(sizeClasses[size])} bg-white rounded-2xl shadow-2xl flex flex-col my-auto`)} style="max-height: calc(100vh - 3rem);"><div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<h2 class="text-base font-semibold text-slate-800 tracking-tight">${escape_html(title)}</h2>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span></span>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (closeable) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" aria-label="Close"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="overflow-y-auto flex-1 p-6"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></div></div></div>`);
    bind_props($$props, { size, title, closeable, zIndex });
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$modal_stack", modal_stack));
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let modal = each_array[i];
      AKS_Modal($$renderer2, {
        size: modal.size,
        title: modal.title,
        closeable: modal.closeable,
        zIndex: 50 + i * 10,
        children: ($$renderer3) => {
          $$renderer3.push("<!---->");
          modal.component?.($$renderer3, spread_props([modal.props]));
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      });
    }
    $$renderer2.push(`<!--]--> <div class="relative w-full h-full hidden" id="loader_block"><div class="fixed left-0 right-0 flex items-center justify-center w-full h-full z-[999] inset-0 bg-black/60"><img${attr("src", Project_Theme_Settings.client_loader_icon)} alt="Loading..." class="w-auto h-24 mx-auto bg-white p-4 rounded-xl animate-pulse"/></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
