"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getJobs, JobListing, createJob } from "@/lib/services/jobs";
import { Plus, Briefcase, Users, Activity, Eye, Trash2, Loader2 } from "lucide-react";
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

  if (!profile || (profile.accountType !== 'employer' && profile.role !== 'admin' && (profile as any).role !== 'employer')) {
    return (
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Employer Access Required</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          You need an Employer account to post jobs and manage applicants on Rhockstar Connect.
        </p>
        <Link href="/settings" className="bg-[#6B8AFD] text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors">
          Upgrade in Settings
        </Link>
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
        <button 
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-2 bg-[#6B8AFD] text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Post New Job
        </button>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Post a New Job</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePostJob} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#6B8AFD] focus:border-transparent outline-none transition-all dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#6B8AFD] focus:border-transparent outline-none transition-all dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#6B8AFD] focus:border-transparent outline-none transition-all dark:text-white"
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary Range</label>
                <input 
                  type="text" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $120k - $150k"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#6B8AFD] focus:border-transparent outline-none transition-all dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#6B8AFD] focus:border-transparent outline-none transition-all dark:text-white resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-[#6B8AFD] text-white font-medium rounded-full hover:bg-blue-600 transition-colors disabled:opacity-70"
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
