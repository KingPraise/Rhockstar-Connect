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
}

// Create a new post
export const createPost = async (
  user: UserProfile, 
  content: string, 
  imageFile?: File | null
) => {
  try {
    let imageUrl = null;

    if (imageFile) {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `posts/${user.uid}_${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
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
