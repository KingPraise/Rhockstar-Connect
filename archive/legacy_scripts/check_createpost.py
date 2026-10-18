with open("src/lib/services/posts.ts", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if "const newPost =" in line:
        for j in range(i, i+15):
            print(lines[j])
        break
