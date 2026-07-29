"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Briefcase, ChevronDown, Search, ArrowRight, UserPlus, GripVertical, CheckCircle2, PhoneCall, Loader2 } from "lucide-react";
import { getJobs, JobListing } from "@/lib/services/jobs";

// Mock ATS Data
type CandidateStatus = "applied" | "interviewing" | "hired";

interface Candidate {
  id: string;
  name: string;
  role: string;
  status: CandidateStatus;
  avatar: string;
  matchScore: number;
  appliedDate: string;
}

const MOCK_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Alex Chen", role: "Senior Frontend Engineer", status: "applied", avatar: "A", matchScore: 92, appliedDate: "2 days ago" },
  { id: "c2", name: "Sarah Jenkins", role: "Senior Frontend Engineer", status: "applied", avatar: "S", matchScore: 85, appliedDate: "3 days ago" },
  { id: "c3", name: "Michael Ross", role: "Senior Frontend Engineer", status: "interviewing", avatar: "M", matchScore: 98, appliedDate: "1 week ago" },
  { id: "c4", name: "Emma Wilson", role: "Product Designer", status: "applied", avatar: "E", matchScore: 78, appliedDate: "Yesterday" },
  { id: "c5", name: "James Carter", role: "Senior Frontend Engineer", status: "hired", avatar: "J", matchScore: 95, appliedDate: "3 weeks ago" },
];

export default function ATSDashboard() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { profile } = useAuthStore();
  
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [loading, setLoading] = useState(true);
  
  // Drag and drop state
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);

  useEffect(() => {
    // Basic authorization check
    if (!profile) {
      router.push("/login");
      return;
    }
    if (profile.username !== username || profile.accountType !== 'employer') {
      router.push("/");
      return;
    }

    const fetchCompanyJobs = async () => {
      const res = await getJobs({ companyId: profile.uid });
      if (res.success && res.jobs) {
        setJobs(res.jobs);
      }
      setLoading(false);
    };
    
    fetchCompanyJobs();
  }, [profile, username, router]);

  // Handle Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("candidateId", id);
    setDraggedCandidate(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, newStatus: CandidateStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("candidateId");
    if (!candidateId) return;

    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, status: newStatus } : c
    ));
    setDraggedCandidate(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const columns: { id: CandidateStatus; label: string; icon: any; color: string }[] = [
    { id: "applied", label: "New Applications", icon: UserPlus, color: "text-blue-400" },
    { id: "interviewing", label: "Interviewing", icon: PhoneCall, color: "text-amber-400" },
    { id: "hired", label: "Hired", icon: CheckCircle2, color: "text-emerald-400" },
  ];

  const filteredCandidates = selectedJob === "all" 
    ? candidates 
    : candidates.filter(c => c.role === jobs.find(j => j.id === selectedJob)?.title);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-emerald-500" />
            Applicant Tracking
          </h1>
          <p className="text-slate-400 font-medium">Manage and review your potential candidates.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Job Filter Dropdown */}
          <div className="relative min-w-[200px] w-full md:w-auto">
            <select 
              className="w-full appearance-none bg-slate-900 border border-white/10 text-white font-medium py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-emerald-500/50 shadow-inner"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="all">All Open Roles</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
        {columns.map(col => {
          const colCandidates = filteredCandidates.filter(c => c.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className="flex flex-col min-w-[320px] max-w-[350px] w-full bg-slate-900/40 rounded-3xl border border-white/5 snap-center"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/30 rounded-t-3xl">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <col.icon className={`w-5 h-5 ${col.color}`} />
                  {col.label}
                </h3>
                <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full border border-white/10">
                  {colCandidates.length}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 hide-scrollbar">
                {colCandidates.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-2xl min-h-[100px]">
                    Drag candidates here
                  </div>
                ) : (
                  colCandidates.map(candidate => (
                    <div 
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                      className={`neo-card p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/5 cursor-grab active:cursor-grabbing transition-all hover:border-emerald-500/30 shadow-lg ${draggedCandidate === candidate.id ? 'opacity-50' : 'opacity-100'}`}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shrink-0">
                          {candidate.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white truncate">{candidate.name}</h4>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{candidate.role}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                              {candidate.matchScore}% Match
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {candidate.appliedDate}
                            </span>
                          </div>
                        </div>
                        <GripVertical className="w-4 h-4 text-slate-600 shrink-0 mt-1 cursor-grab" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
