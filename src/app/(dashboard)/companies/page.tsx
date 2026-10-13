"use client";

import { useEffect, useState } from "react";
import { getAllUsers, UserBasic } from "@/lib/services/users";
import { Loader2, Search, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      const res = await getAllUsers();
      if (res.success && res.users) {
        // Filter for employers only
        const employerUsers = res.users.filter(u => u.accountType === 'employer');
        setCompanies(employerUsers);
      }
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Filter companies based on search
  const filteredCompanies = companies.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
      
      {/* HEADER & SEARCH */}
      <div className="neo-card p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-white/5">
            <Building2 className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Companies</h1>
            <p className="text-slate-400 font-medium">Discover top employers on Rhockstar Connect</p>
          </div>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search companies or industries..."
            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* DISCOVER COMPANIES */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? filteredCompanies.map(company => (
            <div key={company.uid} className="neo-card p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col group hover:-translate-y-1 transition-all duration-300">
              <Link href={`/company/${company.username}`} className="flex flex-col w-full block">
                <div className="flex items-start justify-between mb-4">
                  <UserAvatar src={company.avatar} name={company.fullName} className="w-16 h-16 border border-white/10 group-hover:border-blue-500/50 transition-all" textClassName="text-2xl font-bold" />
                  {company.industry && (
                    <span className="text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                      {company.industry}
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-xl text-white mb-1 truncate w-full group-hover:text-blue-500 transition-colors">{company.fullName}</h3>
                
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  {typeof company.location === 'string' ? company.location : (company.location?.city ? `${company.location.city}, ${company.location.country}` : "Global")}
                </div>

                <p className="text-slate-300 text-sm line-clamp-2 flex-grow mb-6">
                  {company.bio || "Leading innovation and building the future. Click to learn more about our company and open roles."}
                </p>

                <div className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5">
                  View Company Page
                </div>
              </Link>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-400 neo-card border border-white/5 rounded-3xl">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="font-medium text-lg text-white">No companies found</p>
              <p>Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
