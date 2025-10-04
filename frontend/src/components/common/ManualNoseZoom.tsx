import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';

interface ManualNoseZoomProps {
  cowFaceImage: string;
  onZoomComplete: (zoomCoordinates: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

export const ManualNoseZoom: React.FC<ManualNoseZoomProps> = ({
  cowFaceImage,
  onZoomComplete,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageScale, setImageScale] = useState({ scaleX: 1, scaleY: 1 });
  
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Calculate scaling to fit canvas while maintaining aspect ratio
      const canvasWidth = 800;
      const canvasHeight = 600;
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight;
      if (imgAspectRatio > canvasAspectRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgAspectRatio;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgAspectRatio;
      }
      
      // Center the image
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;
      
      // Store scaling information
      setImageScale({
        scaleX: img.width / drawWidth,
        scaleY: img.height / drawHeight
      });
      
      // Clear and draw
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      setImageLoaded(true);
    };
    img.src = cowFaceImage;
  }, [cowFaceImage]);
  
  React.useEffect(() => {
    drawImage();
  }, [drawImage]);
  
  const getCanvasCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageLoaded) return;
    
    const coords = getCanvasCoordinates(e);
    setStartPoint(coords);
    setIsDrawing(true);
    setCurrentRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !imageLoaded) return;
    
    const coords = getCanvasCoordinates(e);
    const width = coords.x - startPoint.x;
    const height = coords.y - startPoint.y;
    
    setCurrentRect({
      x: startPoint.x,
      y: startPoint.y,
      width,
      height
    });
    
    // Redraw image and rectangle
    drawImage();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      
      // Add corner handles
      const handleSize = 8;
      ctx.fillStyle = '#10B981';
      ctx.fillRect(startPoint.x - handleSize/2, startPoint.y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(startPoint.x + width - handleSize/2, startPoint.y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(startPoint.x - handleSize/2, startPoint.y + height - handleSize/2, handleSize, handleSize);
      ctx.fillRect(startPoint.x + width - handleSize/2, startPoint.y + height - handleSize/2, handleSize, handleSize);
    }
  };
  
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };
  
  const handleConfirmZoom = () => {
    if (currentRect.width === 0 || currentRect.height === 0) {
      alert('Please select a nose area by dragging on the image');
      return;
    }
    
    // Convert canvas coordinates to original image coordinates
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // Calculate image position on canvas
    const img = new Image();
    img.onload = () => {
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      if (imgAspectRatio > canvasAspectRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgAspectRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgAspectRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      }
      
      // Convert coordinates
      const realX = Math.max(0, (currentRect.x - offsetX) * imageScale.scaleX);
      const realY = Math.max(0, (currentRect.y - offsetY) * imageScale.scaleY);
      const realWidth = Math.min(img.width - realX, Math.abs(currentRect.width) * imageScale.scaleX);
      const realHeight = Math.min(img.height - realY, Math.abs(currentRect.height) * imageScale.scaleY);
      
      onZoomComplete({
        x: Math.round(realX),
        y: Math.round(realY),
        width: Math.round(realWidth),
        height: Math.round(realHeight)
      });
    };
    img.src = cowFaceImage;
  };
  
  const handleReset = () => {
    setCurrentRect({ x: 0, y: 0, width: 0, height: 0 });
    setIsDrawing(false);
    drawImage();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manual Nose Area Selection</h3>
          <p className="text-gray-600">
            Drag to select the cow's nose area for pattern analysis. Make sure to capture the entire nose pattern including nostrils.
          </p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300 cursor-crosshair bg-white rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Instructions:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Click and drag to select the nose area</li>
                <li>Include both nostrils and surrounding patterns</li>
                <li>Make sure the selection is clear and well-lit</li>
                <li>The selected area will be enhanced for pattern recognition</li>
              </ul>
            </div>
          </div>
        </div>
        
        {currentRect.width !== 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Selection:</span> {Math.abs(Math.round(currentRect.width))} × {Math.abs(Math.round(currentRect.height))} pixels
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <div className="space-x-3">
            <Button variant="secondary" onClick={handleReset}>
              Reset Selection
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          
          <Button 
            onClick={handleConfirmZoom}
            disabled={currentRect.width === 0 || currentRect.height === 0}
          >
            Confirm Nose Selection
          </Button>
        </div>
      </div>
    </div>
  );
};