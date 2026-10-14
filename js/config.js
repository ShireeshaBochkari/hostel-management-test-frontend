// ==========================================
// BACKEND CONFIGURATION
// ==========================================
// For Local Development: "http://localhost:8080"
// For Render Production: Replace with your Render URL (e.g. "https://your-backend.onrender.com")

window.HOSTEL_CONFIG = {
    BACKEND_URL: "http://localhost:8080",
    get AUTH_API() { return this.BACKEND_URL + "/api/auth"; },
    get ROOMS_API() { return this.BACKEND_URL + "/api/rooms"; },
    get HOSTELLERS_API() { return this.BACKEND_URL + "/api/hostellers"; },
    get MESSAGES_API() { return this.BACKEND_URL + "/api/messages"; },
    get NOTICES_API() { return this.BACKEND_URL + "/api/notices"; },
    get COMPLAINTS_API() { return this.BACKEND_URL + "/api/complaints"; },
    get PAYMENTS_API() { return this.BACKEND_URL + "/api/payments"; },
    get VISITORS_API() { return this.BACKEND_URL + "/api/visitors"; }
};
