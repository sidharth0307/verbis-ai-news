import api from "./axios";

const categoryApi = {
  // PUBLIC: Get active categories for the Navbar/Sidebar
  getActive: async () => {
    const response = await api.get('/categories/active');
    return response.data;
  },

  // ADMIN: Get all categories (including inactive ones)
  getAll: async () => {
    const response = await api.get('/categories/admin/all');
    return response.data;
  },

  // ADMIN: Get empty categories (Alerts)
  getEmpty: async () => {
    const response = await api.get('/categories/admin/empty');
    return response.data;
  },

  // ADMIN: Create a new silo
  create: async (categoryData) => {
    // categoryData: { name, searchQuery, articlesPerDay, order }
    const response = await api.post('/categories/admin/create', categoryData);
    return response.data;
  },

  // ADMIN: Update existing category (Triggers article cascade on backend)
  update: async (id, updateData) => {
    const response = await api.put(`/categories/admin/update/${id}`, updateData);
    return response.data;
  },

  // ADMIN: Delete a category
  delete: async (id, config = {}) => {
    // Pass the config as the second argument
    const response = await api.delete(`/categories/admin/delete/${id}`, config);
    return response.data;
  }
};

export default categoryApi;