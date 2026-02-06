import api from "./axios";

export const assetApi = {
  /**
   * Fetches branding assets: siteTitle, contactPhone, contactEmail, 
   * logo, and fallbackBannerUrl.
   */
  getAssets: async () => {
    try {
      const response = await api.get(`/site-branding`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  },

  /**
   * Updates assets. 
   * @param {Object} data - Contains text fields (siteTitle, etc.) 
   * @param {Object} files - Contains File objects (logo, fallbackBanner)
   */
  updateAssets: async (data, files = {}) => {
  const formData = new FormData();

  // 1. Append basic text fields (siteTitle, contactEmail, etc.)
  const textFields = ['siteTitle', 'contactEmail', 'contactPhone'];
  textFields.forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  // 2. Handle Logo (File vs URL)
  if (files.logo) {
    // If a new file is selected, it takes priority
    formData.append('logo', files.logo);
  } else if (data.logo) {
    // If no file, send the existing or manually pasted URL string
    formData.append('logo', data.logo);
  }

  // 3. Handle Fallback Banner (File vs URL)
  // NOTE: We append it as 'fallbackBanner' because your backend 
  // looks for req.files['fallbackBanner'] OR req.body['fallbackBanner']
  if (files.fallbackBanner) {
    formData.append('fallbackBanner', files.fallbackBanner);
  } else if (data.fallbackBannerUrl) {
    formData.append('fallbackBanner', data.fallbackBanner);
  }

  try {
    const response = await api.put(`/site-branding`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating assets:", error);
    throw error;
  }
}
}