
import { getAuth } from 'firebase/auth';

/**
 * Uploads a file directly to Cloudinary using a signed request from our backend.
 *
 * @param file The File or Blob object to upload
 * @param folder The permitted static upload folder
 * @param resourceType The type of media
 * @param chatId Optional Firestore chat ID. When supplied, the backend
 *               verifies membership and determines the upload folder.
 */
export const uploadMediaToCloudinary = async (
  file: File | Blob,
  folder: string,
  resourceType: 'image' | 'video' | 'auto' = 'auto',
  chatId?: string
): Promise<string> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You must be logged in to upload files.');
  }

  const token = await user.getIdToken();

  // 1. Request an upload signature from our backend.
  const sigRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      folder,
      ...(chatId ? { chatId } : {}),
    }),
  });

  if (!sigRes.ok) {
    let errMsg = 'Failed to get upload signature';

    try {
      const text = await sigRes.text();

      try {
        const errData = JSON.parse(text);
        errMsg = errData.error || errMsg;
      } catch {
        errMsg = `Server Error (${sigRes.status}). ${text.substring(0, 100)}`;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(errMsg);
  }

  const {
    signature,
    timestamp,
    folder: signedFolder,
  } = await sigRes.json();

  if (!signature || !timestamp || !signedFolder) {
    throw new Error('Invalid upload signature response from server.');
  }

  // 2. Upload directly to Cloudinary using the server-approved folder.
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary configuration is missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', signedFolder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    console.error('Cloudinary upload error:', errorData);
    throw new Error('Failed to upload media to Cloudinary');
  }

  const data = await uploadRes.json();
  let finalUrl = data.secure_url;

  // Apply automatic format and quality optimization to images.
  if (
    resourceType === 'image' ||
    (resourceType === 'auto' && file.type.startsWith('image/'))
  ) {
    finalUrl = finalUrl.replace('/upload/', '/upload/q_auto,f_auto/');
  }

  return finalUrl;
};
