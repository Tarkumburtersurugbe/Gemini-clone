import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calculator,
  Code2,
  FileCheck,
  Brain,
  RotateCcw,
  Copy,
  Check,
  Send,
  Loader2,
  Layers,
} from 'lucide-react';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface StudentsViewProps {
  isDark: boolean;
  onSendToChat: (prompt: string) => void;
}

export function StudentsView({ isDark, onSendToChat }: StudentsViewProps) {
  const [activeTab, setActiveTab] = useState<'explainer' | 'stem' | 'flashcards' | 'essay'>('explainer');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Array<{ q: string; a: string }>>([]);
  const [revealedCardIndex, setRevealedCardIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'explainer',
      title: 'Feynman Concept Explainer',
      desc: 'Master complex theories explained in simple terms with analogies',
      icon: <Brain className="w-4 h-4 text-[#4285F4]" />,
      placeholder: 'e.g. Explain Quantum Superposition or Transformer Multi-Head Attention to a beginner',
      systemPrompt: 'You are a world-class educational tutor using the Feynman technique. Explain the concept intuitively with clear real-world analogies, minimal jargon, and a quick self-test quiz at the end.',
    },
    {
      id: 'stem',
      title: 'Step-by-Step Math & STEM Solver',
      desc: 'Calculus, linear algebra, physics, and algorithmic breakdowns',
      icon: <Calculator className="w-4 h-4 text-emerald-500" />,
      placeholder: 'e.g. Find the eigenvalues and eigenvectors of matrix [[4, 2], [1, 3]] with full steps',
      systemPrompt: 'You are a patient STEM professor. Provide step-by-step mathematical reasoning, explaining the principles behind each transformation clearly.',
    },
    {
      id: 'flashcards',
      title: 'Smart Flashcard Generator',
      desc: 'Turn any topic, chapter, or notes into active-recall flashcards',
      icon: <Layers className="w-4 h-4 text-[#9B72CB]" />,
      placeholder: 'e.g. Photosynthesis light-dependent reactions, ATP synthesis, and Calvin cycle',
      systemPrompt: 'Create 4 high-yield active-recall study flashcards on the requested topic. Format each card clearly as:\nCard 1:\nQ: [Question]\nA: [Concise Answer]\n\nCard 2:\n...',
    },
    {
      id: 'essay',
      title: 'Thesis & Essay Reviewer',
      desc: 'Critique arguments, strengthen rhetoric, and spot logical fallacies',
      icon: <FileCheck className="w-4 h-4 text-[#EA4335]" />,
      placeholder: 'Paste your thesis statement or essay paragraph for critique...',
      systemPrompt: 'You are an academic editor. Review the provided draft: analyze argument strength, thesis clarity, paragraph transitions, vocabulary, and suggest 3 high-impact improvements.',
    },
  ];

  const currentTool = tools.find((t) => t.id === activeTab)!;

  const handleExecute = async () => {
    if (!inputQuery.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setFlashcards([]);
    setRevealedCardIndex(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputQuery.trim(),
          systemInstruction: currentTool.systemPrompt,
          model: 'gemini-3.8-flash',
          temperature: 0.5,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');

      const text = data.text || '';
      setResult(text);

      // If flashcard mode, parse out cards
      if (activeTab === 'flashcards') {
        const parsedCards: Array<{ q: string; a: string }> = [];
        const cardBlocks = text.split(/Card \d+:?/i);
        for (const block of cardBlocks) {
          const qMatch = block.match(/Q:\s*([\s\S]*?)(?=A:|$)/i);
          const aMatch = block.match(/A:\s*([\s\S]*?)(?=$)/i);
          if (qMatch && aMatch) {
            parsedCards.push({
              q: qMatch[1].trim(),
              a: aMatch[1].trim(),
            });
          }
        }
        if (parsedCards.length > 0) {
          setFlashcards(parsedCards);
        }
      }
    } catch (err: any) {
      setResult(`Error: ${err.message || 'Please check your connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9B72CB] to-[#4285F4] text-white">
                <GraduationCap className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Gemini Student & Research Lab</h1>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#9aa0a6]">
              Accelerate your learning, master difficult concepts, practice active recall, and solve complex coursework
            </p>
          </div>
        </div>

        {/* Learning Tool Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tools.map((tool) => {
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTab(tool.id as any);
                  setResult(null);
                }}
                className={`flex flex-col text-left rounded-2xl p-4 border transition-all ${
                  isActive
                    ? isDark
                      ? 'border-[#8ab4f8] bg-[#8ab4f8]/10 shadow-sm'
                      : 'border-blue-500 bg-blue-50/60 shadow-sm'
                    : isDark
                    ? 'border-[#303134] bg-[#1e1f20] hover:bg-[#282a2c]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="mb-2">{tool.icon}</div>
                <h3 className="font-semibold text-xs mb-1">{tool.title}</h3>
                <p className="text-[11px] text-gray-400 line-clamp-2">{tool.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Input Card */}
        <div
          className={`rounded-2xl border p-5 shadow-sm space-y-3 ${
            isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#9aa0a6]">
              {currentTool.title} Input
            </span>
          </div>

          <textarea
            rows={4}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={currentTool.placeholder}
            className={`w-full resize-none rounded-xl p-3 text-xs focus:outline-none border ${
              isDark
                ? 'border-[#3c4043] bg-[#131314] text-white focus:border-[#8ab4f8]'
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 shadow-sm'
            }`}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={handleExecute}
              disabled={isLoading || !inputQuery.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#9B72CB] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Explanation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Flashcards View if Flashcards Generated */}
        {flashcards.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Interactive Active-Recall Flashcards (Click to flip)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flashcards.map((card, i) => {
                const isRevealed = revealedCardIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => setRevealedCardIndex(isRevealed ? null : i)}
                    className={`min-h-[140px] flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all hover:scale-[1.01] ${
                      isRevealed
                        ? isDark
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-emerald-500 bg-emerald-50'
                        : isDark
                        ? 'border-[#303134] bg-[#1e1f20]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Card {i + 1} of {flashcards.length}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isRevealed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-200 dark:bg-[#303134]'
                          }`}
                        >
                          {isRevealed ? 'Answer' : 'Question (Click to flip)'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">
                        {isRevealed ? card.a : card.q}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* General Result Output */}
        {result && (
          <div
            className={`rounded-2xl border p-6 shadow-sm animate-in fade-in ${
              isDark ? 'border-[#303134] bg-[#1e1f20]' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#303134] pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#9aa0a6]">
                Tutoring Solution
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <MarkdownRenderer content={result} />
          </div>
        )}
      </div>
    </div>
  );
}
