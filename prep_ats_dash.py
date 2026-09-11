with open("src/app/(dashboard)/company/[username]/ats/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add getEmployerApplications to jobs.ts
jobs_append = """

export const getEmployerApplications = async (employerId: string): Promise<{ success: boolean; applications?: JobApplication[]; error?: string }> => {
  try {
    const appsRef = collection(db, "job_applications");
    const q = query(appsRef, where("employerId", "==", employerId));
    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as JobApplication));
    return { success: true, applications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
"""
with open("src/lib/services/jobs.ts", "a", encoding="utf-8") as f:
    f.write(jobs_append)

# Fix ATS Dashboard
# Just read it and rewrite the hooks part
