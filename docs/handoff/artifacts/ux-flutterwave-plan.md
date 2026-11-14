# Implementation Plan: True PWA Skeletons & Flutterwave Currency Fix

Your developer is 100% correct on both accounts! You have exactly diagnosed the auth-delay issue, and the Flutterwave error is indeed caused by passing `USD` to an account configured primarily for `NGN` settlement.

Here is the plan to perfectly resolve both of these issues:

## Goal Description
1. **True PWA Skeleton UI (Solve the "Guest" Flicker permanently):** We will remove the full-screen Splash Screen that blocks the app. Instead, we will implement the "Render UI independently of data" philosophy. The app shell (navigation, header, feed background) will load *instantly*. While Firebase verifies the session, the app will show shimmering "Skeletons" (placeholders) instead of showing the "Viewing as Guest" box.
2. **Flutterwave NGN Override:** We will override the Flutterwave initialization config to *always* charge in NGN, regardless of what currency the user is viewing the app in. We will convert the USD base price to NGN automatically before sending the payload to Flutterwave.

---

## Proposed Changes

### 1. Fix the "Guest" Flicker with Skeletons
We will update `PostComposer.tsx` to respect the `isLoading` state from `useAuthStore`.
#### [MODIFY] `src/components/feed/PostComposer.tsx`
```tsx
const { profile, isLoading } = useAuthStore();

// While checking auth, show a skeleton instead of the Guest box
if (isLoading) {
  return (
    <div className="neo-card p-6 mb-6 h-[120px] bg-slate-900/60 rounded-2xl animate-pulse border border-white/5" />
  );
}

if (!profile) {
  return ( ... Viewing as Guest ... )
}
```

### 2. Remove the Blocking Splash Screen
Since we are using Skeletons to mask the auth delay, we no longer need the app-blocking Splash Screen. The user can start scrolling the feed instantly.
#### [MODIFY] `src/components/providers/AuthProvider.tsx`
- We will remove `<SplashScreen isLoading={isLoading} />` so that `{children}` render instantly. 

### 3. Fix the Flutterwave Currency Error
We will force the Flutterwave configuration to process the transaction in NGN, calculating the equivalent amount in Naira using our standard exchange rate.
#### [MODIFY] `src/app/(dashboard)/premium/page.tsx`
```tsx
const baseUSD = tier === 'pro' ? 2 : 5;
// Always process the actual charge in NGN to satisfy Flutterwave restrictions
const ngnRate = CURRENCIES['NGN'].rateFromUSD; // e.g., 1500
const chargeAmountNGN = baseUSD * ngnRate;

const config = {
  public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
  tx_ref: `rhockstar_${tier}_${Date.now()}`,
  amount: chargeAmountNGN, 
  currency: 'NGN', // Forces Flutterwave to accept standard Nigerian cards
  // ...
};
```

---

## User Review Required
- **UX Impact:** By removing the Splash screen, the app will open lightning-fast. You'll see the layout immediately, and the post area will "shimmer" (skeleton animation) for a split second before popping in your face and feed. 
- **Payment Impact:** Users paying with international cards will be charged the equivalent NGN amount (e.g., ₦3,000 instead of $2). Flutterwave will handle their bank's conversion automatically.

**If this plan sounds perfect to you, click "Proceed" and I will implement both fixes immediately!**
