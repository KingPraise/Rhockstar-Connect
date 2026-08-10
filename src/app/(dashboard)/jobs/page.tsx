"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { getJobs, JobListing, JobFilters, applyForJob } from "@/lib/services/jobs";
import { Briefcase, Search, MapPin, DollarSign, Clock, Building2, ExternalLink, Loader2, CheckCircle2, Filter, Sparkles } from "lucide-react";
import { calculateJobMatchScore } from "@/lib/utils/jobMatch";
import { useAuthStore } from "@/store/useAuthStore";
import PremiumLockModal from "@/components/ui/PremiumLockModal";
import ApplicationTracker from "@/components/jobs/ApplicationTracker";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function JobsPage() {
  const { profile } = useAuthStore();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'discover' | 'recommended' | 'applications'>('discover');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<JobFilters['type']>('All');
  
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const [limitCount, setLimitCount] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastJobElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLimitCount(prev => prev + 10);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const filters: JobFilters = {
        query: searchQuery,
        type: activeFilter,
        limitCount: limitCount
      };
      
      const res = await getJobs(filters);
      if (res.success && res.jobs) {
        setJobs(res.jobs);
        if (res.jobs.length < limitCount) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
      setLoading(false);
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(timer);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter, limitCount]);

  const handleRefresh = async () => {
    setLimitCount(10);
    // Artificial delay to show the refresh spinner
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const handleApply = async (job: JobListing, isFeatured?: boolean) => {
    const isFree = !profile?.subscriptionTier || profile.subscriptionTier === 'free';
    
    if (isFree && (appliedJobIds.size >= 2 || isFeatured)) {
      setPremiumLockOpen(true);
      return;
    }

    setApplyModalJob(job);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !applyModalJob) return;

    setIsApplying(applyModalJob.id);
    const res = await applyForJob(applyModalJob.id, profile.uid, { coverLetter });
    
    if (res.success) {
      setAppliedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.add(applyModalJob.id);
        return newSet;
      });
      setApplyModalJob(null);
      setCoverLetter("");
    } else {
      // Could show error toast here
    }
    setIsApplying(null);
  };

  const appliedJobsList = useMemo(() => {
    return jobs.filter(job => appliedJobIds.has(job.id));
  }, [jobs, appliedJobIds]);

  const recommendedJobsList = useMemo(() => {
    // Mock recommended logic: Jobs containing "Senior" or high salary
    return jobs.filter(job => job.title.includes('Senior') || job.title.includes('Lead'));
  }, [jobs]);

  const displayedJobs = useMemo(() => {
    let list = activeTab === 'recommended' ? recommendedJobsList : jobs;
    
    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(job => 
        job.title.toLowerCase().includes(q) || 
        job.company.toLowerCase().includes(q) ||
        (job.location && typeof job.location === 'string' && job.location.toLowerCase().includes(q))
      );
    }
    
    // Apply active filter (All, Remote, Full-time, etc.)
    if (activeFilter !== 'All') {
      list = list.filter(job => {
        if (activeFilter === 'Remote') {
          return job.type?.toLowerCase() === 'remote' || (typeof job.location === 'string' && job.location.toLowerCase().includes('remote'));
        }
        return job.type?.toLowerCase() === activeFilter.toLowerCase();
      });
    }
    
    return list;
  }, [jobs, activeTab, recommendedJobsList, searchQuery, activeFilter]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 space-y-8">
        
        {/* HEADER & SEARCH */}
        <div className="neo-card p-6 rounded-3xl flex flex-col gap-6 bg-slate-900/60 backdrop-blur-xl border border-white/5">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-purple/20 flex items-center justify-center border border-white/5">
                <Briefcase className="w-7 h-7 text-brand" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Careers</h1>
                <p className="text-slate-400 font-medium">Discover premium job opportunities.</p>
              </div>
            </div>
            
            <div className="relative group w-full md:w-96 shrink-0">
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

          {/* TABS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/5">
            {[
              { id: 'discover', label: 'Discover Jobs' },
              { id: 'recommended', label: 'Recommended For You' },
              { id: 'applications', label: 'My Applications' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]' 
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
                {tab.id === 'applications' && appliedJobIds.size > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{appliedJobIds.size}</span>
                )}
              </button>
            ))}
          </div>

          {/* FILTERS */}
          {activeTab !== 'applications' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 shrink-0 text-slate-400 font-medium text-sm mr-2">
                <Filter className="w-4 h-4" /> Filters:
              </div>
              {['All', 'Remote', 'Full-time', 'Part-time', 'Internship', 'Contract'].map(type => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border ${
                    activeFilter === type 
                      ? 'bg-brand/20 border-brand/50 text-brand' 
                      : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        {activeTab === 'applications' ? (
          <ApplicationTracker appliedJobs={appliedJobsList} />
        ) : (
          <>
            {loading && jobs.length === 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="neo-card p-6 rounded-3xl bg-slate-900/60 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <Skeleton className="h-8 w-24 rounded-lg" />
                      <Skeleton className="h-8 w-28 rounded-lg" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                    <div className="space-y-2 mb-6 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="pt-4 border-t border-white/5 flex gap-4">
                      <Skeleton className="h-12 flex-1 rounded-xl" />
                      <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedJobs.length > 0 ? (
                  <>
                    {displayedJobs.map((job, index) => {
                      const isLastElement = displayedJobs.length === index + 1;
                      return (
                        <div 
                          key={job.id} 
                          ref={isLastElement ? lastJobElementRef : null}
                          className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col group hover:border-brand/30 transition-all duration-300"
                        >
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                          {job.logo?.startsWith('http') ? (
                            <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-white">{job.logo?.substring(0, 2).toUpperCase() || 'J'}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-brand transition-colors">{job.title}</h3>
                          <p className="text-brand-purple font-medium flex items-center gap-1">
                            <Building2 className="w-4 h-4" /> {job.company}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                          {job.type}
                        </div>
                        {(() => {
                          const matchScore = calculateJobMatchScore(job, profile?.skills);
                          const matchColor = matchScore >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                            matchScore >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                            'text-slate-400 bg-slate-500/10 border-slate-500/20';
                          return (
                            <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1 ${matchColor}`}>
                              <Sparkles className="w-3 h-3" /> {matchScore}% Match
                            </div>
                          );
                        })()}
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
                      {appliedJobIds.has(job.id) ? (
                        <button disabled className="flex-1 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center gap-2 border border-emerald-500/20">
                          <CheckCircle2 className="w-5 h-5" /> Applied
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApply(job)}
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
                      );
                    })}
                    {hasMore && (
                      <div className="col-span-full flex justify-center py-6">
                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                      </div>
                    )}
                    {!hasMore && displayedJobs.length > 0 && (
                      <div className="col-span-full text-center py-6 text-slate-500">
                        You have caught up with all jobs!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                      icon={Briefcase}
                      title="No jobs found"
                      description="Try adjusting your search filters to find more opportunities."
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <PremiumLockModal
          isOpen={premiumLockOpen}
          onClose={() => setPremiumLockOpen(false)}
          title="Unlock Unlimited Job Applications"
          description="Free tier members are limited to 2 job applications per session. Upgrade to Pro or Elite for unlimited job applications and priority routing!"
        />

        {/* Apply Modal */}
        {applyModalJob && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1C1C1E] rounded-2xl max-w-lg w-full border border-gray-800 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Apply for {applyModalJob.title}</h2>
                  <p className="text-gray-400 text-sm">at {applyModalJob.company}</p>
                </div>
                <button onClick={() => setApplyModalJob(null)} className="text-gray-500 hover:text-white">
                  ×
                </button>
              </div>
              <form onSubmit={submitApplication} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cover Letter (Optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're a great fit..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#2C2C2E] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-brand resize-none"
                  ></textarea>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Your Rhockstar Connect profile and uploaded resume will be automatically attached to this application.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setApplyModalJob(null)} className="px-5 py-2 text-gray-400 hover:text-white font-medium transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isApplying === applyModalJob.id}
                    className="px-6 py-2 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isApplying === applyModalJob.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
