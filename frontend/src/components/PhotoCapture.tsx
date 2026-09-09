import { useState, useRef, useEffect } from "react";
import { X, Camera, Upload } from "lucide-react";
import { Button } from "./ui";

interface PhotoCaptureProps {
  maxPhotos?: number;
  onChange: (files: File[]) => void;
}

export default function PhotoCapture({
  maxPhotos = 4,
  onChange,
}: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    setCameraLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      let message = "Camera not available";
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          message = "Camera permission denied — use gallery instead";
        } else if (err.name === "NotFoundError") {
          message = "No camera found on this device";
        } else if (err.name === "NotSupportedError") {
          message = "Camera not supported — use gallery instead";
        }
      }
      setCameraError(message);
    } finally {
      setCameraLoading(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const newPhotos = [...photos, file];
        setPhotos(newPhotos);
        onChange(newPhotos);
      }
      stopCamera();
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesToAdd = Array.from(e.target.files);
    const availableSlots = maxPhotos - photos.length;
    const filesToProcess = filesToAdd.slice(0, availableSlots);

    const newPhotos = [...photos, ...filesToProcess];
    setPhotos(newPhotos);
    onChange(newPhotos);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onChange(newPhotos);
  };

  const isFull = photos.length >= maxPhotos;

  return (
    <div className="space-y-4">
      {cameraError && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {cameraError}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="secondary"
          type="button"
          onClick={startCamera}
          disabled={cameraLoading || isFull}
          className="text-sm px-3 py-1"
        >
          <Camera className="w-4 h-4 inline mr-1" />
          {cameraLoading ? "Starting..." : "Take Photo"}
        </Button>

        <Button
          variant="secondary"
          type="button"
          disabled={isFull}
          onClick={() => fileInputRef.current?.click()}
          className="text-sm px-3 py-1"
        >
          <Upload className="w-4 h-4 inline mr-1" />
          Choose from Gallery
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {isFull && (
        <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
          Maximum {maxPhotos} photos reached
        </p>
      )}

      {photos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Photos ({photos.length}/{maxPhotos})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Captured ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {cameraActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full mx-4 space-y-4 p-4">
            <h3 className="font-semibold text-slate-800">Take a Photo</h3>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full bg-black rounded-lg"
            />
            <div className="flex gap-2 justify-center">
              <Button
                variant="secondary"
                type="button"
                onClick={stopCamera}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={capturePhoto}
                className="text-sm"
              >
                Capture
              </Button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
