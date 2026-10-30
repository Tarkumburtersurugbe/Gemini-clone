import React from 'react';
import {
  Sparkles,
  Search,
  PanelLeftClose,
  Plus,
  BookOpen,
  Image as ImageIcon,
  Clock,
  GraduationCap,
  Sliders,
  Settings,
  LayoutGrid,
  Trash2,
  PenSquare,
  MessageSquare,
} from 'lucide-react';
import { StudioMode, UserProfile, NotebookItem } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: StudioMode;
  onSelectMode: (mode: StudioMode) => void;
  onNewChat: () => void;
  onNewNotebook: () => void;
  notebooks: NotebookItem[];
  onSelectNotebook: (id: string) => void;
  currentUser: UserProfile | null;
  onOpenSettings: () => void;
  isDark: boolean;
  onOpenSearch: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  onNewChat,
  onNewNotebook,
  notebooks,
  onSelectNotebook,
  currentUser,
  onOpenSettings,
  isDark,
  onOpenSearch,
}: SidebarProps) {
  const menuItems = [
    {
      id: 'library' as StudioMode,
      label: 'Library',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'imagen' as StudioMode,
      label: 'Images',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'scheduled' as StudioMode,
      label: 'Scheduled',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'students' as StudioMode,
      label: 'Students',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'customize' as StudioMode,
      label: 'Customize',
      icon: <Sliders className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex h-full flex-col justify-between border-r transition-all duration-200 ease-in-out lg:static shrink-0 ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 overflow-hidden border-none'
        } ${
          isDark
            ? 'border-[#303134] bg-[#1e1f20] text-[#e3e3e3]'
            : 'border-gray-200 bg-[#f8fafd] text-[#1f1f1f]'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Bar */}
          <div className="flex h-16 items-center justify-between px-4">
            {/* Gemini Brand */}
            <div
              onClick={() => onSelectMode('chat')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              {/* Multicolored Sparkle */}
              <div className="relative flex h-6 w-6 items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <defs>
                    <linearGradient id="geminiStar" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4285F4" />
                      <stop offset="35%" stopColor="#9B72CB" />
                      <stop offset="70%" stopColor="#D96570" />
                      <stop offset="100%" stopColor="#FBBC04" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#geminiStar)"
                    d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Gemini</span>
            </div>

            {/* Top Right Action Icons: Search and Collapse */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenSearch}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:bg-[#282a2c] hover:text-white' : 'text-gray-500 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
                title="Search Library & Chats"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:bg-[#282a2c] hover:text-white' : 'text-gray-500 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Pill Button */}
          <div className="px-3 pt-1 pb-3">
            <button
              onClick={() => {
                onNewChat();
                onSelectMode('chat');
              }}
              className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-xs font-medium transition-all shadow-xs ${
                currentMode === 'chat'
                  ? isDark
                    ? 'bg-[#282a2c] text-white ring-1 ring-white/10'
                    : 'bg-white text-gray-900 ring-1 ring-gray-200 shadow-sm'
                  : isDark
                  ? 'bg-[#131314] text-gray-300 hover:bg-[#282a2c] hover:text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100/80 shadow-xs'
              }`}
            >
              <PenSquare className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">New chat</span>
            </button>
          </div>

          {/* Navigation Menu List */}
          <nav className="px-3 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = currentMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectMode(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-[#282a2c] text-white font-semibold'
                        : 'bg-gray-200/70 text-gray-900 font-semibold'
                      : isDark
                      ? 'text-gray-400 hover:bg-[#282a2c]/60 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={isActive ? 'text-blue-500' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Notebooks Section */}
            <div className="pt-4 pb-1">
              <div className="px-3.5 pb-1 text-[11px] font-semibold text-gray-400 dark:text-[#9aa0a6]">
                Notebooks
              </div>
              <button
                onClick={() => {
                  onNewNotebook();
                  onSelectMode('notebooks');
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:bg-[#282a2c]/60 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                <span>New notebook</span>
              </button>

              {/* Notebooks List */}
              <div className="mt-1 space-y-0.5 max-h-36 overflow-y-auto">
                {notebooks.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => {
                      onSelectNotebook(nb.id);
                      onSelectMode('notebooks');
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-1.5 text-xs text-left truncate transition-colors ${
                      currentMode === 'notebooks'
                        ? isDark
                          ? 'bg-[#282a2c]/80 text-white'
                          : 'bg-gray-200/50 text-gray-900 font-medium'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">{nb.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div
          className={`flex items-center justify-between border-t p-3.5 ${
            isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-[#f8fafd]'
          }`}
        >
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 cursor-pointer group flex-1 truncate"
            title="Profile & Settings"
          >
            {/* User Avatar */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-xs font-bold text-white shadow-xs overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{(currentUser?.name || 'Ugbe 001')[0].toUpperCase()}</span>
              )}
            </div>

            <div className="truncate">
              <div className="text-xs font-semibold truncate group-hover:text-blue-500 transition-colors">
                {currentUser?.name || 'Ugbe 001'}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {currentUser?.email || 'ugbe165@gmail.com'}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-gray-400 hover:bg-[#282a2c] hover:text-white' : 'text-gray-500 hover:bg-gray-200/70 hover:text-gray-900'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
