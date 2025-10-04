import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { ManualNoseZoom } from './ManualNoseZoom';
import { operatorAPI } from '../../services/api';

interface CowFaceUploadProps {
  label: string;
  onImageProcessed: (processedData: any) => void;
  currentImage?: string;
  required?: boolean;
  description?: string;
  applicationId?: string;
}

export const CowFaceUpload: React.FC<CowFaceUploadProps> = ({
  label,
  onImageProcessed,
  currentImage,
  required = false,
  description,
  applicationId
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showZoomInterface, setShowZoomInterface] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setCurrentFile(base64);
      setUploading(false);
      
      // Show zoom interface for manual nose selection
      setShowZoomInterface(true);
    };
    
    reader.onerror = () => {
      alert('Error reading file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleZoomComplete = async (zoomCoordinates: { x: number; y: number; width: number; height: number }) => {
    if (!applicationId) {
      alert('Application ID is required for processing');
      return;
    }

    try {
      setProcessing(true);
      setShowZoomInterface(false);

      const result = await operatorAPI.processCowFaceWithManualZoom({
        image_base64: currentFile,
        zoom_coordinates: zoomCoordinates,
        application_id: applicationId
      });

      if (result.success) {
        setProcessedData(result);
        onImageProcessed(result);
      } else {
        alert(`Processing failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleZoomCancel = () => {
    setShowZoomInterface(false);
    setPreview(null);
    setCurrentFile('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setPreview(null);
    setProcessedData(null);
    setCurrentFile('');
    onImageProcessed(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryProcessing = () => {
    if (currentFile) {
      setShowZoomInterface(true);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer
            ${isDragging 
              ? 'border-green-500 bg-green-50' 
              : preview 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {uploading || processing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                {uploading ? 'Uploading image...' : 'Processing nose pattern...'}
              </p>
              {processing && (
                <p className="text-xs text-gray-500 mt-1">
                  Analyzing nose pattern for unique identification...
                </p>
              )}
            </div>
          ) : preview ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Cow face preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {processedData ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Nose pattern processed and analyzed</span>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded text-xs text-green-700 space-y-1">
                    <div className="font-medium">Processing Results:</div>
                    <div>✓ Pattern Hash: {processedData.pattern_hash?.substring(0, 16)}...</div>
                    <div>✓ Confidence: {(processedData.pattern_confidence * 100).toFixed(1)}%</div>
                    <div>✓ Features Extracted: {processedData.pattern_features?.length || 0}</div>
                    {processedData.is_duplicate && (
                      <div className="text-red-600 font-medium">⚠️ Duplicate pattern detected!</div>
                    )}
                  </div>
                  
                  <Button
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      retryProcessing();
                    }}
                  >
                    Reselect Nose Area
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Image uploaded. Please select nose area for processing.</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowZoomInterface(true);
                    }}
                  >
                    Select Nose Area
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Each cow can only have ONE loan application</li>
                <li>Nose patterns are unique identifiers (like fingerprints)</li>
                <li>Duplicate patterns will be rejected automatically</li>
                <li>Upload a clear, well-lit front-facing cow image</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showZoomInterface && (
        <ManualNoseZoom
          cowFaceImage={currentFile}
          onZoomComplete={handleZoomComplete}
          onCancel={handleZoomCancel}
        />
      )}
    </>
  );
};