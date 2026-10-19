import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ cookies }) {
    // Clear the same cookie that login/+server.js sets ('AKS_Session_Token').
    // Using cookies.delete() ensures the Set-Cookie header flags match exactly
    // what the browser expects to evict the cookie (path must match login).
    cookies.delete('AKS_Session_Token', { path: '/' });
    return json({ status: 'success', message: 'Logged out successfully' });
}