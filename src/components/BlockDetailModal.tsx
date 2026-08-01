import React from 'react';
import { X, Clock, Plus, CheckCircle2, Edit2, Folder, Tag, AlertCircle } from 'lucide-react';
import { PlannerItem } from '../types';
import { BlockStatus, getHourLabel, minutesToTime, formatTime12h } from '../utils/time';
import { COLOR_THEMES } from '../data/colors';

interface BlockDetailModalProps {
  block: BlockStatus | null;
  onClose: () => void;
  onToggleDone: (itemId: string) => void;
  onEditItem: (item: PlannerItem) => void;
  onQuickScheduleAtBlock: (timeStr: string) => void;
}

export const BlockDetailModal: React.FC<BlockDetailModalProps> = ({
  block,
  onClose,
  onToggleDone,
  onEditItem,
  onQuickScheduleAtBlock,
}) => {
  if (!block) return null;

  const startTimeStr = minutesToTime(block.startMinute);
  const endTimeStr = minutesToTime(block.endMinute);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                10-Minute Time Block
              </h3>
              <p className="text-xs font-semibold text-indigo-600">
                {formatTime12h(startTimeStr)} – {formatTime12h(endTimeStr)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {block.items.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled Items ({block.items.length})
              </span>

              {block.items.map((item) => {
                const theme = COLOR_THEMES[item.color] || COLOR_THEMES.blue;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border ${theme.border} ${theme.bgLight} transition-all space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleDone(item.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            item.isDone
                              ? `${theme.bgDark} text-white border-transparent`
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {item.isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${theme.text}`}>
                              {formatTime12h(item.startTime)} ({item.durationMinutes}m)
                            </span>
                          </div>
                          <h4
                            className={`text-sm font-bold text-slate-900 ${
                              item.isDone ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onEditItem(item);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-white/80 rounded-lg border border-slate-200/80"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/40">
                      {item.project && (
                        <span className="text-[10px] font-semibold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
                          <Folder className="w-3 h-3 text-indigo-500" />#{item.project}
                        </span>
                      )}
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />@{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Free Time Block</p>
              <p className="text-xs text-slate-500">
                No tasks or events scheduled between {formatTime12h(startTimeStr)} and{' '}
                {formatTime12h(endTimeStr)}.
              </p>
            </div>
          )}

          {/* Quick Schedule Button */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                onClose();
                onQuickScheduleAtBlock(startTimeStr);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Item Starting at {formatTime12h(startTimeStr)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
