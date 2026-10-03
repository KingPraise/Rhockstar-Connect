with open("src/app/(dashboard)/jobs/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("await applyForJob(applyModalJob.id, profile.uid", "await applyForJob(applyModalJob, profile.uid")

with open("src/app/(dashboard)/jobs/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
