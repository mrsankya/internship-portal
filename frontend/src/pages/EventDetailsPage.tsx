import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Star, Download, Briefcase, Clock, DollarSign, Shield, FileText, Send, QrCode } from 'lucide-react';
import type { InternshipItem, Feedback } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
  onOpenAuthModal: () => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ eventId, onBack, onOpenAuthModal }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<InternshipItem | null>(null);
  const [feedbackData, setFeedbackData] = useState<{ avgRating: number; totalCount: number; feedbacks: Feedback[] }>({ avgRating: 0, totalCount: 0, feedbacks: [] });
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportHours, setReportHours] = useState('8');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [eventData, fbData] = await Promise.all([
        api.getInternshipById(eventId),
        api.getFeedback(eventId).catch(() => ({ avgRating: 0, totalCount: 0, feedbacks: [] }))
      ]);

      setEvent(eventData);
      setFeedbackData(fbData);

      if (user) {
        const myRegs = await api.getMyRegistrations();
        const found = myRegs.some(r => (r.internshipId?._id || r.eventId?._id || r.internshipId || r.eventId) === eventId);
        setIsRegistered(found);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [eventId, user]);

  const handleApply = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    try {
      setRegistering(true);
      setError('');
      await api.applyForInternship(eventId);
      setIsRegistered(true);
      alert('🎉 Internship Application Submitted! Your task check-in verification QR code has been generated in your Intern Dashboard.');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Application submission failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingReport(true);
      await api.submitProgressReport(eventId, reportTitle, reportDescription, Number(reportHours));
      alert('✅ Weekly Progress Report submitted successfully for mentor review!');
      setReportModalOpen(false);
      setReportTitle('');
      setReportDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500 font-bold">Loading internship details...</div>;
  }

  if (!event) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-rose-600">Internship position not found</p>
        <button onClick={onBack} className="text-xs font-bold text-blue-600 hover:underline">← Back to Internships</button>
      </div>
    );
  }

  const isFull = (event.appliedCount || event.registeredCount || 0) >= (event.totalPositions || event.capacity || 10);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Internships
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={event.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
              alt={event.company}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 bg-white p-1.5 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 uppercase tracking-wider">
                  {event.domain}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300">
                  {event.workType || 'Remote'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight font-heading">
                {event.title}
              </h1>
              <p className="text-sm font-bold text-slate-300 mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> {event.company}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
            <span className="text-xs font-bold text-slate-300 uppercase">Monthly Stipend</span>
            <span className="text-2xl font-black text-emerald-400">{event.stipend || 'Stipend Provided'}</span>
            <span className="text-xs text-slate-400 font-medium">Duration: {event.duration || '3 Months'}</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description, Milestones & Feedback */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Role Overview & Responsibilities</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
              {event.description}
            </p>

            {event.skillsRequired && event.skillsRequired.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Required Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {event.skillsRequired.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      ⚡ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Milestones Roadmap */}
          {event.milestones && event.milestones.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Internship Roadmap & Milestones</h2>
              <div className="space-y-4 relative border-l-2 border-blue-200 dark:border-blue-900 ml-3 pl-6">
                {event.milestones.map((m, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">Week {m.week || idx + 1}</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{m.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{m.description}</p>
                    {m.deliverable && (
                      <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Deliverable: {m.deliverable}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentors List */}
          {event.mentors && event.mentors.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Assigned Company Mentors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.mentors.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-xl object-cover border border-blue-500" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{m.name}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{m.role}</p>
                      <p className="text-[11px] text-slate-500">{m.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentor Feedback & Reviews */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Mentor Evaluations & Feedback</h2>
                <p className="text-xs text-slate-500 font-bold">{feedbackData.totalCount} Verified Reviews</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-amber-900 dark:text-amber-200">{feedbackData.avgRating || '5.0'}</span>
              </div>
            </div>

            <div className="space-y-3">
              {feedbackData.feedbacks.length > 0 ? (
                feedbackData.feedbacks.map((fb) => (
                  <div key={fb._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{fb.userName}</span>
                      <div className="flex text-amber-500 text-xs">
                        {'★'.repeat(fb.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{fb.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No feedback entries recorded yet for this batch.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Application Info Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 sticky top-24">
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Location</span>
                  <span>{event.location || 'Remote / Online'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Duration</span>
                  <span>{event.duration || '3 Months'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Positions Available</span>
                  <span>{event.appliedCount || event.registeredCount || 0} / {event.totalPositions || event.capacity || 10} Filled</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-medium border border-rose-300">
                {error}
              </div>
            )}

            {/* Application & Submit Progress Action Buttons */}
            {isRegistered ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-center font-black text-xs flex items-center justify-center gap-2 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Application Accepted & Active
                </div>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Submit Weekly Progress Report
                </button>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={isFull || registering}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-50"
              >
                {registering ? 'Submitting Application...' : isFull ? 'Positions Filled' : 'Apply & Join Internship'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Progress Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Submit Weekly Progress Report
            </h3>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs font-bold text-slate-900 dark:text-white">
              <div>
                <label className="block mb-1">Report Title / Milestone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week 4 - Microservice API & Database Indexing"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Hours Logged This Week</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="80"
                  value={reportHours}
                  onChange={(e) => setReportHours(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1">Tasks Completed & Proof Link</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your achievements, PR links, and blockers solved..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" /> {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
