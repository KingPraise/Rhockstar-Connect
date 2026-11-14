# Production Polish Implementation Plan

## 1. Offline Loading & Resilience
- **Offline Fallback Route (`src/app/offline/page.tsx`)**:
  - Build a sleek, branded offline fallback page featuring the Rhockstar Connect logo, offline badge/illustration, status indicator, and an interactive "Try Again" / "Reconnect" action.
- **PWA Service Worker Config (`next.config.ts`)**:
  - Configure `@ducanh2912/next-pwa` with `fallbacks: { document: "/offline" }` to ensure any offline navigation gracefully falls back to the pre-cached offline experience.
- **Real-Time Connectivity Toast/Banner (`src/components/ui/OfflineBanner.tsx`)**:
  - Detect `window.addEventListener('offline')` and `window.addEventListener('online')` to provide instantaneous feedback when a user's network connection drops or recovers while navigating.

## 2. Universal Verification Badges
- **Comments & Replies (`src/components/feed/PostCard.tsx`)**:
  - Ensure replies also render `<VerifiedBadge tier={replyUserTier} />` alongside top-level comments.
- **Network / Connections Hub (`src/app/(dashboard)/network/page.tsx`)**:
  - Render `<VerifiedBadge tier={user.subscriptionTier} />` next to full names in the discover, connections, and request grids.
- **Direct & Community Messages (`src/app/(dashboard)/messages/page.tsx`)**:
  - Add `<VerifiedBadge>` to:
    - User selection modal in new chat
    - Conversation list items in inbox
    - Chat header of active DM
    - Community message sender names in group channels
- **Leaderboard Podium & Ranks (`src/components/gamification/LeaderboardView.tsx` & `gamification.ts`)**:
  - Pass `subscriptionTier` through `LeaderboardUser` and display `<VerifiedBadge>` next to the names of Top 3 champions and all ranked members.

## 3. Notification Direction (Deep-Linking Audit)
- Verify `src/app/(dashboard)/notifications/page.tsx` and mobile/popover notification clicks:
  - Likes & Comments -> `/feed?postId=${targetId}&commentId=${commentId}&openComments=true#comment-${commentId}`
  - Messages -> `/messages?chatId=${chatId}`
  - Connections -> `/profile?uid=${senderId}`
  - Jobs -> `/jobs?jobId=${jobId}`

## 4. Real-Time In-App Notifications (Foreground Popups)
- **Component (`src/components/notifications/InAppNotificationBanner.tsx`)**:
  - Subscribe to real-time incoming Firestore notifications in the dashboard.
  - When a new notification arrives while the user is actively on the app:
    - Display an animated floating toast at the top of the screen with sender avatar, message preview, and category badge.
    - Clicking the toast marks it as read and immediately navigates directly to the target post/comment/chat/profile.
    - Provide a quick close button (X) and auto-dismiss after 6 seconds.
    - Add haptic feedback and optional sound chime.
