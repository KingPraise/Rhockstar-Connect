with open("firestore.rules", "r", encoding="utf-8") as f:
    content = f.read()

new_rules = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) || isAdmin();
      allow update: if (isOwner(userId) && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']))) || isAdmin();
      allow delete: if isAdmin();
    }

    // Advertisements Collection
    match /advertisements/{adId} {
      allow read: if true; // Public feed sponsored posts
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.companyId == request.auth.uid);
    }

    // Posts Collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid);
    }

    // Communities Collection
    match /communities/{communityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }

    // Direct Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated() && (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid || resource.data.communityId != null || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.senderId == request.auth.uid || isAdmin());
    }

    // Mail Trigger Email Collection
    match /mail/{mailId} {
      allow create: if isAuthenticated();
      allow read, update, delete: if isAdmin();
    }

    // Reports Collection
    match /reports/{reportId} {
      allow create: if isAuthenticated();
      allow read, update, delete: if isAdmin();
    }
    
    // Missing Collections Added
    match /chats/{chatId} {
      allow read, update: if isAuthenticated() && request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
    }
    
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.employerId == request.auth.uid);
    }
    
    match /job_applications/{appId} {
      allow read: if isAuthenticated() && (resource.data.applicantId == request.auth.uid || resource.data.employerId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.applicantId == request.auth.uid || resource.data.employerId == request.auth.uid || isAdmin());
    }
    
    match /connections/{connId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.userId == request.auth.uid || resource.data.targetId == request.auth.uid);
    }
    
    match /follows/{followId} {
      allow read: if isAuthenticated();
      allow create, delete: if isAuthenticated();
    }
    
    match /dating_interactions/{interactionId} {
      allow read, create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }
    
    match /notifications/{notificationId} {
      allow read, update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
    }
  }
}
"""

with open("firestore.rules", "w", encoding="utf-8") as f:
    f.write(new_rules)
