"use client";

import { useEffect, useState } from "react";
import { 
  Advertisement, 
  subscribeToAllAds, 
  approveAdvertisement, 
  rejectAdvertisement, 
  updateAdStatus 
} from "@/lib/services/ads";
import { 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  Loader2, 
  Play, 
  Pause, 
  ExternalLink,
  ShieldAlert,
  Search
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'approved' | 'all'>('pending');
  const [rejectionModalAd, setRejectionModalAd] = useState<Advertisement | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time listener for SuperAdmin
  useEffect(() => {
    const unsubscribe = subscribeToAllAds((fetchedAds) => {
      setAds(fetchedAds);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (ad: Advertisement) => {
    try {
      setProcessingId(ad.id);
      const res = await approveAdvertisement(ad.id, 15000);
      if (res.success) {
        toast.success(`Advert "${ad.title}" approved! Advertiser notified to pay.`);
      } else {
        toast.error("Failed to approve advert");
      }
    } catch (err) {
      toast.error("An error occurred approving advert");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalAd) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingId(rejectionModalAd.id);
      const res = await rejectAdvertisement(rejectionModalAd.id, rejectionReason.trim());
      if (res.success) {
        toast.success(`Advert "${rejectionModalAd.title}" rejected (No payment taken)`);
        setRejectionModalAd(null);
        setRejectionReason("");
      } else {
        toast.error("Failed to reject advert");
      }
    } catch (err) {
      toast.error("An error occurred rejecting advert");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (ad: Advertisement, newStatus: 'active' | 'paused' | 'expired') => {
    try {
      setProcessingId(ad.id);
      const res = await updateAdStatus(ad.id, newStatus);
      if (res.success) {
        toast.success(`Advert status updated to ${newStatus.toUpperCase()}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Status update error");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered ads list
  const filteredAds = ads.filter((ad) => {
    if (activeTab !== 'all' && ad.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ad.title.toLowerCase().includes(q) ||
        ad.companyName.toLowerCase().includes(q) ||
        ad.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Overview Stats
  const pendingCount = ads.filter(a => a.status === 'pending').length;
  const activeCount = ads.filter(a => a.status === 'active').length;
  const totalViews = ads.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicksCount || 0), 0);
  const totalEstRevenue = ads.filter(a => a.status === 'active' || a.status === 'expired').length * 15000;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
      
      {/* Header */}
      <div className="neo-card p-6 rounded-3xl bg-slate-900/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 flex items-center justify-center border border-rose-500/30 text-rose-400 shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Ad Management & Review</h1>
            <p className="text-slate-400 text-sm">Approve, reject, pause, or remove sponsored advertiser campaigns.</p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{pendingCount} Advert(s) Awaiting Review</span>
          </div>
        )}
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Pending Review</span>
            <span className="text-2xl font-extrabold text-white">{pendingCount}</span>
          </div>
        </div>

        <div className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Live Active Ads</span>
            <span className="text-2xl font-extrabold text-emerald-400">{activeCount}</span>
          </div>
        </div>

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
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Ad Revenue</span>
            <span className="text-2xl font-extrabold text-blue-400">₦{totalEstRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/10 overflow-x-auto w-full sm:w-auto">
          {[
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'active', label: `Live (${activeCount})` },
            { key: 'approved', label: 'Awaiting Payment' },
            { key: 'all', label: `All Ads (${ads.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full neo-input py-2 pl-9 text-xs text-white"
          />
        </div>

      </div>

      {/* Ads Review Table Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="neo-card p-5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-4 flex flex-col justify-between shadow-xl">
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{ad.title}</h3>
                    <p className="text-xs text-purple-300 font-semibold">{ad.companyName}</p>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    ad.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    ad.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    ad.status === 'approved' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    ad.status === 'paused' ? 'bg-slate-800 text-slate-400 border border-white/10' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {ad.status.toUpperCase()}
                  </span>
                </div>

                {/* Content Body */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {ad.content}
                </p>

                {/* Media Preview Thumbnail */}
                {ad.mediaUrl && (
                  <div className="rounded-xl overflow-hidden max-h-40 border border-white/10 bg-black/40">
                    {ad.mediaType === 'video' ? (
                      <video src={ad.mediaUrl} controls className="max-h-40 w-full object-cover" />
                    ) : (
                      <img src={ad.mediaUrl} alt={ad.title} className="max-h-40 w-full object-cover" />
                    )}
                  </div>
                )}

                {/* Metrics & Target Link */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      {ad.viewsCount || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                      {ad.clicksCount || 0} clicks
                    </span>
                  </div>

                  {ad.targetUrl && (
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>

              {/* Action Buttons for SuperAdmin */}
              <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                
                {ad.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(ad)}
                      disabled={processingId === ad.id}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {processingId === ad.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Advert
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setRejectionModalAd(ad)}
                      disabled={processingId === ad.id}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-rose-500/30 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}

                {ad.status === 'active' && (
                  <button
                    onClick={() => handleToggleStatus(ad, 'paused')}
                    disabled={processingId === ad.id}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-white/10"
                  >
                    <Pause className="w-4 h-4 text-amber-400" /> Pause
                  </button>
                )}

                {ad.status === 'paused' && (
                  <button
                    onClick={() => handleToggleStatus(ad, 'active')}
                    disabled={processingId === ad.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30"
                  >
                    <Play className="w-4 h-4 text-emerald-400" /> Resume Live
                  </button>
                )}

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 neo-card rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
          <Megaphone className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No advertisements found</h3>
          <p className="text-xs text-slate-400">There are no campaigns matching the selected status filter.</p>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-white text-lg">Reject Advertisement</h3>
            </div>

            <p className="text-xs text-slate-300">
              Please specify the reason for rejecting <strong>"{rejectionModalAd.title}"</strong>. The company will be notified. No payment will be charged.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Inappropriate content or low resolution media..."
              className="w-full neo-input py-2 text-xs text-white resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => { setRejectionModalAd(null); setRejectionReason(""); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={processingId !== null}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {processingId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
