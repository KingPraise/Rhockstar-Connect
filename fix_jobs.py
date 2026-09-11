with open("src/lib/services/jobs.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re
old_func = """export const getApplicationsForJob = async (jobId: string): Promise<{ success: boolean; applications?: JobApplication[]; error?: string }> => {
  try {
    const appsRef = collection(db, "job_applications");
    // Removed orderBy to prevent composite index requirement in Firestore
    const q = query(appsRef, where("jobId", "==", jobId));
    const snapshot = await getDocs(q);"""

new_func = """export const getApplicationsForJob = async (jobId: string, employerId?: string): Promise<{ success: boolean; applications?: JobApplication[]; error?: string }> => {
  try {
    const appsRef = collection(db, "job_applications");
    // Removed orderBy to prevent composite index requirement in Firestore
    let q;
    if (employerId) {
      q = query(appsRef, where("jobId", "==", jobId), where("employerId", "==", employerId));
    } else {
      q = query(appsRef, where("jobId", "==", jobId));
    }
    const snapshot = await getDocs(q);"""

content = content.replace(old_func, new_func)

with open("src/lib/services/jobs.ts", "w", encoding="utf-8") as f:
    f.write(content)
