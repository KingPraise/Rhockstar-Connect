"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Star, 
  Trash2, 
  Loader2, 
  X, 
  CheckCircle2, 
  Calendar,
  Gift
} from "lucide-react";
import Image from "next/image";
import { 
  getAllUsersAdmin, 
  updateUserRole, 
  toggleUserBan, 
  deleteUserAdmin, 
  grantUserSubscription, 
  AdminUser 
} from "@/lib/services/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "admin" | "banned" | "premium">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [grantModalUser, setGrantModalUser] = useState<AdminUser | null>(null);
  const [grantDays, setGrantDays] = useState(30);
  const [grantTier, setGrantTier] = useState<"pro" | "elite" | "free">("pro");

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAllUsersAdmin();
    if (res.success) {
      setUsers(res.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleRoleToggle = async (user: AdminUser) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setActionLoading(user.uid);
    const res = await updateUserRole(user.uid, newRole);
    setActionLoading(null);
    if (res.success) {
      showToast(`Updated ${user.fullName}'s role to ${newRole.toUpperCase()}`);
      loadUsers();
    }
  };

  const handleBanToggle = async (user: AdminUser) => {
    const newBanState = !user.isBanned;
    setActionLoading(user.uid);
    const res = await toggleUserBan(user.uid, newBanState);
    setActionLoading(null);
    if (res.success) {
      showToast(newBanState ? `Account ${user.fullName} banned` : `Account ${user.fullName} unbanned`);
      loadUsers();
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to permanently delete ${user.fullName}? This cannot be undone.`)) return;
    setActionLoading(user.uid);
    const res = await deleteUserAdmin(user.uid);
    setActionLoading(null);
    if (res.success) {
      showToast(`User ${user.fullName} deleted`);
      if (selectedUser?.uid === user.uid) setSelectedUser(null);
      loadUsers();
    }
  };

  const handleGrantSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantModalUser) return;
    setActionLoading(grantModalUser.uid);
    const res = await grantUserSubscription(grantModalUser.uid, grantTier, grantDays);
    setActionLoading(null);
    if (res.success) {
      showToast(`Granted ${grantTier.toUpperCase()} (${grantDays} Days) to ${grantModalUser.fullName}`);
      setGrantModalUser(null);
      loadUsers();
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "admin") return u.role === "admin";
    if (filterTab === "banned") return u.isBanned === true;
    if (filterTab === "premium") return u.subscriptionStatus === "active" && u.subscriptionTier !== "free";

    return true;
  });

  return (
    <div className="space-y-6 pt-12 lg:pt-0 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">User Management</h1>
            <p className="text-sm text-slate-400">Search, manage roles, grant perks, and enforce moderation</p>
          </div>
        </div>
        <div className="text-xs font-bold text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-rose-500/10 self-start sm:self-auto">
          Total Registered: <span className="text-rose-500 font-black text-sm">{users.length}</span>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* CONTROLS BAR: SEARCH & TABS */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-rose-500/10">
        {/* SEARCH INPUT */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: "all", label: "All Users" },
            { id: "admin", label: "Admins" },
            { id: "premium", label: "Premium" },
            { id: "banned", label: "Banned" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === tab.id
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* USER TABLE / GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
          <p className="text-sm text-slate-400">Loading user database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 bg-slate-900/60 border border-white/5 rounded-2xl text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No users found</h3>
          <p className="text-sm text-slate-400">Try refining your search or filter options.</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-rose-500/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-rose-500/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Subscription</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-rose-500/5 transition-colors group">
                    {/* USER INFO */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-500/20 relative border border-rose-500/30 flex-shrink-0">
                          {user.avatar ? (
                            <Image src={user.avatar} alt={user.fullName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-rose-500 text-sm">
                              {user.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">@{user.username} • {user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="py-3.5 px-4">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                          User
                        </span>
                      )}
                    </td>

                    {/* SUBSCRIPTION */}
                    <td className="py-3.5 px-4">
                      {user.subscriptionTier === "pro" || user.subscriptionTier === "elite" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Star className="w-3.5 h-3.5 fill-amber-300" /> {user.subscriptionTier.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Free Tier</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setGrantModalUser(user)}
                          title="Grant Subscription"
                          className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                        >
                          <Gift className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRoleToggle(user)}
                          title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          disabled={actionLoading === user.uid}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBanToggle(user)}
                          title={user.isBanned ? "Unban Account" : "Ban Account"}
                          disabled={actionLoading === user.uid}
                          className={`p-2 rounded-xl transition-colors ${
                            user.isBanned
                              ? "text-emerald-400 hover:bg-emerald-500/10"
                              : "text-amber-400 hover:bg-amber-500/10"
                          }`}
                        >
                          {user.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                          disabled={actionLoading === user.uid}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRANT SUBSCRIPTION MODAL */}
      {grantModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setGrantModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Grant Subscription</h3>
                <p className="text-xs text-slate-400">Update perks for {grantModalUser.fullName}</p>
              </div>
            </div>

            <form onSubmit={handleGrantSubscription} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Tier</label>
                <select
                  value={grantTier}
                  onChange={(e) => setGrantTier(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="pro">Pro Membership</option>
                  <option value="elite">Elite Membership</option>
                  <option value="free">Revoke Perks (Free Tier)</option>
                </select>
              </div>

              {grantTier !== "free" && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={grantDays}
                    onChange={(e) => setGrantDays(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all"
              >
                Apply Perks Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
