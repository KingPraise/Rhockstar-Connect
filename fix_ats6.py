with open("src/app/(dashboard)/jobs/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("toast.success(`Viewing details for ${job.title}`)", "setApplyModalJob(job)")

with open("src/app/(dashboard)/jobs/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
