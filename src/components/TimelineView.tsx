import React, { useRef } from 'react';
import { Check, Clock, Plus, Tag, Folder, Bell, Repeat, Trash2 } from 'lucide-react';
import { PlannerItem } from '../types';
import { COLOR_THEMES } from '../data/colors';
import { getHourLabel, timeToMinutes, formatTime12h, getTodayISO } from '../utils/time';

interface TimelineViewProps {
  items: PlannerItem[];
  currentDate: string;
  onToggleDone: (itemId: string) => void;
  onEditItem: (item: PlannerItem) => void;
  onQuickAddAtHour: (hourOrTime: number | string) => void;
  onOpenCreateModal: () => void;
  onDeleteItem?: (itemId: string) => void;
}

const HOUR_HEIGHT = 80; // 80px per hour
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT; // 1920px total height

interface PositionedItem {
  item: PlannerItem;
  top: number;
  height: number;
  colIndex: number;
  totalCols: number;
}

function calculatePositionedItems(items: PlannerItem[], hourHeight: number): PositionedItem[] {
  if (items.length === 0) return [];

  // Map items to intervals
  const intervals = items.map((item) => {
    const startMins = timeToMinutes(item.startTime);
    const duration = Math.max(item.durationMinutes || 30, 10);
    const endMins = startMins + duration;
    return {
      item,
      startMins,
      endMins,
      top: (startMins / 60) * hourHeight,
      height: Math.max((duration / 60) * hourHeight, 32),
      colIndex: 0,
      totalCols: 1,
    };
  });

  // Sort chronologically
  intervals.sort((a, b) => a.startMins - b.startMins || b.endMins - a.endMins);

  // Group into overlapping clusters
  const clusters: (typeof intervals)[] = [];
  let currentCluster: typeof intervals = [];
  let clusterEnd = -1;

  intervals.forEach((inst) => {
    if (currentCluster.length === 0) {
      currentCluster.push(inst);
      clusterEnd = inst.endMins;
    } else if (inst.startMins < clusterEnd) {
      currentCluster.push(inst);
      clusterEnd = Math.max(clusterEnd, inst.endMins);
    } else {
      clusters.push(currentCluster);
      currentCluster = [inst];
      clusterEnd = inst.endMins;
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns within each cluster
  const result: PositionedItem[] = [];

  clusters.forEach((cluster) => {
    const columns: number[] = [];

    cluster.forEach((inst) => {
      let assignedCol = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i] <= inst.startMins) {
          assignedCol = i;
          columns[i] = inst.endMins;
          break;
        }
      }
      if (assignedCol === -1) {
        assignedCol = columns.length;
        columns.push(inst.endMins);
      }
      inst.colIndex = assignedCol;
    });

    const totalCols = columns.length || 1;

    cluster.forEach((inst) => {
      result.push({
        item: inst.item,
        top: inst.top,
        height: inst.height,
        colIndex: inst.colIndex,
        totalCols,
      });
    });
  });

  return result;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  items,
  currentDate,
  onToggleDone,
  onEditItem,
  onQuickAddAtHour,
  onOpenCreateModal,
  onDeleteItem,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const isToday = currentDate === getTodayISO();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMins = currentHour * 60 + currentMinute;
  const currentRedLineTop = (currentTimeInMins / 60) * HOUR_HEIGHT;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const positionedItems = calculatePositionedItems(items, HOUR_HEIGHT);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">Urgent</span>;
      case 'high':
        return <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'medium':
        return <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">Med</span>;
      default:
        return null;
    }
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only add if clicking directly on grid container, not an item
    if ((e.target as HTMLElement).closest('.timeline-item-card')) {
      return;
    }

    if (!gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    const minuteInDay = Math.min(Math.max(0, Math.floor((offsetY / TOTAL_HEIGHT) * 1440)), 1439);
    // Round to nearest 15-minute slot
    const roundedMins = Math.floor(minuteInDay / 15) * 15;
    const h = Math.floor(roundedMins / 60);
    const m = roundedMins % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    onQuickAddAtHour(timeStr);
  };

  return (
    <div className="relative max-w-5xl mx-auto py-6 px-3 sm:px-6">
      {/* View Header Info */}
      <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 p-4 rounded-2xl border border-indigo-100/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Interactive 24-Hour Schedule Canvas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Google Calendar style vertical positioning. Click checkboxes to complete tasks or tap grid slots to schedule.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
            {items.length} {items.length === 1 ? 'Item' : 'Items'} Scheduled
          </span>
        </div>
      </div>

      {/* Main 24-Hour Timeline Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex overflow-hidden">
        {/* Time Labels Column (Left) */}
        <div className="w-16 sm:w-20 shrink-0 border-r border-slate-100 bg-slate-50/40 select-none relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 text-right pr-2 sm:pr-3 -translate-y-2.5 text-[11px] font-extrabold text-slate-600 tracking-tight"
              style={{ top: `${hour * HOUR_HEIGHT}px` }}
            >
              {getHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* Schedule Grid Canvas (Right) */}
        <div
          ref={gridContainerRef}
          onClick={handleGridClick}
          className="flex-1 relative cursor-pointer bg-white group/grid"
          style={{ height: `${TOTAL_HEIGHT}px` }}
        >
          {/* Horizontal Hour & Half-Hour Grid Lines */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Hour Line */}
              <div
                className="absolute left-0 right-0 border-t border-slate-100 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT}px` }}
              />
              {/* 30-Minute Half Hour Line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-slate-100/80 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
              />
            </React.Fragment>
          ))}

          {/* Current Time Red Line Indicator */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-30 flex items-center pointer-events-none -translate-y-1.5"
              style={{ top: `${currentRedLineTop}px` }}
            >
              <div className="w-3 h-3 rounded-full bg-rose-500 -ml-1.5 ring-4 ring-rose-100 shadow-sm" />
              <div className="h-0.5 bg-rose-500 flex-1 opacity-90 shadow-2xs" />
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-2xs mr-2">
                {formatTime12h(
                  `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
                )}
              </span>
            </div>
          )}

          {/* Positioned Event Block Cards */}
          {positionedItems.map(({ item, top, height, colIndex, totalCols }) => {
            const theme = COLOR_THEMES[item.color] || COLOR_THEMES.blue;
            const widthPct = 100 / totalCols;
            const leftPct = colIndex * widthPct;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                className={`timeline-item-card absolute z-20 transition-all duration-150 rounded-xl p-2.5 border shadow-xs hover:shadow-md hover:z-30 cursor-pointer overflow-hidden flex flex-col justify-between group/card ${theme.borderLeft} ${theme.bgLight} ${
                  item.isDone ? 'opacity-65 grayscale-[20%]' : ''
                }`}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: `${leftPct}%`,
                  width: `calc(${widthPct}% - 6px)`,
                  marginRight: '6px',
                }}
              >
                {/* Top Header Row: Checkbox, Title & Time */}
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {/* Direct Interactive Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDone(item.id);
                      }}
                      className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        item.isDone
                          ? `${theme.bgDark} border-transparent text-white shadow-xs`
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                      title={item.isDone ? 'Mark as to do' : 'Mark as done'}
                    >
                      {item.isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 leading-tight flex-wrap">
                        <span className={`text-[11px] font-extrabold ${theme.text}`}>
                          {formatTime12h(item.startTime)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          ({item.durationMinutes}m)
                        </span>
                        {getPriorityBadge(item.priority)}
                      </div>

                      <h4
                        className={`text-xs font-bold text-slate-900 truncate leading-snug mt-0.5 ${
                          item.isDone ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  {/* Quick Delete */}
                  {onDeleteItem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover/card:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Bottom Tags / Meta Row (Visible if card height allows) */}
                {height >= 55 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-1 pt-1 border-t border-slate-200/50">
                    {item.project && (
                      <span className="text-[10px] font-semibold text-slate-700 flex items-center gap-0.5 bg-white/80 px-1.5 py-0.2 rounded border border-slate-200/60 truncate">
                        <Folder className="w-2.5 h-2.5 text-indigo-500" />
                        #{item.project}
                      </span>
                    )}

                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-semibold text-slate-600 bg-white/90 px-1 py-0.2 rounded border border-slate-200"
                      >
                        @{tag}
                      </span>
                    ))}

                    {item.repeat !== 'none' && (
                      <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">
                        <Repeat className="w-2.5 h-2.5 text-indigo-500 inline mr-0.5" />
                        {item.repeat}
                      </span>
                    )}

                    {item.reminders && (
                      <Bell className="w-3 h-3 text-amber-500 shrink-0" title="Reminder active" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

