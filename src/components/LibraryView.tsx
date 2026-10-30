import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  MessageSquare,
  FileText,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { ChatSession, NotebookItem } from '../types';

interface LibraryViewProps {
  sessions: ChatSession[];
  notebooks: NotebookItem[];
  onSelectSession: (id: string) => void;
  onSelectNotebook: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
  onNewChat: () => void;
  onNewNotebook: () => void;
  isDark: boolean;
}

export function LibraryView({
  sessions,
  notebooks,
  onSelectSession,
  onSelectNotebook,
  onDeleteSession,
  onDeleteNotebook,
  onNewChat,
  onNewNotebook,
  isDark,
}: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'chats' | 'notebooks'>('all');

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNotebooks = notebooks.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-white">
                <FolderOpen className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Your Gemini Library</h1>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#9aa0a6]">
              Browse, search, and manage all your conversation history, saved notebooks, and research sessions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex items-center gap-1.5 rounded-xl bg-[#4285F4] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3367d6] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
            <button
              onClick={onNewNotebook}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                isDark
                  ? 'border-[#3c4043] bg-[#1e1f20] text-white hover:bg-[#282a2c]'
                  : 'border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8ab4f8]" />
              <span>New Notebook</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, prompts, or notes..."
              className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-colors border ${
                isDark
                  ? 'border-[#3c4043] bg-[#1e1f20] text-white placeholder-gray-500 focus:border-[#8ab4f8]'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 shadow-sm'
              }`}
            />
          </div>

          <div
            className={`flex rounded-xl p-1 border ${
              isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-gray-100'
            }`}
          >
            {(['all', 'chats', 'notebooks'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                  activeFilter === tab
                    ? isDark
                      ? 'bg-[#282a2c] text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 dark:text-[#9aa0a6] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab === 'all'
                  ? `All (${sessions.length + notebooks.length})`
                  : tab === 'chats'
                  ? `Chats (${sessions.length})`
                  : `Notebooks (${notebooks.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content Lists */}
        <div className="space-y-6">
          {/* Chat Sessions */}
          {(activeFilter === 'all' || activeFilter === 'chats') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#9aa0a6]">
                <span>Conversations ({filteredSessions.length})</span>
              </div>

              {filteredSessions.length === 0 ? (
                <div
                  className={`rounded-2xl border p-8 text-center text-xs text-gray-500 ${
                    isDark ? 'border-[#303134] bg-[#1e1f20]/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  No conversation threads match your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer shadow-sm hover:scale-[1.01] ${
                        isDark
                          ? 'border-[#303134] bg-[#1e1f20] hover:border-[#8ab4f8]/60 hover:bg-[#282a2c]'
                          : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{session.messages.length} messages</span>
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.updatedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-blue-500 transition-colors">
                          {session.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-[#9aa0a6] line-clamp-2 leading-relaxed">
                          {session.messages[session.messages.length - 1]?.content ||
                            'Empty conversation. Click to begin prompting.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#303134]">
                        <span className="text-[11px] font-mono text-gray-400">
                          {session.model || 'gemini-3.8-flash'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                            Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notebooks */}
          {(activeFilter === 'all' || activeFilter === 'notebooks') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#9aa0a6]">
                <span>Research Notebooks ({filteredNotebooks.length})</span>
              </div>

              {filteredNotebooks.length === 0 ? (
                <div
                  className={`rounded-2xl border p-8 text-center text-xs text-gray-500 ${
                    isDark ? 'border-[#303134] bg-[#1e1f20]/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  No notebooks created yet. Click "+ New notebook" to build your research workspace.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredNotebooks.map((nb) => (
                    <div
                      key={nb.id}
                      onClick={() => onSelectNotebook(nb.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer shadow-sm hover:scale-[1.01] ${
                        isDark
                          ? 'border-[#303134] bg-[#1e1f20] hover:border-[#9b72cb]/60 hover:bg-[#282a2c]'
                          : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-purple-500">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Notebook</span>
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(nb.updatedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-purple-500 transition-colors">
                          {nb.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-[#9aa0a6] line-clamp-2 leading-relaxed">
                          {nb.content || 'Draft notes and research documentation.'}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#303134]">
                        <span className="text-[11px] text-gray-400">
                          {nb.tags?.join(', ') || 'Research, AI Notes'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotebook(nb.id);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete notebook"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-purple-500 font-medium flex items-center gap-1">
                            Edit <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
