import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { J as JWT_SECRET } from "../chunks/private.js";
async function handle({ event, resolve }) {
  const cookies = parse(event.request.headers.get("cookie") || "");
  const token = cookies["AKS_Session_Token"];
  event.locals.user = null;
  event.locals.authenticated = false;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      event.locals.user = decoded;
      event.locals.authenticated = true;
    } catch (err) {
      event.locals.user = null;
      event.locals.authenticated = false;
    }
  }
  const response = await resolve(event);
  return response;
}
export {
  handle
};
