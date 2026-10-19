import { writable } from 'svelte/store';

// 1. Define a Safe Default State (so the app never crashes on load)
const initialState = {
    User_Information: {},
    Page_Information: {}
};

export const Live_Data_Storage = writable(initialState);

// 2. Persist to SessionStorage (Optional but recommended)
if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('Live_Data');
    if (stored) {
        Live_Data_Storage.set(JSON.parse(stored));
    }
    
    Live_Data_Storage.subscribe(value => {
        sessionStorage.setItem('Live_Data', JSON.stringify(value));
    });
}