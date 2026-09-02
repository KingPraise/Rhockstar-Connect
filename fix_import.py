import os

with open("src/lib/services/communities.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp } from 'firebase/firestore';",
    "import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment, serverTimestamp } from 'firebase/firestore';"
)

with open("src/lib/services/communities.ts", "w", encoding="utf-8") as f:
    f.write(content)
