export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await fileToBase64(blob);
    return { base64, mimeType: blob.type || 'image/jpeg' };
  } catch (err) {
    console.warn('urlToBase64 fetch error:', err);
    return { base64: '', mimeType: 'image/jpeg' };
  }
}

export interface ExtractedFrame {
  base64: string;
  mimeType: string;
  timestamp: string;
  timeSeconds: number;
}

/**
 * Extracts key frames from a video file or video element with safe CORS & timeout fallback
 */
export async function extractVideoFrames(
  videoSource: string | File,
  maxFrames = 6
): Promise<ExtractedFrame[]> {
  return new Promise((resolve) => {
    const isFile = typeof videoSource !== 'string';
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    video.playsInline = true;

    // Only set crossOrigin for remote http(s) URLs, never for blob URLs
    if (!isFile && (videoSource.startsWith('http://') || videoSource.startsWith('https://'))) {
      video.crossOrigin = 'anonymous';
    }

    const videoUrl = isFile ? URL.createObjectURL(videoSource) : videoSource;
    video.src = videoUrl;

    let hasResolved = false;
    const safeResolve = (frames: ExtractedFrame[]) => {
      if (!hasResolved) {
        hasResolved = true;
        if (isFile) {
          try {
            URL.revokeObjectURL(videoUrl);
          } catch (e) {}
        }
        resolve(frames);
      }
    };

    // Safety timeout: If video takes longer than 4s to load, resolve gracefully with empty frames
    const timeoutId = setTimeout(() => {
      safeResolve([]);
    }, 4000);

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration && !isNaN(video.duration) ? video.duration : 10;
        const interval = duration / (maxFrames + 1);
        const frames: ExtractedFrame[] = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = Math.min(video.videoWidth || 480, 640);
        canvas.height = Math.round(
          (canvas.width / (video.videoWidth || 480)) * (video.videoHeight || 360)
        );

        for (let i = 1; i <= maxFrames; i++) {
          const frameTime = interval * i;
          const frame = await new Promise<ExtractedFrame>((fRes) => {
            const seekTimeout = setTimeout(() => {
              fRes({ base64: '', mimeType: 'image/jpeg', timestamp: '00:00', timeSeconds: frameTime });
            }, 1000);

            video.currentTime = frameTime;
            video.onseeked = () => {
              clearTimeout(seekTimeout);
              try {
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                  const base64 = dataUrl.split(',')[1] || '';
                  const minutes = Math.floor(frameTime / 60);
                  const seconds = Math.floor(frameTime % 60);
                  const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds
                    .toString()
                    .padStart(2, '0')}`;
                  fRes({
                    base64,
                    mimeType: 'image/jpeg',
                    timestamp,
                    timeSeconds: frameTime,
                  });
                  return;
                }
              } catch (canvasErr) {
                // Canvas tainted or not allowed
              }
              fRes({ base64: '', mimeType: 'image/jpeg', timestamp: '00:00', timeSeconds: frameTime });
            };
          });

          if (frame.base64) {
            frames.push(frame);
          }
        }

        clearTimeout(timeoutId);
        safeResolve(frames);
      } catch (err) {
        clearTimeout(timeoutId);
        safeResolve([]);
      }
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      // Graceful fallback: do NOT reject, resolve with empty array
      safeResolve([]);
    };
  });
}
