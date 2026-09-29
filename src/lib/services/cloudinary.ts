import { getAuth } from 'firebase/auth';

/**
 * Uploads a file directly to Cloudinary using a signed request from our secure backend.
 * @param file The File or Blob object to upload
 * @param folder The folder name in Cloudinary to organize uploads (e.g., "avatars", "posts", "ads")
 * @param resourceType The type of media ('image', 'video', 'raw', 'auto')
 * @returns The secure HTTPS URL of the uploaded media
 */
export const uploadMediaToCloudinary = async (
  file: File | Blob,
  folder: string,
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<string> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to upload files.');
  }

  const token = await user.getIdToken();

  // 1. Get Signature from our backend
  const sigRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ folder })
  });

  if (!sigRes.ok) {
    throw new Error('Failed to get upload signature');
  }

  const { signature, timestamp } = await sigRes.json();

  // 2. Upload directly to Cloudinary
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkayul64b';
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '963534816781882';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    console.error('Cloudinary upload error:', errorData);
    throw new Error('Failed to upload media to Cloudinary');
  }

  const data = await uploadRes.json();
  let finalUrl = data.secure_url;
  
  // Apply auto-optimization for images (auto format, auto quality)
  if (resourceType === 'image' || (resourceType === 'auto' && file.type.startsWith('image/'))) {
    // e.g. res.cloudinary.com/dkayul64b/image/upload/v12345/folder/file.jpg
    // becomes res.cloudinary.com/dkayul64b/image/upload/q_auto,f_auto/v12345/folder/file.jpg
    finalUrl = finalUrl.replace('/upload/', '/upload/q_auto,f_auto/');
  }
  
  return finalUrl;
};
