import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Paperclip,
  Camera,
  Mic,
  Globe,
  Brain,
  X,
  Volume2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Film,
  FileText,
  Loader2,
  Wrench,
  PenLine,
  Compass,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, FileAttachment } from '../types';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { fileToBase64 } from '../utils/fileHelpers';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (
    text: string,
    files: FileAttachment[],
    enableSearch: boolean,
    enableThinking: boolean,
    modelOverride?: string
  ) => void;
  isLoading: boolean;
  onOpenSampleModal: () => void;
  onOpenCameraModal: () => void;
  onOpenMicModal: () => void;
  pendingAttachments: FileAttachment[];
  onAddAttachment: (attachment: FileAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isDark: boolean;
  onSwitchToImagen?: () => void;
}

export function ChatWorkspace({
  messages,
  onSendMessage,
  isLoading,
  onOpenSampleModal,
  onOpenCameraModal,
  onOpenMicModal,
  pendingAttachments,
  onAddAttachment,
  onRemoveAttachment,
  selectedModel,
  onSelectModel,
  isDark,
  onSwitchToImagen,
}: ChatWorkspaceProps) {
  const [inputText, setInputText] = useState('');
  const [enableSearch, setEnableSearch] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onOpenMicModal();
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (e.error !== 'not-allowed') {
          console.warn('Voice input notice:', e.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle textarea autosize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSubmit = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if ((!text && pendingAttachments.length === 0) || isLoading) return;
    onSendMessage(text, [...pendingAttachments], enableSearch, enableThinking, selectedModel);
    setInputText('');
    setShowAttachMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await fileToBase64(file);
        let type: 'image' | 'video' | 'audio' | 'document' = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        const previewUrl = URL.createObjectURL(file);
        onAddAttachment({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64,
          previewUrl,
          size: file.size,
          type,
        });
      } catch (err) {
        console.error('File load error:', err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAttachMenu(false);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayTTS = async (messageId: string, text: string) => {
    if (playingAudioId === messageId && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    try {
      setLoadingAudioId(messageId);
      const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[#*`_]/g, '');

      // Try server TTS first
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText.slice(0, 800),
          voice: 'Kore',
        }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        if (currentAudioRef.current) currentAudioRef.current.pause();
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        currentAudioRef.current = audio;
        audio.play();
        setPlayingAudioId(messageId);
        audio.onended = () => setPlayingAudioId(null);
      } else if ('speechSynthesis' in window) {
        // High quality native browser SpeechSynthesis fallback
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 1000));
        utterance.rate = 1.0;
        utterance.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingAudioId(messageId);
      }
    } catch (err) {
      if ('speechSynthesis' in window) {
        const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[#*`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 1000));
        utterance.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingAudioId(messageId);
      }
    } finally {
      setLoadingAudioId(null);
    }
  };

  const toggleThinking = (id: string) => {
    setThinkingExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const modelsList = [
    { id: 'gemini-3.1-flash-lite', label: 'Gemini Auto', tag: 'Fastest • Sub-Second Responses' },
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', tag: 'Multimodal High-Throughput' },
    { id: 'gemini-flash-latest', label: 'Gemini Flash', tag: 'Balanced Reasoning' },
    { id: 'gemini-4-argon', label: 'Gemini 4 Argon', tag: 'Complex STEM & Code' },
  ];

  const currentModelLabel =
    modelsList.find((m) => m.id === selectedModel)?.label || 'Gemini Auto';

  return (
    <div
      className={`relative flex flex-1 flex-col h-[calc(100vh-4rem)] overflow-hidden transition-colors ${
        isDark ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#ffffff] text-[#1f1f1f]'
      }`}
    >
      {/* Central Area: Empty State OR Message History */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl h-full flex flex-col justify-between">
          {messages.length === 0 ? (
            /* EXACT HERO STATE FROM SCREENSHOT (image_0fc3dfc5.png) */
            <div className="relative my-auto flex flex-col items-center justify-center text-center py-10">
              {/* Atmospheric central radial glow matching screenshot */}
              <div
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle at 50% 42%, rgba(66, 133, 244, 0.12) 0%, rgba(155, 114, 203, 0.06) 35%, rgba(19, 19, 20, 0) 70%)'
                    : 'radial-gradient(circle at 50% 42%, rgba(219, 234, 254, 0.65) 0%, rgba(238, 242, 255, 0.4) 32%, rgba(255, 255, 255, 0) 70%)',
                }}
              />

              {/* Title from screenshot: "Where should we start?" */}
              <h1 className="text-4xl sm:text-[46px] font-normal tracking-[-0.02em] text-[#1f1f1f] dark:text-[#e3e3e3] mb-8 select-none">
                Where should we start?
              </h1>

              {/* PROMINENT CENTRAL PROMPT INPUT FIELD */}
              <div className="w-full max-w-[680px] px-2">
                <div
                  className={`relative flex items-center gap-2.5 rounded-full border px-4 py-3 sm:py-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus-within:shadow-[0_4px_24px_rgba(66,133,244,0.12)] transition-all ${
                    isDark
                      ? 'border-[#3c4043] bg-[#1e1f20] focus-within:border-[#8ab4f8]'
                      : 'border-gray-200/90 bg-white focus-within:border-blue-400'
                  }`}
                >
                  {/* Plus '+' Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isDark ? 'text-gray-300 hover:bg-[#282a2c]' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Attach media, files, or photos"
                    >
                      <Plus className="w-5 h-5 stroke-[2]" />
                    </button>

                    {/* Popover Attachment Menu */}
                    {showAttachMenu && (
                      <div
                        className={`absolute left-0 bottom-12 w-56 rounded-2xl border p-2 shadow-xl z-50 animate-in fade-in ${
                          isDark
                            ? 'border-[#3c4043] bg-[#202124] text-gray-200'
                            : 'border-gray-200 bg-white text-gray-800'
                        }`}
                        onMouseLeave={() => setShowAttachMenu(false)}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          accept="image/*,video/mp4,video/webm,audio/*,.pdf,.txt,.md,.json,.csv"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors ${
                            isDark ? 'hover:bg-[#282a2c]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Paperclip className="w-4 h-4 text-blue-500" />
                          <span>Upload File or Media</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenCameraModal}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors ${
                            isDark ? 'hover:bg-[#282a2c]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Camera className="w-4 h-4 text-emerald-500" />
                          <span>Take Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenMicModal}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors ${
                            isDark ? 'hover:bg-[#282a2c]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Mic className="w-4 h-4 text-red-400" />
                          <span>Record Audio Note</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenSampleModal}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors ${
                            isDark ? 'hover:bg-[#282a2c]' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Film className="w-4 h-4 text-purple-400" />
                          <span>Sample Showcase Clips</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Input Field: "Ask Gemini" */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    placeholder={isListening ? 'Listening to your voice...' : 'Ask Gemini'}
                    className={`flex-1 bg-transparent text-[15px] sm:text-base focus:outline-none transition-colors ${
                      isListening
                        ? 'text-blue-500 placeholder-blue-400 font-medium'
                        : 'text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                    }`}
                  />

                  {/* Model Picker Pill: "Gemini Auto ▾" */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowModelPicker(!showModelPicker)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isDark
                          ? 'bg-[#282a2c] text-gray-200 hover:bg-[#303134]'
                          : 'bg-[#f0f4f9] text-gray-700 hover:bg-[#e2e7ef]'
                      }`}
                    >
                      <span>{currentModelLabel}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {showModelPicker && (
                      <div
                        className={`absolute right-0 bottom-11 w-64 rounded-2xl border p-2 shadow-xl z-50 animate-in fade-in ${
                          isDark
                            ? 'border-[#3c4043] bg-[#202124] text-gray-200'
                            : 'border-gray-200 bg-white text-gray-800'
                        }`}
                        onMouseLeave={() => setShowModelPicker(false)}
                      >
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Select Intelligence Tier
                        </div>
                        {modelsList.map((m, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              onSelectModel(m.id);
                              setShowModelPicker(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition-colors ${
                              selectedModel === m.id
                                ? 'bg-blue-500/10 text-blue-600 dark:text-[#8ab4f8] font-semibold'
                                : isDark
                                ? 'hover:bg-[#282a2c]'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div>
                              <div className="font-medium">{m.label}</div>
                              <div className="text-[10px] text-gray-400 font-normal">{m.tag}</div>
                            </div>
                            {selectedModel === m.id && (
                              <Check className="w-3.5 h-3.5 text-blue-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Action: Send Button OR Mic Icon */}
                  {inputText.trim() ? (
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm transition-colors"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isListening
                          ? 'bg-red-50 text-red-500 dark:bg-red-500/20'
                          : isDark
                          ? 'text-gray-300 hover:bg-[#282a2c]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Dictate with voice"
                    >
                      {isListening && (
                        <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
                      )}
                      <Mic className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Attachments preview if any selected */}
                {pendingAttachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {pendingAttachments.map((f) => (
                      <div
                        key={f.id}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border ${
                          isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="truncate max-w-[120px]">{f.name}</span>
                        <button
                          onClick={() => onRemoveAttachment(f.id)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EXACT 3 SUGGESTION CHIPS FROM SCREENSHOT */}
              <div className="mt-7 flex flex-col items-center gap-2.5 w-full max-w-[560px]">
                <button
                  onClick={() => {
                    if (onSwitchToImagen) {
                      onSwitchToImagen();
                    } else {
                      handleSubmit('Design a phone wallpaper for me: minimalist cosmic aurora over snow-capped mountains, cinematic lighting, 9:16 vertical ratio');
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 rounded-full px-5 py-3 text-sm font-normal transition-all text-left border ${
                    isDark
                      ? 'border-[#303134] bg-[#1e1f20]/80 hover:bg-[#282a2c] text-gray-200'
                      : 'border-gray-200/80 bg-white/80 hover:bg-[#f0f4f9] text-[#1f1f1f] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xs'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#9B72CB] shrink-0" />
                  <span>Design a phone wallpaper for me</span>
                </button>

                <button
                  onClick={() =>
                    handleSubmit(
                      'How do I speed up a slow phone? Provide a practical step-by-step diagnostic and optimization checklist for both Android and iPhone.'
                    )
                  }
                  className={`w-full flex items-center gap-3.5 rounded-full px-5 py-3 text-sm font-normal transition-all text-left border ${
                    isDark
                      ? 'border-[#303134] bg-[#1e1f20]/80 hover:bg-[#282a2c] text-gray-200'
                      : 'border-gray-200/80 bg-white/80 hover:bg-[#f0f4f9] text-[#1f1f1f] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xs'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-[#4285F4] shrink-0" />
                  <span>Speed up a slow phone</span>
                </button>

                <button
                  onClick={() =>
                    handleSubmit(
                      'Write a thoughtful, inspiring letter to my future self 5 years from now, reflecting on personal growth, overcoming obstacles, and staying true to core values.'
                    )
                  }
                  className={`w-full flex items-center gap-3.5 rounded-full px-5 py-3 text-sm font-normal transition-all text-left border ${
                    isDark
                      ? 'border-[#303134] bg-[#1e1f20]/80 hover:bg-[#282a2c] text-gray-200'
                      : 'border-gray-200/80 bg-white/80 hover:bg-[#f0f4f9] text-[#1f1f1f] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xs'
                  }`}
                >
                  <PenLine className="w-4 h-4 text-[#34A853] shrink-0" />
                  <span>Write a letter to my future self</span>
                </button>
              </div>
            </div>
          ) : (
            /* CONVERSATION MESSAGES STREAM */
            <div className="space-y-6 pb-6">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4285F4] via-[#9B72CB] to-[#D96570] text-white p-[1px] shadow-sm">
                        <div
                          className={`flex h-full w-full items-center justify-center rounded-[11px] ${
                            isDark ? 'bg-[#131314]' : 'bg-white'
                          }`}
                        >
                          <Sparkles className="h-4 w-4 text-[#4285F4]" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative max-w-[85%] rounded-2xl p-4 shadow-xs ${
                        isUser
                          ? isDark
                            ? 'bg-[#282a2c] text-white border border-[#3c4043]'
                            : 'bg-blue-50 text-gray-900 border border-blue-100'
                          : isDark
                          ? 'bg-[#1e1f20] text-[#e3e3e3] border border-[#303134]'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {/* Attached files preview */}
                      {message.files && message.files.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {message.files.map((file) => (
                            <div
                              key={file.id}
                              className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#303134]"
                            >
                              {file.type === 'image' && (
                                <img
                                  src={file.previewUrl}
                                  alt={file.name}
                                  className="max-h-48 max-w-xs object-cover rounded"
                                />
                              )}
                              {file.type === 'video' && (
                                <video
                                  src={file.previewUrl}
                                  controls
                                  className="max-h-48 max-w-xs rounded"
                                />
                              )}
                              {file.type === 'audio' && (
                                <audio src={file.previewUrl} controls className="h-10 w-60" />
                              )}
                              {file.type === 'document' && (
                                <div className="flex items-center gap-2 p-2.5 text-xs text-gray-600 dark:text-gray-300">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium truncate max-w-[160px]">
                                    {file.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Thinking Process Accordion */}
                      {message.thinkingProcess && (
                        <div
                          className={`mb-3 overflow-hidden rounded-xl border ${
                            isDark
                              ? 'border-[#3c4043] bg-[#131314]/80'
                              : 'border-purple-200 bg-purple-50/50'
                          }`}
                        >
                          <button
                            onClick={() => toggleThinking(message.id)}
                            className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-purple-600 dark:text-[#c58af9] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Brain className="h-3.5 w-3.5" />
                              <span>Thinking Process (Chain of Thought)</span>
                            </div>
                            {thinkingExpanded[message.id] ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {thinkingExpanded[message.id] && (
                            <div className="border-t border-purple-100 dark:border-[#303134] p-3 text-xs text-gray-600 dark:text-[#9aa0a6] font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                              {message.thinkingProcess}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      {message.content ? (
                        <MarkdownRenderer content={message.content} />
                      ) : message.isStreaming ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Gemini is generating response...</span>
                        </div>
                      ) : null}

                      {/* Search Grounding Sources */}
                      {message.groundingMetadata?.groundingChunks &&
                        message.groundingMetadata.groundingChunks.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#303134]">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mb-2">
                              <Globe className="h-3.5 w-3.5" />
                              <span>Search Grounding Sources</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {message.groundingMetadata.groundingChunks.map((chunk, idx) => {
                                if (!chunk.web?.uri) return null;
                                return (
                                  <a
                                    key={idx}
                                    href={chunk.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors border ${
                                      isDark
                                        ? 'border-[#3c4043] bg-[#282a2c] text-gray-300 hover:text-blue-400'
                                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:text-blue-600'
                                    }`}
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    <span className="truncate max-w-[200px]">
                                      {chunk.web.title || chunk.web.uri}
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* Action Bar for Model Messages */}
                      {!isUser && message.content && (
                        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-[#303134]/50 text-xs text-gray-400">
                          <button
                            onClick={() => handlePlayTTS(message.id, message.content)}
                            disabled={loadingAudioId === message.id}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                              isDark ? 'hover:bg-[#282a2c] hover:text-white' : 'hover:bg-gray-100'
                            }`}
                            title="Listen"
                          >
                            {loadingAudioId === message.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                            ) : playingAudioId === message.id ? (
                              <Pause className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                            <span>{playingAudioId === message.id ? 'Pause' : 'Listen'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyText(message.id, message.content)}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                              isDark ? 'hover:bg-[#282a2c] hover:text-white' : 'hover:bg-gray-100'
                            }`}
                            title="Copy text"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span>{copiedId === message.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Composer (When in active conversation) */}
      {messages.length > 0 && (
        <div
          className={`p-4 md:px-8 border-t transition-colors ${
            isDark
              ? 'border-[#303134] bg-[#131314]'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="mx-auto max-w-4xl">
            {/* Attachments preview queue */}
            {pendingAttachments.length > 0 && (
              <div
                className={`mb-2 flex flex-wrap gap-2 rounded-xl p-2 border ${
                  isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {pendingAttachments.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${
                      isDark
                        ? 'border-[#3c4043] bg-[#282a2c] text-white'
                        : 'border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <button
                      onClick={() => onRemoveAttachment(file.id)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div
              className={`relative rounded-2xl border shadow-lg transition-all ${
                isDark
                  ? 'border-[#3c4043] bg-[#1e1f20] focus-within:border-[#8ab4f8]'
                  : 'border-gray-300 bg-white focus-within:border-blue-400 focus-within:shadow-md'
              }`}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Gemini anything..."
                className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-sm focus:outline-none placeholder-gray-400"
              />

              {/* Bottom toolbar inside input box */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,video/mp4,video/webm,audio/*,.pdf,.txt,.md,.json,.csv"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    title="Upload File"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCameraModal}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    title="Snap Camera"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenMicModal}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    title="Voice Recording"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenSampleModal}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-[#282a2c] transition-colors"
                    title="Pick Sample Media"
                  >
                    <Film className="h-4 w-4" />
                  </button>

                  <div className="mx-1 h-3.5 w-[1px] bg-gray-300 dark:bg-[#303134]" />

                  {/* Search toggle */}
                  <button
                    type="button"
                    onClick={() => setEnableSearch(!enableSearch)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      enableSearch
                        ? 'bg-blue-500/15 text-blue-600 dark:text-[#8ab4f8] border border-blue-500/30'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                    }`}
                    title="Live Google Search Grounding"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>

                  {/* Thinking toggle */}
                  <button
                    type="button"
                    onClick={() => setEnableThinking(!enableThinking)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      enableThinking
                        ? 'bg-purple-500/15 text-purple-600 dark:text-[#c58af9] border border-purple-500/30'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'
                    }`}
                    title="Deep Chain of Thought Reasoning"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Thinking</span>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-1.5 text-center text-[10px] text-gray-400">
              Gemini may display inaccurate info, including about people, so double-check its responses.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
