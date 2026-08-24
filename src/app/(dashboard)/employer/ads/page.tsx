"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Advertisement, 
  subscribeToCompanyAds, 
  confirmAdPayment, 
  updateAdStatus 
} from "@/lib/services/ads";
import CreateAdModal from "@/components/ads/CreateAdModal";
import { 
  Megaphone, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MousePointerClick, 
  CreditCard, 
  Loader2, 
  Play, 
  Pause,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

export default function EmployerAdsPage() {
  const { profile } = useAuthStore();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [payingAdId, setPayingAdId] = useState<string | null>(null);

  // Subscribe to real-time company ads from Firestore
  useEffect(() => {
    if (!profile?.uid) return;
    const unsubscribe = subscribeToCompanyAds(profile.uid, (fetchedAds) => {
      setAds(fetchedAds);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile?.uid]);

  const handleSimulatePayment = async (ad: Advertisement) => {
    try {
      setPayingAdId(ad.id);
      // Simulate Paystack / Flutterwave success callback
      const res = await confirmAdPayment(ad.id);
      if (res.success) {
        toast.success(`Payment confirmed! Advert "${ad.title}" is now LIVE in the Feed! 🚀`);
      } else {
        toast.error("Failed to confirm payment");
      }
    } catch (err) {
      toast.error("Payment confirmation error");
    } finally {
      setPayingAdId(null);
    }
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    const nextStatus = ad.status === 'active' ? 'paused' : 'active';
    const res = await updateAdStatus(ad.id, nextStatus);
    if (res.success) {
      toast.success(`Advert ${nextStatus === 'active' ? 'activated' : 'paused'}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved (Pay Now)
          </span>
        );
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1 animate-pulse">
            <Play className="w-3.5 h-3.5" /> Live in Feed
          </span>
        );
      case "paused":
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-xs font-bold flex items-center gap-1">
            <Pause className="w-3.5 h-3.5" /> Paused
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1" title={rejectionReason}>
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Metrics summary
  const totalViews = ads.reduce((acc, ad) => acc + (ad.viewsCount || 0), 0);
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.clicksCount || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
      
      {/* Header */}
      <div className="neo-card p-6 rounded-3xl bg-slate-900/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 flex items-center justify-center border border-purple-500/30 text-purple-400 shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Advertiser Hub</h1>
            <p className="text-slate-400 text-sm">Create and manage your sponsored campaigns on Rhockstar Connect.</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Advert
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Impressions</span>
            <span className="text-2xl font-extrabold text-white">{totalViews.toLocaleString()}</span>
          </div>
        </div>

        <div className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Clicks</span>
            <span className="text-2xl font-extrabold text-white">{totalClicks.toLocaleString()}</span>
          </div>
        </div>

        <div className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Click-Through Rate (CTR)</span>
            <span className="text-2xl font-extrabold text-emerald-400">{ctr}%</span>
          </div>
        </div>
      </div>

      {/* Ad Campaign List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Your Campaigns</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10">{ads.length}</span>
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          </div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="neo-card p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-base">{ad.title}</h3>
                      <p className="text-xs text-slate-400">{ad.companyName}</p>
                    </div>
                    {getStatusBadge(ad.status, ad.rejectionReason)}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {ad.content}
                  </p>

                  {/* Rejection Reason Alert */}
                  {ad.status === 'rejected' && ad.rejectionReason && (
                    <div className="p-2.5 bg-rose-950/30 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                      <strong>Rejection Reason:</strong> {ad.rejectionReason}
                    </div>
                  )}

                  {/* Performance stats per ad */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      {ad.viewsCount || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                      {ad.clicksCount || 0} clicks
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  
                  {/* Status specific actions */}
                  {ad.status === 'approved' && (
                    <button
                      onClick={() => handleSimulatePayment(ad)}
                      disabled={payingAdId === ad.id}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-blue-500/30 disabled:opacity-50"
                    >
                      {payingAdId === ad.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay ₦{(ad.price || 15000).toLocaleString()} to Activate
                        </>
                      )}
                    </button>
                  )}

                  {ad.status === 'active' && (
                    <button
                      onClick={() => handleToggleStatus(ad)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10"
                    >
                      <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Campaign
                    </button>
                  )}

                  {ad.status === 'paused' && (
                    <button
                      onClick={() => handleToggleStatus(ad)}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" /> Resume Campaign
                    </button>
                  )}

                  {ad.targetUrl && (
                    <a 
                      href={ad.targetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-auto"
                      title="Visit destination link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 neo-card rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <Megaphone className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No campaigns created yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Promote your brand, products, or job openings to thousands of active users.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <Plus className="w-4 h-4" /> Create Your First Advert
            </button>
          </div>
        )}
      </div>

      {/* Create Ad Modal */}
      <CreateAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

    </div>
  );
}
