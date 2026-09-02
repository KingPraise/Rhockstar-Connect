import os

with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Communities 🌐", "Community 🌐")
content = content.replace("CHAT ROOM", "CHAT")
content = content.replace("Community Room Header", "Community Header")

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("src/components/onboarding/OnboardingTour.tsx", "r", encoding="utf-8") as f:
    content2 = f.read()
    
content2 = content2.replace("community rooms", "communities")

with open("src/components/onboarding/OnboardingTour.tsx", "w", encoding="utf-8") as f:
    f.write(content2)
