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
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let username = "";
    let password = "";
    let isSubmitting = false;
    $$renderer2.push(`<div class="background svelte-1i2smtp"${attr_style(`background-image: url(${stringify(Project_Theme_Settings.login_background_image)});`)}><div class="login-container w-[90%] sm:w-[400px] p-8 svelte-1i2smtp"><div class="flex justify-center items-center mb-8 h-24"><img${attr("src", Project_Theme_Settings.client_logo)} alt="Logo" class="max-h-full max-w-full object-contain"/></div> <form class="space-y-5"><div><label class="block text-sm font-semibold text-gray-700 mb-1">Username</label> <input type="text"${attr("value", username)} required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"/></div> <div><label class="block text-sm font-semibold text-gray-700 mb-1">Password</label> <input type="password"${attr("value", password)} required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"/></div> <button type="submit"${attr("disabled", isSubmitting, true)} class="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition-colors">${escape_html("Login")}</button></form> <div class="mt-6 text-center"><a href="/auth/forgot-password" class="text-sm font-medium text-cyan-700 hover:underline">Forgot Password?</a></div></div></div>`);
  });
}
export {
  _page as default
};
