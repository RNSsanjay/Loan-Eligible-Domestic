import React, { useState, useEffect } from 'react';

interface AutoTyperProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const AutoTyper: React.FC<AutoTyperProps> = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
  className = ''
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const targetText = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        if (currentText.length < targetText.length) {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
          return;
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, deleteSpeed, pauseDuration]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {currentText}
      <span
        className={`inline-block w-0.5 h-8 bg-green-600 ml-1 transition-opacity duration-100 ${
          showCursor ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </span>
  );
};