import React, { useState } from 'react';
import { Folder, FolderPlus, CheckCircle2, Circle, Clock, Tag, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { PlannerItem, Project, ColorThemeId } from '../types';
import { COLOR_THEMES, COLOR_OPTIONS } from '../data/colors';
import { formatTime12h } from '../utils/time';

interface ProjectViewProps {
  projects: Project[];
  items: PlannerItem[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onAddProject: (name: string, color: ColorThemeId, description?: string) => void;
  onToggleDone: (itemId: string) => void;
  onEditItem: (item: PlannerItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenCreateModalWithProject: (projectName: string) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({
  projects,
  items,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onToggleDone,
  onEditItem,
  onDeleteItem,
  onOpenCreateModalWithProject,
}) => {
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState<ColorThemeId>('indigo');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const cleanName = newProjectName.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');
    onAddProject(cleanName, newProjectColor, newProjectDesc.trim());
    setNewProjectName('');
    setNewProjectDesc('');
    setShowNewProjectInput(false);
    onSelectProject(cleanName);
  };

  // Filter items for current selected project
  const projectItems = activeProject
    ? items.filter((item) => item.project?.toLowerCase() === activeProject.name.toLowerCase())
    : [];

  const todoItems = projectItems.filter((i) => !i.isDone);
  const completedItems = projectItems.filter((i) => i.isDone);
  const totalMins = projectItems.reduce((acc, i) => acc + (i.durationMinutes || 0), 0);
  const progressPercent =
    projectItems.length > 0
      ? Math.round((completedItems.length / projectItems.length) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto py-6 px-3 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Projects List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-600" />
                Projects ({projects.length})
              </h3>
              <button
                onClick={() => setShowNewProjectInput(!showNewProjectInput)}
                className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all text-xs font-semibold flex items-center gap-1"
                title="Add New Project"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>

            {/* Create Project Input Form */}
            {showNewProjectInput && (
              <form
                onSubmit={handleCreateProjectSubmit}
                className="mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5"
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Project Tag (#name)
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. fitness, work, design"
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Color Theme
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewProjectColor(c)}
                        className={`w-5 h-5 rounded-full ${COLOR_THEMES[c].dotBg} transition-transform ${
                          newProjectColor === c ? 'scale-125 ring-2 ring-indigo-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectInput(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* List of Projects */}
            <div className="space-y-1.5">
              {projects.map((proj) => {
                const isSelected = activeProject?.id === proj.id;
                const count = items.filter(
                  (i) => i.project?.toLowerCase() === proj.name.toLowerCase()
                ).length;
                const theme = COLOR_THEMES[proj.color] || COLOR_THEMES.indigo;

                return (
                  <button
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${theme.bgLight} ${theme.border} font-bold text-slate-900 shadow-2xs`
                        : 'border-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${theme.dotBg}`} />
                      <span className="text-xs font-semibold truncate">#{proj.name}</span>
                    </div>

                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Dashboard: Dedicated Project Items & Stats */}
        <div className="lg:col-span-3 space-y-6">
          {activeProject ? (
            <>
              {/* Project Header Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        COLOR_THEMES[activeProject.color]?.dotBg || 'bg-indigo-500'
                      }`}
                    />
                    <h2 className="text-lg font-bold text-slate-900">
                      #{activeProject.name} Project
                    </h2>
                  </div>
                  {activeProject.description && (
                    <p className="text-xs text-slate-500">{activeProject.description}</p>
                  )}
                </div>

                {/* Quick Add To Project */}
                <button
                  onClick={() => onOpenCreateModalWithProject(activeProject.name)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task to #{activeProject.name}</span>
                </button>
              </div>

              {/* Progress & Time Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-xs font-medium text-slate-500 block">Total Items</span>
                  <span className="text-xl font-bold text-slate-900">{projectItems.length}</span>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-xl">
                  <span className="text-xs font-medium text-emerald-700 block">Progress</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-bold text-emerald-900">
                      {progressPercent}%
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">
                      ({completedItems.length}/{projectItems.length})
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-xl">
                  <span className="text-xs font-medium text-indigo-700 block">Scheduled Time</span>
                  <span className="text-xl font-bold text-indigo-900">
                    {Math.floor(totalMins / 60)}h {totalMins % 60}m
                  </span>
                </div>
              </div>

              {/* Tasks List: To Do & Completed */}
              <div className="space-y-6">
                {/* To Do Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Circle className="w-3.5 h-3.5 text-amber-500" />
                    To Do ({todoItems.length})
                  </h3>

                  {todoItems.length > 0 ? (
                    <div className="space-y-2">
                      {todoItems.map((item) => (
                        <ProjectItemCard
                          key={item.id}
                          item={item}
                          onToggleDone={onToggleDone}
                          onEditItem={onEditItem}
                          onDeleteItem={onDeleteItem}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-500">
                        No pending tasks for #{activeProject.name}. All caught up!
                      </p>
                    </div>
                  )}
                </div>

                {/* Completed Section */}
                {completedItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed ({completedItems.length})
                    </h3>

                    <div className="space-y-2 opacity-75">
                      {completedItems.map((item) => (
                        <ProjectItemCard
                          key={item.id}
                          item={item}
                          onToggleDone={onToggleDone}
                          onEditItem={onEditItem}
                          onDeleteItem={onDeleteItem}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Folder className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No project selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProjectItemCardProps {
  item: PlannerItem;
  onToggleDone: (itemId: string) => void;
  onEditItem: (item: PlannerItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const ProjectItemCard: React.FC<ProjectItemCardProps> = ({
  item,
  onToggleDone,
  onEditItem,
  onDeleteItem,
}) => {
  const theme = COLOR_THEMES[item.color] || COLOR_THEMES.blue;

  return (
    <div
      onClick={() => onEditItem(item)}
      className={`flex items-start justify-between p-3.5 rounded-r-xl rounded-l-xs ${theme.borderLeft} ${theme.bgLight} transition-all cursor-pointer hover:shadow-xs`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(item.id);
          }}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
            item.isDone
              ? `${theme.bgDark} text-white border-transparent`
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {item.isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${theme.text}`}>
              {item.date} • {formatTime12h(item.startTime)}
            </span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-700">
              {item.type}
            </span>
          </div>

          <h4
            className={`text-sm font-semibold text-slate-900 ${
              item.isDone ? 'line-through text-slate-500' : ''
            }`}
          >
            {item.title}
          </h4>

          {item.description && (
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{item.description}</p>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-medium text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200"
                >
                  @{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditItem(item);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg"
          title="Edit Item"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item.id);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          title="Delete Item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
