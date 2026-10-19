import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { VITE_API_BASE_URL, BACKEND_API_KEY, JWT_SECRET } from '$env/static/private';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, cookies }) {
    const { username, password } = await request.json();

    try {
        console.log(`[Auth] Connecting to: ${VITE_API_BASE_URL}/API_Files/Endpoints/Auth_Login.php`);

        // 1. Forward Credentials to PHP Backend
        const response = await fetch(`${VITE_API_BASE_URL}/API_Files/Endpoints/Auth_Login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': BACKEND_API_KEY
            },
            body: JSON.stringify({ username, password })
        });

        // 2. Parse the PHP Response
        const responseData = await response.json();

        // 3. Extract User Info (Handling the nested "data" wrapper from PHP)
        // Your PHP sends: { status: "success", data: { User_Info: { ... } } }
        const userInfo = responseData.data ? responseData.data.User_Info : responseData.User_Info;

        // 4. Validate Success
        if (responseData.status === 'success' && userInfo && userInfo.Master_User_ID) {
            
            // A. Create Secure Token (JWT)
            const token = jwt.sign(
                { 
                    user_id: userInfo.Master_User_ID,
                    username: userInfo.Username,
                    password_expired: responseData.password_expired || false
                }, 
                JWT_SECRET, 
                { expiresIn: '8h' }
            );

            // B. Set HttpOnly Cookie (The "VIP Pass")
            cookies.set('AKS_Session_Token', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: false, // Set to true if you move to HTTPS later
                maxAge: 60 * 60 * 8 // 8 Hours
            });

            // C. Return Success to Frontend
            return json({
                status: 'success',
                user: userInfo,
                token: token
            });

        } else {
            // 5. Handle Login Failure
            return json({ 
                status: 'error', 
                message: responseData.message || 'Invalid Credentials' 
            }, { status: 401 });
        }

    } catch (err) {
        console.error("[Auth Error]", err);
        return json({ 
            status: 'error', 
            message: 'Connection Failed. Please check terminal for details.' 
        }, { status: 500 });
    }
}