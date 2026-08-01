import React from 'react';
import { Check, Clock, Plus, Tag, Folder, AlertCircle, Bell, Repeat, Calendar } from 'lucide-react';
import { PlannerItem } from '../types';
import { COLOR_THEMES } from '../data/colors';
import { getHourLabel, timeToMinutes, formatTime12h, getTodayISO } from '../utils/time';

interface TimelineViewProps {
  items: PlannerItem[];
  currentDate: string;
  onToggleDone: (itemId: string) => void;
  onEditItem: (item: PlannerItem) => void;
  onQuickAddAtHour: (hour: number) => void;
  onOpenCreateModal: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  items,
  currentDate,
  onToggleDone,
  onEditItem,
  onQuickAddAtHour,
  onOpenCreateModal,
}) => {
  const isToday = currentDate === getTodayISO();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMins = currentHour * 60 + currentMinute;

  // Group items by hour for row matching or calculate precise absolute positions
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'medium':
        return <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">Med</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto py-6 px-3 sm:px-6">
      {/* View Header Info */}
      <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 p-4 rounded-2xl border border-indigo-100/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            24-Hour Schedule Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click checkboxes to complete tasks directly or tap any block to edit details.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
            {items.length} {items.length === 1 ? 'Item' : 'Items'} Scheduled
          </span>
        </div>
      </div>

      {/* Timeline Schedule Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {hours.map((hour) => {
          const hourStartMins = hour * 60;
          const hourEndMins = hourStartMins + 60;

          // Find items starting in this hour
          const hourItems = items.filter((item) => {
            const startMins = timeToMinutes(item.startTime);
            return startMins >= hourStartMins && startMins < hourEndMins;
          });

          const isCurrentHourRow = isToday && currentHour === hour;

          return (
            <div
              key={hour}
              className={`relative flex items-start group min-h-[76px] transition-colors ${
                isCurrentHourRow ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              {/* Hour Label Column */}
              <div className="w-20 sm:w-24 shrink-0 py-3 px-3 text-right border-r border-slate-100 select-none">
                <span className="text-xs font-bold text-slate-600 tracking-tight">
                  {getHourLabel(hour)}
                </span>
              </div>

              {/* Items / Time Slot Content Area */}
              <div className="flex-1 p-2 sm:p-2.5 relative min-h-[76px]">
                {/* Current Time Line Indicator */}
                {isToday && currentHour === hour && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{
                      top: `${(currentMinute / 60) * 100}%`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.25 shadow-xs" />
                    <div className="h-0.5 bg-rose-500 flex-1 opacity-90" />
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mr-2 shadow-xs">
                      {formatTime12h(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`)}
                    </span>
                  </div>
                )}

                {/* Render Items in this hour */}
                {hourItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {hourItems.map((item) => {
                      const theme = COLOR_THEMES[item.color] || COLOR_THEMES.blue;

                      return (
                        <div
                          key={item.id}
                          onClick={() => onEditItem(item)}
                          className={`group/card relative flex items-start justify-between p-3.5 rounded-r-xl rounded-l-xs ${theme.borderLeft} ${theme.bgLight} transition-all duration-150 cursor-pointer hover:shadow-md hover:scale-[1.002] ${
                            item.isDone ? 'opacity-65 grayscale-[30%]' : ''
                          }`}
                        >
                          {/* Left: Checkbox & Item Details */}
                          <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                            {/* Interactive Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleDone(item.id);
                              }}
                              className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                item.isDone
                                  ? `${theme.bgDark} border-transparent text-white shadow-xs`
                                  : 'border-slate-300 bg-white hover:border-slate-400'
                              }`}
                              title={item.isDone ? 'Mark as to do' : 'Mark as done'}
                            >
                              {item.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className={`text-xs font-bold ${theme.text}`}>
                                  {formatTime12h(item.startTime)} ({item.durationMinutes}m)
                                </span>
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-slate-200/80 text-slate-700">
                                  {item.type}
                                </span>
                                {getPriorityBadge(item.priority)}
                                {item.project && (
                                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-0.5 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/80">
                                    <Folder className="w-3 h-3 text-indigo-500" />
                                    #{item.project}
                                  </span>
                                )}
                              </div>

                              <h3
                                className={`text-sm font-semibold text-slate-900 leading-snug break-words ${
                                  item.isDone ? 'line-through text-slate-500' : ''
                                }`}
                              >
                                {item.title}
                              </h3>

                              {item.description && (
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              {/* Checklist & Tags Bar */}
                              <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-slate-200/40">
                                {item.checklist.length > 0 && (
                                  <span className="text-[11px] font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    {item.checklist.filter((c) => c.completed).length}/
                                    {item.checklist.length} subtasks
                                  </span>
                                )}

                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] font-semibold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-slate-400" />@{tag}
                                  </span>
                                ))}

                                {item.repeat !== 'none' && (
                                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-0.5" title={`Repeats ${item.repeat}`}>
                                    <Repeat className="w-3 h-3 text-slate-400" />
                                    {item.repeat}
                                  </span>
                                )}

                                {item.reminders && (
                                  <Bell className="w-3 h-3 text-amber-500" title="Reminder active" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty Slot Quick Add Trigger */
                  <div className="h-full min-h-[50px] flex items-center">
                    <button
                      onClick={() => onQuickAddAtHour(hour)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-indigo-300 text-xs font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/80"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add at {getHourLabel(hour)}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onOpenCreateModal}
        id="timeline-fab-add-btn"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-300 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="hidden sm:inline">New Planner Item</span>
      </button>
    </div>
  );
};
