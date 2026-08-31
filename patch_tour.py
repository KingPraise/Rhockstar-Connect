# -*- coding: utf-8 -*-
import os

# 1. Patch MobileHeader.tsx
with open('src/components/layout/MobileHeader.tsx', 'r', encoding='utf-8') as f:
    mobile = f.read()

mobile = mobile.replace(
    'aria-label="Create New"\n            title="Create New Content"',
    'aria-label="Create New"\n            title="Create New Content"\n            id="tour-mobile-create-btn"'
)
with open('src/components/layout/MobileHeader.tsx', 'w', encoding='utf-8') as f:
    f.write(mobile)

# 2. Patch Sidebar.tsx
with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

sidebar = sidebar.replace(
    'title="Create New Content"\n        >',
    'title="Create New Content"\n          id="tour-create-btn"\n        >'
)
with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(sidebar)

# 3. Patch OnboardingTour.tsx
with open('src/components/onboarding/OnboardingTour.tsx', 'r', encoding='utf-8') as f:
    tour = f.read()

# Fix the bug where it pops up on every launch
old_bug_logic = """    if (!hasCompletedTour && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
      const timer = setTimeout(() => {
        setRun(true);
        sessionStorage.setItem('rhockstar_onboarding_dismissed', 'true');
      }, 1000);"""

new_fix_logic = """    // Get the latest auth state to check if user is brand new (e.g. less than 1 hour old or has 0 XP)
    // Actually, setting local storage ON START is safer to prevent endless reloading loops.
    if (!hasCompletedTour && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
      const timer = setTimeout(() => {
        setRun(true);
        // Persist immediately when the tour is launched
        localStorage.setItem('rhockstar_onboarding_completed', 'true');
        sessionStorage.setItem('rhockstar_onboarding_dismissed', 'true');
      }, 1000);"""

tour = tour.replace(old_bug_logic, new_fix_logic)

# Add Gamification and Quick Create Steps
old_steps = """      {
        target: isMobile ? '#tour-mobile-messaging-nav' : '#tour-messaging-nav',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Direct Messaging</h3>
            <p className="text-slate-300 text-sm">Send real-time messages, voice notes, and media to any professional or connection on Rhockstar Connect.</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'right',
      },"""

new_steps = """      {
        target: isMobile ? '#tour-mobile-messaging-nav' : '#tour-messaging-nav',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Communities & Direct Messaging</h3>
            <p className="text-slate-300 text-sm">Send real-time messages, join public community rooms, and connect with peers across the globe.</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'right',
      },
      {
        target: isMobile ? '#tour-mobile-messaging-nav' : '#tour-messaging-nav',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Stardom Ranks & Streaks ⭐</h3>
            <p className="text-slate-300 text-sm">Earn XP by participating in chats, build your daily streak 🔥, and climb the Leaderboard to become a Rhockstar!</p>
          </div>
        ),
        placement: isMobile ? 'top' : 'right',
      },
      {
        target: isMobile ? '#tour-mobile-create-btn' : '#tour-create-btn',
        content: (
          <div className="text-left space-y-1">
            <h3 className="font-bold text-white">Quick Create Menu</h3>
            <p className="text-slate-300 text-sm">Instantly publish posts, launch new chat communities, or post job listings (Employers) from anywhere.</p>
          </div>
        ),
        placement: isMobile ? 'bottom' : 'right',
      },"""

tour = tour.replace(old_steps, new_steps)

with open('src/components/onboarding/OnboardingTour.tsx', 'w', encoding='utf-8') as f:
    f.write(tour)
