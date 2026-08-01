import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserProfile } from '../../store/useAuthStore';

export interface Post {
  id: string;
  userId: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  imageUrl?: string;
  documentUrl?: string; // Support for PDFs/Docs
  documentName?: string;
  createdAt: unknown;
  likes: string[];
  commentsCount: number;
  comments?: Comment[];
}

const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve((event.target?.result as string) || "");
      img.src = (event.target?.result as string) || "";
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

const uploadMediaFile = async (mediaFile: File, userUid: string): Promise<{ url: string, isDocument: boolean }> => {
  const isDocument = mediaFile.type.includes('pdf') || mediaFile.type.includes('document') || mediaFile.name.endsWith('.pdf');
  let fallbackData = "";

  if (!isDocument) {
    fallbackData = await compressImage(mediaFile);
  }

  try {
    const uploadPromise = (async () => {
      const safeName = mediaFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `posts/${userUid}_${Date.now()}_${safeName}`);
      const snapshot = await uploadBytes(storageRef, mediaFile);
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error("Storage upload timed out")), 5000)
    );

    const url = await Promise.race([uploadPromise, timeoutPromise]);
    return { url, isDocument };
  } catch (err) {
    console.warn("Storage upload failed or timed out. Falling back if image:", err);
    if (!isDocument && fallbackData) {
      return { url: fallbackData, isDocument: false };
    }
    throw new Error("Failed to upload document");
  }
};

// Create a new post
export const createPost = async (
  user: UserProfile, 
  content: string, 
  mediaFile?: File | null
) => {
  try {
    let imageUrl = null;
    let documentUrl = null;
    let documentName = null;

    if (mediaFile) {
      const result = await uploadMediaFile(mediaFile, user.uid);
      if (result.isDocument) {
        documentUrl = result.url;
        documentName = mediaFile.name;
      } else {
        imageUrl = result.url;
      }
    }

    // Add post to Firestore
    const postData = {
      userId: user.uid,
      user: {
        name: user.fullName,
        handle: user.username,
        avatar: user.avatar || user.fullName.substring(0, 2).toUpperCase()
      },
      content,
      ...(imageUrl && { imageUrl }),
      ...(documentUrl && { documentUrl, documentName }),
      createdAt: serverTimestamp(),
      likes: [],
      commentsCount: 0
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return { success: true, postId: docRef.id };
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Update a post
export const updatePost = async (postId: string, newContent: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { content: newContent });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Subscribe to real-time feed updates
export const subscribeToFeed = (limitCount: number, callback: (posts: Post[]) => void) => {
  const q = query(
    collection(db, 'posts'), 
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    callback(posts);
  });
};

// Fetch feed posts once
export const getFeedPosts = async (limitCount: number = 20) => {
  try {
    const q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const posts: Post[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    return { success: true, posts };
  } catch (error: unknown) {
    console.error("Error getting feed posts:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Toggle a like on a post
export const toggleLike = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const postData = postSnap.data() as Post;
      const isLiked = postData.likes?.includes(userId);

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
      
      if (!isLiked && postData.userId !== userId) {
        // Fire and forget notification logic
        (async () => {
          try {
            const { getUserById } = await import('./users');
            const userRes = await getUserById(userId);
            const likerName = userRes.success && userRes.user ? userRes.user.fullName : 'Someone';
            
            const title = "New Like";
            const messageBody = `${likerName} liked your post.`;
            
            const { createNotification } = await import('./notifications');
            await createNotification({
              userId: postData.userId,
              type: "like",
              title,
              message: messageBody,
              link: `/`,
              senderId: userId,
              senderName: likerName,
              senderAvatar: userRes.success && userRes.user ? userRes.user.avatar : ''
            });

            fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: postData.userId,
                title,
                body: messageBody,
                url: "/"
              })
            }).catch(console.error);
          } catch (e) {
            console.error(e);
          }
        })();
      }

      return { success: true, isLiked: !isLiked };
    }
    return { success: false, error: "Post not found" };
  } catch (error: unknown) {
    console.error("Error toggling like:", error);
    return { success: false, error: (error as Error).message };
  }
};

export interface Comment {
  id: string;
  userId: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  replyToId?: string;
}

// Add a comment to a post
export const addComment = async (postId: string, user: UserProfile, content: string, replyToId?: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const postData = postSnap.data() as Post;
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: user.uid,
        user: {
          name: user.fullName,
          handle: user.username,
          avatar: user.avatar || user.fullName.substring(0, 2).toUpperCase()
        },
        content,
        createdAt: new Date().toISOString(),
        ...(replyToId && { replyToId })
      };

      const currentComments = postSnap.data().comments || [];
      await updateDoc(postRef, {
        comments: [...currentComments, newComment],
        commentsCount: (postSnap.data().commentsCount || 0) + 1
      });

      // Notify post author if not their own comment
      if (postData.userId !== user.uid) {
        (async () => {
          try {
            const { createNotification } = await import('./notifications');
            const title = "New Comment";
            const messageBody = `${user.fullName} commented on your post.`;
            
            await createNotification({
              userId: postData.userId,
              type: "comment",
              title,
              message: messageBody,
              link: `/`,
              senderId: user.uid,
              senderName: user.fullName,
              senderAvatar: user.avatar || ''
            });

            fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: postData.userId,
                title,
                body: messageBody,
                url: "/"
              })
            }).catch(console.error);
          } catch (e) {
            console.error(e);
          }
        })();
      }

      return { success: true };
    }
    return { success: false, error: "Post not found" };
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Update a comment
export const updateComment = async (postId: string, commentId: string, newContent: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const currentComments = postSnap.data().comments || [];
      const updatedComments = currentComments.map((c: Comment) => {
        if (c.id === commentId) {
          return { ...c, content: newContent };
        }
        return c;
      });
      
      await updateDoc(postRef, { comments: updatedComments });
      return { success: true };
    }
    return { success: false, error: "Post not found" };
  } catch (error: unknown) {
    console.error("Error updating comment:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Delete a comment
export const deleteComment = async (postId: string, commentId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const currentComments = postSnap.data().comments || [];
      // Filter out the comment itself AND any replies to it
      const updatedComments = currentComments.filter((c: Comment) => c.id !== commentId && c.replyToId !== commentId);
      
      const removedCount = currentComments.length - updatedComments.length;
      
      await updateDoc(postRef, {
        comments: updatedComments,
        commentsCount: Math.max(0, (postSnap.data().commentsCount || 0) - removedCount)
      });

      return { success: true };
    }
    return { success: false, error: "Post not found" };
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Toggle save a post for a user
export const toggleSavePost = async (postId: string, userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const savedPosts = userData.savedPosts || [];
      const isSaved = savedPosts.includes(postId);

      await updateDoc(userRef, {
        savedPosts: isSaved ? arrayRemove(postId) : arrayUnion(postId)
      });
      return { success: true, isSaved: !isSaved };
    }
    return { success: false, error: "User not found" };
  } catch (error: unknown) {
    console.error("Error saving post:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Delete a post
export const deletePost = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    return { success: false, error: (error as Error).message };
  }
};
