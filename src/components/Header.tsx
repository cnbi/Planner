import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, LayoutGrid, FolderKanban, Plus, RotateCcw, CheckCircle2, Lock, Settings } from 'lucide-react';
import { ViewMode } from '../types';
import { formatDateTitle, addDays, getTodayISO } from '../utils/time';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onOpenCreateModal: () => void;
  onResetData: () => void;
  completedCount: number;
  totalCount: number;
  onLockApp: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  viewMode,
  onViewChange,
  onOpenCreateModal,
  onResetData,
  completedCount,
  totalCount,
  onLockApp,
  onOpenSettings,
}) => {
  const isToday = currentDate === getTodayISO();
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Brand + Stats + Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  Daily Planner
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Taskito Style
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Organize timeline, 10-min blocks & projects
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={onLockApp}
                id="header-mobile-lock-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                title="Lock App"
              >
                <Lock className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSettings}
                id="header-mobile-settings-btn"
                className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                title="Security & Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCreateModal}
                id="header-mobile-add-btn"
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                title="Create New Item"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center justify-between bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onDateChange(addDays(currentDate, -1))}
              id="header-prev-date-btn"
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                id="header-date-input"
                className="text-sm font-semibold text-slate-800 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                {formatDateTitle(currentDate)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {!isToday && (
                <button
                  onClick={() => onDateChange(getTodayISO())}
                  id="header-today-btn"
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  Today
                </button>
              )}
              <button
                onClick={() => onDateChange(addDays(currentDate, 1))}
                id="header-next-date-btn"
                className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
                title="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Actions & Stats */}
          <div className="hidden md:flex items-center gap-2">
            {/* Progress Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 mr-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">
                  {completedCount}/{totalCount} Done
                </span>
                <span className="text-slate-500 ml-1">({progressPercent}%)</span>
              </div>
              <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Lock App Button */}
            <button
              onClick={onLockApp}
              id="header-lock-btn"
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all text-xs font-semibold"
              title="Lock Application Now"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Lock App</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              id="header-settings-btn"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="PIN Security & App Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Reset Sample Data Button */}
            <button
              onClick={onResetData}
              id="header-reset-btn"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Desktop Add Button */}
            <button
              onClick={onOpenCreateModal}
              id="header-desktop-add-btn"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all active:scale-98 ml-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-100/90 p-1 rounded-xl" id="nav-views-tab">
            <button
              onClick={() => onViewChange('timeline')}
              id="view-tab-timeline"
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Timeline</span>
            </button>

            <button
              onClick={() => onViewChange('blocks')}
              id="view-tab-blocks"
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'blocks'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>10-Min Blocks</span>
            </button>

            <button
              onClick={() => onViewChange('project')}
              id="view-tab-projects"
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'project'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Projects</span>
            </button>
          </nav>

          {/* Mobile Progress Bar */}
          <div className="flex md:hidden items-center gap-2 text-xs text-slate-600 font-medium">
            <span>{completedCount}/{totalCount} ({progressPercent}%)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
