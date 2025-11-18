import { useState, useRef, useCallback } from "react";
import { Camera, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>("");

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1920, height: 1080 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsReady(true);
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.95);
        stopCamera();
        onCapture(imageData);
      }
    }
  }, [onCapture, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Capture Test Strip</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden bg-black">
          {error ? (
            <Card className="absolute inset-4 flex flex-col items-center justify-center gap-4 bg-card">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-muted-foreground px-4">{error}</p>
              <Button onClick={startCamera}>Try Again</Button>
            </Card>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Alignment Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[80%] max-w-md aspect-[3/4]">
                  {/* Corner guides */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  
                  {/* Guide text */}
                  <div className="absolute -top-12 left-0 right-0 text-center">
                    <p className="text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm inline-block">
                      Align test strip within guides
                    </p>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              {isReady && (
                <div className="absolute top-4 right-4">
                  <div className="bg-success/20 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-success text-sm font-medium">Ready</span>
                  </div>
                </div>
              )}
            </>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-border bg-card">
          <div className="max-w-md mx-auto flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={captureImage}
              disabled={!isReady}
              className="flex-1 bg-gradient-ocean border-0"
            >
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ensure good lighting and the test strip is fully visible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
