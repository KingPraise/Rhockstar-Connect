"use client";

import { useState, useEffect } from "react";
import { 
  UserCheck, 
  Shield, 
  Mail, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Camera, 
  Key, 
  Lock 
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { updateAdminProfile } from "@/lib/services/admin";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
];

export default function AdminProfilePage() {
  const { profile, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "Elijah Peter Akusu");
      setHeadline(profile.headline || "Founder & Super Administrator");
      setBio(profile.bio || "Super Administrator overseeing Rhockstar Connect operations, moderation, and user experience.");
      setAvatar(profile.avatar || AVATAR_OPTIONS[1]);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    const res = await updateAdminProfile(profile.uid, {
      fullName,
      headline,
      bio,
      avatar
    });
    setSaving(false);

    if (res.success) {
      setProfile({
        ...profile,
        fullName,
        headline,
        bio,
        avatar
      });
      setToastMsg("🎉 Super Admin Profile updated successfully!");
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  return (
    <div className="space-y-6 pt-12 lg:pt-0 animate-fade-in max-w-3xl">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Super Admin Profile</h1>
          <p className="text-sm text-slate-400">Manage your administrative credentials and public administrator card</p>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* PROFILE CARD & FORM */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md space-y-6 shadow-2xl">
        {/* AVATAR SELECTOR */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-rose-500/20 relative border-2 border-rose-500 shadow-xl flex-shrink-0">
            {avatar ? (
              <Image src={avatar} alt="Admin Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-rose-500">
                E
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Admin Avatar</h4>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {AVATAR_OPTIONS.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(imgUrl)}
                  className={`w-9 h-9 rounded-full relative overflow-hidden border-2 transition-all ${
                    avatar === imgUrl ? "border-rose-500 scale-110 shadow-lg shadow-rose-500/50" : "border-white/10 hover:border-white/50"
                  }`}
                >
                  <Image src={imgUrl} alt={`Option ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
              <input
                type="email"
                disabled
                value={profile?.email || "elijah@rhockstarconnect.com"}
                className="w-full mt-1.5 bg-slate-950/50 border border-white/5 rounded-xl p-3 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full mt-1.5 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white font-extrabold text-sm shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Admin Profile</>}
            </button>

            <button
              type="button"
              onClick={() => setResetPasswordOpen(true)}
              className="px-5 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-amber-400" /> Change Password
            </button>
          </div>
        </form>
      </div>

      <ResetPasswordModal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
    </div>
  );
}
