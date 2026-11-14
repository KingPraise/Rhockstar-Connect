## Goal Description
Migrate the project away from Firebase Storage to Cloudinary for all media uploads to avoid Firebase Blaze plan requirements. Configure the Firebase Admin SDK using the provided service account to enable server-side push notifications. Clarify Flutterwave testing procedures, and clean up obsolete project files.

## User Review Required
- **Flutterwave Keys**: We will strictly use **Flutterwave Test Keys** for now. This allows us to simulate successful and failed payments using dummy cards without spending real money.
- **Cloudinary Security Architecture**: To prevent exposing your API Secret to the frontend, and to avoid Netlify/Vercel serverless function size limits (which would happen if we sent large files through the backend), we will use a **Signed Direct Upload** approach. The frontend will ask the backend for a cryptographic signature, then upload the file directly to Cloudinary.

## Proposed Changes

### 1. Environment Configuration
#### [MODIFY] `.env.local`
- Safely inject `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Safely inject `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` for the Admin SDK.

### 2. Cloudinary Upload Infrastructure
#### [NEW] `src/app/api/cloudinary/sign/route.ts`
- Creates a secure API endpoint that signs upload requests using your API Secret.
#### [NEW] `src/lib/services/cloudinary.ts`
- Exposes an `uploadMedia(file: File)` helper function that fetches the signature and uploads the file directly to Cloudinary.

### 3. Replacing Firebase Storage across the App
#### [MODIFY] `src/lib/services/posts.ts`
#### [MODIFY] `src/components/ads/CreateAdModal.tsx`
#### [MODIFY] `src/components/profile/EditProfileModal.tsx`
#### [MODIFY] `src/components/chat/ChatWindow.tsx` (or wherever voice/images are sent)
- Strip out `firebase/storage` imports (`uploadBytes`, `getDownloadURL`).
- Replace with the new `uploadMedia` function.

### 4. Cleanup
#### [DELETE] `storage.rules`
- No longer needed since Firebase Storage is abandoned.
#### [DELETE] Unimportant/Boilerplate Files
- Any leftover mock data or boilerplate Next.js files identified during the cleanup phase.

## Verification Plan
### Manual Verification
1. **Cloudinary**: User updates their profile picture or posts an image. Verification passes if the image successfully loads and its URL points to `res.cloudinary.com/<cloud_name>/`.
2. **Push Notifications**: User sends a direct message to a test account. Verification passes if a push notification is delivered and no `Firebase Admin missing credentials` errors appear in the server logs.
3. **Payments**: User attempts to purchase a subscription using a Flutterwave test card. Verification passes if the transaction succeeds and the user's tier is upgraded in Firestore.
