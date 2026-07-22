import React, { useMemo } from 'react';
import {
  X,
  Download,
  FileText,
  Award,
  CheckCircle2,
  User,
  Building2,
  Clock,
  BookOpen,
  Video,
  Star,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { generateAcademicPDFReport } from '../utils/pdfReportGenerator';
import type { AcademicReportData, QuizResultReport } from '../utils/pdfReportGenerator';
import type { Registration } from '../services/api';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration?: Registration | null;
  customReportData?: Partial<AcademicReportData> | null;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({
  isOpen,
  onClose,
  registration,
  customReportData,
}) => {
  if (!isOpen) return null;

  // Build complete AcademicReportData from registration object or custom report data
  const reportData: AcademicReportData = useMemo(() => {
    const defaultCode = `REPORT-INT-${Math.floor(100000 + Math.random() * 900000)}`;

    const studentInfo = {
      name: customReportData?.student?.name || registration?.userId?.name || 'Alex Johnson',
      studentId: customReportData?.student?.studentId || registration?.userId?.studentId || 'STU-2026-8891',
      email: customReportData?.student?.email || registration?.userId?.email || 'student@university.edu',
      department: customReportData?.student?.department || registration?.userId?.department || 'Computer Science & Engineering',
      role: customReportData?.student?.role || registration?.userId?.position || 'Software Engineering Intern',
      yearOfStudy: customReportData?.student?.yearOfStudy || registration?.userId?.yearOfStudy || '3rd Year (Semester VI)',
    };

    const internshipInfo = {
      title: customReportData?.internship?.title || registration?.internshipId?.title || registration?.eventId?.title || 'Full-Stack Web Development Internship',
      company: customReportData?.internship?.company || registration?.internshipId?.company || registration?.eventId?.company || 'TechCorp Systems Inc.',
      domain: customReportData?.internship?.domain || registration?.internshipId?.domain || 'Web Development',
      mentorName: customReportData?.internship?.mentorName || 'Dr. Sarah Lin',
      mentorEmail: customReportData?.internship?.mentorEmail || 'sarah.lin@techcorp.io',
      duration: customReportData?.internship?.duration || registration?.internshipId?.duration || '8 Weeks (Summer 2026)',
      workType: customReportData?.internship?.workType || registration?.internshipId?.workType || 'Remote',
    };

    const hours = registration?.hoursLogged ?? customReportData?.progressMetrics?.totalHoursLogged ?? 96;
    const reqHours = customReportData?.progressMetrics?.requiredHours ?? 100;
    const checkInsCount = registration?.checkIns?.length ?? customReportData?.progressMetrics?.checkInsCompleted ?? 12;
    const totalCheckInsReq = customReportData?.progressMetrics?.totalCheckIns ?? 12;
    const attendancePct = customReportData?.progressMetrics?.attendancePercentage ?? 95.0;
    const overallProgPct = registration?.progress ?? customReportData?.progressMetrics?.overallProgressPercentage ?? Math.round((hours / reqHours) * 100);

    const quizList: QuizResultReport[] = customReportData?.quizResults || [
      {
        quizTitle: 'Frontend React Architecture & State Management',
        score: 9,
        maxScore: 10,
        percentage: 90,
        passed: true,
        completedAt: '2026-07-15',
      },
      {
        quizTitle: 'RESTful API Integration & Node.js Backend',
        score: 10,
        maxScore: 10,
        percentage: 100,
        passed: true,
        completedAt: '2026-07-18',
      },
      {
        quizTitle: 'Git Workflow, CI/CD & Deployment Best Practices',
        score: 8,
        maxScore: 10,
        percentage: 80,
        passed: true,
        completedAt: '2026-07-20',
      },
    ];

    const videoProg = customReportData?.videoProgress || {
      videosWatched: 8,
      totalVideos: 8,
      watchPercentage: 100,
    };

    const mentorEval = {
      score: registration?.mentorRating ? registration.mentorRating * 20 : customReportData?.mentorEvaluation?.score ?? 94,
      remarks: registration?.mentorFeedback || customReportData?.mentorEvaluation?.remarks || 'Demonstrated outstanding technical competence, rapid adaptability to system architecture, and exceptional initiative in delivering core features.',
      mentorName: internshipInfo.mentorName,
      evaluatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    return {
      reportCode: customReportData?.reportCode || registration?.certificateId?.replace('CERT-', 'REPORT-') || defaultCode,
      issueDate: customReportData?.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      student: studentInfo,
      internship: internshipInfo,
      progressMetrics: {
        totalHoursLogged: hours,
        requiredHours: reqHours,
        attendancePercentage: attendancePct,
        checkInsCompleted: checkInsCount,
        totalCheckIns: totalCheckInsReq,
        overallProgressPercentage: overallProgPct,
      },
      quizResults: quizList,
      videoProgress: videoProg,
      mentorEvaluation: mentorEval,
    };
  }, [registration, customReportData]);

  const handleDownloadPDF = () => {
    generateAcademicPDFReport(reportData, 'download');
  };

  const handleOpenPDFPreview = () => {
    generateAcademicPDFReport(reportData, 'open');
  };

  const avgQuizScore = Math.round(
    (reportData.quizResults || []).reduce((acc, q) => acc + q.percentage, 0) /
      (reportData.quizResults?.length || 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden relative my-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                  OFFICIAL ACADEMIC AUDIT
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {reportData.reportCode}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Academic & Performance Report Preview
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Report Preview Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 custom-scrollbar">
          {/* Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-emerald-300">
                  Verified Institutional Performance Credential
                </p>
                <p className="text-slate-400">
                  Issued on {reportData.issueDate} • ISO 9001:2026 Accredited Training Audit
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-[10px] tracking-wide uppercase shrink-0">
              ✓ OFFICIALLY VERIFIED
            </span>
          </div>

          {/* Student & Internship Profile Card */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <User className="w-4 h-4" /> 1. Student & Internship Profile Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Student Details */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Student Name:</span>
                  <span className="font-bold text-white">{reportData.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Student ID:</span>
                  <span className="font-bold text-blue-400 font-mono">{reportData.student.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="font-semibold text-slate-200">{reportData.student.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Academic Role:</span>
                  <span className="font-semibold text-slate-300">{reportData.student.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="text-slate-300 truncate max-w-[180px]">{reportData.student.email}</span>
                </div>
              </div>

              {/* Internship Details */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Internship Role:</span>
                  <span className="font-bold text-amber-400">{reportData.internship.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Host Company:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" /> {reportData.internship.company}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Domain & Work Mode:</span>
                  <span className="font-semibold text-slate-200">
                    {reportData.internship.domain} ({reportData.internship.workType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Industry Mentor:</span>
                  <span className="font-semibold text-emerald-400">{reportData.internship.mentorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Duration:</span>
                  <span className="text-slate-300">{reportData.internship.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Metrics Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 2. Progress & Engagement Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Hours Logged */}
              <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 p-4 rounded-2xl border border-blue-500/20 text-center space-y-1">
                <Clock className="w-5 h-5 text-blue-400 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Total Hours</p>
                <p className="text-lg font-black text-white">
                  {reportData.progressMetrics.totalHoursLogged} / {reportData.progressMetrics.requiredHours}
                </p>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block">
                  {Math.min(100, Math.round((reportData.progressMetrics.totalHoursLogged / (reportData.progressMetrics.requiredHours || 100)) * 100))}% Target Met
                </span>
              </div>

              {/* Attendance */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 p-4 rounded-2xl border border-emerald-500/20 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Attendance Rate</p>
                <p className="text-lg font-black text-white">
                  {reportData.progressMetrics.attendancePercentage.toFixed(1)}%
                </p>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                  Verified Attendance
                </span>
              </div>

              {/* Check-ins */}
              <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 p-4 rounded-2xl border border-amber-500/20 text-center space-y-1">
                <FileText className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">QR Check-ins</p>
                <p className="text-lg font-black text-white">
                  {reportData.progressMetrics.checkInsCompleted} / {reportData.progressMetrics.totalCheckIns}
                </p>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">
                  QR Scanned & Verified
                </span>
              </div>

              {/* Overall Progress */}
              <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 p-4 rounded-2xl border border-purple-500/20 text-center space-y-1">
                <Sparkles className="w-5 h-5 text-purple-400 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Overall Progress</p>
                <p className="text-lg font-black text-white">
                  {reportData.progressMetrics.overallProgressPercentage}%
                </p>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block">
                  Milestones Completed
                </span>
              </div>
            </div>
          </div>

          {/* Skill Assessment Quiz Results Table */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 3. Skill Assessment Quiz Results & Scores
              </h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Avg Quiz Score: {avgQuizScore}% (Grade A)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Quiz Module Title</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3 text-right">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-200 font-medium">
                  {(reportData.quizResults || []).map((quiz, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-semibold text-white">{quiz.quizTitle}</td>
                      <td className="p-3 text-slate-300 font-mono">{quiz.score} / {quiz.maxScore}</td>
                      <td className="p-3 font-bold text-amber-400 font-mono">{quiz.percentage}%</td>
                      <td className="p-3 text-right">
                        {quiz.passed ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                            PASSED (+150 XP)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
                            REVISION REQUIRED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Video Tutorials Watch Progress */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Video className="w-4 h-4" /> 4. Curriculum Video Tutorials Watch Progress
            </h3>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left w-full">
                <p className="text-xs font-bold text-white">
                  Video Lectures Watched: {reportData.videoProgress?.videosWatched} of {reportData.videoProgress?.totalVideos} Lessons
                </p>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${reportData.videoProgress?.watchPercentage || 100}%` }}
                  />
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-black whitespace-nowrap shrink-0">
                🎬 {reportData.videoProgress?.watchPercentage}% COMPLETED
              </span>
            </div>
          </div>

          {/* Mentor Evaluation Score & Remarks */}
          <div className="bg-gradient-to-r from-emerald-950/30 via-slate-800/60 to-slate-800/60 rounded-2xl p-5 border border-emerald-500/30 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Star className="w-4 h-4 fill-emerald-400" /> 5. Industry Mentor Evaluation Score & Remarks
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              {/* Score Badge */}
              <div className="bg-emerald-900/50 p-4 rounded-xl border border-emerald-500/40 text-center flex flex-col justify-center min-w-[140px] shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">MENTOR SCORE</p>
                <p className="text-3xl font-black text-white my-1 font-mono">{reportData.mentorEvaluation.score}/100</p>
                <p className="text-xs font-bold text-emerald-400">
                  {reportData.mentorEvaluation.score >= 90 ? 'Grade A+ (Outstanding)' : 'Grade A (Excellent)'}
                </p>
              </div>

              {/* Remarks Box */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                    Qualitative Performance Remarks:
                  </p>
                  <p className="text-xs text-slate-300 italic mt-1 leading-relaxed">
                    "{reportData.mentorEvaluation.remarks}"
                  </p>
                </div>
                <p className="text-xs font-bold text-emerald-400 text-right mt-2">
                  — Evaluated by {reportData.mentorEvaluation.mentorName} (Lead Mentor)
                </p>
              </div>
            </div>
          </div>

          {/* Digital Signature Lines & Seal Preview */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-1">
              <div className="h-8 flex items-end justify-center">
                <span className="font-serif italic font-bold text-blue-400 text-sm">Dr. Sarah Lin</span>
              </div>
              <div className="w-36 h-0.5 bg-slate-700 mx-auto" />
              <p className="font-bold text-white text-[11px]">{reportData.internship.mentorName}</p>
              <p className="text-slate-400 text-[10px]">Industry Mentor Sign-Off</p>
            </div>

            <div className="space-y-1 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border-2 border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="font-black text-blue-400 text-[10px] tracking-wider uppercase">OFFICIAL DiGi SEALS</p>
            </div>

            <div className="space-y-1">
              <div className="h-8 flex items-end justify-center">
                <span className="font-serif italic font-bold text-blue-400 text-sm">Prof. R. V. Sharma</span>
              </div>
              <div className="w-36 h-0.5 bg-slate-700 mx-auto" />
              <p className="font-bold text-white text-[11px]">Prof. R. V. Sharma</p>
              <p className="text-slate-400 text-[10px]">Dean of Academic Affairs</p>
            </div>
          </div>
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close Preview
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenPDFPreview}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" /> Open PDF in New Tab
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" /> 📥 Download Official PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
