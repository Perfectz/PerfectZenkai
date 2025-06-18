import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '../../../shared/ui/button';
import { PhotoUploadProps } from '../types';
import imageCompression from 'browser-image-compression';

export function PhotoUpload({ 
  onPhotoCapture, 
  maxSizeMB = 1, 
  disabled = false 
}: PhotoUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const compressImage = async (file: File): Promise<string> => {
    try {
      const options = {
        maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
        quality: 0.8
      };
      
      const compressedFile = await imageCompression(file, options);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Image compression failed:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsProcessing(true);
    try {
      const compressedImageData = await compressImage(file);
      onPhotoCapture(compressedImageData);
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0);
    
    setIsProcessing(true);
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      });
      
      // Create file from blob for compression
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      const compressedImageData = await compressImage(file);
      
      onPhotoCapture(compressedImageData);
      stopCamera();
    } catch (error) {
      console.error('Failed to capture photo:', error);
      alert('Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="relative">
        <video 
          ref={videoRef}
          className="w-full max-w-md mx-auto rounded-lg"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            onClick={capturePhoto}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Processing...' : 'Capture Photo'}
          </Button>
          <Button 
            onClick={stopCamera}
            variant="outline"
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-center">
        <Button
          onClick={startCamera}
          disabled={disabled || isProcessing}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Take Photo
        </Button>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload photo"
      />
      
      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          Processing image...
        </div>
      )}
    </div>
  );
} 