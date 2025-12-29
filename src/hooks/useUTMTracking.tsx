import { useEffect, useState } from 'react';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

const UTM_STORAGE_KEY = 'wla_utm_params';

export const useUTMTracking = () => {
  const [utmParams, setUtmParams] = useState<UTMParams>(() => {
    // Try to get from sessionStorage first
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    
    const newUtmParams: UTMParams = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
    };

    // Only update if we have at least one UTM param
    const hasUtmParams = Object.values(newUtmParams).some(v => v !== null);
    
    if (hasUtmParams) {
      setUtmParams(newUtmParams);
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(newUtmParams));
    }
  }, []);

  return utmParams;
};

// Helper to get UTM params without hook (for form submissions)
export const getStoredUTMParams = (): UTMParams => {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    };
  }

  const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON
    }
  }

  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
  };
};
