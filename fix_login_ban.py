with open("src/lib/auth.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# We need to insert a check after we find the user document
# Wait, in loginUser, we fetch `usersRef` if it's a username, but we don't always fetch the user doc before signInWithEmailAndPassword.
# However, we fetch the user doc in `syncAuthStore`. Let's just modify `syncAuthStore` or the logic right after signInWithEmailAndPassword.
old_logic = """      const updateData: any = { lastLogin: serverTimestamp() };
      if (emailToUse.toLowerCase() === "elijah@rhockstarconnect.com") {
        updateData.role = "admin";
      }

      await setDoc(doc(db, "users", userCredential.user.uid), updateData, { merge: true });
      await syncAuthStore(userCredential.user.uid, userCredential.user);

      return { user: userCredential.user, error: null };"""

new_logic = """      // Check if banned
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().isBanned) {
        await signOut(auth);
        return { user: null, error: "Your account has been banned due to policy violations." };
      }

      const updateData: any = { lastLogin: serverTimestamp() };
      if (emailToUse.toLowerCase() === "elijah@rhockstarconnect.com") {
        updateData.role = "admin";
      }

      await setDoc(doc(db, "users", userCredential.user.uid), updateData, { merge: true });
      await syncAuthStore(userCredential.user.uid, userCredential.user);

      return { user: userCredential.user, error: null };"""

content = content.replace(old_logic, new_logic)

with open("src/lib/auth.ts", "w", encoding="utf-8") as f:
    f.write(content)
