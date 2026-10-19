import { json } from "@sveltejs/kit";
async function POST({ cookies }) {
  cookies.delete("AKS_Session_Token", { path: "/" });
  return json({ status: "success", message: "Logged out successfully" });
}
export {
  POST
};
