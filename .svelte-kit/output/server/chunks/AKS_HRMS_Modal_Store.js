import { d as derived, w as writable } from "./index.js";
const modal_stack = writable([]);
derived(modal_stack, ($stack) => $stack.length > 0);
derived(modal_stack, ($stack) => $stack[$stack.length - 1] ?? null);
export {
  modal_stack as m
};
