import os

with open("src/components/ads/CreateAdModal.tsx", "r", encoding="utf-8") as f:
    c1 = f.read()
c1 = c1.replace("max-w-4xl", "max-w-5xl md:max-w-[90vw]")
with open("src/components/ads/CreateAdModal.tsx", "w", encoding="utf-8") as f:
    f.write(c1)

with open("src/components/chat/CreateCommunityModal.tsx", "r", encoding="utf-8") as f:
    c2 = f.read()
c2 = c2.replace("max-w-xl", "max-w-3xl")
with open("src/components/chat/CreateCommunityModal.tsx", "w", encoding="utf-8") as f:
    f.write(c2)

with open("src/components/layout/QuickCreateModal.tsx", "r", encoding="utf-8") as f:
    c3 = f.read()
c3 = c3.replace("max-w-2xl", "max-w-3xl")
with open("src/components/layout/QuickCreateModal.tsx", "w", encoding="utf-8") as f:
    f.write(c3)
