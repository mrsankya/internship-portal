import React, { useState, useEffect } from 'react';
import { X, Clock, Award, CheckCircle2, XCircle, Trophy, HelpCircle, ArrowRight, ArrowLeft, RefreshCw, Mail, Zap } from 'lucide-react';
import { api } from '../services/api';
import type { QuizItem } from '../services/api';

interface QuizModalProps {
  quiz: QuizItem | null;
  isOpen: boolean;
  onClose: () => void;
  onQuizCompleted?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, isOpen, onClose, onQuizCompleted }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (quiz && isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setResult(null);
      setTimeLeft((quiz.durationMinutes || 15) * 60);
    }
  }, [quiz, isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || result || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, result, timeLeft]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (result) return; // Locked after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleSubmitAnswers = async () => {
    if (isSubmitting || result) return;
    try {
      setIsSubmitting(true);
      const payload = Object.entries(selectedAnswers).map(([qIdx, optIdx]) => ({
        questionIndex: parseInt(qIdx, 10),
        selectedOption: optIdx
      }));

      const res = await api.submitQuiz(quiz._id, payload);
      setResult(res);
      if (onQuizCompleted) onQuizCompleted();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                {quiz.moduleName || 'Skill Assessment'}
              </span>
              <h3 className="font-bold text-lg text-white mt-1 leading-tight">{quiz.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!result && (
              <div className="flex items-center space-x-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-mono text-sm font-semibold">
                <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            /* Quiz Questions View */
            <div className="space-y-6">
              {/* Progress & Question Counter */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-blue-600 font-bold">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              {currentQuestion && (
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQuestionIndex + 1}. {currentQuestion.question}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className={`text-sm font-medium ${isSelected ? 'text-blue-950 font-semibold' : 'text-slate-700'}`}>
                              {opt}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Evaluation Results View */
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                {result.passed ? (
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                    <RefreshCw className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                  result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {result.passed ? '🎉 Checkpoint Passed!' : '⚠️ Retake Recommended'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  You Scored {result.percentage}%
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Correct Answers: <strong className="text-slate-900">{result.score} / {result.maxScore}</strong>
                </p>
              </div>

              {/* XP Awarded & Resend Email Badge */}
              <div className="flex items-center justify-center space-x-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-2xl font-bold text-xs flex items-center space-x-1.5 shadow-xs">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>+{result.xpEarned} XP Earned</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-2xl font-semibold text-xs flex items-center space-x-1.5 shadow-xs">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Result emailed via Resend</span>
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="text-left space-y-3 pt-4 border-t border-slate-100">
                <h5 className="font-bold text-slate-900 text-sm">Question Breakdown & Explanations</h5>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {result.evaluatedAnswers?.map((ans: any, i: number) => {
                    const q = questions[ans.questionIndex];
                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                          ans.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-800">{i + 1}. {q?.question}</span>
                          {ans.isCorrect ? (
                            <span className="text-emerald-700 flex items-center font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Correct
                            </span>
                          ) : (
                            <span className="text-rose-700 flex items-center font-bold">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Incorrect
                            </span>
                          )}
                        </div>
                        {ans.explanation && (
                          <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60 mt-1">
                            💡 <strong>Explanation:</strong> {ans.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          {!result ? (
            <>
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs disabled:opacity-40 hover:bg-white transition-colors flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmitAnswers}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Evaluating...</span>
                  ) : (
                    <>
                      <span>Submit Assessment</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Close & Return to Internship
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
