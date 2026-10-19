import { a as attr, c as attr_class, b as bind_props } from "./index2.js";
import { Z as fallback } from "./utils2.js";
import { e as escape_html } from "./context.js";
function AutoResizeTextArea($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let disabled = fallback($$props["disabled"], false);
    let id = fallback($$props["id"], "");
    let name = fallback($$props["name"], "");
    let value = fallback($$props["value"], "");
    let required = fallback($$props["required"], false);
    let mandatory = fallback($$props["mandatory"], false);
    let label = fallback($$props["label"], "");
    let placeholder = fallback($$props["placeholder"], "Enter value here");
    let className = fallback($$props["className"], "");
    let readonly = fallback($$props["readonly"], false);
    $$renderer2.push(`<div class="flex flex-col">`);
    if (label) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<label${attr("for", id)} class="block text-sm font-medium text-gray-700 mb-1">${escape_html(label)} `);
      if (mandatory) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-red-500 text-xl">*</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></label>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <textarea${attr("id", id)}${attr("name", name)}${attr("required", required || mandatory, true)}${attr("placeholder", placeholder)}${attr("readonly", readonly, true)}${attr("disabled", disabled, true)}${attr_class(`block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm px-2 bg-white overflow-hidden ${className}`)} style="resize: none">`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div>`);
    bind_props($$props, {
      disabled,
      id,
      name,
      value,
      required,
      mandatory,
      label,
      placeholder,
      className,
      readonly
    });
  });
}
export {
  AutoResizeTextArea as A
};
