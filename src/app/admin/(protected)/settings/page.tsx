"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertOctagon, 
  Megaphone, 
  UserPlus, 
  Gift 
} from "lucide-react";
import { getAdminSettings, updateAdminSettings, AdminSettingsData } from "@/lib/services/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsData>({
    maintenanceMode: false,
    announcementBanner: "Welcome to Rhockstar Connect! Connect, Collaborate & Discover Opportunities.",
    allowRegistrations: true,
    referralMultiplier: 1,
    featuredSpotlightPrice: 9.99
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const data = await getAdminSettings();
      setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateAdminSettings(settings);
    setSaving(false);
    if (res.success) {
      setToastMsg("🎉 Global platform settings updated successfully!");
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
        <p className="text-sm text-slate-400">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0 animate-fade-in max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shadow-lg">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
          <p className="text-sm text-slate-400">Manage global maintenance modes, announcements, and referral policies</p>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* MAINTENANCE MODE TOGGLE */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Maintenance Mode</h3>
                <p className="text-xs text-slate-400">Restrict access to non-admin users during scheduled maintenance</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
        </div>

        {/* ANNOUNCEMENT BANNER */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purple flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Global Announcement Banner</h3>
              <p className="text-xs text-slate-400">Broadly displayed across all user dashboards</p>
            </div>
          </div>
          <textarea
            rows={3}
            value={settings.announcementBanner}
            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            placeholder="Type announcement message here..."
          />
        </div>

        {/* REGISTRATION TOGGLE */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Allow User Registrations</h3>
                <p className="text-xs text-slate-400">Enable or disable new user sign ups on the platform</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.allowRegistrations}
                onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* REFERRAL MULTIPLIER & SPOTLIGHT PRICE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white text-sm">Referral Point Multiplier</h4>
            </div>
            <input
              type="number"
              min={1}
              max={5}
              value={settings.referralMultiplier}
              onChange={(e) => setSettings({ ...settings, referralMultiplier: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-rose-400" />
              <h4 className="font-bold text-white text-sm">Featured Spotlight Price ($)</h4>
            </div>
            <input
              type="number"
              step="0.01"
              min={0}
              value={settings.featuredSpotlightPrice}
              onChange={(e) => setSettings({ ...settings, featuredSpotlightPrice: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white font-extrabold text-base shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Global Settings</>}
        </button>
      </form>
    </div>
  );
}
