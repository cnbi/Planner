import React, { useState } from 'react';
import { X, KeyRound, Lock, RotateCcw, Shield, CheckCircle2, AlertCircle, Bell, Volume2, Smartphone } from 'lucide-react';
import { getSavedPin, savePin } from '../utils/storage';
import { requestNotificationPermission, isNotificationGranted } from '../utils/notifications';
import { playNotificationChime } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockApp: () => void;
  onResetData: () => void;
  onTestNotification?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLockApp,
  onResetData,
  onTestNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'data'>('security');
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Change PIN State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    const savedPin = getSavedPin();

    if (savedPin && currentPinInput !== savedPin) {
      setPinError('Current PIN is incorrect.');
      return;
    }

    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinError('New PIN must be exactly 4 numeric digits.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('New PINs do not match.');
      return;
    }

    savePin(newPinInput);
    setPinSuccess('PIN changed successfully!');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">App Settings</h3>
              <p className="text-xs text-slate-500">Security, Reminders & PWA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-3 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 pb-3 px-1 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>5m Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 pb-3 px-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'data'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Data</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change PIN Form */}
              <form onSubmit={handleChangePinSubmit} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Change 4-Digit Security PIN
                </h4>

                {pinError && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {pinSuccess && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{pinSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full p-2.5 text-center text-lg tracking-widest font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full p-2.5 text-center text-lg tracking-widest font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full p-2.5 text-center text-lg tracking-widest font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Update PIN
                </button>
              </form>

              {/* Lock App Quick Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Lock Application Now</div>
                  <div className="text-[11px] text-slate-500">Requires PIN on return</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLockApp();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Now</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    Automatic 5-Minute Pre-Alerts
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      notifPermission === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {notifPermission === 'granted' ? 'Enabled' : notifPermission}
                  </span>
                </div>
                <p className="text-xs text-indigo-900/80 leading-relaxed">
                  The planner automatically calculates and triggers reminders <strong>5 minutes before</strong> the start time of every scheduled event in Timeline, Blocks, and Projects.
                </p>
              </div>

              {/* Request Permission Button */}
              {notifPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enable Browser Notifications</span>
                </button>
              )}

              {/* Sound & Alert Test Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h5 className="text-xs font-bold text-slate-800">Alert Feedback & Testing</h5>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => playNotificationChime()}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test Audio Chime</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onTestNotification) {
                        onTestNotification();
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-all"
                  >
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test 5m Alert Toast</span>
                  </button>
                </div>
              </div>

              {/* PWA Information */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-slate-600">
                <Smartphone className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong>Mobile & PWA Ready:</strong> Includes Service Worker and Web Manifest for Home Screen installation and background alerts.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  Reset Planner Sample Data
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  This will restore the default sample projects, timeline items, and tasks.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset planner data to default initial samples?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Reset Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

