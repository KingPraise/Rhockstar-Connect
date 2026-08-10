"use client";

import { useState } from "react";
import { 
  Settings as SettingsIcon, User, Lock, Bell, 
  Shield, Eye, Smartphone, Globe, CreditCard,
  LogOut, Sparkles, Briefcase, Crown
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";

import LogoutConfirmModal from "@/components/auth/LogoutConfirmModal";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, logout, aiWidgetVisible, setAiWidgetVisible } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT" || !profile?.uid) return;
    setIsDeleting(true);
    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await deleteDoc(doc(db, "users", profile.uid));
      await logoutUser();
      logout();
      toast.success("Your account has been deleted");
      router.push("/register");
    } catch (error) {
      toast.error("Failed to delete account");
    }
    setIsDeleting(false);
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
        <div className="md:col-span-1 flex md:flex-col overflow-x-auto gap-2 md:gap-0 md:space-y-2 no-scrollbar pb-2 md:pb-0 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
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

              <div className="pt-8 border-t border-white/10 space-y-6">
                <h3 className="text-xl font-bold text-white">Preferences</h3>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      AI Assistant Widget
                    </h4>
                    <p className="text-sm text-slate-400">Show the floating AI assistant on your dashboard.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={aiWidgetVisible}
                      onChange={(e) => {
                        setAiWidgetVisible(e.target.checked);
                        if (e.target.checked) {
                          localStorage.removeItem('aiWidgetHidden');
                        } else {
                          localStorage.setItem('aiWidgetHidden', 'true');
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>
                </div>

              {/* Employer Status */}
              {(profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer') && (
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <h3 className="text-xl font-bold text-white">Employer Account</h3>
                  <div className="bg-gradient-to-r from-emerald-900/40 to-slate-800 p-6 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white mb-1">You are an Employer!</h4>
                      <p className="text-sm text-slate-400">You have access to the Employer Dashboard to post jobs and manage applications.</p>
                    </div>
                    <a 
                      href="/employer"
                      className="whitespace-nowrap px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Briefcase className="w-5 h-5" />
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              )}

              {/* Employer Upgrade */}
              {profile?.accountType !== 'employer' && profile?.role !== 'admin' && (profile as any)?.role !== 'employer' && (
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <h3 className="text-xl font-bold text-white">Employer Account</h3>
                  <div className="bg-gradient-to-r from-blue-900/40 to-slate-800 p-6 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white mb-1">Looking to hire talent?</h4>
                      <p className="text-sm text-slate-400">Upgrade your account to Employer status to post jobs and manage applicants.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!profile?.uid) return;
                        const { becomeEmployer } = await import('@/lib/services/users');
                        const res = await becomeEmployer(profile.uid);
                        if (res.success) {
                          useAuthStore.getState().setProfile({ ...profile, role: 'employer' } as any);
                          toast.success("Successfully upgraded to Employer!");
                        } else {
                          toast.error("Failed to upgrade account");
                        }
                      }}
                      className="whitespace-nowrap px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                    >
                      Become an Employer
                    </button>
                  </div>
                </div>
              )}
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
                      onClick={() => setShowLogoutModal(true)}
                      className="bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout Account
                    </button>
                    
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logout Modal */}
          <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="neo-card bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-extrabold text-white">Delete Account Permanent</h2>
                  <p className="text-sm text-slate-400">This action cannot be undone. All your posts, connection data, and settings will be removed permanently.</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    To confirm, please type <span className="text-rose-500 font-mono select-all">&quot;DELETE MY ACCOUNT&quot;</span> below:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-sm transition-colors border border-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || isDeleting}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-800 text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Billing & Premium</h2>
              
              <div className={`border rounded-2xl p-6 relative overflow-hidden ${
                (profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite')
                  ? 'bg-gradient-to-br from-emerald-500/20 via-brand/20 to-brand-purple/20 border-emerald-500/40'
                  : 'bg-gradient-to-br from-brand-purple/20 to-brand/20 border-brand-purple/30'
              }`}>
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white capitalize">
                      {profile?.subscriptionTier && profile.subscriptionTier !== 'free' 
                        ? `${profile.subscriptionTier} Plan` 
                        : 'Free Plan'}
                    </h3>
                    {(profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite') && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mb-6 text-sm">
                    {(profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite')
                      ? `Your ${profile.subscriptionTier.toUpperCase()} membership is active with full access to unlimited messaging, job applications, and premium analytics.`
                      : 'You are currently on the free basic plan.'}
                  </p>
                  <a href="/premium" className={`inline-block font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform ${
                    (profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-r from-brand to-brand-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  }`}>
                    {(profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite')
                      ? 'Manage Membership'
                      : 'Upgrade to Premium'}
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
            <div className="neo-card p-8 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl space-y-8 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                <p className="text-slate-400 text-sm mt-1">Control how and when you receive activity alerts on Rhockstar Connect.</p>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-extrabold text-brand uppercase tracking-wider">In-App Alerts</h3>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Direct Messages</h4>
                    <p className="text-xs text-slate-400">Receive instant alerts when connections send you messages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Message notification preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Connection Requests & Accepts</h4>
                    <p className="text-xs text-slate-400">Get notified when someone sends or accepts a connection request.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Connection alert preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Feed Comments & Likes</h4>
                    <p className="text-xs text-slate-400">Get notified when users like or comment on your community posts.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Post interaction preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Job Applications & Recruiter Updates</h4>
                    <p className="text-xs text-slate-400">Receive status updates when employers review your applications.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Job application alert preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Dating Likes & Matches</h4>
                    <p className="text-xs text-slate-400">Get notified instantly when someone likes your dating profile or matches with you.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Dating notification preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <h3 className="text-sm font-extrabold text-brand uppercase tracking-wider pt-4 border-t border-white/10">Email Digest & Push Notifications</h3>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Weekly Career Highlights</h4>
                    <p className="text-xs text-slate-400">Weekly email summaries of recommended jobs and network growth.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Weekly email digest preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:border-brand/30 transition-all">
                  <div>
                    <h4 className="font-bold text-white text-base">Desktop Push Alerts</h4>
                    <p className="text-xs text-slate-400">Receive browser notifications when you are active on Rhockstar Connect.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Desktop push notification preference saved!")} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
