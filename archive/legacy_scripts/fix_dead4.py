with open("src/app/admin/(protected)/jobs/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

delete_fn = """
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success("Job deleted");
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };
"""

if "handleDeleteJob" not in content:
    content = content.replace("export default function AdminJobsPage() {", delete_fn + "\nexport default function AdminJobsPage() {")

old_btn = """<button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">"""
new_btn = """<button onClick={() => handleDeleteJob(job.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">"""

content = content.replace(old_btn, new_btn)

with open("src/app/admin/(protected)/jobs/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
