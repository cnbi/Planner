import { PlannerItem } from '../types';

export function getTodayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTitle(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  const todayStr = getTodayISO();
  const isToday = dateStr === todayStr;

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const formatted = dateObj.toLocaleDateString('en-US', options);
  return isToday ? `Today (${formatted})` : formatted;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() + days);

  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, mins] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (mins || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export function getHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

/**
 * Returns all items active on a given date string (YYYY-MM-DD).
 * Takes recurrence into account (daily, weekly, monthly).
 */
export function filterItemsForDate(items: PlannerItem[], dateStr: string): PlannerItem[] {
  return items.filter((item) => {
    if (item.date === dateStr) return true;

    // Check recurrence if date is after creation date
    if (item.date < dateStr) {
      if (item.repeat === 'daily') return true;

      const [iYear, iMonth, iDay] = item.date.split('-').map(Number);
      const [tYear, tMonth, tDay] = dateStr.split('-').map(Number);
      const itemDateObj = new Date(iYear, iMonth - 1, iDay);
      const targetDateObj = new Date(tYear, tMonth - 1, tDay);

      if (item.repeat === 'custom') {
        const interval = item.repeatXDays && item.repeatXDays > 0 ? item.repeatXDays : 1;
        const diffMs = targetDateObj.getTime() - itemDateObj.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % interval === 0;
      }

      if (item.repeat === 'weekly') {
        return itemDateObj.getDay() === targetDateObj.getDay();
      }

      if (item.repeat === 'monthly') {
        return itemDateObj.getDate() === targetDateObj.getDate();
      }
    }

    return false;
  });
}

export interface BlockStatus {
  hour: number; // 0..23
  blockIndex: number; // 0..5 (0: 00-09, 1: 10-19, 2: 20-29, etc)
  startMinute: number;
  endMinute: number;
  items: PlannerItem[];
  primaryItem?: PlannerItem;
  state: 'filled' | 'half' | 'empty';
  hasHappened: boolean;
  isHappening: boolean;
  isFreeTime: boolean;
}

/**
 * Calculates status for each 10-minute block of the day (144 total blocks).
 * Filled: block that already happened
 * Half-filled: block that is happening right now
 * Empty: block that is free time / future
 */
export function calculateBlocksForDay(dayItems: PlannerItem[], currentDateStr?: string): BlockStatus[][] {
  const result: BlockStatus[][] = [];

  const todayISO = getTodayISO();
  const activeDate = currentDateStr || todayISO;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isPastDate = activeDate < todayISO;
  const isFutureDate = activeDate > todayISO;
  const isToday = activeDate === todayISO;

  for (let h = 0; h < 24; h++) {
    const hourBlocks: BlockStatus[] = [];

    for (let b = 0; b < 6; b++) {
      const blockStart = h * 60 + b * 10;
      const blockEnd = blockStart + 10;

      // Find items overlapping this 10-minute block
      const overlapping = dayItems.filter((item) => {
        const itemStart = timeToMinutes(item.startTime);
        const itemEnd = itemStart + (item.durationMinutes || 30);
        return itemStart < blockEnd && itemEnd > blockStart;
      });

      const primaryItem = overlapping.length > 0 ? overlapping[0] : undefined;

      // Temporal block status according to user specification:
      // Filled = block that already happened
      // Half-filled = block that is happening
      // Empty = free time
      let hasHappened = false;
      let isHappening = false;
      let isFreeTime = false;

      if (isPastDate) {
        hasHappened = true;
      } else if (isFutureDate) {
        isFreeTime = true;
      } else {
        // Today
        if (blockEnd <= currentMinutes) {
          hasHappened = true;
        } else if (blockStart <= currentMinutes && currentMinutes < blockEnd) {
          isHappening = true;
        } else {
          isFreeTime = true;
        }
      }

      let state: BlockStatus['state'] = 'empty';
      if (hasHappened) {
        state = 'filled';
      } else if (isHappening) {
        state = 'half';
      } else {
        state = 'empty';
      }

      hourBlocks.push({
        hour: h,
        blockIndex: b,
        startMinute: blockStart,
        endMinute: blockEnd,
        items: overlapping,
        primaryItem,
        state,
        hasHappened,
        isHappening,
        isFreeTime,
      });
    }

    result.push(hourBlocks);
  }

  return result;
}
