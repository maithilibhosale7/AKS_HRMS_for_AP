/// <reference types="@sveltejs/kit" />
import { version } from '$service-worker';

// Keep the version in the worker so a new app build replaces this file.
self.__AKS_HRMS_SW_VERSION = version;

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// The installed icon opens the live site. Pages, logins, and API calls
// are not stored on the device, so the system still needs a connection.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
});
