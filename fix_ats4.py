with open("src/app/(dashboard)/jobs/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
old_check = """  const handleApply = async (job: JobListing, isFeatured?: boolean) => {
    const isFree = !profile?.subscriptionTier || profile.subscriptionTier === 'free';
    
    // Free tier logic: max 2 regular jobs, 0 featured jobs
    if (isFree && (appliedJobIds.size >= 2 || isFeatured)) {
      setPremiumLockOpen(true);
      return;
    }"""

new_check = """  const handleApply = async (job: JobListing, isFeatured?: boolean) => {
    const isFree = !profile?.subscriptionTier || profile.subscriptionTier === 'free';
    const extraJobs = (profile as any)?.extraJobApps || 0;
    const allowedJobs = 2 + extraJobs;
    
    // Free tier logic: max allowed regular jobs, 0 featured jobs
    if (isFree && (appliedJobIds.size >= allowedJobs || isFeatured)) {
      setPremiumLockOpen(true);
      return;
    }"""

content = content.replace(old_check, new_check)

with open("src/app/(dashboard)/jobs/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
