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
    <div className="neo-card p-0 overflow-hidden flex flex-col mb-6 group">
      {/* Cover Photo */}
      <div className="h-56 w-full bg-gradient-to-r from-brand via-accent to-brand bg-[length:200%_200%] animate-gradient-x relative transition-all duration-700">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <button className="absolute top-4 right-4 neo-button-primary bg-white/20 backdrop-blur-md text-white border-white/40 shadow-none hover:bg-white/30 text-sm py-2 px-4 flex items-center gap-2 group/btn">
          <Camera className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          Update Cover
        </button>
      </div>

      <div className="px-8 pb-8 relative">
        {/* Avatar */}
        <div className="absolute -top-20 left-8 rounded-full p-2 bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.04)] backdrop-blur-sm z-10 transition-transform duration-300 hover:scale-[1.02]">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary-light to-brand flex items-center justify-center text-white text-5xl font-extrabold relative overflow-hidden shadow-inner ring-4 ring-surface">
            EP
            {/* In a real app, this would be an <Image> tag if they have a photo */}
          </div>
          <button 
            onClick={onEditClick}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-surface shadow-neo-sm flex items-center justify-center text-secondary hover:text-brand transition-all hover:scale-110 border border-border"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 pb-2">
          <button 
            onClick={onEditClick}
            className="neo-button text-sm flex items-center gap-2 hover:bg-brand hover:text-white transition-all group/edit"
          >
            <Pencil className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" />
            Edit Profile
          </button>
        </div>

        {/* User Info */}
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2 tracking-tight text-primary">
              {user.fullName}
              {user.isVerified && <CheckCircle2 className="w-6 h-6 text-brand fill-brand/20" />}
            </h1>
            <p className="text-secondary font-semibold text-lg">@{user.username}</p>
          </div>

          <p className="text-primary text-xl font-medium max-w-2xl leading-relaxed">{user.headline}</p>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-secondary mt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-border hover:border-brand/30 transition-colors cursor-default">
              <MapPin className="w-4 h-4 text-brand" /> {user.location}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-border hover:border-success/30 transition-colors cursor-default">
              <Briefcase className="w-4 h-4 text-success" /> <span className="text-success font-medium">Available for work</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-border hover:border-brand/30 transition-colors cursor-pointer group/link">
              <LinkIcon className="w-4 h-4 text-brand group-hover/link:rotate-12 transition-transform" /> 
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                {user.website.replace("https://", "")}
              </a>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-border hover:border-brand/30 transition-colors cursor-default">
              <Calendar className="w-4 h-4 text-brand" /> Joined {user.joined}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-border bg-surface-raised/50 backdrop-blur-sm grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        <div className="flex items-center justify-center gap-4 py-6 hover:bg-surface-raised transition-colors cursor-pointer group/stat">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover/stat:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-primary tracking-tight">{user.stats.followers.toLocaleString()}</span>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">Followers</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 py-6 hover:bg-surface-raised transition-colors cursor-pointer group/stat">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover/stat:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-primary tracking-tight">{user.stats.connections.toLocaleString()}</span>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">Connections</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-6 hover:bg-surface-raised transition-colors cursor-pointer group/stat">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover/stat:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-primary tracking-tight">{user.stats.posts.toLocaleString()}</span>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">Posts</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-6 hover:bg-surface-raised transition-colors cursor-pointer group/stat">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/stat:scale-110 transition-transform">
            <Eye className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-primary tracking-tight">{user.stats.views.toLocaleString()}</span>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">Views</span>
          </div>
        </div>
      </div>
    </div>
  );
}

