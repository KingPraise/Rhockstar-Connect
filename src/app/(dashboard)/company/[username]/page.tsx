"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserByUsername, UserBasic } from "@/lib/services/users";
import { Loader2, Building2, MapPin, Globe, Users as UsersIcon, Plus, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getJobs } from "@/lib/services/jobs";

export default function CompanyPage() {
  const params = useParams();
  const username = params.username as string;
  const { profile: loggedInProfile } = useAuthStore();
  
  const [company, setCompany] = useState<UserBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanyAndJobs = async () => {
      setLoading(true);
      const res = await getUserByUsername(username);
      if (res.success && res.user && res.user.accountType === 'employer') {
        setCompany(res.user);
        
        // Fetch jobs posted by this company (mock for now)
        const jobsRes = await getJobs();
        if (jobsRes.success) {
          // In a real scenario, we would filter by jobsRes.jobs.filter(j => j.companyId === res.user.uid)
          // For now, we'll just show a couple of mock jobs
          setJobs(jobsRes.jobs?.slice(0, 3) || []);
        }
      }
      setLoading(false);
    };
    
    if (username) {
      fetchCompanyAndJobs();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-pulse p-4 md:p-0 mt-8">
        <div className="h-64 bg-slate-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="h-40 bg-slate-800 rounded-3xl"></div>
            <div className="h-40 bg-slate-800 rounded-3xl"></div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="h-80 bg-slate-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="w-full max-w-3xl mx-auto neo-card p-10 text-center flex flex-col items-center gap-6 my-12 bg-slate-900/80">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Company Not Found</h2>
        <p className="text-slate-400">The company profile you are looking for does not exist or has been removed.</p>
        <Link href="/companies" className="py-3 px-6 rounded-xl bg-slate-800 text-white font-bold border border-white/10">
          Browse Companies
        </Link>
      </div>
    );
  }

  const isOwnProfile = loggedInProfile?.uid === company.uid;
  const locationString = typeof company.location === 'string' ? company.location : (company.location?.city ? `${company.location.city}, ${company.location.country}` : "Global");

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 relative p-4 md:p-0">
      
      {/* COMPANY HEADER */}
      <div className="neo-card p-0 overflow-hidden flex flex-col bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        </div>

        <div className="px-6 md:px-8 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-16 md:-top-24 left-6 md:left-8 rounded-2xl p-1 bg-slate-900 shadow-2xl z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-5xl md:text-6xl font-extrabold relative overflow-hidden ring-1 ring-white/10">
              {company.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.avatar} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                company.fullName.substring(0, 1).toUpperCase()
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 pb-2 gap-2">
            {isOwnProfile ? (
              <Link 
                href="/profile"
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 transition-all border border-white/5 shadow-lg"
              >
                Edit Company Profile
              </Link>
            ) : (
              <button className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20">
                Follow Company
              </button>
            )}
          </div>

          <div className="mt-8 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              {company.fullName}
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </h1>
            
            <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed mt-2 mb-6">
              {company.headline || "Innovating the future."}
            </p>

            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-300">
              {company.industry && (
                <div className="flex items-center gap-2 bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5 font-medium">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  {company.industry}
                </div>
              )}
              <div className="flex items-center gap-2 bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {locationString}
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5">
                <UsersIcon className="w-4 h-4 text-slate-400" />
                {company.companySize || "Size not specified"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* About Section */}
          <div className="neo-card p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              About Us
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed pt-2 whitespace-pre-wrap">
              {company.bio || "No company description provided."}
            </p>
          </div>

          {/* Open Roles (Jobs) Section */}
          <div className="neo-card p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                Open Roles
                <span className="bg-emerald-500/20 text-emerald-400 text-sm py-1 px-3 rounded-full">{jobs.length}</span>
              </h2>
              {isOwnProfile && (
                <Link href="/jobs/post" className="text-sm font-bold bg-white text-slate-900 py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors">
                  <Plus className="w-4 h-4" /> Post Job
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {jobs.length > 0 ? jobs.map(job => (
                <Link key={job.id} href={`/jobs`} className="p-5 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-emerald-500/30 transition-all group block">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                      <div className="flex gap-4 text-sm text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location} ({job.type})</span>
                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.department}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-lg">No open roles at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="flex flex-col gap-8">
          
          {/* Company Details */}
          <div className="neo-card p-6 relative overflow-hidden bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
            <h2 className="text-xl font-bold text-white mb-6">Company Details</h2>
            
            <div className="flex flex-col gap-5">
              {company.website && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Website</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium break-all">
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {company.foundedYear && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Founded</p>
                  <p className="text-white font-medium">{company.foundedYear}</p>
                </div>
              )}

              {company.portfolio && company.portfolio.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Social Links</p>
                  <div className="flex flex-col gap-2">
                    {company.portfolio.map((link: string, idx: number) => (
                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white truncate bg-slate-800/50 p-2 rounded-lg border border-white/5">
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <div className="neo-card p-6 relative overflow-hidden group bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-emerald-500/30 shadow-2xl">
              <h2 className="text-xl font-bold text-emerald-400 mb-2">Employer Dashboard</h2>
              <p className="text-slate-300 text-sm mb-4">Manage your job listings and view applicants.</p>
              <div className="flex flex-col gap-3">
                <Link href={`/company/${username}/ats`} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-400 transition-colors block text-center">
                  Applicant Tracking (ATS)
                </Link>
                <Link href="/jobs/post" className="w-full py-3 bg-slate-800 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 hover:bg-slate-700 transition-colors block text-center">
                  Post a New Job
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
