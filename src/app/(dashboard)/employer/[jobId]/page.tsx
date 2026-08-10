"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getApplicationsForJob, JobApplication, updateApplicationStatus } from "@/lib/services/jobs";
import { ArrowLeft, User, FileText, Briefcase, Loader2, GripVertical, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

type ColumnStatus = JobApplication['status'];

const KANBAN_COLUMNS: { id: ColumnStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Applied', color: 'bg-slate-500' },
  { id: 'screening', label: 'Screening', color: 'bg-indigo-500' },
  { id: 'reviewed', label: 'In Review', color: 'bg-blue-500' },
  { id: 'interviewing', label: 'Interview', color: 'bg-amber-500' },
  { id: 'accepted', label: 'Offered', color: 'bg-emerald-500' },
  { id: 'hired', label: 'Hired', color: 'bg-cyan-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' }
];

export default function EmployerJobApplicantsPage() {
  const { profile } = useAuthStore();
  const params = useParams();
  const jobId = params?.jobId as string;
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appId);
    
    // Slight delay to allow dragging image to be captured before we add opacity
    setTimeout(() => {
      const el = document.getElementById(`card-${appId}`);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(null);
    const el = document.getElementById(`card-${appId}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ColumnStatus) => {
    e.preventDefault();
    if (!draggedAppId) return;

    const appToMove = applications.find(a => a.id === draggedAppId);
    if (!appToMove || appToMove.status === targetStatus) {
      setDraggedAppId(null);
      return;
    }

    // Optimistic UI Update
    const originalApplications = [...applications];
    setApplications(prev => prev.map(app => 
      app.id === draggedAppId ? { ...app, status: targetStatus } : app
    ));
    
    const el = document.getElementById(`card-${draggedAppId}`);
    if (el) el.classList.remove('opacity-50');
    setDraggedAppId(null);

    // Database Update
    const res = await updateApplicationStatus(draggedAppId, targetStatus);
    if (!res.success) {
      toast.error("Failed to update status");
      setApplications(originalApplications);
    } else {
      toast.success("Candidate status updated!");
    }
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

  const getAppsByStatus = (status: ColumnStatus) => applications.filter(app => app.status === status);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/employer" 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-2xl border border-white/5 transition-all shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Applicant Tracking (ATS)</h1>
            <p className="text-slate-400 text-sm">Drag and drop candidates to update their hiring status.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 neo-card bg-slate-900/60 rounded-xl border border-white/5 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            <span className="text-white font-bold text-sm">{applications.length} Total</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p>Loading candidate pipeline...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-max h-full">
            {KANBAN_COLUMNS.map((col) => {
              const columnApps = getAppsByStatus(col.id);
              
              return (
                <div 
                  key={col.id} 
                  className="w-[320px] flex flex-col bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden flex-shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-[0_0_10px_currentColor]`} />
                      <h3 className="font-bold text-white text-sm">{col.label}</h3>
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Drop Zone / Cards List */}
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 min-h-[150px]">
                    {columnApps.map(app => (
                      <div 
                        key={app.id}
                        id={`card-${app.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onDragEnd={(e) => handleDragEnd(e, app.id)}
                        className="neo-card bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:border-brand/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all cursor-grab active:cursor-grabbing group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                              {app.applicantAvatar ? (
                                <Image src={app.applicantAvatar} alt={app.applicantName} width={40} height={40} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                  {app.applicantName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm line-clamp-1">{app.applicantName}</h4>
                              <p className="text-brand text-xs font-medium line-clamp-1">{app.applicantTitle || "Professional"}</p>
                            </div>
                          </div>
                          <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                          {app.resumeUrl && (
                            <a 
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Resume
                            </a>
                          )}
                          <Link 
                            href={`/profile/${app.applicantId}`}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl text-xs font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <User className="w-3.5 h-3.5" />
                            Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {columnApps.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center p-4 border-2 border-dashed border-white/5 rounded-2xl w-full">
                          <p className="text-slate-500 text-xs font-medium">Drop candidate here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
