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
    }
};
