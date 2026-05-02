import api from './axios';

export const userApi = {
    getAllUsers: async () => {
        const response = await api.get('/users/admin/all');
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/users/admin/${id}`);
        return response.data;
    },

    toggleStatus: async (id) => {
        const response = await api.patch(`/users/admin/${id}/status`);
        return response.data;
    },

    subscribeToNewsletter: async (email) => {
    const response = await api.post("/users/newsletter/subscribe", { email });
    return response.data;
    },

    unsubscribeFromNewsletter: async (email) => {
    const response = await api.get("/users/newsletter/unsubscribe", { params: { email } });
    return response.data;
    }
};
