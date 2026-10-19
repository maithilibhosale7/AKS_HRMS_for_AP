import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private'; // Safe import for secrets

export function respond(body) {
    // 1. Handle Error Case
    if (body.status !== 'success') {
        return json(body, { status: 401 });
    }

    // 2. Create a Secure JWT
    const token = jwt.sign(
        { 
            user_id: body.user.Master_User_ID, // Matches your new DB Schema
            password_expired: body.password_expired 
        }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
    );

    // 3. Return Response with Cookie Header
    // SvelteKit V2 requires returning a 'Response' object via json()
    return json(body, {
        headers: {
            'set-cookie': `jwt=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`
        }
    });
}