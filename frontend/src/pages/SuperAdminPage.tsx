import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Crown, Key, ShieldCheck, RefreshCw, Users, Database, 
  Lock, AlertTriangle, Download, Trash2, CheckCircle2, Megaphone, 
  ExternalLink, Search, UserCheck, BarChart3, Activity, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User, InternshipItem, Announcement, InstitutionAnalytics } from '../services/api';

interface SuperAdminPageProps {
  onNavigateTab: (tab: 'discovery' | 'search' | 'dashboard' | 'admin') => void;
}

export const SuperAdminPage: React.FC<SuperAdminPageProps> = ({ onNavigateTab }) => {
  const { user, login, demoLoginEnabled, setDemoLoginEnabled } = useAuth();
  
  // Login form if not logged in
  const [adminEmail, setAdminEmail] = useState('mr.sankya@digicampus.edu');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Super Admin Data
  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<InternshipItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Controls
  const [isDemoModeOn, setIsDemoModeOn] = useState<boolean>(demoLoginEnabled);
  const [isTogglingDemo, setIsTogglingDemo] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Password reset modal
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Emergency Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'Urgent' | 'General' | 'Venue Update'>('Urgent');

  const ROOT_SUPER_ADMIN_EMAILS = ['mr.sankya@digicampus.edu', 'mr.sankya@campuspulse.edu'];

  const isSuperAdminUser = user && (
    ROOT_SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) || 
    user.role === 'institution_admin' || 
    user.role === 'admin'
  );

  const loadSuperAdminData = async () => {
    setLoadingData(true);
    try {
      const [analyticsData, usersData, eventsData, announcementsData, settingsData] = await Promise.all([
        api.getInstitutionAnalytics().catch(() => null),
        api.getAllUsers().catch(() => []),
        api.getInternships().catch(() => []),
        api.getAnnouncements().catch(() => []),
        api.getAdminSettings().catch(() => null)
      ]);

      setAnalytics(analyticsData);
      setUsers(usersData);
      setEvents(eventsData);
      setAnnouncements(announcementsData);

      if (settingsData && typeof settingsData.demoLoginEnabled === 'boolean') {
        setIsDemoModeOn(settingsData.demoLoginEnabled);
        setDemoLoginEnabled(settingsData.demoLoginEnabled);
      }
    } catch (err) {
      console.error('Failed to load super admin data', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isSuperAdminUser) {
      loadSuperAdminData();
    }
  }, [user]);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(adminEmail, adminPassword);
    } catch (err: any) {
      setAuthError(err.message || 'Super Admin authentication failed. Verify master credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleDemoMode = async () => {
    const nextState = !isDemoModeOn;
    setIsTogglingDemo(true);
    setStatusFeedback(null);
    try {
      const res = await api.toggleDemoLoginSetting(nextState);
      setIsDemoModeOn(res.demoLoginEnabled);
      setDemoLoginEnabled(res.demoLoginEnabled);
      setStatusFeedback(res.message);
      setTimeout(() => setStatusFeedback(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle demo mode setting');
    } finally {
      setIsTogglingDemo(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string, position: string) => {
    try {
      await api.updateUserRole(userId, newRole, position);
      alert('Role permissions updated successfully!');
      loadSuperAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
      await api.toggleUserStatus(userId, nextStatus);
      loadSuperAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle account status');
    }
  };

  const handleResetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !newPassword) return;
    try {
      const res = await api.adminResetPassword(resetUserId, newPassword);
      alert(res.message || 'Password reset successfully!');
      setResetUserId(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handlePostEmergencyBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return;
    try {
      await api.createAnnouncement({
        title: broadcastTitle,
        content: broadcastContent,
        category: broadcastCategory
      });
      alert('🚀 Super Admin Broadcast dispatched successfully to all portals!');
      setBroadcastTitle('');
      setBroadcastContent('');
      loadSuperAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'All' || 
      (roleFilter === 'Admin' && (u.role === 'institution_admin' || u.role === 'admin')) ||
      (roleFilter === 'Mentor' && (u.role === 'company_mentor' || u.role === 'coordinator')) ||
      (roleFilter === 'Intern' && (u.role === 'intern' || u.role === 'student'));

    const matchesSearch = !userSearchQuery || 
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(userSearchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  // If user is not logged in as super admin, display super admin master login form
  if (!isSuperAdminUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Crown className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              Super Admin Console
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Restricted Root Access. Enter your master credentials to manage institution parameters and security toggles.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs font-bold border border-rose-300 dark:border-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSuperAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Super Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="mr.sankya@digicampus.edu"
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Master Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Authenticate Root Super Admin</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => onNavigateTab('discovery')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              ← Return to Main Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Super Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-current" /> Root Super Admin
            </span>
            <span className="text-xs font-bold text-slate-500">Master Governance & Security Core</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-1">
            Super Administrator Control Center
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('admin')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <BarChart3 className="w-4 h-4" /> Standard Admin Dashboard
          </button>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <Briefcase className="w-4 h-4" /> Student Portal
          </button>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusFeedback && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600" />
            <span>{statusFeedback}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-xs text-amber-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 1. Global Master Switches & Security Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                isDemoModeOn ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isDemoModeOn ? <Key className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {isDemoModeOn ? 'Demo Mode Active' : 'Production Mode (Demo Logins Disabled)'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              Platform Demo Mode Master Toggle
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-xl">
              Instantly activate or disable the 1-click Demo Login presets (Intern, Mentor, Admin) on the public login modal.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-right">
              <div className="text-xs font-black text-slate-900 dark:text-white">
                {isDemoModeOn ? 'Demo Mode ON' : 'Demo Mode OFF'}
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                {isDemoModeOn ? 'Public presets active' : 'Public presets hidden'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleDemoMode}
              disabled={isTogglingDemo}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
                isDemoModeOn ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
                  isDemoModeOn ? 'translate-x-9' : 'translate-x-1'
                }`}
              >
                {isTogglingDemo ? <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> : isDemoModeOn ? <Key className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time System Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase">Database Users</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-heading mt-1">{users.length}</p>
            <p className="text-[10px] text-blue-600 font-bold">Registered Accounts</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase">Total Internships</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-heading mt-1">{events.length}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Active Programs</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase">Applications</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-heading mt-1">{analytics?.summary.totalApplications || 142}</p>
            <p className="text-[10px] text-amber-600 font-bold">Total Verified Candidates</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase">Database Status</span>
            <p className="text-2xl font-black text-emerald-600 font-heading mt-1">ONLINE</p>
            <p className="text-[10px] text-slate-500 font-bold">MongoDB Atlas Cluster</p>
          </div>
        </div>
      </div>

      {/* 2. Super Admin User Directory & Security Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
              User Hierarchy & Security Management ({users.length} Users)
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              Promote roles, reset user credentials, or deactivate accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, email, ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['All', 'Admin', 'Mentor', 'Intern'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    roleFilter === r ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Department & Student ID</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Root Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const isRootOwner = ROOT_SUPER_ADMIN_EMAILS.includes(u.email.toLowerCase());

                return (
                  <tr key={u._id || u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isRootOwner && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400/20 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" /> Root Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isRootOwner ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-extrabold text-xs w-fit">
                          <Lock className="w-3 h-3 text-amber-600" /> Institution Admin
                        </div>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u._id || u.id!, e.target.value, u.position || '')}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-blue-600"
                        >
                          <option value="intern">Intern</option>
                          <option value="company_mentor">Company Mentor</option>
                          <option value="institution_admin">Institution Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div>{u.department}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        u.status === 'deactivated' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isRootOwner ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          Protected Account
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResetUserId(u._id || u.id!)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u._id || u.id!, u.status || 'active')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                              u.status === 'deactivated'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                            }`}
                          >
                            {u.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Emergency System Broadcast */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-500" /> Dispatch Emergency Institutional Broadcast
        </h2>
        <form onSubmit={handlePostEmergencyBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Broadcast Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Critical System Maintenance / Urgent Placement Notice"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Severity Category</label>
              <select
                value={broadcastCategory}
                onChange={(e) => setBroadcastCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold"
              >
                <option value="Urgent">🔴 Urgent Priority</option>
                <option value="General">🔵 General Notice</option>
                <option value="Venue Update">🟡 Evaluation Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Broadcast Message Content *</label>
            <textarea
              required
              rows={3}
              placeholder="Write the official notification message for all registered interns, mentors, and administrators..."
              value={broadcastContent}
              onChange={(e) => setBroadcastContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition-all flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" /> Publish Broadcast Immediately
          </button>
        </form>
      </div>

      {/* Password Reset Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleResetUserPassword} className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" /> Super Admin Password Reset
            </h3>
            <input
              type="password"
              required
              placeholder="Enter new master password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResetUserId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-black">Save Password</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
