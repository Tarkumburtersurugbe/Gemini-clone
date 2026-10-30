import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Check,
  ListPlus,
  Wand2,
  FileText,
  Loader2,
  Tag,
  Share2,
} from 'lucide-react';
import { NotebookItem } from '../types';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface NotebooksViewProps {
  notebooks: NotebookItem[];
  activeNotebookId: string;
  onSelectNotebook: (id: string) => void;
  onUpdateNotebook: (notebook: NotebookItem) => void;
  onNewNotebook: () => void;
  onDeleteNotebook: (id: string) => void;
  isDark: boolean;
}

export function NotebooksView({
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onUpdateNotebook,
  onNewNotebook,
  onDeleteNotebook,
  isDark,
}: NotebooksViewProps) {
  const activeNotebook =
    notebooks.find((n) => n.id === activeNotebookId) || notebooks[0];

  const [title, setTitle] = useState(activeNotebook?.title || 'Untitled Research Notebook');
  const [content, setContent] = useState(activeNotebook?.content || '');
  const [isCopilotRunning, setIsCopilotRunning] = useState(false);
  const [copilotAction, setCopilotAction] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  // Sync state if activeNotebook changes
  React.useEffect(() => {
    if (activeNotebook) {
      setTitle(activeNotebook.title);
      setContent(activeNotebook.content);
    }
  }, [activeNotebook?.id]);

  const handleSave = () => {
    if (!activeNotebook) return;
    onUpdateNotebook({
      ...activeNotebook,
      title: title.trim() || 'Untitled Notebook',
      content,
      updatedAt: Date.now(),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleCopilotAssist = async (action: 'summarize' | 'outline' | 'quiz' | 'elaborate') => {
    if (!content.trim() || isCopilotRunning) return;
    setIsCopilotRunning(true);
    setCopilotAction(action);

    let prompt = '';
    if (action === 'summarize') {
      prompt = `Provide an executive summary and key findings of these notes:\n\n${content}`;
    } else if (action === 'outline') {
      prompt = `Turn these messy notes into a structured, hierarchical outline with key headings and bullet points:\n\n${content}`;
    } else if (action === 'quiz') {
      prompt = `Generate 5 insightful review questions to test comprehension based on these notes:\n\n${content}`;
    } else {
      prompt = `Identify gaps in these notes and elaborate on crucial complementary topics:\n\n${content}`;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: 'gemini-3.8-flash',
          temperature: 0.6,
        }),
      });

      const data = await res.json();
      if (data.text) {
        const appended = `${content}\n\n---\n### ✦ Gemini Research Assistant (${action.toUpperCase()})\n\n${data.text}`;
        setContent(appended);
        if (activeNotebook) {
          onUpdateNotebook({
            ...activeNotebook,
            title,
            content: appended,
            updatedAt: Date.now(),
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCopilotRunning(false);
      setCopilotAction(null);
    }
  };

  return (
    <div
      className={`flex flex-1 flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 transition-colors ${
        isDark ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#ffffff] text-[#1f1f1f]'
      }`}
    >
      <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#303134] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9B72CB] to-[#D96570] text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gemini Research Notebooks</h1>
              <p className="text-xs text-gray-500 dark:text-[#9aa0a6]">
                Interactive notes with real-time multimodal AI analysis, structuring, and synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewNotebook}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-[#3c4043] bg-gray-50 dark:bg-[#1e1f20] px-3.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-[#282a2c] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Notebook</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-[#4285F4] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#3367d6] transition-colors"
            >
              {savedToast ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedToast ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Notebook Switcher Tabs */}
        {notebooks.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {notebooks.map((nb) => {
              const isSelected = activeNotebook?.id === nb.id;
              return (
                <button
                  key={nb.id}
                  onClick={() => onSelectNotebook(nb.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? isDark
                        ? 'border-[#8ab4f8] bg-[#8ab4f8]/15 text-white'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark
                      ? 'border-[#303134] bg-[#1e1f20] text-gray-400 hover:text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{nb.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Notebook Editor Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px]">
          {/* Main Edit Canvas */}
          <div
            className={`lg:col-span-8 flex flex-col rounded-2xl border p-5 shadow-sm space-y-4 ${
              isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-white'
            }`}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notebook Title..."
              className={`text-xl font-bold bg-transparent border-b pb-2 focus:outline-none transition-colors ${
                isDark
                  ? 'border-[#303134] text-white focus:border-[#8ab4f8]'
                  : 'border-gray-200 text-gray-900 focus:border-blue-500'
              }`}
            />

            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your study notes, research quotes, formulas, thoughts, or paste raw materials here..."
              className={`flex-1 w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none font-sans ${
                isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>

          {/* AI Research Co-Pilot Tools */}
          <div
            className={`lg:col-span-4 flex flex-col justify-between rounded-2xl border p-5 shadow-sm space-y-4 ${
              isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-[#303134] pb-3">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-[#9aa0a6]">
                  Gemini Research Co-Pilot
                </h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-[#9aa0a6] leading-relaxed">
                Click an action to have Gemini read your notebook content, synthesize answers, and automatically append structured findings.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'outline', label: 'Structure into Hierarchical Outline', desc: 'Organize chaotic notes' },
                  { id: 'summarize', label: 'Executive Summary & Key Takeaways', desc: 'Concise bullet points' },
                  { id: 'quiz', label: 'Generate Comprehension Quiz', desc: '5 active recall questions' },
                  { id: 'elaborate', label: 'Deepen & Fill Knowledge Gaps', desc: 'Add context & references' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleCopilotAssist(act.id as any)}
                    disabled={isCopilotRunning || !content.trim()}
                    className={`w-full flex flex-col rounded-xl p-3 text-left border transition-all ${
                      isDark
                        ? 'border-[#303134] bg-[#131314] hover:border-[#8ab4f8] text-gray-200'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-400 text-gray-800'
                    } disabled:opacity-40`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{act.label}</span>
                      {isCopilotRunning && copilotAction === act.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeNotebook && notebooks.length > 1 && (
              <button
                onClick={() => onDeleteNotebook(activeNotebook.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 text-red-500 p-2 text-xs hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Notebook</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
