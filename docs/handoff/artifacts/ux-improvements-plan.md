# UX & PWA Improvements Plan

Based on your feedback, we have three main issues affecting the app's mobile/PWA experience:
1. **The Auth Flicker:** The app shows "Viewing as Guest" for 1-2 seconds while Firebase checks if you are logged in.
2. **Empty States on Launch:** The app feels broken on slow networks before data loads.
3. **Erratice Back Button:** Hardware back buttons on Android/PWA take you too far back, sometimes dumping you out to the landing page.

Here is the step-by-step plan to fix all of these professionally:

## Step 1: Implement the Initial Splash Screen 🚀
To fix the 1-2 second "Viewing as Guest" flicker, we will implement your brilliant idea: a native-feeling Splash Screen.
- **Action:** Update the global Auth State (`useAuthStore`) to include an `isInitializing` flag that starts as `true`.
- **Action:** Create a `SplashScreen.tsx` component featuring the RC Logo with a subtle pulsing animation.
- **Action:** Wrap the app so that while Firebase is figuring out who you are (the first 1-2 seconds), it shows the beautiful splash screen instead of a broken feed.

## Step 2: Fix PWA Bottom Navigation History 🧭
Right now, if you tap `Home` -> `Jobs` -> `Messages` -> `Profile`, the browser remembers every single tap. If you hit the physical back button, it rewinds through all of them, which feels wrong for a mobile app.
- **Action:** Update the `MobileNav.tsx` (Bottom tab bar) to use `router.replace()` instead of `router.push()`.
- **Result:** Switching bottom tabs won't build up a massive history stack. Pressing back will predictably take you out of the app or to the main feed, exactly like Instagram or Twitter.

## Step 3: Better Skeleton Loaders for Data ☠️
If the user opens the app and data takes a few seconds to load (or they are on a slow connection), they shouldn't see a blank screen.
- **Action:** Ensure the Feed and Messages pages display shimmering "Skeleton" placeholders while fetching from Firestore. 
- **Result:** The app feels instantly responsive and alive, even before the text and images arrive.

---
**Does this plan sound good to you?** Click **Proceed** if you approve, and I will execute Step 1 immediately!
