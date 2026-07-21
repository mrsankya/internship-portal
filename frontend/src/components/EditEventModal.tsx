import React, { useState, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import type { InternshipItem } from '../services/api';

interface EditEventModalProps {
  event: InternshipItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: (event: InternshipItem) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, isOpen, onClose, onEventUpdated }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<InternshipItem['domain']>('Web Development');
  const [status, setStatus] = useState<InternshipItem['status']>('Open');
  const [workType, setWorkType] = useState<InternshipItem['workType']>('Remote');
  const [duration, setDuration] = useState('3 Months');
  const [stipend, setStipend] = useState('₹20,000 / month');
  const [totalPositions, setTotalPositions] = useState(10);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setCompany(event.company || '');
      setDescription(event.description || '');
      setDomain(event.domain || 'Web Development');
      setStatus(event.status || 'Open');
      setWorkType(event.workType || 'Remote');
      setDuration(event.duration || '3 Months');
      setStipend(event.stipend || '₹20,000 / month');
      setTotalPositions(event.totalPositions || event.capacity || 10);
      setIsFeatured(event.isFeatured || false);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updated = await api.updateInternship(event._id, {
        title,
        company,
        description,
        domain,
        status,
        workType,
        duration,
        stipend,
        totalPositions: Number(totalPositions),
        isFeatured
      });

      onEventUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-slate-900">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Edit Internship Details
            </h2>
            <p className="text-xs text-slate-500 font-bold">Update position info, status, stipend, or capacity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs font-bold text-slate-900 dark:text-white">
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-medium border border-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block mb-1">Internship Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="Open">Open</option>
                <option value="Active">Active</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Company *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1">Domain *</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="Web Development">Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Data Science">Data Science</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Embedded & IoT">Embedded & IoT</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Work Mode</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Stipend</label>
              <input
                type="text"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1">Positions Available</label>
              <input
                type="number"
                min="1"
                value={totalPositions}
                onChange={(e) => setTotalPositions(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Feature on Homepage Hero Banner</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
