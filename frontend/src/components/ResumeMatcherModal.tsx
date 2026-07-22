import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, AlertCircle, FileText, Plus, RefreshCw, Briefcase, BrainCircuit, Lightbulb, Check } from 'lucide-react';
import { api, type ResumeMatchResult } from '../services/api';

interface ResumeMatcherModalProps {
  internshipId: string;
  internshipTitle?: string;
  companyName?: string;
  requiredSkills?: string[];
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Figma', 'Git', 
  'Machine Learning', 'Cyber Security', 'Tailwind CSS', 'C++', 'Java'
];

export const ResumeMatcherModal: React.FC<ResumeMatcherModalProps> = ({
  internshipId,
  internshipTitle = 'Internship Position',
  companyName = 'Company',
  requiredSkills = [],
  isOpen,
  onClose
}) => {
  const [resumeText, setResumeText] = useState('');
  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [matchResult, setMatchResult] = useState<ResumeMatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleSkill = (skill: string) => {
    if (studentSkills.includes(skill)) {
      setStudentSkills(studentSkills.filter(s => s !== skill));
    } else {
      setStudentSkills([...studentSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !studentSkills.includes(trimmed)) {
      setStudentSkills([...studentSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setStudentSkills(studentSkills.filter(s => s !== skillToRemove));
  };

  const handleCalculateMatch = async () => {
    if (!resumeText.trim() && studentSkills.length === 0) {
      setErrorMsg('Please paste your resume text or select at least one skill to match.');
      return;
    }

    setErrorMsg('');
    setIsCalculating(true);
    try {
      const result = await api.matchResume(internshipId, resumeText, studentSkills);
      setMatchResult(result);
    } catch (err: any) {
      console.error('Failed to match resume:', err);
      setErrorMsg(err.message || 'Failed to calculate compatibility match. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setMatchResult(null);
    setErrorMsg('');
  };

  // Helper for progress ring stroke offset
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = matchResult
    ? circumference - (matchResult.matchPercentage / 100) * circumference
    : circumference;

  // Colors based on readiness level
  const getBadgeTheme = (level?: string, score = 0) => {
    if (level === 'High Match' || score >= 75) {
      return {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-600',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        ringGlow: 'shadow-emerald-500/20'
      };
    } else if (level === 'Moderate Match' || score >= 45) {
      return {
        stroke: '#6366f1', // indigo-500
        text: 'text-indigo-600',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        ringGlow: 'shadow-indigo-500/20'
      };
    }
    return {
      stroke: '#f59e0b', // amber-500
      text: 'text-amber-600',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      ringGlow: 'shadow-amber-500/20'
    };
  };

  const theme = getBadgeTheme(matchResult?.readinessLevel, matchResult?.matchPercentage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3.5 z-10">
            <div className="p-3 bg-indigo-600/90 text-white rounded-2xl shadow-lg ring-1 ring-white/20">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  AI Matcher
                </span>
                <span className="text-xs text-slate-400">Skill Compatibility Analysis</span>
              </div>
              <h3 className="font-extrabold text-xl text-white mt-0.5">
                {internshipTitle}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>{companyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!matchResult ? (
            /* INPUT STEP */
            <div className="space-y-6">
              {/* Target Internship Required Skills Preview */}
              {requiredSkills.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-2 flex items-center justify-between">
                    <span>Target Required Skills ({requiredSkills.length})</span>
                    <span className="text-[11px] font-normal text-indigo-600">Posted by recruiter</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {requiredSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 text-xs font-medium shadow-xs"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Select Skills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Your Known Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((sk) => {
                    const isSelected = studentSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => handleToggleSkill(sk)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-102'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Skill */}
                <form onSubmit={handleAddCustomSkill} className="mt-3 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type custom skill (e.g. Next.js, Redux, Docker)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Selected Skills Chips */}
                {studentSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Selected Skills ({studentSkills.length}):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {studentSkills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-semibold"
                        >
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Text Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Paste Resume Text / Project Summary</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Optional but improves accuracy</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your resume text, work experience, LinkedIn summary, or tech stack details here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono focus:border-indigo-600 focus:outline-hidden resize-none bg-slate-50/50"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCalculateMatch}
                disabled={isCalculating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calculating AI Compatibility Match...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                    <span>Analyze Compatibility Score</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* RESULTS STEP */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Score Header Card */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

                {/* Score Circular Gauge */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      stroke={theme.stroke}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black tracking-tight text-white">
                      {matchResult.matchPercentage}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Match
                    </span>
                  </div>
                </div>

                {/* Match Summary */}
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs">
                    <span className={`w-2 h-2 rounded-full animate-ping ${matchResult.matchPercentage >= 75 ? 'bg-emerald-400' : matchResult.matchPercentage >= 45 ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                    <span className={theme.text}>{matchResult.readinessLevel}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {matchResult.matchPercentage >= 75
                      ? 'Great Fit for this Role!'
                      : matchResult.matchPercentage >= 45
                      ? 'Good Foundation with Skill Gaps'
                      : 'Additional Preparation Recommended'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Matched {matchResult.matchingSkills.length} out of {matchResult.matchingSkills.length + matchResult.missingSkills.length} required skills for {internshipTitle}.
                  </p>
                </div>
              </div>

              {/* Matched vs Missing Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Matched Skills ({matchResult.matchingSkills.length})</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchingSkills.length > 0 ? (
                      matchResult.matchingSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{sk}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700 italic">No matching skills detected.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                    <span className="flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Skills Needed ({matchResult.missingSkills.length})</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.length > 0 ? (
                      matchResult.missingSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200"
                        >
                          + {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium">🎉 Zero skill gaps! You match all requirements.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable AI Recommendations */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Actionable AI Recommendations</span>
                </div>
                <div className="space-y-2.5">
                  {matchResult.aiRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex items-start space-x-3 text-xs text-slate-700 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <span dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refine / Re-calculate Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refine Resume & Skills</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
