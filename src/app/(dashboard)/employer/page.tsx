"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getJobs, JobListing, createJob } from "@/lib/services/jobs";
import { Plus, Briefcase, Users, Activity, Eye, Trash2 } from "lucide-react";
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Briefcase className="h-6 w-6 text-[#6B8AFD]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Applicants</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">-</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Profile Views</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">-</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Postings</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs posted yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first job listing to start attracting talent.</p>
            <button 
              onClick={() => setShowPostModal(true)}
              className="text-[#6B8AFD] font-medium hover:underline"
            >
              Post a job now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {jobs.map(job => (
              <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{job.location}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span>{job.type}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span>{job.postedAt}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/employer/${job.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-[#6B8AFD] rounded-full font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    View Applicants
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
