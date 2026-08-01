import { PlannerItem, Project, ViewMode } from '../types';
import { DEFAULT_PROJECTS, getInitialItems } from '../data/initialData';

const ITEMS_STORAGE_KEY = 'daily_planner_items_v1';
const PROJECTS_STORAGE_KEY = 'daily_planner_projects_v1';
const VIEW_STORAGE_KEY = 'daily_planner_view_v1';

export function loadItems(): PlannerItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialItems();
      saveItems(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load items from localStorage:', err);
    return getInitialItems();
  }
}

export function saveItems(items: PlannerItem[]): void {
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage:', err);
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

export function loadViewMode(): ViewMode {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    if (raw === 'timeline' || raw === 'blocks' || raw === 'project') {
      return raw;
    }
    return 'timeline';
  } catch {
    return 'timeline';
  }
}

export function saveViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch (err) {
    console.error('Failed to save view mode:', err);
  }
}

export function resetPlannerData(): { items: PlannerItem[]; projects: Project[] } {
  const initialItems = getInitialItems();
  saveItems(initialItems);
  saveProjects(DEFAULT_PROJECTS);
  return { items: initialItems, projects: DEFAULT_PROJECTS };
}
