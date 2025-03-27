import router from "./router.js";
import store from "./store.js";  // ✅ Vuex store ko import karein

export const fetchWithAuth = async (url = '/', options = { auth: true }) => {
    const origin = window.location.origin;
    
    // 🔹 Latest user object get karein
    let user = JSON.parse(localStorage.getItem('user'));
    let authToken = user?.token;

    // 🔥 If token missing, try updating Vuex store from localStorage
    if (!authToken) {
        store.commit("setUser");
        user = JSON.parse(localStorage.getItem('user'));  // ✅ Update user after commit
        authToken = user?.token;
    }

    // 🔹 If still missing, redirect to login
    if (options.auth && !authToken) {
        console.error("Authentication token is missing.");
        router.push('/login');
        return;
    }

    const fetchOptions = {
        method: options.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authentication-Token': authToken } : {}),
            ...options.headers,
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
        ...options,
    };

    try {
        const res = await fetch(`${origin}${url}`, fetchOptions);

        if (res.status === 403 || res.status === 405) {
            router.push('/login');
            return;
        }

        return res;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};
