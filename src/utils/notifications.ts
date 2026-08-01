import { PlannerItem, Project } from '../types';
import { playNotificationChime, unlockAudioContext } from './audio';
import { timeToMinutes, getTodayISO, filterItemsForDate } from './time';

export interface ActiveReminder {
  id: string; // unique reminder session ID
  itemId: string;
  itemTitle: string;
  startTime: string;
  formattedTime: string;
  projectName?: string;
  projectColorHex?: string;
  triggerTime: number; // timestamp
}

// Track triggered reminder keys to avoid duplicate alerts (e.g., "item-123_2026-08-01_14:25")
const triggeredReminderKeys = new Set<string>();

// Track snoozed reminders { itemId -> timestamp when snooze expires }
const snoozedItems = new Map<string, number>();

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register Service Worker for PWA and push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      swRegistration = reg;
      console.log('Service Worker registered successfully:', reg.scope);
      return reg;
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
      return null;
    }
  }
  return null;
}

/**
 * Request notification permissions from user AND pre-unlock AudioContext for background sounds
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  // Always pre-unlock Audio Context on this user gesture
  unlockAudioContext();

  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Check if notifications are supported and granted
 */
export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Fire an alert (Visual + Audio + Haptic) for a given item
 */
export function triggerReminderAlert(
  item: PlannerItem,
  project?: Project,
  onInAppReminder?: (reminder: ActiveReminder) => void
): void {
  const formattedTime = item.startTime;
  const projectTitle = project ? project.name : item.project || 'General';

  // 1. Play Audio Chime
  playNotificationChime();

  // 2. Trigger Haptic Vibration for Mobile
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // Ignore if not supported or disabled
    }
  }

  const reminderObj: ActiveReminder = {
    id: `${item.id}_${Date.now()}`,
    itemId: item.id,
    itemTitle: item.title,
    startTime: item.startTime,
    formattedTime,
    projectName: projectTitle,
    projectColorHex: project ? project.color : undefined,
    triggerTime: Date.now(),
  };

  const notificationTitle = `⏰ Starting in 5 Minutes: ${item.title}`;
  const notificationBody = `Scheduled for ${item.startTime} • Project: ${projectTitle}`;

  // 3. Trigger Native / SW Notification if allowed
  if (isNotificationGranted()) {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({
        type: 'TRIGGER_REMINDER',
        title: notificationTitle,
        body: notificationBody,
        tag: `reminder-${item.id}`,
      });
    } else {
      try {
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/favicon.ico',
          tag: `reminder-${item.id}`,
        });
      } catch (err) {
        console.warn('Fallback Notification constructor failed:', err);
      }
    }
  }

  // 4. Trigger In-App Banner / Toast Fallback
  if (onInAppReminder) {
    onInAppReminder(reminderObj);
  }
}

/**
 * Main Check Engine:
 * Runs periodically to inspect all planner items and trigger alert exactly 5 minutes before start time.
 */
export function checkUpcomingReminders(
  items: PlannerItem[],
  projects: Project[],
  onInAppReminder: (reminder: ActiveReminder) => void
): void {
  const now = new Date();
  const todayISO = getTodayISO();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeMs = now.getTime();

  items.forEach((item) => {
    // Only process items that have reminders enabled and are not completed
    if (item.isDone || item.reminders === false) return;

    // Check if the item occurs today
    const occursToday = filterItemsForDate([item], todayISO).length > 0;
    if (!occursToday) return;

    const startMins = timeToMinutes(item.startTime);
    // Alert target: exactly 5 minutes before start time
    const alertTargetMins = startMins - 5;

    // If current time is within 1 minute window of target time
    const minutesDiff = currentMinutes - alertTargetMins;

    const reminderKey = `reminder_${item.id}_${todayISO}_${alertTargetMins}`;

    // Check if snoozed
    const snoozeUntil = snoozedItems.get(item.id);
    if (snoozeUntil && currentTimeMs < snoozeUntil) {
      return; // Still in snooze period
    }

    // Trigger if we are at or 1 min past the 5-min alert time and haven't triggered this key yet
    if (minutesDiff >= 0 && minutesDiff <= 1) {
      if (!triggeredReminderKeys.has(reminderKey)) {
        triggeredReminderKeys.add(reminderKey);

        const project = projects.find((p) => p.name === item.project || p.id === item.project);
        triggerReminderAlert(item, project, onInAppReminder);
      }
    }
  });
}

/**
 * Snooze a reminder for X minutes (default 5 minutes)
 */
export function snoozeReminder(itemId: string, minutes: number = 5): void {
  const snoozeUntil = Date.now() + minutes * 60 * 1000;
  snoozedItems.set(itemId, snoozeUntil);
}

