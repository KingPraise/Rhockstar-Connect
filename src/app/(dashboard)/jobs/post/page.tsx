"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createJob } from "@/lib/services/jobs";
import { Loader2, Briefcase, MapPin, ChevronDown, DollarSign, Building2, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

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

  const isEmployer = (profile as any)?.accountType === 'employer' || (profile?.role as string) === 'employer' || profile?.role === 'admin';

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
      company: profile.fullName || "Rhockstar Partner Company"
    }, profile.uid);

    if (res.success) {
      setSuccess(true);
      toast.success("Job posted successfully!");
      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } else {
      setError(res.error || "Failed to post job");
      toast.error(res.error || "Failed to post job");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-white/5">
          <ChevronLeft className="w-4 h-4 text-brand" /> Back to Job Board
        </Link>
      </div>

      {!isEmployer && (
        <div className="mb-8 p-6 neo-card bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-brand/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand" />
              Employer Profile Upgrade Recommended
            </h3>
            <p className="text-slate-300 text-sm">
              Upgrade your profile to Employer status to manage applicants and build your company page.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!profile?.uid) return;
              const { becomeEmployer } = await import('@/lib/services/users');
              const res = await becomeEmployer(profile.uid);
              if (res.success) {
                useAuthStore.getState().setProfile({ ...profile, role: 'employer' } as any);
                toast.success("Successfully upgraded to Employer!");
              } else {
                toast.error("Failed to upgrade");
              }
            }}
            className="neo-button-primary whitespace-nowrap px-6 py-3 font-bold text-sm"
          >
            Become Employer Now
          </button>
        </div>
      )}

      <div className="neo-card p-6 md:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand via-brand-purple to-emerald-500"></div>
        
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-purple/20 text-brand border border-brand/30 flex items-center justify-center shadow-lg">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Post a New Job Opportunity</h1>
            <p className="text-slate-400 font-medium text-sm mt-0.5">Reach thousands of top talent across Nigeria and global remote networks.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Job Published Live!</h2>
            <p className="text-slate-400 text-sm max-w-md">Your job post is now active on the Rhockstar Connect job board. Candidates can start submitting applications immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-extrabold text-slate-200">Job Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Full-Stack Engineer" 
                  className="neo-input text-sm"
                />
              </div>
              
              <div className="space-y-2 text-left">
                <label className="text-sm font-extrabold text-slate-200">Employment Type <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Briefcase className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                  <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="neo-input pl-12 pr-10 text-sm cursor-pointer appearance-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
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
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Lagos, Nigeria or Remote (Global)" 
                    className="neo-input pl-12 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-extrabold text-slate-200">Salary Range <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="salary"
                    required
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. ₦600k - ₦1.2M / mo or $3,000 / mo" 
                    className="neo-input pl-12 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm font-extrabold text-slate-200">Job Description & Requirements <span className="text-rose-500">*</span></label>
              <textarea 
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Detail key responsibilities, qualifications, stack, and application guidelines..." 
                rows={7}
                className="neo-input text-sm resize-y"
              ></textarea>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <p className="text-xs text-slate-400">
                Jobs remain active for 30 days and are indexed on search engines automatically.
              </p>
              
              <button 
                type="submit" 
                disabled={loading}
                className="neo-button-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                Publish Job Listing Now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
