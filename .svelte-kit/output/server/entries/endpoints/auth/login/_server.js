import { json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { V as VITE_API_BASE_URL, B as BACKEND_API_KEY, J as JWT_SECRET } from "../../../../chunks/private.js";
async function POST({ request, cookies }) {
  const { username, password } = await request.json();
  try {
    console.log(`[Auth] Connecting to: ${VITE_API_BASE_URL}/API_Files/Endpoints/Auth_Login.php`);
    const response = await fetch(`${VITE_API_BASE_URL}/API_Files/Endpoints/Auth_Login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": BACKEND_API_KEY
      },
      body: JSON.stringify({ username, password })
    });
    const responseData = await response.json();
    const userInfo = responseData.data ? responseData.data.User_Info : responseData.User_Info;
    if (responseData.status === "success" && userInfo && userInfo.Master_User_ID) {
      const token = jwt.sign(
        {
          user_id: userInfo.Master_User_ID,
          username: userInfo.Username,
          password_expired: responseData.password_expired || false
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      cookies.set("AKS_Session_Token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        // Set to true if you move to HTTPS later
        maxAge: 60 * 60 * 8
        // 8 Hours
      });
      return json({
        status: "success",
        user: userInfo,
        token
      });
    } else {
      return json({
        status: "error",
        message: responseData.message || "Invalid Credentials"
      }, { status: 401 });
    }
  } catch (err) {
    console.error("[Auth Error]", err);
    return json({
      status: "error",
      message: "Connection Failed. Please check terminal for details."
    }, { status: 500 });
  }
}
export {
  POST
};
