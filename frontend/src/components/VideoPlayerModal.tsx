import React, { useState } from 'react';
import { X, Play, CheckCircle2, Video, Award, Clock, ChevronRight, Zap } from 'lucide-react';
import { api } from '../services/api';
import type { VideoLessonItem } from '../services/api';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: VideoLessonItem[];
  currentLesson: VideoLessonItem | null;
  onLessonChange: (lesson: VideoLessonItem) => void;
  onVideoCompleted?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  lessons,
  currentLesson,
  onLessonChange,
  onVideoCompleted
}) => {
  const [isCompleting, setIsCompleting] = useState(false);

  if (!isOpen || !currentLesson) return null;

  const handleMarkCompleted = async () => {
    try {
      setIsCompleting(true);
      const res = await api.completeVideoLesson(currentLesson._id);
      alert(res.message || 'Video lesson marked as completed!');
      if (onVideoCompleted) onVideoCompleted();
    } catch (err: any) {
      alert(err.message || 'Failed to update video progress');
    } finally {
      setIsCompleting(false);
    }
  };

  const isCompleted = currentLesson.userProgress?.isCompleted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[92vh] text-white">
        {/* Video Screen Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          {/* Top Bar */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <span className="bg-purple-600/30 text-purple-400 border border-purple-500/30 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                {currentLesson.moduleName || 'Video Lesson'}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white truncate">{currentLesson.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Embed Video Player Container */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {currentLesson.videoUrl ? (
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center p-8 text-slate-500">
                <Video className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p>No video stream URL provided</p>
              </div>
            )}
          </div>

          {/* Video Metadata & Controls */}
          <div className="p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                {currentLesson.description || 'Watch this video lesson to master key concepts and complete your internship learning milestones.'}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {currentLesson.duration || '10:00'}
                </span>
                <span className="flex items-center text-amber-400 font-semibold">
                  <Zap className="w-3.5 h-3.5 mr-1 fill-amber-400" />
                  +50 XP upon completion
                </span>
              </div>
            </div>

            <button
              disabled={isCompleting}
              onClick={handleMarkCompleted}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0 ${
                isCompleted
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed (+50 XP)' : isCompleting ? 'Saving...' : 'Mark as Watched & Claim XP'}</span>
            </button>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/90 flex flex-col max-h-[40vh] md:max-h-none">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Internship Playlist</h4>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-300">
              {lessons.filter(l => l.userProgress?.isCompleted).length} / {lessons.length} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {lessons.map((lesson, idx) => {
              const isActive = lesson._id === currentLesson._id;
              const isDone = lesson.userProgress?.isCompleted;

              return (
                <div
                  key={lesson._id}
                  onClick={() => onLessonChange(lesson)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center space-x-3 ${
                    isActive
                      ? 'bg-purple-600/20 border border-purple-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className={`text-xs font-semibold truncate ${isActive ? 'text-white font-bold' : 'text-slate-300'}`}>
                      {lesson.title}
                    </h5>
                    <span className="text-[10px] text-slate-500">{lesson.duration || '10:00'}</span>
                  </div>

                  {isActive && <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
