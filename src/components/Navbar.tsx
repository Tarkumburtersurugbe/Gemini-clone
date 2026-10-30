import React, { useState } from 'react';
import {
  Sparkles,
  Menu,
  Sun,
  Moon,
  PenSquare,
  LogOut,
  Trash2,
  CheckCircle2,
  FolderOpen,
  Image as ImageIcon,
  Clock,
  GraduationCap,
  Sliders,
  BookOpen,
  Video,
  Mic,
} from 'lucide-react';
import { StudioMode, UserProfile } from '../types';

interface NavbarProps {
  currentMode: StudioMode;
  onSelectMode: (mode: StudioMode) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentUser: UserProfile | null;
  onOpenSignIn: () => void;
  onSignOut: () => void;
  onOpenDeleteHistory: () => void;
  onNewChat: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  currentMode,
  onSelectMode,
  onToggleSidebar,
  isSidebarOpen,
  currentUser,
  onOpenSignIn,
  onSignOut,
  onOpenDeleteHistory,
  onNewChat,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getModeLabel = () => {
    switch (currentMode) {
      case 'chat':
        return 'Chat & Multimodal';
      case 'library':
        return 'Library';
      case 'imagen':
        return 'Images (Imagen 3)';
      case 'scheduled':
        return 'Scheduled Automations';
      case 'students':
        return 'Students & Study Lab';
      case 'customize':
        return 'Customize & Prompt Architect';
      case 'notebooks':
        return 'Research Notebooks';
      case 'video':
        return 'Video Lab';
      case 'audio':
        return 'Voice & Audio';
      default:
        return 'Gemini Studio';
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 transition-colors ${
          isDark
            ? 'border-[#303134] bg-[#131314]/90 text-[#e3e3e3] backdrop-blur-md'
            : 'border-gray-200 bg-white/90 text-[#1f1f1f] backdrop-blur-md'
        }`}
      >
        {/* Left Side: Sidebar Toggle & Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-gray-400 hover:bg-[#282a2c] hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {currentMode !== 'chat' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-gray-500 dark:text-[#9aa0a6] hidden sm:inline">
                Gemini
              </span>
              <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">/</span>
              <span className="text-sm font-semibold tracking-tight">
                {getModeLabel()}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Theme Toggle, Upgrade Button & New Chat */}
        <div className="flex items-center gap-2.5">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-[#303134] bg-[#1e1f20] text-amber-400 hover:bg-[#282a2c]'
                : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Upgrade to Google AI Plus Button (Styled matching image_0fc3dfc5.png) */}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#d3e3fd] hover:bg-[#c2e7ff] text-[#041e49] px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span className="hidden sm:inline">Upgrade to Google AI Plus</span>
            <span className="sm:hidden">Upgrade</span>
          </button>

          {/* New Chat Pen Icon */}
          <button
            onClick={() => {
              onNewChat();
              onSelectMode('chat');
            }}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'text-gray-400 hover:bg-[#282a2c] hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="New Chat"
          >
            <PenSquare className="w-4 h-4" />
          </button>

          {/* User Account / Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-xs font-bold text-white shadow-xs overflow-hidden"
              title="User Account"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{(currentUser?.name || 'Ugbe 001')[0].toUpperCase()}</span>
              )}
            </button>

            {showUserDropdown && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl border p-3 shadow-xl z-50 animate-in fade-in duration-150 ${
                  isDark
                    ? 'border-[#3c4043] bg-[#202124] text-[#e8eaed]'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="border-b border-gray-200 dark:border-[#303134] pb-3 mb-2">
                  <div className="font-semibold text-xs truncate">
                    {currentUser?.name || 'Ugbe 001'}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {currentUser?.email || 'ugbe165@gmail.com'}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Gemini Connected & API Ready</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenDeleteHistory();
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isDark ? 'hover:bg-[#282a2c]' : 'hover:bg-gray-100'
                    } text-red-500`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Chat History</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onSignOut();
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left border-t border-gray-200 dark:border-[#303134] pt-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
              isDark
                ? 'border-[#3c4043] bg-[#202124] text-white'
                : 'border-gray-200 bg-white text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold">Google AI Plus</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Get the ultimate generative suite with next-generation reasoning, massive token context, and priority compute.
            </p>

            <div className="space-y-2 mb-6">
              {[
                'Gemini 3.8 Flash & Gemini 4 Argon access',
                '1,000,000 token context window for massive documents and video hours',
                'High-resolution Imagen 3 image generation at 2K/4K',
                'Priority compute with zero latency spikes',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-xl bg-[#0b57d0] hover:bg-[#0842a0] px-5 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Start 1-Month Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
