import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Star, Download, Briefcase, Clock, DollarSign, Shield, FileText, Send, HelpCircle, Video, Plus, Play, Trophy, Zap, Award } from 'lucide-react';
import type { InternshipItem, Feedback, QuizItem, VideoLessonItem, VideoProgressSummary } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QuizModal } from '../components/QuizModal';
import { CreateQuizModal } from '../components/CreateQuizModal';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { AddVideoModal } from '../components/AddVideoModal';
import { ResumeMatcherModal } from '../components/ResumeMatcherModal';
import { PDFReportModal } from '../components/PDFReportModal';

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

  // Active Sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'videos' | 'feedback'>('overview');

  // Quizzes State
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);

  // Videos State
  const [videoSummary, setVideoSummary] = useState<VideoProgressSummary>({ lessons: [], summary: { completedCount: 0, totalCount: 0, overallProgress: 0 } });
  const [activeVideoLesson, setActiveVideoLesson] = useState<VideoLessonItem | null>(null);
  const [addVideoOpen, setAddVideoOpen] = useState(false);

  // Resume Matcher & Academic PDF Modals
  const [resumeMatcherOpen, setResumeMatcherOpen] = useState(false);
  const [pdfReportOpen, setPdfReportOpen] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportHours, setReportHours] = useState('8');
  const [submittingReport, setSubmittingReport] = useState(false);

  const isMentorOrAdmin = user && (
    user.role === 'institution_admin' || 
    user.role === 'company_mentor' || 
    user.role === 'admin' || 
    user.role === 'coordinator'
  );

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [eventData, fbData, quizData, vidData] = await Promise.all([
        api.getInternshipById(eventId),
        api.getFeedback(eventId).catch(() => ({ avgRating: 0, totalCount: 0, feedbacks: [] })),
        api.getQuizzes(eventId).catch(() => []),
        api.getVideosForInternship(eventId).catch(() => ({ lessons: [], summary: { completedCount: 0, totalCount: 0, overallProgress: 0 } }))
      ]);

      setEvent(eventData);
      setFeedbackData(fbData);
      setQuizzes(quizData);
      setVideoSummary(vidData);

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

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Overview & Roadmap
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Skill Assessments & Quizzes ({quizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" /> Video Lessons ({videoSummary.summary?.totalCount || 0})
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" /> Mentor Feedback ({feedbackData.totalCount})
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Dynamic Tab Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB 1: OVERVIEW & ROADMAP */}
          {activeTab === 'overview' && (
            <>
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
            </>
          )}

          {/* TAB 2: SKILL ASSESSMENTS & QUIZZES */}
          {activeTab === 'quizzes' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Skill Checkpoint Quizzes</h2>
                  <p className="text-xs text-slate-500 font-medium">Test your domain expertise and earn XP towards level badges</p>
                </div>

                {isMentorOrAdmin && (
                  <button
                    onClick={() => setCreateQuizOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Quiz
                  </button>
                )}
              </div>

              {quizzes.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-3">
                  <HelpCircle className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No quizzes published yet</p>
                  <p className="text-xs text-slate-500">Mentors will upload assessment checkpoints here as the internship progresses.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-500/50 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {quiz.moduleName || 'Checkpoint'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {quiz.durationMinutes} Mins
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{quiz.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{quiz.description}</p>
                        
                        <div className="flex items-center gap-3 pt-1 text-xs font-semibold">
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-amber-500" /> +{quiz.xpReward || 100} XP
                          </span>
                          <span className="text-slate-500">• Passing Score: {quiz.passingScore || 70}%</span>
                          <span className="text-slate-500">• {quiz.questions?.length || 0} Questions</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!user) {
                            onOpenAuthModal();
                          } else {
                            setActiveQuiz(quiz);
                          }
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Play className="w-4 h-4 fill-white" /> Take Quiz
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VIDEO LESSONS */}
          {activeTab === 'videos' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Video Lessons & Tutorials</h2>
                  <p className="text-xs text-slate-500 font-medium">Watch training modules, setup guides, and project walkthroughs</p>
                </div>

                {isMentorOrAdmin && (
                  <button
                    onClick={() => setAddVideoOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Video
                  </button>
                )}
              </div>

              {/* Progress Summary Bar */}
              {videoSummary.summary.totalCount > 0 && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300">Playlist Watch Progress</span>
                    <p className="text-sm font-extrabold text-purple-950 dark:text-purple-100">
                      {videoSummary.summary.completedCount} of {videoSummary.summary.totalCount} Videos Watched ({videoSummary.summary.overallProgress}%)
                    </p>
                  </div>
                  <div className="w-32 bg-purple-200 dark:bg-purple-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full transition-all" style={{ width: `${videoSummary.summary.overallProgress}%` }}></div>
                  </div>
                </div>
              )}

              {videoSummary.lessons.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-3">
                  <Video className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No video lessons uploaded yet</p>
                  <p className="text-xs text-slate-500">Video tutorials will be posted by company mentors during orientation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {videoSummary.lessons.map((lesson) => {
                    const isDone = lesson.userProgress?.isCompleted;

                    return (
                      <div
                        key={lesson._id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                            <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1 rounded">
                              {lesson.duration || '10:00'}
                            </span>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                {lesson.moduleName || 'Video Lesson'}
                              </span>
                              {isDone && (
                                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3" /> Watched
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{lesson.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1">{lesson.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!user) {
                              onOpenAuthModal();
                            } else {
                              setActiveVideoLesson(lesson);
                            }
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Play className="w-4 h-4 fill-white" /> Watch Tutorial
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MENTOR FEEDBACK & REVIEWS */}
          {activeTab === 'feedback' && (
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
          )}
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
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setResumeMatcherOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> ✨ AI Resume Match & Skill Compatibility
              </button>

              <button
                onClick={() => setPdfReportOpen(true)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <Award className="w-4 h-4 text-amber-400" /> 📄 Academic Performance PDF Audit
              </button>
            </div>

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

      {/* Interactive Modals */}
      <ResumeMatcherModal
        isOpen={resumeMatcherOpen}
        onClose={() => setResumeMatcherOpen(false)}
        internshipId={eventId}
        internshipTitle={event.title}
        companyName={event.company}
        requiredSkills={event.skillsRequired || ['Problem Solving', 'Teamwork']}
      />

      <PDFReportModal
        isOpen={pdfReportOpen}
        onClose={() => setPdfReportOpen(false)}
        customReportData={{
          student: {
            name: user?.name || 'Alex Rivera',
            studentId: user?.studentId || 'INT-8891',
            email: user?.email || 'alex.rivera@digicampus.edu',
            department: user?.department || 'Computer Science & AI',
            role: user?.position || 'Intern Trainee',
          },
          internship: {
            title: event.title,
            company: event.company,
            domain: event.domain,
            duration: event.duration || '3 Months',
            workType: event.workType || 'Remote',
          }
        }}
      />

      {/* Interactive Modals */}
      <QuizModal
        quiz={activeQuiz}
        isOpen={Boolean(activeQuiz)}
        onClose={() => setActiveQuiz(null)}
        onQuizCompleted={fetchDetails}
      />

      <CreateQuizModal
        internshipId={eventId}
        isOpen={createQuizOpen}
        onClose={() => setCreateQuizOpen(false)}
        onQuizCreated={fetchDetails}
      />

      <VideoPlayerModal
        isOpen={Boolean(activeVideoLesson)}
        onClose={() => setActiveVideoLesson(null)}
        lessons={videoSummary.lessons}
        currentLesson={activeVideoLesson}
        onLessonChange={(lesson) => setActiveVideoLesson(lesson)}
        onVideoCompleted={fetchDetails}
      />

      <AddVideoModal
        internshipId={eventId}
        isOpen={addVideoOpen}
        onClose={() => setAddVideoOpen(false)}
        onVideoAdded={fetchDetails}
      />

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
