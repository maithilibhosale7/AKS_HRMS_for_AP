// src/lib/utils/api.js
import { error } from '@sveltejs/kit';

/**
 * Universal API Caller
 * @param {string} url - The API_PATH to call
 * @param {object} body - JSON payload (optional)
 * @param {{ signal?: AbortSignal }} [options] - fetch options (e.g. AbortController.signal)
 * @returns {Promise<any>} - The 'data' payload from the server
 */
export async function post(url, body = {}, options = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: options.signal
        });

        const result = await response.json();

        if (result.status === 'success') {
            return result.data;
        } else {
            console.error(`API Error (${url}):`, result.message);
            throw new Error(result.message || 'Server Error');
        }
    } catch (/** @type {any} */ err) {
        if (err?.name === 'AbortError') throw err;
        console.error("Network/System Error:", err);
        throw err;
    }
}