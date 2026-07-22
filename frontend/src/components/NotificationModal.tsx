import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X, Info, Award, HelpCircle, Video, CheckCircle2, AlertCircle, Megaphone, FileText, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import type { NotificationItem } from '../services/api';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsUpdated?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onNotificationsUpdated }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleClearRead = async () => {
    try {
      await api.clearNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <HelpCircle className="w-5 h-5 text-indigo-600" />;
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      case 'application': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'certificate': return <Award className="w-5 h-5 text-amber-500" />;
      case 'announcement': return <Megaphone className="w-5 h-5 text-emerald-600" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] mt-12 sm:mt-14">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">Real-time updates & activity logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${filter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${filter === 'unread' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center space-x-1 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark read</span>
            </button>
            <button
              onClick={handleClearRead}
              title="Clear read"
              className="p-1.5 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-xs font-medium">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-700 text-sm">No notifications found</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up with your internship alerts.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n._id}
                onClick={() => {
                  if (!n.isRead) handleMarkAsRead(n._id);
                  if (n.link) {
                    if (n.link.startsWith('http')) {
                      window.open(n.link, '_blank');
                    } else {
                      window.location.hash = n.link;
                    }
                    onClose();
                  }
                }}
                className={`p-4 transition-all flex items-start space-x-3 cursor-pointer ${
                  n.isRead ? 'bg-white hover:bg-slate-50/80 opacity-80' : 'bg-blue-50/40 hover:bg-blue-50/70 font-medium'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${n.isRead ? 'bg-slate-100' : 'bg-white shadow-xs'}`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs sm:text-sm font-semibold truncate ${n.isRead ? 'text-slate-800' : 'text-blue-950'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  {n.link && (
                    <div className="mt-2 flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                  )}
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(n._id, e)}
                    title="Mark read"
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors shrink-0"
                  >
                    <span className="w-2 h-2 bg-blue-600 rounded-full block"></span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 text-center bg-slate-50 text-xs text-slate-500">
          Integrated with <span className="font-semibold text-blue-600">Resend Email Alerts</span>
        </div>
      </div>
    </div>
  );
};
