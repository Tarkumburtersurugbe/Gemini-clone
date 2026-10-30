import React, { useState, useRef } from 'react';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  FileText,
  Copy,
  Check,
  Upload,
  Radio,
  Loader2,
  Wand2,
} from 'lucide-react';
import { fileToBase64 } from '../utils/fileHelpers';
import { MarkdownRenderer } from '../utils/markdownRenderer';

export function AudioStudio() {
  const [activeTab, setActiveTab] = useState<'tts' | 'transcribe'>('tts');

  // TTS State
  const [ttsText, setTtsText] = useState(
    'Welcome to Google Gemini AI Studio. With our multimodal reasoning architecture, you can generate text, create vivid imagery, and deconstruct complex video and audio in real time.'
  );
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [voiceStyle, setVoiceStyle] = useState('Clear, articulate and engaging narrator');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Transcription State
  const [transcribeFile, setTranscribeFile] = useState<File | null>(null);
  const [transcribePrompt, setTranscribePrompt] = useState('Transcribe this audio verbatim with punctuation and speaker labels.');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const voices = [
    { id: 'Kore', name: 'Kore', desc: 'Warm, friendly, balanced' },
    { id: 'Puck', name: 'Puck', desc: 'Upbeat, animated, bright' },
    { id: 'Fenrir', name: 'Fenrir', desc: 'Deep, resonant, baritone' },
    { id: 'Zephyr', name: 'Zephyr', desc: 'Calm, soothing, reflective' },
    { id: 'Charon', name: 'Charon', desc: 'Authoritative, grounded' },
  ];

  const handleGenerateTTS = async () => {
    if (!ttsText.trim() || isGeneratingTts) return;
    setError(null);
    setIsGeneratingTts(true);

    try {
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText.trim(),
          voice: selectedVoice,
          style: voiceStyle.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize speech.');
      }

      setGeneratedAudioBase64(data.audioBase64);
    } catch (err: any) {
      setError(err.message || 'Speech generation failed.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownloadWav = () => {
    if (!generatedAudioBase64) return;
    const a = document.createElement('a');
    a.href = `data:audio/wav;base64,${generatedAudioBase64}`;
    a.download = `gemini-tts-${selectedVoice}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTranscribeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranscribeFile(file);
    setTranscriptionResult(null);
  };

  const handleRunTranscription = async () => {
    if (!transcribeFile || isTranscribing) return;
    setError(null);
    setIsTranscribing(true);

    try {
      const base64 = await fileToBase64(transcribeFile);
      const res = await fetch('/api/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: transcribeFile.type || 'audio/mp3',
          prompt: transcribePrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Audio transcription failed.');
      }

      setTranscriptionResult(data.transcription);
    } catch (err: any) {
      setError(err.message || 'Transcription failed.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-[#131314] overflow-y-auto p-4 md:p-8">
      <div className="mx-auto max-w-5xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#303134] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-[#4285F4] text-white">
                <Mic className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-bold text-white">Gemini Voice & Audio Studio</h1>
            </div>
            <p className="mt-1 text-xs text-[#9aa0a6]">
              Studio-grade speech synthesis (TTS) with expressive voice personas and verbatim audio transcription
            </p>
          </div>

          <div className="flex rounded-xl bg-[#1e1f20] p-1 border border-[#303134]">
            <button
              onClick={() => setActiveTab('tts')}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'tts'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#4285F4] text-white'
                  : 'text-[#9aa0a6] hover:text-white'
              }`}
            >
              Text to Speech (TTS)
            </button>
            <button
              onClick={() => setActiveTab('transcribe')}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'transcribe'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#4285F4] text-white'
                  : 'text-[#9aa0a6] hover:text-white'
              }`}
            >
              Audio Transcription
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Tab 1: TTS */}
        {activeTab === 'tts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-5 shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                    Speech Script
                  </label>
                  <textarea
                    rows={5}
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter text to speak..."
                    className="w-full resize-none rounded-xl border border-[#3c4043] bg-[#131314] p-3 text-sm text-white placeholder-[#9aa0a6] focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                    Voice Persona Style / Tone
                  </label>
                  <input
                    type="text"
                    value={voiceStyle}
                    onChange={(e) => setVoiceStyle(e.target.value)}
                    placeholder="e.g. Energetic podcast host, warm storytelling narrator..."
                    className="w-full rounded-xl border border-[#3c4043] bg-[#131314] px-3.5 py-2.5 text-xs text-white placeholder-[#9aa0a6] focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                    Select Voice
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`flex flex-col rounded-xl p-3 text-left border transition-all ${
                          selectedVoice === voice.id
                            ? 'border-emerald-500 bg-emerald-500/15 text-white'
                            : 'border-[#303134] bg-[#131314] text-[#c4c7c5] hover:bg-[#282a2c]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{voice.name}</span>
                          <Radio
                            className={`w-3.5 h-3.5 ${
                              selectedVoice === voice.id ? 'text-emerald-400' : 'text-[#9aa0a6]'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-[#9aa0a6] mt-1">{voice.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTts || !ttsText.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#4285F4] p-3 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isGeneratingTts ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Voice Audio...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Generate Voice Audio</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Playback Column */}
            <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 shadow-sm">
              {generatedAudioBase64 ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <Volume2 className="h-10 w-10 text-emerald-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">Gemini TTS Master Audio</h3>
                    <p className="text-xs text-[#9aa0a6]">
                      Voice: {selectedVoice} · 24kHz Uncompressed WAV
                    </p>
                  </div>

                  <audio
                    ref={audioRef}
                    src={`data:audio/wav;base64,${generatedAudioBase64}`}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full mt-2"
                    controls
                  />

                  <div className="flex items-center gap-2 w-full mt-2">
                    <button
                      onClick={handleDownloadWav}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .WAV</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#9aa0a6] p-6">
                  <Volume2 className="mx-auto w-12 h-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium text-white">No Audio Generated Yet</p>
                  <p className="text-xs mt-1">
                    Select a voice, enter text, and synthesize lifelike audio with Gemini 3.8 TTS.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Transcribe */}
        {activeTab === 'transcribe' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 shadow-sm">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleTranscribeUpload}
                accept="audio/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3c4043] bg-[#131314] p-8 text-center cursor-pointer hover:border-[#8ab4f8] transition-colors"
              >
                <Upload className="w-10 h-10 text-[#8ab4f8] mb-2" />
                <span className="text-sm font-medium text-white">
                  {transcribeFile ? transcribeFile.name : 'Upload Audio File for Gemini Transcription'}
                </span>
                <span className="text-xs text-[#9aa0a6] mt-1">MP3, WAV, WebM, M4A, FLAC, OGG</span>
              </div>

              {transcribeFile && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleRunTranscription}
                    disabled={isTranscribing}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#4285F4] px-5 py-2.5 text-xs font-semibold text-black hover:opacity-95 disabled:opacity-50"
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transcribing with Gemini 3.5...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Start Verbatim Transcription</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Results */}
            {transcriptionResult && (
              <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 shadow-md">
                <div className="flex items-center justify-between border-b border-[#303134] pb-3 mb-4">
                  <h3 className="text-sm font-semibold text-white">Verbatim Transcript</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transcriptionResult);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#3c4043] bg-[#282a2c] px-3 py-1.5 text-xs text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <MarkdownRenderer content={transcriptionResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
