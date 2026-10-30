import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Video,
  Image as ImageIcon,
  MessageSquare,
  Code2,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Globe,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onContinueWithGoogle: () => void;
  onEnterStudio: () => void;
  currentUser: UserProfile | null;
  onSignOut?: () => void;
  onOpenDeleteHistory: () => void;
}

export function LandingPage({
  onContinueWithGoogle,
  onEnterStudio,
  currentUser,
  onSignOut,
  onOpenDeleteHistory,
}: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const capabilityCards = [
    {
      tag: 'Writing & Ideas',
      title: 'Draft, brainstorm & edit',
      prompt: 'Draft an executive pitch deck outline for our sustainable vertical farming initiative with market sizing and revenue milestones.',
      icon: <MessageSquare className="w-4 h-4 text-[#8ab4f8]" />,
      color: 'from-[#4285F4]/20 to-transparent',
    },
    {
      tag: 'Video & Media',
      title: 'Analyze video scene-by-scene',
      prompt: 'Deconstruct this 4K drone video: chronological timestamps, camera motion, visual lighting changes, and narrative takeaways.',
      icon: <Video className="w-4 h-4 text-[#9b72cb]" />,
      color: 'from-[#9B72CB]/20 to-transparent',
    },
    {
      tag: 'Visual Art',
      title: 'Create concept art in Imagen',
      prompt: 'Cinematic wide-angle photo of an illuminated glass greenhouse laboratory on Mars during a blue dust storm, 8K, photorealistic.',
      icon: <ImageIcon className="w-4 h-4 text-[#d96570]" />,
      color: 'from-[#D96570]/20 to-transparent',
    },
    {
      tag: 'Coding & Architecture',
      title: 'Develop, debug & refactor',
      prompt: 'Write an asynchronous pipeline in TypeScript that decodes audio streams, manages backpressure, and handles network failover gracefully.',
      icon: <Code2 className="w-4 h-4 text-[#fbbc04]" />,
      color: 'from-[#FBBC04]/20 to-transparent',
    },
  ];

  const faqs = [
    {
      q: 'What is Gemini AI Studio?',
      a: 'Gemini is Google\'s next-generation multimodal AI assistant designed to collaborate with you on text generation, coding, image creation, video scene analysis, and voice synthesis.',
    },
    {
      q: 'Can I delete my chat history and personal activity?',
      a: 'Yes, absolutely. You have complete control over your data. You can delete individual chat threads, erase activity from the last hour or today, or permanently delete your entire history with one click in the Gemini Apps Activity manager.',
    },
    {
      q: 'Is Gemini free to use?',
      a: 'Yes. Gemini AI Studio is optimized for Google\'s Free Tier, featuring multi-model cascade failover (Gemini 3.5 Flash Lite & Gemini Flash Lite) and free high-resolution image generation with zero quota limitations.',
    },
    {
      q: 'What media can Gemini analyze?',
      a: 'Gemini natively understands multimodal inputs including photos (JPEG, PNG, WebP), video files (MP4, WebM), audio voice notes, PDFs, codebases, and tabular data.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex flex-col justify-between selection:bg-[#8ab4f8]/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#303134]/60 bg-[#131314]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4285F4] via-[#9B72CB] to-[#D96570] p-[1.5px] shadow-lg shadow-[#4285F4]/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#131314]">
              <Sparkles className="h-4 w-4 text-[#8ab4f8] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">Google</span>
            <span className="text-lg font-semibold tracking-tight text-[#c4c7c5]">Gemini</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenDeleteHistory}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#3c4043] bg-[#1e1f20] px-3 py-1.5 text-xs text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete History</span>
              </button>
              <button
                onClick={onEnterStudio}
                className="flex items-center gap-2 rounded-xl bg-[#8ab4f8] px-4 py-2 text-xs font-semibold text-black hover:bg-[#aecbfa] transition-colors shadow-sm"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onContinueWithGoogle}
              className="flex items-center gap-2 rounded-xl border border-[#3c4043] bg-[#1e1f20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#282a2c] hover:border-[#8ab4f8] transition-all shadow-sm"
            >
              {/* Google G */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#4285F4]/15 via-[#9B72CB]/15 to-[#D96570]/10 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#303134] bg-[#1e1f20]/80 px-4 py-1.5 text-xs text-[#9aa0a6] backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#8ab4f8]" />
            <span>Google's Next-Generation Multimodal AI</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Meet Gemini, your <br />
            <span className="gemini-gradient-text">AI assistant from Google</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#9aa0a6] max-w-2xl mx-auto font-normal leading-relaxed">
            Supercharge your creativity and productivity. Chat to write, plan, learn, generate imagery, and analyze videos effortlessly.
          </p>

          {/* Sign In / CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            {/* Continue with Google button */}
            <button
              onClick={onContinueWithGoogle}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-[#1f1f1f] hover:bg-[#f1f3f4] transition-all shadow-xl shadow-white/5 active:scale-[0.98]"
            >
              {/* Google G Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Direct Studio button */}
            <button
              onClick={onEnterStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#3c4043] bg-[#1e1f20] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#282a2c] hover:border-[#8ab4f8] transition-all"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-4 h-4 text-[#8ab4f8]" />
            </button>
          </div>

          {/* Privacy & History Deletion Guarantee */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#9aa0a6]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Google Account Protected · Delete history anytime</span>
          </div>
        </div>
      </section>

      {/* Interactive Prompt Showcase Grid */}
      <section className="px-6 py-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">What would you like to explore?</h2>
          <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">Select a prompt to try Gemini instantly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilityCards.map((card, idx) => (
            <div
              key={idx}
              onClick={onEnterStudio}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#303134] bg-[#1e1f20]/60 p-5 hover:border-[#8ab4f8]/50 hover:bg-[#1e1f20] transition-all cursor-pointer shadow-sm overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.color} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="flex items-center gap-1.5 rounded-lg bg-[#282a2c] px-2.5 py-1 text-[11px] font-semibold text-[#c4c7c5]">
                    {card.icon}
                    <span>{card.tag}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#9aa0a6] group-hover:text-[#8ab4f8] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-[#8ab4f8] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-[#9aa0a6] leading-relaxed line-clamp-2 italic">
                  "{card.prompt}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flagship Pillars */}
      <section className="px-6 py-14 border-t border-[#303134]/50 bg-[#17181a]/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4285F4]/15 text-[#4285F4]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Multimodal Reasoning</h3>
              <p className="text-xs text-[#9aa0a6] leading-relaxed">
                Seamlessly interact with text, high-res photos, video files, and audio. Understand charts, diagrams, and complex codebases in one session.
              </p>
            </div>

            <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B72CB]/15 text-[#9B72CB]">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Video Lab & Scene Indexing</h3>
              <p className="text-xs text-[#9aa0a6] leading-relaxed">
                Break down videos with chronological timestamp indexing. Click any moment in Gemini's report to seek the video player to that exact second.
              </p>
            </div>

            <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Full Data & History Control</h3>
              <p className="text-xs text-[#9aa0a6] leading-relaxed">
                Your data belongs to you. Delete individual chats, clear your past hour, or erase all conversation history permanently at any time.
              </p>
              <button
                onClick={onOpenDeleteHistory}
                className="inline-flex items-center gap-1.5 text-xs text-[#8ab4f8] hover:underline pt-1"
              >
                <span>Manage Gemini Activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="px-6 py-14 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Frequently Asked Questions</h2>
        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#303134] bg-[#1e1f20] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-white hover:bg-[#282a2c] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#9aa0a6] transition-transform ${
                    activeFaq === i ? 'rotate-180 text-[#8ab4f8]' : ''
                  }`}
                />
              </button>
              {activeFaq === i && (
                <div className="border-t border-[#303134] p-4 text-xs text-[#9aa0a6] leading-relaxed bg-[#131314]/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#303134]/60 px-6 py-6 text-xs text-[#9aa0a6]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Google</span>
            <span>·</span>
            <span>Gemini AI Studio</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={onOpenDeleteHistory}
              className="hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete History</span>
            </button>
            <span className="hover:text-white cursor-pointer">Privacy & Terms</span>
            <span className="hover:text-white cursor-pointer">Google AI</span>
            <span className="hover:text-white cursor-pointer">Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
