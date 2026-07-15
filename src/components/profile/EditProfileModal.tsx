"use client";

import { useState } from "react";
import { X, Upload, Save } from "lucide-react";

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "professional" | "social" | "privacy">("personal");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="neo-card w-full max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
          <h2 className="text-2xl font-bold text-brand">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-raised hover:bg-border text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-48 bg-surface-raised border-r border-border p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("personal")}
              className={`text-left px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "personal" ? "bg-primary text-white shadow-sm" : "text-secondary hover:bg-surface"}`}
            >
              Personal Info
            </button>
            <button 
              onClick={() => setActiveTab("professional")}
              className={`text-left px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "professional" ? "bg-primary text-white shadow-sm" : "text-secondary hover:bg-surface"}`}
            >
              Professional
            </button>
            <button 
              onClick={() => setActiveTab("social")}
              className={`text-left px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "social" ? "bg-primary text-white shadow-sm" : "text-secondary hover:bg-surface"}`}
            >
              Social Links
            </button>
            <button 
              onClick={() => setActiveTab("privacy")}
              className={`text-left px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "privacy" ? "bg-primary text-white shadow-sm" : "text-secondary hover:bg-surface"}`}
            >
              Privacy & Settings
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface">
            <form className="flex flex-col gap-6">
              
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-secondary ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center text-white text-xl font-bold">
                        EP
                      </div>
                      <button type="button" className="neo-button text-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Full Name</label>
                      <input type="text" className="neo-input" defaultValue="Elijah Peter" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Username</label>
                      <input type="text" className="neo-input" defaultValue="elijah_p" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Phone Number</label>
                      <input type="tel" className="neo-input" defaultValue="+234 800 000 0000" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Date of Birth</label>
                      <input type="date" className="neo-input" defaultValue="1995-06-15" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Location</label>
                      <input type="text" className="neo-input" defaultValue="Lagos, Nigeria" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Relationship Status</label>
                      <select className="neo-input cursor-pointer bg-transparent">
                        <option>Single</option>
                        <option>In a Relationship</option>
                        <option>Married</option>
                        <option>Complicated</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Bio</label>
                    <textarea className="neo-input min-h-[100px] resize-y" defaultValue="Passionate full-stack developer with 5+ years of experience building scalable web applications."></textarea>
                  </div>
                </div>
              )}

              {/* Professional Tab */}
              {activeTab === "professional" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Professional Title / Headline</label>
                    <input type="text" className="neo-input" defaultValue="Founder at Code Dynasty ICT Solutions | Full Stack Developer" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Website</label>
                    <input type="url" className="neo-input" defaultValue="https://codedynasty.com" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Skills (Comma separated)</label>
                    <textarea className="neo-input" defaultValue="React, Next.js, TypeScript, Node.js, Firebase, Tailwind CSS"></textarea>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Education</label>
                    <input type="text" className="neo-input" defaultValue="University of Technology" />
                  </div>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === "social" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {['LinkedIn', 'Twitter (X)', 'GitHub', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'WhatsApp'].map(social => (
                    <div key={social} className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">{social}</label>
                      <input type="url" className="neo-input" placeholder={`https://${social.toLowerCase().split(" ")[0]}.com/...`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Profile Visibility</label>
                    <select className="neo-input cursor-pointer bg-transparent">
                      <option value="public">Public - Anyone can see</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-4">
                    <label className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded-lg cursor-pointer hover:bg-surface transition-colors">
                      <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
                      <span className="font-medium text-secondary">Show online status</span>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded-lg cursor-pointer hover:bg-surface transition-colors">
                      <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
                      <span className="font-medium text-secondary">Allow search engines to index profile</span>
                    </label>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-raised flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="neo-button bg-surface shadow-sm text-secondary hover:text-primary"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="neo-button neo-button-primary"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
