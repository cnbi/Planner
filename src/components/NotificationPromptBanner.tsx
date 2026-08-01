import React, { useState } from 'react';
import { Bell, Volume2, CheckCircle2, X } from 'lucide-react';
import { requestNotificationPermission, isNotificationGranted } from '../utils/notifications';

export const NotificationPromptBanner: React.FC = () => {
  const [isGranted, setIsGranted] = useState<boolean>(() => isNotificationGranted());
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isGranted || isDismissed) return null;

  const handleEnable = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      setIsGranted(true);
    } else {
      setIsDismissed(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-4 py-2.5 shadow-md border-b border-indigo-500/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="font-bold text-indigo-200">
              Enable Notifications & Sounds for 5m Reminders:
            </span>{' '}
            <span className="text-slate-300">
              Get desktop push alerts, audio chimes, and mobile vibration before scheduled tasks start.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleEnable}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Enable Alerts & Sound</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
