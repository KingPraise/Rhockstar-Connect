"use client";

import { JobListing } from "@/lib/services/jobs";
import { CheckCircle2, Eye, Calendar, Trophy, ExternalLink } from "lucide-react";

interface ApplicationTrackerProps {
  appliedJobs: JobListing[];
}

export default function ApplicationTracker({ appliedJobs }: ApplicationTrackerProps) {
  if (appliedJobs.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 neo-card border border-white/5 rounded-3xl bg-slate-900/60">
        <CheckCircle2 className="w-16 h-16 text-slate-500 mx-auto mb-6 opacity-50" />
        <p className="font-bold text-2xl text-white mb-2">No applications yet</p>
        <p>Your submitted job applications will appear here.</p>
      </div>
    );
  }

  // Mock statuses for demonstration
  const statuses = [
    { label: "Applied", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Viewed by Employer", icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Interview", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Hired", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">My Applications</h2>
      
      <div className="grid gap-4">
        {appliedJobs.map((job, index) => {
          // Assign random mock status based on index for demo purposes
          const status = statuses[index % statuses.length];
          const StatusIcon = status.icon;

          return (
            <div key={job.id} className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-brand/30 transition-all">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 shadow-inner shrink-0">
                  <span className="text-xl font-bold text-white">{job.logo}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{job.title}</h3>
                  <p className="text-slate-400 text-sm">{job.company} • {job.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bg} ${status.color} ${status.border} text-sm font-bold flex-1 md:flex-none justify-center`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </div>
                
                <button className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-white/5 shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
