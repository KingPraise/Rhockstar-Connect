with open("src/lib/services/jobs.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_update = """export const updateApplicationStatus = async (applicationId: string, status: JobApplication['status']) => {
  try {
    const appRef = doc(db, "job_applications", applicationId);
    await updateDoc(appRef, { status });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};"""

new_update = """export const updateApplicationStatus = async (applicationId: string, status: JobApplication['status']) => {
  try {
    const appRef = doc(db, "job_applications", applicationId);
    
    // Fetch current app to get applicantId for notification
    const { getDoc } = await import('firebase/firestore');
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      const data = appSnap.data() as JobApplication;
      
      await updateDoc(appRef, { status });
      
      // Notify candidate
      const { createNotification } = await import('./notifications');
      await createNotification({
        userId: data.applicantId,
        type: 'job',
        title: 'Application Update',
        body: `Your application for ${data.jobTitle} has been updated to: ${status}.`,
        link: '/jobs'
      });
      
      return { success: true };
    }
    
    return { success: false, error: "Application not found" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};"""

content = content.replace(old_update, new_update)

with open("src/lib/services/jobs.ts", "w", encoding="utf-8") as f:
    f.write(content)
