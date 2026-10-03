with open("src/app/(dashboard)/messages/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# For DMs
content = content.replace("return messages.map((msg) => {", "return messages.map((msg, index) => {\n                  const verticalPosition = index < 3 ? 'top-full mt-1' : 'bottom-full mb-1';")

content = content.replace("absolute bottom-full ${isMe ? \"left-0\" : \"right-0\"} mb-1", "absolute ${verticalPosition} ${isMe ? \"left-0\" : \"right-0\"}")

# For Community
content = content.replace("return communityMessages.map((msg) => {", "return communityMessages.map((msg, index) => {\n                        const verticalPosition = index < 3 ? 'top-full mt-1' : 'bottom-full mb-1';")

with open("src/app/(dashboard)/messages/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
