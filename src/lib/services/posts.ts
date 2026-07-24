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
  getDoc
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
  createdAt: unknown;
  likes: string[];
  commentsCount: number;
  comments?: Comment[];
}

const uploadImageWithFallback = async (imageFile: File, userUid: string): Promise<string> => {
  const convertToBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(imageFile);
    });
  };

  try {
    const uploadPromise = (async () => {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `posts/${userUid}_${Date.now()}_${safeName}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error("Storage upload timed out")), 5000)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.warn("Storage upload failed or timed out. Falling back to data URL:", err);
    return await convertToBase64();
  }
};

// Create a new post
export const createPost = async (
  user: UserProfile, 
  content: string, 
  imageFile?: File | null
) => {
  try {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadImageWithFallback(imageFile, user.uid);
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

// Subscribe to real-time feed updates
export const subscribeToFeed = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    callback(posts);
  });
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
}

// Add a comment to a post
export const addComment = async (postId: string, user: UserProfile, content: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: user.uid,
        user: {
          name: user.fullName,
          handle: user.username,
          avatar: user.avatar || user.fullName.substring(0, 2).toUpperCase()
        },
        content,
        createdAt: new Date().toISOString()
      };

      const currentComments = postSnap.data().comments || [];
      await updateDoc(postRef, {
        comments: [...currentComments, newComment],
        commentsCount: (postSnap.data().commentsCount || 0) + 1
      });

      return { success: true };
    }
    return { success: false, error: "Post not found" };
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
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
