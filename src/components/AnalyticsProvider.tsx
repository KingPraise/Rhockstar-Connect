'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import { saveUTMsFromURL, GA_TRACKING_ID } from '@/lib/analytics';

function UTMTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      saveUTMsFromURL(searchParams);
    }
  }, [searchParams]);

  return null;
}

export default function AnalyticsProvider() {
  return (
    <>
      <Suspense fallback={null}>
        <UTMTracker />
      </Suspense>
      {GA_TRACKING_ID ? <GoogleAnalytics gaId={GA_TRACKING_ID} /> : null}
    </>
  );
}
