with open("src/lib/services/jobs.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("body: `Your application for ${data.jobTitle}", "message: `Your application for ${data.jobTitle}")

with open("src/lib/services/jobs.ts", "w", encoding="utf-8") as f:
    f.write(content)
