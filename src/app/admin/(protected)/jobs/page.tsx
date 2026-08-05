"use client";

import { useState, useEffect } from "react";
import { getJobs, JobListing, createJob } from "@/lib/services/jobs";
import { Plus, Briefcase, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "react-hot-toast";

export default function AdminJobsPage() {
  const { profile } = useAuthStore();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
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

  const handlePostCuratedJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    
    // Admin posts job on behalf of another company
    const res = await createJob({
      title,
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Job Board Management</h1>
          <p className="text-gray-400">Post curated jobs on behalf of external companies or moderate employer posts.</p>
        </div>
        <button 
          onClick={() => setShowPostModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Post Curated Job
        </button>
      </div>

      <div className="bg-[#1C1C1E] border border-gray-800 rounded-xl overflow-hidden">
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
                
                <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1C1C1E] z-10">
              <h2 className="text-xl font-bold text-white">Post a Curated Job</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePostCuratedJob} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Netflix"
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Employment Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Salary Range</label>
                <input 
                  type="text" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#2C2C2E] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Curated Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
