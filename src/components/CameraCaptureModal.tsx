import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: 'user',
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.error('Camera error:', err);
      setError(
        'Unable to access camera. Please ensure camera permissions are allowed in your browser settings.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;

    // Trigger cute 3-second countdown
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          performCapture();
          return null;
        }
        soundEffects.playBubblePop();
        return prev - 1;
      });
    }, 800);
  };

  const performCapture = () => {
    if (!videoRef.current) return;

    soundEffects.playCameraShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 250);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror the image horizontally for natural selfie view
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onCapture(dataUrl);
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-4 border-sakura-100 flex flex-col items-center">
        {/* Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 rounded-3xl pointer-events-none animate-ping" />
        )}

        {/* Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-100 text-pink-600 rounded-full">
              <Camera size={20} />
            </span>
            <h3 className="font-patrick text-2xl text-gray-800">Polaroid Camera Studio 📸</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative mt-5 w-full aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-pink-200">
          {error ? (
            <div className="p-6 text-center text-rose-300">
              <p className="font-quicksand text-sm mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              {/* Countdown badge */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="font-caveat text-8xl font-bold text-white drop-shadow-lg animate-bounce">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-center gap-4 w-full">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 font-quicksand text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={!!error || countdown !== null}
            onClick={takeSnapshot}
            className="px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-full font-quicksand font-semibold text-base shadow-lg shadow-pink-200 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles size={18} />
            {countdown !== null ? 'Smiling...' : 'Snap Polaroid!'}
          </button>
        </div>
      </div>
    </div>
  );
};
