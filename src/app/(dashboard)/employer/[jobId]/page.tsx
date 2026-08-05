"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { getApplicationsForJob, JobApplication } from "@/lib/services/jobs";
import { ArrowLeft, User, FileText, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function EmployerJobApplicantsPage() {
  const { profile } = useAuthStore();
  const params = useParams();
  const jobId = params?.jobId as string;
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadApplications();
    }
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    const res = await getApplicationsForJob(jobId);
    if (res.success && res.applications) {
      setApplications(res.applications);
    }
    setLoading(false);
  };

  if (!profile || (profile.role !== 'employer' && profile.role !== 'admin')) {
    return (
      <div className="max-w-[1600px] mx-auto p-8 text-center text-gray-500">
        Unauthorized access
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/employer" 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applicants</h1>
          <p className="text-gray-600 dark:text-gray-400">Review candidates for this job posting.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading applicants...</div>
        ) : applications.length === 0 ? (
          <div className="p-16 text-center">
            <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applicants yet</h3>
            <p className="text-gray-500 dark:text-gray-400">When candidates apply, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {applications.map(app => (
              <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {app.applicantAvatar ? (
                      <Image src={app.applicantAvatar} alt={app.applicantName} width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                        {app.applicantName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.applicantName}</h3>
                    <p className="text-[#6B8AFD] font-medium mb-2">{app.applicantTitle || "Professional"}</p>
                    
                    {app.coverLetter && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mt-3 text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium text-xs text-gray-500 uppercase mb-1">Cover Letter</p>
                        {app.coverLetter}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500 font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full uppercase tracking-wider">
                    {app.status}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    {app.resumeUrl && (
                      <a 
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Resume
                      </a>
                    )}
                    <Link 
                      href={`/profile/${app.applicantId}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-[#6B8AFD] rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
