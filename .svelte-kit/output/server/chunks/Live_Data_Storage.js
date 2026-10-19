import { w as writable } from "./index.js";
const initialState = {
  User_Information: {},
  Page_Information: {}
};
const Live_Data_Storage = writable(initialState);
if (typeof window !== "undefined") {
  const stored = sessionStorage.getItem("Live_Data");
  if (stored) {
    Live_Data_Storage.set(JSON.parse(stored));
  }
  Live_Data_Storage.subscribe((value) => {
    sessionStorage.setItem("Live_Data", JSON.stringify(value));
  });
}
export {
  Live_Data_Storage as L
};
