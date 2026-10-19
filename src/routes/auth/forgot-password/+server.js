/* SERVER ROUTE: Password Management Proxy.
- Logic:
    1. Forwards OTP requests and verification steps to the PHP backend.
    2. Keeps the BACKEND_API_KEY hidden from the client.
*/

import { json } from '@sveltejs/kit';
import { VITE_API_BASE_URL, BACKEND_API_KEY } from '$env/static/private';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
    const payload = await request.json();

    try {
        const response = await fetch(`${VITE_API_BASE_URL}/API_Files/Endpoints/Auth_Password_Manager.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': BACKEND_API_KEY
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        return json(result);

    } catch (err) {
        console.error('[Auth/ForgotPassword Error]', err);
        return json({ status: 'error', message: 'Password service communication error.' }, { status: 500 });
    }
}
