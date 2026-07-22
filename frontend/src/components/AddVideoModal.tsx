import React, { useState } from 'react';
import { X, Video, Save } from 'lucide-react';
import { api } from '../services/api';

interface AddVideoModalProps {
  internshipId: string;
  isOpen: boolean;
  onClose: () => void;
  onVideoAdded: () => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ internshipId, isOpen, onClose, onVideoAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [moduleName, setModuleName] = useState('Module 1: Orientation');
  const [duration, setDuration] = useState('15:00');
  const [order, setOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      alert('Title and Video URL are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createVideoLesson({
        internshipId,
        title,
        description,
        videoUrl,
        moduleName,
        duration,
        order
      });

      alert('Video lesson added successfully! Registered interns have been notified.');
      onVideoAdded();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to add video lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Add Video Lesson</h3>
              <p className="text-xs text-slate-400">Embed training video & assign +50 XP reward</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 1. Orientation & Architecture Overview"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">YouTube / Video Embed URL *</label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">Supports YouTube links, Vimeo, or direct MP4 video URLs.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Module Name</label>
              <input
                type="text"
                placeholder="e.g. Module 1: Architecture"
                value={moduleName}
                onChange={e => setModuleName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (e.g. 15:30)</label>
              <input
                type="text"
                placeholder="15:30"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Summary of video topics and deliverables..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-purple-600 focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Video Lesson'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
