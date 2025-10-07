import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Eye } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (base64String: string) => void;
  className?: string;
  accept?: string;
  maxSize?: number;
  preview?: boolean;
  required?: boolean;
  disabled?: boolean;
  showCameraButton?: boolean;
  compressionQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const EnhancedImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Upload Image',
  value,
  onChange,
  className = '',
  accept = 'image/*',
  maxSize = 5,
  preview = true,
  required = false,
  disabled = false,
  showCameraButton = false,
  compressionQuality = 0.8,
  maxWidth = 1024,
  maxHeight = 1024
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (aspectRatio > 1) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', compressionQuality);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Image size should be less than ${maxSize}MB`);
      }
      const base64 = await resizeImage(file);
      onChange(base64);
    } catch (error: any) {
      setError(error.message || 'Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setError('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', compressionQuality);
        onChange(base64);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const clearImage = () => {
    onChange('');
    setError('');
  };

  const getImageInfo = (base64: string) => {
    try {
      const sizeInBytes = (base64.length * 3) / 4;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      return `${sizeInKB} KB`;
    } catch {
      return '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Take Photo</h3>
              <button onClick={closeCamera} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-gray-200 rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center mt-4 space-x-4">
              <button onClick={capturePhoto} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Capture
              </button>
              <button onClick={closeCamera} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-green-400'}`}
        onDragEnter={handleDragIn} onDragLeave={handleDragOut} onDragOver={handleDrag} onDrop={handleDrop} onClick={handleClick}>
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" disabled={disabled} />
        {value && preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img src={value} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button onClick={(e) => { e.stopPropagation(); setShowPreview(true); }} className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); clearImage(); }} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-center">
              Size: {getImageInfo(value)} | Click to replace
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {uploading ? 'Processing...' : 'Drop image here or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max {maxSize}MB • {accept}
              </p>
            </div>
            {showCameraButton && (
              <div className="mt-4">
                <button onClick={(e) => { e.stopPropagation(); openCamera(); }} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {showPreview && value && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="relative">
              <img src={value} alt="Full Preview" className="max-w-full max-h-screen object-contain" />
              <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
