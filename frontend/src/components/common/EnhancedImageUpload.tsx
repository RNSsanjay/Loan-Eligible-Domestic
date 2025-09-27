import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  label?: string;
  value?: string; // base64 string or URL
  onChange: (base64String: string) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  preview?: boolean;
  required?: boolean;
  disabled?: boolean;
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
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError('');
    setUploading(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setUploading(false);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Image size should be less than ${maxSize}MB`);
      setUploading(false);
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      onChange(base64);
    } catch (error) {
      setError('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-green-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          dragActive ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-green-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          error ? 'border-green-300' : ''
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {value && preview ? (
          <div className="relative group">
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClick}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-white transition-colors duration-200"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-gray-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-500 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                <p className="text-sm text-gray-600">Processing image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="w-10 h-10 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to {maxSize}MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};