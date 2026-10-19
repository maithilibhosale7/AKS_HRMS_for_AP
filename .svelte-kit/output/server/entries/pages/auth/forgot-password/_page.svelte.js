import { f as attr_style, a as attr, g as stringify } from "../../../../chunks/index2.js";
import { P as Project_Theme_Settings } from "../../../../chunks/Project_Theme_Settings.js";
import "../../../../chunks/SessionStore.js";
import "../../../../chunks/Live_Data_Storage.js";
import "@sveltejs/kit";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
/* empty css                                                      */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    $$renderer2.push(`<div class="background svelte-c68gvn"${attr_style(`background-image: url(${stringify(Project_Theme_Settings.login_background_image)});`)}><div class="login-container w-[90%] sm:w-[400px] p-8 text-center svelte-c68gvn"><h2 class="text-2xl font-bold text-gray-800 mb-6">Reset Password</h2> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-sm text-gray-600 mb-6">Enter your email address to receive a verification code.</p> <input type="email"${attr("value", email)} placeholder="name@company.com" class="w-full px-4 py-3 rounded-lg border border-gray-300 mb-4 outline-none focus:ring-2 focus:ring-cyan-500"/> <button class="w-full py-3 bg-cyan-600 text-white rounded-lg font-bold shadow-md hover:bg-cyan-700 transition-colors">Send Code</button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
