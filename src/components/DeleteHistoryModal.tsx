import React, { useState } from 'react';
import {
  Trash2,
  X,
  Clock,
  AlertTriangle,
  Check,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ChatSession } from '../types';

interface DeleteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
  onDeleteRecent: (hours: number) => void;
}

export function DeleteHistoryModal({
  isOpen,
  onClose,
  sessions,
  onDeleteSession,
  onDeleteAllSessions,
  onDeleteRecent,
}: DeleteHistoryModalProps) {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setDeletedToast(msg);
    setTimeout(() => setDeletedToast(null), 2500);
  };

  const handleDeleteAll = () => {
    onDeleteAllSessions();
    setConfirmDeleteAll(false);
    showToast('All conversation history permanently deleted.');
  };

  const handleDeleteToday = () => {
    onDeleteRecent(24);
    showToast('Activity from today has been deleted.');
  };

  const handleDeleteLastHour = () => {
    onDeleteRecent(1);
    showToast('Activity from the last hour has been deleted.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-[#3c4043] bg-[#202124] shadow-2xl text-[#e8eaed] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#303134] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Gemini Apps Activity</h2>
              <p className="text-xs text-[#9aa0a6]">Manage and delete your chat history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#9aa0a6] hover:bg-[#303134] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {deletedToast && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-xs text-emerald-400 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{deletedToast}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Delete Range Presets */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2.5">
              Delete Activity By Timeframe
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDeleteLastHour}
                className="flex items-center gap-2 rounded-xl border border-[#3c4043] bg-[#282a2c] p-3 text-left hover:bg-[#303134] hover:border-[#8ab4f8] transition-colors"
              >
                <Clock className="w-4 h-4 text-[#8ab4f8] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Last Hour</div>
                  <div className="text-[10px] text-[#9aa0a6]">Past 60 minutes</div>
                </div>
              </button>

              <button
                onClick={handleDeleteToday}
                className="flex items-center gap-2 rounded-xl border border-[#3c4043] bg-[#282a2c] p-3 text-left hover:bg-[#303134] hover:border-[#8ab4f8] transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Last 24 Hours</div>
                  <div className="text-[10px] text-[#9aa0a6]">Today's chats</div>
                </div>
              </button>
            </div>
          </div>

          {/* Delete All Option */}
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            {!confirmDeleteAll ? (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    Delete All History
                  </h4>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                    Permanently delete all saved chats, attachments, and activity
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors shadow-sm"
                >
                  Delete All
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    Are you sure? This cannot be undone. All conversation sessions will be erased.
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="rounded-lg px-3 py-1 text-xs text-[#9aa0a6] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="rounded-lg bg-red-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Confirm Delete All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Individual Chat Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6]">
                Saved Conversations ({sessions.length})
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-[#303134] bg-[#282a2c] px-3 py-2 text-xs hover:border-[#3c4043] transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#9aa0a6] shrink-0" />
                    <span className="truncate text-white font-medium">{session.title}</span>
                    <span className="text-[10px] text-[#9aa0a6] shrink-0 font-mono">
                      {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onDeleteSession(session.id);
                      showToast(`Deleted "${session.title}"`);
                    }}
                    className="rounded-lg p-1.5 text-[#9aa0a6] hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#303134] px-6 py-3 bg-[#1e1f20] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#8ab4f8] px-5 py-2 text-xs font-semibold text-black hover:bg-[#aecbfa]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
