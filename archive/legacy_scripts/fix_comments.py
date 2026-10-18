with open("src/lib/services/posts.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_add = """      if (postSnap.exists()) {
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
        });"""

new_add = """      if (postSnap.exists()) {
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

        const { arrayUnion, increment } = await import('firebase/firestore');
        await updateDoc(postRef, {
          comments: arrayUnion(newComment),
          commentsCount: increment(1)
        });"""

content = content.replace(old_add, new_add)

with open("src/lib/services/posts.ts", "w", encoding="utf-8") as f:
    f.write(content)
