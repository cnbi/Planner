import React from 'react';
import { Bell, Clock, Folder, Volume2, X, RotateCcw, Check } from 'lucide-react';
import { ActiveReminder, snoozeReminder } from '../utils/notifications';

interface NotificationBannerProps {
  reminders: ActiveReminder[];
  onDismiss: (reminderId: string) => void;
  onSnooze: (itemId: string, reminderId: string) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  reminders,
  onDismiss,
  onSnooze,
}) => {
  if (reminders.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 flex flex-col gap-2.5 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      {reminders.map((rem) => (
        <div
          key={rem.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-indigo-500/40 flex flex-col gap-3 ring-4 ring-indigo-500/10"
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30 animate-pulse">
                <Bell className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Starts in 5 minutes
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    Chime Played
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                  {rem.itemTitle}
                </h4>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1 font-semibold text-indigo-300">
                    <Clock className="w-3.5 h-3.5" />
                    {rem.formattedTime}
                  </span>

                  {rem.projectName && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Folder className="w-3.5 h-3.5 text-slate-400" />
                      #{rem.projectName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dismiss Close Icon */}
            <button
              type="button"
              onClick={() => onDismiss(rem.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onSnooze(rem.itemId, rem.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Snooze 5m</span>
            </button>

            <button
              type="button"
              onClick={() => onDismiss(rem.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
