# ⚡ Splash Screen Speed Optimization Plan

You are absolutely right. While waiting for the profile to load completely fixes the "Guest" flicker, 5-10 seconds is way too long for a Splash Screen to stay visible. A user expects the app to open within 1-3 seconds. 

The delay happens because your app is waiting for a brand new network request to Firestore every single time it opens. If the user's network drops slightly, it hangs.

Here is how we will aggressively optimize the load time down to 1-3 seconds:

## Proposed Changes

### 1. Enable Firestore Offline Caching (The Magic Fix)
Currently, Firebase is fetching from the cloud every time. We will enable **IndexedDB Persistence**. 
- **What this does:** The very first time you load the app, it saves your profile to your phone's local storage. The next time you open the app, Firebase pulls your profile from your phone's memory in **under 100 milliseconds**, dismissing the Splash Screen instantly! It will then silently fetch any updates in the background.
#### [MODIFY] `src/lib/firebase.ts`
```typescript
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const db = getFirestore(app);

// Enable offline caching on the client side
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.error("Persistence failed:", err);
  });
}
```

### 2. Implement a 3-Second Hard Fallback Timer
Even on the very first login (when there is no cache), the app shouldn't hang on the splash screen forever if the network is bad.
- **What this does:** We will add a strict timer to `AuthProvider.tsx`. If Firebase hasn't returned your profile within exactly 3 seconds, the Splash Screen will forcefully dismiss itself. You'll see the app skeletons load, which feels much faster to a user than being stuck on a logo.
#### [MODIFY] `src/components/providers/AuthProvider.tsx`
```typescript
// Fallback: forcefully drop splash screen after 3 seconds no matter what
useEffect(() => {
  const safetyTimer = setTimeout(() => {
    setLoading(false);
  }, 3000);

  return () => clearTimeout(safetyTimer);
}, [setLoading]);
```

---
## Verification Plan
1. I will implement these changes locally and run the Next.js compiler to ensure no build issues.
2. I will push the changes to Netlify.
3. **Your test:** Open the app on your phone. The first load might take 2-3 seconds, but close the app and open it again. The second load should blast past the splash screen in less than 1 second!

**Does this dual-strategy (Caching + Hard Timeout) sound like the right plan? Click Proceed to approve!**
