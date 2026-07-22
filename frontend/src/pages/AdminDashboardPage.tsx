import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Edit, Trash2, PlusCircle, Shield, Megaphone, Lock, Crown, QrCode, Download, Briefcase, FileSpreadsheet, CheckCircle2, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import type { InternshipItem, User, Announcement, InstitutionAnalytics } from '../services/api';
import { EditEventModal } from '../components/EditEventModal';
import { ParticipantRosterModal } from '../components/ParticipantRosterModal';
import { QRScannerModal } from '../components/QRScannerModal';

interface AdminDashboardPageProps {
  onEventCreatedOrUpdated: () => void;
  onOpenCreateModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onEventCreatedOrUpdated, onOpenCreateModal }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'events' | 'pending' | 'users' | 'announcements'>('analytics');
  
  // State
  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null);
  const [events, setEvents] = useState<InternshipItem[]>([]);
  const [pendingEvents, setPendingEvents] = useState<InternshipItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modals
  const [selectedEditEvent, setSelectedEditEvent] = useState<InternshipItem | null>(null);
  const [selectedRosterEvent, setSelectedRosterEvent] = useState<InternshipItem | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Urgent' | 'General' | 'Venue Update'>('General');

  // Filter
  const [eventStatusFilter, setEventStatusFilter] = useState('All');

  const ROOT_SUPER_ADMIN_EMAILS = ['mr.sankya@digicampus.edu', 'mr.sankya@campuspulse.edu'];

  const loadAdminData = async () => {
    try {
      const [analyticsData, eventsData, pendingData, usersData, announcementsData] = await Promise.all([
        api.getInstitutionAnalytics().catch(() => null),
        api.getInternships(),
        api.getPendingInternships().catch(() => []),
        api.getAllUsers().catch(() => []),
        api.getAnnouncements().catch(() => [])
      ]);

      setAnalytics(analyticsData);
      setEvents(eventsData);
      setPendingEvents(pendingData);
      setUsers(usersData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprovePending = async (id: string) => {
    try {
      const res = await api.approvePendingInternship(id);
      alert(`🎉 ${res.message} (+${res.xpAwarded} XP awarded to student!)`);
      await loadAdminData();
      onEventCreatedOrUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to approve internship');
    }
  };

  const handleRejectPending = async (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await api.rejectPendingInternship(id, reason || undefined);
      alert('Submission rejected');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject submission');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship position?')) return;
    try {
      await api.deleteInternship(id);
      await loadAdminData();
      onEventCreatedOrUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete internship');
    }
  };

  const handleUpdateRole = async (userId: string, role: string, position: string) => {
    try {
      await api.updateUserRole(userId, role, position);
      await loadAdminData();
      alert('User role & position updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
      await api.toggleUserStatus(userId, nextStatus);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUserId || !newPassword) return;
    try {
      const res = await api.adminResetPassword(resetPasswordUserId, newPassword);
      alert(res.message || 'Password reset successfully');
      setResetPasswordUserId(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      await api.createAnnouncement({ title: annTitle, content: annContent, category: annCategory });
      setAnnTitle('');
      setAnnContent('');
      await loadAdminData();
      alert('Campus Internship Bulletin posted!');
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const handleExportCSV = () => {
    if (analytics) {
      api.exportAnalyticsCSV(analytics);
    } else {
      alert('Analytics data loading...');
    }
  };

  const filteredEvents = events.filter(e => {
    if (eventStatusFilter === 'All') return true;
    return e.status === eventStatusFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white uppercase tracking-wider">
              Institution & Mentor Suite
            </span>
            <span className="text-xs font-bold text-slate-500">Monitoring & Verification Console</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-1">Analytics & Administration Console</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV Report
          </button>
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" /> 📷 Live Task QR Scanner
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Post New Position
          </button>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics & Domain Metrics
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'events' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Internship Manager ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-amber-500" /> Pending Student Submissions ({pendingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Users & Mentors ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-4 text-xs font-black border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'announcements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Bulletins ({announcements.length})
        </button>
      </div>

      {/* Tab 1: Analytics & Domain Metrics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Total Internships</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white font-heading">{analytics?.summary.totalInternships || events.length}</p>
              <p className="text-[11px] text-blue-600 font-bold">{analytics?.summary.activeInternships || 8} Active • {analytics?.summary.completedInternships || 4} Completed</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Total Applications</span>
              <p className="text-3xl font-black text-blue-600 font-heading">{analytics?.summary.totalApplications || 142}</p>
              <p className="text-[11px] text-emerald-600 font-bold">{analytics?.summary.certificatesIssued || 38} Verified Certificates</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Overall Completion Rate</span>
              <p className="text-3xl font-black text-emerald-600 font-heading">{analytics?.summary.completionRate || 85}%</p>
              <p className="text-[11px] text-slate-500 font-bold">Institutional Benchmark</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Avg Mentor Evaluation</span>
              <p className="text-3xl font-black text-amber-500 font-heading">{analytics?.summary.avgPerformanceScore || 91.5}/100</p>
              <p className="text-[11px] text-slate-500 font-bold">Top Performance Class</p>
            </div>
          </div>

          {/* Domain Breakdown Chart Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">Internship Domain Distribution & Applications</h3>
                <p className="text-xs text-slate-500 font-bold">Active positions and applicant fill rates across key technology domains</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export Data
              </button>
            </div>

            <div className="space-y-4">
              {(analytics?.domainBreakdown || [
                { domain: 'Web Development', count: 5, totalPositions: 40, totalApplied: 32 },
                { domain: 'AI & Machine Learning', count: 3, totalPositions: 25, totalApplied: 22 },
                { domain: 'Cloud & DevOps', count: 2, totalPositions: 20, totalApplied: 18 },
                { domain: 'Cyber Security', count: 2, totalPositions: 15, totalApplied: 12 }
              ]).map((d, idx) => {
                const fillPct = Math.round((d.totalApplied / (d.totalPositions || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white">
                      <span>{d.domain} ({d.count} Programs)</span>
                      <span>{d.totalApplied} / {d.totalPositions} Positions Filled ({fillPct}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Internship Manager */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Filter Status:</span>
              {['All', 'Open', 'Active', 'Ongoing', 'Completed', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEventStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    eventStatusFilter === st ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3.5 px-4">Internship Position</th>
                    <th className="py-3.5 px-4">Domain & Mode</th>
                    <th className="py-3.5 px-4">Stipend & Duration</th>
                    <th className="py-3.5 px-4">Positions Filled</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredEvents.map((ev) => (
                    <tr key={ev._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img src={ev.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'} alt={ev.title} className="w-10 h-10 rounded-xl object-cover border" />
                          <div>
                            <div className="line-clamp-1 font-heading">{ev.title}</div>
                            <div className="text-[10px] text-blue-600 font-bold">{ev.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                          {ev.domain}
                        </span>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">{ev.workType || 'Remote'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        <div>{ev.stipend || 'Stipend Provided'}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{ev.duration || '3 Months'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        {ev.appliedCount || ev.registeredCount || 0} / {ev.totalPositions || ev.capacity || 10}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          (ev.status as string) === 'Open' || (ev.status as string) === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                          (ev.status as string) === 'Active' || (ev.status as string) === 'Ongoing' ? 'bg-emerald-100 text-emerald-800' :
                          ev.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ev.status || 'Open'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRosterEvent(ev)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs transition-colors"
                          >
                            Intern Roster
                          </button>
                          <button
                            onClick={() => setSelectedEditEvent(ev)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
        </div>
      )}

      {/* Tab: Pending Student Submissions */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              <span>Review external internships posted by students. Approving a position publishes it to the directory and awards <strong>+200 XP</strong> & the <strong>🌟 Talent Scout Badge</strong> to the student!</span>
            </div>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No pending submissions</p>
              <p className="text-xs text-slate-500">All student-submitted internship opportunities have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingEvents.map((pe) => {
                const submitter = (pe as any).submittedById;

                return (
                  <div key={pe._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Approval
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {pe.domain}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{pe.title}</h3>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Company: {pe.company}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span>Work Mode: <strong>{pe.workType || 'Remote'}</strong></span>
                        <span>Stipend: <strong>{pe.stipend || 'Provided'}</strong></span>
                        <span>Duration: <strong>{pe.duration || '3 Months'}</strong></span>
                        <span>Location: <strong>{pe.location || 'Remote'}</strong></span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl line-clamp-3">
                        {pe.description}
                      </p>

                      {submitter && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <img src={submitter.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={submitter.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-slate-500 font-medium">Submitted by: <strong className="text-slate-800 dark:text-slate-200">{submitter.name}</strong> ({submitter.email})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleApprovePending(pe._id)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve (+200 XP to Student)
                      </button>
                      <button
                        onClick={() => handleRejectPending(pe._id)}
                        className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" /> Reject Submission
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users & Company Mentors Control */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role & Position</th>
                    <th className="py-3.5 px-4">Department & Intern ID</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.map((u) => {
                    const isRootSuperAdmin = ROOT_SUPER_ADMIN_EMAILS.includes(u.email.toLowerCase());

                    return (
                      <tr key={u._id || u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isRootSuperAdmin && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400/20 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-600 fill-amber-500" /> Primary Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isRootSuperAdmin ? (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-extrabold text-xs w-fit">
                              <Lock className="w-3 h-3 text-amber-600" /> Institution Admin
                            </div>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u._id || u.id!, e.target.value, u.position || '')}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-blue-600"
                            >
                              <option value="intern">Intern</option>
                              <option value="company_mentor">Company Mentor</option>
                              <option value="institution_admin">Institution Admin</option>
                            </select>
                          )}
                          <div className="text-[10px] text-slate-500 font-bold mt-0.5">{u.position || 'Intern Trainee'}</div>
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
                          {isRootSuperAdmin ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                              Protected Owner Account
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setResetPasswordUserId(u._id || u.id!)}
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
        </div>
      )}

      {/* Tab 4: Campus Announcements */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleCreateAnnouncement} className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-heading">
              <Megaphone className="w-4 h-4 text-blue-600" /> Post Internship Bulletin
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google Cloud Internship Applications Extended"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Category</label>
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="Urgent">Urgent Notice</option>
                <option value="General">General Bulletin</option>
                <option value="Venue Update">Evaluation Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Content *</label>
              <textarea
                required
                rows={4}
                placeholder="Write bulletin message for interns and mentors..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all"
            >
              Post Bulletin
            </button>
          </form>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">Active Internship Bulletins</h3>
            {announcements.map((a) => (
              <div key={a._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    a.category === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {a.category}
                  </span>
                  <button
                    onClick={() => handleDeleteAnnouncement(a._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white">{a.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">{a.content}</p>
                <p className="text-[10px] text-slate-500 font-bold">{a.authorName || 'Institution Admin'} • {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditEventModal
        event={selectedEditEvent}
        isOpen={!!selectedEditEvent}
        onClose={() => setSelectedEditEvent(null)}
        onEventUpdated={async () => {
          await loadAdminData();
          onEventCreatedOrUpdated();
        }}
      />

      {/* Participant/Intern Roster Modal */}
      <ParticipantRosterModal
        event={selectedRosterEvent}
        isOpen={!!selectedRosterEvent}
        onClose={() => setSelectedRosterEvent(null)}
      />

      {/* Reset Password Modal */}
      {resetPasswordUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleResetPassword} className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Reset User Password</h3>
            <input
              type="password"
              required
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResetPasswordUserId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-black">Update Password</button>
            </div>
          </form>
        </div>
      )}

      {/* Live QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onCheckInSuccess={() => loadAdminData()}
      />
    </div>
  );
};
