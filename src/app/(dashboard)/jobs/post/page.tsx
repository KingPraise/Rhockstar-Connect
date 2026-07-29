"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createJob } from "@/lib/services/jobs";
import { Loader2, Briefcase, MapPin, DollarSign, Building2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PostJobPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "Full-time" as any,
    location: "",
    salary: "",
    description: "",
  });

  // Ensure only employers can access (in a real app, middleware would handle this)
  if (profile && profile.accountType !== 'employer') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Building2 className="w-16 h-16 text-slate-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Employer Access Required</h2>
        <p className="text-slate-400 mb-6">Only employer accounts can post jobs.</p>
        <Link href="/jobs" className="py-2 px-6 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    
    setLoading(true);
    setError("");
    
    const res = await createJob({
      ...formData,
      company: profile.fullName
    }, profile.uid);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/jobs");
      }, 2000);
    } else {
      setError(res.error || "Failed to post job");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8">
      
      <div className="mb-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>

      <div className="neo-card p-6 md:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Post a New Job</h1>
            <p className="text-slate-400">Attract top talent to {profile?.fullName}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 ring-4 ring-emerald-500/10 animate-bounce">
              <Briefcase className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Job Posted Successfully!</h2>
            <p className="text-slate-400">Redirecting you back to the job board...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-300 ml-1">Job Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer" 
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-300 ml-1">Job Type</label>
                <div className="relative">
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-300 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA or Remote" 
                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-300 ml-1">Salary Range</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="salary"
                    required
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $120k - $150k" 
                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm font-bold text-slate-300 ml-1">Job Description</label>
              <textarea 
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and requirements..." 
                rows={8}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-y"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="py-3 px-8 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                Publish Job
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
