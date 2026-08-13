'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const Joyride = dynamic(() => import('./JoyrideWrapper'), { ssr: false });

const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  isLastStep,
}: any) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(56,189,248,0.2)] rounded-2xl p-5 w-[calc(100vw-32px)] md:w-[400px] max-w-[400px] z-[10000]">
      <div className="mb-4">
        {step.content}
      </div>
      <div className="flex items-center justify-between mt-6">
        <button {...closeProps} className="text-slate-400 hover:text-white text-xs font-semibold transition-colors">
          Skip
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button {...backProps} className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all border border-white/5">
              Back
            </button>
          )}
          <button {...primaryProps} className="px-4 py-2 bg-brand text-slate-950 hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] rounded-xl text-xs font-bold transition-all">
            {isLastStep ? 'Finish Tour' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('rhockstar_onboarding_completed') || sessionStorage.getItem('rhockstar_onboarding_dismissed');
    const isMobile = window.innerWidth < 768;

    // Dynamically set steps based on screen size
    setSteps([
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
        target: isMobile ? '#tour-mobile-jobs-nav' : '#tour-network-nav',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">{isMobile ? 'Premium Job Board' : 'Your Professional Network'}</h3>
            <p className="text-slate-300 text-sm">{isMobile ? 'Discover top-tier roles and track your applications directly from here.' : 'Connect with industry leaders, sync up with peers, and build meaningful professional relationships.'}</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'right',
      },
      {
        target: isMobile ? '#tour-mobile-messaging-nav' : '#tour-messaging-nav',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Direct Messaging</h3>
            <p className="text-slate-300 text-sm">Send real-time messages, voice notes, and media to any professional or connection on Rhockstar Connect.</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'right',
      },
      {
        target: isMobile ? '#tour-mobile-dating-nav' : '#tour-dating-nav',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Rhockstar Dating</h3>
            <p className="text-slate-300 text-sm">Opt in to our exclusive professional dating portal to meet ambitious singles in your industry.</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'right',
      },
      {
        target: '#tour-ai-widget',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Your Personal AI Assistant</h3>
            <p className="text-slate-300 text-sm">Need help crafting a cover letter, optimizing your profile, or preparing for an interview? Your AI assistant is available 24/7.</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'top-end',
      },
    ]);

    if (!hasCompletedTour && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
      const timer = setTimeout(() => {
        setRun(true);
        sessionStorage.setItem('rhockstar_onboarding_dismissed', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    const handleReplay = () => {
      setRun(false); // Reset
      setTimeout(() => setRun(true), 100);
    };
    
    window.addEventListener('replay-tour', handleReplay);
    return () => window.removeEventListener('replay-tour', handleReplay);
  }, [pathname]);

  const handleJoyrideCallback = (data: any) => {
    const { status, action } = data;
    const finishedStatuses = ['finished', 'skipped'];
    
    if (finishedStatuses.includes(status) || action === 'close') {
      setRun(false);
      localStorage.setItem('rhockstar_onboarding_completed', 'true');
      sessionStorage.setItem('rhockstar_onboarding_dismissed', 'true');
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      tooltipComponent={CustomTooltip}
      showProgress={false}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#0f172a', // Matches slate-900
          overlayColor: 'rgba(2, 6, 23, 0.85)',
          zIndex: 10000,
        }
      }}
    />
  );
}
