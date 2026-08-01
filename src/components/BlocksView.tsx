import React from 'react';
import { LayoutGrid, Info, Plus, CheckCircle2 } from 'lucide-react';
import { PlannerItem } from '../types';
import { COLOR_THEMES } from '../data/colors';
import { calculateBlocksForDay, getHourLabel, BlockStatus } from '../utils/time';

interface BlocksViewProps {
  items: PlannerItem[];
  currentDate: string;
  onSelectBlock: (block: BlockStatus) => void;
  onOpenCreateModal: () => void;
}

export const BlocksView: React.FC<BlocksViewProps> = ({
  items,
  currentDate,
  onSelectBlock,
  onOpenCreateModal,
}) => {
  const dayBlocks = calculateBlocksForDay(items, currentDate);

  // Stats calculation
  const totalBlocks = 24 * 6; // 144 blocks
  let filledBlocksCount = 0;
  let happeningBlocksCount = 0;
  let freeBlocksCount = 0;

  dayBlocks.forEach((hourBlocks) => {
    hourBlocks.forEach((block) => {
      if (block.state === 'filled') {
        filledBlocksCount++;
      } else if (block.state === 'half') {
        happeningBlocksCount++;
      } else {
        freeBlocksCount++;
      }
    });
  });

  const scheduledMins = (filledBlocksCount + happeningBlocksCount) * 10;
  const hoursScheduled = (scheduledMins / 60).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto py-6 px-3 sm:px-6">
      {/* View Header & Legend */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            10-Minute Blocks Grid (24-Hour View)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Each row represents 1 hour divided into 6 x 10-minute circles (:00, :10, :20, :30, :40, :50).
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5" title="Block that already happened">
            <div className="w-4 h-4 rounded-full bg-slate-700 shadow-2xs flex items-center justify-center text-[9px] text-white font-bold">✓</div>
            <span>Filled (Already Happened)</span>
          </div>
          <div className="flex items-center gap-1.5" title="Block that is happening right now">
            <div className="w-4 h-4 rounded-full bg-[linear-gradient(90deg,#4f46e5_50%,#e2e8f0_50%)] border border-indigo-600 ring-2 ring-indigo-400/40" />
            <span>Half-Filled (Happening Now)</span>
          </div>
          <div className="flex items-center gap-1.5" title="Block that is free time">
            <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-300" />
            <span>Empty (Free Time)</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
        {/* New Day Marker Header */}
        <div className="mb-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 p-3 rounded-xl border border-indigo-200/80">
          <span className="text-lg">🌅</span>
          <div>
            <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              New Day Starts — 00:00 (12:00 AM Midnight)
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Showing all 24 hours of the day (00:00 to 23:00) with 6 x 10-minute blocks per hour
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayBlocks.map((hourBlocks, hour) => {
            const hourLabel = getHourLabel(hour);
            const hour24Str = `${String(hour).padStart(2, '0')}:00`;
            const isNewDayHour = hour === 0;
            const filledInHour = hourBlocks.filter((b) => b.state === 'filled' || b.state === 'half').length;

            return (
              <div
                key={hour}
                className={`relative flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isNewDayHour
                    ? 'border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50/70 ring-1 ring-indigo-200/80'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                {/* New Day Badge inside 00:00 card */}
                {isNewDayHour && (
                  <span className="absolute -top-2.5 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                    🌅 Midnight / Start
                  </span>
                )}

                {/* Hour Label */}
                <div className="w-24 shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-extrabold text-slate-800">{hour24Str}</span>
                    <span className="text-[10px] font-semibold text-slate-500">({hourLabel})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {filledInHour * 10}m active
                  </div>
                </div>

                {/* 6 Circles for 10-minute blocks */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {hourBlocks.map((block) => {
                    const blockMinuteText = `:${String(block.blockIndex * 10).padStart(2, '0')}`;
                    const primary = block.primaryItem;
                    const theme = primary
                      ? COLOR_THEMES[primary.color] || COLOR_THEMES.blue
                      : null;

                    let circleStyle = 'bg-slate-100 border border-slate-300 text-slate-500 hover:scale-110';
                    let circleContent = (
                      <span className="text-[9px] font-mono opacity-80">
                        {block.blockIndex * 10}
                      </span>
                    );

                    if (block.state === 'filled') {
                      // Block already happened
                      if (theme) {
                        circleStyle = `${theme.bgDark} text-white shadow-xs hover:scale-110`;
                      } else {
                        circleStyle = `bg-slate-500 border border-slate-600 text-white shadow-2xs hover:scale-110`;
                      }
                      circleContent = (
                        <span className="text-[9px] font-bold">
                          {block.primaryItem?.isDone ? '✓' : block.blockIndex * 10}
                        </span>
                      );
                    } else if (block.state === 'half') {
                      // Block is happening right now -> Half-filled circle
                      const hexColor = theme ? theme.hex : '#4f46e5';
                      circleStyle = `border-2 border-indigo-600 ring-2 ring-indigo-500/50 ring-offset-1 hover:scale-110 text-slate-900 font-bold shadow-sm`;
                    } else if (block.state === 'empty') {
                      // Free time / Future block
                      if (theme) {
                        circleStyle = `border-2 ${theme.border} bg-white text-slate-700 hover:scale-110`;
                      } else {
                        circleStyle = `bg-slate-50 border border-slate-300 text-slate-400 hover:bg-slate-100 hover:scale-110`;
                      }
                    }

                    return (
                      <button
                        key={block.blockIndex}
                        onClick={() => onSelectBlock(block)}
                        style={
                          block.state === 'half'
                            ? {
                                background: `linear-gradient(90deg, ${
                                  theme ? theme.hex : '#4f46e5'
                                } 50%, #f1f5f9 50%)`,
                              }
                            : undefined
                        }
                        className={`relative group/circle w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${circleStyle}`}
                        title={`${getHourLabel(hour)} ${blockMinuteText} ${
                          block.state === 'filled'
                            ? '(Already Happened)'
                            : block.state === 'half'
                            ? '(Happening Now)'
                            : '(Free Time)'
                        } ${primary ? `— ${primary.title}` : ''}`}
                      >
                        {/* Circle Label / Minute mark */}
                        {circleContent}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/circle:flex flex-col items-center z-30 pointer-events-none">
                          <div className="bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg">
                            {getHourLabel(hour)} ({blockMinuteText})
                            <span className="ml-1.5 text-[10px] text-amber-300 font-bold">
                              {block.state === 'filled'
                                ? '• Happened'
                                : block.state === 'half'
                                ? '• Happening Now'
                                : '• Free Time'}
                            </span>
                            {primary && (
                              <div className="text-[10px] font-normal text-slate-300">
                                {primary.title}
                              </div>
                            )}
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Time Summary Bar */}
      <div className="mt-6 bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">
              {hoursScheduled} Hours ({filledBlocksCount * 10} Mins) Scheduled Today
            </div>
            <p className="text-xs text-slate-400">
              {totalBlocks - filledBlocksCount} free 10-minute blocks remaining
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          + Schedule New Block
        </button>
      </div>
    </div>
  );
};
