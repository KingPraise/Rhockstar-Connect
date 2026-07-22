"use client";

import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Plus, Building2, GraduationCap, Code2, Globe, Heart, ChevronRight, Zap } from "lucide-react";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 relative">
      <ProfileHeader onEditClick={() => setIsEditModalOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* About Section */}
          <div className="neo-card flex flex-col gap-4 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 text-brand" />
                About Me
              </h2>
              <button className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed pt-2">
              Passionate full-stack developer with 5+ years of experience building scalable web applications. 
              Currently focused on creating the next generation of social networking platforms. 
              Always eager to learn new technologies and collaborate with brilliant minds. Let&apos;s build something amazing together! 🚀
            </p>
          </div>

          {/* Experience Section */}
          <div className="neo-card flex flex-col gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Building2 className="w-6 h-6 text-brand-purple" />
                Experience
              </h2>
              <button className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {/* Experience Item */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item is-active">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border-4 border-slate-900 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white z-10 shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] neo-card p-6 bg-slate-800/50 group-hover/item:border-brand-purple/50 transition-colors shadow-lg">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-xl text-white">Founder & Lead Developer</h3>
                    </div>
                    <p className="text-brand-purple font-semibold text-lg">Code Dynasty ICT Solutions</p>
                    <p className="text-slate-300 text-sm mt-2 font-medium bg-white/5 w-fit px-3 py-1 rounded-full border border-white/10">Jan 2024 - Present • Lagos</p>
                    <p className="text-slate-400 mt-4 leading-relaxed">Leading a team of developers to build innovative web and mobile solutions for clients worldwide. Architecting microservices and managing cloud infrastructure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Education Section */}
          <div className="neo-card flex flex-col gap-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <GraduationCap className="w-6 h-6 text-emerald-500" />
                Education
              </h2>
              <button className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-5 group/edu p-4 -mx-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-slate-800 shadow-lg border border-white/10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover/edu:scale-110 group-hover/edu:border-emerald-500/50 transition-all">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="flex flex-col justify-center flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-white group-hover/edu:text-emerald-500 transition-colors">University of Technology</h3>
                  <ChevronRight className="w-5 h-5 text-slate-500 opacity-0 group-hover/edu:opacity-100 transition-opacity" />
                </div>
                <p className="text-slate-300 font-semibold text-lg mt-1">B.Sc. Computer Science</p>
                <p className="text-slate-400 text-sm mt-1">2020 - 2024 • First Class Honors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="flex flex-col gap-8">
          
          {/* Skills Section */}
          <div className="neo-card flex flex-col gap-6 relative overflow-hidden bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Code2 className="w-5 h-5 text-brand" />
                Top Skills
              </h2>
              <button className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="group/skill">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-white group-hover/skill:text-brand transition-colors">React / Next.js</span>
                  <span className="text-sm font-semibold text-brand">95%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className="bg-brand h-2.5 rounded-full group-hover/skill:shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-shadow" style={{ width: "95%" }}></div>
                </div>
              </div>

              <div className="group/skill">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-white group-hover/skill:text-blue-500 transition-colors">TypeScript</span>
                  <span className="text-sm font-semibold text-blue-500">90%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className="bg-blue-500 h-2.5 rounded-full group-hover/skill:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-shadow" style={{ width: "90%" }}></div>
                </div>
              </div>

              <div className="group/skill">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-white group-hover/skill:text-cyan-400 transition-colors">Tailwind CSS</span>
                  <span className="text-sm font-semibold text-cyan-400">98%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className="bg-cyan-400 h-2.5 rounded-full group-hover/skill:shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-shadow" style={{ width: "98%" }}></div>
                </div>
              </div>

              <div className="group/skill">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-white group-hover/skill:text-green-500 transition-colors">Node.js</span>
                  <span className="text-sm font-semibold text-green-500">85%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className="bg-green-500 h-2.5 rounded-full group-hover/skill:shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-shadow" style={{ width: "85%" }}></div>
                </div>
              </div>

              <div className="group/skill">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-white group-hover/skill:text-orange-500 transition-colors">Firebase</span>
                  <span className="text-sm font-semibold text-orange-500">80%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className="bg-orange-500 h-2.5 rounded-full group-hover/skill:shadow-[0_0_10px_rgba(249,115,22,0.8)] transition-shadow" style={{ width: "80%" }}></div>
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 mt-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-brand-purple" />
              Show all 15 skills
            </button>
          </div>

          {/* Languages Section */}
          <div className="neo-card flex flex-col gap-6 relative overflow-hidden bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Globe className="w-5 h-5 text-blue-500" />
                Languages
              </h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                <span className="font-bold text-white">English</span>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">NATIVE</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                <span className="font-bold text-white">Yoruba</span>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">NATIVE</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
}

