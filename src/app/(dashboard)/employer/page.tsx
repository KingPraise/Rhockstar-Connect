"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getJobs, JobListing, createJob } from "@/lib/services/jobs";
import { Plus, Briefcase, Users, Activity, Eye, Trash2, Loader2, Crown, Sparkles, Building2, X, MapPin, DollarSign, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function EmployerDashboardPage() {
  const { profile } = useAuthStore();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  // New Job Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'>("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      loadJobs();
    }
  }, [profile?.uid]);

  const loadJobs = async () => {
    if (!profile) return;
    setLoading(true);
    const res = await getJobs({ companyId: profile.uid });
    if (res.success && res.jobs) {
      setJobs(res.jobs);
    }
    setLoading(false);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    
    const res = await createJob({
      title,
      company: profile.fullName || "Company",
      location,
      type,
      salary,
      description
    }, profile.uid);

    if (res.success) {
      toast.success("Job posted successfully!");
      setShowPostModal(false);
      setTitle("");
      setLocation("");
      setSalary("");
      setDescription("");
      loadJobs();
    } else {
      toast.error(res.error || "Failed to post job");
    }
    setSubmitting(false);
  };

  const isEmployer = profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer';
  const isElite = profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

  if (!profile || !isEmployer || !isElite) {
    return (
      <div className="max-w-2xl mx-auto p-8 my-12 neo-card bg-slate-900/60 backdrop-blur-md border border-amber-500/30 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Crown className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Employer Access & Elite Plan Required</h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
            Posting job listings and recruiting top talent on Rhockstar Connect requires an <span className="text-amber-400 font-bold">Employer Account</span> with an active <span className="text-amber-400 font-bold">Elite Membership</span> ($5/mo).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isElite && (
            <Link 
              href="/premium" 
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              Upgrade to Elite ($5/mo)
            </Link>
          )}

          {!isEmployer && (
            <Link 
              href="/settings" 
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-brand" />
              Switch Account to Employer
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your job postings and applicants.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link 
            href={`/company/${profile?.username}`}
            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-700 transition-colors border border-white/10"
          >
            <Building2 className="h-5 w-5" />
            View Public Profile
          </Link>
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center justify-center gap-2 bg-[#6B8AFD] text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-[0_0_20px_rgba(107,138,253,0.3)] hover:shadow-[0_0_30px_rgba(107,138,253,0.5)]"
          >
            <Plus className="h-5 w-5" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="neo-card bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-2xl border border-brand/20">
              <Briefcase className="h-6 w-6 text-brand" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-3xl font-extrabold text-white mt-0.5">{jobs.length}</h3>
            </div>
          </div>
        </div>
        <div className="neo-card bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-purple/10 rounded-2xl border border-brand-purple/20">
              <Users className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</p>
              <h3 className="text-3xl font-extrabold text-white mt-0.5">{jobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0)}</h3>
            </div>
          </div>
        </div>
        <div className="neo-card bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Views</p>
              <h3 className="text-3xl font-extrabold text-white mt-0.5">24</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="neo-card bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/80">
          <h2 className="text-xl font-bold text-white">Your Postings</h2>
          <span className="text-xs font-bold text-slate-400">{jobs.length} Published</span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading job postings...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Briefcase className="h-12 w-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No jobs posted yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Create your first job listing to start attracting talent to your company.</p>
            <button 
              onClick={() => setShowPostModal(true)}
              className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Post a job now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {jobs.map(job => (
              <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/60 transition-all group">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span>📍 {job.location}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>💼 {job.type}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>📅 Posted {job.postedAt}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/employer/${job.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand/10 border border-brand/30 text-brand rounded-xl font-bold hover:bg-brand hover:text-white transition-all shadow-lg"
                  >
                    <Users className="h-4 w-4" />
                    View Applicants ({job.applicantsCount || 0})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg border border-brand/20">
                  <Briefcase className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Post a New Job</h2>
                  <p className="text-xs text-slate-400">Reach thousands of top talent across the network</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePostJob} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              
              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-extrabold text-slate-200">Job Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="neo-input text-sm"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-extrabold text-slate-200">Employment Type <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Briefcase className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="neo-input pl-12 pr-10 text-sm cursor-pointer appearance-none"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Remote">Remote</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-extrabold text-slate-200">Location <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lagos or Remote"
                        className="neo-input pl-12 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
                  <label className="text-sm font-extrabold text-slate-200">Salary Range <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. ?600k - ?1.2M / mo"
                      className="neo-input pl-12 text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
                  <label className="text-sm font-extrabold text-slate-200">Job Description & Requirements <span className="text-rose-500">*</span></label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detail key responsibilities, qualifications, stack, and application guidelines..." 
                    rows={6}
                    className="neo-input text-sm resize-y"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-5 py-2.5 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-70 text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                >
                  {submitting ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
