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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* About Section */}
          <div className="neo-card flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-brand" />
                About Me
              </h2>
              <button className="text-secondary hover:text-brand hover:bg-brand/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-secondary text-lg leading-relaxed pt-2">
              Passionate full-stack developer with 5+ years of experience building scalable web applications. 
              Currently focused on creating the next generation of social networking platforms. 
              Always eager to learn new technologies and collaborate with brilliant minds. Let&apos;s build something amazing together! 🚀
            </p>
          </div>

          {/* Experience Section */}
          <div className="neo-card flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6 text-success" />
                Experience
              </h2>
              <button className="text-secondary hover:text-success hover:bg-success/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {/* Experience Item */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group/item is-active">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-surface-raised border-[3px] border-surface shadow-[0_0_0_3px_rgba(20,184,166,0.2)] text-success z-10 shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] neo-inner p-5 rounded-2xl group-hover/item:border-success/30 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-xl text-primary">Founder & Lead Developer</h3>
                    </div>
                    <p className="text-success font-semibold text-lg">Code Dynasty ICT Solutions</p>
                    <p className="text-tertiary text-sm mt-1 font-medium bg-surface-raised w-fit px-3 py-1 rounded-full border border-border">Jan 2024 - Present • Lagos</p>
                    <p className="text-secondary mt-3 leading-relaxed">Leading a team of developers to build innovative web and mobile solutions for clients worldwide. Architecting microservices and managing cloud infrastructure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Education Section */}
          <div className="neo-card flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-accent" />
                Education
              </h2>
              <button className="text-secondary hover:text-accent hover:bg-accent/10 p-2 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-5 group/edu p-4 -mx-4 rounded-2xl hover:bg-surface-raised transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-surface to-surface-raised shadow-neo border border-border rounded-xl flex items-center justify-center text-accent shrink-0 group-hover/edu:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="flex flex-col justify-center flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-primary group-hover/edu:text-accent transition-colors">University of Technology</h3>
                  <ChevronRight className="w-5 h-5 text-tertiary opacity-0 group-hover/edu:opacity-100 transition-opacity" />
                </div>
                <p className="text-secondary font-semibold text-lg mt-1">B.Sc. Computer Science</p>
                <p className="text-tertiary text-sm mt-1">2020 - 2024 • First Class Honors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="flex flex-col gap-8">
          {/* Skills Section */}
          <div className="neo-card flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-500" />
                Top Skills
              </h2>
              <button className="text-secondary hover:text-purple-500 hover:bg-purple-500/10 p-1.5 rounded-full transition-all group-hover:scale-110">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 mt-2">
              {[
                { name: 'React / Next.js', level: 95, color: 'bg-brand' },
                { name: 'TypeScript', level: 90, color: 'bg-blue-500' },
                { name: 'Tailwind CSS', level: 98, color: 'bg-cyan-500' },
                { name: 'Node.js', level: 85, color: 'bg-success' },
                { name: 'Firebase', level: 80, color: 'bg-amber-500' }
              ].map(skill => (
                <div key={skill.name} className="flex flex-col gap-1.5 group/skill cursor-default">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-primary">{skill.name}</span>
                    <span className="text-tertiary font-medium">{skill.level}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-raised rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${skill.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 text-sm font-semibold text-secondary hover:text-primary bg-surface-raised rounded-xl transition-colors border border-border flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              Show all 15 skills
            </button>
          </div>

          {/* Languages Section */}
          <div className="neo-card flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Languages
            </h2>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-raised transition-colors border border-transparent hover:border-border cursor-default">
                <span className="font-semibold text-primary text-lg">English</span>
                <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Native</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-raised transition-colors border border-transparent hover:border-border cursor-default">
                <span className="font-semibold text-primary text-lg">Yoruba</span>
                <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Native</span>
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

