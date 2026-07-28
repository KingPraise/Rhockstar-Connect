"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileModal from "@/components/profile/EditProfileModal";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import { Plus, Building2, GraduationCap, Code2, Globe, Heart, ChevronRight, Zap, Loader2, UserPlus, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserById, getUserByUsername } from "@/lib/services/users";
import { sendConnectionRequest } from "@/lib/services/connections";
import Link from "next/link";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { profile: loggedInProfile } = useAuthStore();
  
  const searchParams = useSearchParams();
  const queryUser = searchParams.get("user") || searchParams.get("username");
  const queryUid = searchParams.get("uid");

  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  useEffect(() => {
    const fetchTargetUser = async () => {
      if (queryUser) {
        setLoading(true);
        const res = await getUserByUsername(queryUser);
        if (res.success && res.user) {
          setTargetUser(res.user);
        }
        setLoading(false);
      } else if (queryUid) {
        setLoading(true);
        const res = await getUserById(queryUid);
        if (res.success && res.user) {
          setTargetUser(res.user);
        }
        setLoading(false);
      } else {
        setTargetUser(null);
      }
    };
    fetchTargetUser();
  }, [queryUser, queryUid]);

  const activeProfile = targetUser || loggedInProfile;
  const isOwnProfile = Boolean(!targetUser || (loggedInProfile && targetUser?.uid === loggedInProfile.uid));

  const handleConnect = async () => {
    if (!loggedInProfile) {
      setAuthModalOpen(true);
      return;
    }
    if (activeProfile?.uid) {
      await sendConnectionRequest(loggedInProfile.uid, activeProfile.uid);
      setConnectSuccess(true);
      setTimeout(() => setConnectSuccess(false), 3000);
    }
  };

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

  if (!activeProfile) {
    return (
      <div className="w-full max-w-3xl mx-auto neo-card p-10 text-center flex flex-col items-center gap-6 my-12 bg-slate-900/80">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Profile Not Found or Guest Mode</h2>
        <p className="text-slate-400">Log in to view your profile or explore professionals on Rhockstar Connect.</p>
        <div className="flex gap-4">
          <Link href="/login" className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold">
            Log In
          </Link>
          <Link href="/register" className="py-3 px-6 rounded-xl bg-slate-800 text-white font-bold border border-white/10">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 relative">
      <ProfileHeader 
        onEditClick={() => setIsEditModalOpen(true)} 
        customProfile={activeProfile}
        isOwnProfile={isOwnProfile}
        onConnectClick={handleConnect}
      />
      {connectSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-center animate-fade-in">
          Connection request sent successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* About Section */}
          <div className="neo-card p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
            <div className="flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Heart className="w-6 h-6 text-brand" />
                About Me
              </h2>
              <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed pt-2 whitespace-pre-wrap z-10">
              {activeProfile?.bio || "No bio added yet. Click edit to tell the world about yourself!"}
            </p>
          </div>

          {/* Experience Section */}
          <div className="neo-card p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
            <div className="flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Building2 className="w-6 h-6 text-brand-purple" />
                Experience
              </h2>
              <button className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent z-10">
              {/* Experience Item */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item is-active mt-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border-4 border-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white z-10 shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] neo-card p-6 bg-slate-800/50 hover:bg-slate-800 border border-white/5 group-hover/item:border-brand-purple/50 transition-all shadow-lg hover:shadow-brand-purple/10">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-xl text-white">Software Developer</h3>
                    </div>
                    <p className="text-brand-purple font-semibold text-lg">Acme Corp</p>
                    <p className="text-slate-300 text-sm mt-3 font-medium bg-white/5 w-fit px-3 py-1 rounded-full border border-white/10">Jan 2024 - Present</p>
                    <p className="text-slate-400 mt-4 leading-relaxed">Add dynamic experience entries here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Education Section */}
          <div className="neo-card p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <GraduationCap className="w-6 h-6 text-emerald-500" />
                Education
              </h2>
              <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="z-10 mt-2">
              {activeProfile?.education ? (
                <div className="flex gap-5 group/edu p-4 -mx-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-slate-800 shadow-lg border border-white/10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover/edu:scale-105 group-hover/edu:border-emerald-500/50 group-hover/edu:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col justify-center flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl text-white group-hover/edu:text-emerald-400 transition-colors">{activeProfile.education}</h3>
                      <ChevronRight className="w-5 h-5 text-slate-500 opacity-0 group-hover/edu:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-lg leading-relaxed">No education added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="flex flex-col gap-8">
          
          {/* Skills Section */}
          <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center mb-6 z-10 relative">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <Code2 className="w-5 h-5 text-blue-500" />
                Top Skills
              </h2>
              <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 z-10 relative">
              {activeProfile?.skills && activeProfile.skills.length > 0 ? (
                activeProfile.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-4 py-2 bg-slate-800/80 hover:bg-blue-500/10 text-slate-200 hover:text-blue-400 font-medium rounded-xl border border-white/10 hover:border-blue-500/30 transition-all cursor-default shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-lg">No skills added yet.</span>
              )}
            </div>
          </div>

          {/* Languages Section */}
          <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="flex justify-between items-center mb-6 z-10 relative">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <Globe className="w-5 h-5 text-amber-500" />
                Languages
              </h2>
              <button className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 z-10 relative">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-default border border-transparent hover:border-white/5">
                <span className="font-bold text-white text-lg">English</span>
                <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 uppercase tracking-wide">Native</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
      <AuthRequiredModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        actionName="connect with users" 
      />
    </div>
  );
}
