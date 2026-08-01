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

      const itemDateObj = new Date(item.date);
      const targetDateObj = new Date(dateStr);

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
  state: 'empty' | 'active' | 'completed' | 'partial';
}

/**
 * Calculates status for each 10-minute block of the day (144 total blocks).
 */
export function calculateBlocksForDay(dayItems: PlannerItem[]): BlockStatus[][] {
  const result: BlockStatus[][] = [];

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

      let state: BlockStatus['state'] = 'empty';
      let primaryItem: PlannerItem | undefined = undefined;

      if (overlapping.length > 0) {
        primaryItem = overlapping[0];
        const allCompleted = overlapping.every((i) => i.isDone);
        const anyCompleted = overlapping.some((i) => i.isDone);

        if (allCompleted) {
          state = 'completed';
        } else if (anyCompleted) {
          state = 'partial';
        } else {
          state = 'active';
        }
      }

      hourBlocks.push({
        hour: h,
        blockIndex: b,
        startMinute: blockStart,
        endMinute: blockEnd,
        items: overlapping,
        primaryItem,
        state,
      });
    }

    result.push(hourBlocks);
  }

  return result;
}
