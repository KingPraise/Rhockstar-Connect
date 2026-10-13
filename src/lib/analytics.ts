export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type EventName = 'sign_up' | 'login' | 'complete_profile' | 'join_community' | 'create_post' | 'view_item' | 'share';

export const trackEvent = (eventName: EventName, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_TRACKING_ID) {
    const storedUtms = getStoredUTMs();
    
    (window as any).gtag('event', eventName, {
      ...storedUtms,
      ...eventParams,
    });
  }
};

export const saveUTMsFromURL = (searchParams: URLSearchParams) => {
  if (typeof window === 'undefined') return;
  
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmTerm = searchParams.get('utm_term');
  const utmContent = searchParams.get('utm_content');

  if (utmSource || utmMedium || utmCampaign) {
    const utms = {
      ...(utmSource && { utm_source: utmSource }),
      ...(utmMedium && { utm_medium: utmMedium }),
      ...(utmCampaign && { utm_campaign: utmCampaign }),
      ...(utmTerm && { utm_term: utmTerm }),
      ...(utmContent && { utm_content: utmContent }),
    };
    
    // Store for 30 days
    localStorage.setItem('rhockstar_utms', JSON.stringify(utms));
    localStorage.setItem('rhockstar_utms_expiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());
  }
};

export const getStoredUTMs = () => {
  if (typeof window === 'undefined') return {};
  
  try {
    const expiry = localStorage.getItem('rhockstar_utms_expiry');
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      localStorage.removeItem('rhockstar_utms');
      localStorage.removeItem('rhockstar_utms_expiry');
      return {};
    }
    
    const stored = localStorage.getItem('rhockstar_utms');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};
