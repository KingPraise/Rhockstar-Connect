with open("src/lib/services/jobs.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add fields to JobApplication interface
old_interface = """export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  applicantTitle?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'screening' | 'reviewed' | 'interviewing' | 'accepted' | 'hired' | 'rejected';
  appliedAt: any;
}"""

new_interface = """export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  logo?: string;
  employerId?: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  applicantTitle?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'screening' | 'reviewed' | 'interviewing' | 'accepted' | 'hired' | 'rejected';
  appliedAt: any;
}"""

content = content.replace(old_interface, new_interface)

# Update applyForJob signature
old_apply = """export const applyForJob = async (jobId: string, applicantId: string, applicationData: Partial<JobApplication>) => {
  try {
    const appsRef = collection(db, "job_applications");
    const newAppRef = doc(appsRef);
    
    const applicantDoc = await getDoc(doc(db, "users", applicantId));
    const applicantUser = applicantDoc.data();
    
    const app: JobApplication = {
      id: newAppRef.id,
      jobId,
      applicantId,
      applicantName: applicantUser?.fullName || 'Unknown',
      applicantAvatar: applicantUser?.avatar || '',
      applicantTitle: applicantUser?.jobTitle || '',
      resumeUrl: applicantUser?.resumeUrl || applicationData.resumeUrl || '',
      coverLetter: applicationData.coverLetter || '',
      status: 'pending',
      appliedAt: serverTimestamp(),
    };"""

new_apply = """export const applyForJob = async (job: JobListing, applicantId: string, applicationData: Partial<JobApplication>) => {
  try {
    const appsRef = collection(db, "job_applications");
    const newAppRef = doc(appsRef);
    
    const applicantDoc = await getDoc(doc(db, "users", applicantId));
    const applicantUser = applicantDoc.data();
    
    const app: JobApplication = {
      id: newAppRef.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      logo: job.logo,
      employerId: job.companyId,
      applicantId,
      applicantName: applicantUser?.fullName || 'Unknown',
      applicantAvatar: applicantUser?.avatar || '',
      applicantTitle: applicantUser?.jobTitle || '',
      resumeUrl: applicantUser?.resumeUrl || applicationData.resumeUrl || '',
      coverLetter: applicationData.coverLetter || '',
      status: 'pending',
      appliedAt: serverTimestamp(),
    };"""

content = content.replace(old_apply, new_apply)

with open("src/lib/services/jobs.ts", "w", encoding="utf-8") as f:
    f.write(content)
