"use client";

import { useState } from "react";
import { X, Upload, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUserProfile } from "@/lib/services/users";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { profile, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"personal" | "professional" | "social" | "privacy">("personal");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || "",
    username: profile?.username || "",
    phone: profile?.phone || "",
    dob: profile?.dob || "",
    location: typeof profile?.location === 'string' ? profile.location : (profile?.location?.city || ""),
    relationship: profile?.relationship || "Single",
    bio: profile?.bio || "",
    headline: profile?.headline || "",
    website: profile?.website || "",
    skills: profile?.skills?.join(", ") || "",
    education: profile?.education || "",
    visibility: profile?.visibility || "public",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      let avatarUrl = profile.avatar;
      
      if (avatarFile) {
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Upload timed out. Check your internet connection or Firebase Storage rules.")), 15000);
        });

        const storageRef = ref(storage, `avatars/${profile.uid}_${Date.now()}`);
        
        // Race the upload against the 15-second timeout
        const snapshot = await Promise.race([
          uploadBytes(storageRef, avatarFile),
          timeoutPromise
        ]) as any;

        avatarUrl = await getDownloadURL(snapshot.ref);
      }

      const updateData = {
        fullName: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        dob: formData.dob,
        location: formData.location,
        relationship: formData.relationship,
        bio: formData.bio,
        headline: formData.headline,
        website: formData.website,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        education: formData.education,
        visibility: formData.visibility,
        ...(avatarUrl && { avatar: avatarUrl })
      };

      const result = await updateUserProfile(profile.uid, updateData);
      
      if (result.success) {
        // Update local store
        setProfile({
          ...profile,
          ...updateData
        } as any);
        onClose();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="flex flex-col gap-6">
              
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-secondary ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-brand" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center text-white text-xl font-bold">
                          {formData.fullName?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <label htmlFor="avatarUpload" className="neo-button text-sm flex items-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4" /> Change Photo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="neo-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="neo-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="neo-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="neo-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="neo-input" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">Relationship Status</label>
                      <select name="relationship" value={formData.relationship} onChange={handleInputChange} className="neo-input cursor-pointer bg-transparent">
                        <option>Single</option>
                        <option>In a Relationship</option>
                        <option>Married</option>
                        <option>Complicated</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="neo-input min-h-[100px] resize-y"></textarea>
                  </div>
                </div>
              )}

              {/* Professional Tab */}
              {activeTab === "professional" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Professional Title / Headline</label>
                    <input type="text" name="headline" value={formData.headline} onChange={handleInputChange} className="neo-input" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Website</label>
                    <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="neo-input" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Skills (Comma separated)</label>
                    <textarea name="skills" value={formData.skills} onChange={handleInputChange} className="neo-input" placeholder="React, Node.js, Design..."></textarea>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Education</label>
                    <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="neo-input" />
                  </div>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === "social" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {['LinkedIn', 'Twitter', 'GitHub', 'Instagram'].map(social => (
                    <div key={social} className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-secondary ml-1">{social}</label>
                      <input type="url" className="neo-input" placeholder={`https://${social.toLowerCase()}.com/...`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-secondary ml-1">Profile Visibility</label>
                    <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="neo-input cursor-pointer bg-transparent">
                      <option value="public">Public - Anyone can see</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pb-24 md:pb-4 border-t border-border bg-surface-raised flex justify-end gap-4">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="neo-button bg-surface shadow-sm text-secondary hover:text-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="neo-button neo-button-primary min-w-[140px] flex justify-center"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
