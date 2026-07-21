import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Tag, Building, Briefcase } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import type { InternshipItem } from '../services/api';

interface SearchEventsPageProps {
  events: InternshipItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectEvent: (event: InternshipItem) => void;
  onQuickRegister: (event: InternshipItem) => void;
}

export const SearchEventsPage: React.FC<SearchEventsPageProps> = ({
  events,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectEvent,
  onQuickRegister
}) => {
  const [selectedWorkType, setSelectedWorkType] = useState('All');

  const domains = [
    'All', 
    'Web Development', 
    'AI & Machine Learning', 
    'Data Science', 
    'Cloud & DevOps', 
    'Cyber Security', 
    'UI/UX Design', 
    'Embedded & IoT', 
    'Software Engineering'
  ];

  const workTypes = ['All', 'Remote', 'On-site', 'Hybrid'];

  const filteredEvents = events.filter((e) => {
    const matchesDomain = selectedCategory === 'All' || e.domain === selectedCategory || e.category === selectedCategory;
    const matchesWorkType = selectedWorkType === 'All' || e.workType === selectedWorkType;
    const matchesSearch = searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.skillsRequired && e.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesDomain && matchesWorkType && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading">Explore Internship Positions</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">Filter by domain, remote/onsite mode, skills, or company name</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Filter Criteria
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedWorkType('All');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Title, company, skill (React, Python)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Domain Category
            </label>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {domains.map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedCategory(dom)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    selectedCategory === dom
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{dom}</span>
                  {selectedCategory === dom && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Work Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Location / Mode
            </label>
            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            >
              {workTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-bold">
              Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredEvents.length}</span> internship roles found
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => onSelectEvent(event)}
                  onQuickRegister={onQuickRegister}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">No matching internships found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Try clearing your search query or switching domain categories to explore other opportunities.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedWorkType('All');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-md hover:bg-blue-700 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
