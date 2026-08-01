import React, { useState, useEffect, useMemo } from 'react';
import { PlannerItem, Project, ViewMode, PriorityLevel, ColorThemeId } from './types';
import {
  loadItems,
  saveItems,
  loadProjects,
  saveProjects,
  loadViewMode,
  saveViewMode,
  resetPlannerData,
  getSavedPin,
  isSessionAuthenticated,
  setSessionAuthenticated,
} from './utils/storage';
import { getTodayISO, filterItemsForDate, BlockStatus } from './utils/time';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { TimelineView } from './components/TimelineView';
import { BlocksView } from './components/BlocksView';
import { ProjectView } from './components/ProjectView';
import { ItemModal } from './components/ItemModal';
import { BlockDetailModal } from './components/BlockDetailModal';
import { PinLockScreen } from './components/PinLockScreen';
import { SettingsModal } from './components/SettingsModal';
import { NotificationBanner } from './components/NotificationBanner';
import { NotificationPromptBanner } from './components/NotificationPromptBanner';
import {
  ActiveReminder,
  checkUpcomingReminders,
  snoozeReminder,
  triggerReminderAlert,
  requestNotificationPermission,
} from './utils/notifications';

export default function App() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getTodayISO());
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  // PIN & Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinLockMode, setPinLockMode] = useState<'setup' | 'unlock' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Active Reminders Toast Banner State
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PlannerItem> | undefined>(undefined);
  const [selectedBlock, setSelectedBlock] = useState<BlockStatus | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // In-App Reminder Handler
  const handleInAppReminder = (newReminder: ActiveReminder) => {
    setActiveReminders((prev) => {
      // Don't duplicate if already present
      if (prev.some((r) => r.id === newReminder.id || (r.itemId === newReminder.itemId && Math.abs(r.triggerTime - newReminder.triggerTime) < 5000))) {
        return prev;
      }
      return [...prev, newReminder];
    });
  };

  const handleDismissReminder = (reminderId: string) => {
    setActiveReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const handleSnoozeReminder = (itemId: string, reminderId: string) => {
    snoozeReminder(itemId, 5);
    setActiveReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const handleTestNotification = () => {
    const dummyItem: PlannerItem = {
      id: `test_${Date.now()}`,
      title: 'Sample Task Starting Soon',
      date: getTodayISO(),
      startTime: '15:00',
      durationMinutes: 30,
      type: 'task',
      priority: 'high',
      isDone: false,
      color: 'indigo',
      tags: ['Test'],
      checklist: [],
      repeat: 'none',
      reminders: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    triggerReminderAlert(dummyItem, projects[0], handleInAppReminder);
  };

  // Initialize data & check PIN on mount
  useEffect(() => {
    const loadedItems = loadItems();
    const loadedProjs = loadProjects();
    const loadedView = loadViewMode();

    setItems(loadedItems);
    setProjects(loadedProjs);
    setViewMode(loadedView);

    if (loadedProjs.length > 0) {
      setSelectedProjectId(loadedProjs[0].id);
    }

    const savedPin = getSavedPin();
    const authed = isSessionAuthenticated();

    if (!savedPin) {
      setPinLockMode('setup');
      setIsAuthenticated(false);
    } else if (!authed) {
      setPinLockMode('unlock');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      setPinLockMode(null);
    }
  }, []);

  // Request Notification permission on first unlock/interaction if default
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        requestNotificationPermission();
      }
    }
  }, [isAuthenticated]);

  // Periodic Reminder Engine (Runs every 15 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Run initial check immediately
    checkUpcomingReminders(items, projects, handleInAppReminder);

    // Set up 15-second loop
    const interval = setInterval(() => {
      checkUpcomingReminders(items, projects, handleInAppReminder);
    }, 15000);

    return () => clearInterval(interval);
  }, [items, projects, isAuthenticated]);

  const handleUnlockSuccess = () => {
    setIsAuthenticated(true);
    setPinLockMode(null);
  };

  const handleLockApp = () => {
    setSessionAuthenticated(false);
    setIsAuthenticated(false);
    setPinLockMode('unlock');
  };

  // Sync viewMode changes to storage
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  // Collect all unique tags across items for FilterBar
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    items.forEach((item) => {
      item.tags.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [items]);

  // Filter items for the selected Date
  const dateItems = useMemo(() => {
    return filterItemsForDate(items, currentDate);
  }, [items, currentDate]);

  // Apply search & dropdown filters to dateItems for Timeline and Blocks views
  const filteredDateItems = useMemo(() => {
    return dateItems.filter((item) => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q) || false;
        const matchesProject = item.project?.toLowerCase().includes(q) || false;
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDesc && !matchesProject && !matchesTag) {
          return false;
        }
      }

      // Priority Filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      // Tag Filter
      if (selectedTag !== 'all' && !item.tags.includes(selectedTag)) {
        return false;
      }

      // Status Filter
      if (statusFilter === 'active' && item.isDone) return false;
      if (statusFilter === 'completed' && !item.isDone) return false;

      return true;
    });
  }, [dateItems, searchQuery, selectedPriority, selectedTag, statusFilter]);

  // Stats calculation for current date
  const completedCount = dateItems.filter((i) => i.isDone).length;
  const totalCount = dateItems.length;

  // Handlers for Items
  const handleSaveItem = (itemToSave: PlannerItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === itemToSave.id);
      let updated: PlannerItem[];
      if (exists) {
        updated = prev.map((i) => (i.id === itemToSave.id ? itemToSave : i));
      } else {
        updated = [itemToSave, ...prev];
      }
      saveItems(updated);
      return updated;
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      saveItems(updated);
      return updated;
    });
  };

  const handleToggleDone = (itemId: string) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            isDone: !i.isDone,
            updatedAt: new Date().toISOString(),
          };
        }
        return i;
      });
      saveItems(updated);
      return updated;
    });
  };

  // Handlers for Projects
  const handleAddProject = (name: string, color: ColorThemeId, description?: string) => {
    const newProj: Project = {
      id: name,
      name,
      color,
      description,
    };
    setProjects((prev) => {
      if (prev.some((p) => p.name === name)) return prev;
      const updated = [...prev, newProj];
      saveProjects(updated);
      return updated;
    });
  };

  // Reset sample data
  const handleResetData = () => {
    if (confirm('Reset planner data to default sample tasks and projects?')) {
      const { items: newItems, projects: newProjs } = resetPlannerData();
      setItems(newItems);
      setProjects(newProjs);
      setCurrentDate(getTodayISO());
      if (newProjs.length > 0) {
        setSelectedProjectId(newProjs[0].id);
      }
    }
  };

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingItem({
      date: currentDate,
      startTime: '09:00',
      durationMinutes: 30,
      color: 'indigo',
      type: 'task',
      priority: 'none',
      repeat: 'none',
      reminders: true,
      isDone: false,
      checklist: [],
      tags: [],
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: PlannerItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleQuickAddAtHour = (hourOrTime: number | string) => {
    const timeStr = typeof hourOrTime === 'number'
      ? `${String(hourOrTime).padStart(2, '0')}:00`
      : hourOrTime;
    setEditingItem({
      date: currentDate,
      startTime: timeStr,
      durationMinutes: 30,
      color: 'indigo',
      type: 'task',
      priority: 'none',
      repeat: 'none',
      reminders: true,
      isDone: false,
      checklist: [],
      tags: [],
    });
    setIsModalOpen(true);
  };

  const handleQuickScheduleAtBlock = (timeStr: string) => {
    setEditingItem({
      date: currentDate,
      startTime: timeStr,
      durationMinutes: 20,
      color: 'indigo',
      type: 'task',
      priority: 'none',
      repeat: 'none',
      reminders: true,
      isDone: false,
      checklist: [],
      tags: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenCreateModalWithProject = (projectName: string) => {
    setEditingItem({
      date: currentDate,
      startTime: '10:00',
      durationMinutes: 60,
      project: projectName,
      color: 'indigo',
      type: 'task',
      priority: 'none',
      repeat: 'none',
      reminders: true,
      isDone: false,
      checklist: [],
      tags: [],
    });
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedTag('all');
    setStatusFilter('all');
  };

  if (!isAuthenticated && pinLockMode) {
    return (
      <PinLockScreen
        mode={pinLockMode}
        onUnlocked={handleUnlockSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans flex flex-col">
      {/* Explicit Permission & Sound Prompt Banner */}
      <NotificationPromptBanner />

      {/* 5-Minute In-App Active Reminder Toast Banner */}
      <NotificationBanner
        reminders={activeReminders}
        onDismiss={handleDismissReminder}
        onSnooze={handleSnoozeReminder}
      />

      {/* Lock Screen if manually locked or unauthenticated */}
      {!isAuthenticated && pinLockMode && (
        <PinLockScreen
          mode={pinLockMode}
          onUnlocked={handleUnlockSuccess}
        />
      )}

      {/* Navigation Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewChange={handleViewChange}
        onOpenCreateModal={handleOpenCreateModal}
        onResetData={handleResetData}
        completedCount={completedCount}
        totalCount={totalCount}
        onLockApp={handleLockApp}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        allTags={allTags}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content Area depending on viewMode */}
      <main className="flex-1 pb-16">
        {viewMode === 'timeline' && (
          <TimelineView
            items={filteredDateItems}
            currentDate={currentDate}
            onToggleDone={handleToggleDone}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onQuickAddAtHour={handleQuickAddAtHour}
            onOpenCreateModal={handleOpenCreateModal}
          />
        )}

        {viewMode === 'blocks' && (
          <BlocksView
            items={filteredDateItems}
            currentDate={currentDate}
            onSelectBlock={(block) => setSelectedBlock(block)}
            onOpenCreateModal={handleOpenCreateModal}
          />
        )}

        {viewMode === 'project' && (
          <ProjectView
            projects={projects}
            items={items}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAddProject={handleAddProject}
            onToggleDone={handleToggleDone}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onOpenCreateModalWithProject={handleOpenCreateModalWithProject}
          />
        )}
      </main>

      {/* Create / Edit Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        initialItem={editingItem}
        projects={projects}
        defaultDate={currentDate}
      />

      {/* 10-Min Block Detail Popover Modal */}
      <BlockDetailModal
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onToggleDone={handleToggleDone}
        onEditItem={handleEditItem}
        onQuickScheduleAtBlock={handleQuickScheduleAtBlock}
      />

      {/* App Settings & PIN Security Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLockApp={handleLockApp}
        onResetData={handleResetData}
        onTestNotification={handleTestNotification}
      />
    </div>
  );
}
