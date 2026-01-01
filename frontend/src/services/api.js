import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API methods
export const authAPI = {
    createProfile: (uid, email, displayName, role) =>
        axios.post(`${API_URL}/auth/profile`, { uid, email, displayName, role }),

    getCurrentUser: () => api.get('/auth/me'),

    getEngineers: () => api.get('/auth/engineers')
};

export const ticketsAPI = {
    createTicket: (ticketData) => api.post('/tickets', ticketData),

    getTickets: (filters) =>
        api.get('/tickets', { params: filters }),

    getTicketById: (id) => api.get(`/tickets/${id}`),

    updateTicket: (id, updates) => api.put(`/tickets/${id}`, updates),

    addComment: (id, commentText) =>
        api.post(`/tickets/${id}/comments`, { commentText }),

    resolveTicket: (id, resolutionText) =>
        api.post(`/tickets/${id}/resolve`, { resolutionText }),

    getSimilarTickets: (id) => api.get(`/tickets/${id}/recommendations`),

    rateTicket: (id, score, feedback) => api.post(`/tickets/${id}/rate`, { score, feedback })
};

export const analyticsAPI = {
    getAnalytics: () => api.get('/analytics'),
    getTrends: (days = 7) => api.get(`/analytics/trends?days=${days}`),
    getSLAStats: () => api.get('/analytics/sla')
};

export const emailAPI = {
    sendPasswordResetOTP: (email) => api.post('/email/send-password-reset-otp', { email }),
    sendEmailVerificationOTP: (email) => api.post('/email/send-verification-otp', { email }),
    verifyOTP: (email, otp, purpose) => api.post('/email/verify-otp', { email, otp, purpose })
};

export default api;
