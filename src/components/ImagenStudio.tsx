import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Wand2,
  Image as ImageIcon,
  Layers,
  ZoomIn,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { GeneratedImage, FileAttachment } from '../types';
import { IMAGE_STYLE_PRESETS } from '../data/samples';
import { fileToBase64 } from '../utils/fileHelpers';

interface ImagenStudioProps {
  onSendToChat: (text: string, files: FileAttachment[]) => void;
}

export function ImagenStudio({ onSendToChat }: ImagenStudioProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit / Inpainting state
  const [editBaseImage, setEditBaseImage] = useState<{ base64: string; previewUrl: string; mimeType: string } | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  // Generated images history
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    try {
      setIsEnhancing(true);
      const res = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'image' }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error('Enhance error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setError(null);
    setIsGenerating(true);

    try {
      const styleObj = IMAGE_STYLE_PRESETS.find((s) => s.id === selectedStyle);
      const fullPrompt = styleObj
        ? `${prompt.trim()}, ${styleObj.promptModifier}`
        : prompt.trim();

      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio,
          imageSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      if (data.images && data.images.length > 0) {
        const newImages: GeneratedImage[] = data.images.map((img: any, idx: number) => ({
          id: `img-${Date.now()}-${idx}`,
          url: img.url,
          prompt: prompt.trim(),
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio,
          timestamp: Date.now(),
        }));
        setImages((prev) => [...newImages, ...prev]);
        setPreviewImage(newImages[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setEditBaseImage({
        base64,
        previewUrl: URL.createObjectURL(file),
        mimeType: file.type || 'image/png',
      });
    } catch (err) {
      console.error('Failed to load edit image:', err);
    }
  };

  const handleApplyEdit = async () => {
    if (!editBaseImage || !editPrompt.trim() || isGenerating) return;
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/images/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          imageBase64: editBaseImage.base64,
          mimeType: editBaseImage.mimeType,
          model: 'gemini-3.1-flash-lite-image',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to edit image');
      }

      if (data.images && data.images.length > 0) {
        const newImg: GeneratedImage = {
          id: `edit-${Date.now()}`,
          url: data.images[0].url,
          prompt: `Edit: ${editPrompt.trim()}`,
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          timestamp: Date.now(),
        };
        setImages((prev) => [newImg, ...prev]);
        setPreviewImage(newImg);
      }
    } catch (err: any) {
      setError(err.message || 'Image editing failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `gemini-imagen-${img.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendImageToChat = (img: GeneratedImage) => {
    const base64 = img.url.split(',')[1];
    const attachment: FileAttachment = {
      id: img.id,
      name: `imagen-${img.id}.png`,
      mimeType: 'image/png',
      base64,
      previewUrl: img.url,
      size: Math.round(base64.length * 0.75),
      type: 'image',
    };
    onSendToChat(`Analyze this generated image created with prompt: "${img.prompt}"`, [attachment]);
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-[#131314] overflow-y-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Title & Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#303134] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#9B72CB] to-[#D96570] text-white">
                <ImageIcon className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-bold text-white">Imagen 3 & Gemini Image Studio</h1>
            </div>
            <p className="mt-1 text-xs text-[#9aa0a6]">
              Generate high-resolution art, concept designs, and edits using Gemini multimodal prompt conditioning (100% Free Tier · Zero Quota Limits)
            </p>
          </div>

          <div className="flex rounded-xl bg-[#1e1f20] p-1 border border-[#303134]">
            <button
              onClick={() => setActiveTab('generate')}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'bg-gradient-to-r from-[#9B72CB] to-[#D96570] text-white'
                  : 'text-[#9aa0a6] hover:text-white'
              }`}
            >
              Text to Image
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-gradient-to-r from-[#9B72CB] to-[#D96570] text-white'
                  : 'text-[#9aa0a6] hover:text-white'
              }`}
            >
              Image to Image / Edit
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Tab 1: Generate */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls Column */}
            <div className="lg:col-span-5 space-y-5">
              {/* Prompt box */}
              <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6]">
                    Creative Prompt
                  </label>
                  <button
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#8ab4f8] hover:text-[#aecbfa] disabled:opacity-40 transition-colors"
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>Enhance with Gemini</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A luminescent mechanical hummingbird hovering over a glowing crystal lotus in a misty cyberpunk conservatory..."
                  className="w-full resize-none rounded-xl border border-[#3c4043] bg-[#131314] p-3 text-sm text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none"
                />

                {/* Aspect Ratio */}
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: '1:1', label: '1:1', sub: 'Square' },
                      { id: '16:9', label: '16:9', sub: 'Wide' },
                      { id: '9:16', label: '9:16', sub: 'Story' },
                      { id: '4:3', label: '4:3', sub: 'Photo' },
                      { id: '3:4', label: '3:4', sub: 'Portrait' },
                    ].map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs border transition-colors ${
                          aspectRatio === ratio.id
                            ? 'border-[#8ab4f8] bg-[#8ab4f8]/15 text-white'
                            : 'border-[#303134] bg-[#131314] text-[#9aa0a6] hover:bg-[#282a2c]'
                        }`}
                      >
                        <span className="font-semibold">{ratio.label}</span>
                        <span className="text-[10px] text-[#9aa0a6]">{ratio.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Presets */}
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                    Visual Style Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {IMAGE_STYLE_PRESETS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs border transition-colors ${
                          selectedStyle === style.id
                            ? 'border-[#9b72cb] bg-[#9b72cb]/20 text-white font-medium'
                            : 'border-[#303134] bg-[#131314] text-[#c4c7c5] hover:bg-[#282a2c]'
                        }`}
                      >
                        <span>{style.label}</span>
                        {selectedStyle === style.id && (
                          <Sparkles className="w-3 h-3 text-[#c58af9]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9B72CB] via-[#D96570] to-[#FBBC04] p-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Art with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Display & Gallery */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Primary Active Image Display */}
              <div className="relative flex aspect-square w-full items-center justify-center rounded-2xl border border-[#303134] bg-[#1e1f20] overflow-hidden shadow-inner">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3 text-center p-6">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#9B72CB] to-[#D96570] p-1 animate-spin">
                      <div className="h-full w-full rounded-full bg-[#1e1f20]" />
                    </div>
                    <p className="text-sm font-medium text-white">Synthesizing pixels with Imagen...</p>
                    <p className="text-xs text-[#9aa0a6]">Constructing lighting, shaders, and composition</p>
                  </div>
                ) : previewImage ? (
                  <div className="group relative h-full w-full">
                    <img
                      src={previewImage.url}
                      alt={previewImage.prompt}
                      className="h-full w-full object-contain bg-black"
                    />
                    {/* Hover Overlay Controls */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-white truncate max-w-[60%]">
                        {previewImage.prompt}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(previewImage)}
                          className="rounded-lg bg-[#282a2c]/80 p-2 text-white hover:bg-[#37393b] backdrop-blur-sm"
                          title="Download PNG"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendImageToChat(previewImage)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#8ab4f8] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#aecbfa]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-[#9aa0a6] p-6">
                    <ImageIcon className="w-12 h-12 stroke-[1.2]" />
                    <p className="text-sm font-medium text-white">No images generated yet</p>
                    <p className="text-xs max-w-sm">
                      Type a prompt on the left or select a style preset to generate production-quality visuals.
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Generations Strip */}
              {images.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9aa0a6]">
                    History ({images.length})
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2">
                    {images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setPreviewImage(img)}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                          previewImage?.id === img.id
                            ? 'border-[#8ab4f8] ring-2 ring-[#8ab4f8]/50'
                            : 'border-[#303134] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="thumbnail" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Edit / Inpainting */}
        {activeTab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 rounded-2xl border border-[#303134] bg-[#1e1f20] p-5">
              <h2 className="text-sm font-semibold text-white">Upload Base Image to Modify</h2>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3c4043] bg-[#131314] p-6 text-center">
                {editBaseImage ? (
                  <div className="relative max-h-60 overflow-hidden rounded-lg">
                    <img src={editBaseImage.previewUrl} alt="base" className="max-h-60 object-contain" />
                    <button
                      onClick={() => setEditBaseImage(null)}
                      className="absolute top-2 right-2 rounded-lg bg-black/70 p-1 text-white hover:bg-black"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="hidden"
                    />
                    <ImageIcon className="mx-auto h-10 w-10 text-[#9aa0a6] mb-2" />
                    <span className="text-xs font-medium text-[#8ab4f8]">Click to upload an image</span>
                    <span className="block text-[11px] text-[#9aa0a6] mt-1">PNG, JPG, or WebP</span>
                  </label>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-2">
                  Edit Instruction
                </label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g. Add neon aviator sunglasses to the character, or replace background with a sunset over snow-covered peaks..."
                  className="w-full resize-none rounded-xl border border-[#3c4043] bg-[#131314] p-3 text-sm text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none"
                />
              </div>

              <button
                onClick={handleApplyEdit}
                disabled={!editBaseImage || !editPrompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#9B72CB] p-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Applying Gemini Edit...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Edit</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Display */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#303134] bg-[#1e1f20] p-5">
              {previewImage ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black">
                    <img src={previewImage.url} alt="Edited" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleDownload(previewImage)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#3c4043] bg-[#282a2c] py-2 text-xs font-medium text-white hover:bg-[#37393b]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => handleSendImageToChat(previewImage)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#8ab4f8] py-2 text-xs font-medium text-black hover:bg-[#aecbfa]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Analyze in Chat</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#9aa0a6] p-8">
                  <Layers className="mx-auto w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-medium text-white">Edited result will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
