import React, { useState } from 'react';
import {
  Clock,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Pause,
  Sparkles,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ScheduledTask } from '../types';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface ScheduledViewProps {
  tasks: ScheduledTask[];
  onAddTask: (task: ScheduledTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onTriggerTask: (id: string) => Promise<void>;
  isDark: boolean;
}

export function ScheduledView({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onTriggerTask,
  isDark,
}: ScheduledViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [viewResultTaskId, setViewResultTaskId] = useState<string | null>(null);

  // New task form state
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [frequency, setFrequency] = useState('Daily at 9:00 AM');
  const [category, setCategory] = useState('Productivity');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;

    const newTask: ScheduledTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      prompt: prompt.trim(),
      frequency,
      category,
      active: true,
    };
    onAddTask(newTask);
    setTitle('');
    setPrompt('');
    setIsCreating(false);
  };

  const handleRunNow = async (id: string) => {
    setRunningTaskId(id);
    try {
      await onTriggerTask(id);
      setViewResultTaskId(id);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningTaskId(null);
    }
  };

  const activeTaskResult = tasks.find((t) => t.id === viewResultTaskId);

  return (
    <div
      className={`flex flex-1 flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 transition-colors ${
        isDark ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#ffffff] text-[#1f1f1f]'
      }`}
    >
      <div className="mx-auto max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#303134] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#34A853] to-[#4285F4] text-white">
                <Clock className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Scheduled AI Automations</h1>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#9aa0a6]">
              Set up automated recurring queries, daily intelligence briefings, and automated media summaries with Gemini
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-[#4285F4] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3367d6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Scheduled Task</span>
          </button>
        </div>

        {/* Modal / Inline Create Form */}
        {isCreating && (
          <form
            onSubmit={handleCreate}
            className={`rounded-2xl border p-5 shadow-lg space-y-4 animate-in fade-in duration-150 ${
              isDark ? 'border-[#3c4043] bg-[#1e1f20]' : 'border-blue-200 bg-blue-50/40'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-[#303134]">
              <h3 className="text-sm font-semibold">New Scheduled Gemini Job</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9aa0a6] block mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Tech & AI Executive Briefing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none border ${
                    isDark
                      ? 'border-[#3c4043] bg-[#131314] text-white focus:border-[#8ab4f8]'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9aa0a6] block mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none border ${
                    isDark
                      ? 'border-[#3c4043] bg-[#131314] text-white focus:border-[#8ab4f8]'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 shadow-sm'
                  }`}
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Daily at 9:00 AM">Daily at 9:00 AM</option>
                  <option value="Daily at 6:00 PM">Daily at 6:00 PM</option>
                  <option value="Weekly on Mondays">Weekly on Mondays</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9aa0a6] block mb-1">
                Prompt to Run with Gemini
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Synthesize the top 5 breakthroughs in artificial intelligence today, highlight 2 practical developer implications, and provide 3 bulleted executive takeaways."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`w-full resize-none rounded-xl p-3 text-xs focus:outline-none border ${
                  isDark
                    ? 'border-[#3c4043] bg-[#131314] text-white focus:border-[#8ab4f8]'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 shadow-sm'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl px-4 py-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#4285F4] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3367d6] shadow-sm"
              >
                Schedule Task
              </button>
            </div>
          </form>
        )}

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const isRunning = runningTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
                  isDark
                    ? 'border-[#303134] bg-[#1e1f20]'
                    : 'border-gray-200 bg-white hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-[11px] font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.frequency}</span>
                    </span>

                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        task.active
                          ? 'bg-blue-500/10 text-blue-600 dark:text-[#8ab4f8]'
                          : 'bg-gray-200 dark:bg-[#303134] text-gray-500'
                      }`}
                    >
                      {task.active ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <h3 className="font-semibold text-base mb-1">{task.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-[#9aa0a6] line-clamp-2 leading-relaxed">
                    "{task.prompt}"
                  </p>

                  {task.lastRun && (
                    <div className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Last executed: {new Date(task.lastRun).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#303134]">
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete scheduled task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {task.lastResponse && (
                      <button
                        onClick={() =>
                          setViewResultTaskId(viewResultTaskId === task.id ? null : task.id)
                        }
                        className="text-xs text-blue-500 hover:underline font-medium"
                      >
                        {viewResultTaskId === task.id ? 'Hide Output' : 'View Output'}
                      </button>
                    )}

                    <button
                      onClick={() => handleRunNow(task.id)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#9B72CB] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Inline Output Viewer */}
                {viewResultTaskId === task.id && task.lastResponse && (
                  <div
                    className={`mt-4 rounded-xl border p-4 text-xs max-h-60 overflow-y-auto ${
                      isDark ? 'border-[#3c4043] bg-[#131314]' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-emerald-500 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Scheduled Execution Result:</span>
                    </div>
                    <MarkdownRenderer content={task.lastResponse} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
