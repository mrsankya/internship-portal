import React, { useState } from 'react';
import { X, Plus, Trash2, HelpCircle, CheckCircle2, Save } from 'lucide-react';
import { api } from '../services/api';
import type { QuizQuestion } from '../services/api';

interface CreateQuizModalProps {
  internshipId: string;
  isOpen: boolean;
  onClose: () => void;
  onQuizCreated: () => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ internshipId, isOpen, onClose, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleName, setModuleName] = useState('Week 1 Skill Checkpoint');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [xpReward, setXpReward] = useState(150);

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = value;
      copy[qIndex].options = opts;
      return copy;
    });
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        alert(`Question #${i + 1} text is required`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j]?.trim()) {
          alert(`Option ${String.fromCharCode(65 + j)} for Question #${i + 1} is required`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await api.createQuiz({
        internshipId,
        title,
        description,
        moduleName,
        durationMinutes,
        passingScore,
        xpReward,
        questions
      });

      alert('Quiz created successfully! Registered interns have been notified.');
      onQuizCreated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Create Internship Quiz / Assessment</h3>
              <p className="text-xs text-slate-400">Add skill checkpoints with XP rewards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quiz Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. React & Express Microservices Assessment"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Module / Phase Tag</label>
              <input
                type="text"
                placeholder="e.g. Week 2 Skill Checkpoint"
                value={moduleName}
                onChange={e => setModuleName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              placeholder="Provide context or instructions for interns taking this assessment..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min={10}
                max={100}
                value={passingScore}
                onChange={e => setPassingScore(parseInt(e.target.value) || 70)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">XP Reward ⚡</label>
              <input
                type="number"
                min={10}
                max={1000}
                value={xpReward}
                onChange={e => setXpReward(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white font-semibold text-amber-600"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-base">Questions ({questions.length})</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 text-xs uppercase tracking-wider bg-slate-200 px-2.5 py-1 rounded-lg">
                    Question #{qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Enter question statement..."
                    value={q.question}
                    onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        name={`correctAnswer-${qIndex}`}
                        checked={q.correctAnswer === optIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        title="Mark as correct answer"
                      />
                      <span className="text-xs font-bold text-slate-500 w-5">{String.fromCharCode(65 + optIndex)}.</span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        value={opt}
                        onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                        className="w-full px-2 py-1 text-xs border-0 focus:outline-hidden font-medium"
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <input
                    type="text"
                    placeholder="Explanation for correct answer (shown during review)..."
                    value={q.explanation || ''}
                    onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Quiz...' : 'Save & Publish Quiz'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
