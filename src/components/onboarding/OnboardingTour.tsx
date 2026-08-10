'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamically import Joyride so it doesn't break SSR
// @ts-ignore
const Joyride = dynamic(() => import('react-joyride').then((mod: any) => mod.default || mod), { ssr: false }) as any;

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side
    const hasCompletedTour = localStorage.getItem('rhockstar_onboarding_completed');
    
    // Only trigger automatically on dashboard pages, not auth pages
    if (!hasCompletedTour && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
      // Small delay to let the dashboard render
      const timer = setTimeout(() => {
        if (window.innerWidth > 768) {
          setRun(true);
        } else {
          // Skip on mobile for better UX, or mark as completed
          localStorage.setItem('rhockstar_onboarding_completed', 'true');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Listen for manual trigger from Settings page
    const handleReplay = () => setRun(true);
    window.addEventListener('replay-tour', handleReplay);
    return () => window.removeEventListener('replay-tour', handleReplay);
  }, [pathname]);

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-left space-y-2">
          <h2 className="text-xl font-bold text-white">Welcome to Rhockstar Connect! 🚀</h2>
          <p className="text-slate-300 text-sm leading-relaxed">Let's take a quick tour of your new professional headquarters. We'll show you where to find everything you need to accelerate your career.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-network-nav',
      content: (
        <div className="text-left space-y-1">
          <h3 className="font-bold text-white">Your Professional Network</h3>
          <p className="text-slate-300 text-sm">Connect with industry leaders, sync up with peers, and build meaningful professional relationships.</p>
        </div>
      ),
    },
    {
      target: '#tour-jobs-nav',
      content: (
        <div className="text-left space-y-1">
          <h3 className="font-bold text-white">Premium Job Board</h3>
          <p className="text-slate-300 text-sm">Discover top-tier roles, track your applications, and find opportunities recommended just for you.</p>
        </div>
      ),
    },
    {
      target: '#tour-dating-nav',
      content: (
        <div className="text-left space-y-1">
          <h3 className="font-bold text-white">Professional Dating</h3>
          <p className="text-slate-300 text-sm">Looking for more than just a professional connection? Opt-in to our exclusive dating network for verified professionals.</p>
        </div>
      ),
    },
    {
      target: '#tour-ai-widget',
      content: (
        <div className="text-left space-y-1">
          <h3 className="font-bold text-white">Your Personal AI Assistant</h3>
          <p className="text-slate-300 text-sm">Need help crafting a cover letter, optimizing your profile, or preparing for an interview? Your AI assistant is available 24/7 right here.</p>
        </div>
      ),
      placement: 'top-end',
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('rhockstar_onboarding_completed', 'true');
    }
  };

  return (
    <Joyride
      steps={steps as any}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1e293b', // slate-800
          backgroundColor: '#1e293b', // slate-800
          overlayColor: 'rgba(2, 6, 23, 0.8)', // slate-950 with 80% opacity
          primaryColor: '#38bdf8', // brand color (sky-400)
          textColor: '#ffffff',
          width: 400,
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        tooltip: {
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        buttonNext: {
          backgroundColor: '#38bdf8',
          borderRadius: '12px',
          padding: '10px 20px',
          fontWeight: 'bold'
        },
        buttonBack: {
          color: '#94a3b8',
          marginRight: 14
        },
        buttonSkip: {
          color: '#94a3b8'
        }
      }}
    />
  );
}
