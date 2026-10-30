import React, { useState, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  Upload,
  Sparkles,
  Layers,
  Clock,
  MessageSquare,
  FileText,
  Copy,
  Check,
  Download,
  Film,
  RotateCcw,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { SAMPLE_MEDIA } from '../data/samples';
import { extractVideoFrames, fileToBase64, ExtractedFrame } from '../utils/fileHelpers';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface VideoLabProps {
  initialVideoUrl?: string;
  initialVideoTitle?: string;
}

export function VideoLab({ initialVideoUrl, initialVideoTitle }: VideoLabProps) {
  const [videoUrl, setVideoUrl] = useState<string>(
    initialVideoUrl || SAMPLE_MEDIA[0].url
  );
  const [videoTitle, setVideoTitle] = useState<string>(
    initialVideoTitle || SAMPLE_MEDIA[0].title
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [analysisMode, setAnalysisMode] = useState<string>('detailed_scenes');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoTitle(file.name);
      setAnalysisResult(null);
      setExtractedFrames([]);
    } catch (err) {
      console.error('Error loading video file:', err);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_MEDIA[0]) => {
    setVideoFile(null);
    setVideoUrl(sample.url);
    setVideoTitle(sample.title);
    setAnalysisResult(null);
    setExtractedFrames([]);
  };

  const handleSeekToSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleRunAnalysis = async () => {
    if (!videoUrl || isAnalyzing) return;
    setError(null);
    setIsAnalyzing(true);

    try {
      // 1. Attempt to extract representative key frames safely
      let frames: ExtractedFrame[] = extractedFrames;
      if (frames.length === 0) {
        try {
          frames = await extractVideoFrames(videoFile || videoUrl, 4);
          if (frames.length > 0) {
            setExtractedFrames(frames);
          }
        } catch (frameErr) {
          console.warn('Frame extraction skipped, proceeding with direct analysis:', frameErr);
          frames = [];
        }
      }

      // If videoFile is under 15MB, we can also send inline video base64, otherwise send extracted high-res frames with timestamps
      let videoBase64 = '';
      if (videoFile && videoFile.size < 15 * 1024 * 1024) {
        videoBase64 = await fileToBase64(videoFile);
      }

      const res = await fetch('/api/video/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64: videoBase64 || undefined,
          mimeType: videoFile?.type || 'video/mp4',
          frames: frames.map((f) => ({
            base64: f.base64,
            mimeType: f.mimeType,
            timestamp: f.timestamp,
          })),
          analysisMode,
          prompt: customQuestion.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video analysis failed.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to complete video analysis. Please check your video.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const blob = new Blob([analysisResult], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gemini-video-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const analysisOptions = [
    { id: 'detailed_scenes', label: 'Scene-by-Scene Breakdown', desc: 'Timestamps, actions, camera, text & audio' },
    { id: 'summary', label: 'Executive Summary & Takeaways', desc: 'Core narrative, key highlights & themes' },
    { id: 'transcription', label: 'Spoken Dialogue & Audio', desc: 'Transcribe spoken words and sound effects' },
    { id: 'objects', label: 'Object & Entity Catalog', desc: 'Inventory of objects, text labels & setting' },
    { id: 'qa', label: 'Custom Visual QA', desc: 'Ask specific questions about the clip' },
  ];

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-[#131314] overflow-y-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#303134] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-white">
                <Video className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-bold text-white">Gemini Video Lab & Scene Inspector</h1>
            </div>
            <p className="mt-1 text-xs text-[#9aa0a6]">
              Deep multimodal frame analysis, chronological scene indexing, and interactive timestamp scrubbing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleVideoUpload}
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-[#3c4043] bg-[#1e1f20] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#282a2c] transition-colors"
            >
              <Upload className="w-4 h-4 text-[#8ab4f8]" />
              <span>Upload Custom Video</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Video Player & Sample Select Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Video & Timeline Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-[#303134] shadow-lg">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                crossOrigin="anonymous"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-semibold text-white">{videoTitle}</h3>
                <p className="text-xs text-[#9aa0a6]">Click timestamps in the analysis to jump video</p>
              </div>
            </div>

            {/* Extracted Frame Strips (visual proof of multimodal processing) */}
            {extractedFrames.length > 0 && (
              <div className="rounded-xl border border-[#303134] bg-[#1e1f20] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9aa0a6]">
                    Extracted Temporal Frames ({extractedFrames.length})
                  </span>
                  <span className="text-[11px] text-[#8ab4f8]">Multi-frame Synchronized</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {extractedFrames.map((frame, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSeekToSeconds(frame.timeSeconds)}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-[#3c4043] hover:border-[#8ab4f8] transition-all"
                    >
                      <img
                        src={`data:${frame.mimeType};base64,${frame.base64}`}
                        alt="frame"
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-mono text-white">
                        {frame.timestamp}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sample video switcher chips */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                Or Test Preloaded Video Clips:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_MEDIA.filter((m) => m.type === 'video').map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`flex items-center gap-2 rounded-xl p-2 text-left border text-xs transition-colors ${
                      videoUrl === sample.url
                        ? 'border-[#8ab4f8] bg-[#8ab4f8]/15 text-white'
                        : 'border-[#303134] bg-[#1e1f20] text-[#c4c7c5] hover:bg-[#282a2c]'
                    }`}
                  >
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      className="h-10 w-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-medium truncate">{sample.title}</div>
                      <div className="text-[10px] text-[#9aa0a6]">Sample Clip</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Controls Column */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#303134] bg-[#1e1f20] p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                  Select Analysis Mode
                </label>
                <div className="space-y-1.5">
                  {analysisOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnalysisMode(opt.id)}
                      className={`w-full flex items-center justify-between rounded-xl p-3 text-left border transition-all ${
                        analysisMode === opt.id
                          ? 'border-[#4285f4] bg-[#4285f4]/15 text-white'
                          : 'border-[#303134] bg-[#131314] text-[#c4c7c5] hover:bg-[#282a2c]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{opt.label}</div>
                        <div className="text-[11px] text-[#9aa0a6]">{opt.desc}</div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          analysisMode === opt.id ? 'text-[#8ab4f8]' : 'text-[#9aa0a6]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom question if QA mode */}
              {analysisMode === 'qa' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                    Your Question About This Video
                  </label>
                  <textarea
                    rows={3}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g. Describe the lighting transitions between 0:05 and 0:15, or what brand is visible?"
                    className="w-full resize-none rounded-xl border border-[#3c4043] bg-[#131314] p-3 text-xs text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#9B72CB] p-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Video with Gemini 3.8...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Multimodal Inspection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Analysis Results Panel */}
        {analysisResult && (
          <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-6 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#303134] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8ab4f8]" />
                <h2 className="text-base font-semibold text-white">Gemini Video Inspection Report</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAnalysis}
                  className="flex items-center gap-1.5 rounded-lg border border-[#3c4043] bg-[#282a2c] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#37393b]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 rounded-lg bg-[#8ab4f8] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#aecbfa]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <MarkdownRenderer
              content={analysisResult}
              onTimestampClick={handleSeekToSeconds}
            />
          </div>
        )}
      </div>
    </div>
  );
}
