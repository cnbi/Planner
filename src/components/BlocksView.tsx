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
  const dayBlocks = calculateBlocksForDay(items);

  // Stats calculation
  const totalBlocks = 24 * 6; // 144 blocks
  let filledBlocksCount = 0;
  let completedBlocksCount = 0;

  dayBlocks.forEach((hourBlocks) => {
    hourBlocks.forEach((block) => {
      if (block.state !== 'empty') {
        filledBlocksCount++;
        if (block.state === 'completed') {
          completedBlocksCount++;
        }
      }
    });
  });

  const scheduledMins = filledBlocksCount * 10;
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
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-xs" />
            <span>Filled (Scheduled)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 bg-indigo-100/60" />
            <span>Half-Filled (Active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300" />
            <span>Empty (Free Time)</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayBlocks.map((hourBlocks, hour) => {
            const hourLabel = getHourLabel(hour);
            const activeInHour = hourBlocks.filter((b) => b.state !== 'empty').length;

            return (
              <div
                key={hour}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
              >
                {/* Hour Label */}
                <div className="w-20 shrink-0">
                  <span className="text-xs font-bold text-slate-700">{hourLabel}</span>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {activeInHour * 10}m active
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

                    let circleStyle = 'bg-slate-200/90 border-slate-300 hover:scale-110';
                    let inlineBg = '';

                    if (block.state === 'completed' && theme) {
                      circleStyle = `${theme.dotBg} text-white shadow-xs hover:scale-110`;
                    } else if (block.state === 'active' && theme) {
                      circleStyle = `border-2 ${theme.border} ${theme.bgLight} hover:scale-110`;
                    } else if (block.state === 'partial' && theme) {
                      circleStyle = `border-2 ${theme.border} bg-white hover:scale-110`;
                    }

                    return (
                      <button
                        key={block.blockIndex}
                        onClick={() => onSelectBlock(block)}
                        className={`relative group/circle w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${circleStyle}`}
                        title={`${getHourLabel(hour)} ${blockMinuteText} ${
                          primary ? `— ${primary.title}` : '(Free Block)'
                        }`}
                      >
                        {/* Circle Label / Minute mark */}
                        <span className="text-[9px] opacity-75 font-mono">
                          {block.blockIndex * 10}
                        </span>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/circle:flex flex-col items-center z-30 pointer-events-none">
                          <div className="bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg">
                            {getHourLabel(hour)} ({blockMinuteText})
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
