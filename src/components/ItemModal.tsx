import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Tag, Folder, AlertCircle, Bell, Repeat, Calendar, Clock, Palette, ListTodo } from 'lucide-react';
import { PlannerItem, ItemType, PriorityLevel, RecurrenceType, ColorThemeId, ChecklistItem, Project } from '../types';
import { COLOR_THEMES, COLOR_OPTIONS } from '../data/colors';
import { parseInlineMetadata } from '../utils/parser';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PlannerItem) => void;
  onDelete?: (itemId: string) => void;
  initialItem?: Partial<PlannerItem>;
  projects: Project[];
  defaultDate?: string;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialItem,
  projects,
  defaultDate,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<ItemType>(initialItem?.type || 'task');
  const [titleInput, setTitleInput] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [color, setColor] = useState<ColorThemeId>(initialItem?.color || 'indigo');
  const [tags, setTags] = useState<string[]>(initialItem?.tags || []);
  const [project, setProject] = useState<string>(initialItem?.project || '');
  const [priority, setPriority] = useState<PriorityLevel>(initialItem?.priority || 'none');
  const [date, setDate] = useState<string>(initialItem?.date || defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>(initialItem?.startTime || '09:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialItem?.durationMinutes || 30);
  const [repeat, setRepeat] = useState<RecurrenceType>(initialItem?.repeat || 'none');
  const [reminders, setReminders] = useState<boolean>(initialItem?.reminders ?? true);
  const [isDone, setIsDone] = useState<boolean>(initialItem?.isDone ?? false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialItem?.checklist || []);

  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Auto-parse @tag and #project when titleInput changes
  useEffect(() => {
    if (titleInput) {
      const parsed = parseInlineMetadata(titleInput);
      if (parsed.tags.length > 0) {
        setTags((prev) => Array.from(new Set([...prev, ...parsed.tags])));
      }
      if (parsed.project) {
        setProject(parsed.project);
      }
    }
  }, [titleInput]);

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'chk-' + Date.now() + Math.random().toString(36).substring(2, 5),
      text: newSubtaskText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setChecklist(
      checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const tagClean = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');
    if (tagClean && !tags.includes(tagClean)) {
      setTags([...tags, tagClean]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const parsed = parseInlineMetadata(titleInput);
    const finalTitle = parsed.cleanTitle || titleInput.trim();

    const itemToSave: PlannerItem = {
      id: initialItem?.id || 'item-' + Date.now(),
      type,
      title: finalTitle,
      description: description.trim(),
      checklist,
      color,
      tags,
      project: project.trim().toLowerCase() || undefined,
      priority,
      date,
      startTime,
      durationMinutes: Number(durationMinutes) || 30,
      repeat,
      reminders,
      isDone,
      createdAt: initialItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType('task')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  type === 'task' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Task
              </button>
              <button
                type="button"
                onClick={() => setType('event')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  type === 'event' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Event
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {initialItem?.id ? 'Edit Planner Item' : 'New Planner Item'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Inline parsing tip */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-800">Title</label>
              <span className="text-[10px] text-indigo-600 font-medium">
                Tip: type @tag or #project inline
              </span>
            </div>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Product Strategy Meeting @design #work"
              id="modal-title-input"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes, agenda, or link resources..."
              rows={2}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
              >
                <option value={10}>10 mins (1 Block)</option>
                <option value={20}>20 mins (2 Blocks)</option>
                <option value={30}>30 mins (3 Blocks)</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour (6 Blocks)</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>

          {/* Color Theme Selector (10 Colors) */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-indigo-600" /> UI Color Theme (10 Options)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const theme = COLOR_THEMES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
                      color === c
                        ? `${theme.bgDark} text-white border-transparent shadow-sm ring-2 ${theme.accent}`
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${color === c ? 'bg-white' : theme.dotBg}`} />
                    <span>{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-indigo-600" /> Linked Project (#)
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    #{p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-600" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
              >
                <option value="none">No Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Tags (@) Builder */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-600" /> Tags (@)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200/60"
                >
                  @{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-indigo-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add tag e.g. health, review..."
                className="flex-1 p-2 text-xs border border-slate-200 rounded-xl bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Checklist Builder */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
              <ListTodo className="w-3.5 h-3.5 text-indigo-600" /> Checklist Sub-items
            </label>
            <div className="space-y-1.5 mb-2">
              {checklist.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={`text-xs text-slate-800 ${
                        sub.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {sub.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Add subtask step..."
                className="flex-1 p-2 text-xs border border-slate-200 rounded-xl bg-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                + Step
              </button>
            </div>
          </div>

          {/* Repeat & Reminders & Completion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-indigo-600" /> Repeat
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RecurrenceType)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 pt-5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders}
                  onChange={(e) => setReminders(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Reminder Alert</span>
              </label>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 pt-5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={(e) => setIsDone(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Completed</span>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {initialItem?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this planner item?')) {
                    onDelete(initialItem.id!);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Item</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="modal-save-btn"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all"
              >
                Save Planner Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
