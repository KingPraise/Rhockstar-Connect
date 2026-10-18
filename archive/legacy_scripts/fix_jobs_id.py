with open("src/lib/services/jobs.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('const jobRef = doc(db, "jobs", jobId);', 'const jobRef = doc(db, "jobs", job.id);')

with open("src/lib/services/jobs.ts", "w", encoding="utf-8") as f:
    f.write(content)
