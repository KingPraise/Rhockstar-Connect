new_ats = """"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Briefcase, ChevronDown, Search, ArrowRight, UserPlus, GripVertical, CheckCircle2, PhoneCall, Loader2 } from "lucide-react";
import { getJobs, JobListing, getEmployerApplications, JobApplication, updateApplicationStatus } from "@/lib/services/jobs";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

export default function ATSDashboard() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { profile } = useAuthStore();
  
  const [candidates, setCandidates] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.username !== username && profile?.role !== 'admin') {
      router.push('/feed');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        getJobs(), // Ideally getEmployerJobs, but getJobs works for now if we filter
        getEmployerApplications(profile.uid)
      ]);
      
      if (jobsRes.success && jobsRes.jobs) {
        setJobs(jobsRes.jobs.filter(j => j.companyId === profile.uid));
      }
      
      if (appsRes.success && appsRes.applications) {
        setCandidates(appsRes.applications);
      }
      setLoading(false);
    };
    
    loadData();
  }, [profile, username, router]);

  const filteredCandidates = activeJobId === "all" 
    ? candidates 
    : candidates.filter(c => c.jobId === activeJobId);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: JobApplication['status']) => {
    e.preventDefault();
    if (!draggedAppId) return;

    const originalCandidates = [...candidates];
    
    // Optimistic update
    setCandidates(prev => 
      prev.map(c => c.id === draggedAppId ? { ...c, status: newStatus } : c)
    );
    setDraggedAppId(null);

    const res = await updateApplicationStatus(draggedAppId, newStatus);
    if (!res.success) {
      toast.error("Failed to update status");
      setCandidates(originalCandidates);
    } else {
      toast.success("Candidate moved successfully");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const columns: { id: JobApplication['status']; label: string; icon: any; color: string; border: string }[] = [
    { id: "pending", label: "New Applied", icon: Briefcase, color: "text-blue-400", border: "border-blue-500/20" },
    { id: "interviewing", label: "Interviewing", icon: PhoneCall, color: "text-amber-400", border: "border-amber-500/20" },
    { id: "hired", label: "Hired", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-white/5 neo-card shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-brand" />
            Applicant Tracking
          </h1>
          <p className="text-slate-400 mt-1">Manage your hiring pipeline</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={activeJobId}
              onChange={(e) => setActiveJobId(e.target.value)}
              className="appearance-none bg-slate-800 border border-white/10 text-white text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-brand/50"
            >
              <option value="all">All Active Roles</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <button className="p-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-8">
        {columns.map(col => {
          const colCandidates = filteredCandidates.filter(c => c.status === col.id || (col.id === 'pending' && (c.status === 'pending' || c.status === 'screening' || c.status === 'reviewed')));
          
          return (
            <div 
              key={col.id} 
              className={`bg-slate-900/40 rounded-3xl border border-white/5 p-4 flex flex-col min-h-[600px] ${draggedAppId ? 'border-dashed border-white/20 bg-slate-800/30' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <col.icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="font-bold text-white">{col.label}</h3>
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {colCandidates.length}
                </span>
              </div>
              
              <div className="space-y-3 flex-1">
                {colCandidates.map(candidate => (
                  <div 
                    key={candidate.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate.id)}
                    className="bg-slate-800/80 p-4 rounded-2xl border border-white/5 hover:border-white/10 cursor-grab active:cursor-grabbing hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-brand-purple/20 flex items-center justify-center text-brand font-bold text-sm shrink-0 overflow-hidden">
                          {candidate.applicantAvatar ? <img src={candidate.applicantAvatar} className="w-full h-full object-cover" /> : candidate.applicantName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{candidate.applicantName}</h4>
                          <p className="text-xs text-slate-400">{candidate.jobTitle}</p>
                        </div>
                      </div>
                      <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {candidate.appliedAt?.toDate ? formatDistanceToNow(candidate.appliedAt.toDate(), { addSuffix: true }) : 'Recently'}
                      </div>
                      <button 
                        onClick={() => router.push(`/employer/${candidate.jobId}`)}
                        className="text-xs font-bold text-brand hover:text-brand-purple flex items-center gap-1"
                      >
                        View Profile <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {colCandidates.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-sm text-slate-500 font-medium">Drop candidate here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"""

with open("src/app/(dashboard)/company/[username]/ats/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_ats)
