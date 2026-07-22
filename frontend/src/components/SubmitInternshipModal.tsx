import React, { useState } from 'react';
import { X, Sparkles, Upload, FileText, CheckCircle2, Award, Zap, Building2, MapPin, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import type { InternshipItem } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SubmitInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const SubmitInternshipModal: React.FC<SubmitInternshipModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { user } = useAuth();
  const [activeInputTab, setActiveInputTab] = useState<'text' | 'image' | 'manual'>('text');

  // Input states
  const [whatsappText, setWhatsappText] = useState('');
  const [flierImageBase64, setFlierImageBase64] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [domain, setDomain] = useState<InternshipItem['domain']>('Web Development');
  const [workType, setWorkType] = useState<'Remote' | 'On-site' | 'Hybrid'>('Remote');
  const [stipend, setStipend] = useState('₹15,000 / month');
  const [duration, setDuration] = useState('3 Months');
  const [location, setLocation] = useState('Remote / Online');
  const [skillsText, setSkillsText] = useState('React, Node.js, Problem Solving');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlierImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParseWithAI = async () => {
    if (!whatsappText.trim() && !flierImageBase64) {
      alert('Please paste a WhatsApp message or upload a flier photo first');
      return;
    }

    try {
      setIsParsing(true);
      const res = await api.parseInternshipWithAI({
        text: whatsappText,
        flierImage: flierImageBase64
      });

      if (res.success && res.parsedData) {
        const d = res.parsedData;
        if (d.title) setTitle(d.title);
        if (d.company) setCompany(d.company);
        if (d.domain) setDomain(d.domain as any);
        if (d.workType) setWorkType(d.workType as any);
        if (d.stipend) setStipend(d.stipend);
        if (d.duration) setDuration(d.duration);
        if (d.location) setLocation(d.location);
        if (d.skillsRequired) setSkillsText(d.skillsRequired.join(', '));
        if (d.description) setDescription(d.description);

        alert('✨ AI successfully extracted internship details! Review and edit below before submitting.');
        setActiveInputTab('manual');
      }
    } catch (err: any) {
      alert(err.message || 'AI Parsing failed');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      alert('Title and company are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const skillsRequired = skillsText.split(',').map(s => s.trim()).filter(Boolean);

      const res = await api.submitStudentInternship({
        title,
        company,
        domain,
        workType,
        stipend,
        duration,
        location,
        skillsRequired,
        description,
        flierUrl: flierImageBase64,
        rawTextSource: whatsappText
      });

      alert(res.message);
      onSubmitted();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">AI Internship Importer & Submission</h3>
              <p className="text-xs text-blue-100">Paste WhatsApp posts or upload fliers to extract with AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bonus XP Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 font-bold">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Submit verified positions to earn <strong>+200 XP</strong> & the <strong>🌟 Talent Scout Badge</strong> upon Admin approval!</span>
          </div>
        </div>

        {/* Input Method Selector Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/60 flex items-center space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveInputTab('text')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeInputTab === 'text' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste WhatsApp Post</span>
          </button>

          <button
            onClick={() => setActiveInputTab('image')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeInputTab === 'image' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Flier Photo</span>
          </button>

          <button
            onClick={() => setActiveInputTab('manual')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeInputTab === 'manual' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Review Form ({title || 'Empty'})</span>
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: WhatsApp Message Parser */}
          {activeInputTab === 'text' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase">Paste WhatsApp / Telegram Opportunity Post</label>
              <textarea
                rows={6}
                placeholder="Paste raw WhatsApp text here, e.g.:&#10;🚀 We are hiring Full-Stack React Interns at Google Cloud Labs!&#10;Stipend: ₹25,000 / month&#10;Duration: 3 Months&#10;Work Mode: Remote..."
                value={whatsappText}
                onChange={e => setWhatsappText(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-mono bg-slate-50 focus:border-blue-600 focus:outline-hidden"
              />

              <button
                type="button"
                disabled={isParsing || !whatsappText.trim()}
                onClick={handleParseWithAI}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isParsing ? 'Analyzing Text with AI...' : '✨ Auto-Fill Form with AI'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: Flier Photo Upload Parser */}
          {activeInputTab === 'image' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase">Upload Poster / Flier Image</label>
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
                {flierImageBase64 ? (
                  <div className="space-y-3">
                    <img src={flierImageBase64} alt="Flier preview" className="max-h-48 rounded-2xl mx-auto shadow-md border border-slate-200" />
                    <p className="text-xs text-emerald-600 font-bold">✓ Flier image attached successfully</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-purple-600 stroke-1" />
                    <p className="font-bold text-xs text-slate-700">Click to upload poster / flier photo</p>
                    <p className="text-[11px] text-slate-400">Supports PNG, JPG, JPEG fliers</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <button
                type="button"
                disabled={isParsing || !flierImageBase64}
                onClick={handleParseWithAI}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isParsing ? 'Scanning Flier Image...' : '✨ Extract Poster Info with AI'}</span>
              </button>
            </div>
          )}

          {/* TAB 3 / FORM: Review & Submit Form */}
          {(activeInputTab === 'manual' || (title && activeInputTab !== 'text' && activeInputTab !== 'image')) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Internship Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full-Stack React Intern"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud / Cisco / TechCorp"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Domain</label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-medium"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Embedded & IoT">Embedded & IoT</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Business Analytics">Business Analytics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Mode</label>
                  <select
                    value={workType}
                    onChange={e => setWorkType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-medium"
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stipend</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹20,000 / month"
                    value={stipend}
                    onChange={e => setStipend(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Months"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, India / Remote"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Required Skills (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, TypeScript, REST APIs"
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Description & How to Apply</label>
                <textarea
                  rows={4}
                  placeholder="Provide role summary, application link, or guidelines..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:outline-hidden resize-none font-medium"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !company}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Position for Verification'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
