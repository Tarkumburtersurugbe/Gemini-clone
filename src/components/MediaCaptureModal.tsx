import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, Square, X, RotateCcw, Check, Sparkles, Upload, AlertCircle } from 'lucide-react';
import { FileAttachment } from '../types';
import { fileToBase64 } from '../utils/fileHelpers';

interface MediaCaptureModalProps {
  isOpen: boolean;
  type: 'camera' | 'microphone';
  onClose: () => void;
  onCapture: (attachment: FileAttachment) => void;
}

export function MediaCaptureModal({ isOpen, type, onClose, onCapture }: MediaCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{ url: string; base64: string } | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const fallbackFileInputRef = useRef<HTMLInputElement>(null);

  // Start media stream on open
  useEffect(() => {
    if (!isOpen) {
      stopMedia();
      return;
    }
    setError(null);
    setCapturedPhoto(null);
    setRecordedAudio(null);
    setIsRecording(false);
    setRecordingSeconds(0);

    async function initMedia() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          `Your browser or current frame does not support live ${type} access. You can upload a file instead.`
        );
        return;
      }

      try {
        if (type === 'camera') {
          const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        } else if (type === 'microphone') {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true });
          setStream(s);
        }
      } catch (err: any) {
        // Handle iframe/browser permission policy restriction gracefully
        const isRestricted =
          err.name === 'NotAllowedError' ||
          err.name === 'SecurityError' ||
          err.message?.includes('not allowed') ||
          err.message?.includes('Permission denied');

        if (isRestricted) {
          setError(
            `Device ${type === 'camera' ? 'camera' : 'microphone'} access is restricted by your browser in this preview frame. You can upload an image or audio recording from your device instead.`
          );
        } else {
          setError(`Unable to access ${type}: ${err.message || 'Device unavailable.'}`);
        }
      }
    }

    initMedia();

    return () => {
      stopMedia();
    };
  }, [isOpen, type]);

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);
    }
  };

  const handleConfirmPhoto = () => {
    if (!capturedPhoto) return;
    const base64 = capturedPhoto.split(',')[1];
    const attachment: FileAttachment = {
      id: `photo-${Date.now()}`,
      name: `webcam-photo-${new Date().toISOString().slice(0, 19)}.jpg`,
      mimeType: 'image/jpeg',
      base64,
      previewUrl: capturedPhoto,
      size: Math.round(base64.length * 0.75),
      type: 'image',
    };
    onCapture(attachment);
    onClose();
  };

  const startAudioRecording = () => {
    if (!stream) return;
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setRecordedAudio({ url: audioUrl, base64 });
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConfirmAudio = () => {
    if (!recordedAudio) return;
    const attachment: FileAttachment = {
      id: `audio-${Date.now()}`,
      name: `voice-note-${new Date().toISOString().slice(0, 19)}.webm`,
      mimeType: 'audio/webm',
      base64: recordedAudio.base64,
      previewUrl: recordedAudio.url,
      size: Math.round(recordedAudio.base64.length * 0.75),
      type: 'audio',
    };
    onCapture(attachment);
    onClose();
  };

  const handleFallbackFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      onCapture({
        id: `file-${Date.now()}`,
        name: file.name,
        mimeType: file.type || (type === 'camera' ? 'image/jpeg' : 'audio/webm'),
        base64,
        previewUrl,
        size: file.size,
        type: type === 'camera' ? 'image' : 'audio',
      });
      onClose();
    } catch (err) {
      console.warn('Fallback file upload error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl border border-[#3c4043] bg-[#1e1f20] shadow-2xl overflow-hidden">
        {/* Hidden Fallback Input */}
        <input
          type="file"
          ref={fallbackFileInputRef}
          onChange={handleFallbackFileUpload}
          accept={type === 'camera' ? 'image/*' : 'audio/*'}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#303134] px-5 py-3.5">
          <div className="flex items-center gap-2">
            {type === 'camera' ? (
              <Camera className="w-5 h-5 text-[#8ab4f8]" />
            ) : (
              <Mic className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="font-semibold text-white">
              {type === 'camera' ? 'Snap Photo for Multimodal Analysis' : 'Record Voice Note'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#9aa0a6] hover:bg-[#282a2c] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => fallbackFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-[#4285F4] hover:bg-[#3367d6] text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose {type === 'camera' ? 'Image File' : 'Audio File'} from Device</span>
                </button>
              </div>
            </div>
          )}

          {type === 'camera' ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden border border-[#303134]">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Snapshot" className="h-full w-full object-cover" />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                {capturedPhoto ? (
                  <>
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#3c4043] bg-[#282a2c] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#37393b]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake
                    </button>
                    <button
                      onClick={handleConfirmPhoto}
                      className="flex items-center gap-1.5 rounded-lg bg-[#8ab4f8] px-4 py-2 text-xs font-medium text-black hover:bg-[#aecbfa]"
                    >
                      <Check className="w-4 h-4" />
                      Attach to Gemini
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleTakePhoto}
                    disabled={!stream}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4285F4] to-[#9B72CB] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#4285F4]/30 hover:opacity-90 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Photo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center py-6 gap-5">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#131314] border border-[#303134]">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                )}
                <Mic
                  className={`w-10 h-10 ${
                    isRecording ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                  }`}
                />
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="font-mono text-xl font-semibold text-white">
                  {Math.floor(recordingSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(recordingSeconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-[#9aa0a6] mt-1">
                  {isRecording
                    ? 'Recording voice... speak clearly'
                    : recordedAudio
                    ? 'Recording ready'
                    : 'Click Start to record microphone audio'}
                </div>
              </div>

              {/* Playback preview if recorded */}
              {recordedAudio && (
                <audio controls src={recordedAudio.url} className="w-full mt-2 h-10" />
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <button
                    onClick={stopAudioRecording}
                    className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-600 shadow-md"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop Recording
                  </button>
                ) : recordedAudio ? (
                  <>
                    <button
                      onClick={startAudioRecording}
                      className="flex items-center gap-1.5 rounded-lg border border-[#3c4043] bg-[#282a2c] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#37393b]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Record Again
                    </button>
                    <button
                      onClick={handleConfirmAudio}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-black hover:bg-emerald-400"
                    >
                      <Check className="w-4 h-4" />
                      Attach Voice Note
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startAudioRecording}
                    disabled={!stream}
                    className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
