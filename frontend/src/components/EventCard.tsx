import React from 'react';
import { MapPin, Users, ArrowRight, Briefcase, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import type { InternshipItem } from '../services/api';

interface EventCardProps {
  event: InternshipItem; // Alias for InternshipItem
  onClick: () => void;
  onQuickRegister?: (event: InternshipItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onQuickRegister }) => {
  const totalPos = event.totalPositions || event.capacity || 10;
  const applied = event.appliedCount || event.registeredCount || 0;
  const spotsLeft = totalPos - applied;
  const isFull = spotsLeft <= 0;
  const fillPercentage = Math.round((applied / totalPos) * 100);

  const domainColors: Record<string, string> = {
    'Web Development': 'bg-blue-600 text-white',
    'AI & Machine Learning': 'bg-purple-600 text-white',
    'Data Science': 'bg-indigo-600 text-white',
    'Cloud & DevOps': 'bg-cyan-600 text-white',
    'Cyber Security': 'bg-rose-600 text-white',
    'UI/UX Design': 'bg-pink-600 text-white',
    'Embedded & IoT': 'bg-amber-600 text-white',
    'Software Engineering': 'bg-emerald-600 text-white'
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Top Banner / Company Header */}
      <div className="relative p-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={event.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
            alt={event.company}
            className="w-12 h-12 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 bg-white p-1 shadow-xs shrink-0"
          />
          <div>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase block">
              {event.company}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 font-heading">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Work Type Badge */}
        <span className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
          event.workType === 'Remote' 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
            : event.workType === 'Hybrid'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
        }`}>
          {event.workType || 'Remote'}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Domain & Stipend Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase shadow-xs ${domainColors[event.domain] || 'bg-slate-800 text-white'}`}>
              {event.domain || 'Tech'}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {event.stipend || 'Stipend Provided'}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {event.duration || '3 Months'}
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
            {event.description}
          </p>

          {/* Required Skills Chips */}
          {event.skillsRequired && event.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {event.skillsRequired.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {skill}
                </span>
              ))}
              {event.skillsRequired.length > 4 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md text-slate-500">
                  +{event.skillsRequired.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Application Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {applied} / {totalPos} Positions Filled
            </span>
            {spotsLeft > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950">{spotsLeft} openings left</span>
            ) : (
              <span className="text-rose-700 dark:text-rose-400 font-black px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950">Positions Filled</span>
            )}
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Location Specs */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{event.location || 'Remote / Online'}</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Role & Milestones <ArrowRight className="w-4 h-4" />
          </span>

          {onQuickRegister && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister(event);
              }}
              disabled={isFull}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all ${
                isFull 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:scale-105'
              }`}
            >
              {isFull ? 'Filled' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
