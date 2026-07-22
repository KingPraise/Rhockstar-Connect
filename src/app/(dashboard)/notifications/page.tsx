"use client";

import { useState } from "react";
import { Bell, Heart, MessageSquare, Briefcase, UserPlus, Check } from "lucide-react";

export default function NotificationsPage() {
  // Mock data for phase 6
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "match",
      title: "New Match!",
      message: "You matched with Sarah in Dating.",
      time: "2 mins ago",
      read: false,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "David sent you a new message.",
      time: "1 hour ago",
      read: false,
      icon: MessageSquare,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      id: 3,
      type: "connection",
      title: "Connection Request",
      message: "Michael wants to connect with you.",
      time: "3 hours ago",
      read: true,
      icon: UserPlus,
      color: "text-brand-purple",
      bg: "bg-brand-purple/10",
    },
    {
      id: 4,
      type: "job",
      title: "Job Application Update",
      message: "Your application for 'Senior React Developer' was viewed.",
      time: "1 day ago",
      read: true,
      icon: Briefcase,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
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
          onClick={markAllAsRead}
          className="text-sm font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div 
              key={notification.id} 
              onClick={() => markAsRead(notification.id)}
              className={`neo-card p-4 sm:p-6 flex items-start gap-4 transition-all duration-300 cursor-pointer ${
                notification.read 
                  ? "bg-slate-900/40 border-white/5 opacity-70 hover:opacity-100" 
                  : "bg-slate-800/80 border-brand/30 shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:border-brand/60"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notification.bg} ${notification.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-lg truncate ${notification.read ? "text-slate-200" : "text-white"}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">{notification.time}</span>
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
