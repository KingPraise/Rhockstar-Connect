"use client";

import { useState } from "react";
import { 
  Settings as SettingsIcon, User, Lock, Bell, 
  Shield, Eye, Smartphone, Globe, CreditCard,
  LogOut
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

export default function SettingsPage() {
  const { user, profile, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      router.push('/login');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing & Premium", icon: CreditCard },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shadow-lg">
          <SettingsIcon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Settings</h1>
          <p className="text-slate-400 font-medium">Manage your account preferences and settings.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? "bg-brand/10 text-brand border border-brand/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-brand" : "text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {activeTab === "account" && (
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Account Information</h2>
              
              <form 
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const fullName = formData.get('fullName') as string;
                  const username = formData.get('username') as string;
                  
                  if (profile?.uid) {
                    const { updateUserProfile } = await import('@/lib/services/users');
                    const res = await updateUserProfile(profile.uid, { fullName, username });
                    if (res.success) {
                      useAuthStore.getState().setProfile({ ...profile, fullName, username } as any);
                      toast.success('Profile updated successfully!');
                    } else {
                      toast.error('Failed to update profile');
                    }
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                  <input type="text" name="fullName" defaultValue={profile?.fullName || ""} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                  <input type="email" disabled defaultValue={user?.email || "user@example.com"} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors opacity-70 cursor-not-allowed" />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed directly.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Username</label>
                  <div className="flex bg-slate-800 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-colors">
                    <span className="bg-slate-900 px-4 py-3 text-slate-500 font-bold">@</span>
                    <input type="text" name="username" defaultValue={profile?.username || ""} className="w-full bg-transparent px-4 py-3 text-white focus:outline-none" />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Security Settings</h2>
              
              <div className="space-y-8">
                {/* Password Change */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Change Password</h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
                  </div>
                </div>

                {/* Verification */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white">Account Verification</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white">Email Verification</h4>
                      <p className="text-sm text-slate-400">Verify your email to secure your account.</p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-lg border border-emerald-500/20">Verified</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white">Phone Verification</h4>
                      <p className="text-sm text-slate-400">Add a phone number for two-factor authentication.</p>
                    </div>
                    <button className="px-4 py-2 bg-brand/10 text-brand font-bold rounded-lg border border-brand/20 hover:bg-brand hover:text-white transition-colors">Verify Now</button>
                  </div>
                </div>

                {/* Blocked Users */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white">Blocked Users</h3>
                  <p className="text-sm text-slate-400">Users you block will not be able to see your profile or contact you.</p>
                  <div className="p-4 bg-slate-800/30 border border-dashed border-white/10 rounded-xl text-center">
                    <p className="text-slate-500">You haven't blocked anyone yet.</p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-rose-500 font-bold mb-2">Danger Zone</h3>
                  <p className="text-slate-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleLogout}
                      className="bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout Account
                    </button>
                    
                    <button className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold py-3 px-8 rounded-xl transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Billing & Premium</h2>
              
              <div className="bg-gradient-to-br from-brand-purple/20 to-brand/20 border border-brand-purple/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
                  <p className="text-slate-300 mb-6">You are currently on the free basic plan.</p>
                  <a href="/premium" className="inline-block bg-gradient-to-r from-brand to-brand-purple text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform">
                    Upgrade to Premium
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Privacy Controls</h2>
                {profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite' && (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/30">Premium Features</span>
                )}
              </div>
              
              <div className="space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="font-bold text-white">Incognito Mode</h4>
                    <p className="text-sm text-slate-400">Browse profiles anonymously without them knowing.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled={profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite'} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="font-bold text-white">Hide Online Status</h4>
                    <p className="text-sm text-slate-400">Hide your active status from other users.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled={profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite'} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="font-bold text-white">Hide Read Receipts</h4>
                    <p className="text-sm text-slate-400">Turn off read receipts in direct messages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled={profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite'} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="font-bold text-white">Private Photo Albums</h4>
                    <p className="text-sm text-slate-400">Require approval for users to view your photos.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" disabled={profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite'} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50"></div>
                  </label>
                </div>
                
                {profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite' && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-sm text-amber-500 font-medium">Upgrade to Premium to unlock advanced privacy controls.</p>
                  </div>
                )}

              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in text-center py-20">
              <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-slate-400">Notification preferences will be available soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
