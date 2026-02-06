import api from "./axios";

export const settingsApi = {

  // Get current active settings
  getSettings: async () => {
    const response = await api.get(`/settings`);
    return response.data;
  },

  // Update settings
  syncSmartKeys: async (data) => {
    const response = await api.post(`/settings/sync-keys`, data);
    return response.data;
  },

  // Get current active settings
  getAnalytics: async () => {
    const response = await api.get(`/settings/analytics`);
    return response.data;
  },

  // Set cronjob interval and article expiry
  cronShedule: async (data) => {
    const response = await api.post(`/settings/cron-schedule`, data);
    return response.data;
  },
};