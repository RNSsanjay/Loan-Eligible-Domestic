import React, { useState, useRef } from 'react';
import { operatorAPI } from '../../services/api';

interface CowImageUploadProps {
  label: string;
  onImageSelect: (base64: string, file: File, processedData?: any) => void;
  currentImage?: string;
  required?: boolean;
  description?: string;
  imageType?: 'face' | 'nose';
  applicationId?: string;
  autoProcess?: boolean;
}

export const CowImageUpload: React.FC<CowImageUploadProps> = ({
  label,
  onImageSelect,
  currentImage,
  required = false,
  description,
  imageType,
  applicationId,
  autoProcess = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
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
    
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      
      // Process image if auto-processing is enabled and we have the required data
      if (autoProcess && imageType && applicationId) {
        try {
          setProcessing(true);
          const processed = await operatorAPI.processCowImage({
            image_base64: base64,
            image_type: imageType,
            application_id: applicationId
          });
          
          setProcessedData(processed);
          onImageSelect(base64, file, processed);
        } catch (error) {
          console.error('Image processing failed:', error);
          // Still call onImageSelect with original image
          onImageSelect(base64, file);
        } finally {
          setProcessing(false);
        }
      } else {
        onImageSelect(base64, file);
      }
      
      setUploading(false);
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

  const removeImage = () => {
    setPreview(null);
    setProcessedData(null);
    onImageSelect('', new File([], ''));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
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
              {uploading ? 'Uploading image...' : 'Processing image...'}
            </p>
            {processing && (
              <p className="text-xs text-gray-500 mt-1">
                Enhancing image quality and detecting patterns...
              </p>
            )}
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Cow image preview"
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
            
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                {processedData ? 'Image processed and enhanced' : 'Image uploaded successfully'}
              </span>
            </div>
            
            {processedData && (
              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                <div className="font-medium">Processing completed:</div>
                <div>{processedData.processed_data?.processing_notes}</div>
                {imageType === 'nose' && processedData.processed_data?.zoom_coordinates && (
                  <div className="mt-1">✓ Nose pattern detected and enhanced</div>
                )}
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
    </div>
  );
};