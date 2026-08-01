import React from 'react';
import { Search, Tag, AlertCircle, X } from 'lucide-react';
import { PriorityLevel } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: PriorityLevel | 'all';
  onPriorityChange: (priority: PriorityLevel | 'all') => void;
  selectedTag: string | 'all';
  onTagChange: (tag: string | 'all') => void;
  allTags: string[];
  statusFilter: 'all' | 'active' | 'completed';
  onStatusFilterChange: (status: 'all' | 'active' | 'completed') => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedTag,
  onTagChange,
  allTags,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedPriority !== 'all' ||
    selectedTag !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items, @tags, #projects..."
            id="filter-search-input"
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as PriorityLevel | 'all')}
            id="filter-priority-select"
            className="text-xs font-medium bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">No Priority</option>
          </select>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
              id="filter-tag-select"
              className="text-xs font-medium bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  @{t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center bg-slate-200/60 p-0.5 rounded-xl text-xs font-medium">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onStatusFilterChange('active')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => onStatusFilterChange('completed')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Done
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            id="filter-clear-btn"
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
};
