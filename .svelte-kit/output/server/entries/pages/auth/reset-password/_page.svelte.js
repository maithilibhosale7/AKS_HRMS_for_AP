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
    let newPass = "";
    let confirmPass = "";
    $$renderer2.push(`<div class="background svelte-654myr"${attr_style(`background-image: url(${stringify(Project_Theme_Settings.login_background_image)});`)}><div class="login-container w-[90%] sm:w-[450px] p-10 svelte-654myr"><h2 class="text-2xl font-bold text-gray-800 mb-2">Password Expired</h2> <p class="text-sm text-gray-500 mb-8">For security purposes, you must update your password every 90 days.</p> <form class="space-y-4"><div><label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">New Password</label> <input type="password"${attr("value", newPass)} required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"/></div> <div><label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirm Password</label> <input type="password"${attr("value", confirmPass)} required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"/></div> <button type="submit" class="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]">Update Password &amp; Access Dashboard</button></form></div></div>`);
  });
}
export {
  _page as default
};
