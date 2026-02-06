import React, { createContext, useContext, useState, useEffect } from 'react';
import { assetApi } from '../api/assets';


const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    siteTitle: 'Loading...',
    logo: '',
    fallbackBannerUrl: ''
  });

  const refreshBranding = async () => {
    try {
      const data = await assetApi.getAssets();
      setBranding(data);
      // Optional: Update browser tab title
      document.title = data.siteTitle || 'Verbis AI';
    } catch (err) {
      console.error("Failed to load branding", err);
    }
  };

  useEffect(() => {
    refreshBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);