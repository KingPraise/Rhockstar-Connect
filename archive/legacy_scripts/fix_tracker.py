with open("src/components/jobs/ApplicationTracker.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_comp = """"use client";

import { useEffect, useState } from "react";
import { getUserApplications, JobApplication } from "@/lib/services/jobs";
import { useAuthStore } from "@/store/useAuthStore";
import { CheckCircle2, Eye, Calendar, Trophy, ExternalLink, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApplicationTracker() {
  const { profile } = useAuthStore();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!profile) return;
      setLoading(true);
      const res = await getUserApplications(profile.uid);
      if (res.success && res.applications) {
        setApplications(res.applications);
      }
      setLoading(false);
    };
    fetchApps();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 neo-card border border-white/5 rounded-3xl bg-slate-900/60">
        <CheckCircle2 className="w-16 h-16 text-slate-500 mx-auto mb-6 opacity-50" />
        <p className="font-bold text-2xl text-white mb-2">No applications yet</p>
        <p>Your submitted job applications will appear here.</p>
      </div>
    );
  }

  const getStatusDisplay = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return { label: "Applied", icon: Clock, color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/20" };
      case 'screening':
      case 'reviewed': return { label: "Viewed by Employer", icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
      case 'interviewing': return { label: "Interview", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case 'hired':
      case 'accepted': return { label: "Hired", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case 'rejected': return { label: "Not Selected", icon: CheckCircle2, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
      default: return { label: "Applied", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">My Applications</h2>
      
      <div className="grid gap-4">
        {applications.map((app) => {
          const status = getStatusDisplay(app.status);
          const StatusIcon = status.icon;

          return (
            <div key={app.id} className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-brand/30 transition-all">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 shadow-inner shrink-0 overflow-hidden">
                  {app.logo ? (
                    <img src={app.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-white">{app.company?.substring(0, 1) || 'J'}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{app.jobTitle || 'Job Application'}</h3>
                  <p className="text-slate-400 text-sm">{app.company || 'Unknown Company'} • Applied {app.appliedAt?.toDate ? formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true }) : 'recently'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bg} ${status.color} ${status.border} text-sm font-bold flex-1 md:flex-none justify-center`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
"""

with open("src/components/jobs/ApplicationTracker.tsx", "w", encoding="utf-8") as f:
    f.write(new_comp)

# Fix jobs/page.tsx
with open("src/app/(dashboard)/jobs/page.tsx", "r", encoding="utf-8") as f:
    page_content = f.read()
    
page_content = page_content.replace("<ApplicationTracker appliedJobs={appliedJobsList} />", "<ApplicationTracker />")

with open("src/app/(dashboard)/jobs/page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)
