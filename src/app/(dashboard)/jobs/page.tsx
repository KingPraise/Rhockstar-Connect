"use client";

import { useEffect, useState } from "react";
import { getJobs, JobListing } from "@/lib/services/jobs";
import { Briefcase, Search, MapPin, DollarSign, Clock, Building2, ExternalLink, Loader2, CheckCircle2, Lock, Crown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import PremiumLockModal from "@/components/ui/PremiumLockModal";

export default function JobsPage() {
  const { profile } = useAuthStore();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const res = await getJobs(searchQuery);
      if (res.success && res.jobs) {
        setJobs(res.jobs);
      }
      setLoading(false);
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleApply = async (jobId: string, isFeatured?: boolean) => {
    const isFree = !profile?.subscriptionTier || profile.subscriptionTier === 'free';
    
    if (isFree && (appliedJobs.size >= 2 || isFeatured)) {
      setPremiumLockOpen(true);
      return;
    }

    setIsApplying(jobId);
    // Simulate application process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAppliedJobs(prev => {
      const newSet = new Set(prev);
      newSet.add(jobId);
      return newSet;
    });
    setIsApplying(null);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
      
      {/* HEADER & SEARCH */}
      <div className="neo-card p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-purple/20 flex items-center justify-center border border-white/5">
            <Briefcase className="w-7 h-7 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Job Board</h1>
            <p className="text-slate-400 font-medium">Discover premium career opportunities.</p>
          </div>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand transition-colors" />
          <input 
            type="text"
            placeholder="Search roles, companies..."
            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* JOBS LISTING */}
      {loading && jobs.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.length > 0 ? jobs.map(job => (
            <div key={job.id} className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col group hover:border-brand/30 transition-all duration-300">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                    <span className="text-2xl font-bold text-white">{job.logo}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand transition-colors">{job.title}</h3>
                    <p className="text-brand-purple font-medium flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> {job.company}
                    </p>
                  </div>
                </div>
                
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                  {job.type}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6 font-medium">
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500" /> {job.location}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-400">{job.salary}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-500" /> {job.postedAt}
                </div>
              </div>

              <p className="text-slate-300 mb-6 line-clamp-2 leading-relaxed flex-1">
                {job.description}
              </p>

              <div className="mt-auto pt-4 border-t border-white/5 flex gap-4">
                {appliedJobs.has(job.id) ? (
                  <button disabled className="flex-1 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center gap-2 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" /> Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={isApplying === job.id}
                    className="flex-1 py-3 rounded-xl bg-brand/10 text-brand font-bold hover:bg-brand hover:text-white transition-all flex items-center justify-center gap-2 border border-brand/20 hover:border-transparent disabled:opacity-50"
                  >
                    {isApplying === job.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Easy Apply"}
                  </button>
                )}
                
                <button className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-white/5">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-slate-400 neo-card border border-white/5 rounded-3xl">
              <Briefcase className="w-16 h-16 text-slate-500 mx-auto mb-6 opacity-50" />
              <p className="font-bold text-2xl text-white mb-2">No jobs found</p>
              <p>Try adjusting your search filters to find more opportunities.</p>
            </div>
          )}
        </div>
      )}

      <PremiumLockModal
        isOpen={premiumLockOpen}
        onClose={() => setPremiumLockOpen(false)}
        title="Unlock Unlimited Job Applications"
        description="Free tier members are limited to 2 job applications per month. Upgrade to Pro or Elite for unlimited job applications!"
      />
    </div>
  );
}
