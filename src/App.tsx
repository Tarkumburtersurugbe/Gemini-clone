import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { ImagenStudio } from './components/ImagenStudio';
import { VideoLab } from './components/VideoLab';
import { AudioStudio } from './components/AudioStudio';
import { Playground } from './components/Playground';
import { LibraryView } from './components/LibraryView';
import { ScheduledView } from './components/ScheduledView';
import { StudentsView } from './components/StudentsView';
import { NotebooksView } from './components/NotebooksView';
import { SampleMediaModal } from './components/SampleMediaModal';
import { MediaCaptureModal } from './components/MediaCaptureModal';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { DeleteHistoryModal } from './components/DeleteHistoryModal';
import {
  StudioMode,
  ChatSession,
  ChatMessage,
  FileAttachment,
  SampleMediaItem,
  UserProfile,
  NotebookItem,
  ScheduledTask,
  ThemeMode,
} from './types';
import { urlToBase64 } from './utils/fileHelpers';

const SESSIONS_STORAGE_KEY = 'gemini_studio_sessions_v2';
const NOTEBOOKS_STORAGE_KEY = 'gemini_studio_notebooks_v1';
const TASKS_STORAGE_KEY = 'gemini_studio_scheduled_v1';
const USER_STORAGE_KEY = 'gemini_studio_user_v2';
const THEME_STORAGE_KEY = 'gemini_studio_theme_v1';

export default function App() {
  // Theme state: defaults to 'light' to match the screenshot attached by user
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    } catch (e) {}
    return 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Studio Mode: starts in 'chat' matching screenshot
  const [currentMode, setCurrentMode] = useState<StudioMode>('chat');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // User Profile: Default to Ugbe 001 from screenshot and metadata
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return {
      id: 'ugbe-001',
      name: 'Ugbe 001',
      email: 'ugbe165@gmail.com',
      avatarUrl: '/assets/aistudio/image_0fc3dfc5.png',
      signedInAt: Date.now(),
    };
  });

  // Modals
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDeleteHistoryModalOpen, setIsDeleteHistoryModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [mediaCaptureModal, setMediaCaptureModal] = useState<{
    isOpen: boolean;
    type: 'camera' | 'microphone';
  }>({ isOpen: false, type: 'camera' });

  // Attachments pending in chat input composer
  const [pendingAttachments, setPendingAttachments] = useState<FileAttachment[]>([]);
  const [videoLabInitial, setVideoLabInitial] = useState<{ url?: string; title?: string }>({});

  // Chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const initialSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: 'gemini-3.1-flash-lite',
      temperature: 0.7,
      topP: 0.95,
      enableSearch: false,
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  // Notebooks
  const [notebooks, setNotebooks] = useState<NotebookItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTEBOOKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'nb-initial-1',
        title: 'Multimodal AI Research',
        content:
          '# Multimodal AI Architecture Notes\n\n- Real-time video frame parsing with Gemini 3.8\n- Grounding with Google Search for verified facts\n- Direct audio speech synthesis with expressive voices\n\nNext steps: Explore fine-tuning and retrieval pipelines.',
        updatedAt: Date.now(),
        tags: ['Research', 'Gemini'],
      },
    ];
  });

  const [activeNotebookId, setActiveNotebookId] = useState<string>(
    () => notebooks[0]?.id || ''
  );

  // Scheduled Tasks
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'task-1',
        title: 'Morning AI & Tech Intelligence Briefing',
        prompt:
          'Synthesize top 3 AI and tech breakthroughs announced in the last 24 hours with practical takeaways.',
        frequency: 'Daily at 9:00 AM',
        category: 'Briefing',
        active: true,
      },
      {
        id: 'task-2',
        title: 'Weekly Code Quality & Architecture Audit',
        prompt:
          'Provide a checklist of 5 high-impact refactorings for modern full-stack TypeScript applications.',
        frequency: 'Weekly on Mondays',
        category: 'Engineering',
        active: true,
      },
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTEBOOKS_STORAGE_KEY, JSON.stringify(notebooks));
    } catch (e) {}
  }, [notebooks]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(scheduledTasks));
    } catch (e) {}
  }, [scheduledTasks]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      }
    } catch (e) {}
  }, [currentUser]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSignIn = (profile: UserProfile) => {
    setCurrentUser(profile);
    setIsSignInModalOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser({
      id: 'guest',
      name: 'Guest Explorer',
      email: 'guest@gemini.local',
      signedInAt: Date.now(),
    });
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: selectedModel,
      temperature: 0.7,
      topP: 0.95,
      enableSearch: false,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setPendingAttachments([]);
    setCurrentMode('chat');
  };

  const handleNewNotebook = () => {
    const newNb: NotebookItem = {
      id: `nb-${Date.now()}`,
      title: 'New Research Notebook',
      content: '# New Research Notebook\n\nStart jotting down thoughts or prompt Gemini to assist.',
      updatedAt: Date.now(),
      tags: ['Notes'],
    };
    setNotebooks((prev) => [newNb, ...prev]);
    setActiveNotebookId(newNb.id);
    setCurrentMode('notebooks');
  };

  const handleUpdateNotebook = (updated: NotebookItem) => {
    setNotebooks((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNotebook = (id: string) => {
    const remaining = notebooks.filter((n) => n.id !== id);
    if (remaining.length === 0) {
      handleNewNotebook();
    } else {
      setNotebooks(remaining);
      if (activeNotebookId === id) setActiveNotebookId(remaining[0].id);
    }
  };

  // Scheduled tasks handlers
  const handleAddTask = (task: ScheduledTask) => {
    setScheduledTasks((prev) => [task, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setScheduledTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setScheduledTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTriggerTask = async (id: string) => {
    const task = scheduledTasks.find((t) => t.id === id);
    if (!task) return;
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: task.prompt,
        model: selectedModel,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    setScheduledTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              lastRun: Date.now(),
              lastResponse: data.text || 'Task completed successfully.',
            }
          : t
      )
    );
  };

  // Delete History Handlers
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const freshSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'New chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        model: selectedModel,
        temperature: 0.7,
        topP: 0.95,
        enableSearch: false,
      };
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleDeleteAllSessions = () => {
    const freshSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: selectedModel,
      temperature: 0.7,
      topP: 0.95,
      enableSearch: false,
    };
    setSessions([freshSession]);
    setActiveSessionId(freshSession.id);
    setPendingAttachments([]);
  };

  const handleDeleteRecent = (hours: number) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const remaining = sessions.filter((s) => s.updatedAt < cutoff);
    if (remaining.length === 0) {
      handleDeleteAllSessions();
    } else {
      setSessions(remaining);
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleSendMessage = async (
    text: string,
    files: FileAttachment[],
    enableSearch: boolean,
    enableThinking: boolean,
    modelOverride?: string
  ) => {
    if ((!text.trim() && files.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      files,
    };

    const modelMessageId = `msg-${Date.now()}-model`;
    const modelMessage: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedTitle =
      activeSession.messages.length === 0 && text.trim()
        ? text.slice(0, 32).trim() + (text.length > 32 ? '...' : '')
        : activeSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage, modelMessage],
          };
        }
        return s;
      })
    );

    setPendingAttachments([]);
    setIsLoading(true);

    try {
      const history = activeSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
        parts: [
          ...(m.files || []).map((f) => ({
            inlineData: { mimeType: f.mimeType, data: f.base64 },
          })),
          ...(m.content ? [{ text: m.content }] : []),
        ],
      }));

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history,
          model: modelOverride || selectedModel,
          enableSearch,
          thinkingLevel: enableThinking ? 'HIGH' : undefined,
          files: files.map((f) => ({
            mimeType: f.mimeType,
            base64: f.base64,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let accumulatedThought = '';
      let groundingMetadata: any = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          let changed = false;

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  changed = true;
                }
                if (parsed.thought) {
                  accumulatedThought += parsed.thought;
                  changed = true;
                }
                if (parsed.groundingMetadata) {
                  groundingMetadata = parsed.groundingMetadata;
                  changed = true;
                }
              } catch (e) {}
            }
          }

          if (changed) {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id === activeSessionId) {
                  return {
                    ...s,
                    messages: s.messages.map((m) => {
                      if (m.id === modelMessageId) {
                        return {
                          ...m,
                          content: accumulatedText,
                          thinkingProcess: accumulatedThought || undefined,
                          groundingMetadata: groundingMetadata || undefined,
                          isStreaming: true,
                        };
                      }
                      return m;
                    }),
                  };
                }
                return s;
              })
            );
          }
        }
      }

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === modelMessageId) {
                  return {
                    ...m,
                    content: accumulatedText,
                    thinkingProcess: accumulatedThought || undefined,
                    groundingMetadata: groundingMetadata || undefined,
                    isStreaming: false,
                  };
                }
                return m;
              }),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === modelMessageId) {
                  return {
                    ...m,
                    content:
                      m.content ||
                      `Error: ${err.message || 'Check connection and try again.'}`,
                    isStreaming: false,
                    error: err.message,
                  };
                }
                return m;
              }),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (sample: SampleMediaItem, target: 'chat' | 'video') => {
    if (target === 'video') {
      setVideoLabInitial({ url: sample.url, title: sample.title });
      setCurrentMode('video');
    } else {
      try {
        const { base64, mimeType } = await urlToBase64(sample.url);
        const attachment: FileAttachment = {
          id: `sample-${Date.now()}`,
          name: `${sample.title.toLowerCase().replace(/\s+/g, '-')}.${
            mimeType.includes('png') ? 'png' : 'jpg'
          }`,
          mimeType,
          base64,
          previewUrl: sample.url,
          size: Math.round(base64.length * 0.75),
          type: sample.type,
        };
        setPendingAttachments((prev) => [...prev, attachment]);
        setCurrentMode('chat');
      } catch (err) {
        console.error('Failed to load sample into chat:', err);
      }
    }
  };

  const handleSendToChatFromOtherModes = (text: string, files: FileAttachment[]) => {
    setCurrentMode('chat');
    handleSendMessage(text, files, false, false);
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isDark ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#ffffff] text-[#1f1f1f]'
      }`}
    >
      {/* Left Sidebar (Matching Screenshot Navigation: New chat, Library, Images, Scheduled, Students, Customize, Notebooks, Ugbe 001) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onNewNotebook={handleNewNotebook}
        notebooks={notebooks}
        onSelectNotebook={(id) => {
          setActiveNotebookId(id);
          setCurrentMode('notebooks');
          setIsSidebarOpen(false);
        }}
        currentUser={currentUser}
        onOpenSettings={() => setIsDeleteHistoryModalOpen(true)}
        isDark={isDark}
        onOpenSearch={() => setCurrentMode('library')}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Responsive Navigation Bar with Dark Mode Toggle */}
        <Navbar
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          currentUser={currentUser}
          onOpenSignIn={() => setIsSignInModalOpen(true)}
          onSignOut={handleSignOut}
          onOpenDeleteHistory={() => setIsDeleteHistoryModalOpen(true)}
          onNewChat={handleNewChat}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Studio Mode Views */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {currentMode === 'chat' && (
            <ChatWorkspace
              messages={activeSession.messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onOpenSampleModal={() => setIsSampleModalOpen(true)}
              onOpenCameraModal={() =>
                setMediaCaptureModal({ isOpen: true, type: 'camera' })
              }
              onOpenMicModal={() =>
                setMediaCaptureModal({ isOpen: true, type: 'microphone' })
              }
              pendingAttachments={pendingAttachments}
              onAddAttachment={(att) => setPendingAttachments((prev) => [...prev, att])}
              onRemoveAttachment={(id) =>
                setPendingAttachments((prev) => prev.filter((a) => a.id !== id))
              }
              selectedModel={selectedModel}
              onSelectModel={(model) => setSelectedModel(model)}
              isDark={isDark}
              onSwitchToImagen={() => setCurrentMode('imagen')}
            />
          )}

          {currentMode === 'library' && (
            <LibraryView
              sessions={sessions}
              notebooks={notebooks}
              onSelectSession={(id) => {
                setActiveSessionId(id);
                setCurrentMode('chat');
              }}
              onSelectNotebook={(id) => {
                setActiveNotebookId(id);
                setCurrentMode('notebooks');
              }}
              onDeleteSession={handleDeleteSession}
              onDeleteNotebook={handleDeleteNotebook}
              onNewChat={handleNewChat}
              onNewNotebook={handleNewNotebook}
              isDark={isDark}
            />
          )}

          {currentMode === 'imagen' && (
            <ImagenStudio onSendToChat={handleSendToChatFromOtherModes} />
          )}

          {currentMode === 'scheduled' && (
            <ScheduledView
              tasks={scheduledTasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onTriggerTask={handleTriggerTask}
              isDark={isDark}
            />
          )}

          {currentMode === 'students' && (
            <StudentsView
              isDark={isDark}
              onSendToChat={(prompt) => {
                handleNewChat();
                handleSendMessage(prompt, [], false, false);
              }}
            />
          )}

          {currentMode === 'customize' && <Playground />}

          {currentMode === 'notebooks' && (
            <NotebooksView
              notebooks={notebooks}
              activeNotebookId={activeNotebookId}
              onSelectNotebook={(id) => setActiveNotebookId(id)}
              onUpdateNotebook={handleUpdateNotebook}
              onNewNotebook={handleNewNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              isDark={isDark}
            />
          )}

          {currentMode === 'video' && (
            <VideoLab
              initialVideoUrl={videoLabInitial.url}
              initialVideoTitle={videoLabInitial.title}
            />
          )}

          {currentMode === 'audio' && <AudioStudio />}

          {currentMode === 'playground' && <Playground />}
        </main>
      </div>

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
        defaultEmail={currentUser.email}
      />

      {/* Delete History Modal */}
      <DeleteHistoryModal
        isOpen={isDeleteHistoryModalOpen}
        onClose={() => setIsDeleteHistoryModalOpen(false)}
        sessions={sessions}
        onDeleteSession={handleDeleteSession}
        onDeleteAllSessions={handleDeleteAllSessions}
        onDeleteRecent={handleDeleteRecent}
      />

      {/* Sample Media Modal */}
      <SampleMediaModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* Camera / Microphone Capture Modal */}
      <MediaCaptureModal
        isOpen={mediaCaptureModal.isOpen}
        type={mediaCaptureModal.type}
        onClose={() =>
          setMediaCaptureModal((prev) => ({ ...prev, isOpen: false }))
        }
        onCapture={(att) => setPendingAttachments((prev) => [...prev, att])}
      />
    </div>
  );
}
