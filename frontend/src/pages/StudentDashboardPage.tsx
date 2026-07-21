import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, QrCode, Trash2, Building, Award, Star, X, Edit2, Briefcase, Clock, FileText, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import type { Registration } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TicketModal } from '../components/TicketModal';
import { CertificateModal } from '../components/CertificateModal';
import { ProfileModal } from '../components/ProfileModal';

interface StudentDashboardPageProps {
  onSelectEvent: (event: any) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ onSelectEvent }) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Registration | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Feedback State
  const [feedbackEventId, setFeedbackEventId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to withdraw your internship application?')) return;
    try {
      await api.cancelRegistration(id);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEventId || !comment) return;
    try {
      await api.submitFeedback(feedbackEventId, rating, comment);
      alert('Thank you! Your feedback has been submitted to your mentor.');
      setFeedbackEventId(null);
      setComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intern Profile Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setProfileModalOpen(true)}
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-slate-950 uppercase tracking-wider">
                {user.role === 'company_mentor' ? 'Company Mentor' : user.role === 'institution_admin' ? 'Institution Admin' : 'Verified Intern'}
              </span>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Edit Profile Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/80 flex items-center gap-2 font-bold">
              <Building className="w-3.5 h-3.5" /> {user.department} • ID: {user.studentId}
            </p>

            {/* Badges Display */}
            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {user.badges.map((b, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white/20 border border-white/30 text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-amber-300" /> {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
          <div className="text-center px-4">
            <span className="text-2xl font-black text-white">{registrations.length}</span>
            <p className="text-[11px] text-white/80 font-bold">Enrolled Internships</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-4">
            <span className="text-2xl font-black text-amber-300">{user.xpPoints || 250} XP</span>
            <p className="text-[11px] text-white/80 font-bold">Level {user.level || 1} Score</p>
          </div>
        </div>
      </div>

      {/* Internships & Applications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Active Internships & Performance Tracking</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Track completion progress, log hours, show QR check-in, and download verified certificates</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-bold">Loading internship records...</div>
        ) : registrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => {
              const event = reg.internshipId || reg.eventId;
              if (!event) return null;

              const progressPct = reg.progress || 35;

              return (
                <div
                  key={reg._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={event.companyLogo || event.image}
                      alt={event.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-900 p-1"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                          {event.domain || 'Tech'}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {reg.hoursLogged || 0} Hours Logged
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectEvent(event)}
                        className="text-base font-black text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer truncate font-heading"
                      >
                        {event.title}
                      </h3>
                      
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Company: {event.company} • Verification Code: <strong className="text-blue-600 font-mono">{reg.ticketCode}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                      <span>Completion Progress</span>
                      <span className="text-blue-600 dark:text-blue-400">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCertificate(reg)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1 shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </button>

                      <button
                        onClick={() => setSelectedTicket(reg)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" /> QR Verification Code
                      </button>
                    </div>

                    <button
                      onClick={() => handleCancel(reg._id)}
                      title="Withdraw Application"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No Active Internship Positions</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              You have not applied for any internship programs yet. Explore open roles and submit your application!
            </p>
          </div>
        )}
      </div>

      {/* Verification Ticket / QR Modal */}
      <TicketModal
        registration={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      {/* Completion Certificate Modal */}
      <CertificateModal
        registration={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};
