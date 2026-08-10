"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getApplicationsForJob, JobApplication } from "@/lib/services/jobs";
import { ArrowLeft, User, FileText, CheckCircle, XCircle, Briefcase, Loader2 } from "lucide-react";
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

  const isEmployer = profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer';
  const isElite = profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

  if (!profile || !isEmployer || !isElite) {
    return (
      <div className="max-w-xl mx-auto p-8 my-12 neo-card bg-slate-900/60 backdrop-blur-md border border-amber-500/30 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-4">
        <Briefcase className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Employer Access & Elite Plan Required</h2>
        <p className="text-slate-300 text-sm">Reviewing candidates and managing applicants requires an Employer account with an active Elite Membership.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/premium" className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs hover:scale-105 transition-all">
            Upgrade to Elite ($5/mo)
          </Link>
          <Link href="/settings" className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs border border-white/10 hover:bg-slate-700 transition-all">
            Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/employer" 
          className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-2xl border border-white/5 transition-all shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Candidates & Applicants</h1>
          <p className="text-slate-400 text-sm">Review resume submissions and candidate profiles for this job posting.</p>
        </div>
      </div>

      <div className="neo-card bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading applicant profiles...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <User className="h-12 w-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No applicants yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">When candidates apply for this position, their details and resumes will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {applications.map(app => (
              <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-slate-800/60 transition-all group">
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
