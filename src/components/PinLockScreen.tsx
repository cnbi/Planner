import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, Delete, CheckCircle2 } from 'lucide-react';
import { getSavedPin, savePin, setSessionAuthenticated } from '../utils/storage';

interface PinLockScreenProps {
  mode: 'setup' | 'unlock';
  onUnlocked: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ mode, onUnlocked }) => {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Reset inputs when mode changes
  useEffect(() => {
    setPin('');
    setConfirmPin('');
    setErrorMsg('');
    setSuccessMsg('');
    setSetupStep('create');
  }, [mode]);

  // Handle number input
  const handleNumClick = (num: string) => {
    setErrorMsg('');

    if (mode === 'unlock') {
      if (pin.length < 4) {
        const nextPin = pin + num;
        setPin(nextPin);
        if (nextPin.length === 4) {
          verifyPin(nextPin);
        }
      }
    } else {
      // Setup mode
      if (setupStep === 'create') {
        if (pin.length < 4) {
          const nextPin = pin + num;
          setPin(nextPin);
          if (nextPin.length === 4) {
            setTimeout(() => {
              setSetupStep('confirm');
            }, 200);
          }
        }
      } else {
        // Confirm step
        if (confirmPin.length < 4) {
          const nextConfirm = confirmPin + num;
          setConfirmPin(nextConfirm);
          if (nextConfirm.length === 4) {
            finalizeSetup(pin, nextConfirm);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    if (mode === 'unlock') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (setupStep === 'create') {
        setPin((prev) => prev.slice(0, -1));
      } else {
        setConfirmPin((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleClear = () => {
    setErrorMsg('');
    if (mode === 'unlock') {
      setPin('');
    } else {
      if (setupStep === 'create') {
        setPin('');
      } else {
        setConfirmPin('');
      }
    }
  };

  const verifyPin = (enteredPin: string) => {
    const saved = getSavedPin();
    if (enteredPin === saved) {
      setSessionAuthenticated(true);
      setSuccessMsg('Unlocked!');
      setTimeout(() => {
        onUnlocked();
      }, 250);
    } else {
      setErrorMsg('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setPin('');
      }, 400);
    }
  };

  const finalizeSetup = (firstPin: string, secondPin: string) => {
    if (firstPin === secondPin) {
      savePin(firstPin);
      setSessionAuthenticated(true);
      setSuccessMsg('PIN set successfully!');
      setTimeout(() => {
        onUnlocked();
      }, 300);
    } else {
      setErrorMsg('PINs do not match. Please start again.');
      setTimeout(() => {
        setPin('');
        setConfirmPin('');
        setSetupStep('create');
      }, 800);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumClick(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, confirmPin, setupStep, mode]);

  const currentDigits =
    mode === 'unlock'
      ? pin
      : setupStep === 'create'
      ? pin
      : confirmPin;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
          {mode === 'setup' ? (
            <KeyRound className="w-8 h-8" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl font-bold text-slate-900">
          {mode === 'setup'
            ? setupStep === 'create'
              ? 'Set Up 4-Digit PIN'
              : 'Confirm Your 4-Digit PIN'
            : 'Planner Locked'}
        </h2>

        <p className="text-xs text-slate-500 mt-1 mb-6 max-w-xs">
          {mode === 'setup'
            ? setupStep === 'create'
              ? 'Create a secret 4-digit PIN to keep your planner tasks private.'
              : 'Re-enter your 4-digit PIN to confirm.'
            : 'Enter your 4-digit PIN to access your daily tasks & timeline.'}
        </p>

        {/* 4 Digit Indicators */}
        <div className="flex items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = currentDigits.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-indigo-600 scale-110 shadow-sm'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 animate-bounce">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumClick(num)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 text-slate-800 text-lg font-bold transition-all border border-slate-200/80 shadow-2xs flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={() => handleNumClick('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 text-slate-800 text-lg font-bold transition-all border border-slate-200/80 shadow-2xs flex items-center justify-center"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-slate-600 transition-all border border-slate-200 flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Protected with local PIN authentication</span>
        </div>
      </div>
    </div>
  );
};
