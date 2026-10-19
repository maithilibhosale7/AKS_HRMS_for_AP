import { w as writable } from "./index.js";
import { jwtDecode } from "jwt-decode";
const initialState = {
  authenticated: false,
  user: null,
  token: null,
  password_expired: false
};
const SessionStore = writable(initialState);
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1e3;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}
function isBrowserSessionActive() {
  return document.cookie.split(";").some((item) => item.trim().startsWith("aks_session_active="));
}
if (typeof window !== "undefined") {
  const storedSession = localStorage.getItem("AKS_Session");
  if (storedSession && isBrowserSessionActive()) {
    try {
      const parsed = JSON.parse(storedSession);
      if (parsed.token && !isTokenExpired(parsed.token)) {
        SessionStore.set(parsed);
      } else {
        SessionStore.set(initialState);
        localStorage.removeItem("AKS_Session");
      }
    } catch (e) {
      console.error("Failed to parse session", e);
    }
  } else {
    localStorage.removeItem("AKS_Session");
  }
  SessionStore.subscribe((value) => {
    if (value.authenticated) {
      localStorage.setItem("AKS_Session", JSON.stringify(value));
      if (!isBrowserSessionActive()) {
        document.cookie = "aks_session_active=true; path=/; SameSite=Strict";
      }
    } else {
      localStorage.removeItem("AKS_Session");
      document.cookie = "aks_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    }
  });
}
export {
  SessionStore as S
};
