export type ItemType = 'task' | 'event';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type ColorThemeId =
  | 'red'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'pink'
  | 'yellow'
  | 'indigo'
  | 'gray';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlannerItem {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  checklist: ChecklistItem[];
  color: ColorThemeId;
  tags: string[];
  project?: string;
  priority: PriorityLevel;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm format, e.g. "09:00" or "14:30"
  durationMinutes: number; // e.g. 10, 30, 60, 120
  repeat: RecurrenceType;
  repeatXDays?: number; // e.g. every 2 days, every 3 days
  reminders: boolean;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'timeline' | 'blocks' | 'project';

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  bgLight: string;
  bgDark: string;
  border: string;
  borderLeft: string;
  text: string;
  dotBg: string;
  accent: string;
  hex: string;
}

export interface Project {
  id: string;
  name: string;
  color: ColorThemeId;
  description?: string;
}
