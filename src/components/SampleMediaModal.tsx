import React from 'react';
import { X, Play, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';
import { SAMPLE_MEDIA } from '../data/samples';
import { SampleMediaItem } from '../types';

interface SampleMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleMediaItem, target: 'chat' | 'video') => void;
}

export function SampleMediaModal({ isOpen, onClose, onSelectSample }: SampleMediaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#3c4043] bg-[#1e1f20] shadow-2xl shadow-black overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#303134] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Gemini Multimodal Sample Showcase</h2>
              <p className="text-xs text-[#9aa0a6]">
                Instant high-resolution videos, charts, diagrams, and OCR documents to test effortlessly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9aa0a6] hover:bg-[#282a2c] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_MEDIA.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-xl border border-[#303134] bg-[#131314] overflow-hidden hover:border-[#8ab4f8]/60 transition-all shadow-md"
              >
                {/* Media Preview Banner */}
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                    {item.type === 'video' ? (
                      <>
                        <Play className="h-3 w-3 fill-current text-[#8ab4f8]" />
                        <span>Video Clip</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-3 w-3 text-[#d96570]" />
                        <span>High-Res Visual</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <p className="mt-1 text-xs text-[#9aa0a6] line-clamp-2">{item.description}</p>
                    <div className="mt-2.5 rounded-lg bg-[#1e1f20] p-2 text-[11.5px] text-[#c4c7c5] border border-[#303134]">
                      <span className="font-semibold text-[#8ab4f8]">Suggested prompt:</span>{' '}
                      <span className="italic">"{item.suggestedPrompt}"</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center gap-2 pt-2 border-t border-[#303134]/60">
                    {item.type === 'video' ? (
                      <>
                        <button
                          onClick={() => {
                            onSelectSample(item, 'video');
                            onClose();
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#4285F4] to-[#9B72CB] px-3 py-1.5 text-xs font-medium text-white hover:opacity-95 shadow-sm"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Inspect in Video Lab</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectSample(item, 'chat');
                            onClose();
                          }}
                          className="rounded-lg border border-[#3c4043] bg-[#282a2c] px-3 py-1.5 text-xs font-medium text-[#e3e3e3] hover:bg-[#37393b]"
                        >
                          Send to Chat
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectSample(item, 'chat');
                          onClose();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#8ab4f8] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#aecbfa] transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Analyze with Gemini Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
