import jwt from 'jsonwebtoken';
import { parse } from 'cookie'; // Use 'cookie' library to parse headers safely
import { JWT_SECRET } from '$env/static/private'; // Securely load key from .env

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    
    // 1. Get cookies from the request
    const cookies = parse(event.request.headers.get('cookie') || '');
    const token = cookies['AKS_Session_Token']; // Must match the name set in Login endpoint

    // 2. Default State (Guest)
    event.locals.user = null;
    event.locals.authenticated = false;

    // 3. Verify Token (if exists)
    if (token) {
        try {
            // This is where jsonwebtoken does the heavy lifting
            // It uses the Secret Key to check if the token is fake
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // If valid, attach user data to the request object
            event.locals.user = decoded;
            event.locals.authenticated = true;

        } catch (err) {
            // Token is invalid or expired
            event.locals.user = null;
            event.locals.authenticated = false;
        }
    }

    // 4. Continue with the request
    const response = await resolve(event);
    return response;
}