"use client";

import { MapPin, Briefcase, Link as LinkIcon, Calendar, CheckCircle2, Pencil, Camera, TrendingUp, Users, Activity, Eye } from "lucide-react";

interface ProfileHeaderProps {
  onEditClick: () => void;
}

export default function ProfileHeader({ onEditClick }: ProfileHeaderProps) {
  // Mock data for now until we hook up the Firestore listener
  const user = {
    fullName: "Elijah Peter",
    username: "elijah_p",
    headline: "Founder at Code Dynasty ICT Solutions | Full Stack Developer",
    location: "Lagos, Nigeria",
    website: "https://codedynasty.com",
    joined: "June 2026",
    isVerified: true,
    stats: {
      posts: 42,
      followers: 1250,
      connections: 500,
      views: 3400
    }
  };

  return (
    <div className="neo-card p-0 overflow-hidden flex flex-col mb-6 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl group">
      {/* Cover Photo */}
      <div className="h-64 w-full bg-gradient-to-r from-brand-purple via-brand to-brand-purple bg-[length:200%_200%] animate-gradient-x relative">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        <button className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-sm py-2 px-4 rounded-xl flex items-center gap-2 transition-all border border-white/10 shadow-lg">
          <Camera className="w-4 h-4" />
          Update Cover
        </button>
      </div>

      <div className="px-8 pb-8 relative">
        {/* Avatar */}
        <div className="absolute -top-24 left-8 rounded-full p-2 bg-slate-900 shadow-2xl z-10 transition-transform duration-300 hover:scale-[1.02]">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-brand-purple to-brand flex items-center justify-center text-white text-6xl font-extrabold relative overflow-hidden shadow-inner ring-4 ring-slate-800">
            EP
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <button 
            onClick={onEditClick}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-slate-800 shadow-lg flex items-center justify-center text-white hover:text-brand-purple transition-all hover:scale-110 border border-white/10"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 pb-2">
          <button 
            onClick={onEditClick}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 transition-all border border-white/5 shadow-lg hover:border-white/10"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="mt-4 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
            {user.fullName}
            {user.isVerified && (
              <CheckCircle2 className="w-6 h-6 text-brand" />
            )}
          </h1>
          <p className="text-slate-400 font-medium text-lg mt-1 mb-4">@{user.username}</p>
          
          <p className="text-white text-xl font-medium leading-relaxed mb-6">
            {user.headline}
          </p>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-300 mb-8">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {user.location}
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer bg-slate-800/50 py-1.5 px-4 rounded-full border border-white/5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Available for work
            </div>
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand hover:text-brand-purple transition-colors bg-brand/10 py-1.5 px-4 rounded-full border border-brand/20">
              <LinkIcon className="w-4 h-4" />
              codedynasty.com
            </a>
            <div className="flex items-center gap-2 text-slate-400 py-1.5 px-4 rounded-full border border-transparent">
              <Calendar className="w-4 h-4" />
              Joined {user.joined}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Divider */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5 bg-slate-900/50">
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand transition-colors">
            <Users className="w-5 h-5 text-brand" />
            1,250
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Followers</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand-purple transition-colors">
            <Activity className="w-5 h-5 text-brand-purple" />
            500
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Connections</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand transition-colors">
            <TrendingUp className="w-5 h-5 text-brand" />
            42
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Posts</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group/stat">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group-hover/stat:text-brand-purple transition-colors">
            <Eye className="w-5 h-5 text-brand-purple" />
            3,400
          </div>
          <span className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Views</span>
        </div>
      </div>
    </div>
  );
}

