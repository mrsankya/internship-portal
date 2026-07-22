import React, { useState, useEffect } from 'react';
import { Briefcase, Search, User as UserIcon, Award, LogOut, Sparkles, Shield, Trophy, Sun, Moon, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { LeaderboardModal } from './LeaderboardModal';
import { NotificationModal } from './NotificationModal';
import { api } from '../services/api';

interface NavbarProps {
  currentTab: 'discovery' | 'search' | 'dashboard' | 'admin';
  setCurrentTab: (tab: 'discovery' | 'search' | 'dashboard' | 'admin') => void;
  openCreateModal?: () => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onSearch }) => {
  const { user, logout, openAuthModal, theme, toggleTheme } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      // Ignore background fetch errors
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const isMentorOrAdmin = user && (
    user.role === 'institution_admin' || 
    user.role === 'company_mentor' || 
    user.role === 'admin' || 
    user.role === 'coordinator'
  );

  const formatRoleName = (role?: string) => {
    if (role === 'institution_admin' || role === 'admin') return 'Institution Admin';
    if (role === 'company_mentor' || role === 'coordinator') return 'Company Mentor';
    return 'Intern';
  };


  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab('discovery')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                DiGi Internship
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Portal
              </span>
            </div>
          </div>

          {/* Global Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search internships by domain, skills, company..."
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => {
                if (currentTab !== 'search') setCurrentTab('search');
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('discovery')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'discovery' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Internships</span>
            </button>

            <button
              onClick={() => setCurrentTab('search')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'search' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Explore Domains</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Intern Dashboard</span>
            </button>

            {/* Performance Ranks Button */}
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 border border-amber-300 dark:border-amber-700 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span className="hidden sm:inline">Performance</span>
            </button>

            {/* Admin & Analytics Console Button */}
            {isMentorOrAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 hover:bg-purple-200 border border-purple-300 dark:border-purple-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics & Admin</span>
              </button>
            )}

            {/* Notification Bell Button */}
            {user && (
              <button
                onClick={() => setNotificationOpen(true)}
                title="Notifications"
                className="relative p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Sun / Moon Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-800 fill-slate-800" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </button>

            {/* User Profile / Auth Area */}
            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <div 
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover border-2 border-blue-600 shadow-sm"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <span className="block text-xs font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-1">{user.name}</span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">{formatRoleName(user.role)}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="ml-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* Campus Leaderboard XP Modal */}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      {/* In-App Notifications Modal */}
      <NotificationModal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onNotificationsUpdated={fetchUnreadCount}
      />
    </>
  );
};

