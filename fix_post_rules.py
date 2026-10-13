with open("firestore.rules", "r", encoding="utf-8") as f:
    content = f.read()

# Replace post rules
old_posts = """    // Posts Collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid);
    }"""

new_posts = """    // Posts Collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        isAdmin() || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'comments', 'commentsCount', 'poll'])
      );
      allow delete: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid);
    }"""

content = content.replace(old_posts, new_posts)

with open("firestore.rules", "w", encoding="utf-8") as f:
    f.write(content)
