with open("src/app/(dashboard)/employer/[jobId]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const res = await getApplicationsForJob(jobId);", "const res = await getApplicationsForJob(jobId, profile?.role === 'admin' ? undefined : profile?.uid);")

with open("src/app/(dashboard)/employer/[jobId]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
