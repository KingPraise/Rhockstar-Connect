import json
import os

indexes = {
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "senderId", "order": "ASCENDING" },
        { "fieldPath": "receiverId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}

if os.path.exists("firestore.indexes.json"):
    with open("firestore.indexes.json", "r") as f:
        data = json.load(f)
    if "indexes" in data:
        data["indexes"].extend(indexes["indexes"])
    else:
        data["indexes"] = indexes["indexes"]
else:
    data = indexes

with open("firestore.indexes.json", "w") as f:
    json.dump(data, f, indent=2)
