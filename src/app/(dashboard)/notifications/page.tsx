"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, MessageSquare, Briefcase, UserPlus, Check, ThumbsUp, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Notification, 
  subscribeToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/lib/services/notifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { profile } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsubscribe = subscribeToNotifications(profile.uid, (fetchedNotifs) => {
      setNotifications(fetchedNotifs);
    });
    return () => unsubscribe();
  }, [profile?.uid]);

  const handleMarkAllAsRead = async () => {
    if (!profile?.uid) return;
    await markAllNotificationsAsRead(profile.uid);
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "match": return { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" };
      case "message": return { icon: MessageSquare, color: "text-brand", bg: "bg-brand/10" };
      case "connection": return { icon: UserPlus, color: "text-brand-purple", bg: "bg-brand-purple/10" };
      case "job": return { icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case "like": return { icon: ThumbsUp, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "comment": return { icon: MessageCircle, color: "text-amber-500", bg: "bg-amber-500/10" };
      default: return { icon: Bell, color: "text-slate-400", bg: "bg-slate-800" };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center text-white shadow-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Notifications</h1>
            <p className="text-slate-400 text-sm font-medium">Stay updated with your network.</p>
          </div>
        </div>
        <button 
          onClick={handleMarkAllAsRead}
          className="text-sm font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const { icon: Icon, color, bg } = getIconForType(notification.type);
          
          let timeString = "Just now";
          if (notification.createdAt?.toDate) {
            timeString = formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true });
          }

          return (
            <div 
              key={notification.id} 
              onClick={() => handleMarkAsRead(notification.id)}
              className={`neo-card p-4 sm:p-6 flex items-start gap-4 transition-all duration-300 cursor-pointer ${
                notification.read 
                  ? "bg-slate-900/40 border-white/5 opacity-70 hover:opacity-100" 
                  : "bg-slate-800/80 border-brand/30 shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:border-brand/60"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-lg truncate ${notification.read ? "text-slate-200" : "text-white"}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">{timeString}</span>
                </div>
                <p className={`text-sm ${notification.read ? "text-slate-400" : "text-slate-300 font-medium"}`}>
                  {notification.message}
                </p>
              </div>
              
              {!notification.read && (
                <div className="w-3 h-3 rounded-full bg-brand shrink-0 mt-2 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {notifications.length === 0 && (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">You&apos;re all caught up!</h3>
          <p className="text-slate-400">Check back later for new updates.</p>
        </div>
      )}
    </div>
  );
}
