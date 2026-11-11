"use client";

import { useState, useEffect } from "react";
import { getJobs, JobListing, createJob } from "@/lib/services/jobs";
import { Plus, Briefcase, Trash2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import JobImportModal from "@/components/jobs/JobImportModal";
import { ParsedJobData } from "@/lib/utils/jobParser";

export default function AdminJobsPage() {
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success("Job deleted");
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const { profile } = useAuthStore();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [logo, setLogo] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'>("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const res = await getJobs();
    if (res.success && res.jobs) {
      setJobs(res.jobs);
    }
    setLoading(false);
  };

  const handleImportJob = (parsed: ParsedJobData) => {
    if (parsed.title) setTitle(parsed.title);
    if (parsed.company) setCompany(parsed.company);
    if (parsed.location) setLocation(parsed.location);
    if (parsed.type) setType(parsed.type);
    if (parsed.salary) setSalary(parsed.salary);
    if (parsed.description) setDescription(parsed.description);
    setShowPostModal(true);
  };

  const handlePostCuratedJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    
    // Admin posts job on behalf of another company
    const res = await createJob({
      title,
      company: company || "Rhockstar Connect",
      location,
      type,
      salary,
      description,
      customCompany: company,
      customLogo: logo
    }, profile.uid);

    if (res.success) {
      toast.success("Curated job posted successfully!");
      setShowPostModal(false);
      setTitle("");
      setCompany("");
      setLogo("");
      setLocation("");
      setSalary("");
      setDescription("");
      loadJobs();
    } else {
      toast.error(res.error || "Failed to post job");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Job Board Management</h1>
          <p className="text-gray-400 text-sm">Post curated jobs on behalf of external companies or moderate employer posts.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => {
              setShowPostModal(true);
              setShowImportModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            AI Import Job
          </button>
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="h-5 w-5" />
            Post Curated Job
          </button>
        </div>
      </div>

      <div className="bg-[#1C1C1E] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#252528]">
          <h2 className="font-semibold text-white">All Active Jobs</h2>
          <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{jobs.length} total</span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No jobs found.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {jobs.map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                    {job.logo?.length === 1 ? job.logo : (
                       // eslint-disable-next-line @next/next/no-img-element
                      <img src={job.logo} alt={job.company} className="w-full h-full object-cover rounded" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{job.title}</h3>
                    <p className="text-sm text-gray-400">{job.company} • {job.type}</p>
                  </div>
                </div>
                
                <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1C1C1E] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1C1C1E] z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Post a Curated Job</h2>
                  <p className="text-xs text-gray-400">SuperAdmin external job curation</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-400 border border-blue-500/30 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  AI Auto-Fill
                </button>
                <button 
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-white text-xl p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePostCuratedJob} className="p-5 sm:p-6 space-y-4 flex-1">
              {/* Quick AI auto-fill banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Fast Auto-Fill with AI
                      <span className="text-[9px] bg-blue-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">One-Click</span>
                    </div>
                    <div className="text-[11px] text-gray-400">Paste raw text or upload a spec to auto-populate all fields</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-lg transition-all shrink-0 shadow-sm"
                >
                  Paste Listing
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Netflix"
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Logo URL (optional)</label>
                  <input 
                    type="text" 
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hybrid / Lagos, Nigeria"
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Employment Type <span className="text-rose-500">*</span></label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 text-sm"
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Salary Range <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. ₦150,000–₦200,000 per month"
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Detail key responsibilities, requirements, and application instructions..."
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 resize-y font-mono text-sm leading-relaxed"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Re-import text
                </button>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {submitting ? "Posting..." : "Post Curated Job"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Smart Import Modal */}
      <JobImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportJob}
      />
    </div>
  );
}
